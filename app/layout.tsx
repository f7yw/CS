import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Header } from "@/components/navigation/header"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb"
import { Footer } from "@/components/navigation/footer"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap", // Ensures text remains visible during font swap
  preload: true, // Preloads font for better performance
  fallback: ["system-ui", "arial"], // Fallback fonts for better loading experience
  weight: ["300", "400", "500", "600", "700"], // Multiple weights for design flexibility
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap", // Prevents invisible text during font load
  preload: true, // Critical font preloading
  fallback: ["system-ui", "arial"], // System fallbacks
  weight: ["400", "500", "600", "700"], // Weight variations for hierarchy
})

export const metadata: Metadata = {
  title: "NextStep Navigator - Career Guidance Platform",
  description:
    "Discover your perfect career path with personalized guidance, resources, and expert insights for students, graduates, and professionals.",
  generator: "NextStep Navigator",
  keywords:
    "career guidance, career counseling, job search, education, professional development, career planning, job placement",
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover", // Better mobile viewport handling
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ], // Dynamic theme color based on user preference
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-16x16.png",
  },
  robots: "index, follow",
  openGraph: {
    title: "NextStep Navigator - Career Guidance Platform",
    description: "Discover your perfect career path with personalized guidance and expert insights.",
    type: "website",
    locale: "en_US",
    siteName: "NextStep Navigator",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextStep Navigator - Career Guidance Platform",
    description: "Discover your perfect career path with personalized guidance and expert insights.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check for saved theme preference
                  var theme = localStorage.getItem('ns_theme_v1');
                  if (!theme) {
                    // Fallback to system preference
                    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    theme = prefersDark ? 'dark' : 'light';
                  }
                  // Apply theme immediately to prevent flash
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                  // Set CSS custom property for animations
                  document.documentElement.style.setProperty('--initial-theme', theme);
                } catch(e) {
                  // Graceful fallback to light theme
                  console.warn('Theme detection failed, using light theme');
                }
              })();
            `,
          }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />

        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Font family CSS variables for consistent typography */
            :root {
              --font-space-grotesk: ${spaceGrotesk.style?.fontFamily || "Space Grotesk"}, system-ui, sans-serif;
              --font-dm-sans: ${dmSans.style?.fontFamily || "DM Sans"}, system-ui, sans-serif;
              
              /* Animation timing variables for consistent motion */
              --animation-duration-fast: 0.15s;
              --animation-duration-normal: 0.3s;
              --animation-duration-slow: 0.5s;
              --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
              --animation-easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
              
              /* Responsive breakpoints for consistent design */
              --breakpoint-sm: 640px;
              --breakpoint-md: 768px;
              --breakpoint-lg: 1024px;
              --breakpoint-xl: 1280px;
            }

            /* Base body styles with smooth transitions */
            body {
              margin: 0;
              font-family: var(--font-dm-sans);
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background-color: var(--color-background);
              color: var(--color-foreground);
              transition: background-color var(--animation-duration-normal) var(--animation-easing),
                         color var(--animation-duration-normal) var(--animation-easing);
              overflow-x: hidden; /* Prevent horizontal scroll on mobile */
            }

            /* Responsive container with fluid padding */
            .container {
              max-width: 1200px;
              margin-left: auto;
              margin-right: auto;
              padding-left: clamp(1rem, 4vw, 2rem); /* Fluid padding based on viewport */
              padding-right: clamp(1rem, 4vw, 2rem);
            }

            /* Professional loading skeleton animation */
            .loading-skeleton {
              background: linear-gradient(
                90deg, 
                var(--color-muted) 25%, 
                var(--color-card) 50%, 
                var(--color-muted) 75%
              );
              background-size: 200% 100%;
              animation: loading 1.5s infinite var(--animation-easing);
              border-radius: var(--radius-md);
            }

            /* Smooth loading animation keyframes */
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }

            /* Responsive media elements */
            img, video {
              max-width: 100%;
              height: auto;
              border-radius: var(--radius-md);
            }

            /* Professional gradient text effect */
            .gradient-text {
              background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              font-weight: 600;
            }

            /* Enhanced card hover effects with smooth transitions */
            .card-hover {
              transition: all var(--animation-duration-normal) var(--animation-easing);
              cursor: pointer;
              will-change: transform, box-shadow; /* Optimize for animations */
            }

            .card-hover:hover {
              transform: translateY(-4px) scale(1.02);
              box-shadow: 
                0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                0 10px 10px -5px rgba(0, 0, 0, 0.04),
                0 0 0 1px rgba(255, 255, 255, 0.05);
            }

            /* Staggered fade-in animation for content */
            .animate-fade-in-up {
              animation: fadeInUp var(--animation-duration-slow) var(--animation-easing) forwards;
              opacity: 0;
            }

            .animate-fade-in-up:nth-child(1) { animation-delay: 0.1s; }
            .animate-fade-in-up:nth-child(2) { animation-delay: 0.2s; }
            .animate-fade-in-up:nth-child(3) { animation-delay: 0.3s; }
            .animate-fade-in-up:nth-child(4) { animation-delay: 0.4s; }

            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(30px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* Smooth page transition animation */
            .page-transition {
              animation: pageEnter var(--animation-duration-slow) var(--animation-easing);
            }

            @keyframes pageEnter {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            /* Professional button hover effects */
            .btn-hover {
              transition: all var(--animation-duration-fast) var(--animation-easing);
              position: relative;
              overflow: hidden;
            }

            .btn-hover::before {
              content: '';
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
              transition: left var(--animation-duration-normal) var(--animation-easing);
            }

            .btn-hover:hover::before {
              left: 100%;
            }

            /* Responsive text scaling */
            .text-responsive {
              font-size: clamp(0.875rem, 2.5vw, 1.125rem);
              line-height: 1.6;
            }

            .heading-responsive {
              font-size: clamp(1.5rem, 5vw, 3rem);
              line-height: 1.2;
              font-family: var(--font-space-grotesk);
            }

            /* Focus states for accessibility */
            .focus-ring {
              outline: 2px solid transparent;
              outline-offset: 2px;
              transition: outline-color var(--animation-duration-fast) var(--animation-easing);
            }

            .focus-ring:focus-visible {
              outline-color: var(--color-ring);
            }

            /* Smooth scrolling for better UX */
            html {
              scroll-behavior: smooth;
            }

            /* Reduced motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
              *,
              *::before,
              *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
              }
            }

            /* Mobile-first responsive design */
            @media (max-width: 640px) {
              .container {
                padding-left: 1rem;
                padding-right: 1rem;
              }
              
              .card-hover:hover {
                transform: translateY(-2px) scale(1.01); /* Reduced effect on mobile */
              }
            }

            /* Tablet optimizations */
            @media (min-width: 641px) and (max-width: 1024px) {
              .container {
                padding-left: 1.5rem;
                padding-right: 1.5rem;
              }
            }

            /* Desktop enhancements */
            @media (min-width: 1025px) {
              .container {
                padding-left: 2rem;
                padding-right: 2rem;
              }
              
              /* Enhanced hover effects for desktop */
              .card-hover:hover {
                transform: translateY(-6px) scale(1.03);
              }
            }
          `,
          }}
        />
      </head>

      <body className="font-body min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <a
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-200"
            href="#main"
          >
            Skip to main content
          </a>

          <Suspense fallback={<HeaderSkeleton />}>
            <Header />
          </Suspense>

          <Suspense fallback={<BreadcrumbSkeleton />}>
            <BreadcrumbNav />
          </Suspense>

          <main id="main" className="flex-1 page-transition">
            <Suspense fallback={<MainContentSkeleton />}>{children}</Suspense>
          </main>

          <Suspense fallback={<FooterSkeleton />}>
            <Footer />
          </Suspense>

          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

