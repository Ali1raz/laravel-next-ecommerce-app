import { AuthService } from "./auth";

interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Role[];
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  seller: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Bill {
  id: number;
  total_amount: number;
  created_at: string;
  items: BillItem[];
}

export interface BillItem {
  id: number;
  quantity: number;
  price_at_time: number;
  product: Product;
}

export interface SellerDashboard {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: any[];
}

export class ApiService {
  private static API_BASE_URL = "http://127.0.0.1:8000/api";

  private static async request<T>(
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

    try {
      const response = await fetch(`${ApiService.API_BASE_URL}${endpoint}`, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: `HTTP error ${response.status}` }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      const result = await response.json();

      // Handle the API response format with status field
      if (result.status === "error") {
        throw new Error(result.message || "API request failed");
      }

      // Return the data field if it exists, otherwise return the whole result
      return result.data || result;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  static async post<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data,
    });
  }

  static async put<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // Auth
  static async login(email: string, password: string) {
    return this.post("/login", { email, password });
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.post("/register", data);
  }

  static async verifyEmail(email: string, code: string) {
    return this.post("/verify-code", { email, code });
  }

  static async forgotPassword(email: string) {
    return this.post("/forgot-password", { email });
  }

  static async resetPassword(data: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.post("/reset-password", data);
  }

  static async logout() {
    return this.post("/logout", {});
  }

  // Profile Management
  static async getProfile(): Promise<User> {
    return this.get("/profile");
  }

  static async updateProfile(data: {
    name?: string;
    email?: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }) {
    return this.put("/profile", data);
  }

  // Products - Buyer
  static async getProducts(): Promise<Product[]> {
    return this.get("/products");
  }

  static async getProduct(id: number): Promise<Product> {
    return this.get(`/products/${id}`);
  }

  // Products - Seller
  static async getSellerProducts(): Promise<Product[]> {
    return this.get("/seller/products");
  }

  static async createSellerProduct(data: {
    title: string;
    description: string;
    price: number;
    quantity: number;
  }): Promise<Product> {
    return this.post("/seller/products", data);
  }

  static async updateSellerProduct(
    id: number,
    data: {
      title?: string;
      description?: string;
      price?: number;
      quantity?: number;
    }
  ): Promise<Product> {
    return this.put(`/seller/products/${id}`, data);
  }

  static async deleteSellerProduct(id: number): Promise<void> {
    return this.delete(`/seller/products/${id}`);
  }

  // Cart Management
  static async getCart(): Promise<CartItem[]> {
    return this.get("/cart");
  }

  static async addToCart(data: { product_id: number; quantity: number }) {
    return this.post("/cart/add", data);
  }

  static async removeFromCart(data: { product_id: number }) {
    return this.post("/cart/remove", data);
  }

  static async updateCartQuantity(data: {
    product_id: number;
    quantity: number;
  }) {
    return this.put("/cart/update-quantity", data);
  }

  // Bills
  static async getBills(): Promise<Bill[]> {
    return this.get("/bills");
  }

  static async getBill(id: number): Promise<Bill> {
    return this.get(`/bills/${id}`);
  }

  static async checkout() {
    return this.post("/checkout", {});
  }

  // Dashboard endpoints
  static async getDashboard() {
    return this.get("/admin/dashboard");
  }

  static async getBuyerDashboard() {
    return this.get("/buyer/dashboard");
  }

  static async getSellerDashboard(): Promise<SellerDashboard> {
    return this.get("/seller/dashboard");
  }

  // Users Management (Admin only)
  static async getUsers() {
    return this.get("/admin/users");
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
  }) {
    return this.post("/admin/users", data);
  }

  static async getUser(id: number) {
    return this.get(`/admin/users/${id}`);
  }

  static async updateUser(
    id: number,
    data: {
      name?: string;
      email?: string;
      password?: string;
      password_confirmation?: string;
      role?: string;
    }
  ) {
    return this.put(`/admin/users/${id}`, data);
  }

  static async deleteUser(id: number) {
    return this.delete(`/admin/users/${id}`);
  }

  // Roles (Admin only)
  static async getRoles() {
    return this.get("/admin/roles");
  }

  static async createRole(data: { name: string }) {
    return this.post("/admin/roles", data);
  }

  static async getRole(id: number) {
    return this.get(`/admin/roles/${id}`);
  }

  static async updateRole(id: number, data: { name: string }) {
    return this.put(`/admin/roles/${id}`, data);
  }

  static async deleteRole(id: number) {
    return this.delete(`/admin/roles/${id}`);
  }

  // Permissions (Admin only)
  static async getPermissions() {
    return this.get("/admin/permissions");
  }

  static async createPermission(data: { name: string }) {
    return this.post("/admin/permissions", data);
  }

  static async getPermission(id: number) {
    return this.get(`/admin/permissions/${id}`);
  }

  static async updatePermission(id: number, data: { name: string }) {
    return this.put(`/admin/permissions/${id}`, data);
  }

  static async deletePermission(id: number) {
    return this.delete(`/admin/permissions/${id}`);
  }

  static async assignPermissionsToRole(data: {
    role_id: number;
    permission_ids: number[];
  }) {
    return this.post("/admin/permissions/assign-to-role", data);
  }

  static async removePermissionsFromRole(data: {
    role_id: number;
    permission_ids: number[];
  }) {
    return this.post("/admin/permissions/remove-from-role", data);
  }

  // User Role Management (Admin only)
  static async assignRoleToUser(data: { user_id: number; role_id: number }) {
    return this.post("/admin/users/assign-role", data);
  }

  static async removeRoleFromUser(data: { user_id: number }) {
    return this.post("/admin/users/remove-role", data);
  }

  static async getUserRole(userId: number) {
    return this.get(`/admin/users/${userId}/role`);
  }
}
