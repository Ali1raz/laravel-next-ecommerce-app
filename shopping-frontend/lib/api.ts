import { AuthService } from "./auth";
import {
  AdminDashboardData,
  ApiRequestOptions,
  ApiResponse,
  Bill,
  BuyerDashboardData,
  CartItem,
  PaginatedResponse,
  Permission,
  Product,
  Role,
  SellerDashboardData,
  User,
} from "./interfaces";

export class ApiService {
  private static API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;
  // private static API_BASE_URL = "http://127.0.0.1:8000/api";

  private static async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const token = AuthService.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
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
        const error = await response.json().catch(() => ({
          status: "error",
          message: `HTTP error ${response.status}`,
        }));
        throw new Error(error.message || `HTTP error ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (result.status === "error") {
        throw new Error(result.message || "API request failed");
      }

      return result.data as T;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request("/login", {
      method: "POST",
      body: { email, password },
    });
  }

  static async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.request("/register", {
      method: "POST",
      body: data,
    });
  }

  static async verifyEmail(email: string, code: string) {
    return this.request("/verify-code", {
      method: "POST",
      body: { email, code },
    });
  }

  static async resendVerificationCode(email: string) {
    return this.request("/resend-verification-code", {
      method: "POST",
      body: { email },
    });
  }

  static async forgotPassword(email: string) {
    return this.request("/forgot-password", {
      method: "POST",
      body: { email },
    });
  }

  static async resetPassword(data: {
    email: string;
    code: string;
    password: string;
    password_confirmation: string;
  }) {
    return this.request("/reset-password", {
      method: "POST",
      body: data,
    });
  }

  static async logout() {
    return this.request("/logout", {
      method: "POST",
    });
  }

  // Profile endpoints
  static async getProfile(): Promise<User> {
    return this.request("/profile");
  }

  static async updateProfile(data: {
    name?: string;
    email?: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }) {
    return this.request("/profile", {
      method: "PUT",
      body: data,
    });
  }

  // User management (Admin only)
  static async getUsers(): Promise<PaginatedResponse<User>> {
    return this.request("/admin/users");
  }

  static async createUser(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: string;
  }): Promise<User> {
    return this.request("/admin/users", {
      method: "POST",
      body: data,
    });
  }

  static async getUser(id: number): Promise<User> {
    return this.request(`/admin/users/${id}`);
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
  ): Promise<User> {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  static async deleteUser(id: number): Promise<void> {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  static async assignRoleToUser(data: {
    user_id: number;
    role_id: number;
  }): Promise<void> {
    return this.request("/admin/users/assign-role", {
      method: "POST",
      body: data,
    });
  }

  static async removeRoleFromUser(data: { user_id: number }): Promise<void> {
    return this.request("/admin/users/remove-role", {
      method: "POST",
      body: data,
    });
  }

  static async getUserRole(userId: number): Promise<Role> {
    return this.request(`/admin/users/${userId}/role`);
  }

  // Dashboard endpoints
  static async getAdminDashboard(): Promise<AdminDashboardData> {
    return this.request("/admin/dashboard");
  }

  static async getSellerDashboard(): Promise<SellerDashboardData> {
    return this.request("/seller/dashboard");
  }

  static async getBuyerDashboard(): Promise<BuyerDashboardData> {
    return this.request("/buyer/dashboard");
  }

  // Product endpoints - Updated to include seller information
  static async getProducts(): Promise<Product[]> {
    return this.request("/products?include=seller,user");
  }

  static async getProduct(id: number): Promise<Product> {
    return this.request(`/products/${id}?include=seller,user`);
  }

  // Seller product management
  static async getSellerProducts(): Promise<Product[]> {
    return this.request("/seller/products?include=seller,user");
  }

  static async createSellerProduct(data: {
    title: string;
    description: string;
    price: number | string;
    quantity: number;
  }): Promise<Product> {
    return this.request("/seller/products", {
      method: "POST",
      body: data,
    });
  }

  static async updateSellerProduct(
    id: number,
    data: {
      title?: string;
      description?: string;
      price?: number | string;
      quantity?: number;
    }
  ): Promise<Product> {
    return this.request(`/seller/products/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  static async deleteSellerProduct(id: number): Promise<void> {
    return this.request(`/seller/products/${id}`, {
      method: "DELETE",
    });
  }

  // Admin product management
  static async getAdminProducts(): Promise<Product[]> {
    return this.request("/admin/products?include=seller,user");
  }

  static async createAdminProduct(data: {
    title: string;
    description: string;
    price: number | string;
    quantity: number;
  }): Promise<Product> {
    return this.request("/admin/products", {
      method: "POST",
      body: data,
    });
  }

  static async getAdminProduct(id: number): Promise<Product> {
    return this.request(`/admin/products/${id}?include=seller,user`);
  }

  static async updateAdminProduct(
    id: number,
    data: {
      title?: string;
      description?: string;
      price?: number | string;
      quantity?: number;
    }
  ): Promise<Product> {
    return this.request(`/admin/products/${id}`, {
      method: "PUT",
      body: data,
    });
  }

  static async deleteAdminProduct(id: number): Promise<void> {
    return this.request(`/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  // Cart endpoints
  static async getCart(): Promise<CartItem[]> {
    return this.request("/cart");
  }

  static async addToCart(data: { product_id: number; quantity: number }) {
    return this.request("/cart/add", {
      method: "POST",
      body: data,
    });
  }

  static async removeFromCart(data: { product_id: number }) {
    return this.request("/cart/remove", {
      method: "POST",
      body: data,
    });
  }

  static async updateCartQuantity(data: {
    product_id: number;
    quantity: number;
  }) {
    return this.request("/cart/update-quantity", {
      method: "PUT",
      body: data,
    });
  }

  // Bills endpoints
  static async getBills(): Promise<Bill[]> {
    return this.request("/bills");
  }

  static async getBill(id: number): Promise<Bill> {
    return this.request(`/bills/${id}`);
  }

  static async checkout() {
    return this.request("/checkout", {
      method: "POST",
    });
  }

  // Dashboard endpoint - fix the method name
  static async getDashboard(): Promise<AdminDashboardData> {
    return this.request("/admin/dashboard");
  }

  // Role management endpoints
  static async getRoles(): Promise<Role[]> {
    return this.request("/admin/roles");
  }

  static async getRole(id: number): Promise<Role> {
    return this.request(`/admin/roles/${id}`);
  }

  // Permission management endpoints
  static async getPermissions(): Promise<Permission[]> {
    return this.request("/admin/permissions");
  }

  static async assignPermissionToRole(data: {
    role_id: number;
    permission_id: number;
  }): Promise<void> {
    return this.request("/admin/permissions/assign-to-role", {
      method: "POST",
      body: data,
    });
  }

  static async removePermissionFromRole(data: {
    role_id: number;
    permission_id: number;
  }): Promise<void> {
    return this.request("/admin/permissions/remove-from-role", {
      method: "POST",
      body: data,
    });
  }
}
