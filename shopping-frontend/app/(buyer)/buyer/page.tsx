"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiService, type Product, type BuyerDashboardData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ProductCard } from "@/components/product-card";
import { ShoppingBag, Clock, Package } from "lucide-react";

export default function BuyerDashboard() {
  const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(
    null
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    try {
      const data = await ApiService.getBuyerDashboard();
      setDashboardData(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data",
        variant: "destructive",
      });
      setDashboardData({
        cart_items_count: 0,
        total_spent: 0,
        recent_orders: [],
        favorite_products: [],
        recommended_products: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
      setProducts([]);
    } finally {
      setIsProductsLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchProducts()]);
  }, []);

  if (isLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const data = dashboardData || {
    cart_items_count: 0,
    total_spent: 0,
    recent_orders: [],
    favorite_products: [],
    recommended_products: [],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome to ShopApp
        </h1>
        <p className="text-muted-foreground">
          Browse our latest products and find what you need.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recent_orders.length}
            </div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(data.total_spent).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Amount spent on orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cart Items</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cart_items_count}</div>
            <p className="text-xs text-muted-foreground">Items in your cart</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Products */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Featured Products
        </h2>
        {isProductsLoading ? (
          <LoadingSkeleton type="products" count={8} />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No Products Available
              </h3>
              <p className="text-muted-foreground text-center">
                There are no products available at the moment. Please check back
                later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Orders */}
      {data.recent_orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest order history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recent_orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${Number(order.total_amount).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
