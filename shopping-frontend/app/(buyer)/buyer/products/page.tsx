"use client";

import { useEffect, useState, useCallback } from "react";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { ProductCard } from "@/components/product-card";
import { BuyerHeader } from "@/components/buyer-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
} from "lucide-react";
import { Product } from "@/lib/interfaces";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await ApiService.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load products",
        variant: "destructive",
      });
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCartUpdate = useCallback(() => {
    setCartUpdateTrigger((prev) => prev + 1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.seller?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply availability filter
    if (filterBy === "in-stock") {
      filtered = filtered.filter((product) => product.quantity > 0);
    } else if (filterBy === "out-of-stock") {
      filtered = filtered.filter((product) => product.quantity <= 0);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) =>
            Number.parseFloat(a.price.toString()) -
            Number.parseFloat(b.price.toString())
        );
        break;
      case "price-high":
        filtered.sort(
          (a, b) =>
            Number.parseFloat(b.price.toString()) -
            Number.parseFloat(a.price.toString())
        );
        break;
      case "name":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, sortBy, filterBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BuyerHeader onCartUpdate={handleCartUpdate} onSearch={handleSearch} />
        <main className="container py-8 px-4">
          <LoadingSkeleton type="products" count={12} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BuyerHeader onCartUpdate={handleCartUpdate} onSearch={handleSearch} />
      <main className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
        {/* Page Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                All Products
              </h1>
              <p className="text-muted-foreground">
                Discover our complete collection of products from verified
                sellers
              </p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {filteredProducts.length} Products
            </Badge>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-muted/30 p-4 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters & Sort:</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="text-sm text-muted-foreground">
              {filteredProducts.length} of {products.length} products
            </div>

            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleCartUpdate}
              />
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              {searchQuery ? (
                <>
                  <Search className="h-16 w-16 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No products found</h3>
                    <p className="text-muted-foreground max-w-md">
                      We couldn't find any products matching "{searchQuery}".
                      Try adjusting your search or filters.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterBy("all");
                    }}
                  >
                    Clear Search
                  </Button>
                </>
              ) : (
                <>
                  <Package className="h-16 w-16 text-muted-foreground/50" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">
                      No products available
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      There are no products available at the moment. Please
                      check back later.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
