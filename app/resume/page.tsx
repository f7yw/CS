"use client"

import type React from "react"

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  FileText,
  Download,
  CheckCircle,
  Star,
  ArrowRight,
  Copy,
  ChevronDown,
  Printer,
  Share2,
  BarChart2,
  Eye,
  X,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { BreadcrumbNav } from "@/components/navigation/breadcrumb"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

/**
 * Enhanced ResumePage
 * - preserves original features and adds:
 *   - Template preview modal (large image + metadata)
 *   - Local download analytics (counts stored in localStorage)
 *   - Template rating (persisted locally)
 *   - Quick share (navigator.share + copy)
 *   - Print preview of template
 *   - Search & tag filtering for templates
 *   - Export templates metadata (CSV / JSON)
 *   - Keyboard shortcuts: "/" focus search, "d" download last template, "p" print preview
 *   - Accessibility improvements (aria attributes, roles)
 */

type ResumeData = {
  stats: { value: string; label: string; accent: "blue" | "green" | "purple" }[]
  sections: { title: string; description: string; tips: string[]; example: string }[]
  templates: {
    name: string
    description: string
    features: string[]
    fileUrl: string
    format: "PDF" | "DOCX"
    size?: string
    tags?: string[]
    previewUrl?: string
  }[]
  commonMistakes: string[]
}

const LS = {
  RECENT: "recentlyViewedTemplates_v2",
  DOWNLOADS: "templateDownloads_v1",
  RATINGS: "templateRatings_v1",
  LAST_DOWNLOADED: "lastDownloadedTemplate_v1",
}

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
}
const itemMotion = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function AnimatedCounter({ value, duration = 900 }: { value: string; duration?: number }) {
  const nf = useMemo(() => new Intl.NumberFormat("en-US"), [])
  const num = Number(String(value).replace(/[^\d]/g, "")) || 0
  const [n, setN] = useState(0)

  useEffect(() => {
    const start = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(num * eased))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [num, duration])

  const parts = String(value).split(/(\d+)/)
  let first = true
  const rendered = parts.map((part) => {
    if (!/^\d+$/.test(part)) return part
    if (first) {
      first = false
      return nf.format(n)
    }
    return nf.format(Number(part))
  })

  return <>{rendered}</>
}

/* small utility functions */
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

/* tiny Search debounce */
function debounce<T extends (...args: any[]) => void>(fn: T, wait = 220) {
  let t: number | undefined
  return (...args: Parameters<T>) => {
    window.clearTimeout(t)
    // @ts-ignore
    t = window.setTimeout(() => fn(...args), wait)
  }
}

/* Download ripple button (reused & enhanced) */
function DownloadButton({
  onClick,
  children,
  className = "",
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - target.left
    const y = e.clientY - target.top
    const id = Date.now()
    setRipples((r) => [...r, { id, x, y }])
    setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 650)
    onClick?.()
  }
  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98 }}
      className={
        "relative overflow-hidden inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 text-sm font-medium shadow hover:shadow-md transition " +
        className
      }
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-border)]/30"
          style={{
            left: r.x,
            top: r.y,
            width: 10,
            height: 10,
            animation: "resume-ripple 0.6s ease-out forwards",
          }}
          aria-hidden
        />
      ))}
      {children}
      <style jsx>{`
        @keyframes resume-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(12);
            opacity: 0;
          }
        }
      `}</style>
    </motion.button>
  )
}

/* Rating component (local only) */
function RatingStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Rating" className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const v = i + 1
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-checked={value === v}
            role="radio"
            title={`${v} star${v > 1 ? "s" : ""}`}
            className={`p-1 rounded ${value >= v ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)]"}`}
          >
            <Star className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}

