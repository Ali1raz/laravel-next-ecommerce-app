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
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { AdminDashboardData } from "@/lib/interfaces";
import { getRoleColor, getRoleIcon } from "@/lib/constants";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await ApiService.getAdminDashboard();
        setDashboardData(response as AdminDashboardData);
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
            total_roles: 3,
            total_permissions: 10,
            users_by_role: [
              { name: "admin", total: 1 },
              { name: "seller", total: 2 },
              { name: "buyer", total: 5 },
            ],
          },
          recent_users: [],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return <LoadingSkeleton type="dashboard" />;
  }

  const { analytics, recent_users } = dashboardData || {
    analytics: {
      total_users: 0,
      total_roles: 3,
      total_permissions: 10,
      users_by_role: [],
    },
    recent_users: [],
  };

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
              {analytics.total_users.toLocaleString()}
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
              {analytics.total_roles.toLocaleString()}
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
              {analytics.total_permissions.toLocaleString()}
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
              {analytics.users_by_role.map((roleData) => {
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
            {recent_users.length === 0 ? (
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
                  {recent_users.map((user) => (
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
                          {user.roles && user.roles?.length > 0 ? (
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
