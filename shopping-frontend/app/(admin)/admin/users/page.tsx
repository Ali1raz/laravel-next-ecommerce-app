"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
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
import {
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Shield,
  Users,
  Loader2,
  UserCog,
} from "lucide-react";
import { PaginatedResponse, Role, User } from "@/lib/interfaces";
import { getRoleColor } from "@/lib/constants";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "buyer",
  });
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
    } catch (error) {
      console.error("Failed to load roles:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchRoles()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (formData.password !== formData.password_confirmation) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingUser) {
        await ApiService.updateUser(editingUser.id, formData);
        toast({
          title: "Success",
          description: "User updated successfully",
        });
      } else {
        await ApiService.createUser(formData);
        toast({
          title: "Success",
          description: "User created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "buyer",
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingRole(true);

    if (!selectedUser) {
      setIsChangingRole(false);
      return;
    }

    try {
      const selectedRole = roles.find((r) => r.name === formData.role);
      if (selectedRole) {
        await ApiService.assignRoleToUser({
          user_id: selectedUser.id,
          role_id: selectedRole.id,
        });
        toast({
          title: "Success",
          description: `User role changed to ${formData.role} successfully`,
        });
        setIsRoleDialogOpen(false);
        setSelectedUser(null);
        await fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change role",
        variant: "destructive",
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.roles?.[0]?.name || "buyer",
    });
    setIsDialogOpen(true);
  };

  const handleChangeUserRole = (user: User) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      role: user.roles?.[0]?.name || "buyer",
    });
    setIsRoleDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await ApiService.deleteUser(id);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "buyer",
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users and their roles
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
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
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => u.roles?.some((r) => r.name === "admin"))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sellers</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => u.roles?.some((r) => r.name === "seller"))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Product sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => u.roles?.some((r) => r.name === "buyer"))
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Regular buyers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage all users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                Create the first user to get started
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
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
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role, i) => (
                            <Badge key={i} variant={getRoleColor(role.name)}>
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline">No role</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeUserRole(user)}
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update the user details below."
                  : "Enter the details for the new user."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter user name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter password"
                  required={!editingUser}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm Password</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  value={formData.password_confirmation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password_confirmation: e.target.value,
                    })
                  }
                  placeholder="Confirm password"
                  required={!editingUser}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role, i) => (
                      <SelectItem key={i} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? "Updating..." : "Creating..."}
                  </>
                ) : editingUser ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleChangeRole}>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-role">New Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                  disabled={isChangingRole}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role, i) => (
                      <SelectItem key={i} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isChangingRole}>
                {isChangingRole ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Role"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
