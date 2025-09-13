"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import {
  Target,
  BookOpen,
  Brain,
  Calendar,
  Star,
  ArrowRight,
  Plus,
  Settings,
  Download,
  Share2,
  BarChart3,
  Activity,
  Users,
  Briefcase,
  Zap,
  Trophy,
  Lightbulb,
  MapPin,
  Globe,
  Mail,
  LinkedinIcon,
  Github,
  Twitter,
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  avatar: string
  title: string
  location: string
  bio: string
  joinDate: string
  careerGoals: string[]
  skills: string[]
  interests: string[]
  socialLinks: {
    linkedin?: string
    github?: string
    twitter?: string
    website?: string
  }
}

interface DashboardStats {
  totalQuizzes: number
  averageScore: number
  resourcesBookmarked: number
  storiesRead: number
  careersExplored: number
  hoursSpent: number
  streakDays: number
  achievements: number
}

interface Activity {
  id: string
  type: "quiz" | "resource" | "story" | "career" | "achievement"
  title: string
  description: string
  timestamp: string
  score?: number
  category?: string
}

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  target: number
  deadline: string
  category: "career" | "skill" | "education" | "networking"
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused"
}

interface Recommendation {
  id: string
  type: "career" | "resource" | "skill" | "course"
  title: string
  description: string
  reason: string
  confidence: number
  category: string
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<Activity[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [progressData, setProgressData] = useState<any[]>([])
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Simulate loading user data
        const profile: UserProfile = {
          name: "Alex Johnson",
          email: "alex.johnson@email.com",
          avatar: "/professional-headshot.png",
          title: "Software Developer",
          location: "San Francisco, CA",
          bio: "Passionate about technology and career growth. Currently exploring opportunities in AI and machine learning.",
          joinDate: "2024-01-15",
          careerGoals: ["Transition to AI/ML", "Leadership Role", "Remote Work"],
          skills: ["JavaScript", "Python", "React", "Node.js", "Machine Learning", "Data Analysis"],
          interests: ["Technology", "Artificial Intelligence", "Startups", "Remote Work"],
          socialLinks: {
            linkedin: "https://linkedin.com/in/alexjohnson",
            github: "https://github.com/alexjohnson",
            twitter: "https://twitter.com/alexjohnson",
            website: "https://alexjohnson.dev",
          },
        }

        const stats: DashboardStats = {
          totalQuizzes: 12,
          averageScore: 78.5,
          resourcesBookmarked: 24,
          storiesRead: 8,
          careersExplored: 15,
          hoursSpent: 32.5,
          streakDays: 7,
          achievements: 6,
        }

        const activities: Activity[] = [
          {
            id: "1",
            type: "quiz",
            title: "Technology Career Assessment",
            description: "Completed with 85% score",
            timestamp: "2024-01-20T10:30:00Z",
            score: 85,
            category: "Technology",
          },
          {
            id: "2",
            type: "resource",
            title: "AI Career Guide",
            description: "Bookmarked for later reading",
            timestamp: "2024-01-19T15:45:00Z",
            category: "Artificial Intelligence",
          },
          {
            id: "3",
            type: "story",
            title: "Sarah's Journey to ML Engineer",
            description: "Read success story",
            timestamp: "2024-01-19T09:20:00Z",
            category: "Machine Learning",
          },
          {
            id: "4",
            type: "career",
            title: "Data Scientist",
            description: "Explored career details",
            timestamp: "2024-01-18T14:10:00Z",
            category: "Data Science",
          },
          {
            id: "5",
            type: "achievement",
            title: "Quiz Master",
            description: "Completed 10 career assessments",
            timestamp: "2024-01-17T11:00:00Z",
            category: "Achievement",
          },
        ]

        const userGoals: Goal[] = [
          {
            id: "1",
            title: "Complete AI/ML Learning Path",
            description: "Finish all recommended courses and resources for machine learning transition",
            progress: 65,
            target: 100,
            deadline: "2024-06-30",
            category: "skill",
            priority: "high",
            status: "active",
          },
          {
            id: "2",
            title: "Network with 20 AI Professionals",
            description: "Connect with professionals in the AI/ML field",
            progress: 12,
            target: 20,
            deadline: "2024-04-30",
            category: "networking",
            priority: "medium",
            status: "active",
          },
          {
            id: "3",
            title: "Build ML Portfolio Project",
            description: "Create a comprehensive machine learning project for portfolio",
            progress: 30,
            target: 100,
            deadline: "2024-05-15",
            category: "career",
            priority: "high",
            status: "active",
          },
        ]

        const aiRecommendations: Recommendation[] = [
          {
            id: "1",
            type: "career",
            title: "Machine Learning Engineer",
            description: "Based on your technology background and AI interests",
            reason: "Matches your programming skills and career goals",
            confidence: 92,
            category: "Technology",
          },
          {
            id: "2",
            type: "resource",
            title: "Deep Learning Specialization",
            description: "Advanced course series for ML transition",
            reason: "Aligns with your learning path goals",
            confidence: 88,
            category: "Education",
          },
          {
            id: "3",
            type: "skill",
            title: "TensorFlow Certification",
            description: "Industry-recognized ML framework certification",
            reason: "High demand skill in your target field",
            confidence: 85,
            category: "Certification",
          },
        ]

        const weeklyProgress = [
          { week: "Week 1", quizzes: 2, resources: 5, stories: 1, hours: 4.5 },
          { week: "Week 2", quizzes: 3, resources: 8, stories: 2, hours: 6.2 },
          { week: "Week 3", quizzes: 1, resources: 4, stories: 1, hours: 3.8 },
          { week: "Week 4", quizzes: 4, resources: 7, stories: 3, hours: 8.1 },
          { week: "Week 5", quizzes: 2, resources: 6, stories: 1, hours: 5.4 },
        ]

        const skillsProgress = [
          { skill: "Machine Learning", level: 65, target: 90 },
          { skill: "Python", level: 85, target: 95 },
          { skill: "Data Analysis", level: 70, target: 85 },
          { skill: "Deep Learning", level: 45, target: 80 },
          { skill: "Statistics", level: 60, target: 85 },
        ]

        setUserProfile(profile)
        setDashboardStats(stats)
        setRecentActivity(activities)
        setGoals(userGoals)
        setRecommendations(aiRecommendations)
        setProgressData(weeklyProgress)
        setSkillsData(skillsProgress)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz":
        return <Brain className="h-4 w-4" />
      case "resource":
        return <BookOpen className="h-4 w-4" />
      case "story":
        return <Users className="h-4 w-4" />
      case "career":
        return <Briefcase className="h-4 w-4" />
      case "achievement":
        return <Trophy className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "quiz":
        return "text-blue-500"
      case "resource":
        return "text-green-500"
      case "story":
        return "text-purple-500"
      case "career":
        return "text-orange-500"
      case "achievement":
        return "text-yellow-500"
      default:
        return "text-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-2">Welcome back, {userProfile?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground">Track your career journey and discover new opportunities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Assessments Taken</p>
                    <p className="text-2xl font-bold">{dashboardStats?.totalQuizzes}</p>
                    <p className="text-xs text-muted-foreground">Avg: {dashboardStats?.averageScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resources Saved</p>
                    <p className="text-2xl font-bold">{dashboardStats?.resourcesBookmarked}</p>
                    <p className="text-xs text-muted-foreground">+3 this week</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Careers Explored</p>
                    <p className="text-2xl font-bold">{dashboardStats?.careersExplored}</p>
                    <p className="text-xs text-muted-foreground">In {userProfile?.interests.length} areas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Streak</p>
                    <p className="text-2xl font-bold">{dashboardStats?.streakDays}</p>
                    <p className="text-xs text-muted-foreground">days in a row</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                  <CardDescription>Your latest career development activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full bg-muted ${getActivityColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{activity.title}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {activity.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                            {activity.score && (
                              <Badge variant="secondary" className="text-xs">
                                {activity.score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-4" />
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Activity
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Goals */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Active Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals
                      .filter((g) => g.status === "active")
                      .slice(0, 3)
                      .map((goal) => (
                        <div key={goal.id} className={`p-3 border-l-4 rounded-r-lg ${getPriorityColor(goal.priority)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {goal.priority}
                            </Badge>
                          </div>
                          <Progress value={goal.progress} className="mb-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{goal.progress}% complete</span>
                            <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Goal
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/quiz">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Brain className="h-4 w-4 mr-2" />
                      Take Career Assessment
                    </Button>
                  </Link>
                  <Link href="/career-bank">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Explore Careers
                    </Button>
                  </Link>
                  <Link href="/resources">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Browse Resources
                    </Button>
                  </Link>
                  <Link href="/stories">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Users className="h-4 w-4 mr-2" />
                      Read Success Stories
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>Your learning activity over the past 5 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="hours" stackId="1" stroke="#8884d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="quizzes" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="resources" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skills Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Development</CardTitle>
                <CardDescription>Progress towards your skill targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillsData.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-muted-foreground">
                          {skill.level}% / {skill.target}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={skill.level} className="h-2" />
                        <div
                          className="absolute top-0 h-2 w-1 bg-red-500 rounded-full"
                          style={{ left: `${skill.target}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{dashboardStats?.hoursSpent}h</div>
                  <p className="text-sm text-muted-foreground">Total time invested</p>
                  <div className="mt-4 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>This week: 8.1h</span>
                      <span className="text-green-500">+15%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">87%</div>
                  <p className="text-sm text-muted-foreground">Average completion</p>
                  <Progress value={87} className="mt-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{dashboardStats?.achievements}</div>
                  <p className="text-sm text-muted-foreground">Badges earned</p>
                  <div className="flex justify-center space-x-1 mt-4">
                    {Array.from({ length: dashboardStats?.achievements || 0 }).map((_, i) => (
                      <Trophy key={i} className="h-4 w-4 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Career Goals</h2>
              <p className="text-muted-foreground">Track and manage your professional objectives</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Goal
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <Card key={goal.id} className={`border-l-4 ${getPriorityColor(goal.priority)}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                    <Badge
                      variant={
                        goal.status === "active" ? "default" : goal.status === "completed" ? "secondary" : "outline"
                      }
                      className="text-xs"
                    >
                      {goal.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>
                          {goal.progress}% of {goal.target}
                        </span>
                      </div>
                      <Progress value={goal.progress} />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          goal.priority === "high"
                            ? "border-red-500 text-red-500"
                            : goal.priority === "medium"
                              ? "border-yellow-500 text-yellow-500"
                              : "border-green-500 text-green-500"
                        }`}
                      >
                        {goal.priority} priority
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        {goal.status === "active" ? "Pause" : "Resume"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI-Powered Insights</h2>
            <p className="text-muted-foreground">Personalized recommendations based on your activity and goals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {rec.type}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground">{rec.confidence}% match</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{rec.title}</CardTitle>
                  <CardDescription>{rec.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-1">Why this recommendation?</p>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Progress value={rec.confidence} className="flex-1" />
                      <span className="text-sm text-muted-foreground">{rec.confidence}%</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Explore
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Career Compatibility Analysis</span>
              </CardTitle>
              <CardDescription>How well different career paths match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { career: "Machine Learning Engineer", match: 92, growth: "+15%", salary: "$120k-180k" },
                  { career: "Data Scientist", match: 88, growth: "+22%", salary: "$95k-150k" },
                  { career: "AI Research Scientist", match: 85, growth: "+25%", salary: "$130k-200k" },
                  { career: "Software Engineer (AI)", match: 82, growth: "+18%", salary: "$100k-160k" },
                  { career: "Product Manager (AI)", match: 75, growth: "+20%", salary: "$110k-170k" },
                ].map((career, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{career.career}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <span>Growth: {career.growth}</span>
                        <span>Salary: {career.salary}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{career.match}%</div>
                      <Progress value={career.match} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Manage your personal and professional details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userProfile?.avatar || "/placeholder.svg"} alt={userProfile?.name} />
                      <AvatarFallback>
                        {userProfile?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{userProfile?.name}</h3>
                      <p className="text-muted-foreground">{userProfile?.title}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{userProfile?.location}</span>
                      </div>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Bio</h4>
                    <p className="text-muted-foreground">{userProfile?.bio}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{userProfile?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Social Links</h4>
                    <div className="flex space-x-2">
                      {userProfile?.socialLinks.linkedin && (
                        <Button variant="outline" size="sm">
                          <LinkedinIcon className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                      )}
                      {userProfile?.socialLinks.github && (
                        <Button variant="outline" size="sm">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </Button>
                      )}
                      {userProfile?.socialLinks.twitter && (
                        <Button variant="outline" size="sm">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                      )}
                      {userProfile?.socialLinks.website && (
                        <Button variant="outline" size="sm">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Career Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.careerGoals.map((goal, index) => (
                      <Badge key={index} variant="secondary">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills & Interests */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userProfile?.skills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <Badge variant="outline">{skill}</Badge>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(Math.random() * 3) + 3 ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {userProfile?.interests.map((interest, index) => (
                      <Badge key={index} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member since</span>
                    <span className="text-sm font-medium">
                      {userProfile && new Date(userProfile.joinDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Profile views</span>
                    <span className="text-sm font-medium">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Connections</span>
                    <span className="text-sm font-medium">42</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
