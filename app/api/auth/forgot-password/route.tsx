import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, code } = body

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 })
    }

    // Email data to send password reset code
    const emailData = {
      to: email,
      bcc: "farisatif7780@gmail.com", // Admin notification
      subject: "NextStep Navigator - Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NextStep Navigator</h1>
            <p style="color: white; margin: 5px 0 0 0;">Password Reset Request</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #333;">Password Reset Code</h2>
              <p>You requested a password reset for your NextStep Navigator account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; display: inline-block;">
                  <h3 style="margin: 0; color: #667eea; font-size: 24px; letter-spacing: 3px;">${code}</h3>
                  <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Your 6-digit verification code</p>
                </div>
              </div>
              
              <p><strong>Important:</strong></p>
              <ul style="color: #666;">
                <li>This code expires in 15 minutes</li>
                <li>Use this code only on the NextStep Navigator website</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/forgot-password" 
                   style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Reset Password
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                This email was sent from NextStep Navigator password reset system.<br>
                If you need help, contact our support team.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    // Log the email data (in production, this would be sent via email service)
    console.log("[v0] Password reset email data:", emailData)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      success: true,
      message: "Password reset code sent successfully",
    })
  } catch (error) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: "Failed to send password reset code. Please try again." }, { status: 500 })
  }
}
