"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Users, Shield, Key, UserCheck, Mail } from "lucide-react";

interface DashboardData {
  analytics: {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    users_by_role: Array<{
      name: string;
      total: number;
    }>;
  };
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    roles: Array<{
      id: number;
      name: string;
    }>;
  }>;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    analytics: {
      total_users: 0,
      total_roles: 0,
      total_permissions: 0,
      users_by_role: [],
    },
    recent_users: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await ApiService.getDashboard();
        // Handle the new API response format
        setDashboardData(response as DashboardData);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load dashboard data",
          variant: "destructive",
        });
        // Set default data to prevent undefined errors
        setDashboardData({
          analytics: {
            total_users: 0,
            total_roles: 0,
            total_permissions: 0,
            users_by_role: [],
          },
          recent_users: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return "text-red-600";
      case "seller":
        return "text-blue-600";
      case "buyer":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return Shield;
      case "seller":
        return BarChart3;
      case "buyer":
        return UserCheck;
      default:
        return Users;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  const { analytics, recent_users } = dashboardData;

  // Add safety checks
  const safeAnalytics = analytics || {
    total_users: 0,
    total_roles: 0,
    total_permissions: 0,
    users_by_role: [],
  };
  const safeRecentUsers = recent_users || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the admin dashboard. Here's an overview of your system.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeAnalytics.total_users.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users in the app
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeAnalytics.total_roles.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              User roles configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Permissions
            </CardTitle>
            <Key className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {safeAnalytics.total_permissions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total permissions available
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>
              Distribution of users across different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {safeAnalytics.users_by_role.map((roleData) => {
                const RoleIcon = getRoleIcon(roleData.name);
                return (
                  <div
                    key={roleData.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <RoleIcon
                        className={`h-4 w-4 ${getRoleColor(roleData.name)}`}
                      />
                      <span className="font-medium capitalize">
                        {roleData.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {roleData.total}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        users
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Latest registered users in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {safeRecentUsers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent users found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safeRecentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <Badge key={role.id} variant="outline">
                                {role.name}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary">No role</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
