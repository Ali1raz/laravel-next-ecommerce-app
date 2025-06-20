"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "@/components/product-modal";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Eye,
  ShoppingCart,
  Loader2,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import type { Product } from "@/lib/interfaces";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
  isOwnProduct?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: number) => void;
  showDetailsLink?: boolean;
}

const StockBadge = ({ quantity }: { quantity: number }) => {
  if (quantity <= 0) return <Badge variant="destructive">Out of Stock</Badge>;
  if (quantity <= 5)
    return <Badge variant="secondary">Only {quantity} left</Badge>;
  return null;
};

const ProductImage = ({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) => (
  <div
    className="aspect-square relative cursor-pointer overflow-hidden"
    onClick={onClick}
  >
    {product.image ? (
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.title}
        className="w-full h-full object-cover transition-transform hover:scale-105"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=200&width=200";
        }}
      />
    ) : (
      <div className="bg-gray-600 absolute inset-0 flex items-center justify-center">
        <span className="text-white text-sm font-medium text-center px-2">
          {product.title}
        </span>
      </div>
    )}
    {product.quantity <= 0 && (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
        <Badge variant="destructive" className="text-sm font-medium px-4 py-2">
          Out of Stock
        </Badge>
      </div>
    )}
    <div className="absolute top-3 right-3">
      <StockBadge quantity={product.quantity} />
    </div>
  </div>
);

export function ProductCard({
  product,
  onAddToCart,
  isOwnProduct,
  onEdit,
  onDelete,
  showDetailsLink = false,
}: ProductCardProps) {
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
      onAddToCart?.();
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

  const getSellerName = () => {
    if (product.seller?.name) {
      return product.seller.name;
    }
    if (product.user?.name) {
      return product.user.name;
    }
    return null;
  };

  const sellerName = getSellerName();

  return (
    <>
      <Card className="group overflow-hidden h-full flex flex-col bg-card">
        <ProductImage product={product} onClick={() => setIsModalOpen(true)} />

        <CardContent className="px-4 my-0 flex-grow space-y-1">
          <div className="space-y-2">
            <h3
              className="font-semibold line-clamp-1 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {product.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>

          {sellerName && (
            <div className="text-xs text-muted-foreground">
              by <span className="font-medium">{sellerName}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 sm:pt-0 sm:mt-0 sm:gap-3 flex flex-col gap-2">
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsModalOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>

            {showDetailsLink && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/products/${product.id}`}>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>

          {isOwnProduct ? (
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={() => onEdit?.(product)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete?.(product.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={product.quantity <= 0 || isAddingToCart}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          )}
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
