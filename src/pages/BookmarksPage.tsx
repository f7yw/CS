"use client"

import { useState, useEffect } from "react"
import { Bookmark, Download, Search, Trash2, Edit3, Save, X, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Link } from "react-router-dom"

interface BookmarkedItem {
  id: string
  title: string
  description: string
  type: "career" | "resource" | "story"
  category?: string
  industry?: string
  savedAt: number
  note: string
  url: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    loadBookmarks()
  }, [])

  const loadBookmarks = () => {
    const savedBookmarks = localStorage.getItem("bookmarks")
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks))
    }
  }

  const saveBookmarks = (newBookmarks: BookmarkedItem[]) => {
    localStorage.setItem("bookmarks", JSON.stringify(newBookmarks))
    setBookmarks(newBookmarks)
  }

  const removeBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter((b) => b.id !== id)
    saveBookmarks(newBookmarks)
    toast({
      title: "Bookmark removed",
      description: "Item has been removed from your bookmarks.",
    })
  }

  const updateNote = (id: string, note: string) => {
    const newBookmarks = bookmarks.map((b) => (b.id === id ? { ...b, note } : b))
    saveBookmarks(newBookmarks)
    setEditingNote(null)
    setNoteText("")
    toast({
      title: "Note updated",
      description: "Your note has been saved.",
    })
  }

  const startEditingNote = (bookmark: BookmarkedItem) => {
    setEditingNote(bookmark.id)
    setNoteText(bookmark.note)
  }

  const cancelEditingNote = () => {
    setEditingNote(null)
    setNoteText("")
  }

  const exportBookmarks = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalBookmarks: bookmarks.length,
      bookmarks: bookmarks.map((b) => ({
        title: b.title,
        description: b.description,
        type: b.type,
        category: b.category,
        industry: b.industry,
        savedAt: new Date(b.savedAt).toISOString(),
        note: b.note,
        url: `${window.location.origin}${b.url}`,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `nextstep-bookmarks-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Bookmarks exported",
      description: "Your bookmarks have been downloaded as a JSON file.",
    })
  }

  const shareBookmarks = async () => {
    const shareText = `Check out my career bookmarks from NextStep Navigator:\n\n${bookmarks
      .slice(0, 3)
      .map((b) => `• ${b.title}`)
      .join("\n")}\n\nExplore more at ${window.location.origin}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Career Bookmarks",
          text: shareText,
          url: window.location.origin,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(shareText)
      toast({
        title: "Copied to clipboard",
        description: "Share text has been copied to your clipboard.",
      })
    }
  }

  const filteredBookmarks = bookmarks.filter(
    (bookmark) =>
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.note.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case "career":
        return "bg-primary/10 text-primary"
      case "resource":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
      case "story":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">My Bookmarks</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your saved careers, resources, and success stories with personal notes.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search bookmarks and notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto justify-center">
              <Button onClick={shareBookmarks} variant="outline" disabled={bookmarks.length === 0}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={exportBookmarks}
                disabled={bookmarks.length === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Download className="h-4 w-4 mr-2" />
                Export ({bookmarks.length})
              </Button>
            </div>
          </div>
        </div>

        {/* Bookmarks List */}
        {filteredBookmarks.length > 0 ? (
          <div className="space-y-6">
            {filteredBookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="hover:shadow-lg transition-shadow border bg-card text-card-foreground">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge className={getTypeColor(bookmark.type)}>{bookmark.type}</Badge>
                        {bookmark.category && <Badge variant="outline">{bookmark.category}</Badge>}
                        {bookmark.industry && <Badge variant="secondary">{bookmark.industry}</Badge>}
                      </div>
                      <CardTitle className="text-xl">
                        <Link to={bookmark.url} className="hover:text-primary transition-colors break-words">
                          {bookmark.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="mt-2">{bookmark.description}</CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        Saved on {new Date(bookmark.savedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => removeBookmark(bookmark.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">Personal Note</h4>
                        {editingNote !== bookmark.id && (
                          <Button onClick={() => startEditingNote(bookmark)} variant="ghost" size="sm">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {editingNote === bookmark.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add your personal notes about this item..."
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              onClick={() => updateNote(bookmark.id, noteText)}
                              size="sm"
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button onClick={cancelEditingNote} variant="outline" size="sm">
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted rounded-lg p-3">
                          {bookmark.note ? (
                            <p className="text-foreground whitespace-pre-wrap break-words">{bookmark.note}</p>
                          ) : (
                            <p className="text-muted-foreground italic">
                              No notes added yet. Click the edit button to add your thoughts.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-medium text-foreground mb-2">
              {bookmarks.length === 0 ? "No bookmarks yet" : "No matching bookmarks"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {bookmarks.length === 0
                ? "Start exploring careers, resources, and success stories to build your collection."
                : "Try adjusting your search terms to find what you're looking for."}
            </p>
            {bookmarks.length === 0 && (
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild>
                  <Link to="/career-bank">Explore Careers</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/resources">Browse Resources</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
