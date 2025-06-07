"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Key, Shield, Minus } from "lucide-react";

interface Permission {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

interface Role {
  id: number;
  name: string;
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [permissionName, setPermissionName] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      const data = (await ApiService.getPermissions()) as Permission[];
      setPermissions(Array.isArray(data) ? data : []);
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

  const fetchRoles = async () => {
    try {
      const data = await ApiService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load roles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPermission) {
        await ApiService.updatePermission(editingPermission.id, {
          name: permissionName,
        });
        toast({
          title: "Success",
          description: "Permission updated successfully",
        });
      } else {
        await ApiService.createPermission({ name: permissionName });
        toast({
          title: "Success",
          description: "Permission created successfully",
        });
      }

      setIsDialogOpen(false);
      setEditingPermission(null);
      setPermissionName("");
      fetchPermissions();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Operation failed",
        variant: "destructive",
      });
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRoleId || selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select a role and at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      await ApiService.assignPermissionsToRole({
        role_id: Number.parseInt(selectedRoleId),
        permission_ids: selectedPermissions,
      });
      toast({
        title: "Success",
        description: "Permissions assigned to role successfully",
      });
      setIsAssignDialogOpen(false);
      setSelectedRoleId("");
      setSelectedPermissions([]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to assign permissions",
        variant: "destructive",
      });
    }
  };

  const handleRemovePermissions = async () => {
    if (!selectedRoleId || selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Please select a role and at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      await ApiService.removePermissionsFromRole({
        role_id: Number.parseInt(selectedRoleId),
        permission_ids: selectedPermissions,
      });
      toast({
        title: "Success",
        description: "Permissions removed from role successfully",
      });
      setIsRemoveDialogOpen(false);
      setSelectedRoleId("");
      setSelectedPermissions([]);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove permissions",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setPermissionName(permission.name);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    try {
      await ApiService.deletePermission(id);
      toast({
        title: "Success",
        description: "Permission deleted successfully",
      });
      fetchPermissions();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete permission",
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingPermission(null);
    setPermissionName("");
    setIsDialogOpen(true);
  };

  const openAssignDialog = () => {
    setSelectedRoleId("");
    setSelectedPermissions([]);
    setIsAssignDialogOpen(true);
  };

  const openRemoveDialog = () => {
    setSelectedRoleId("");
    setSelectedPermissions([]);
    setIsRemoveDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
          <p className="text-muted-foreground">
            Manage system permissions and access controls
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isRemoveDialogOpen}
            onOpenChange={setIsRemoveDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openRemoveDialog}>
                <Minus className="mr-2 h-4 w-4" />
                Remove from Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Remove Permissions from Role</DialogTitle>
                <DialogDescription>
                  Select a role and permissions to remove from it.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remove-role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 max-h-60 overflow-y-auto">
                  <Label>Permissions to Remove:</Label>
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`remove-permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.id,
                            ]);
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (id) => id !== permission.id
                              )
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`remove-permission-${permission.id}`}
                        className="text-sm font-normal"
                      >
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRemovePermissions} variant="destructive">
                  Remove Permissions
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isAssignDialogOpen}
            onOpenChange={setIsAssignDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" onClick={openAssignDialog}>
                <Shield className="mr-2 h-4 w-4" />
                Assign to Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Assign Permissions to Role</DialogTitle>
                <DialogDescription>
                  Select a role and permissions to assign to it.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assign-role" className="text-right">
                    Role
                  </Label>
                  <Select
                    value={selectedRoleId}
                    onValueChange={setSelectedRoleId}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 max-h-60 overflow-y-auto">
                  <Label>Permissions to Assign:</Label>
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`assign-permission-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([
                              ...selectedPermissions,
                              permission.id,
                            ]);
                          } else {
                            setSelectedPermissions(
                              selectedPermissions.filter(
                                (id) => id !== permission.id
                              )
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`assign-permission-${permission.id}`}
                        className="text-sm font-normal"
                      >
                        {permission.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAssignPermissions}>
                  Assign Permissions
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Permission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingPermission
                      ? "Edit Permission"
                      : "Create New Permission"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPermission
                      ? "Update the permission name below."
                      : "Enter the details for the new permission."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={permissionName}
                      onChange={(e) => setPermissionName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter permission name"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">
                    {editingPermission ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            All Permissions
          </CardTitle>
          <CardDescription>
            A list of all permissions in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading permissions...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No permissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        {permission.id}
                      </TableCell>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>
                        {permission.created_at
                          ? new Date(permission.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(permission)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(permission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
