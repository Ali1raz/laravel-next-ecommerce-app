"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Heart, Clock, Package } from "lucide-react";

interface BuyerDashboardData {
  orders_count: number;
  wishlist_count: number;
  recent_orders: any[];
  total_spent: number;
}

export default function BuyerDashboard() {
  const [dashboardData, setDashboardData] = useState<BuyerDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch bills to calculate dashboard data
        const bills = await ApiService.getBills();
        const billsArray = Array.isArray(bills) ? bills : [];

        const dashboardData: BuyerDashboardData = {
          orders_count: billsArray.length,
          wishlist_count: 0, // Placeholder since wishlist API not implemented
          recent_orders: billsArray.slice(0, 5),
          total_spent: billsArray.reduce(
            (total: number, bill: any) => total + (bill.total_amount || 0),
            0
          ),
        };

        setDashboardData(dashboardData);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data",
          variant: "destructive",
        });
        // Set fallback data
        setDashboardData({
          orders_count: 0,
          wishlist_count: 0,
          recent_orders: [],
          total_spent: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buyer Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Loading...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">...</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    orders_count: 0,
    wishlist_count: 0,
    recent_orders: [],
    total_spent: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buyer Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your buyer dashboard. Here's an overview of your activity.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.orders_count}</div>
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
            <CardTitle className="text-sm font-medium">
              Wishlist Items
            </CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.wishlist_count}</div>
            <p className="text-xs text-muted-foreground">
              Products in your wishlist
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.recent_orders?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Recent orders this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your most recent purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recent_orders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                Start shopping to see your orders here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.recent_orders?.map((order, index) => (
                <div
                  key={order.id || index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Order #{order.id || index + 1}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Recent"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${Number(order.total_amount || 0).toFixed(2) || "0.00"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
