interface LoginCredentials {
  email: string;
  password: string;
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

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: "admin" | "seller" | "buyer";
  roles?: Array<{
    id: number;
    name: string;
    permissions?: Array<{
      id: number;
      name: string;
    }>;
  }>;
  email_verified_at: string | null;
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = "http://127.0.0.1:8000/api";

export class AuthService {
  private static USER_KEY = "user";
  private static TOKEN_KEY = "token";

  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle email verification error specifically
        if (
          response.status === 403 &&
          data.message?.includes("verify your email")
        ) {
          const error = new Error(data.message);
          (error as any).needsVerification = true;
          (error as any).email = data.email || email;
          throw error;
        }
        throw new Error(data.message || "Login failed");
      }

      const user = data.user as User;

      // Store user and token
      this.setUser(user);
      localStorage.setItem(this.TOKEN_KEY, data.token);

      // Also store token in a cookie for middleware
      document.cookie = `token=${data.token}; path=/; max-age=2592000`; // 30 days

      console.log("AuthService - User logged in:", user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);

      // Clear the cookie
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      console.log("AuthService - User logged out");
    }
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr) as User;
      console.log("AuthService - Retrieved user:", user);
      return user;
    } catch {
      return null;
    }
  }

  static setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    console.log("AuthService - User stored:", user);
  }

  static updateUserRole(newRole: string): void {
    const user = this.getUser();
    if (user) {
      user.role = newRole as "admin" | "seller" | "buyer";
      // Also update roles array if it exists
      if (user.roles) {
        user.roles = [{ id: 1, name: newRole }];
      }
      this.setUser(user);
      console.log("AuthService - User role updated:", newRole);
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    const isAuth = !!(token && user);
    console.log("AuthService - Is authenticated:", isAuth);
    return isAuth;
  }

  static hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Check direct role property
    if (user.role === role) return true;

    // Check roles array if it exists
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((r) => r.name === role);
    }

    return false;
  }

  static hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // Check if user has roles with permissions
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some((role) =>
        role.permissions?.some((perm) => perm.name === permission)
      );
    }

    return false;
  }

  static isAdmin(): boolean {
    return this.hasRole("admin");
  }

  static isSeller(): boolean {
    return this.hasRole("seller");
  }

  static isBuyer(): boolean {
    return this.hasRole("buyer");
  }

  static getUserRole(): string | null {
    const user = this.getUser();
    if (!user) return null;

    // First check direct role property
    if (user.role) return user.role;

    // Then check roles array
    if (user.roles && user.roles.length > 0) {
      return user.roles[0].name;
    }

    return null;
  }

  static getUserPermissions(): string[] {
    const user = this.getUser();
    if (!user || !user.roles) return [];

    const permissions: string[] = [];
    user.roles.forEach((role) => {
      if (role.permissions) {
        role.permissions.forEach((perm) => {
          if (!permissions.includes(perm.name)) {
            permissions.push(perm.name);
          }
        });
      }
    });

    return permissions;
  }
}
