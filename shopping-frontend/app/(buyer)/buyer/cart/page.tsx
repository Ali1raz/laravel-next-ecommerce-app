"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BuyerHeader } from "@/components/buyer-header";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Loader2,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import type { CartItem } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);
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

  const handleCartUpdate = useCallback(() => {
    setCartUpdateTrigger((prev) => prev + 1);
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
        description: "Cart quantity updated",
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
      setCartUpdateTrigger((prev) => prev + 1);
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
      await fetchCart();
      setCartUpdateTrigger((prev) => prev + 1);
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
      <div className="min-h-screen bg-background">
        <BuyerHeader onCartUpdate={handleCartUpdate} />
        <main className="container py-8 px-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerHeader onCartUpdate={handleCartUpdate} />
      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
            <p className="text-muted-foreground">
              Review and manage your cart items
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="h-16 w-16 text-muted-foreground/50 mb-6" />
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Looks like you haven't added any products to your cart yet.
                Start shopping to fill it up!
              </p>
              <Button asChild size="lg">
                <Link href="/buyer">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Cart Items ({cartItems.length})
                  </CardTitle>
                  <CardDescription>
                    Review your selected items before checkout
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-6 flex gap-4">
                        <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={`/placeholder.svg?height=80&width=80&text=${encodeURIComponent(
                              item.product.title
                            )}`}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-medium line-clamp-1">
                              {item.product.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {item.product.seller.name}
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">
                              ${Number(item.product.price).toFixed(2)}
                            </span>

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
                                  if (newQuantity > 0) {
                                    updateQuantity(
                                      item.product.id,
                                      newQuantity
                                    );
                                  }
                                }}
                                className="w-16 text-center h-8"
                                min="1"
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
                                disabled={updatingItems.has(item.product.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              Total: $
                              {(
                                Number(item.product.price) * item.quantity
                              ).toFixed(2)}
                            </span>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              disabled={updatingItems.has(item.product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {updatingItems.has(item.product.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button
                      className="w-full h-12 text-base font-medium"
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      size="lg"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-5 w-5" />
                          Proceed to Checkout
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/buyer">Continue Shopping</Link>
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">You might also like</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Check out similar products from our collection
                  </p>
                  <Button variant="outline" className="w-full mt-3" asChild>
                    <Link href="/buyer/products">Browse More Products</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
