"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Filter,
  Star,
  Calendar,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Download,
  Heart,
  Bookmark,
  Eye,
  Clock,
  Award,
  Video,
  Headphones,
  Eye as EyeIcon,
  X,
  Zap,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

/**
 * Enhanced Success Stories page
 *
 * - Debounced search
 * - Client-side filters and sorting
 * - Pagination / "Load more"
 * - Optimistic like/bookmark UX persisted to localStorage
 * - Share / export (CSV / JSON) utilities
 * - Accessible dialog with media players (video/audio)
 * - Lazy image loading & low-cost placeholders
 * - Keyboard shortcuts: "/" focus search, "?" help
 * - Analytics summary & breakdown
 *
 * Note: this file aims to be a production-ready, self-contained UI layer.
 */

/* ----- Types ----- */
interface TimelineEvent {
  year: string
  event: string
}

interface SuccessStory {
  id: string
  name: string
  photo?: string
  currentRole: string
  company: string
  domain: string
  previousBackground?: string
  storyShort: string
  storyFull: string
  keyLessons: string[]
  timeline: TimelineEvent[]
  inspiration?: string
  tags: string[]
  featured: boolean
  videoUrl?: string
  audioUrl?: string
  readingTime?: number
  likes?: number
  views?: number
  difficulty?: "Beginner" | "Intermediate" | "Advanced"
  careerChange?: boolean
}

interface MediaStats {
  totalViews: number
  totalLikes: number
  averageRating: number
  completionRate: number
}

/* ----- LocalStorage keys / constants ----- */
const LS_KEYS = {
  LIKED: "cozy_liked_stories_v1",
  BOOKMARKED: "cozy_bookmarked_stories_v1",
  VIEWED: "cozy_viewed_stories_v1",
}

const PAGE_SIZE = 8