function HeaderSkeleton() {
  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between py-2 text-sm border-b border-border/50">
          <div className="flex items-center space-x-4">
            <div className="h-3 w-20 loading-skeleton"></div>
            <div className="h-3 w-24 loading-skeleton"></div>
          </div>
          <div className="h-6 w-16 loading-skeleton"></div>
        </div>

        {/* Main header skeleton */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 loading-skeleton rounded-xl"></div>
            <div className="h-6 w-32 loading-skeleton"></div>
          </div>

          {/* Navigation skeleton - responsive */}
          <div className="hidden md:flex items-center space-x-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 w-16 loading-skeleton"></div>
            ))}
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 loading-skeleton rounded-full md:hidden"></div>
            <div className="hidden md:block h-8 w-20 loading-skeleton"></div>
            <div className="h-8 w-8 loading-skeleton rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  )
}

function BreadcrumbSkeleton() {
  return (
    <nav className="border-b bg-muted/30" aria-label="Breadcrumb">
      <div className="container mx-auto py-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-12 loading-skeleton"></div>
          <div className="h-4 w-1 loading-skeleton"></div>
          <div className="h-4 w-20 loading-skeleton"></div>
          <div className="h-4 w-1 loading-skeleton"></div>
          <div className="h-4 w-16 loading-skeleton"></div>
        </div>
      </div>
    </nav>
  )
}

function MainContentSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto py-8">
        {/* Hero section skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start mb-16">
          <div className="lg:col-span-2 space-y-8">
            {/* Title and description skeleton */}
            <div className="space-y-6">
              <div className="h-12 md:h-16 w-full loading-skeleton"></div>
              <div className="h-6 w-full loading-skeleton"></div>
              <div className="h-6 w-3/4 loading-skeleton"></div>
            </div>

            {/* CTA button skeleton */}
            <div className="h-12 w-48 loading-skeleton"></div>

            {/* Feature cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="h-48 loading-skeleton"></div>
                  <div className="h-4 w-3/4 loading-skeleton"></div>
                  <div className="h-4 w-1/2 loading-skeleton"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="space-y-6">
            <div className="h-64 loading-skeleton"></div>
            <div className="h-32 loading-skeleton"></div>
          </div>
        </div>

        {/* Additional content sections skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 w-3/4 loading-skeleton"></div>
              <div className="h-32 loading-skeleton"></div>
              <div className="h-4 w-full loading-skeleton"></div>
              <div className="h-4 w-2/3 loading-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FooterSkeleton() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-32 loading-skeleton"></div>
            <div className="h-4 w-full loading-skeleton"></div>
            <div className="h-4 w-3/4 loading-skeleton"></div>
          </div>

          {/* Footer links skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-5 w-20 loading-skeleton"></div>
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-4 w-16 loading-skeleton"></div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar skeleton */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="h-4 w-48 loading-skeleton"></div>
          <div className="flex space-x-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 loading-skeleton rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
