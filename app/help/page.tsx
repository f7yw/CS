"use client"

import { useState } from "react"
import { HelpCircle, Search, Book, MessageSquare, Mail, Phone, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface FAQ {
  question: string
  answer: string
  category: string
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

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
    setOpenItems((prev) => (prev.includes(question) ? prev.filter((item) => item !== question) : [...prev, question]))
  }

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const categories = [...new Set(faqs.map((faq) => faq.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and get the help you need to make the most of NextStep Navigator.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Help Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-green-600" />
                  <span>Getting Started Guide</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  New to NextStep Navigator? Learn the basics and get up to speed quickly.
                </p>
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Contact Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span>support@nextstepnavigator.com</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                  Contact Us
                </Button>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
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
                      className="w-full justify-start text-left"
                      onClick={() => setSearchTerm(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-6 w-6 text-green-600" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
                <CardDescription>
                  {searchTerm
                    ? `Showing ${filteredFAQs.length} results for "${searchTerm}"`
                    : `${faqs.length} common questions and answers`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <Collapsible key={index}>
                      <CollapsibleTrigger
                        className="flex items-center justify-between w-full p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => toggleItem(faq.question)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{faq.question}</h3>
                          <p className="text-sm text-green-600 mt-1">{faq.category}</p>
                        </div>
                        {openItems.includes(faq.question) ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500 mb-4">Try adjusting your search terms or browse by category.</p>
                    <Button onClick={() => setSearchTerm("")} variant="outline">
                      Clear Search
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Help */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Can't find what you're looking for? Our support team is here to help you succeed in your career
                  journey.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                  <Button variant="outline">
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
