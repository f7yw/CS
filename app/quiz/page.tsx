"use client"

import { useState, useEffect } from "react"
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
  Award
} from "lucide-react"

type Choice = {
  id: string
  text: string
  score?: number
}

type Question = {
  id: string
  text: string
  choices: Choice[]
  type?: string
}

type Quiz = {
  quizId: string
  interest: string
  description: string
  questions: Question[]
  mappings?: any[]
}

type QuizMapping = {
  minScore: number
  maxScore: number
  recommendation: string
  suggestedCareers: string[]
  nextSteps: string[]
}

type QuizResult = {
  quizId: string
  score: number
  mapping: QuizMapping | null
}

type QuizAnalytics = {
  totalAttempts: number
  averageScore: number
  completionRate: number
  popularInterests: string[]
  timeSpent: number
  accuracyTrend: number[]
  personalityDistribution: { [key: string]: number }
}

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuizId, setSelectedQuizId] = useState("")
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null)
  const [quizHistory, setQuizHistory] = useState<any[]>([])
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [personalityInsights, setPersonalityInsights] = useState<any>(null)

  // Load quiz data
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const response = await fetch("/data/quizzes.json")
        const data = await response.json()
        setQuizzes(data)
      } catch (e) {
        console.error("Failed to load quizzes.json from /data/quizzes.json. Make sure it's placed in public/data/quizzes.json", e)
        setQuizzes([])
      } finally {
        setIsLoading(false)
      }
    }
    loadQuizzes()

    const generateAnalytics = () => {
      const analyticsData: QuizAnalytics = {
        totalAttempts: Math.floor(Math.random() * 5000) + 2000,
        averageScore: Math.random() * 20 + 60, // 60-80% average
        completionRate: Math.random() * 20 + 75, // 75-95% completion
        popularInterests: ["Technology", "Healthcare", "Creative Arts", "Business", "Science"],
        timeSpent: Math.floor(Math.random() * 300) + 180, // 3-8 minutes
        accuracyTrend: Array.from({ length: 7 }, () => Math.random() * 20 + 70),
        personalityDistribution: {
          Analytical: 25,
          Creative: 30,
          Social: 20,
          Practical: 15,
          Investigative: 10,
        },
      }
      setAnalytics(analyticsData)
    }
    generateAnalytics()

    // Load quiz history from localStorage
    const history = localStorage.getItem("quizHistory")
    if (history) {
      try {
        setQuizHistory(JSON.parse(history))
      } catch (e) {
        console.warn("Failed to parse quizHistory", e)
      }
    }
  }, [])

  // Set current quiz when selection changes
  useEffect(() => {
    const quiz = quizzes.find((q) => q.quizId === selectedQuizId)
    setCurrentQuiz(quiz || null)
    // Keep quizStarted as-is; user must press Start to actually begin
  }, [selectedQuizId, quizzes])

  const startQuiz = () => {
    if (!currentQuiz) return
    setQuizStarted(true)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults(null)
    setTotalScore(0)
    setStartTime(new Date())
    setTimeSpent(0)
  }

  const restartQuiz = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setCurrentQuestionIndex(0)
    setAnswers({})
    setResults(null)
    setTotalScore(0)
  }

  const selectNewQuiz = () => {
    setSelectedQuizId("")
    setCurrentQuiz(null)
    restartQuiz()
  }

  const handleAnswerChange = (questionId: string, choiceId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }))
  }

  const nextQuestion = () => {
    if (currentQuiz && currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const calculateResults = () => {
    if (!currentQuiz) return
    // sum points (assumes each choice has .score)
    let score = 0
    currentQuiz.questions.forEach((question) => {
      const ans = answers[question.id]
      const choice = question.choices.find((c) => c.id === ans)
      score += choice?.score ?? 0
    })
    setTotalScore(score)

    const mapping = currentQuiz.mappings?.find((m: any) => score >= m.minScore && score <= m.maxScore) ?? null
    setResults(mapping)
    setQuizCompleted(true)

    // save history
    const newRecord = {
      quizId: currentQuiz.quizId,
      score,
      mapping,
      timestamp: new Date().toISOString(),
    }
    const newHistory = [newRecord, ...quizHistory].slice(0, 20)
    setQuizHistory(newHistory)
    try {
      localStorage.setItem("quizHistory", JSON.stringify(newHistory))
    } catch (e) {
      console.warn("Failed to save history", e)
    }
  }

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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading career assessments...</p>
          </div>
        </div>
      </div>
    )
  }

  // === FIXED: show selection UI while quiz not started ===
  if (!quizStarted) {
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <Tabs defaultValue="take-quiz">
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
                        <div className="text-sm text-muted-foreground">Total attempts</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                        <div className="text-2xl font-bold text-primary mb-1">
                          {analytics?.averageScore.toFixed(1)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Avg. score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                        <div className="text-2xl font-bold text-primary mb-1">
                          {analytics?.completionRate.toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Completion rate</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pick an interest area</CardTitle>
                      <CardDescription>Select an area you're curious about to take a personalized assessment</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quizzes.map((quiz) => (
                      <Card
                        key={quiz.quizId}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedQuizId === quiz.quizId ? "ring-2 ring-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedQuizId(quiz.quizId)}
                      >
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <span>{quiz.interest}</span>
                            {analytics?.popularInterests.includes(quiz.interest) && (
                              <Badge variant="secondary">Popular</Badge>
                            )}
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
                      <Button onClick={startQuiz} size="lg" className="animate-pulse-glow">
                        Start {currentQuiz.interest} Assessment
                        <ArrowRight className="ml-2 h-5 w-5" />
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
                            <p className="text-sm text-muted-foreground">Users</p>
                            <p className="font-semibold">{analytics?.totalAttempts.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Score</p>
                            <p className="font-semibold">{analytics?.averageScore.toFixed(1)}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Completion</p>
                            <p className="font-semibold">{analytics?.completionRate.toFixed(0)}%</p>
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
                            <p className="font-semibold">{analytics?.timeSpent} min</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                  <div>
                    {quizHistory.length === 0 ? (
                      <div className="text-muted-foreground">You have not taken any assessments yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {quizHistory.map((h, i) => (
                          <Card key={i}>
                            <CardContent className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{h.quizId}</div>
                                <div className="text-sm text-muted-foreground">Score: {h.score}</div>
                              </div>
                              <div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                  // quick replay
                                  setSelectedQuizId(h.quizId)
                                }}>
                                  Retake
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="hidden lg:block">
              <Card>
                <CardHeader>
                  <CardTitle>Why take this assessment?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our AI-powered assessment helps you discover career paths that match your strengths and interests.
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Award className="h-5 w-5" />
                      <div>
                        <div className="text-sm font-medium">Personalized results</div>
                        <div className="text-xs text-muted-foreground">Tailored career suggestions</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5" />
                      <div>
                        <div className="text-sm font-medium">Actionable next steps</div>
                        <div className="text-xs text-muted-foreground">Practical steps to get started</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5" />
                      <div>
                        <div className="text-sm font-medium">Career alignment</div>
                        <div className="text-xs text-muted-foreground">Match your personality & skills</div>
                      </div>
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

  // Quiz Results Screen
  if (quizCompleted && results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-bold mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground">Here are your comprehensive results and insights</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {totalScore}/{currentQuiz?.questions.length! * 3}
              </div>
              <div className="text-sm text-muted-foreground">Total Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{((totalScore / (currentQuiz?.questions.length! * 3)) * 100).toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Percentage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{results?.suggestedCareers?.length ?? 0}</div>
              <div className="text-sm text-muted-foreground">Suggested careers</div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your {currentQuiz?.interest} Assessment Results</CardTitle>
              <CardDescription>{results?.recommendation}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Suggested careers</h4>
                  <ul className="list-disc list-inside">
                    {results?.suggestedCareers?.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Next steps</h4>
                  <ol className="list-decimal list-inside">
                    {results?.nextSteps?.map((n: string, i: number) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </CardContent>
            <div className="flex items-center justify-between p-6">
              <div>
                <Button variant="ghost" onClick={() => restartQuiz()}>
                  Retry
                </Button>
              </div>
              <div>
                <Button onClick={() => selectNewQuiz()}>
                  Back to topics
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz Taking Screen
  if (quizStarted && currentQuiz) {
    // حماية من عدم وجود أسئلة أو مصفوفة فارغة
    if (!Array.isArray(currentQuiz.questions) || currentQuiz.questions.length === 0) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-destructive">لا توجد أسئلة متاحة لهذا الاختبار حالياً</h2>
            <p className="text-muted-foreground mb-6">يرجى اختيار اختبار آخر أو التواصل مع الإدارة لإضافة الأسئلة.</p>
            <Button onClick={selectNewQuiz} variant="outline">
              العودة لاختيار اختبار آخر
            </Button>
          </div>
        </div>
      )
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex]

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => {
                // العودة لواجهة اختيار الفئة
                setQuizStarted(false)
              }}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to topics
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}
            </div>
          </div>

          <Progress value={getProgressPercentage()} className="w-full mb-6" />

          {/* Question Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {Array.isArray(currentQuestion.choices) && currentQuestion.choices.length > 0 ? (
                    currentQuestion.choices.map((choice) => {
                      const inputId = `${currentQuestion.id}-${choice.id}`
                      return (
                        <div key={inputId} className="flex items-center space-x-2">
                          <RadioGroupItem value={choice.id} id={inputId} />
                          <Label htmlFor={inputId} className="flex-1 cursor-pointer py-2">
                            {choice.text}
                          </Label>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-destructive">لا توجد خيارات متاحة لهذا السؤال</div>
                  )}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={previousQuestion} disabled={currentQuestionIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            </div>

            <div className="flex space-x-2">
              {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
                <Button onClick={calculateResults} disabled={!canProceed()} className="animate-pulse-glow">
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

          <div className="mt-6 grid grid-cols-6 gap-2">
            {currentQuiz.questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded ${index < currentQuestionIndex ? "bg-primary" : index === currentQuestionIndex ? "bg-primary/50" : "bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // fallback (should not be reached with the fixes above)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-muted-foreground">Select an assessment to get started.</p>
        </div>
      </div>
    </div>
  )
}
