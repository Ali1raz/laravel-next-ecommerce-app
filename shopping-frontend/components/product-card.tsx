"use client";

import type React from "react";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { ApiService, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Eye, ShoppingCart, Loader2 } from "lucide-react";
import { ProductModal } from "./product-modal";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.quantity <= 0) return;

    setIsAddingToCart(true);
    try {
      await ApiService.addToCart({ product_id: product.id, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      });
      if (onAddToCart) onAddToCart();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number | string) => {
    return typeof price === "string"
      ? Number.parseFloat(price).toFixed(2)
      : price.toFixed(2);
  };

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
        <div
          className="aspect-square relative cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <Image
            src={`/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
              product.title
            )}`}
            alt={product.title}
            fill
            className="object-cover"
          />
          {product.quantity <= 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge
                variant="destructive"
                className="text-sm font-medium px-3 py-1"
              >
                Out of Stock
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4 flex-grow">
          <h3
            className="font-medium line-clamp-1 cursor-pointer hover:text-primary"
            onClick={() => setIsModalOpen(true)}
          >
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">${formatPrice(product.price)}</span>
            {product.quantity > 0 && product.quantity <= 5 && (
              <Badge variant="outline" className="text-xs">
                Only {product.quantity} left
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setIsModalOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={onAddToCart}
      />
    </>
  );
}
