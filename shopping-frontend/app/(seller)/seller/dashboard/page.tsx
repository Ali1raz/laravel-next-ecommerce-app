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
import { LoadingSkeleton } from "@/components/loading-skeleton";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Eye,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Bill } from "@/lib/interfaces";

export default function SellerDashboardPage() {
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    recentOrders: Bill[];
    monthlyRevenue: number;
    weeklyOrders: number;
    averageOrderValue: number;
    topProducts: any[];
  }>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    monthlyRevenue: 0,
    weeklyOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getSellerDashboard();
      setDashboardData({
        totalProducts: data.total_products,
        totalOrders: data.total_orders,
        totalRevenue: Number(data.total_sales),
        recentOrders: data.recent_orders,
        monthlyRevenue: Number(data.total_sales) * 0.8,
        weeklyOrders: Math.floor(data.total_orders * 0.2),
        averageOrderValue:
          data.total_orders > 0
            ? Number(data.total_sales) / data.total_orders
            : 0,
        topProducts: data.top_selling_products,
      });
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
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
        monthlyRevenue: 0,
        weeklyOrders: 0,
        averageOrderValue: 0,
        topProducts: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const growthPercentage = 12; // Mock growth percentage
  const conversionRate = 3.2; // Mock conversion rate

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store performance and analytics
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(dashboardData.totalRevenue || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{growthPercentage}%</span> from
              last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">
                {dashboardData.weeklyOrders}
              </span>{" "}
              this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Products Listed
            </CardTitle>
            <Package className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.totalProducts}
            </div>
            <p className="text-xs text-muted-foreground">Active listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.averageOrderValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.monthlyRevenue.toFixed(2)}
            </div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              75% of monthly goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <Progress value={conversionRate * 10} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Visitors to customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <div className="flex items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < 5
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on 127 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-muted-foreground">
                  Order #1234 - $89.99
                </p>
              </div>
              <span className="text-xs text-muted-foreground">2m ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Product viewed</p>
                <p className="text-xs text-muted-foreground">
                  Wireless Headphones - 15 views today
                </p>
              </div>
              <span className="text-xs text-muted-foreground">1h ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-orange-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Low stock alert</p>
                <p className="text-xs text-muted-foreground">
                  Smartphone Case - 3 items left
                </p>
              </div>
              <span className="text-xs text-muted-foreground">3h ago</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-medium">Review received</p>
                <p className="text-xs text-muted-foreground">
                  5-star review on Bluetooth Speaker
                </p>
              </div>
              <span className="text-xs text-muted-foreground">5h ago</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Insights</CardTitle>
            <CardDescription>Key metrics and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Sales are trending up</p>
                <p className="text-xs text-muted-foreground">
                  Your sales increased by 23% compared to last week
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">High product interest</p>
                <p className="text-xs text-muted-foreground">
                  Wireless Headphones has 45% more views this week
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  Inventory attention needed
                </p>
                <p className="text-xs text-muted-foreground">
                  3 products are running low on stock
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Great customer feedback</p>
                <p className="text-xs text-muted-foreground">
                  Average rating improved to 4.8 stars
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your store</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Add Product</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">View Orders</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Analytics</p>
            </div>
            <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Customers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
