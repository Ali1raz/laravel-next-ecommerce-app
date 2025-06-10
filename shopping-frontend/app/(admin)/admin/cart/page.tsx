"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  CreditCard,
} from "lucide-react";
import type { CartItem } from "@/lib/api";
import Link from "next/link";

export default function AdminCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const { toast } = useToast();

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getCart();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load cart",
        variant: "destructive",
      });
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    // Find the current item to check available stock
    const currentItem = cartItems.find((item) => item.product.id === productId);
    if (!currentItem) return;

    // Check if the new quantity exceeds available stock
    if (newQuantity > currentItem.product.quantity) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${currentItem.product.quantity} items available in stock`,
        variant: "destructive",
      });
      return;
    }

    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await ApiService.updateCartQuantity({
        product_id: productId,
        quantity: newQuantity,
      });
      await fetchCart();
      toast({
        title: "Updated",
        description: "Cart quantity updated successfully",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update quantity";

      // Handle specific error cases
      if (
        errorMessage.includes("Not enough quantity available") ||
        errorMessage.includes("insufficient")
      ) {
        toast({
          title: "Insufficient Stock",
          description: `Only ${currentItem.product.quantity} items available in stock`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const removeItem = async (productId: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      await ApiService.removeFromCart({ product_id: productId });
      await fetchCart();
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await ApiService.checkout();
      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully",
      });
      await fetchCart(); // Refresh cart (should be empty now)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-muted-foreground">
          Review and manage your cart items
        </p>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some products to get started
            </p>
            <Button asChild>
              <Link href="/admin/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
                <CardDescription>Review your selected items</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.product.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              by {item.product.seller.name} • Stock:{" "}
                              {item.product.quantity}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${Number(item.product.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                updatingItems.has(item.product.id)
                              }
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = Number.parseInt(
                                  e.target.value
                                );
                                if (
                                  newQuantity > 0 &&
                                  newQuantity <= item.product.quantity
                                ) {
                                  updateQuantity(item.product.id, newQuantity);
                                } else if (
                                  newQuantity > item.product.quantity
                                ) {
                                  toast({
                                    title: "Insufficient Stock",
                                    description: `Only ${item.product.quantity} items available`,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="w-16 text-center"
                              min="1"
                              max={item.product.quantity}
                              disabled={updatingItems.has(item.product.id)}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >= item.product.quantity ||
                                updatingItems.has(item.product.id)
                              }
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.quantity >= item.product.quantity && (
                            <div className="text-xs text-orange-600 mt-1">
                              Max stock reached
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          $
                          {(Number(item.product.price) * item.quantity).toFixed(
                            2
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => removeItem(item.product.id)}
                            disabled={updatingItems.has(item.product.id)}
                          >
                            {updatingItems.has(item.product.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout
                    </>
                  )}
                </Button>

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/admin/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
