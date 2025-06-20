"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthService } from "@/lib/auth";
import { ApiService } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  Heart,
  Package,
  Settings,
  X,
} from "lucide-react";

interface BuyerHeaderProps {
  onCartUpdate?: () => void;
  onSearch?: (query: string) => void;
}

export function BuyerHeader({ onCartUpdate, onSearch }: BuyerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const user = AuthService.getUser();

  const fetchCartCount = async () => {
    try {
      const cart = await ApiService.getCart();
      setCartCount(Array.isArray(cart) ? cart.length : 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update cart count when onCartUpdate is called
  useEffect(() => {
    if (onCartUpdate) {
      fetchCartCount();
    }
  }, [onCartUpdate]);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const navItems = [
    { name: "Home", href: "/buyer", icon: <Home className="h-5 w-5" /> },
    {
      name: "Products",
      href: "/buyer/products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Wishlist",
      href: "/buyer/wishlist",
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-6">
            <Link
              href="/buyer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                ShopApp
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <div
                className={`relative transition-all duration-200 ${
                  isSearchFocused
                    ? "w-[280px] lg:w-[350px]"
                    : "w-[200px] lg:w-[280px]"
                }`}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 pr-10 h-9 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </form>

            {/* Cart Button */}
            <Link href="/buyer/cart">
              <Button
                variant="outline"
                size="sm"
                className="relative h-9 px-3 hover:bg-accent transition-colors"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-medium animate-in zoom-in-50"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <ThemeSwitcher />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/buyer/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/buyer/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="p-4 border-b">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="text-sm">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Search */}
                  <div className="p-4 border-b">
                    <form onSubmit={handleSearch} className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      {searchQuery && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSearch}
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </form>
                  </div>

                  {/* Navigation */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-6">
                      <div className="space-y-1">
                        {navItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                              pathname === item.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                            {item.name === "Cart" && cartCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs"
                              >
                                {cartCount > 9 ? "9+" : cartCount}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/buyer/profile"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          Profile
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="h-5 w-5" />
                          Settings
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Theme</span>
                      <ThemeSwitcher />
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}
