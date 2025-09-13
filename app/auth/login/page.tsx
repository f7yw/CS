// app/auth/login/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { validateEmail, sanitizeInput } from "@/lib/validation"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const [showRegisteredBanner, setShowRegisteredBanner] = useState<boolean>(false)

  useEffect(() => {
    const reg = searchParams.get("registered")
    const success = searchParams.get("success")
    if (reg === "1" || reg === "true" || success === "1" || success === "true") {
      setShowRegisteredBanner(true)
      // Remove banner after some seconds if you want auto-dismiss
      // setTimeout(() => setShowRegisteredBanner(false), 6000)
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) newErrors.email = emailValidation.errors[0]
    if (!formData.password) newErrors.password = "Password is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const storedUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const user = storedUsers.find(
        (u: any) => u.email === formData.email && u.password === formData.password
      )

      if (user) {
        const authToken = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem("auth_token", authToken)
        localStorage.setItem(
          "current_user",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            loginTime: new Date().toISOString(),
          })
        )

        toast({
          title: "Login successful!",
          description: `Welcome back, ${user.name}!`,
        })
        window.location.href = "/dashboard"
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {showRegisteredBanner && (
          <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-800 flex items-start gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <div className="font-medium">Account created successfully</div>
                <div className="text-sm">Please sign in with your new account.</div>
              </div>
            </div>
            <button
              onClick={() => setShowRegisteredBanner(false)}
              aria-label="Dismiss"
              className="ml-auto text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-2">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold gradient-text">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to your NextStep Navigator account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10 bg-background"
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-background"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="flex justify-between items-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  <div className="inline-flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-primary hover:underline font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
