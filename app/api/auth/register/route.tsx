import { type NextRequest, NextResponse } from "next/server"
import { validateUserRegistration, sanitizeInput } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, userType, agreeToTerms } = body

    // Validate registration data
    const validationResult = validateUserRegistration({
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      password: sanitizeInput(password),
      confirmPassword: sanitizeInput(password),
      userType: sanitizeInput(userType),
      agreeToTerms,
    })

    if (!validationResult.isValid) {
      return NextResponse.json({ error: "Validation failed", details: validationResult.errors }, { status: 400 })
    }

    // Check if user already exists (in production, query database)
    const existingUsers = [{ email: "demo@nextstepnavigator.com" }]

    if (existingUsers.some((u) => u.email === email)) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Create new user (in production, save to database with hashed password)
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      userType: sanitizeInput(userType),
      isVerified: false,
      createdAt: new Date().toISOString(),
    }

    // Send welcome email (integrate with actual email service)
    await sendWelcomeEmail(newUser.email, newUser.name)

    return NextResponse.json({
      success: true,
      user: newUser,
      message: "Registration successful. Please check your email for verification.",
    })
  } catch (error) {
    console.error("[!] Registration API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function sendWelcomeEmail(email: string, name: string) {
  // In production, integrate with Resend, SendGrid, or Nodemailer
  console.log(`[!] Sending welcome email to ${email} for ${name}`)

  // Simulate email sending to admin
  const emailData = {
    to: "farisatif7780@gmail.com",
    subject: `New User Registration - ${name}`,
    html: `
      <h2>New User Registered</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
    `,
  }

  // Store for admin notification
  return Promise.resolve(emailData)
}
