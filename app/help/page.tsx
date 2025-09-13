"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  HelpCircle,
  Search,
  Book,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FAQ {
  question: string
  answer: string
  category: string
}

export default function HelpPage(): JSX.Element {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

  // === FAQ data ===
  const faqs: FAQ[] = [
    {
      question: "How do I get started with NextStep Navigator?",
      answer:
        "Simply visit our homepage and select your user type (Student, Graduate, or Professional). This will personalize your experience and show relevant content for your career stage.",
      category: "Getting Started",
    },
    {
      question: "How does the Interest Quiz work?",
      answer:
        "The Interest Quiz asks you questions about your preferences, skills, and interests. Based on your responses, it provides personalized career recommendations that match your profile.",
      category: "Features",
    },
    {
      question: "Can I save careers and resources for later?",
      answer:
        "Yes! You can bookmark any career profile, resource, or success story. Your bookmarks are saved locally and you can add personal notes to each item.",
      category: "Features",
    },
    {
      question: "Is NextStep Navigator free to use?",
      answer:
        "Yes, NextStep Navigator is completely free to use. All our career guidance resources, quizzes, and tools are available at no cost.",
      category: "Account",
    },
    {
      question: "How accurate are the career recommendations?",
      answer:
        "Our recommendations are based on established career assessment principles and industry data. However, they should be used as guidance alongside professional career counseling.",
      category: "Career Guidance",
    },
    {
      question: "Can I export my bookmarks and notes?",
      answer:
        "Yes, you can export your bookmarks and personal notes as a JSON file from the bookmarks page. This allows you to keep a backup of your saved items.",
      category: "Features",
    },
    {
      question: "What if I'm unsure about my career path?",
      answer:
        "That's perfectly normal! Start with our Interest Quiz, explore different career profiles, and read success stories. Consider speaking with a career counselor for personalized guidance.",
      category: "Career Guidance",
    },
    {
      question: "How often is the career information updated?",
      answer:
        "We regularly update our career profiles, salary information, and industry trends to ensure you have access to current and relevant information.",
      category: "Content",
    },
  ]

  const toggleItem = (question: string) => {
    setOpenItems((prev) => (prev.includes(question) ? prev.filter((p) => p !== question) : [...prev, question]))
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = Array.from(new Set(faqs.map((f) => f.category)))

  // === Button handlers (wired to pages) ===
  const handleViewGuide = () => router.push("/getting-started") // ensure page exists
  const handleContactPage = () => router.push("/contact")
  const handleEmailSupport = () => (window.location.href = "mailto:support@nextstepnavigator.com")
  const handleLiveChat = () => router.push("/support/chat") // ensure page exists or replace with your chat path

  // helper to set search to category and scroll to results
  const applyCategoryFilter = (category: string) => {
    setSearchTerm(category)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // accessible ref for input (optional)
  const inputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    // If you want to auto-focus search when arriving with query, do it here
    // if (router.query?.q) inputRef.current?.focus()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions and get the help you need to make the most of NextStep Navigator.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              id="help-search"
              ref={inputRef as any}
              aria-label="Search help topics"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: quick cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-primary" />
                  <span>Getting Started Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  New to NextStep Navigator? Learn the basics and get up to speed quickly.
                </p>
                <Button variant="secondary" size="sm" className="w-full" onClick={handleViewGuide}>
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>Contact Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>support@nextstepnavigator.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <span> +974 (778) 88098</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" onClick={handleContactPage}>
                    Contact Page
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleEmailSupport}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle>Browse by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left hover:text-primary"
                      onClick={() => applyCategoryFilter(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column: FAQ list */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <div className="flex items-start justify-between w-full">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <HelpCircle className="h-6 w-6 text-primary" />
                      <span>Frequently Asked Questions</span>
                    </CardTitle>
                    <CardDescription>
                      {searchTerm
                        ? `Showing ${filteredFAQs.length} results for "${searchTerm}"`
                        : `${faqs.length} common questions and answers`}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, idx) => {
                    const isOpen = openItems.includes(faq.question)
                    return (
                      <div key={idx} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => toggleItem(faq.question)}
                          className="flex items-center justify-between w-full p-4 text-left bg-muted/10 hover:bg-muted transition-colors"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">{faq.question}</h3>
                            <p className="text-sm text-primary mt-1">{faq.category}</p>
                          </div>
                          <span className="ml-4 flex items-center">
                            {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="p-4 bg-background/50">
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search terms or browse by category.</p>
                    <Button onClick={() => setSearchTerm("")} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="transition-colors hover:border-primary">
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Can't find what you're looking for? Our support team is here to help you succeed in your career journey.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="primary" onClick={handleEmailSupport}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline" onClick={handleLiveChat}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
