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
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: Permission[];
  pivot?: {
    model_type?: string;
    model_id?: number;
    role_id?: number;
    user_id?: number;
  };
}

export interface Permission {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number | string;
  quantity: number;
  seller_id?: number;
  created_at?: string;
  updated_at?: string;
  seller?: {
    id: number;
    name: string;
    email: string;
  };
  user?: {
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

export interface BillItem {
  id: number;
  bill_id?: number;
  product_id?: number;
  quantity: number;
  price_at_time: number | string;
  created_at?: string;
  updated_at?: string;
  product: Product;
}

export interface Bill {
  id: number;
  user_id?: number;
  total_amount: number | string;
  created_at: string;
  updated_at?: string;
  status?: string;
  items: BillItem[];
  user?: User;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface AdminDashboardData {
  analytics: {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    users_by_role: Array<{
      name: string;
      total: number;
    }>;
  };
  recent_users: User[];
}

export interface SellerDashboardData {
  total_products: number;
  total_sales: string | number;
  total_orders: number;
  recent_orders: Bill[];
  top_selling_products: any[];
  low_stock_products: any[];
}

export interface BuyerDashboardData {
  cart_items_count: number;
  total_spent: number;
  recent_orders: Bill[];
  favorite_products: any[];
  recommended_products: any[];
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
}
