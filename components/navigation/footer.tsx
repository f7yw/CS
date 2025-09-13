"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { validateNewsletterSubscription, sanitizeInput } from "@/lib/validation"

/**
 * Footer (Next.js) - Enhanced with comprehensive JSON schema validation
 * Features:
 *  - Real-time email validation with domain checking
 *  - Newsletter preferences and frequency options
 *  - Sanitized input handling for security
 *  - Comprehensive error handling and user feedback
 *  - Accessibility improvements with ARIA labels
 */

export function Footer() {
  const [email, setEmail] = useState("")
  const [preferences, setPreferences] = useState<string[]>(["career-tips"])
  const [frequency, setFrequency] = useState("weekly")
  const [status, setStatus] = useState<"" | "idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [showPreferences, setShowPreferences] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    // Validate using JSON schema
    const validationResult = validateNewsletterSubscription({
      email,
      preferences,
      frequency,
    })

    if (!validationResult.isValid) {
      setErrorMessage(validationResult.errors[0] || "Please check your email address")
      setStatus("error")
      return
    }

    setStatus("loading")
    try {
      // Simulate API call delay
      await new Promise((r) => setTimeout(r, 600))

      // Store subscription with preferences
      const existing = JSON.parse(localStorage.getItem("newsletter_subscribers") || "[]")
      const sanitizedEmail = validationResult.data.email

      // Check for existing subscription
      const existingIndex = existing.findIndex((sub: any) => sub.email === sanitizedEmail)

      const subscriptionData = {
        email: sanitizedEmail,
        preferences: validationResult.data.preferences,
        frequency: validationResult.data.frequency,
        subscribedAt: new Date().toISOString(),
        id: existingIndex >= 0 ? existing[existingIndex].id : Date.now(),
      }

      if (existingIndex >= 0) {
        // Update existing subscription
        existing[existingIndex] = subscriptionData
      } else {
        // Add new subscription
        existing.push(subscriptionData)
      }

      localStorage.setItem("newsletter_subscribers", JSON.stringify(existing))

      setStatus("success")
      setEmail("")
      setShowPreferences(false)

      // Reset to idle after confirmation
      setTimeout(() => setStatus("idle"), 4000)
    } catch (error) {
      console.error("[v0] Newsletter subscription error:", error)
      setErrorMessage("Subscription failed. Please try again.")
      setStatus("error")
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value)
    setEmail(sanitizedValue)

    // Clear error when user starts typing
    if (status === "error") {
      setStatus("idle")
      setErrorMessage("")
    }
  }

  const handlePreferenceToggle = (preference: string) => {
    setPreferences((prev) => (prev.includes(preference) ? prev.filter((p) => p !== preference) : [...prev, preference]))
  }

  const socialLinks = [
    { Icon: Facebook, href: "https://facebook.com/nextstepnavigator", label: "Facebook" },
    { Icon: Twitter, href: "https://twitter.com/nextstepnav", label: "Twitter" },
    { Icon: Linkedin, href: "https://linkedin.com/company/nextstep-navigator", label: "LinkedIn" },
    { Icon: Instagram, href: "https://instagram.com/nextstepnavigator", label: "Instagram" },
  ]

  const quickLinks = [
    { href: "/career-bank", label: "Career Bank" },
    { href: "/quiz", label: "Interest Quiz" },
    { href: "/multimedia", label: "Multimedia Guidance" },
    { href: "/stories", label: "Success Stories" },
    { href: "/resources", label: "Resource Library" },
  ]

  const supportLinks = [
    { href: "/contact", label: "Contact Us" },
    { href: "/about", label: "About Us" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/help", label: "Help Center" },
  ]

  const preferenceOptions = [
    { id: "career-tips", label: "Career Tips & Advice" },
    { id: "job-alerts", label: "Job Opportunities" },
    { id: "success-stories", label: "Success Stories" },
    { id: "industry-news", label: "Industry Updates" },
    { id: "events", label: "Events & Webinars" },
  ]

  return (
    <footer
      className="mt-auto"
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
      }}
      aria-labelledby="footer-heading"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent)" }}
                aria-hidden
              >
                <TrendingUp className="h-5 w-5" style={{ color: "var(--accent-foreground)" }} />
              </div>

              <span className="font-heading font-bold text-xl" id="footer-heading">
                NextStep Navigator
              </span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Empowering students, graduates, and professionals to discover their perfect career path through
              personalized guidance and comprehensive resources.
            </p>

            <div className="flex space-x-2" role="navigation" aria-label="social links">
              {socialLinks.map(({ Icon, href, label }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${label} page`}
                  className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-transform hover:scale-105"
                  style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold" style={{ color: "var(--accent)" }}>
              Quick Links
            </h3>

            <nav className="space-y-2 text-sm" aria-label="quick links">
              {quickLinks.map((link, idx) => (
                <Link key={idx} href={link.href} className="block">
                  <span
                    style={{ color: "var(--muted-foreground)" }}
                    className="transition-colors hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold" style={{ color: "var(--accent)" }}>
              Support
            </h3>

            <div className="space-y-2 text-sm">
              {supportLinks.map((link, idx) => (
                <Link key={idx} href={link.href} className="block">
                  <span
                    style={{ color: "var(--muted-foreground)" }}
                    className="transition-colors hover:text-[var(--foreground)]"
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info + Enhanced Newsletter */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold" style={{ color: "var(--accent)" }}>
              Get in Touch
            </h3>

            <div className="space-y-3 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>info@nextstepnavigator.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Career Street, Future City, FC 12345</span>
              </div>
            </div>

            {/* Enhanced Newsletter signup */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm" style={{ color: "var(--accent)" }}>
                  Stay Updated
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="text-xs px-2 py-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPreferences ? "Hide" : "Customize"}
                </Button>
              </div>

              {showPreferences && (
                <div
                  className="space-y-3 p-3 rounded-lg border"
                  style={{ borderColor: "var(--border)", background: "var(--card)" }}
                >
                  <div>
                    <label className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                      Content Preferences:
                    </label>
                    <div className="mt-2 space-y-1">
                      {preferenceOptions.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2 text-xs">
                          <input
                            type="checkbox"
                            checked={preferences.includes(option.id)}
                            onChange={() => handlePreferenceToggle(option.id)}
                            className="rounded"
                          />
                          <span style={{ color: "var(--muted-foreground)" }}>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                      Frequency:
                    </label>
                    <select
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="mt-1 w-full text-xs p-1 rounded border"
                      style={{
                        background: "var(--input)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 items-center">
                <label htmlFor="footer-email" className="sr-only">
                  Enter your email to subscribe to our newsletter
                </label>

                <Input
                  id="footer-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  className="text-sm"
                  style={{
                    background: "var(--input)",
                    color: "var(--card-foreground)",
                    border: `1px solid var(--accent)`,
                  }}
                  aria-label="Enter your email to subscribe"
                  aria-describedby="newsletter-status"
                  disabled={status === "loading"}
                />

                <Button
                  type="submit"
                  className="text-sm transition-all duration-200"
                  size="sm"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-foreground)",
                    opacity: status === "loading" ? 0.8 : 1,
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                  }}
                  disabled={status === "loading"}
                  aria-disabled={status === "loading"}
                >
                  {status === "loading" ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>

              {/* Enhanced live region for screen readers */}
              <div id="newsletter-status" aria-live="polite" aria-atomic="true" className="mt-1 min-h-[1.25rem]">
                {status === "success" && (
                  <div className="text-sm text-green-500 animate-fade-in" role="status">
                    ✓ Thanks! You're subscribed with {preferences.length} preference
                    {preferences.length !== 1 ? "s" : ""}.
                  </div>
                )}
                {status === "error" && errorMessage && (
                  <div className="text-sm text-red-500 animate-fade-in" role="alert">
                    ⚠ {errorMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div
          className="border-t mt-8 pt-8 text-center text-sm"
          style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
        >
          <p>
            &copy; {new Date().getFullYear()} NextStep Navigator. All rights reserved. Built with passion for career
            guidance and powered by comprehensive validation systems.
          </p>
        </div>
      </div>
    </footer>
  )
}
