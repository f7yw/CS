import { type NextRequest, NextResponse } from "next/server"
import { validateEmail, sanitizeInput } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input data
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: "Invalid email format", details: emailValidation.errors }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    // In production, this would query a real database
    // For now, we'll simulate with a mock user database
    const mockUsers = [
      {
        id: "user_1",
        name: "Demo User",
        email: "demo@nextstepnavigator.com",
        password: "demo123", // In production, this would be hashed
        userType: "student",
        isVerified: true,
      },
    ]

    // Find user by email and verify password
    const user = mockUsers.find((u) => u.email === sanitizedEmail && u.password === sanitizedPassword)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token (simplified for demo)
    const token = `jwt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create response with user data (excluding password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("[!] Login API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
