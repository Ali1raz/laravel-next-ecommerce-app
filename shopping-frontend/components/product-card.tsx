"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "@/components/product-modal";
import { ApiService, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Eye, ShoppingCart, Loader2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: () => void;
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
    <div className="bg-gray-600 absolute inset-0" />
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

  return (
    <>
      <Card className="group overflow-hidden h-full flex flex-col bg-card ">
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
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <div className="text-xs text-muted-foreground">
            by <span className="font-medium">{product.seller.name}</span>
          </div>
        </CardContent>

        <CardFooter className="px-4 sm:pt-0 sm:mt-0 sm:gap-3 flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setIsModalOpen(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            size="sm"
            className="w-full "
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
