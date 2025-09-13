import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code, newPassword } = body

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, verification code, and new password are required" }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // In a real app, verify the code against stored codes
    // For demo purposes, accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Invalid verification code format" }, { status: 400 })
    }

    // Simulate password reset process
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Send confirmation email
    const emailData = {
      to: email,
      subject: "NextStep Navigator - Password Reset Successful",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NextStep Navigator</h1>
            <p style="color: white; margin: 5px 0 0 0;">Password Reset Successful</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">Your password has been reset successfully!</h2>
              <p>You can now log in to your NextStep Navigator account with your new password.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/login" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Login to Your Account
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                If you didn't request this password reset, please contact our support team immediately.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    console.log("[!] Password reset confirmation email:", emailData)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    })
  } catch (error) {
    console.error("[!] Password reset error:", error)
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 })
  }
}
