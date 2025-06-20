"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ShoppingCart,
  User,
  Package,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import type { Product } from "@/lib/interfaces";
import { ProductFormModal } from "@/components/product-form-modal";
import { DeleteConfirmationModal } from "@/components/delete-confirmation";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productId = Number(params.id);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getAdminProduct(productId);
      setProduct(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load product",
        variant: "destructive",
      });
      router.push("/admin/products");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || product.quantity <= 0) return;

    setIsAddingToCart(true);
    try {
      await ApiService.addToCart({ product_id: product.id, quantity: 1 });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart`,
      });
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

  const handleDelete = async () => {
    if (!product) return;

    try {
      await ApiService.deleteAdminProduct(product.id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      router.push("/admin/products");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = () => {
    if (!product) return { label: "Unknown", variant: "outline" as const };
    if (product.quantity <= 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (product.quantity <= 5)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  if (isLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Product not found</h3>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist.
        </p>
        <Button onClick={() => router.push("/admin/products")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Product Details
            </h1>
            <p className="text-muted-foreground">
              View and manage product information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0 || isAddingToCart}
          >
            {isAddingToCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Add to Cart
          </Button>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Product Image */}
        <Card>
          <CardContent className="p-6">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
              {product.image ? (
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "/placeholder.svg?height=400&width=400";
                  }}
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-medium px-4 text-center">
                    {product.title}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{product.title}</CardTitle>
                <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Product Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{product.quantity}</div>
                <p className="text-xs text-muted-foreground">
                  {product.quantity > 0 ? "Available" : "Out of stock"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Price</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${Number(product.price).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Per unit</p>
              </CardContent>
            </Card>
          </div>

          {/* Seller Information */}
          {product.seller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{product.seller.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{product.seller.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller ID:</span>
                  <span className="font-medium">{product.seller.id}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Product Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product ID:</span>
                <span className="font-medium">{product.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">
                  {product.created_at
                    ? new Date(product.created_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {product.updated_at
                    ? new Date(product.updated_at).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchProduct}
        product={product}
        mode="edit"
        isAdmin={true}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDelete}
        productId={product.id}
        productTitle={product.title}
      />
    </div>
  );
}
