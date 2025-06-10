export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: "admin" | "seller" | "buyer";
  roles?: Role[];
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role?: string;
    roles?: Array<{
      id: number;
      name: string;
      permissions?: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
}

interface LoginCredentials {
  email: string;
  password: string;
}

export interface Role {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  permissions?: Permission[];
  pivot?: {
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

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