/* Template preview dialog (shows preview image, metadata, print & share) */
function TemplatePreview({
  tpl,
  onDownload,
  onRate,
  initialRating,
}: {
  tpl: ResumeData["templates"][0]
  onDownload: (name: string, url: string) => void
  onRate: (name: string, rating: number) => void
  initialRating: number
}) {
  const [rating, setRating] = useState(initialRating || 0)
  const { toast } = useToast()
  const printPreview = useCallback(() => {
    const w = window.open("", "_blank", "noopener,noreferrer")
    if (!w) {
      toast({ title: "Popup blocked", description: "Allow popups to print preview" })
      return
    }
    const html = `
      <html>
        <head><title>Preview - ${tpl.name}</title>
        <style>body{font-family:system-ui,Arial;padding:24px;color:#111;background:white} img{max-width:100%;height:auto}</style>
        </head>
        <body>
          <h1>${tpl.name}</h1>
          <p>${tpl.description}</p>
          <img src="${tpl.previewUrl || tpl.fileUrl}" alt="${tpl.name} preview" />
        </body>
      </html>
    `
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 400)
    toast({ title: "Preparing print preview" })
  }, [tpl, toast])

  const handleRate = (v: number) => {
    setRating(v)
    onRate(tpl.name, v)
    toast({ title: "Thanks!", description: `You rated ${tpl.name} ${v} star${v > 1 ? "s" : ""}` })
  }

  const share = async () => {
    const shareData = { title: tpl.name, text: tpl.description, url: tpl.fileUrl }
    try {
      // modern share
      if ((navigator as any).share) {
        await (navigator as any).share(shareData)
      } else {
        await navigator.clipboard.writeText(tpl.fileUrl)
        toast({ title: "Link copied", description: "Template link copied to clipboard." })
      }
    } catch {
      toast({ title: "Unable to share" })
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>{tpl.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {tpl.previewUrl ? (
          <img src={tpl.previewUrl || "/placeholder.svg"} alt={`${tpl.name} preview`} className="w-full rounded-md" />
        ) : (
          <div className="w-full h-48 bg-[var(--color-card)] rounded-md flex items-center justify-center">
            No preview
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-[var(--color-muted-foreground)]">{tpl.description}</p>
            <div className="text-xs text-[var(--color-muted-foreground)]">
              <strong>{tpl.format}</strong> {tpl.size ? `• ${tpl.size}` : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RatingStars value={rating} onChange={handleRate} />
            <Button variant="outline" size="sm" onClick={printPreview}>
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={share}>
              <Share2 className="h-4 w-4" />
            </Button>
            <DownloadButton onClick={() => onDownload(tpl.name, tpl.fileUrl)}>
              <Download className="h-4 w-4 mr-2" /> Download
            </DownloadButton>
          </div>
        </div>
      </div>
    </div>
  )
}

/* Main page component */
export default function ResumePage() {
  const { toast } = useToast()
  const [data, setData] = useState<ResumeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<string[]>([])
  const [formatFilter, setFormatFilter] = useState<"ALL" | "PDF" | "DOCX">("ALL")
  const [query, setQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [downloads, setDownloads] = useState<Record<string, number>>({})
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [previewTpl, setPreviewTpl] = useState<ResumeData["templates"][0] | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/data/resume.json", { cache: "no-store" })
        const json: ResumeData = await res.json()
        setData(json)
      } catch (e) {
        console.error("Failed to load /data/resume.json", e)
      } finally {
        setLoading(false)
      }
    })()

    const rv = JSON.parse(localStorage.getItem(LS.RECENT) || "[]")
    setRecent(rv)

    const ds = JSON.parse(localStorage.getItem(LS.DOWNLOADS) || "{}")
    setDownloads(ds)

    const rs = JSON.parse(localStorage.getItem(LS.RATINGS) || "{}")
    setRatings(rs)
  }, [])

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault()
        searchRef.current?.focus()
      } else if (e.key === "d") {
        // download last template
        const last = localStorage.getItem(LS.LAST_DOWNLOADED)
        if (last && data) {
          const tpl = data.templates.find((t) => t.name === last)
          if (tpl) {
            handleDownload(tpl.name, tpl.fileUrl)
          }
        }
      } else if (e.key === "p") {
        // print preview first template
        if (data?.templates?.[0]) {
          setPreviewTpl(data.templates[0])
          setPreviewOpen(true)
        }
      } else if (e.key === "?") {
        toast({ title: "Shortcuts", description: '"/" focus search — "d" download last — "p" preview first' })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [data, toast])

  const tags = useMemo(() => {
    if (!data) return []
    const set = new Set<string>()
    data.templates.forEach((t) => (t.tags || []).forEach((tg) => set.add(tg)))
    return Array.from(set).sort()
  }, [data])

  const filteredTemplates = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.templates
      .filter((t) => (formatFilter === "ALL" ? true : t.format === formatFilter))
      .filter((t) => (selectedTag ? (t.tags || []).includes(selectedTag) : true))
      .filter((t) =>
        q
          ? t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            (t.tags || []).some((tg) => tg.toLowerCase().includes(q))
          : true,
      )
  }, [data, formatFilter, selectedTag, query])

  const debouncedSetQuery = useCallback(
    debounce((v: string) => setQuery(v), 180),
    [],
  )

  const handleDownload = (tplName: string, url: string) => {
    // create anchor to trigger browser download
    const a = document.createElement("a")
    a.href = url
    const urlName = url.split("/").pop() || ""
    const hasExt = /\.[a-z0-9]+$/i.test(urlName)
    const fallback = tplName.trim().replace(/\s+/g, "_")
    a.download = hasExt ? urlName : `${fallback}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // update analytics in localStorage
    const next = { ...downloads, [tplName]: (downloads[tplName] || 0) + 1 }
    setDownloads(next)
    localStorage.setItem(LS.DOWNLOADS, JSON.stringify(next))
    localStorage.setItem(LS.LAST_DOWNLOADED, tplName)

    // record recent
    const nextRecent = [tplName, ...recent.filter((r) => r !== tplName)].slice(0, 6)
    setRecent(nextRecent)
    localStorage.setItem(LS.RECENT, JSON.stringify(nextRecent))

    toast({ title: "Download started", description: `${tplName} is downloading.` })
  }

  const handleRate = (tplName: string, rating: number) => {
    const next = { ...ratings, [tplName]: rating }
    setRatings(next)
    localStorage.setItem(LS.RATINGS, JSON.stringify(next))
  }

  const exportTemplatesCSV = () => {
    if (!data) return
    const rows = [
      ["Name", "Format", "Size", "Features", "Tags", "Downloads", "Rating"],
      ...data.templates.map((t) => [
        t.name,
        t.format,
        t.size || "",
        (t.features || []).join("; "),
        (t.tags || []).join("; "),
        String(downloads[t.name] || 0),
        String(ratings[t.name] || ""),
      ]),
    ]
    const csv = toCSV(rows)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `templates-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "CSV exported" })
  }

  const exportTemplatesJSON = () => {
    if (!data) return
    const payload = data.templates.map((t) => ({
      ...t,
      downloads: downloads[t.name] || 0,
      rating: ratings[t.name] || null,
    }))
    downloadJSON(`templates-${Date.now()}.json`, payload)
    toast({ title: "JSON exported" })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-[var(--color-muted-foreground)]">Failed to load resume content.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <BreadcrumbNav />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-primary)]/10 rounded-full mb-4">
            <FileText className="h-8 w-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Resume Guidelines</h1>
          <p className="text-xl text-[var(--color-muted-foreground)] max-w-3xl mx-auto">
            Create a polished resume with proven techniques and downloadable templates.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {data.stats.map((s, i) => (
            <motion.div key={i} variants={itemMotion}>
              <Card className="text-center bg-[var(--color-card)] hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div
                    className={`text-3xl font-bold mb-2 inline-block rounded-md px-2 ${s.accent === "blue" ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10" : s.accent === "green" ? "text-[var(--color-accent)] bg-[var(--color-accent)]/10" : "text-[var(--color-secondary)] bg-[var(--color-secondary)]/10"}`}
                  >
                    <AnimatedCounter value={s.value} />
                  </div>
                  <p className="text-[var(--color-muted-foreground)]">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick navigation & Sections */}
        <section className="mb-12">
          <Card className="mb-6 bg-[var(--color-card)]">
            <CardHeader>
              <CardTitle className="text-base">Quick Navigation</CardTitle>
              <CardDescription>Select a section to jump to it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.sections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className="whitespace-nowrap text-sm px-3 py-2 rounded-md border bg-[var(--color-background)] hover:bg-[var(--color-card)] transition"
                  >
                    {i + 1}. {s.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[var(--color-card)]">
            <CardHeader>
              <CardTitle className="text-2xl">Essential Resume Sections</CardTitle>
              <CardDescription>Craft each section for maximum clarity and impact</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="space-y-6"
              >
                {data.sections.map((section, index) => (
                  <motion.div
                    id={`sec-${index}`}
                    key={index}
                    variants={itemMotion}
                    className="group relative rounded-xl border bg-[var(--color-card)]/80 p-5 shadow-sm"
                  >
                    <span className="absolute left-0 top-6 h-10 w-1 rounded-r bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]" />

                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">
                        {index + 1}
                      </span>
                      <h3 className="text-lg md:text-xl font-semibold">{section.title}</h3>
                    </div>

                    <p className="text-[var(--color-muted-foreground)] mb-4">{section.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Best Practices</h4>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-[var(--color-destructive)] mt-0.5 shrink-0" />
                              <span className="text-[var(--color-foreground)] text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border bg-[var(--color-popover)] p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Example</h4>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(section.example)
                              toast({ title: "Copied", description: "Example copied to clipboard." })
                            }}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border bg-[var(--color-background)] hover:bg-[var(--color-card)] transition"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </button>
                        </div>

                        <details className="mt-2">
                          <summary className="cursor-pointer select-none text-sm font-medium flex items-center gap-1">
                            <ChevronDown className="h-4 w-4 transition-transform" /> Show/Hide
                          </summary>
                          <pre className="mt-2 text-sm whitespace-pre-wrap font-mono text-[var(--color-foreground)]">
                            {section.example}
                          </pre>
                        </details>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </section>

        {/* Templates */}
        <Card className="mb-12 bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle className="text-2xl">Professional Resume Templates</CardTitle>
            <CardDescription>Download templates and preview them before using</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2">
                <Input
                  ref={searchRef}
                  placeholder="Search templates, tags..."
                  onChange={(e) => debouncedSetQuery(e.target.value)}
                  className="min-w-[200px]"
                  aria-label="Search templates"
                />
                <Button
                  variant={formatFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormatFilter("ALL")}
                >
                  ALL
                </Button>
                <Button
                  variant={formatFilter === "PDF" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormatFilter("PDF")}
                >
                  PDF
                </Button>
                <Button
                  variant={formatFilter === "DOCX" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFormatFilter("DOCX")}
                >
                  DOCX
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={exportTemplatesCSV}>
                  <BarChart2 className="h-4 w-4 mr-2" /> Export CSV
                </Button>
                <Button variant="ghost" size="sm" onClick={exportTemplatesJSON}>
                  <Download className="h-4 w-4 mr-2" /> Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery("")
                    setSelectedTag(null)
                    toast({ title: "Filters cleared" })
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="mb-4 flex gap-2 flex-wrap">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag((s) => (s === t ? null : t))}
                  className={`text-xs px-3 py-1 rounded-full border ${selectedTag === t ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]" : "bg-[var(--color-background)]"}`}
                >
                  {t}
                </button>
              ))}
              {recent.length > 0 && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-[var(--color-muted-foreground)]">Recent:</span>
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        /* scroll to or open preview for recent */ const tpl = data.templates.find((x) => x.name === r)
                        if (tpl) {
                          setPreviewTpl(tpl)
                          setPreviewOpen(true)
                        }
                      }}
                      className="text-xs px-2 py-1 rounded border bg-[var(--color-background)]"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredTemplates.map((t) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                >
                  <Card className="h-full border bg-[var(--color-card)]">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-lg">{t.name}</CardTitle>
                          <CardDescription>{t.description}</CardDescription>
                        </div>

                        <div className="text-xs text-[var(--color-muted-foreground)]">
                          <div>{t.format}</div>
                          {t.size && <div>{t.size}</div>}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Features</h4>
                        <ul className="space-y-1 text-sm text-[var(--color-muted-foreground)]">
                          {t.features.map((f, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-[var(--color-accent)]" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setPreviewTpl(t)
                              setPreviewOpen(true)
                            }}
                            className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded border bg-[var(--color-background)]"
                          >
                            <Eye className="h-4 w-4" /> Preview
                          </button>
                          <RatingStars value={ratings[t.name] || 0} onChange={(v) => handleRate(t.name, v)} />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-xs">
                            {downloads[t.name] ? `${downloads[t.name]} downloads` : "0 downloads"}
                          </div>
                          <DownloadButton onClick={() => handleDownload(t.name, t.fileUrl)}>
                            <Download className="h-4 w-4 mr-2" /> Download
                          </DownloadButton>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Common mistakes */}
        <Card className="mb-12 bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle className="text-2xl text-[var(--color-destructive)]">Common Resume Mistakes to Avoid</CardTitle>
            <CardDescription>Simple pitfalls that stop resumes from getting interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.commonMistakes.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-[var(--color-destructive)]/10 rounded-lg">
                  <div className="w-6 h-6 bg-[var(--color-destructive)]/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[var(--color-destructive)] text-sm font-bold">✗</span>
                  </div>
                  <span className="text-[var(--color-destructive)]">{m}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Next steps */}
        <Card className="bg-[var(--color-card)]">
          <CardHeader>
            <CardTitle className="text-2xl">Next Steps</CardTitle>
            <CardDescription>Ready to create your resume? Follow these steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                "Choose and download a template that matches your experience level",
                "Gather all your information: work history, education, skills, and achievements",
                "Customize your resume for each job application",
                "Proofread carefully and ask someone else to review it",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <span className="text-[var(--color-primary)] font-bold">{i + 1}</span>
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="flex-1 bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
              >
                <Link to="/quiz">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Take Our Career Quiz
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent border">
                <Link to="/interview">
                  <FileText className="h-5 w-5 mr-2" />
                  View Interview Tips
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview dialog */}
      <Dialog
        open={previewOpen}
        onOpenChange={(o) => {
          if (!o) setPreviewTpl(null)
          setPreviewOpen(o)
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{previewTpl?.name}</DialogTitle>
              <button
                onClick={() => {
                  setPreviewOpen(false)
                  setPreviewTpl(null)
                }}
                aria-label="Close preview"
                className="p-1 rounded hover:bg-[var(--color-card)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>
          {previewTpl ? (
            <TemplatePreview
              tpl={previewTpl}
              onDownload={handleDownload}
              onRate={handleRate}
              initialRating={ratings[previewTpl.name] || 0}
            />
          ) : (
            <div className="p-8 text-center">No template selected</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
