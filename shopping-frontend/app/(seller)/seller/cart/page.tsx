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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApiService, type CartItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import Link from "next/link";

export default function SellerCartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
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
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update quantity",
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
        title: "Success",
        description: "Order placed successfully!",
      });
      await fetchCart(); // Refresh cart (should be empty now)
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process checkout",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.product.price) * item.quantity;
    }, 0);
  };

  const getSellerName = (product: any) => {
    if (product.seller?.name) return product.seller.name;
    if (product.user?.name) return product.user.name;
    return "Unknown Seller";
  };

  if (isLoading) {
    return <LoadingSkeleton type="cart" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/seller">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {cartItems.length === 0
              ? "Your cart is empty"
              : `${cartItems.length} item${
                  cartItems.length !== 1 ? "s" : ""
                } in your cart`}
          </p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Browse the marketplace to find products from other sellers
            </p>
            <Link href="/seller">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items</CardTitle>
                <CardDescription>
                  Review and modify your selected items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex items-center gap-4">
                      {/* Product Image Placeholder */}
                      <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0" />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {item.product.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          by {getSellerName(item.product)}
                        </p>
                        <p className="text-lg font-semibold text-primary">
                          ${Number(item.product.price).toFixed(2)}
                        </p>
                        {item.product.quantity <= 5 &&
                          item.product.quantity > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Only {item.product.quantity} left
                            </Badge>
                          )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={
                            item.quantity <= 1 ||
                            updatingItems.has(item.product.id)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          max={item.product.quantity}
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = Number.parseInt(e.target.value);
                            if (
                              newQuantity >= 1 &&
                              newQuantity <= item.product.quantity
                            ) {
                              updateQuantity(item.product.id, newQuantity);
                            }
                          }}
                          className="w-16 text-center"
                          disabled={updatingItems.has(item.product.id)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.product.quantity ||
                            updatingItems.has(item.product.id)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                        disabled={updatingItems.has(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {index < cartItems.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="truncate mr-2">
                        {item.product.title} × {item.quantity}
                      </span>
                      <span>
                        $
                        {(Number(item.product.price) * item.quantity).toFixed(
                          2
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || cartItems.length === 0}
                >
                  {isCheckingOut ? (
                    "Processing..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Checkout
                    </>
                  )}
                </Button>
                <Link href="/seller">
                  <Button variant="outline" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
