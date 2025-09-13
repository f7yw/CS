"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Shield, CheckCircle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { validateEmail, sanitizeInput } from "@/lib/validation"

export default function ForgotPasswordPage() {
  // Form state for password reset process
  const [step, setStep] = useState<"email" | "code" | "reset">("email")
  const [formData, setFormData] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  })

  // UI state management
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generatedCode, setGeneratedCode] = useState("")

  const { toast } = useToast()

  // Handle input changes with validation
  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  // Generate and send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email address
    const emailValidation = validateEmail(formData.email)
    if (!emailValidation.isValid) {
      setErrors({ email: emailValidation.errors[0] })
      return
    }

    setIsLoading(true)

    try {
      // Check if user exists in our system
      const storedUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const user = storedUsers.find((u: any) => u.email === formData.email)

      if (!user) {
        toast({
          title: "Email not found",
          description: "No account found with this email address.",
          variant: "destructive",
        })
        return
      }

      // Generate 6-digit verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      setGeneratedCode(code)

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reset code")
      }

      // Store password reset request
      const resetRequests = JSON.parse(localStorage.getItem("password_reset_requests") || "[]")
      resetRequests.push({
        email: formData.email,
        code: code,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        used: false,
      })
      localStorage.setItem("password_reset_requests", JSON.stringify(resetRequests))

      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit verification code.",
      })

      setStep("code")
    } catch (error) {
      console.error("[v0] Password reset error:", error)
      toast({
        title: "Error sending code",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Verify the reset code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.resetCode || formData.resetCode.length !== 6) {
      setErrors({ resetCode: "Please enter the 6-digit verification code" })
      return
    }

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if code is valid and not expired
      const resetRequests = JSON.parse(localStorage.getItem("password_reset_requests") || "[]")
      const request = resetRequests.find(
        (r: any) =>
          r.email === formData.email && r.code === formData.resetCode && !r.used && new Date(r.expiresAt) > new Date(),
      )

      if (!request) {
        toast({
          title: "Invalid code",
          description: "The verification code is invalid or has expired.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Code verified!",
        description: "Please enter your new password.",
      })

      setStep("reset")
    } catch (error) {
      console.error("[v0] Code verification error:", error)
      toast({
        title: "Verification error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Reset password with new credentials
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate new password
    if (formData.newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters long" })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          code: formData.resetCode,
          newPassword: formData.newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      // Update user password in storage
      const storedUsers = JSON.parse(localStorage.getItem("registered_users") || "[]")
      const userIndex = storedUsers.findIndex((u: any) => u.email === formData.email)

      if (userIndex !== -1) {
        storedUsers[userIndex].password = formData.newPassword
        storedUsers[userIndex].passwordUpdatedAt = new Date().toISOString()
        localStorage.setItem("registered_users", JSON.stringify(storedUsers))

        // Mark reset request as used
        const resetRequests = JSON.parse(localStorage.getItem("password_reset_requests") || "[]")
        const requestIndex = resetRequests.findIndex(
          (r: any) => r.email === formData.email && r.code === formData.resetCode,
        )
        if (requestIndex !== -1) {
          resetRequests[requestIndex].used = true
          resetRequests[requestIndex].usedAt = new Date().toISOString()
          localStorage.setItem("password_reset_requests", JSON.stringify(resetRequests))
        }

        toast({
          title: "Password reset successful!",
          description: "Your password has been updated. You can now sign in with your new password.",
        })

        // Redirect to login page
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 2000)
      }
    } catch (error) {
      console.error("[v0] Password reset error:", error)
      toast({
        title: "Reset error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back navigation */}
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading font-bold">
              {step === "email" && "Reset Your Password"}
              {step === "code" && "Enter Verification Code"}
              {step === "reset" && "Create New Password"}
            </CardTitle>
            <CardDescription>
              {step === "email" && "Enter your email address to receive a verification code"}
              {step === "code" && "We've sent a 6-digit code to your email"}
              {step === "reset" && "Enter your new password below"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Step 1: Email input */}
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-4">
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
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Sending Code..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {/* Step 2: Code verification */}
            {step === "code" && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetCode">Verification Code</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetCode"
                      type="text"
                      value={formData.resetCode}
                      onChange={(e) => handleInputChange("resetCode", e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="pl-10 text-center text-lg tracking-widest bg-background"
                      maxLength={6}
                      required
                    />
                  </div>
                  {errors.resetCode && <p className="text-sm text-destructive">{errors.resetCode}</p>}
                  <p className="text-xs text-muted-foreground text-center">Code expires in 15 minutes</p>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button type="button" variant="outline" onClick={() => setStep("email")} className="w-full">
                  Resend Code
                </Button>
              </form>
            )}

            {/* Step 3: Password reset */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    className="bg-background"
                    required
                  />
                  {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-background"
                    required
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
