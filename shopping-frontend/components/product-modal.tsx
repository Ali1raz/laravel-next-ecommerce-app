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
import { Separator } from "@/components/ui/separator";
import { ApiService, type Product } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingCart,
  Loader2,
  User,
  Star,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";

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
      <DialogContent className="sm:max-w-2xl max-w-3xl max-h-[65vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 p-3 sm:p-6">
        <DialogHeader className="space-y-1 sm:space-y-3">
          <DialogTitle className="text-base sm:text-xl font-bold leading-tight pr-8 line-clamp-2">
            {product.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-xs sm:text-base">
            <span className="flex items-center text-foreground font-medium">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {product.seller.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mt-2 sm:mt-4">
          {/* Left Column - Image and Features */}
          {/* Product Image */}
          <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
            <div className="absolute inset-0 flex items-center justify-center text-white text-sm sm:text-lg font-medium px-2 text-center">
              {product.title}
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-3 sm:space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-3xl font-bold text-primary">
                ${formatPrice(product.price)}
              </span>
              <Badge
                variant={stockStatus.variant}
                className="text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1"
              >
                {stockStatus.label}
              </Badge>
            </div>

            <Separator className="my-2 sm:my-3" />

            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-sm sm:text-base">
                Description
              </h4>
              <p className="text-xs sm:text-base text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-none">
                {product.description}
              </p>
            </div>

            {product.quantity > 0 && (
              <>
                <Separator className="my-2 sm:my-3" />
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="space-y-1 sm:space-y-2 flex-1">
                      <label className="text-xs sm:text-sm font-medium">
                        Quantity
                      </label>
                      <Select
                        value={quantity}
                        onValueChange={setQuantity}
                        disabled={isAddingToCart}
                      >
                        <SelectTrigger className="w-full sm:w-24 h-8 sm:h-10">
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: maxQuantity },
                            (_, i) => i + 1
                          ).map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {product.quantity} available
                    </div>
                  </div>

                  <Button
                    className="w-full h-9 sm:h-12 text-sm sm:text-base font-medium"
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || product.quantity <= 0}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Add to Cart • $
                        {(
                          Number.parseFloat(formatPrice(product.price)) *
                          Number.parseInt(quantity)
                        ).toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            <Separator className="my-2 sm:my-3" />

            <h4 className="font-semibold text-base">Product Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span className="font-medium">
                  ${formatPrice(product.price)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability:</span>
                <span className="font-medium">
                  {product.quantity > 0
                    ? `${product.quantity} in stock`
                    : "Out of stock"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-medium">{product.seller.name}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
