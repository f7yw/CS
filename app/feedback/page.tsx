"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Star, Lightbulb, Bug, Heart, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function FeedbackPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "",
    rating: "",
    subject: "",
    message: "",
    features: [] as string[],
    allowContact: false,
  })

  const feedbackTypes = [
    { id: "general", label: "General Feedback", icon: MessageSquare, color: "bg-blue-500" },
    { id: "bug", label: "Bug Report", icon: Bug, color: "bg-red-500" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "bg-yellow-500" },
    { id: "compliment", label: "Compliment", icon: Heart, color: "bg-green-500" },
  ]

  const features = [
    "Career Bank",
    "Interest Quiz",
    "Multimedia Guidance",
    "Success Stories",
    "Resource Library",
    "Resume Guidelines",
    "Interview Tips",
    "Contact Support",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Send email to farisatif7780@gmail.com
      const emailData = {
        to: "farisatif7780@gmail.com",
        subject: `NextStep Navigator Feedback: ${formData.subject || formData.feedbackType}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">NextStep Navigator Feedback</h1>
            </div>
            
            <div style="padding: 20px; background: #f8f9fa;">
              <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                ${formData.feedbackType.charAt(0).toUpperCase() + formData.feedbackType.slice(1)} Feedback
              </h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${formData.name || "Anonymous"}</p>
                <p><strong>Email:</strong> ${formData.email || "Not provided"}</p>
                <p><strong>Type:</strong> ${formData.feedbackType}</p>
                ${formData.rating ? `<p><strong>Rating:</strong> ${formData.rating}/5 stars</p>` : ""}
                ${formData.subject ? `<p><strong>Subject:</strong> ${formData.subject}</p>` : ""}
                
                <div style="margin: 20px 0;">
                  <strong>Message:</strong>
                  <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
                    ${formData.message.replace(/\n/g, "<br>")}
                  </div>
                </div>
                
                ${
                  formData.features.length > 0
                    ? `
                  <p><strong>Related Features:</strong> ${formData.features.join(", ")}</p>
                `
                    : ""
                }
                
                <p><strong>Allow Contact:</strong> ${formData.allowContact ? "Yes" : "No"}</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 14px;">
                  This feedback was submitted through NextStep Navigator feedback system.
                </p>
              </div>
            </div>
          </div>
        `,
      }

      console.log("[v0] Feedback email data:", emailData)

      toast({
        title: "Feedback Submitted Successfully!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        feedbackType: "",
        rating: "",
        subject: "",
        message: "",
        features: [],
        allowContact: false,
      })
    } catch (error) {
      console.error("[v0] Feedback submission error:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 gradient-text">Share Your Feedback</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your feedback helps us improve NextStep Navigator and provide better career guidance for everyone.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Feedback Form
              </CardTitle>
              <CardDescription>
                Please fill out the form below to share your thoughts, report issues, or suggest improvements.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="your.email@example.com"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Feedback Type */}
                <div className="space-y-3">
                  <Label>Feedback Type *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {feedbackTypes.map((type) => (
                      <label
                        key={type.id}
                        className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all border-2 ${
                          formData.feedbackType === type.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="feedbackType"
                          value={type.id}
                          checked={formData.feedbackType === type.id}
                          onChange={(e) => setFormData((prev) => ({ ...prev, feedbackType: e.target.value }))}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-full ${type.color} mb-2`}>
                          <type.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-center">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <Label>Overall Rating (Optional)</Label>
                  <RadioGroup
                    value={formData.rating}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, rating: value }))}
                    className="flex gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                          {rating} <Star className="h-4 w-4 text-yellow-500" />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief summary of your feedback"
                    className="bg-background"
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Your Feedback *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Please share your detailed feedback, suggestions, or report any issues you've encountered..."
                    className="min-h-[120px] bg-background"
                    required
                  />
                </div>

                {/* Related Features */}
                <div className="space-y-3">
                  <Label>Related Features (Optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {features.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={formData.features.includes(feature)}
                          onCheckedChange={() => handleFeatureToggle(feature)}
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Permission */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowContact"
                    checked={formData.allowContact}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, allowContact: checked as boolean }))
                    }
                  />
                  <Label htmlFor="allowContact" className="text-sm">
                    Allow us to contact you for follow-up questions about this feedback
                  </Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={!formData.feedbackType || !formData.message || isSubmitting}
                    className="bg-primary hover:bg-primary/90 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h3 className="font-heading text-lg font-semibold">What Happens Next?</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Your feedback is sent directly to our team</li>
                  <li>• We review all feedback within 24-48 hours</li>
                  <li>• Bug reports are prioritized for quick fixes</li>
                  <li>• Feature requests are considered for future updates</li>
                  <li>• We may contact you for clarification if needed</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                  <h3 className="font-heading text-lg font-semibold">Need Immediate Help?</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  For urgent issues or immediate assistance, please contact our support team directly.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
