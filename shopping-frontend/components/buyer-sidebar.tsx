"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  Package,
  ShoppingCart,
  Heart,
  User,
  Settings,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    title: "Dashboard",
    href: "/buyer",
    icon: Home,
  },
  {
    title: "Products",
    href: "/buyer/products",
    icon: Package,
  },
  {
    title: "Cart",
    href: "/buyer/cart",
    icon: ShoppingCart,
  },
  {
    title: "Orders",
    href: "/buyer/orders",
    icon: ShoppingCart,
  },
  {
    title: "Wishlist",
    href: "/buyer/wishlist",
    icon: Heart,
  },
  {
    title: "Profile",
    href: "/buyer/profile",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function BuyerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const user = AuthService.getUser();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await AuthService.logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      router.push("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Buyer Portal</span>
            <span className="text-xs text-muted-foreground">Shopping App</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href} className="flex items-center w-full">
                      <item.icon className="h-4 w-4 mr-2" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {user?.name || "User"}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-8 w-8"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
