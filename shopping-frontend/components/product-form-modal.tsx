"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import type { Product } from "@/lib/interfaces";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
  mode: "create" | "edit";
  isAdmin?: boolean;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  product,
  mode,
  isAdmin = false,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        image: product.image || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: "",
        quantity: "",
        image: "",
      });
    }
  }, [mode, product, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        title: formData.title,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        quantity: Number.parseInt(formData.quantity),
        ...(formData.image && { image: formData.image }),
      };

      if (mode === "create") {
        if (isAdmin) {
          await ApiService.createAdminProduct(productData);
        } else {
          await ApiService.createSellerProduct(productData);
        }
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      } else if (mode === "edit" && product) {
        if (isAdmin) {
          await ApiService.updateAdminProduct(product.id, productData);
        } else {
          await ApiService.updateSellerProduct(product.id, productData);
        }
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : `Failed to ${mode} product`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageRemove = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Product" : "Edit Product"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details to create a new product."
              : "Update the product information below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter product title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image URL</Label>
            <div className="space-y-2">
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="relative">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-full h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=128&width=200";
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleImageRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