/* ----- Utilities ----- */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 300) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    window.clearTimeout(t)
    // @ts-ignore
    t = window.setTimeout(() => fn(...args), wait)
  }
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function toCSV(rows: string[][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")
}

/* ----- Component ----- */
export default function SuccessStoriesPage() {
  const { toast } = useToast()
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [filtered, setFiltered] = useState<SuccessStory[]>([])
  const [query, setQuery] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [selectedMediaType, setSelectedMediaType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  const [liked, setLiked] = useState<string[]>([])
  const [bookmarked, setBookmarked] = useState<string[]>([])
  const [viewed, setViewed] = useState<string[]>([])

  const [mediaStats, setMediaStats] = useState<MediaStats | null>(null)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(PAGE_SIZE)
  const [sortBy, setSortBy] = useState<"featured" | "recent" | "likes">("featured")
  const [showOnlyFeatured, setShowOnlyFeatured] = useState(false)

  const searchRef = useRef<HTMLInputElement | null>(null)

  /* --- keyboard shortcuts: "/" focus search, "?" toast help --- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === "?") {
        e.preventDefault()
        toast({
          title: "Shortcuts",
          description: '"/" focus search — "?" show this help',
        })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toast])

  /* ----- Load stories (mock JSON) ----- */
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await fetch("/data/success-stories.json")
        const data = await res.json()

        // enhance each story with randomized engagement metrics for demo
        const enhanced: SuccessStory[] = data.map((s: SuccessStory, i: number) => ({
          ...s,
          photo: s.photo || `/placeholder.svg?query=${encodeURIComponent(s.name)}&i=${i}`,
          readingTime: s.readingTime ?? Math.floor(Math.random() * 8) + 3,
          likes: s.likes ?? Math.floor(Math.random() * 500) + 12,
          views: s.views ?? Math.floor(Math.random() * 5000) + 50,
          difficulty: s.difficulty ?? (["Beginner", "Intermediate", "Advanced"][Math.floor(Math.random() * 3)] as any),
          careerChange: s.careerChange ?? Math.random() > 0.5,
        }))

        if (!mounted) return
        setStories(enhanced)
        setFiltered(enhanced)
        setMediaStats({
          totalViews: enhanced.reduce((acc, it) => acc + (it.views ?? 0), 0),
          totalLikes: enhanced.reduce((acc, it) => acc + (it.likes ?? 0), 0),
          averageRating: 4.4,
          completionRate: 79,
        })
      } catch (err) {
        console.error(err)
        toast({ title: "Unable to load stories", description: "Please try again later." })
      } finally {
        setIsLoading(false)
      }
    }
    load()

    // load local state
    const l = localStorage.getItem(LS_KEYS.LIKED)
    const b = localStorage.getItem(LS_KEYS.BOOKMARKED)
    const v = localStorage.getItem(LS_KEYS.VIEWED)
    if (l) setLiked(JSON.parse(l))
    if (b) setBookmarked(JSON.parse(b))
    if (v) setViewed(JSON.parse(v))

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ----- Derived domain list (memoized) ----- */
  const domains = useMemo(() => {
    return Array.from(new Set(stories.map((s) => s.domain))).sort()
  }, [stories])

  /* ----- Debounced search/filter pipeline ----- */
  useEffect(() => {
    const apply = () => {
      const q = query.trim().toLowerCase()
      let tmp = [...stories]

      if (showOnlyFeatured) tmp = tmp.filter((s) => s.featured)
      if (q) {
        tmp = tmp.filter((s) => {
          return (
            s.name.toLowerCase().includes(q) ||
            s.currentRole.toLowerCase().includes(q) ||
            s.company.toLowerCase().includes(q) ||
            s.storyShort.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q))
          )
        })
      }

      if (selectedDomain !== "all") tmp = tmp.filter((s) => s.domain === selectedDomain)
      if (selectedDifficulty !== "all") tmp = tmp.filter((s) => s.difficulty === selectedDifficulty)

      if (selectedMediaType === "video") tmp = tmp.filter((s) => !!s.videoUrl)
      else if (selectedMediaType === "audio") tmp = tmp.filter((s) => !!s.audioUrl)
      else if (selectedMediaType === "text") tmp = tmp.filter((s) => !s.videoUrl && !s.audioUrl)

      // Sorting
      tmp.sort((a, b) => {
        if (sortBy === "featured") {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
        }
        if (sortBy === "likes") return (b.likes ?? 0) - (a.likes ?? 0)
        // recent fallback (use views as proxy if no date)
        return (b.views ?? 0) - (a.views ?? 0)
      })

      setFiltered(tmp)
      setPage(1)
    }

    const debounced = debounce(apply, 220)
    debounced()
    // run immediately for simple cases
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedDomain, selectedDifficulty, selectedMediaType, sortBy, showOnlyFeatured, stories])

  /* ----- Pagination / "Load more" ----- */
  const paginated = useMemo(() => {
    const start = 0
    const end = page * pageSize
    return filtered.slice(start, end)
  }, [filtered, page, pageSize])

  /* ----- Optimistic UX for like/bookmark ----- */
  const toggleLike = useCallback(
    (id: string) => {
      setLiked((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
        localStorage.setItem(LS_KEYS.LIKED, JSON.stringify(next))
        return next
      })
      // update stories likes count optimistically
      setStories((prev) => prev.map((s) => (s.id === id ? { ...s, likes: (s.likes ?? 0) + (liked.includes(id) ? -1 : 1) } : s)))
    },
    [liked]
  )

  const toggleBookmark = useCallback((id: string) => {
    setBookmarked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]
      localStorage.setItem(LS_KEYS.BOOKMARKED, JSON.stringify(next))
      return next
    })
  }, [])

  const markViewed = useCallback((id: string) => {
    setViewed((prev) => {
      if (prev.includes(id)) return prev
      const n = [id, ...prev]
      localStorage.setItem(LS_KEYS.VIEWED, JSON.stringify(n))
      return n
    })
  }, [])

  /* ----- Exports & sharing ----- */
  const exportCSV = useCallback(() => {
    const rows = [
      ["Name", "Role", "Company", "Domain", "Likes", "Views", "ReadingTime", "Tags"],
      ...filtered.map((s) => [
        s.name,
        s.currentRole,
        s.company,
        s.domain,
        String(s.likes ?? 0),
        String(s.views ?? 0),
        String(s.readingTime ?? ""),
        (s.tags || []).join("; "),
      ]),
    ]
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `success-stories-${new Date().toISOString()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "CSV exported" })
  }, [filtered, toast])

  const exportJSON = useCallback(() => {
    downloadJSON(`success-stories-${Date.now()}.json`, filtered)
    toast({ title: "JSON exported" })
  }, [filtered, toast])

  const sharePage = useCallback(async () => {
    const shareData = {
      title: "Success Stories",
      text: `I found ${filtered.length} inspiring success stories`,
      url: window.location.href,
    }
    try {
      if ((navigator as any).share) {
        await (navigator as any).share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({ title: "Link copied", description: "URL copied to clipboard" })
      }
    } catch (err) {
      toast({ title: "Unable to share" })
    }
  }, [filtered.length, toast])

  /* ----- Video / Audio player refs ----- */
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  /* ----- Helper: open story in modal (Dialog) ----- */
  // We'll render StoryModal below and pass control props

  /* ----- Loading skeleton helper ----- */
  const SkeletonCard = () => (
    <div className="animate-pulse border rounded-md p-4 bg-[var(--cozy-card-bg)]/30">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/5 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-2/3" />
        </div>
      </div>
    </div>
  )

  /* ----- Render ----- */
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Success Stories & Multimedia</h1>
              <p className="text-sm text-muted-foreground">Loading content...</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    )
  }

  /* ----- UI markup ----- */
  return (
    <div className="container mx-auto px-4 py-8 text-[var(--color-foreground)]">
      {/* Header + actions */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Success Stories & Multimedia</h1>
          <p className="text-[var(--color-muted-foreground)]">
            Get inspired by real professionals — videos, podcasts, and in-depth journeys.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportJSON}>
            <ChevronDown className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
          <Button onClick={sharePage}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Stats */}
      {mediaStats && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <EyeIcon className="h-4 w-4 text-[var(--color-primary)]" />
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Total Views</div>
                  <div className="text-lg font-semibold">{mediaStats.totalViews.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-[var(--color-primary)]" />
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Total Likes</div>
                  <div className="text-lg font-semibold">{mediaStats.totalLikes.toLocaleString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-[var(--color-primary)]" />
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Avg Rating</div>
                  <div className="text-lg font-semibold">{mediaStats.averageRating.toFixed(1)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-[var(--color-primary)]" />
                <div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">Completion</div>
                  <div className="text-lg font-semibold">{mediaStats.completionRate}%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs & main area */}
      <Tabs defaultValue="all-stories" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-stories">All Stories</TabsTrigger>
          <TabsTrigger value="video-stories">Video</TabsTrigger>
          <TabsTrigger value="audio-stories">Podcasts</TabsTrigger>
          <TabsTrigger value="my-collection">My Collection</TabsTrigger>
        </TabsList>

        {/* All Stories */}
        <TabsContent value="all-stories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters */}
            <aside className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-5 w-5 text-[var(--color-primary)]" />
                      Filters
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setQuery("")
                      setSelectedDomain("all")
                      setSelectedDifficulty("all")
                      setSelectedMediaType("all")
                      setShowOnlyFeatured(false)
                      toast({ title: "Filters cleared" })
                    }}>
                      Clear
                    </Button>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--color-muted-foreground)]" />
                    <Input
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, role, tag..."
                      className="pl-10"
                      aria-label="Search stories"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Domain</label>
                    <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                      <SelectTrigger>
                        <SelectValue placeholder="All domains" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        {domains.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="All levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Media Type</label>
                    <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="video">Video Stories</SelectItem>
                        <SelectItem value="audio">Audio/Podcasts</SelectItem>
                        <SelectItem value="text">Text Stories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sort</label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="featuredOnly"
                      type="checkbox"
                      checked={showOnlyFeatured}
                      onChange={() => setShowOnlyFeatured((s) => !s)}
                      className="accent-[var(--color-primary)]"
                    />
                    <label htmlFor="featuredOnly" className="text-sm">
                      Show only featured
                    </label>
                  </div>

                  <div className="pt-2">
                    <Button variant="ghost" size="sm" onClick={() => { setPage(1); toast({ title: "Filters applied" }) }}>
                      Apply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Stories list */}
            <main className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Showing {filtered.length} stories — {paginated.length} loaded
                </p>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setPage(1); toast({ title: "Refreshed" }) }}>
                    Refresh
                  </Button>
                </div>
              </div>

              {filtered.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent>
                    <Search className="h-12 w-12 text-[var(--color-muted-foreground)] mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No stories found</h3>
                    <p className="text-[var(--color-muted-foreground)] mb-4">
                      Try adjusting filters or search query.
                    </p>
                    <Button onClick={() => {
                      setQuery("")
                      setSelectedDomain("all")
                      setSelectedDifficulty("all")
                      setSelectedMediaType("all")
                    }}>Clear Filters</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginated.map((story) => (
                    <Card key={story.id} className="group hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <img
                              src={story.photo}
                              loading="lazy"
                              alt={story.name}
                              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                            {story.videoUrl && (
                              <div className="absolute -bottom-1 -right-1 bg-[var(--color-primary)] rounded-full p-1">
                                <Video className="h-3 w-3 text-[var(--color-primary-foreground)]" />
                              </div>
                            )}
                            {story.audioUrl && (
                              <div className="absolute -bottom-1 -left-1 bg-[var(--color-secondary)] rounded-full p-1">
                                <Headphones className="h-3 w-3 text-[var(--color-secondary-foreground)]" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg mb-1">{story.name}</CardTitle>
                            <CardDescription>
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{story.currentRole}</div>
                                <div className="text-sm text-[var(--color-muted-foreground)]">{story.company}</div>
                              </div>
                            </CardDescription>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            {story.featured && (
                              <Badge variant="secondary" className="px-2 py-0.5">
                                <Star className="h-3 w-3 mr-1 inline-block" />
                                Featured
                              </Badge>
                            )}
                            {story.careerChange && <Badge variant="outline">Career Change</Badge>}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{story.domain}</Badge>
                            {story.difficulty && <Badge variant="secondary">{story.difficulty}</Badge>}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{story.readingTime}m</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <EyeIcon className="h-3 w-3" />
                              <span>{story.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              <span>{story.likes}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-3">{story.storyShort}</p>

                        <div className="flex gap-2 items-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                className="flex-1"
                                onClick={() => {
                                  markViewed(story.id)
                                }}
                              >
                                {story.videoUrl ? "Watch" : story.audioUrl ? "Listen" : "Read"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh]">
                              <StoryModal
                                story={story}
                                onLike={() => toggleLike(story.id)}
                                onBookmark={() => toggleBookmark(story.id)}
                                isLiked={liked.includes(story.id)}
                                isBookmarked={bookmarked.includes(story.id)}
                                currentlyPlaying={currentlyPlaying}
                                setCurrentlyPlaying={setCurrentlyPlaying}
                                audioRef={audioRef}
                                videoRef={videoRef}
                              />
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(story.id)}
                            aria-pressed={liked.includes(story.id)}
                          >
                            <Heart className={`h-4 w-4 ${liked.includes(story.id) ? "text-red-500" : ""}`} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(story.id)}
                            aria-pressed={bookmarked.includes(story.id)}
                          >
                            <Bookmark className={`h-4 w-4 ${bookmarked.includes(story.id) ? "text-[var(--color-primary)]" : ""}`} />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {story.tags.slice(0, 4).map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Load more */}
                  {filtered.length > paginated.length && (
                    <div className="col-span-full text-center mt-2">
                      <Button onClick={() => setPage((p) => p + 1)}>Load more</Button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </TabsContent>

        {/* Video Stories */}
        <TabsContent value="video-stories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.filter((s) => s.videoUrl).map((s) => (
              <Card key={s.id}>
                <CardContent className="p-0">
                  <div className="relative">
                    <img src={s.videoUrl} alt={`${s.name} video`} className="w-full h-48 object-cover rounded-t-md" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="lg" className="rounded-full">
                            <Play className="h-6 w-6" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh]">
                          <StoryModal
                            story={s}
                            onLike={() => toggleLike(s.id)}
                            onBookmark={() => toggleBookmark(s.id)}
                            isLiked={liked.includes(s.id)}
                            isBookmarked={bookmarked.includes(s.id)}
                            currentlyPlaying={currentlyPlaying}
                            setCurrentlyPlaying={setCurrentlyPlaying}
                            audioRef={audioRef}
                            videoRef={videoRef}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Badge className="absolute top-2 left-2">Video</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{s.name}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{s.currentRole} • {s.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audio / Podcasts */}
        <TabsContent value="audio-stories" className="space-y-6">
          <div className="space-y-4">
            {stories.filter((s) => s.audioUrl).map((s) => (
              <Card key={s.id}>
                <CardContent className="flex items-center gap-4">
                  <img src={s.photo} alt={s.name} className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{s.currentRole} • {s.company}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentlyPlaying((cur) => (cur === s.id ? null : s.id))}
                      >
                        {currentlyPlaying === s.id ? <Pause /> : <Play />}
                      </Button>
                      <div className="text-xs text-[var(--color-muted-foreground)]">{s.readingTime}m</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Collection */}
        <TabsContent value="my-collection" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Bookmarked</CardTitle>
                <CardDescription>Your saved stories for later</CardDescription>
              </CardHeader>
              <CardContent>
                {bookmarked.length === 0 ? (
                  <p className="text-[var(--color-muted-foreground)]">No bookmarks yet</p>
                ) : (
                  bookmarked.map((id) => {
                    const s = stories.find((x) => x.id === id)
                    if (!s) return null
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 border rounded mb-2">
                        <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-[var(--color-muted-foreground)]">{s.currentRole}</div>
                        </div>
                        <Badge variant="outline">{s.domain}</Badge>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liked</CardTitle>
                <CardDescription>Stories you liked</CardDescription>
              </CardHeader>
              <CardContent>
                {liked.length === 0 ? (
                  <p className="text-[var(--color-muted-foreground)]">No likes yet</p>
                ) : (
                  liked.map((id) => {
                    const s = stories.find((x) => x.id === id)
                    if (!s) return null
                    return (
                      <div key={s.id} className="flex items-center gap-3 p-3 border rounded mb-2">
                        <img src={s.photo} alt={s.name} className="w-12 h-12 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-[var(--color-muted-foreground)]">{s.currentRole}</div>
                        </div>
                        <div className="text-xs text-[var(--color-muted-foreground)]">
                          <Heart className="inline-block mr-1 h-3 w-3 text-red-500" />
                          {s.likes}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ----- Story Modal (media + details) ----- */
function StoryModal({
  story,
  onLike,
  onBookmark,
  isLiked,
  isBookmarked,
  currentlyPlaying,
  setCurrentlyPlaying,
  audioRef,
  videoRef,
}: {
  story: SuccessStory
  onLike: () => void
  onBookmark: () => void
  isLiked: boolean
  isBookmarked: boolean
  currentlyPlaying: string | null
  setCurrentlyPlaying: (id: string | null) => void
  audioRef?: React.RefObject<HTMLAudioElement>
  videoRef?: React.RefObject<HTMLVideoElement>
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (currentlyPlaying && currentlyPlaying !== story.id) {
      setIsPlaying(false)
    }
  }, [currentlyPlaying, story.id])

  const togglePlay = () => {
    if (story.audioUrl) {
      if (currentlyPlaying === story.id) {
        setCurrentlyPlaying(null)
        setIsPlaying(false)
      } else {
        setCurrentlyPlaying(story.id)
        setIsPlaying(true)
      }
    } else if (story.videoUrl) {
      // play/pause video element if provided
      const v = videoRef?.current
      if (v) {
        if (v.paused) v.play().catch(() => {})
        else v.pause()
      }
      setIsPlaying((p) => !p)
    }
  }

  const toggleMute = () => {
    setIsMuted((m) => !m)
    if (audioRef?.current) audioRef.current.muted = !audioRef.current.muted
    if (videoRef?.current) videoRef.current.muted = !videoRef?.current.muted
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img src={story.photo} alt={story.name} className="w-16 h-16 rounded-full object-cover" />
            <div>
              <DialogTitle>{story.name}</DialogTitle>
              <DialogDescription>
                <div className="text-sm">
                  {story.currentRole} • {story.company}
                </div>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">{story.domain}</Badge>
                  {story.difficulty && <Badge variant="secondary">{story.difficulty}</Badge>}
                </div>
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onLike} aria-pressed={isLiked}>
              <Heart className={`h-4 w-4 ${isLiked ? "text-red-500" : ""}`} />
              <span className="sr-only">Like</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onBookmark} aria-pressed={isBookmarked}>
              <Bookmark className={`h-4 w-4 ${isBookmarked ? "text-[var(--color-primary)]" : ""}`} />
              <span className="sr-only">Bookmark</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              // quick share link
              const url = `${window.location.href}#story-${story.id}`
              navigator.clipboard.writeText(url).then(() => {
                // silent success; assume toast hook above will show
              })
            }}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-6">
          {/* Media */}
          {(story.videoUrl || story.audioUrl) && (
            <div className="bg-[var(--cozy-card-bg)]/10 p-4 rounded-md">
              {story.videoUrl && (
                <div className="relative mb-4">
                  <video
                    ref={videoRef as any}
                    src={story.videoUrl}
                    controls
                    poster={story.photo}
                    className="w-full h-64 object-cover rounded-md"
                    aria-label={`${story.name} video`}
                  />
                </div>
              )}

              {story.audioUrl && (
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => {
                    // setCurrentlyPlaying handled below
                    // handled in parent; leaving for accessibility
                    if (currentlyPlaying === story.id) setCurrentlyPlaying(null)
                    else setCurrentlyPlaying(story.id)
                  }}>
                    {currentlyPlaying === story.id ? <Pause /> : <Play />}
                  </Button>

                  <div className="flex-1">
                    <audio ref={audioRef as any} src={story.audioUrl} controls className="w-full" />
                    <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                      <span>{story.readingTime}m</span>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setIsMuted((m) => !m)
                          if (audioRef?.current) audioRef.current.muted = !audioRef.current.muted
                        }}>
                          {isMuted ? <VolumeX /> : <Volume2 />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full story */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />The Journey</h3>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed">{story.storyFull}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="h-5 w-5 text-[var(--color-primary)]" />Timeline</h3>
            <div className="space-y-3">
              {story.timeline.map((t, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-20 text-sm text-[var(--color-primary)] font-medium">{t.year}</div>
                  <div className="flex-1 text-sm">{t.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Lessons & inspiration */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-[var(--color-primary)]" />Key Lessons</h3>
            <div className="space-y-2">
              {story.keyLessons.map((k, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-2" />
                  <div className="text-sm">{k}</div>
                </div>
              ))}
            </div>
          </div>

          {story.inspiration && (
            <div className="bg-[var(--cozy-card-bg)]/10 p-4 rounded-md">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-[var(--color-primary)]" />Words of Inspiration</h3>
              <p className="italic text-[var(--color-muted-foreground)]">"{story.inspiration}"</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Related Tags</h3>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
