"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Heart, Reply, MoreVertical, Flag, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sanitizeInput } from "@/lib/validation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
    userType: string
  }
  timestamp: string
  likes: string[] // Array of user IDs who liked
  replies: Comment[]
  isEdited: boolean
  editedAt?: string
}

interface CommentsSystemProps {
  pageId: string // Unique identifier for the page/content
  className?: string
}

export default function CommentsSystem({ pageId, className }: CommentsSystemProps) {
  // Comments state management
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { toast } = useToast()

  // Get current user authentication status
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("current_user") || "null")
    } catch {
      return null
    }
  }

  const currentUser = getCurrentUser()
  const isAuthenticated = !!currentUser

  // Load comments for this page on component mount
  useEffect(() => {
    loadComments()
  }, [pageId])

  // Load comments from localStorage
  const loadComments = () => {
    try {
      const allComments = JSON.parse(localStorage.getItem("page_comments") || "{}")
      const pageComments = allComments[pageId] || []
      setComments(pageComments)
    } catch (error) {
      console.error("[v0] Error loading comments:", error)
      setComments([])
    }
  }

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    try {
      const allComments = JSON.parse(localStorage.getItem("page_comments") || "{}")
      allComments[pageId] = updatedComments
      localStorage.setItem("page_comments", JSON.stringify(allComments))
      setComments(updatedComments)
    } catch (error) {
      console.error("[v0] Error saving comments:", error)
    }
  }

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post comments.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create new comment object
      const comment: Comment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: sanitizeInput(newComment.trim()),
        author: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          userType: currentUser.userType || "user",
        },
        timestamp: new Date().toISOString(),
        likes: [],
        replies: [],
        isEdited: false,
      }

      // Add comment to the list
      const updatedComments = [comment, ...comments]
      saveComments(updatedComments)

      // Clear form
      setNewComment("")

      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("[v0] Error posting comment:", error)
      toast({
        title: "Error posting comment",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit reply to a comment
  const handleSubmitReply = async (parentCommentId: string) => {
    if (!isAuthenticated || !replyContent.trim()) return

    setIsSubmitting(true)

    try {
      const reply: Comment = {
        id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: sanitizeInput(replyContent.trim()),
        author: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          userType: currentUser.userType || "user",
        },
        timestamp: new Date().toISOString(),
        likes: [],
        replies: [],
        isEdited: false,
      }

      // Add reply to parent comment
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentCommentId) {
          return {
            ...comment,
            replies: [reply, ...comment.replies],
          }
        }
        return comment
      })

      saveComments(updatedComments)
      setReplyingTo(null)
      setReplyContent("")

      toast({
        title: "Reply posted!",
        description: "Your reply has been added successfully.",
      })
    } catch (error) {
      console.error("[v0] Error posting reply:", error)
      toast({
        title: "Error posting reply",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Toggle like on a comment
  const handleToggleLike = (commentId: string, isReply = false, parentId?: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments.",
        variant: "destructive",
      })
      return
    }

    const updatedComments = comments.map((comment) => {
      if (isReply && comment.id === parentId) {
        // Handle reply like
        return {
          ...comment,
          replies: comment.replies.map((reply) => {
            if (reply.id === commentId) {
              const hasLiked = reply.likes.includes(currentUser.id)
              return {
                ...reply,
                likes: hasLiked ? reply.likes.filter((id) => id !== currentUser.id) : [...reply.likes, currentUser.id],
              }
            }
            return reply
          }),
        }
      } else if (comment.id === commentId) {
        // Handle main comment like
        const hasLiked = comment.likes.includes(currentUser.id)
        return {
          ...comment,
          likes: hasLiked ? comment.likes.filter((id) => id !== currentUser.id) : [...comment.likes, currentUser.id],
        }
      }
      return comment
    })

    saveComments(updatedComments)
  }

  // Delete comment (only by author)
  const handleDeleteComment = (commentId: string, isReply = false, parentId?: string) => {
    if (!isAuthenticated) return

    const updatedComments = comments
      .map((comment) => {
        if (isReply && comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== commentId || reply.author.id === currentUser.id),
          }
        }
        return comment
      })
      .filter((comment) => comment.id !== commentId || comment.author.id === currentUser.id)

    saveComments(updatedComments)
    toast({
      title: "Comment deleted",
      description: "Your comment has been removed.",
    })
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "Just now"
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Render individual comment component
  const CommentItem = ({
    comment,
    isReply = false,
    parentId,
  }: {
    comment: Comment
    isReply?: boolean
    parentId?: string
  }) => (
    <div className={`${isReply ? "ml-8 mt-3" : "mb-6"} space-y-3`}>
      <div className="flex items-start space-x-3">
        {/* User avatar */}
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs">
            {getUserInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Comment header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-white text-sm">{comment.author.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(comment.timestamp)}</span>
            {comment.isEdited && <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>}
          </div>

          {/* Comment content */}
          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">{comment.content}</div>

          {/* Comment actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleToggleLike(comment.id, isReply, parentId)}
              className={`flex items-center space-x-1 text-xs transition-colors ${
                comment.likes.includes(currentUser?.id || "")
                  ? "text-red-500"
                  : "text-gray-500 dark:text-gray-400 hover:text-red-500"
              }`}
            >
              <Heart className={`h-3 w-3 ${comment.likes.includes(currentUser?.id || "") ? "fill-current" : ""}`} />
              <span>{comment.likes.length}</span>
            </button>

            {!isReply && isAuthenticated && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            )}

            {/* Comment options menu */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {comment.author.id === currentUser.id ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditContent(comment.content)
                        }}
                      >
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment.id, isReply, parentId)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <Flag className="h-3 w-3 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="ml-11 mt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmitReply(comment.id)
            }}
          >
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="text-sm mb-2 dark:bg-gray-700 dark:text-white"
              rows={2}
            />
            <div className="flex items-center space-x-2">
              <Button
                type="submit"
                size="sm"
                disabled={!replyContent.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Reply
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyContent("")
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Render replies */}
      {comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} parentId={comment.id} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card className={`dark:bg-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span>Comments ({comments.length})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Comment form - only for authenticated users */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs">
                  {getUserInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          // Sign-in prompt for non-authenticated users
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Join the Conversation</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Sign in to share your thoughts and engage with the community.
            </p>
            <div className="space-x-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <a href="/auth/login">Sign In</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/auth/register">Create Account</a>
              </Button>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
