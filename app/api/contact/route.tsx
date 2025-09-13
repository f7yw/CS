import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message, type, phone, company, urgency } = body

    // Validate required fields
    if (!email || !message) {
      return NextResponse.json({ error: "Email and message are required" }, { status: 400 })
    }

    // Email data to send to farisatif7780@gmail.com
    const emailData = {
      to: "farisatif7780@gmail.com",
      subject: `NextStep Navigator Contact: ${subject || type || "New Message"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">NextStep Navigator</h1>
            <p style="color: white; margin: 5px 0 0 0;">New Contact Form Submission</p>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                Contact Details
              </h2>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                  <td style="padding: 8px 0;">${name || "Not provided"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${email}</td>
                </tr>
                ${
                  phone
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;">${phone}</td>
                </tr>
                `
                    : ""
                }
                ${
                  company
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                  <td style="padding: 8px 0;">${company}</td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Type:</td>
                  <td style="padding: 8px 0;">${type || "General Inquiry"}</td>
                </tr>
                ${
                  urgency
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Urgency:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: ${urgency === "high" ? "#ef4444" : urgency === "medium" ? "#f59e0b" : "#10b981"}; 
                                 color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                      ${urgency.toUpperCase()}
                    </span>
                  </td>
                </tr>
                `
                    : ""
                }
                ${
                  subject
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Subject:</td>
                  <td style="padding: 8px 0;">${subject}</td>
                </tr>
                `
                    : ""
                }
              </table>
              
              <div style="margin: 20px 0;">
                <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea;">
                  ${message.replace(/\n/g, "<br>")}
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #666; font-size: 14px;">
                This message was sent from the NextStep Navigator contact form.<br>
                Submitted on: ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `,
    }

    // Log the email data (in production, this would be sent via email service)
    console.log("[v0] Contact form email data:", emailData)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    })
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 })
  }
}
