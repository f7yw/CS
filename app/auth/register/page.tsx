"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, GraduationCap, Briefcase } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { validateUserRegistration, sanitizeInput } from "@/lib/validation"

export default function RegisterPage() {
  // Form state for user registration data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    agreeToTerms: false,
  })

  // UI state management
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const { toast } = useToast()

  // Handle input changes with real-time validation
  const handleInputChange = (field: string, value: string | boolean) => {
    if (typeof value === "string") {
      value = sanitizeInput(value)
    }

    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear field errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }))
    }
  }

  // Comprehensive form validation using our validation library
  const validateForm = () => {
    const validationResult = validateUserRegistration(formData)

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      validationResult.errors.push("Passwords do not match")
      validationResult.isValid = false
    }

    // Convert errors to field-specific format
    const fieldErrors: Record<string, string[]> = {}
    validationResult.errors.forEach((error) => {
      const [field, message] = error.includes(":") ? error.split(": ") : ["general", error]
      if (!fieldErrors[field]) fieldErrors[field] = []
      fieldErrors[field].push(message || error)
    })

    setErrors(fieldErrors)
    return validationResult.isValid
  }

  // Handle form submission with user registration
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
      // Simulate API call for registration
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const existingUser = storedUsers.find((u: any) => u.email === formData.email)

      if (existingUser) {
        toast({
          title: "Registration failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        })
        return
      }

      // Create new user account
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        email: formData.email,
        password: formData.password, // In production, this would be hashed
        userType: formData.userType,
        registrationDate: new Date().toISOString(),
        isVerified: false, // Email verification would be required
      }

      // Store user data
      storedUsers.push(newUser)
      localStorage.setItem("registered_users", JSON.stringify(storedUsers))

      // Send welcome email simulation
      const emailData = {
        to: formData.email,
        subject: "Welcome to NextStep Navigator!",
        template: "welcome",
        data: {
          name: formData.name,
          userType: formData.userType,
        },
      }

      // Store email for admin review
      const emails = JSON.parse(localStorage.getItem("outgoing_emails") || "[]")
      emails.push({
        ...emailData,
        timestamp: new Date().toISOString(),
        status: "sent",
      })
      localStorage.setItem("outgoing_emails", JSON.stringify(emails))

      toast({
        title: "Registration successful!",
        description: "Your account has been created. Please check your email for verification.",
      })

      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/auth/login"
      }, 2000)
    } catch (error) {
      console.error("[v0] Registration error:", error)
      toast({
        title: "Registration error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back to home navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="dark:bg-gray-800 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Account</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Join NextStep Navigator and start your career journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                {errors.name && errors.name.length > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.name[0]}</p>
                )}
              </div>

              {/* Email input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                {errors.email && errors.email.length > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email[0]}</p>
                )}
              </div>

              {/* User type selection */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-gray-300">I am a:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("userType", "student")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === "student"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("userType", "professional")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === "professional"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Briefcase className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Professional</span>
                  </button>
                </div>
              </div>

              {/* Password input with strength indicator */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && errors.password.length > 0 && (
                  <div className="space-y-1">
                    {errors.password.map((error, index) => (
                      <p key={index} className="text-xs text-red-600 dark:text-red-400">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 dark:bg-gray-700 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && errors.confirmPassword.length > 0 && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword[0]}</p>
                )}
              </div>

              {/* Terms agreement checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-green-600 dark:text-green-400 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && errors.agreeToTerms.length > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.agreeToTerms[0]}</p>
              )}

              {/* Submit button */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-green-600 dark:text-green-400 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
