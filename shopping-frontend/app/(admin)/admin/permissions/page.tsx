"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Key, Shield, Lock } from "lucide-react";
import type { Permission } from "@/lib/api";

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getPermissions();
      setPermissions(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const getPermissionCategory = (permissionName: string) => {
    if (permissionName.includes("user") || permissionName.includes("manage")) {
      return { category: "User Management", color: "destructive" as const };
    }
    if (permissionName.includes("product")) {
      return { category: "Product Management", color: "default" as const };
    }
    if (permissionName.includes("view") || permissionName.includes("read")) {
      return { category: "View Access", color: "secondary" as const };
    }
    if (
      permissionName.includes("delete") ||
      permissionName.includes("remove")
    ) {
      return { category: "Delete Operations", color: "destructive" as const };
    }
    if (permissionName.includes("add") || permissionName.includes("create")) {
      return { category: "Create Operations", color: "default" as const };
    }
    return { category: "General", color: "outline" as const };
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    const { category } = getPermissionCategory(permission.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Permission Management
        </h1>
        <p className="text-muted-foreground">
          View and manage system permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Permissions
            </CardTitle>
            <Key className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">System permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(permissionsByCategory).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Permission categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Lock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Permissions</CardTitle>
          <CardDescription>
            System permissions that can be assigned to roles. These are
            predefined and cannot be modified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No permissions found
              </h3>
              <p className="text-muted-foreground">
                Permissions will appear here once loaded
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Permission</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission, i) => {
                  const { category, color } = getPermissionCategory(
                    permission.name
                  );
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Key className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                            {permission.name}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={color}>{category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {permission.name.includes("manage-users") &&
                            "Full user management access"}
                          {permission.name.includes("view-products") &&
                            "View all products"}
                          {permission.name.includes("add-products") &&
                            "Create new products"}
                          {permission.name.includes("delete-products") &&
                            "Delete products"}
                          {permission.name.includes("edit-products") &&
                            "Edit existing products"}
                          {!permission.name.includes("manage-users") &&
                            !permission.name.includes("view-products") &&
                            !permission.name.includes("add-products") &&
                            !permission.name.includes("delete-products") &&
                            !permission.name.includes("edit-products") &&
                            "System permission"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.id}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permissions by Category */}
      <div className="grid gap-4">
        {Object.entries(permissionsByCategory).map(
          ([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {categoryPermissions.length} permissions in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categoryPermissions.map((permission, i) => (
                    <Badge key={i} variant="outline" className="font-mono">
                      {permission.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}
