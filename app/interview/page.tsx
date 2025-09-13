"use client"

import { MessageSquare, Play, Download, CheckCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InterviewPage() {
  const interviewPhases = [
    {
      phase: "Before the Interview",
      icon: "📋",
      color: "blue",
      tips: [
        "Research the company thoroughly - mission, values, recent news, and competitors",
        "Study the job description and prepare specific examples of relevant experience",
        "Practice common interview questions with a friend or in front of a mirror",
        "Prepare thoughtful questions to ask the interviewer about the role and company",
        "Plan your outfit and route to the interview location in advance",
        "Prepare multiple copies of your resume and any required documents",
        "Get a good night's sleep and eat a proper meal before the interview",
      ],
    },
    {
      phase: "During the Interview",
      icon: "🤝",
      color: "green",
      tips: [
        "Arrive 10-15 minutes early to show punctuality and respect",
        "Maintain good eye contact and confident, open body language",
        "Listen carefully to questions and ask for clarification if needed",
        "Provide specific examples using the STAR method (Situation, Task, Action, Result)",
        "Show enthusiasm for the role and genuine interest in the company",
        "Be honest about your experience and acknowledge areas for growth",
        "Take notes during the interview to show engagement and attention to detail",
      ],
    },
    {
      phase: "After the Interview",
      icon: "📧",
      color: "purple",
      tips: [
        "Send a personalized thank-you email within 24 hours",
        "Reiterate your interest in the position and key qualifications",
        "Address any concerns or questions that came up during the interview",
        "Connect with your interviewer on LinkedIn (if appropriate)",
        "Follow up appropriately if you don't hear back within the stated timeframe",
        "Reflect on the interview experience and note areas for improvement",
        "Continue your job search while waiting for a response",
      ],
    },
  ]

  const commonQuestions = [
    {
      category: "General Questions",
      questions: [
        "Tell me about yourself",
        "Why do you want this job?",
        "Why are you leaving your current position?",
        "What are your greatest strengths?",
        "What is your biggest weakness?",
        "Where do you see yourself in 5 years?",
        "Why should we hire you?",
      ],
    },
    {
      category: "Behavioral Questions",
      questions: [
        "Describe a challenging situation you faced at work and how you handled it",
        "Tell me about a time you had to work with a difficult team member",
        "Give an example of when you had to meet a tight deadline",
        "Describe a time you made a mistake and how you handled it",
        "Tell me about a time you had to learn something new quickly",
        "Give an example of when you showed leadership skills",
        "Describe a time you had to persuade someone to see your point of view",
      ],
    },
    {
      category: "Technical/Role-Specific",
      questions: [
        "What technical skills do you bring to this role?",
        "How do you stay updated with industry trends?",
        "Describe your experience with [specific software/tool]",
        "Walk me through your approach to [job-specific task]",
        "What would you do in your first 90 days in this role?",
        "How do you prioritize multiple projects?",
        "What's your experience with [relevant methodology/process]?",
      ],
    },
  ]

  const starMethod = {
    title: "STAR Method Framework",
    description: "Use this structure to answer behavioral interview questions effectively",
    steps: [
      {
        letter: "S",
        word: "Situation",
        description: "Set the context and background for your story",
        example: "In my previous role as a marketing coordinator...",
      },
      {
        letter: "T",
        word: "Task",
        description: "Describe your responsibility or the challenge you faced",
        example: "I was responsible for increasing social media engagement...",
      },
      {
        letter: "A",
        word: "Action",
        description: "Explain the specific actions you took to address the situation",
        example: "I developed a content calendar and collaborated with influencers...",
      },
      {
        letter: "R",
        word: "Result",
        description: "Share the outcomes and what you learned",
        example: "As a result, engagement increased by 40% in three months...",
      },
    ],
  }

  const interviewTypes = [
    {
      type: "Phone/Video Interview",
      tips: [
        "Test your technology beforehand",
        "Choose a quiet, well-lit location",
        "Have your resume and notes nearby",
        "Dress professionally (even for phone interviews)",
        "Speak clearly and at a moderate pace",
      ],
    },
    {
      type: "Panel Interview",
      tips: [
        "Make eye contact with all panel members",
        "Address questions to the person who asked",
        "Include everyone in your responses when appropriate",
        "Bring extra copies of your resume",
        "Ask for business cards to follow up individually",
      ],
    },
    {
      type: "Behavioral Interview",
      tips: [
        "Prepare 5-7 detailed STAR examples",
        "Focus on recent, relevant experiences",
        "Practice telling your stories concisely",
        "Highlight different skills in each example",
        "Be specific about your role and contributions",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Tips & Preparation</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of interviewing with our comprehensive guide to preparation, performance, and follow-up.
          </p>
        </div>

        {/* Interview Success Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
              <p className="text-gray-600">Success rate with proper preparation</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">7-10</div>
              <p className="text-gray-600">Questions you should prepare to ask</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">24hrs</div>
              <p className="text-gray-600">Ideal time to send thank-you email</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">15min</div>
              <p className="text-gray-600">Early arrival time recommended</p>
            </CardContent>
          </Card>
        </div>

        {/* Interview Phases */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Interview Preparation Phases</CardTitle>
            <CardDescription>
              Follow this comprehensive guide to excel at every stage of the interview process.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {interviewPhases.map((phase, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{phase.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900">{phase.phase}</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {phase.tips.map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* STAR Method */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">STAR Method for Behavioral Questions</CardTitle>
            <CardDescription>
              Structure your answers to behavioral questions for maximum impact and clarity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {starMethod.steps.map((step, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-purple-600">{step.letter}</span>
                    </div>
                    <CardTitle className="text-lg">{step.word}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-700 italic">"{step.example}"</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common Questions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Common Interview Questions</CardTitle>
            <CardDescription>
              Practice these frequently asked questions to build confidence and prepare strong answers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
              </TabsList>

              {commonQuestions.map((category, categoryIndex) => (
                <TabsContent
                  key={categoryIndex}
                  value={category.category.toLowerCase().split("/")[0]}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-600 text-sm font-bold">Q</span>
                        </div>
                        <span className="text-gray-800">{question}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Interview Types */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Different Interview Formats</CardTitle>
            <CardDescription>Adapt your approach based on the interview format and setting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {interviewTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{type.type}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {type.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-2">
                          <ArrowRight className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Video Resources */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Video Interview Masterclass</CardTitle>
            <CardDescription>
              Watch expert tips and real interview examples to improve your performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <Play className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Interview Techniques Masterclass</h3>
                <p className="text-gray-600 mb-4">Learn from HR experts and successful candidates</p>
                <Badge className="mb-4">45 minutes</Badge>
                <Button className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
              </div>

              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Mock Interview Practice</h3>
                <p className="text-gray-600 mb-4">Practice with AI-powered interview simulation</p>
                <Badge className="mb-4">Interactive</Badge>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloadable Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Downloadable Resources</CardTitle>
            <CardDescription>
              Get our comprehensive guides and checklists to support your interview preparation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Download className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Interview Checklist</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete preparation checklist</p>
                  <Button size="sm" className="w-full">
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">STAR Method Guide</h3>
                  <p className="text-sm text-gray-600 mb-4">Detailed examples and templates</p>
                  <Button size="sm" className="w-full">
                    Download PDF
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Download className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Questions to Ask</h3>
                  <p className="text-sm text-gray-600 mb-4">Smart questions for interviewers</p>
                  <Button size="sm" className="w-full">
                    Download PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
