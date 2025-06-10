"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { UserCog, Users, Shield, Loader2, Plus } from "lucide-react";
import { PaginatedResponse, Role, User } from "@/lib/interfaces";
import { getRoleColor } from "@/lib/constants";

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const response = (await ApiService.getUsers()) as PaginatedResponse<User>;
      setUsers(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load users",
        variant: "destructive",
      });
    }
  };

  const fetchRoles = async () => {
    try {
      const rolesData = await ApiService.getRoles();
      setRoles(rolesData || []);
    } catch (error) {}
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) return;

    setIsAssigning(true);
    try {
      await ApiService.assignRoleToUser({
        user_id: selectedUser.id,
        role_id: Number.parseInt(selectedRoleId),
      });
      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
      setIsDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoleId("");
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign role",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveRole = async (userId: number) => {
    if (!confirm("Are you sure you want to remove this user's role?")) return;

    try {
      await ApiService.removeRoleFromUser({ user_id: userId });
      toast({
        title: "Success",
        description: "Role removed successfully",
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove role",
        variant: "destructive",
      });
    }
  };

  const openAssignDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleId("");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  const usersWithRoles = users.filter(
    (user) => user.roles && user.roles.length > 0
  );
  const usersWithoutRoles = users.filter(
    (user) => !user.roles || user.roles.length === 0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          User Role Assignment
        </h1>
        <p className="text-muted-foreground">
          Manage role assignments for all users
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">All users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Roles</CardTitle>
            <UserCog className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersWithRoles.length}</div>
            <p className="text-xs text-muted-foreground">Have assigned roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Without Roles</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersWithoutRoles.length}</div>
            <p className="text-xs text-muted-foreground">
              Need role assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Roles
            </CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">System roles</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Role Assignments</CardTitle>
          <CardDescription>
            View and manage role assignments for all users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserCog className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Users will appear here once loaded
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Role Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.email_verified_at ? "default" : "secondary"
                        }
                      >
                        {user.email_verified_at ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.roles && user.roles?.length > 0 ? (
                          user.roles.map((role, i) => (
                            <Badge key={i} variant={getRoleColor(role.name)}>
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No role assigned</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.roles?.[0]?.created_at
                        ? new Date(
                            user.roles[0].created_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignDialog(user)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                        {user.roles && user.roles.length > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveRole(user.id)}
                          >
                            Remove
                          </Button>
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

      {/* Users without roles */}
      {usersWithoutRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">
              Users Without Roles
            </CardTitle>
            <CardDescription>
              These users need role assignments to access the system properly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {usersWithoutRoles.map((user) => (
                <Card key={user.id} className="border-orange-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignDialog(user)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Assign Role
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign a role to {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role">Select Role</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
                disabled={isAssigning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role, i) => (
                    <SelectItem key={i} value={role.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getRoleColor(role.name)}
                          className="text-xs"
                        >
                          {role.name}
                        </Badge>
                        <span className="text-sm">
                          {role.permissions?.length || 0} permissions
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAssignRole}
              disabled={isAssigning || !selectedRoleId}
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
