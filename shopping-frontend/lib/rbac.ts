import { AuthService } from "./auth";

export interface Permission {
  id: number;
  name: string;
}

export interface RolePermissions {
  admin: string[];
  seller: string[];
  buyer: string[];
}

// Define role-based permissions
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    "view-dashboard",
    "manage-users",
    "manage-roles",
    "manage-permissions",
    "view-products",
    "add-products",
    "edit-products",
    "delete-products",
    "view-orders",
    "manage-orders",
    "view-analytics",
  ],
  seller: [
    "view-dashboard",
    "view-products",
    "add-products",
    "edit-products",
    "delete-products",
    "view-orders",
    "manage-orders",
    "view-analytics",
  ],
  buyer: [
    "view-dashboard",
    "view-products",
    "add-to-cart",
    "view-cart",
    "checkout",
    "view-orders",
    "view-profile",
  ],
};

export class RBACService {
  static hasPermission(permission: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    // Check if user has permission through roles
    if (AuthService.hasPermission(permission)) {
      return true;
    }

    // Fallback to role-based permissions
    const userRole = AuthService.getUserRole();
    if (!userRole) return false;

    const rolePermissions = ROLE_PERMISSIONS[userRole as keyof RolePermissions];
    return rolePermissions?.includes(permission) || false;
  }

  static canAccessRoute(route: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    const userRole = AuthService.getUserRole();
    if (!userRole) return false;

    // Define route access rules
    const routePermissions: Record<string, string[]> = {
      "/admin": ["admin"],
      "/seller": ["admin", "seller"],
      "/buyer": ["admin", "buyer"],
      "/settings": ["admin", "seller", "buyer"], // Universal access
    };

    // Check if route starts with any protected path
    for (const [path, allowedRoles] of Object.entries(routePermissions)) {
      if (route.startsWith(path)) {
        return allowedRoles.includes(userRole);
      }
    }

    return true; // Allow access to public routes
  }

  static canPerformAction(action: string, resource?: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    const userRole = AuthService.getUserRole();
    if (!userRole) return false;

    // Define action-based permissions
    const actionPermissions: Record<string, Record<string, string[]>> = {
      create: {
        product: ["admin", "seller"],
        user: ["admin"],
        role: ["admin"],
        permission: ["admin"],
      },
      edit: {
        product: ["admin", "seller"],
        user: ["admin"],
        role: ["admin"],
        permission: ["admin"],
      },
      delete: {
        product: ["admin", "seller"],
        user: ["admin"],
        role: ["admin"],
        permission: ["admin"],
      },
      view: {
        product: ["admin", "seller", "buyer"],
        user: ["admin"],
        role: ["admin"],
        permission: ["admin"],
        dashboard: ["admin", "seller", "buyer"],
      },
    };

    if (resource && actionPermissions[action]?.[resource]) {
      return actionPermissions[action][resource].includes(userRole);
    }

    return false;
  }

  static getAccessibleRoutes(): string[] {
    const userRole = AuthService.getUserRole();
    if (!userRole) return ["/"];

    const routesByRole: Record<string, string[]> = {
      admin: ["/admin", "/settings"],
      seller: ["/seller", "/settings"],
      buyer: ["/buyer", "/settings"],
    };

    return routesByRole[userRole] || ["/"];
  }

  static validateApiAccess(endpoint: string, method: string): boolean {
    const user = AuthService.getUser();
    if (!user) return false;

    const userRole = AuthService.getUserRole();
    if (!userRole) return false;

    // Define API access rules
    const apiRules: Record<string, Record<string, string[]>> = {
      "/admin/products": {
        GET: ["admin", "seller"],
        POST: ["admin", "seller"],
        PUT: ["admin", "seller"],
        DELETE: ["admin", "seller"],
      },
      "/admin/users": {
        GET: ["admin"],
        POST: ["admin"],
        PUT: ["admin"],
        DELETE: ["admin"],
      },
      "/products": {
        GET: ["admin", "seller", "buyer"],
      },
      "/cart": {
        GET: ["buyer"],
        POST: ["buyer"],
        PUT: ["buyer"],
        DELETE: ["buyer"],
      },
      "/bills": {
        GET: ["buyer"],
        POST: ["buyer"],
      },
      "/checkout": {
        POST: ["buyer"],
      },
    };

    // Check exact endpoint match
    if (apiRules[endpoint]?.[method]) {
      return apiRules[endpoint][method].includes(userRole);
    }

    // Check pattern matches
    for (const [pattern, methods] of Object.entries(apiRules)) {
      if (endpoint.startsWith(pattern) && methods[method]) {
        return methods[method].includes(userRole);
      }
    }

    return false;
  }
}
