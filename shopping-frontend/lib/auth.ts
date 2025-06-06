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
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

const API_BASE_URL = `${process.env.BACKEND_URL}/api`;

export class AuthService {
  private static TOKEN_KEY = "admin_token";
  private static USER_KEY = "admin_user";

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data: LoginResponse = await response.json();

    // Store token and user data
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

    return data;
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): any | null {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
