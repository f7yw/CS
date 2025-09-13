"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { validateContactForm, sanitizeInput } from "@/lib/validation"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationResult = validateContactForm(formData)

    if (!validationResult.isValid) {
      const errors: Record<string, string[]> = {}
      validationResult.errors.forEach((error) => {
        const [field, message] = error.split(": ")
        if (!errors[field]) errors[field] = []
        errors[field].push(message || error)
      })
      setFieldErrors(errors)

      toast({
        title: "Validation Error",
        description: "Please fix the errors below and try again.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const submissions = JSON.parse(localStorage.getItem("contact_submissions") || "[]")
      const submission = {
        ...validationResult.data,
        timestamp: new Date().toISOString(),
        id: Date.now(),
      }
      submissions.push(submission)
      localStorage.setItem("contact_submissions", JSON.stringify(submissions))

      const emailData = {
        to: "farisatif7780@gmail.com",
        subject: `New Contact Form Submission - ${formData.subject}`,
        template: "contact-form",
        data: {
          name: validationResult.data.name,
          email: validationResult.data.email,
          category: validationResult.data.category,
          subject: validationResult.data.subject,
          message: validationResult.data.message,
          timestamp: new Date().toLocaleString(),
        },
      }

      const emails = JSON.parse(localStorage.getItem("outgoing_emails") || "[]")
      emails.push({
        ...emailData,
        timestamp: new Date().toISOString(),
        status: "sent",
        type: "contact_form",
      })
      localStorage.setItem("outgoing_emails", JSON.stringify(emails))

      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. We'll get back to you within 24 hours.",
      })

      setFormData({ name: "", email: "", subject: "", message: "", category: "general" })
    } catch (error) {
      console.error("[v0] Contact form submission error:", error)
      toast({
        title: "Submission failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const sanitizedValue = sanitizeInput(value)

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }))

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: [],
      }))
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground dark:text-foreground-dark mb-4">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground dark:text-muted-foreground-dark max-w-3xl mx-auto">
            Have questions about your career path? Need guidance or support? We're here to help you navigate your next
            steps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left info cards */}
          <div className="space-y-8">
            {/* Contact Info Card */}
            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-foreground dark:text-foreground-dark">
                  <MessageSquare className="h-5 w-5 text-primary dark:text-primary-dark" />
                  <span>Get in Touch</span>
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
                  Reach out to our career guidance team for personalized support and advice.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary dark:text-primary-dark mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Email</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground-dark">
                      support@nextstepnavigator.com
                    </p>
                    <p className="text-sm text-muted-foreground-dark">We typically respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-primary dark:text-primary-dark mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Phone</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground-dark">+1 (555) 123-4567</p>
                    <p className="text-sm text-muted-foreground-dark">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary dark:text-primary-dark mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Office</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground-dark">
                      123 Career Avenue
                      <br />
                      Suite 456
                      <br />
                      New York, NY 10001
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary dark:text-primary-dark mt-1" />
                  <div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Office Hours</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground-dark">
                      Monday - Friday: 9:00 AM - 6:00 PM
                      <br />
                      Saturday: 10:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-foreground-dark">Find Us</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
                  Visit our office for in-person career counseling sessions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878459418!3d40.74844097932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sNew%20York%2C%20NY%2010001%2C%20USA!5e0!3m2!1sen!2s!4v1635959542742!5m2!1sen!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right form and team */}
          <div className="space-y-8">
            {/* Contact Form */}
            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-foreground-dark">Send us a Message</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        className="dark:bg-card-dark dark:text-foreground-dark"
                        aria-describedby={fieldErrors.name?.length ? "name-error" : undefined}
                      />
                      {fieldErrors.name && fieldErrors.name.length > 0 && (
                        <div id="name-error" className="mt-1 text-sm text-destructive dark:text-destructive-dark">
                          {fieldErrors.name[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        className="dark:bg-card-dark dark:text-foreground-dark"
                        aria-describedby={fieldErrors.email?.length ? "email-error" : undefined}
                      />
                      {fieldErrors.email && fieldErrors.email.length > 0 && (
                        <div id="email-error" className="mt-1 text-sm text-destructive dark:text-destructive-dark">
                          {fieldErrors.email[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full h-11 px-3 rounded-md border border-border bg-background dark:bg-card-dark dark:text-foreground-dark"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="career-guidance">Career Guidance</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="partnership">Partnership</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="dark:bg-card-dark dark:text-foreground-dark"
                      aria-describedby={fieldErrors.subject?.length ? "subject-error" : undefined}
                    />
                    {fieldErrors.subject && fieldErrors.subject.length > 0 && (
                      <div id="subject-error" className="mt-1 text-sm text-destructive dark:text-destructive-dark">
                        {fieldErrors.subject[0]}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground-dark mb-2">
                      Message * <span className="text-xs text-muted-foreground dark:text-muted-foreground-dark">({formData.message.length}/1000)</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px] dark:bg-card-dark dark:text-foreground-dark"
                      maxLength={1000}
                      aria-describedby={fieldErrors.message?.length ? "message-error" : undefined}
                    />
                    {fieldErrors.message && fieldErrors.message.length > 0 && (
                      <div id="message-error" className="mt-1 text-sm text-destructive dark:text-destructive-dark">
                        {fieldErrors.message[0]}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary-hover-dark" disabled={isSubmitting}>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Team Card */}
            <Card className="bg-card dark:bg-card-dark">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-foreground-dark">Our Team</CardTitle>
                <CardDescription className="text-muted-foreground dark:text-muted-foreground-dark">
                  Meet the career guidance experts behind NextStep Navigator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary dark:text-primary-dark font-semibold text-lg">DR</span>
                    </div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Dr. Sarah Rodriguez</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">Career Counselor</p>
                    <p className="text-sm text-muted-foreground-dark">sarah@nextstepnavigator.com</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary-light dark:bg-primary-dark rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary dark:text-primary-dark font-semibold text-lg">MJ</span>
                    </div>
                    <h3 className="font-medium text-foreground dark:text-foreground-dark">Michael Johnson</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark">Industry Specialist</p>
                    <p className="text-sm text-muted-foreground-dark">michael@nextstepnavigator.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
