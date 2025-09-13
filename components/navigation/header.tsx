"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

interface NavigationItem {
  title: string;
  href: string;
  description: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  userTypes?: string[];
}

const navigationItems: NavigationItem[] = [
  { title: "Career Bank", href: "/career-bank", description: "Explore career profiles and opportunities", icon: Search, userTypes: ["student", "graduate", "professional"] },
  { title: "Interest Quiz", href: "/quiz", description: "Discover careers that match your interests", icon: BookOpen, userTypes: ["student", "graduate", "professional"] },
  { title: "Multimedia Guidance", href: "/multimedia", description: "Videos and podcasts from professionals", icon: Video, userTypes: ["student", "graduate", "professional"] },
  { title: "Contact", href: "/contact", description: "Get in touch with our team", icon: Phone, userTypes: ["student", "graduate", "professional"] },
  { title: "About", href: "/about", description: "Learn about our mission", icon: Info, userTypes: ["student", "graduate", "professional"] },
  { title: "Feedback", href: "/feedback", description: "Share your experience with us", icon: MessageSquare, userTypes: ["student", "graduate", "professional"] },
  { title: "Success Stories", href: "/stories", description: "Inspiring journeys from professionals", icon: Star, userTypes: ["student", "graduate", "professional"] },
  { title: "Resource Library", href: "/resources", description: "Articles, eBooks, and guides", icon: Library, userTypes: ["student", "graduate", "professional"] },
];

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
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const [notifications, setNotifications] = useState(0);

  const searchRef = useRef<HTMLInputElement | null>(null);

  // --- auth & storage sync ---
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authDataRaw = typeof window !== "undefined" ? localStorage.getItem("ns_auth_data") : null;
        const storedUserName = typeof window !== "undefined" ? sessionStorage.getItem("userName") : null;
        const storedUserType = typeof window !== "undefined" ? sessionStorage.getItem("userType") : null;

        if (authDataRaw) {
          try {
            const parsed = JSON.parse(authDataRaw);
            setIsAuthenticated(true);
            setUserName(parsed?.name || storedUserName || "User");
          } catch (err) {
            // malformed data
            console.warn("ns_auth_data is corrupted, clearing it.");
            localStorage.removeItem("ns_auth_data");
            setIsAuthenticated(false);
            setUserName("");
          }
        } else {
          setIsAuthenticated(false);
          setUserName(storedUserName || "");
        }

        if (storedUserType) setUserType(storedUserType);
      } catch (error) {
        console.log(" !  Auth check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ns_auth_data" || e.key === "userName" || e.key === "userType") checkAuthStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- theme ---
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("ns_theme");
      const media = window.matchMedia?.("(prefers-color-scheme: dark)");
      const systemPrefersDark = media ? media.matches : false;

      const shouldDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
      setDarkMode(shouldDark);
      document.documentElement.classList.toggle("dark", shouldDark);

      const listener = (e: MediaQueryListEvent) => {
        // update only when user hasn't chosen an explicit theme
        if (!localStorage.getItem("ns_theme")) {
          setDarkMode(e.matches);
          document.documentElement.classList.toggle("dark", e.matches);
        }
      };

      media?.addEventListener?.("change", listener);
      return () => media?.removeEventListener?.("change", listener);
    } catch (err) {
      // ignore
    }
  }, []);

  // --- keyboard shortcuts (/) and escape ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        // focus search only when not typing in an input
        const tag = (document.activeElement?.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          searchRef.current?.focus();
        }
      }

      if (e.key === "Escape") {
        setSearchTerm("");
        searchRef.current?.blur();
        setIsMobileMenuOpen(false);
        setShowAuthModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- fake notifications when authenticated ---
  useEffect(() => {
    if (isAuthenticated) {
      const notificationCount = Math.floor(Math.random() * 5);
      setNotifications(notificationCount);
    } else {
      setNotifications(0);
    }
  }, [isAuthenticated]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("ns_theme", next ? "dark" : "light");
      } catch (e) {
        // ignore
      }
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  // --- search with history save ---
  const handleSearch = useCallback(
    (query?: string) => {
      const searchQuery = (query ?? searchTerm).trim();
      if (!searchQuery) return;

      try {
        const raw = localStorage.getItem("ns_search_history");
        const searches = raw ? JSON.parse(raw) : [];
        const updated = [searchQuery, ...searches.filter((s: string) => s !== searchQuery)].slice(0, 10);
        localStorage.setItem("ns_search_history", JSON.stringify(updated));
      } catch (error) {
        console.log(" !  Search history save failed:", error);
      }

      router.push(`/career-bank?search=${encodeURIComponent(searchQuery)}`);
      setSearchTerm("");
      setIsMobileMenuOpen(false);
    },
    [router, searchTerm]
  );

  const onSearchSelect = useCallback(
    (href: string) => {
      router.push(href);
      setSearchTerm("");
    },
    [router]
  );

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("ns_auth_data");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userType");
      setIsAuthenticated(false);
      setUserName("");
      setNotifications(0);
      router.push("/");
    } catch (error) {
      console.log(" !  Logout cleanup failed:", error);
    }
  }, [router]);

  const getFilteredNavItems = useCallback(() => {
    if (!userType) return navigationItems;
    return navigationItems.filter((item) => (item.userTypes ? item.userTypes.includes(userType) : true));
  }, [userType]);

  const openAuthModal = useCallback((mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
  }, []);

  const activeClass = (href: string) => (pathname === href || pathname.startsWith(href + "/") ? "bg-muted text-foreground" : "");

  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return searchSuggestions.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 6);
  }, [searchTerm]);

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
                  ref={(el: HTMLInputElement) => (searchRef.current = el)}
                  placeholder="Search (press /) — e.g. Interest Quiz"
                  className="w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm.trim()) {
                      handleSearch();
                    }
                  }}
                />

                {searchTerm && (
                  <div className="absolute left-0 top-full mt-2 w-full rounded-lg shadow-lg bg-popover border border-border z-50">
                    <ul role="listbox" className="max-h-60 overflow-auto p-2">
                      {suggestions.length > 0 ? (
                        suggestions.map((s) => (
                          <li key={s.href}>
                            <button
                              onClick={() => onSearchSelect(s.href)}
                              className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                            >
                              <Search className="h-4 w-4 text-muted-foreground" />
                              <span>{s.label}</span>
                            </button>
                          </li>
                        ))
                      ) : (
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
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavigationMenuItem key={item.href}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "group inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
                                activeClass(item.href)
                              )}
                            >
                              <span className="mr-2 text-primary">{Icon ? <Icon className="h-4 w-4" /> : null}</span>
                              {item.title}
                            </Link>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      );
                    })}

                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="hover:bg-muted hover:text-foreground">More</NavigationMenuTrigger>
                    <NavigationMenuContent className="bg-white text-foreground dark:bg-slate-900 dark:text-white border border-border rounded-lg shadow-lg">\n                      <div className="grid gap-3 p-6 w-[500px]">
                        {[
                          { href: "/bookmarks", icon: Bookmark, title: "My Bookmarks", desc: "Saved careers and notes" },
                          { href: "/resume", icon: FileText, title: "Resume Guidelines", desc: "Professional resume writing tips" },
                          { href: "/interview", icon: MessageSquare, title: "Interview Tips", desc: "Master your interview skills" },
                          { href: "/help", icon: Phone, title: "Help Center", desc: "Get support and assistance" },
                        ].map((link) => (
                          <Link key={link.href} href={link.href} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors text-foreground dark:text-white">
                            <link.icon className="h-5 w-5 text-primary dark:text-primary-foreground" />
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
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive" aria-label={`${notifications} new notifications`}>
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

                  <Button size="sm" className="hidden sm:flex bg-primary hover:bg-primary/90" onClick={() => openAuthModal("signup")}> 
                    Sign Up
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-2 h-auto lg:hidden"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-background/95 backdrop-blur-sm max-h-screen overflow-y-auto" aria-label="Mobile navigation">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <div className="relative">
                <Input
                  placeholder="Search careers, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm.trim()) {
                      handleSearch();
                      setIsMobileMenuOpen(false);
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  onClick={() => {
                    handleSearch();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {getFilteredNavItems().map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block py-3 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-primary">{Icon ? <Icon className="h-4 w-4" /> : null}</span>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <div className="flex gap-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => openAuthModal("login")}>
                    <LogIn className="h-4 w-4 mr-2" /> Login
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={() => openAuthModal("signup")}>
                    Sign Up
                  </Button>
                </div>
              )}

              {isAuthenticated && (
                <div className="pt-3 border-t border-border space-y-2">
                  <Link href="/dashboard" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Settings className="h-4 w-4 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/bookmarks" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Heart className="h-4 w-4 text-primary" />
                    <span>My Favorites</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-muted transition-colors text-destructive w-full text-left">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
          <div className="max-w-md w-full rounded-xl bg-popover p-6 border border-border shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-heading font-semibold">{authMode === "login" ? "Welcome Back" : "Create Account"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAuthModal(false)} className="p-2 h-auto" aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {authMode === "login" ? "Sign in to access your personalized career guidance" : "Join thousands of users advancing their careers"}
              </p>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push(`/auth/${authMode}`)}>
                  {authMode === "login" ? "Go to Login" : "Go to Sign Up"}
                </Button>

                <Button variant="ghost" className="w-full" onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}>
                  {authMode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
