"use client"

import { usePathname, useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  "": "Home",
  "career-bank": "Career Bank",
  quiz: "Interest Quiz",
  multimedia: "Multimedia Guidance",
  stories: "Success Stories",
  resources: "Resource Library",
  coaching: "Admission & Coaching",
  bookmarks: "My Bookmarks",
  contact: "Contact Us",
  about: "About Us",
}

export function BreadcrumbNav() {
  const pathname = usePathname() || "/"
  const router = useRouter()
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathname === "/") return null

  const handleClick = (href: string) => {
    router.push(href)
  }

  return (
    <div
      className="container mx-auto px-4 py-3 border-b animate-fade-in-up"
      style={{
        backgroundColor: "var(--color-background)",
        borderColor: "var(--color-border)",
      }}
    >
      <Breadcrumb>
        <BreadcrumbList className="flex items-center space-x-1 font-body text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button
                onClick={() => handleClick("/")}
                className="flex items-center space-x-1 transition-transform duration-200 hover:scale-105 text-[var(--color-foreground)] hover:text-[var(--color-primary)]"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </button>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathSegments.map((segment, index) => {
            const href = "/" + pathSegments.slice(0, index + 1).join("/")
            const isLast = index === pathSegments.length - 1
            const label =
              routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

            return (
              <div key={segment} className="flex items-center space-x-1">
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4 transition-colors duration-300 text-[var(--color-foreground)] hover:text-[var(--color-primary)]" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>
                      <span className="font-medium text-[var(--color-primary)]">{label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <button
                        onClick={() => handleClick(href)}
                        className="transition-transform duration-200 hover:scale-105 text-[var(--color-foreground)] hover:text-[var(--color-primary)] hover:underline"
                      >
                        {label}
                      </button>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
