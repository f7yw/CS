"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, Search, Filter, Video, Headphones, Star, Eye } from "lucide-react"

interface MultimediaItem {
  id: string
  title: string
  type: "video" | "podcast"
  youtubeId?: string
  audioUrl?: string
  thumbnail: string
  duration: string
  category: string
  userType: string[]
  industry: string
  description: string
  transcript: string
  tags: string[]
  featured: boolean
}

export default function MultimediaPage() {
  const [multimedia, setMultimedia] = useState<MultimediaItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MultimediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [userType, setUserType] = useState("")
  const [viewedItems, setViewedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load multimedia data
  useEffect(() => {
    const loadMultimedia = async () => {
      try {
        const response = await fetch("/data/multimedia.json")
        const data = await response.json()
        setMultimedia(data)
        setFilteredItems(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to load multimedia:", error)
        setIsLoading(false)
      }
    }
    loadMultimedia()
  }, [])

  // Load user preferences
  useEffect(() => {
    const storedUserType = sessionStorage.getItem("userType")
    const storedViewed = localStorage.getItem("viewedMultimedia")

    if (storedUserType) setUserType(storedUserType)
    if (storedViewed) setViewedItems(JSON.parse(storedViewed))
  }, [])

  // Get unique values for filters
  const categories = [...new Set(multimedia.map((item) => item.category))].sort()
  const industries = [...new Set(multimedia.map((item) => item.industry))].sort()

  // Filter multimedia items
  useEffect(() => {
    const filtered = multimedia.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
      const matchesIndustry = selectedIndustry === "all" || item.industry === selectedIndustry
      const matchesType = selectedType === "all" || item.type === selectedType

      // Filter by user type if available
      const matchesUserType =
        !userType ||
        item.userType.includes(
          userType === "student" ? "Student" : userType === "graduate" ? "Graduate" : "Professional",
        )

      return matchesSearch && matchesCategory && matchesIndustry && matchesType && matchesUserType
    })

    // Sort featured items first
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })

    setFilteredItems(filtered)
  }, [multimedia, searchTerm, selectedCategory, selectedIndustry, selectedType, userType])

  const markAsViewed = (itemId: string) => {
    if (!viewedItems.includes(itemId)) {
      const newViewed = [...viewedItems, itemId]
      setViewedItems(newViewed)
      localStorage.setItem("viewedMultimedia", JSON.stringify(newViewed))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedIndustry("all")
    setSelectedType("all")
  }

  const featuredItems = multimedia.filter((item) => item.featured)
  const videoItems = filteredItems.filter((item) => item.type === "video")
  const podcastItems = filteredItems.filter((item) => item.type === "podcast")

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading multimedia content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">Multimedia Guidance</h1>
        <p className="text-muted-foreground text-lg">
          Learn from professionals through videos and podcasts sharing real career insights
        </p>
      </div>

      {/* Featured Content */}
      {featuredItems.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-semibold mb-4 flex items-center space-x-2">
            <Star className="h-6 w-6 text-primary" />
            <span>Featured Content</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.slice(0, 3).map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
                <div className="relative">
                  <img
                    src={item.thumbnail || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-t-lg" />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      {item.type === "video" ? (
                        <Video className="h-3 w-3 mr-1" />
                      ) : (
                        <Headphones className="h-3 w-3 mr-1" />
                      )}
                      {item.type}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Badge variant="secondary" className="bg-black/50 text-white">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.duration}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => markAsViewed(item.id)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </Button>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.industry}</Badge>
                    {viewedItems.includes(item.id) && (
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Watched
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="w-fit">
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search Content
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search videos, podcasts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="podcast">Podcasts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Content ({filteredItems.length})</TabsTrigger>
              <TabsTrigger value="videos">Videos ({videoItems.length})</TabsTrigger>
              <TabsTrigger value="podcasts">Podcasts ({podcastItems.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <MultimediaGrid items={filteredItems} viewedItems={viewedItems} onMarkViewed={markAsViewed} />
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <MultimediaGrid items={videoItems} viewedItems={viewedItems} onMarkViewed={markAsViewed} />
            </TabsContent>

            <TabsContent value="podcasts" className="mt-6">
              <MultimediaGrid items={podcastItems} viewedItems={viewedItems} onMarkViewed={markAsViewed} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

function MultimediaGrid({
  items,
  viewedItems,
  onMarkViewed,
}: {
  items: MultimediaItem[]
  viewedItems: string[]
  onMarkViewed: (id: string) => void
}) {
  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CardContent>
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No content found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to find more content.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="group hover:shadow-lg transition-all duration-200">
          <div className="relative">
            <img
              src={item.thumbnail || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors rounded-t-lg" />
            <div className="absolute top-4 left-4 flex space-x-2">
              <Badge variant="secondary" className="bg-black/50 text-white">
                {item.type === "video" ? <Video className="h-3 w-3 mr-1" /> : <Headphones className="h-3 w-3 mr-1" />}
                {item.type}
              </Badge>
              {item.featured && (
                <Badge variant="secondary" className="bg-primary/80 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="absolute bottom-4 right-4">
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {item.duration}
              </Badge>
            </div>
            <Button
              size="sm"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onMarkViewed(item.id)}
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{item.industry}</Badge>
              <Badge variant="outline">{item.category.replace("-", " ")}</Badge>
              {viewedItems.includes(item.id) && (
                <Badge variant="secondary" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  Watched
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.description}</p>
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
