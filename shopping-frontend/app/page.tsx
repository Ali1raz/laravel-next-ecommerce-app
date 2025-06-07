"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingBag, Users, Shield, Star } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect based on user role stored in localStorage
      const userRole = localStorage.getItem("userRole");
      switch (userRole) {
        case "admin":
          router.push("/admin");
          break;
        case "seller":
          router.push("/seller");
          break;
        case "buyer":
          router.push("/buyer");
          break;
        default:
          router.push("/login");
      }
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-blue-600">ShopApp</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            A modern e-commerce platform with role-based access control for
            admins, sellers, and buyers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
              className="text-lg px-8 py-3"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>For Buyers</CardTitle>
              <CardDescription>
                Browse products, manage your cart, and track orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Product catalog browsing</li>
                <li>• Shopping cart management</li>
                <li>• Order history tracking</li>
                <li>• Profile management</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>For Sellers</CardTitle>
              <CardDescription>
                Manage your products and track sales performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• Product management</li>
                <li>• Inventory tracking</li>
                <li>• Sales analytics</li>
                <li>• Order fulfillment</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>For Admins</CardTitle>
              <CardDescription>
                Complete platform management and user control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                <li>• User management</li>
                <li>• Role & permissions</li>
                <li>• Platform analytics</li>
                <li>• System settings</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of users already using our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                onClick={() => router.push("/register")}
                className="text-lg px-12 py-3"
              >
                Create Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
