import { AuthService } from "./auth";

const API_BASE_URL = `${process.env.BACKEND_URL}/api`;

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

export class ApiClient {
  private static async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = AuthService.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  // Dashboard
  static getDashboard() {
    return this.makeRequest("/admin/dashboard");
  }

  // Roles
  static getRoles() {
    return this.makeRequest("/admin/roles");
  }

  static createRole(data: { name: string }) {
    return this.makeRequest("/admin/roles", {
      method: "POST",
      body: data,
    });
  }

  static getRole(id: number) {
    return this.makeRequest(`/admin/roles/${id}`);
  }

  static updateRole(id: number, data: { name: string }) {
    return this.makeRequest(`/admin/roles/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  static deleteRole(id: number) {
    return this.makeRequest(`/admin/roles/${id}`, {
      method: "DELETE",
    });
  }

  // Permissions
  static getPermissions() {
    return this.makeRequest("/admin/permissions");
  }

  static createPermission(data: { name: string }) {
    return this.makeRequest("/admin/permissions", {
      method: "POST",
      body: data,
    });
  }

  static getPermission(id: number) {
    return this.makeRequest(`/admin/permissions/${id}`);
  }

  static updatePermission(id: number, data: { name: string }) {
    return this.makeRequest(`/admin/permissions/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  static deletePermission(id: number) {
    return this.makeRequest(`/admin/permissions/${id}`, {
      method: "DELETE",
    });
  }

  static assignPermissionsToRole(data: {
    role_id: number;
    permission_ids: number[];
  }) {
    return this.makeRequest("/admin/permissions/assign-to-role", {
      method: "POST",
      body: data,
    });
  }

  static removePermissionsFromRole(data: {
    role_id: number;
    permission_ids: number[];
  }) {
    return this.makeRequest("/admin/permissions/remove-from-role", {
      method: "POST",
      body: data,
    });
  }

  // User Role Management
  static assignRoleToUser(data: { user_id: number; role_id: number }) {
    return this.makeRequest("/admin/users/assign-role", {
      method: "POST",
      body: data,
    });
  }

  static removeRoleFromUser(data: { user_id: number }) {
    return this.makeRequest("/admin/users/remove-role", {
      method: "POST",
      body: data,
    });
  }

  static getUserRole(userId: number) {
    return this.makeRequest(`/admin/users/${userId}/role`);
  }
}
