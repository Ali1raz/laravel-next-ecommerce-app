"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/use-rbac";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Toaster } from "@/components/ui/sonner";
import { BuyerHeader } from "@/components/buyer-header";
import { BuyerFooter } from "@/components/buyer-footer";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthorized, isLoading } = useRBAC("buyer");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/login");
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <BuyerHeader />
        <main className="container py-8">
          <LoadingSkeleton type="dashboard" />
        </main>
        <Toaster />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BuyerHeader />
      <main className="flex-1 container py-8">{children}</main>
      <BuyerFooter />
      <Toaster />
    </div>
  );
}
