"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiService, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Loader2, User } from "lucide-react";

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: () => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductModalProps) {
  const [quantity, setQuantity] = useState("1");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async () => {
    if (product.quantity <= 0) return;

    setIsAddingToCart(true);
    try {
      await ApiService.addToCart({
        product_id: product.id,
        quantity: Number.parseInt(quantity),
      });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      });
      if (onAddToCart) onAddToCart();
      onClose();
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

  const getStockStatus = () => {
    if (product.quantity <= 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (product.quantity <= 5)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const stockStatus = getStockStatus();
  const maxQuantity = Math.min(product.quantity, 10); // Limit to 10 or available stock

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span>Sold by</span>
            <span className="flex items-center text-foreground">
              <User className="h-3 w-3 mr-1" />
              {product.seller.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square relative">
            <Image
              src={`/placeholder.svg?height=400&width=400&text=${encodeURIComponent(
                product.title
              )}`}
              alt={product.title}
              fill
              className="object-cover rounded-md"
            />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{product.title}</h3>
              <p className="text-muted-foreground mt-1">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                ${formatPrice(product.price)}
              </span>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>

            {product.quantity > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Quantity:</span>
                  <Select
                    value={quantity}
                    onValueChange={setQuantity}
                    disabled={isAddingToCart}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxQuantity }, (_, i) => i + 1).map(
                        (num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    {product.quantity} available
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.quantity <= 0}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Product Details</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span>${formatPrice(product.price)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span>
                    {product.quantity > 0
                      ? `${product.quantity} in stock`
                      : "Out of stock"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Seller:</span>
                  <span>{product.seller.name}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
