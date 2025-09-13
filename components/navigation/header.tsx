"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import {
  Search,
  BookOpen,
  Video,
  Star,
  Library,
  TrendingUp,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LogIn,
  Menu,
  X,
  FileText,
  MessageSquare,
  Phone,
  Info,
  Bell,
  Heart,
  Bookmark,
} from "lucide-react"

interface NavigationItem {
  title: string
  href: string
  description: string
  icon: React.ReactNode
  userTypes: string[]
}

const navigationItems: NavigationItem[] = [
  {
    title: "Career Bank",
    href: "/career-bank",
    description: "Explore career profiles and opportunities",
    icon: <Search className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Interest Quiz",
    href: "/quiz",
    description: "Discover careers that match your interests",
    icon: <BookOpen className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Multimedia Guidance",
    href: "/multimedia",
    description: "Videos and podcasts from professionals",
    icon: <Video className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Contact",
    href: "/contact",
    description: "Get in touch with our team",
    icon: <Phone className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "About",
    href: "/about",
    description: "Learn about our mission",
    icon: <Info className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Feedback",
    href: "/feedback",
    description: "Share your experience with us",
    icon: <MessageSquare className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Success Stories",
    href: "/stories",
    description: "Inspiring journeys from professionals",
    icon: <Star className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
  {
    title: "Resource Library",
    href: "/resources",
    description: "Articles, eBooks, and guides",
    icon: <Library className="h-4 w-4" />,
    userTypes: ["student", "graduate", "professional"],
  },
]

const searchSuggestions = [
  { label: "Software Engineer Career Path", href: "/career-bank?search=software+engineer" },
  { label: "Data Science Careers", href: "/career-bank?search=data+science" },
  { label: "Interest Assessment Quiz", href: "/quiz" },
  { label: "Resume Writing Guide", href: "/resume" },
  { label: "Interview Preparation", href: "/interview" },
  { label: "Scholarship Opportunities", href: "/admission" },
  { label: "Success Stories", href: "/stories" },
  { label: "Video Library", href: "/multimedia" },
  { label: "Contact Support", href: "/contact" },
  { label: "Career Counseling", href: "/help" },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "signup">("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userName, setUserName] = useState("")
  const [userType, setUserType] = useState("")
  const [notifications, setNotifications] = useState(0)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authData = localStorage.getItem("ns_auth_data")
        const storedUserName = sessionStorage.getItem("userName")
        const storedUserType = sessionStorage.getItem("userType")

        if (authData) {
          const parsed = JSON.parse(authData)
          setIsAuthenticated(true)
          setUserName(parsed.name || storedUserName || "User")
        }

        if (storedUserType) {
          setUserType(storedUserType)
        }
      } catch (error) {
        console.log("[v0] Auth check failed:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuthStatus()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ns_auth_data") {
        checkAuthStatus()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("ns_theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "Escape") {
        setSearchTerm("")
        searchRef.current?.blur()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      const notificationCount = Math.floor(Math.random() * 5)
      setNotifications(notificationCount)
    }
  }, [isAuthenticated])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("ns_theme", newMode ? "dark" : "light")

    if (newMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  const handleSearch = (query?: string) => {
    const searchQuery = query || searchTerm.trim()
    if (!searchQuery) return

    try {
      const searches = JSON.parse(localStorage.getItem("ns_search_history") || "[]")
      const updatedSearches = [searchQuery, ...searches.filter((s: string) => s !== searchQuery)].slice(0, 10)
      localStorage.setItem("ns_search_history", JSON.stringify(updatedSearches))
    } catch (error) {
      console.log("[v0] Search history save failed:", error)
    }

    router.push(`/career-bank?search=${encodeURIComponent(searchQuery)}`)
    setSearchTerm("")
  }

  const onSearchSelect = (href: string) => {
    router.push(href)
    setSearchTerm("")
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("ns_auth_data")
      sessionStorage.clear()
      setIsAuthenticated(false)
      setUserName("")
      setNotifications(0)
      router.push("/")
    } catch (error) {
      console.log("[v0] Logout cleanup failed:", error)
    }
  }

  const getFilteredNavItems = () => {
    if (!userType) return navigationItems
    return navigationItems.filter((item) => item.userTypes.includes(userType))
  }

  const openAuthModal = (mode: "login" | "signup") => {
    setAuthMode(mode)
    setShowAuthModal(true)
    setIsMobileMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-3" aria-label="NextStep Navigator home">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">
                <span className="hidden sm:inline">NextStep Navigator</span>
                <span className="sm:hidden">NextStep</span>
              </span>
            </Link>

            <div className="flex-1 mx-6 hidden lg:flex items-center gap-6">
              <div className="relative w-1/2">
                <Label htmlFor="global-search" className="sr-only">
                  Search the site
                </Label>
                <Input
                  id="global-search"
                  ref={searchRef}
                  placeholder="Search (press /) — e.g. Interest Quiz"
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm.trim()) {
                      handleSearch()
                    }
                  }}
                />
                {searchTerm && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-lg shadow-lg bg-popover border border-border z-50">
                    <ul role="listbox" className="max-h-60 overflow-auto p-2">
                      {searchSuggestions
                        .filter((s) => s.label.toLowerCase().includes(searchTerm.toLowerCase()))
                        .slice(0, 6)
                        .map((s) => (
                          <li key={s.href}>
                            <button
                              onClick={() => onSearchSelect(s.href)}
                              className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Search className="h-4 w-4 text-muted-foreground" />
                              {s.label}
                            </button>
                          </li>
                        ))}
                      {searchSuggestions.filter((s) => s.label.toLowerCase().includes(searchTerm.toLowerCase()))
                        .length === 0 && (
                        <li className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          No suggestions found
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <NavigationMenu className="hidden lg:flex">
                <NavigationMenuList>
                  {getFilteredNavItems()
                    .slice(0, 6)
                    .map((item) => (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "group inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
                              pathname === item.href && "bg-muted text-foreground",
                            )}
                          >
                            <span className="mr-2 text-primary">{item.icon}</span>
                            {item.title}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="hover:bg-muted hover:text-foreground">More</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[500px]">
                        {[
                          {
                            href: "/bookmarks",
                            icon: Bookmark,
                            title: "My Bookmarks",
                            desc: "Saved careers and notes",
                          },
                          {
                            href: "/resume",
                            icon: FileText,
                            title: "Resume Guidelines",
                            desc: "Professional resume writing tips",
                          },
                          {
                            href: "/interview",
                            icon: MessageSquare,
                            title: "Interview Tips",
                            desc: "Master your interview skills",
                          },
                          {
                            href: "/help",
                            icon: Phone,
                            title: "Help Center",
                            desc: "Get support and assistance",
                          },
                        ].map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                          >
                            <link.icon className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium">{link.title}</div>
                              <div className="text-sm text-muted-foreground">{link.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="p-2 h-auto"
                aria-label={`Switch to ${darkMode ? "light" : "dark"} theme`}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-auto relative"
                    onClick={() => router.push("/notifications")}
                    aria-label={`${notifications} notifications`}
                  >
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive">
                        {notifications}
                      </Badge>
                    )}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="hidden md:flex">
                        <User className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{userName}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <Settings className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/bookmarks" className="flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          My Favorites
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => openAuthModal("login")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>

                  <Button
                    size="sm"
                    className="hidden sm:flex bg-primary hover:bg-primary/90"
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 h-auto lg:hidden"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm"
            aria-label="Mobile navigation"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <div className="relative">
                <Input
                  placeholder="Search careers, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm.trim()) {
                      handleSearch()
                      setIsMobileMenuOpen(false)
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={() => {
                    handleSearch()
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {getFilteredNavItems().map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-primary">{item.icon}</span>
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex gap-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => openAuthModal("login")}
                  >
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => openAuthModal("signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-3 border-t border-border space-y-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Heart className="h-4 w-4 text-primary" />
                    <span>My Favorites</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors text-destructive w-full text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}
      </header>

      {showAuthModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="max-w-md w-full rounded-xl bg-popover p-6 border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-semibold">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAuthModal(false)}
                className="p-2 h-auto"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {authMode === "login"
                  ? "Sign in to access your personalized career guidance"
                  : "Join thousands of users advancing their careers"}
              </p>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push(`/auth/${authMode}`)}>
                  {authMode === "login" ? "Go to Login" : "Go to Sign Up"}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                >
                  {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header
