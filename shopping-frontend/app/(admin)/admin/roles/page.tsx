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
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ApiService } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Shield, Key, Users, Plus, Minus } from "lucide-react";
import { Role, Permission } from "@/lib/interfaces";
import { getRoleColor, getRoleIcon } from "@/lib/constants";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPermissionsLoading, setIsPermissionsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await ApiService.getRoles();
      setRoles(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load roles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    setIsPermissionsLoading(true);
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
      setIsPermissionsLoading(false);
    }
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;

    setIsSubmitting(true);
    try {
      await ApiService.assignPermissionToRole({
        role_id: selectedRole.id,
        permission_ids: selectedPermissions,
      });

      toast({
        title: "Success",
        description: `Permissions assigned to ${selectedRole.name} role successfully`,
      });

      setIsAssignDialogOpen(false);
      setSelectedPermissions([]);
      setSelectedRole(null);
      fetchRoles(); // Refresh roles to show updated permissions
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to assign permissions",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePermissions = async () => {
    if (!selectedRole || selectedPermissions.length === 0) return;

    setIsSubmitting(true);
    try {
      await ApiService.removePermissionFromRole({
        role_id: selectedRole.id,
        permission_ids: selectedPermissions,
      });

      toast({
        title: "Success",
        description: `Permissions removed from ${selectedRole.name} role successfully`,
      });

      setIsRemoveDialogOpen(false);
      setSelectedPermissions([]);
      setSelectedRole(null);
      fetchRoles(); // Refresh roles to show updated permissions
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to remove permissions",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions([]);
    setIsAssignDialogOpen(true);
    if (permissions.length === 0) {
      fetchPermissions();
    }
  };

  const openRemoveDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions([]);
    setIsRemoveDialogOpen(true);
  };

  const getUnassignedPermissions = () => {
    if (!selectedRole) return permissions;
    const assignedPermissionIds =
      selectedRole.permissions?.map((p) => p.id) || [];
    return permissions.filter((p) => !assignedPermissionIds.includes(p.id));
  };

  const getAssignedPermissions = () => {
    return selectedRole?.permissions || [];
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton type="table" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
        <p className="text-muted-foreground">
          View and manage system roles and their permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">System roles</p>
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
              {roles.reduce(
                (total, role) => total + (role.permissions?.length || 0),
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">Currently in use</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            Manage roles and their associated permissions. Use the action
            buttons to assign or remove permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No roles found</h3>
              <p className="text-muted-foreground">
                Roles will appear here once loaded
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const RoleIcon = getRoleIcon(role.name);
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <RoleIcon className="h-4 w-4" />
                          <div>
                            <Badge
                              variant={getRoleColor(role.name)}
                              className="mb-1"
                            >
                              {role.name}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              ID: {role.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {role.permissions && role.permissions?.length > 0 ? (
                            <>
                              {role.permissions
                                .slice(0, 3)
                                .map((permission) => (
                                  <Badge
                                    key={permission.id}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {permission.name}
                                  </Badge>
                                ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No permissions
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {role.created_at
                          ? new Date(role.created_at).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openAssignDialog(role)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRemoveDialog(role)}
                            disabled={
                              !role.permissions || role.permissions.length === 0
                            }
                          >
                            <Minus className="h-3 w-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Details */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        {roles.map((role) => {
          const RoleIcon = getRoleIcon(role.name);
          return (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RoleIcon className="h-5 w-5" />
                  <Badge variant={getRoleColor(role.name)}>{role.name}</Badge>
                </CardTitle>
                <CardDescription>
                  {role.permissions?.length || 0} permissions assigned
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Permissions:</h4>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions && role.permissions?.length > 0 ? (
                      role.permissions.map((permission) => (
                        <Badge
                          key={permission.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {permission.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No permissions assigned
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign Permissions Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Assign Permissions to {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select permissions to assign to this role. Only unassigned
              permissions are shown.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            {isPermissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {getUnassignedPermissions().length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    All permissions are already assigned to this role.
                  </p>
                ) : (
                  getUnassignedPermissions().map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`assign-${permission.id}`}
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
                      <label
                        htmlFor={`assign-${permission.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {permission.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignPermissions}
              disabled={selectedPermissions.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? "Assigning..."
                : `Assign ${selectedPermissions.length} Permission(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Permissions Dialog */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Remove Permissions from {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select permissions to remove from this role. Only assigned
              permissions are shown.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {getAssignedPermissions().length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No permissions are assigned to this role.
                </p>
              ) : (
                getAssignedPermissions().map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`remove-${permission.id}`}
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
                    <label
                      htmlFor={`remove-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemovePermissions}
              disabled={selectedPermissions.length === 0 || isSubmitting}
            >
              {isSubmitting
                ? "Removing..."
                : `Remove ${selectedPermissions.length} Permission(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
