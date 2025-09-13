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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "student",
    agreeToTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const { toast } = useToast()

  const handleInputChange = (field: string, value: string | boolean) => {
    if (typeof value === "string") {
      value = sanitizeInput(value)
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }))
    }
  }

  const validateForm = () => {
    const validationResult = validateUserRegistration(formData)
    if (formData.password !== formData.confirmPassword) {
      validationResult.errors.push("Passwords do not match")
      validationResult.isValid = false
    }
    const fieldErrors: Record<string, string[]> = {}
    validationResult.errors.forEach((error) => {
      const [field, message] = error.includes(":") ? error.split(": ") : ["general", error]
      if (!fieldErrors[field]) fieldErrors[field] = []
      fieldErrors[field].push(message || error)
    })
    setErrors(fieldErrors)
    return validationResult.isValid
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
      await new Promise((resolve) => setTimeout(resolve, 2000))
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
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        registrationDate: new Date().toISOString(),
        isVerified: false,
      }
      storedUsers.push(newUser)
      localStorage.setItem("registered_users", JSON.stringify(storedUsers))
      const emailData = {
        to: formData.email,
        subject: "Welcome to NextStep Navigator!",
        template: "welcome",
        data: {
          name: formData.name,
          userType: formData.userType,
        },
      }
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
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="shadow-xl border border-border dark:border-border bg-card dark:bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">Create Your Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Join NextStep Navigator and start your career journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.name && errors.name.length > 0 && (
                  <p className="text-sm text-destructive">{errors.name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="pl-10"
                    required
                  />
                </div>
                {errors.email && errors.email.length > 0 && (
                  <p className="text-sm text-destructive">{errors.email[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">I am a:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("userType", "student")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === "student"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium text-foreground">Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("userType", "professional")}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === "professional"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-muted"
                    }`}
                  >
                    <Briefcase className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <span className="text-sm font-medium text-foreground">Professional</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && errors.password.length > 0 && (
                  <div className="space-y-1">
                    {errors.password.map((error, index) => (
                      <p key={index} className="text-xs text-destructive">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && errors.confirmPassword.length > 0 && (
                  <p className="text-sm text-destructive">{errors.confirmPassword[0]}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>
              {errors.agreeToTerms && errors.agreeToTerms.length > 0 && (
                <p className="text-sm text-destructive">{errors.agreeToTerms[0]}</p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
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
