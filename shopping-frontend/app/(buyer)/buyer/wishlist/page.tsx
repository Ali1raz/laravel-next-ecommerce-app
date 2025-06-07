"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Package } from "lucide-react";

export default function WishlistPage() {
  // Placeholder for wishlist functionality
  const [wishlistItems] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground">Save products for later</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wishlist Items</CardTitle>
          <CardDescription>Products you've saved for later</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-muted-foreground mb-4">
              Start adding products to your wishlist
            </p>
            <Button asChild>
              <a href="/buyer/products">
                <Package className="mr-2 h-4 w-4" />
                Browse Products
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
