import { API_BASE_URL } from "./constants";
import { User } from "./interfaces";

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

      return user;
    } catch {
      return null;
    }
  }

  static setUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    const isAuth = !!(token && user);

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
