"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Users,
  Bookmark,
  BookmarkCheck,
  Share2,
  FileText,
  Lightbulb,
  Target,
  BookOpen,
} from "lucide-react"

interface Career {
  id: string
  title: string
  industry: string
  description: string
  skills: string[]
  education: string[]
  salaryRange: {
    min: number
    max: number
    currency: string
  }
  image: string
  tags: string[]
  level: string[]
  growthRate: string
  jobOutlook: string
}

interface Props {
  params: { id: string }
}

export default function CareerDetailPage({ params }: Props) {
  const router = useRouter()
  const [career, setCareer] = useState<Career | null>(null)
  const [relatedCareers, setRelatedCareers] = useState<Career[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [personalNote, setPersonalNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCareerData = async () => {
      try {
        const response = await fetch("/data/careers.json")
        const careers: Career[] = await response.json()
        const currentCareer = careers.find((c) => c.id === params.id)

        if (currentCareer) {
          setCareer(currentCareer)

          // Related careers
          const related = careers
            .filter((c) => c.industry === currentCareer.industry && c.id !== currentCareer.id)
            .slice(0, 3)
          setRelatedCareers(related)

          // Bookmarked
          const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCareers") || "[]")
          setIsBookmarked(bookmarks.includes(currentCareer.id))

          // Personal note
          const notes = JSON.parse(localStorage.getItem("careerNotes") || "{}")
          setPersonalNote(notes[currentCareer.id] || "")

          // Viewed
          const viewed = JSON.parse(localStorage.getItem("viewedCareers") || "[]")
          if (!viewed.includes(currentCareer.id)) {
            const newViewed = [...viewed, currentCareer.id]
            localStorage.setItem("viewedCareers", JSON.stringify(newViewed))
          }
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load career data:", error)
        setIsLoading(false)
      }
    }

    loadCareerData()
  }, [params.id])

  const toggleBookmark = () => {
    if (!career) return
    const bookmarks = JSON.parse(localStorage.getItem("bookmarkedCareers") || "[]")
    const newBookmarks = isBookmarked ? bookmarks.filter((id: string) => id !== career.id) : [...bookmarks, career.id]
    localStorage.setItem("bookmarkedCareers", JSON.stringify(newBookmarks))
    setIsBookmarked(!isBookmarked)
  }

  const saveNote = () => {
    if (!career) return
    const notes = JSON.parse(localStorage.getItem("careerNotes") || "{}")
    notes[career.id] = personalNote
    localStorage.setItem("careerNotes", JSON.stringify(notes))
  }

  const shareCareer = async () => {
    if (!career) return
    const shareData = {
      title: `${career.title} - NextStep Navigator`,
      text: `Check out this career opportunity: ${career.title}`,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (isLoading) return <p>Loading career details...</p>
  if (!career) return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold mb-4">Career Not Found</h1>
      <Button onClick={() => router.push("/career-bank")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Career Bank
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/career-bank")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Career Bank
        </Button>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={shareCareer}>
            <Share2 className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={toggleBookmark}>
            {isBookmarked ? (
              <>
                <BookmarkCheck className="h-4 w-4 mr-2 text-primary" /> Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4 mr-2" /> Bookmark
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Career Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{career.title}</CardTitle>
                  <CardDescription className="flex items-center space-x-2">
                    <Badge variant="secondary">{career.industry}</Badge>
                    <span>•</span>
                    <span>{career.jobOutlook}</span>
                  </CardDescription>
                </div>
                <img
                  src={career.image || "/placeholder.svg"}
                  alt={career.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{career.description}</p>
            </CardContent>
          </Card>

          {/* Key Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Salary Range</p>
                  <p className="text-sm text-muted-foreground">
                    ${career.salaryRange.min.toLocaleString()} - ${career.salaryRange.max.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Growth Rate</p>
                  <p className="text-sm text-muted-foreground">{career.growthRate} annually</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" /> <span>Skills Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {career.skills.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" /> <span>Education Path</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {career.education.map((edu, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{edu}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personal Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" /> <span>Personal Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">Add your thoughts about this career</Label>
                <Textarea
                  id="note"
                  placeholder="Your thoughts..."
                  value={personalNote}
                  onChange={(e) => setPersonalNote(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={saveNote} size="sm">Save Note</Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/quiz")}>
                <Lightbulb className="h-4 w-4 mr-2" /> Take Interest Quiz
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/resources")}>
                <BookOpen className="h-4 w-4 mr-2" /> Find Resources
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/stories")}>
                <Users className="h-4 w-4 mr-2" /> Read Success Stories
              </Button>
            </CardContent>
          </Card>

          {/* Related Careers */}
          {relatedCareers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Careers</CardTitle>
                <CardDescription>Other opportunities in {career.industry}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedCareers.map((c) => (
                  <Button key={c.id} variant="ghost" className="w-full text-left" onClick={() => router.push(`/career-bank/${c.id}`)}>
                    {c.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Career Tags */}
          <Card>
            <CardHeader><CardTitle>Career Tags</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {career.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
