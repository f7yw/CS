"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, GraduationCap, Briefcase } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { sanitizeInput } from "@/lib/validation"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

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

  const handleInputChange = (field: string, value: string | boolean) => {
    const v = typeof value === "string" ? sanitizeInput(value) : value
    setFormData((prev) => ({ ...prev, [field]: v }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: [] }))
    if (errors.general) setErrors((prev) => ({ ...prev, general: [] }))
  }

  const runClientValidation = (data: typeof formData) => {
    const fieldErrors: Record<string, string[]> = {}

    // name
    if (!data.name || data.name.trim().length < 2) {
      fieldErrors.name = ["Please enter your full name (at least 2 characters)."]
    }

    // email (simple robust check)
    const email = (data.email || "").trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      fieldErrors.email = ["Please enter a valid email address."]
    }

    // password rules
    const pw = data.password || ""
    const confirm = data.confirmPassword || ""
    const pwErrors: string[] = []
    if (pw.length < 8) pwErrors.push("Password must be at least 8 characters long.")
    if (!/[a-z]/.test(pw)) pwErrors.push("Password must contain at least one lowercase letter.")
    if (!/[A-Z]/.test(pw)) pwErrors.push("Password must contain at least one uppercase letter.")
    if (!/[0-9]/.test(pw)) pwErrors.push("Password must contain at least one digit.")
    if (!/[!@#$%^&*()_\-+={}[\]|\\;:'\"<>,.?/~`]/.test(pw)) pwErrors.push("Password must contain at least one special character.")
    if (pwErrors.length) fieldErrors.password = pwErrors

    // confirm password
    if (confirm !== pw) {
      fieldErrors.confirmPassword = ["Passwords do not match."]
    }

    // agree to terms
    if (!data.agreeToTerms) {
      fieldErrors.agreeToTerms = ["You must agree to the terms."]
    }

    const isValid = Object.keys(fieldErrors).length === 0
    return { isValid, fieldErrors }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const normalizedEmail = (formData.email || "").trim().toLowerCase()
    const normalized: typeof formData = {
      ...formData,
      email: normalizedEmail,
    }

    const clientValidation = runClientValidation(normalized)
    if (!clientValidation.isValid) {
      setErrors(clientValidation.fieldErrors)
      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 700))

      let storedUsers: any[] = []
      try {
        const raw = localStorage.getItem("registered_users")
        storedUsers = raw ? JSON.parse(raw) : []
        if (!Array.isArray(storedUsers)) storedUsers = []
      } catch (err) {
        console.error("Failed parsing registered_users:", err)
        storedUsers = []
      }

      const existingUser = storedUsers.find(
        (u: any) => (u.email || "").toString().trim().toLowerCase() === normalizedEmail
      )
      if (existingUser) {
        setErrors((prev) => ({ ...prev, email: ["An account with this email already exists."] }))
        toast({
          title: "Registration failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: normalized.name,
        email: normalizedEmail,
        password: normalized.password,
        userType: normalized.userType,
        registrationDate: new Date().toISOString(),
        isVerified: false,
      }

      storedUsers.push(newUser)
      try {
        localStorage.setItem("registered_users", JSON.stringify(storedUsers))
      } catch (err) {
        console.error("Failed saving registered_users:", err)
        toast({
          title: "Registration error",
          description: "Could not save user data locally. Please check browser storage settings.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // emulate sending welcome email by storing outgoing_emails
      try {
        const rawEmails = localStorage.getItem("outgoing_emails")
        const emails = rawEmails ? JSON.parse(rawEmails) : []
        const emailData = {
          to: normalizedEmail,
          subject: "Welcome to NextStep Navigator!",
          template: "welcome",
          data: { name: normalized.name, userType: normalized.userType },
          timestamp: new Date().toISOString(),
          status: "sent",
        }
        const out = Array.isArray(emails) ? emails : []
        out.push(emailData)
        localStorage.setItem("outgoing_emails", JSON.stringify(out))
      } catch (err) {
        console.error("Failed saving outgoing_emails:", err)
      }

      toast({
        title: "Registration successful!",
        description: "Your account has been created. Redirecting to sign-in...",
      })

      router.push("/auth/login?registered=1&success=1")
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
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
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
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 w-full rounded-md h-10 border border-border bg-transparent"
                    required
                    aria-describedby="password-requirements"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p id="password-requirements" className="text-xs text-muted-foreground">
                  Password must be at least 8 characters and include lowercase, uppercase, number & special character.
                </p>
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
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 w-full rounded-md h-10 border border-border bg-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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

              {errors.general && errors.general.length > 0 && (
                <p className="text-sm text-destructive">{errors.general[0]}</p>
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
