import { type NextRequest, NextResponse } from "next/server"
import { validateEmail, sanitizeInput } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const sanitizedEmail = sanitizeInput(email)

    // Check if user exists (in production, query database)
    const mockUsers = [{ email: "demo@nextstepnavigator.com", name: "Demo User" }]

    const user = mockUsers.find((u) => u.email === sanitizedEmail)
    if (!user) {
      // Don't reveal if user exists for security
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a reset code.",
      })
    }

    // Generate 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store reset request (in production, save to database with expiration)
    const resetRequest = {
      email: sanitizedEmail,
      code: resetCode,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false,
    }

    // Send reset code via email
    await sendPasswordResetEmail(sanitizedEmail, resetCode)

    return NextResponse.json({
      success: true,
      message: "Password reset code sent to your email",
    })
  } catch (error) {
    console.error("[v0] Password reset API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendPasswordResetEmail(email: string, code: string) {
  console.log(`[v0] Sending password reset code ${code} to ${email}`)

  // Send notification to admin email
  const emailData = {
    to: "farisatif7780@gmail.com",
    subject: `Password Reset Request - ${email}`,
    html: `
      <h2>Password Reset Request</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Reset Code:</strong> ${code}</p>
      <p><strong>Expires:</strong> ${new Date(Date.now() + 15 * 60 * 1000).toLocaleString()}</p>
      <p>This code will expire in 15 minutes.</p>
    `,
  }

  return Promise.resolve(emailData)
}
