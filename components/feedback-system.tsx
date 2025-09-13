"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Send, MessageSquare, ThumbsUp, Bug, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sanitizeInput } from "@/lib/validation"

interface FeedbackSystemProps {
  className?: string
}

export default function FeedbackSystem({ className }: FeedbackSystemProps) {
  // Feedback form state management
  const [feedbackData, setFeedbackData] = useState({
    type: "general", // general, bug, feature, improvement
    rating: 0,
    message: "",
  })

  // UI state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const { toast } = useToast()

  // Get current user data for feedback attribution
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("current_user") || "null")
    } catch {
      return null
    }
  }

  // Handle feedback type selection
  const handleTypeChange = (type: string) => {
    setFeedbackData((prev) => ({ ...prev, type }))
  }

  // Handle star rating selection
  const handleRatingChange = (rating: number) => {
    setFeedbackData((prev) => ({ ...prev, rating }))
  }

  // Handle message input with sanitization
  const handleMessageChange = (message: string) => {
    const sanitizedMessage = sanitizeInput(message)
    setFeedbackData((prev) => ({ ...prev, message: sanitizedMessage }))
  }

  // Submit feedback with email notification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate feedback data
    if (!feedbackData.message.trim()) {
      toast({
        title: "Message required",
        description: "Please provide your feedback message.",
        variant: "destructive",
      })
      return
    }

    if (feedbackData.message.trim().length < 10) {
      toast({
        title: "Message too short",
        description: "Please provide at least 10 characters of feedback.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const currentUser = getCurrentUser()
      const timestamp = new Date().toISOString()

      // Create feedback record
      const feedbackRecord = {
        id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: feedbackData.type,
        rating: feedbackData.rating,
        message: feedbackData.message.trim(),
        user: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            }
          : {
              id: "anonymous",
              name: "Anonymous User",
              email: "anonymous@nextstepnavigator.com",
            },
        timestamp,
        status: "new",
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      }

      // Store feedback locally
      const feedbacks = JSON.parse(localStorage.getItem("user_feedback") || "[]")
      feedbacks.push(feedbackRecord)
      localStorage.setItem("user_feedback", JSON.stringify(feedbacks))

      // Prepare email notification to admin
      const emailData = {
        to: "farisatif7780@gmail.com",
        subject: `New ${feedbackData.type} Feedback - NextStep Navigator`,
        template: "feedback",
        data: {
          feedbackType: feedbackData.type.charAt(0).toUpperCase() + feedbackData.type.slice(1),
          rating: feedbackData.rating,
          userName: feedbackRecord.user.name,
          userEmail: feedbackRecord.user.email,
          feedbackMessage: feedbackData.message,
          timestamp: new Date(timestamp).toLocaleString(),
        },
      }

      // Store email for sending
      const emails = JSON.parse(localStorage.getItem("outgoing_emails") || "[]")
      emails.push({
        ...emailData,
        timestamp,
        status: "sent",
        type: "feedback_notification",
      })
      localStorage.setItem("outgoing_emails", JSON.stringify(emails))

      // Simulate email sending delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Feedback submitted!",
        description: "Thank you for your feedback. We'll review it and get back to you if needed.",
      })

      // Reset form
      setFeedbackData({
        type: "general",
        rating: 0,
        message: "",
      })
    } catch (error) {
      console.error(" !  Feedback submission error:", error)
      toast({
        title: "Submission failed",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Feedback type options with icons
  const feedbackTypes = [
    { id: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-600" },
    { id: "bug", label: "Report Bug", icon: Bug, color: "text-red-600" },
    { id: "feature", label: "Feature Request", icon: Lightbulb, color: "text-yellow-600" },
    { id: "improvement", label: "Improvement", icon: ThumbsUp, color: "text-green-600" },
  ]

  return (
    <Card className={`dark:bg-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>Share Your Feedback</span>
        </CardTitle>
        <CardDescription className="dark:text-gray-300">
          Help us improve NextStep Navigator by sharing your thoughts and suggestions.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback type selection */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">What type of feedback is this?</Label>
            <div className="grid grid-cols-2 gap-3">
              {feedbackTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeChange(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      feedbackData.type === type.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${type.color}`} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Rating system */}
          <div className="space-y-3">
            <Label className="text-gray-700 dark:text-gray-300">How would you rate your overall experience?</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= (hoveredRating || feedbackData.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              {feedbackData.rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{feedbackData.rating}/5 stars</span>
              )}
            </div>
          </div>

          {/* Feedback message */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-gray-700 dark:text-gray-300">
              Your Feedback
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({feedbackData.message.length}/500)</span>
            </Label>
            <Textarea
              id="feedback-message"
              value={feedbackData.message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder="Tell us what you think, what could be improved, or report any issues you've encountered..."
              className="min-h-[100px] dark:bg-gray-700 dark:text-white"
              maxLength={500}
              required
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting || !feedbackData.message.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Submitting Feedback..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
