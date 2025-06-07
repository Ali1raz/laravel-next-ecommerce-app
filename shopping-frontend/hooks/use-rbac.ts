"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth";
import { RBACService } from "@/lib/rbac";
import { useToast } from "@/hooks/use-toast";

type RoleType = "admin" | "seller" | "buyer";

export function useRBAC(requiredRole?: RoleType, requiredPermission?: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = () => {
      const authenticated = AuthService.isAuthenticated();
      let hasRole = true;
      let hasPermission = true;

      if (authenticated) {
        // Check role if specified
        if (requiredRole) {
          hasRole = AuthService.hasRole(requiredRole);
        }

        // Check permission if specified
        if (requiredPermission) {
          hasPermission = RBACService.hasPermission(requiredPermission);
        }
      }

      const authorized = authenticated && hasRole && hasPermission;
      setIsAuthorized(authorized);
      setIsLoading(false);

      if (!authenticated) {
        router.push("/login");
      } else if (!hasRole) {
        const userRole = AuthService.getUserRole();
        toast({
          title: "Access Denied",
          description: `You don't have the required role to access this area`,
          variant: "destructive",
        });

        // Redirect to appropriate dashboard
        const accessibleRoutes = RBACService.getAccessibleRoutes();
        if (accessibleRoutes.length > 0) {
          router.push(accessibleRoutes[0]);
        } else {
          router.push("/");
        }
      } else if (!hasPermission) {
        toast({
          title: "Access Denied",
          description: `You don't have the required permission: ${requiredPermission}`,
          variant: "destructive",
        });
      }
    };

    checkAuthorization();
  }, [requiredRole, requiredPermission, router, toast]);

  return { isAuthorized, isLoading };
}

// Hook for checking multiple permissions
export function usePermissions(requiredPermissions: string[]) {
  const [hasPermissions, setHasPermissions] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = () => {
      const permissions: Record<string, boolean> = {};

      requiredPermissions.forEach((permission) => {
        permissions[permission] = RBACService.hasPermission(permission);
      });

      setHasPermissions(permissions);
      setIsLoading(false);
    };

    checkPermissions();
  }, [requiredPermissions]);

  return { hasPermissions, isLoading };
}

// Hook for checking route access
export function useRouteAccess(route: string) {
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const access = RBACService.canAccessRoute(route);
      setCanAccess(access);
      setIsLoading(false);
    };

    checkAccess();
  }, [route]);

  return { canAccess, isLoading };
}
