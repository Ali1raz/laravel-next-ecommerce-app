"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BuyerFooter } from "@/components/buyer-footer";
import { useRBAC } from "@/hooks/use-rbac";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Toaster } from "@/components/ui/sonner";

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
    <div className="min-h-screen bg-background">
      <main className="">{children}</main>
      <BuyerFooter />
      <Toaster />
    </div>
  );
}
