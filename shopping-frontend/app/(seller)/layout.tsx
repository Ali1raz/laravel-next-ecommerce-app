"use client";

import type React from "react";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SellerSidebar } from "@/components/seller-sidebar";
import { SellerFooter } from "@/components/seller-footer";
import { SellerHeader } from "@/components/seller-header";
import { useRBAC } from "@/hooks/use-rbac";
import { Loader2 } from "lucide-react";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthorized, isLoading } = useRBAC("seller");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Checking permissions</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <SellerSidebar />
        <SidebarInset className="flex flex-col min-h-screen">
          <SellerHeader />
          <main className="flex-1 container py-6 px-4 md:px-8">{children}</main>
          <SellerFooter />
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
