"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  BarChart3,
  Clock,
  Star,
  Download,
  Share2,
  PieChart,
  Activity,
  Award,
  Lightbulb,
  Calendar,
  Copy,
  Printer,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface QuizChoice {
  id: string
  text: string
  score: number
}

interface QuizQuestion {
  id: string
  text: string
  type: string
  choices: QuizChoice[]
}

interface QuizMapping {
  minScore: number
  maxScore: number
  recommendation: string
  suggestedCareers: string[]
  nextSteps: string[]
}

interface Quiz {
  quizId: string
  interest: string
  description: string
  questions: QuizQuestion[]
  mappings: QuizMapping[]
}

interface QuizAnalytics {
  totalAttempts: number
  averageScore: number
  completionRate: number
  popularInterests: string[]
  timeSpent: number
  accuracyTrend: number[]
  personalityDistribution: { [key: string]: number }
}

const SAVED_QUIZ_KEY = "savedQuizProgress_v1"
const QUIZ_HISTORY_KEY = "quizHistory_v1"

export default function QuizPage() {
  const { toast } = useToast()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState("")
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState<QuizMapping | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [personalityInsights, setPersonalityInsights] = useState<any>(null)
  const [hasSavedProgress, setHasSavedProgress] = useState(false)

  const timerRef = useRef<number | null>(null)

  // Load quiz data + analytics + saved history
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/data/quizzes.json")
        const data = await res.json()
        setQuizzes(data)
      } catch (err) {
        console.error("Failed to load quizzes:", err)
        toast({ title: "Failed to load quizzes", description: "Please try again later." })
      } finally {
        setIsLoading(false)
      }
    }
    load()

    // generate synthetic analytics dashboard (placeholder)
    setAnalytics({
      totalAttempts: Math.floor(Math.random() * 5000) + 2000,
      averageScore: Math.random() * 20 + 60,
      completionRate: Math.random() * 20 + 75,
      popularInterests: ["Technology", "Healthcare", "Creative Arts", "Business", "Science"],
      timeSpent: Math.floor(Math.random() * 300) + 180,
      accuracyTrend: Array.from({ length: 7 }, () => Math.random() * 20 + 70),
      personalityDistribution: {
        Analytical: 25,
        Creative: 30,
        Social: 20,
        Practical: 15,
        Investigative: 10,
      },
    })

    const history = localStorage.getItem(QUIZ_HISTORY_KEY)
    if (history) setQuizHistory(JSON.parse(history))

    const saved = localStorage.getItem(SAVED_QUIZ_KEY)
    setHasSavedProgress(Boolean(saved))
  }, [toast])

  // When selectedQuizId changes, set the currentQuiz
  useEffect(() => {
    if (!selectedQuizId) {
      setCurrentQuiz(null)
      return
    }
    const q = quizzes.find((x) => x.quizId === selectedQuizId) || null
    setCurrentQuiz(q)
  }, [selectedQuizId, quizzes])

  // autosave progress when answers change while quiz started
  useEffect(() => {
    if (!quizStarted) return
    const payload = {
      quizId: currentQuiz?.quizId,
      currentQuestionIndex,
      answers,
      startTime: startTime?.toISOString() ?? null,
      timestamp: new Date().toISOString(),
    }
    try {
      localStorage.setItem(SAVED_QUIZ_KEY, JSON.stringify(payload))
      setHasSavedProgress(true)
    } catch {
      // ignore
    }
  }, [answers, currentQuestionIndex, quizStarted, currentQuiz, startTime])

  // keyboard navigation: left/right for prev/next, enter to advance on answer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!quizStarted || quizCompleted) return
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCurrentQuestionIndex((i) => Math.max(0, i - 1))
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setCurrentQuestionIndex((i) => {
          if (!currentQuiz) return i
          return Math.min(currentQuiz.questions.length - 1, i + 1)
        })
      } else if (e.key === "Enter") {
        // if current question answered, advance
        const currentQ = currentQuiz?.questions[currentQuestionIndex]
        if (currentQ && answers[currentQ.id]) {
          if (currentQuestionIndex < (currentQuiz?.questions.length ?? 1) - 1) {
            setCurrentQuestionIndex((i) => i + 1)
          } else {
            calculateResults()
          }
        }
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [quizStarted, quizCompleted, currentQuiz, currentQuestionIndex, answers])

  // timer for timeSpent while quiz is active
  useEffect(() => {
    if (!quizStarted || quizCompleted) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }
    timerRef.current = window.setInterval(() => {
      setTimeSpent((t) => t + 1)
    }, 1000)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [quizStarted, quizCompleted])

  // allow resuming saved progress
  const resumeSavedProgress = useCallback(() => {
    const saved = localStorage.getItem(SAVED_QUIZ_KEY)
    if (!saved) {
      toast({ title: "No saved progress" })
      return
    }
    try {
      const parsed = JSON.parse(saved)
      if (!parsed?.quizId) {
        toast({ title: "Invalid saved progress" })
        return
      }
      setSelectedQuizId(parsed.quizId)
      setTimeout(() => {
        // small delay to ensure currentQuiz is set by effect
        setAnswers(parsed.answers || {})
        setCurrentQuestionIndex(parsed.currentQuestionIndex || 0)
        setStartTime(parsed.startTime ? new Date(parsed.startTime) : new Date())
        setQuizStarted(true)
        setHasSavedProgress(false) // avoid double-resume
        toast({ title: "Progress resumed" })
      }, 80)
    } catch (err) {
      console.error(err)
      toast({ title: "Unable to resume progress" })
    }
  }, [toast])

  const startQuiz = useCallback(() => {
    if (!currentQuiz) return
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setQuizCompleted(false)
    setResults(null)
    setTotalScore(0)
    setStartTime(new Date())
    setTimeSpent(0)
    toast({ title: "Quiz started", description: `Good luck with the ${currentQuiz.interest} assessment!` })
  }, [currentQuiz, toast])

  const handleAnswerChange = useCallback((questionId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }))
  }, [])

  const nextQuestion = useCallback(() => {
    if (!currentQuiz) return
    setCurrentQuestionIndex((i) => Math.min(currentQuiz.questions.length - 1, i + 1))
  }, [currentQuiz])

  const previousQuestion = useCallback(() => {
    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
  }, [])

  const calculateResults = useCallback(() => {
    if (!currentQuiz || !startTime) return

    let score = 0
    const pattern: string[] = []

    for (const question of currentQuiz.questions) {
      const selected = answers[question.id]
      if (selected) {
        const choice = question.choices.find((c) => c.id === selected)
        if (choice) {
          score += choice.score
          pattern.push(choice.text)
        }
      }
    }

    const endTime = new Date()
    const timeTaken = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    setTimeSpent(timeTaken)
    setTotalScore(score)

    // simple heuristic for insights — placeholder but deterministic-ish from answers
    const dominantTrait =
      pattern.join(" ").length % 5 === 0 ? "Analytical" : pattern.join(" ").length % 3 === 0 ? "Creative" : "Social"

    const insights = {
      dominantTrait,
      strengths: ["Problem-solving", "Communication"].slice(0, 2),
      workStyle: "Collaborative",
      learningStyle: "Visual",
    }
    setPersonalityInsights(insights)

    const mapping = currentQuiz.mappings.find((m) => score >= m.minScore && score <= m.maxScore)
    if (mapping) setResults(mapping)

    const quizResult = {
      id: Date.now(),
      quizType: currentQuiz.interest,
      score,
      maxScore: currentQuiz.questions.length * 3,
      timeTaken,
      date: new Date().toISOString(),
      insights,
    }

    const updatedHistory = [...quizHistory, quizResult]
    setQuizHistory(updatedHistory)
    try {
      localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory))
      // clear saved progress once completed
      localStorage.removeItem(SAVED_QUIZ_KEY)
      setHasSavedProgress(false)
    } catch {
      // ignore
    }

    setQuizCompleted(true)
    setQuizStarted(false)
    toast({ title: "Assessment complete", description: "We've saved your results to history." })
  }, [answers, currentQuiz, startTime, quizHistory, toast])

  const restartQuiz = useCallback(() => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults(null)
    setTotalScore(0)
    setStartTime(null)
    setTimeSpent(0)
    toast({ title: "Quiz reset" })
  }, [toast])

  const selectNewQuiz = useCallback(() => {
    setSelectedQuizId("")
    setCurrentQuiz(null)
    restartQuiz()
  }, [restartQuiz])

  const exportResults = useCallback(() => {
    if (!results || !currentQuiz) return

    const exportData = {
      quiz: currentQuiz.interest,
      score: `${totalScore}/${currentQuiz.questions.length * 3}`,
      percentage: `${((totalScore / (currentQuiz.questions.length * 3)) * 100).toFixed(1)}%`,
      recommendation: results.recommendation,
      suggestedCareers: results.suggestedCareers,
      nextSteps: results.nextSteps,
      personalityInsights,
      timeSpent: `${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, "0")}`,
      date: new Date().toLocaleDateString(),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `career-quiz-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Export started", description: "JSON downloaded" })
  }, [results, currentQuiz, totalScore, personalityInsights, timeSpent, toast])

  // print-friendly export of results
  const exportPrintable = useCallback(() => {
    if (!results || !currentQuiz) return
    const html = `
      <html>
      <head><title>Assessment Results</title>
        <style>
          body{font-family: Arial, Helvetica, sans-serif;padding:24px;color:#111}
          h1{color:#111}
          .badge{display:inline-block;padding:6px 10px;border-radius:8px;background:#eee;margin-right:6px}
        </style>
      </head>
      <body>
        <h1>Assessment Results — ${currentQuiz.interest}</h1>
        <p><strong>Score:</strong> ${totalScore}/${currentQuiz.questions.length * 3}</p>
        <p><strong>Percentage:</strong> ${((totalScore / (currentQuiz.questions.length * 3)) * 100).toFixed(1)}%</p>
        <h3>Recommendation</h3>
        <p>${results.recommendation}</p>
        <h3>Suggested Careers</h3>
        <p>${results.suggestedCareers.join(", ")}</p>
        <h3>Next Steps</h3>
        <ol>${results.nextSteps.map((s) => `<li>${s}</li>`).join("")}</ol>
        <hr/>
        <p>Exported: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `
    const w = window.open("", "_blank", "noopener,noreferrer")
    if (!w) {
      toast({ title: "Popup blocked", description: "Allow popups to print results." })
      return
    }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 300)
    toast({ title: "Preparing print view" })
  }, [results, currentQuiz, totalScore, toast])

  const copyResultsLink = useCallback(async () => {
    if (!results || !currentQuiz) return
    const url = `${window.location.origin}/quiz/results?quiz=${currentQuiz.quizId}&score=${totalScore}`
    await navigator.clipboard.writeText(url)
    toast({ title: "Link copied", description: "Shareable results link copied to clipboard." })
  }, [results, currentQuiz, totalScore, toast])

  // helpers
  const getProgressPercentage = () => {
    if (!currentQuiz) return 0
    return ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100
  }

  const isCurrentQuestionAnswered = () => {
    if (!currentQuiz) return false
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]
    return !!answers[currentQuestion.id]
  }

  const canProceed = () => {
    if (!currentQuiz) return false
    return currentQuestionIndex === currentQuiz.questions.length - 1
      ? Object.keys(answers).length === currentQuiz.questions.length
      : isCurrentQuestionAnswered()
  }

  // warn user about leaving mid-quiz
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (quizStarted && !quizCompleted) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [quizStarted, quizCompleted])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[360px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading career assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  // Selection screen
  if (!selectedQuizId || !currentQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold mb-4 flex items-center justify-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span>AI-Powered Career Assessment</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover career paths that align with your interests, personality, and goals
            </p>
          </div>

          <Tabs defaultValue="take-quiz" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="take-quiz">Take Assessment</TabsTrigger>
              <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
              <TabsTrigger value="history">My History</TabsTrigger>
            </TabsList>

            <TabsContent value="take-quiz" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Activity className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-primary mb-1">
                      {analytics?.totalAttempts.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Assessments</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-primary mb-1">
                      {analytics ? Math.floor(analytics.timeSpent / 60) : 0}m
                    </div>
                    <div className="text-sm text-muted-foreground">Average Time</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-2xl font-bold text-primary mb-1">{analytics?.averageScore.toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Choose Your Interest Area</CardTitle>
                  <CardDescription>Select an area you're curious about to take a personalized assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 items-center">
                    <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an interest area to explore" />
                      </SelectTrigger>
                      <SelectContent>
                        {quizzes.map((quiz) => (
                          <SelectItem key={quiz.quizId} value={quiz.quizId}>
                            {quiz.interest}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      {hasSavedProgress && (
                        <Button variant="outline" onClick={resumeSavedProgress} title="Resume saved progress">
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.quizId}
                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedQuizId === quiz.quizId ? "ring-2 ring-primary bg-primary/5" : ""}`}
                    onClick={() => setSelectedQuizId(quiz.quizId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") setSelectedQuizId(quiz.quizId) }}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{quiz.interest}</span>
                        {analytics?.popularInterests.includes(quiz.interest) && <Badge variant="secondary">Popular</Badge>}
                      </CardTitle>
                      <CardDescription>{quiz.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{quiz.questions.length} questions</Badge>
                        <span className="text-sm text-muted-foreground">~5 minutes</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedQuizId && currentQuiz && (
                <div className="mt-8 text-center">
                  <Button onClick={startQuiz} size="lg">
                    Start {currentQuiz.interest} Assessment <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{analytics?.totalAttempts.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-bold">{analytics?.completionRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Score</p>
                        <p className="text-2xl font-bold">{analytics?.averageScore.toFixed(0)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Time</p>
                        <p className="text-2xl font-bold">{analytics ? Math.floor(analytics.timeSpent / 60) : 0}m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="h-5 w-5" />
                      <span>Personality Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics && (
                      <div className="space-y-3">
                        {Object.entries(analytics.personalityDistribution).map(([type, percentage]) => (
                          <div key={type} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{type}</span>
                              <span>{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>Popular Interest Areas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics && (
                      <div className="space-y-3">
                        {analytics.popularInterests.map((interest, index) => (
                          <div key={interest} className="flex items-center justify-between">
                            <span className="text-sm">{interest}</span>
                            <Badge variant={index < 2 ? "default" : "secondary"}>
                              {Math.floor(Math.random() * 500) + 200} users
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Your Assessment History</span>
                  </CardTitle>
                  <CardDescription>Track your progress and see how your interests have evolved</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No assessments taken yet</p>
                      <p className="text-sm text-muted-foreground">Take your first quiz to see your history here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quizHistory
                        .slice(-10)
                        .reverse()
                        .map((result) => (
                          <Card key={result.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-semibold">{result.quizType} Assessment</h3>
                                  <p className="text-sm text-muted-foreground">{new Date(result.date).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="secondary">
                                  {result.score}/{result.maxScore}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Score: </span>
                                  <span className="font-medium">
                                    {((result.score / result.maxScore) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Time: </span>
                                  <span className="font-medium">
                                    {Math.floor(result.timeTaken / 60)}:{(result.timeTaken % 60).toString().padStart(2, "0")}
                                  </span>
                                </div>
                              </div>
                              {result.insights && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Dominant trait: </span>
                                    <Badge variant="outline">{result.insights.dominantTrait}</Badge>
                                  </p>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    )
  }

  // Results screen
  if (quizCompleted && results && currentQuiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-bold mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground">Here are your comprehensive results and insights</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Your {currentQuiz.interest} Assessment Results</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={exportResults}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportPrintable}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{totalScore}/{currentQuiz.questions.length * 3}</div>
                      <div className="text-sm text-muted-foreground">Total Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{((totalScore / (currentQuiz.questions.length * 3)) * 100).toFixed(1)}%</div>
                      <div className="text-sm text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, "0")}</div>
                      <div className="text-sm text-muted-foreground">Time Taken</div>
                    </div>
                  </div>

                  <Progress value={(totalScore / (currentQuiz.questions.length * 3)) * 100} className="w-full h-3" />
                </CardContent>
              </Card>

              {personalityInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5" />
                      <span>Personality Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2">Dominant Trait</h4>
                        <Badge variant="default" className="mb-4">{personalityInsights.dominantTrait}</Badge>

                        <h4 className="font-semibold mb-2">Key Strengths</h4>
                        <div className="space-y-1">
                          {personalityInsights.strengths.map((strength: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Work Style</h4>
                        <Badge variant="outline" className="mb-4">{personalityInsights.workStyle}</Badge>

                        <h4 className="font-semibold mb-2">Learning Style</h4>
                        <Badge variant="outline">{personalityInsights.learningStyle}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Your Career Recommendation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">{results.recommendation}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Suggested Career Paths</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.suggestedCareers.map((career, index) => (
                      <Link key={index} href="/career-bank" className="block">
                        <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <span className="font-medium">{career}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Recommended Next Steps</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/career-bank" className="block">
                    <Button className="w-full justify-start">
                      <Target className="h-4 w-4 mr-2" />
                      Explore Career Bank
                    </Button>
                  </Link>

                  <Link href="/resources" className="block">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Find Resources
                    </Button>
                  </Link>

                  <Button variant="ghost" className="w-full justify-start" onClick={copyResultsLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Shareable Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Take Another Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={selectNewQuiz} variant="outline" className="w-full bg-transparent">
                    <Brain className="h-4 w-4 mr-2" />
                    Choose Different Interest
                  </Button>
                  <Button onClick={restartQuiz} variant="ghost" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake This Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Quiz taking screen
  if (quizStarted && currentQuiz) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex]

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl font-bold">{currentQuiz.interest} Assessment</h1>
              <Badge variant="secondary">Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</Badge>
            </div>
            <Progress value={getProgressPercentage()} className="w-full" aria-hidden />
          </div>

          <Card className="mb-8" aria-live="polite">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={answers[currentQuestion.id] || ""} onValueChange={(v) => handleAnswerChange(currentQuestion.id, v)}>
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice) => (
                    <div key={choice.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={choice.id} id={choice.id} />
                      <Label htmlFor={choice.id} className="flex-1 cursor-pointer py-2">{choice.text}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              <Button variant="ghost" onClick={() => {
                // quick save & exit
                localStorage.setItem(SAVED_QUIZ_KEY, JSON.stringify({
                  quizId: currentQuiz.quizId,
                  currentQuestionIndex,
                  answers,
                  startTime: startTime?.toISOString() ?? new Date().toISOString(),
                  timestamp: new Date().toISOString(),
                }))
                toast({ title: "Progress saved", description: "You can resume this quiz later." })
              }}>
                Save & Exit
              </Button>

              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <Button onClick={calculateResults} disabled={!canProceed()}>
                  Get Results
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={nextQuestion} disabled={!canProceed()}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2" aria-hidden>
            {currentQuiz.questions.map((_, index) => (
              <div key={index} className={`w-3 h-3 rounded-full transition-colors ${index < currentQuestionIndex ? "bg-primary" : index === currentQuestionIndex ? "bg-primary/50" : "bg-muted"}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
