export interface User {
  id: string
  name: string
  email: string
  userType: "student" | "professional"
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  message: string
  error?: string
}

// Client-side authentication helpers
export class AuthService {
  private static readonly TOKEN_KEY = "auth-token"
  private static readonly USER_KEY = "current-user"

  // Login user with API call
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem(this.TOKEN_KEY, data.token)
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))

        // Set cookie for server-side access
        document.cookie = `auth-token=${data.token}; path=/; max-age=86400; secure; samesite=strict`
      }

      return data
    } catch (error) {
      console.error(" !  Login error:", error)
      return {
        success: false,
        message: "Network error. Please try again.",
        error: "NETWORK_ERROR",
      }
    }
  }

  // Register new user
  static async register(userData: {
    name: string
    email: string
    password: string
    userType: string
    agreeToTerms: boolean
  }): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      return await response.json()
    } catch (error) {
      console.error(" !  Registration error:", error)
      return {
        success: false,
        message: "Network error. Please try again.",
        error: "NETWORK_ERROR",
      }
    }
  }

  // Request password reset
  static async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      return await response.json()
    } catch (error) {
      console.error(" !  Password reset error:", error)
      return {
        success: false,
        message: "Network error. Please try again.",
        error: "NETWORK_ERROR",
      }
    }
  }

  // Get current user
  static getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY)
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  // Logout user
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)

    // Clear auth cookie
    document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

    // Redirect to home
    window.location.href = "/"
  }

  // Get auth token
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }
}
