"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
MessageSquare,
Play,
Download,
CheckCircle,
ArrowRight,
History,
Copy,
PencilLine,
Save,
ChevronDown,
ChevronUp,
Sparkles,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"

let toast: any
try {
toast = require("sonner")
} catch {}

const accentToClass: Record<string, string> = {
purple: "text-purple-600 bg-purple-100",
green: "text-green-600 bg-green-100",
blue: "text-blue-600 bg-blue-100",
orange: "text-orange-600 bg-orange-100",
}

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
const ref = useRef<T | null>(null)
const [visible, setVisible] = useState(false)
useEffect(() => {
if (!ref.current) return
const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
threshold: 0.15,
...options,
})
obs.observe(ref.current)
return () => obs.disconnect()
}, [options])
return { ref, visible } as const
}

const Counter: React.FC<{
target: number
display?: string
suffix?: string
className?: string
start?: boolean
durationMs?: number
}> = ({ target, display, suffix = "", className = "", start = false, durationMs = 900 }) => {
const [value, setValue] = useState(0)
useEffect(() => {
if (!start) return
const steps = 45
const stepValue = target / steps
let i = 0
const id = setInterval(() => {
i++
setValue((prev) => (prev + stepValue >= target ? target : prev + stepValue))
if (i >= steps) clearInterval(id)
}, durationMs / steps)
return () => clearInterval(id)
}, [start, target, durationMs])
return <span className={className}>{display ?? `${Math.round(value)}${suffix}`}</span>
}

const Breadcrumbs: React.FC = () => {
const pathname = usePathname()
const parts = useMemo(() => pathname.split("/").filter(Boolean), [pathname])
return (
<nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600">
<ol className="flex flex-wrap items-center gap-1">
  <li>
    <a href="/" className="hover:underline">Home</a>
  </li>
  {parts.map((p, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/")
    return (
      <li key={href} className="flex items-center gap-1">
        <span className="px-1">/</span>
        <a href={href} className="capitalize hover:underline">
          {decodeURIComponent(p.replace(/-/g, " "))}
        </a>
      </li>
    )
  })}
</ol>
</nav>
)
}

function timeAgo(ts: number) {
const diff = Math.max(0, Date.now() - ts)
const s = Math.floor(diff / 1000)
if (s < 60) return `${s}s ago`
const m = Math.floor(s / 60)
if (m < 60) return `${m}m ago`
const h = Math.floor(m / 60)
if (h < 24) return `${h}h ago`
const d = Math.floor(h / 24)
return `${d}d ago`
}

const RecentlyViewedBar: React.FC<{ currentTitle: string; ui: any }> = ({ currentTitle, ui }) => {
const pathname = usePathname()
const [items, setItems] = useState<{ title: string; path: string; at: number }[]>([])
useEffect(() => {
try {
const key = "recentlyViewed"
const raw = localStorage.getItem(key)
const list: { title: string; path: string; at: number }[] = raw ? JSON.parse(raw) : []
const now = Date.now()
const next = [{ title: currentTitle, path: pathname, at: now }, ...list.filter((x) => x.path !== pathname)]
const trimmed = next.slice(0, 8)
localStorage.setItem(key, JSON.stringify(trimmed))
setItems(trimmed)
} catch {}
}, [pathname, currentTitle])
if (!items.length) return null

return (
<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
<Card className="mb-8 border-purple-200 shadow-sm">
  <CardHeader className="pb-3">
    <CardTitle className="text-base flex items-center gap-2">
      <History className="h-4 w-4 text-purple-600" />
      {ui?.recentlyViewedTitle || "Recently Viewed"}
    </CardTitle>
    <CardDescription>{ui?.recentlyViewedDesc || "Quick access to your latest pages"}</CardDescription>
  </CardHeader>
  <CardContent className="pt-0">
    <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1 pr-1">
      {items.map((x, i) => (
        <a
          key={i}
          href={x.path}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 hover:translate-y-0.5 transition whitespace-nowrap"
          title={new Date(x.at).toLocaleString()}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-600" />
          <span className="text-sm">{x.title}</span>
          <span className="text-xs text-purple-500">• {timeAgo(x.at)}</span>
        </a>
      ))}
    </div>
  </CardContent>
</Card>
</motion.div>
)
}

const ANSWERS_KEY = "interview_answers_v1"
const QUIZ_KEY = "interview_quiz_v1"

export default function InterviewPage() {
const [data, setData] = useState<any | null>(null)
const [error, setError] = useState<string | null>(null)
const [loading, setLoading] = useState(true)

const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({})
const [openMap, setOpenMap] = useState<Record<string, boolean>>({})
const [activeTab, setActiveTab] = useState<string>("general")
const [query, setQuery] = useState("")
const q = query.trim().toLowerCase()

const quizQuestions = data?.quiz?.questions ?? []
const quizDims: string[] = data?.quiz?.dimensions ?? []
const [quiz, setQuiz] = useState<number[]>([])
const [quizScore, setQuizScore] = useState<Record<string, number>>({})

useEffect(() => {
let ok = true
;(async () => {
try {
  const res = await fetch("/data/interview.json", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to load interview.json")
  const json = await res.json()
  if (ok) setData(json)
} catch (e: any) {
  setError(e?.message ?? "Failed to load data")
} finally {
  setLoading(false)
}
})()
return () => {
ok = false
}
}, [])

useEffect(() => {
try {
const raw = localStorage.getItem(ANSWERS_KEY)
if (raw) setAnswers(JSON.parse(raw))
} catch {}
try {
const rawQ = localStorage.getItem(QUIZ_KEY)
if (rawQ) {
  const parsed = JSON.parse(rawQ)
  if (Array.isArray(parsed?.quiz)) setQuiz(parsed.quiz)
  if (parsed?.score) setQuizScore(parsed.score)
}
} catch {}
}, [])

useEffect(() => {
try {
localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
} catch {}
}, [answers])
useEffect(() => {
try {
localStorage.setItem(QUIZ_KEY, JSON.stringify({ quiz, score: quizScore }))
} catch {}
}, [quiz, quizScore])

useEffect(() => {
if (quizQuestions.length && quiz.length !== quizQuestions.length) {
setQuiz(Array(quizQuestions.length).fill(-1))
}
}, [quizQuestions, quiz.length])

useEffect(() => {
if (data?.commonQuestions?.[0]?.category) {
setActiveTab((data.commonQuestions[0].category as string).toLowerCase())
}
}, [data])

const ui = data?.ui || {}

const totalQuestions = (data?.commonQuestions || []).reduce((sum: number, cat: any) => sum + (cat.questions?.length || 0), 0)
const savedAnswersCount = Object.values(answers).reduce((acc, cat) => acc + Object.values(cat).filter((v) => (v || "").trim().length > 0).length, 0)

function highlight(text: string, needle: string) {
if (!needle) return text
const idx = text.toLowerCase().indexOf(needle.toLowerCase())
if (idx === -1) return text
return (
<>
  {text.slice(0, idx)}
  <mark className="bg-yellow-200 px-0.5 rounded">{text.slice(idx, idx + needle.length)}</mark>
  {text.slice(idx + needle.length)}
</>
)
}

const copyQuestions = (title: string, questions: string[], withAnswers = false) => {
const block = withAnswers
? `# ${title}\n` +
  questions
    .map((qText, i) => {
      const ans = answers[title]?.[i] ?? ""
      return `${i + 1}. ${qText}\n   - Answer: ${ans || "(write your answer here)"}`
    })
    .join("\n\n")
: `# ${title}\n` + questions.map((q, i) => `${i + 1}. ${q}`).join("\n")
navigator.clipboard.writeText(block)
try {
const msg = withAnswers ? (ui.copiedQuestionsAnswers || "Copied questions + answers") : (ui.copiedQuestions || "Copied questions")
toast?.toast?.success?.(msg) || toast?.success?.(msg)
} catch {}
}

const QuestionItem: React.FC<{
category: string
index: number 
text: string
highlightNeedle?: string
}> = ({ category, index, text, highlightNeedle }) => {
const keyId = `${category}-${index}`
const open = !!openMap[keyId]
const persisted = answers[category]?.[index] ?? ""
const [draft, setDraft] = useState<string>(persisted)
const [dirty, setDirty] = useState<boolean>(false)

useEffect(() => {
setDraft(persisted)
setDirty(false)
}, [persisted])

const toggle = () => setOpenMap((m) => ({ ...m, [keyId]: !m[keyId] }))

const onSave = () => {
setAnswers((prev) => ({
  ...prev,
  [category]: { ...(prev[category] || {}), [index]: draft },
}))
setDirty(false)
try {
  toast?.toast?.success?.("Answer saved") || toast?.success?.("Answer saved")
} catch {}
}

const onCancel = () => {
setDraft(persisted)
setDirty(false)
}

const saved = (persisted || "").trim().length > 0
const wordCount = (draft || "").trim() ? (draft || "").trim().split(/\s+/).length : 0

return (
<motion.div
  key={keyId}
  initial={{ opacity: 0, y: 8 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-50px" }}
  whileHover={{ scale: 1.01 }}
  className="p-4 rounded-lg border transition hover:shadow-md hover:border-purple-200 hover:bg-gradient-to-br hover:from-white hover:to-purple-50"
>
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold mt-0.5">
      {index + 1}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-900">{highlight(text, highlightNeedle || "")}</span>
        {saved && (
          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5" /> {ui.savedBadge || "Saved"}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-2" onClick={toggle}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {open ? (ui.answerButtonHide || "Hide answer") : (ui.answerButtonShow || "Answer")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => {
            const content = `${text}\nAnswer: ${persisted || ""}`
            navigator.clipboard.writeText(content)
            try {
              const msg = ui.copiedQuestionsAnswers || "Copied questions + answers"
              toast?.toast?.success?.(msg) || toast?.success?.(msg)
            } catch {}
          }}
        >
          <Copy className="h-4 w-4" /> {ui.copyWithAnswersLabel || "Copy with answers"}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 110, damping: 16 }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <textarea
                className="w-full rounded-lg border focus:ring-2 focus:ring-purple-300 p-3 min-h-[140px] outline-none transition bg-white"
                placeholder={ui.answerPlaceholder || "Write your answer here…"}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  setDirty(true)
                }}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span>{wordCount} words</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" disabled={!dirty} onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={onSave} disabled={!dirty} className="gap-2">
                    <Save className="h-4 w-4" /> Save
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
</motion.div>
)
}

const computeQuiz = () => {
const score: Record<string, number> = {}
quizDims.forEach((d) => (score[d] = 0))
quiz.forEach((sel, i) => {
if (sel >= 0) {
  const w = quizQuestions[i]?.options?.[sel]?.weight
  if (w && score.hasOwnProperty(w)) score[w] += 1
}
})
setQuizScore(score)
}
const resetQuiz = () => {
setQuiz(Array(quizQuestions.length).fill(-1))
const empty: Record<string, number> = {}
quizDims.forEach((d) => (empty[d] = 0))
setQuizScore(empty)
}
const quizTopTwo = () => {
const entries = Object.entries(quizScore).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
const [first, second] = entries
return { first, second }
}

const headerIO = useInView<HTMLDivElement>()
const statsIO = useInView<HTMLDivElement>()

return (
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
<div className="container mx-auto px-4 py-8">
  <Breadcrumbs />
  <RecentlyViewedBar currentTitle="Interview Tips & Preparation" ui={ui} />

  <motion.div
    ref={headerIO.ref}
    initial={{ opacity: 0, y: 12 }}
    animate={headerIO.visible ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6 }}
    className="text-center mb-10"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4 shadow-sm">
      <MessageSquare className="h-8 w-8 text-purple-600" />
    </div>
    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
      Interview Tips & Preparation
    </h1>
    <div className="flex items-center justify-center gap-3">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur text-purple-700 border border-purple-200">
        <Counter target={totalQuestions} start className="font-semibold" /> total questions
      </span>
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur text-green-700 border border-green-200">
        <Counter target={savedAnswersCount} start className="font-semibold" /> saved answers
      </span>
    </div>
    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-3">
      Master the art of interviewing with our JSON-powered guide to preparation, performance, and follow-up.
    </p>
  </motion.div>

  <div ref={statsIO.ref} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
    {(data?.stats ?? []).map((s: any, i: number) => (
      <motion.div key={i} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}>
        <Card className="text-center hover:shadow-lg transition duration-300 hover:-translate-y-0.5">
          <CardContent className="pt-6">
            <Counter
              target={Number(s.value) || 0}
              display={s.display}
              suffix={s.suffix}
              start={true}
              className={`text-3xl font-bold mb-2 ${
                s.accent && accentToClass[s.accent] ? accentToClass[s.accent].split(" ")[0] : "text-purple-600"
              }`}
              durationMs={700 + i * 120}
            />
            <p className="text-gray-600">{s.label}</p>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>

  <Card className="mb-12 overflow-hidden">
    <CardHeader className="relative">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-transparent rounded-full blur-3xl opacity-50 pointer-events-none" />
      <CardTitle className="text-2xl">Interview Preparation Phases</CardTitle>
      <CardDescription>Plan, perform, and follow-through with a clean, practical checklist.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="relative pl-6">
        <div className="absolute top-0 left-3 bottom-0 w-px bg-gradient-to-b from-purple-300 via-purple-200 to-transparent" />
        <div className="space-y-8">
          {(data?.interviewPhases ?? []).map((phase: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-white border border-purple-300 grid place-items-center shadow-sm">
                            <img src={phase.icon} alt={phase.phase} className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1 rounded-xl border bg-white hover:shadow-md transition p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{phase.phase}</h3>
                    <span className="text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-full">
                      {phase.tips?.length || 0} tips
                    </span>
                  </div>
                  <ul className="mt-3 grid md:grid-cols-2 gap-2">
                    {(phase.tips ?? []).map((tip: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-md hover:bg-purple-50 transition"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <span className="text-gray-700 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>

{data?.starMethod && (
<Card className="mb-12 overflow-hidden" role="region" aria-labelledby="star-title">
<CardHeader>
<CardTitle id="star-title" className="text-2xl">{data.starMethod.title}</CardTitle>
<CardDescription>{data.starMethod.description}</CardDescription>
</CardHeader>
<CardContent>
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  {(data.starMethod.steps ?? []).map((step: any, index: number) => {
    const bgColors = [
      "bg-purple-50",
      "bg-blue-50",
      "bg-green-50",
      "bg-orange-50"
    ]
    const textColor = [
      "text-purple-800",
      "text-blue-800",
      "text-green-800",
      "text-orange-800"
    ]
    const bgColor = bgColors[index] || bgColors[0]
    const colorClass = textColor[index] || textColor[0]

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        whileHover={{
          scale: 1.005,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative group"
      >
        <Card className={`h-full border border-gray-100 ${bgColor} hover:border-gray-200 transition-all duration-200`}>
          
          <div className={`h-0.5 ${colorClass.replace('text-', 'bg-')} rounded-t-md`} />

          <div className="flex justify-center pt-4 pb-3">
            <span className={`inline-flex items-center justify-center w-8 h-8 text-xs font-semibold rounded-full ${colorClass} bg-white/80 shadow-sm`}>
              {step.letter}
            </span>
          </div>

          <CardHeader className="pb-2 px-4 pt-0">
            <h3 className={`text-lg font-medium text-gray-900 leading-tight text-center`}>
              {step.word}
            </h3>
          </CardHeader>

          <CardContent className="px-4 pb-6 pt-2">
            <p className="text-gray-700 text-sm leading-relaxed mb-5 text-center">
              {step.description}
            </p>

            <details className="cursor-pointer rounded-lg p-3 mt-4 bg-white/50 hover:bg-white/70 transition-colors duration-150">
              <summary className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
                <span className="text-xs opacity-80">Example</span>
                <ChevronDown className="h-4 w-4 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-xs italic mt-2 text-gray-600 leading-relaxed text-center">
                “{step.example}”
              </p>
            </details>

            <Button
              size="sm"
              variant="outline"
              className="mt-5 w-full justify-center gap-2 px-4 py-2 text-sm font-normal border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              onClick={() => {
                const tpl = `# ${step.word} (${step.letter})\n• Prompt:\n${step.description}\n\n• My answer:\n`
                navigator.clipboard.writeText(tpl).catch(console.error)
                if (typeof window !== "undefined" && (window as any)?.toast?.success) {
                  (window as any).toast.success(data?.ui?.copyTemplate || "Template copied to clipboard")
                }
              }}
              aria-label={`Copy ${step.word} template`}
            >
              <Copy className="h-4 w-4 text-gray-500" />
              {data?.ui?.copyTemplate || "Copy template"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  })}
</div>

<p className="text-center text-xs text-gray-500 mt-8 italic">
  Use this framework to structure your stories — not to limit them.
</p>

</CardContent>
</Card>
)}
  {(data?.commonQuestions?.length ?? 0) > 0 && (
    <Card className="mb-12">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Common Interview Questions</CardTitle>
        <CardDescription>Filter questions, edit your answers freely, then save when you’re ready.</CardDescription>
        <div className="flex items-center gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ui.searchPlaceholder || "Search this tab…"}
            className="bg-white"
          />
          {query && (
            <Button variant="outline" size="sm" onClick={() => setQuery("")}>
              {ui.clearLabel || "Clear"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            {data.commonQuestions.map((c: any, i: number) => {
              const cat = c.category || "Category"
              const total = (c.questions ?? []).length
              return (
                <TabsTrigger key={i} value={cat.toLowerCase()} className="relative group transition">
                  <span className="group-hover:text-purple-700 transition">{cat}</span>
                  <Badge variant="secondary" className="ml-2">{total}</Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {data.commonQuestions.map((category: any, categoryIndex: number) => {
            const cat = category.category || "Category"
            const catId = cat.toLowerCase()
            const qsFull: string[] = category.questions ?? []

            const items = qsFull.map((text, idx) => ({ text, idx }))
            const filteredItems = activeTab === catId && q
              ? items.filter((it) => it.text.toLowerCase().includes(q))
              : items

            const copyWithAnswers = () => copyQuestions(cat, qsFull, true)
            const copyOnlyQs = () => copyQuestions(cat, qsFull, false)

            return (
              <TabsContent key={categoryIndex} value={catId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{cat}</Badge>
                    <span className="text-sm text-gray-500">
                      {filteredItems.length} / {qsFull.length} {ui.questionsWord || "questions"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyOnlyQs}>
                      <Copy className="h-4 w-4" /> {ui.copyLabel || "Copy"}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2" onClick={copyWithAnswers}>
                      <PencilLine className="h-4 w-4" /> {ui.copyWithAnswersLabel || "Copy with answers"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredItems.map(({ text, idx }) => (
                    <QuestionItem
                      key={`${cat}-${idx}`}
                      category={cat}
                      index={idx}
                      text={text}
                      highlightNeedle={activeTab === catId ? q : ""}
                    />
                  ))}
                </div>

                {filteredItems.length === 0 && (
                  <p className="text-sm text-gray-500">{ui.noMatches || "No questions match your search in this tab."}</p>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )}

{(data?.videos?.length ?? 0) > 0 && (
<Card className="mb-12 overflow-hidden">
<CardHeader className="relative">
  <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-tr from-muted to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
  <CardTitle className="text-2xl">{ui.videosTitle || "Interview Skill Development Videos"}</CardTitle>
  <CardDescription>{ui.videosDescription || "Concise, actionable video modules designed to refine key interview competencies."}</CardDescription>
</CardHeader>
<CardContent>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {data.videos.map((v: any, i: number) => {
      const colorMap = [
        "from-purple-500 to-purple-600",
        "from-blue-500 to-blue-600",
        "from-green-500 to-green-600",
        "from-orange-500 to-orange-600"
      ];
      const gradient = colorMap[i % colorMap.length] || "from-purple-500 to-purple-600";

    const baseBg = "bg-background";
    const hoverBg = `hover:bg-gradient-to-br ${gradient} hover:bg-opacity-95`;
    const hoverBorder = `hover:border-${gradient.split("-")[1]}-400`;
    const textColor = gradient.includes("purple") ? "text-purple-800" :
                      gradient.includes("blue") ? "text-blue-800" :
                      gradient.includes("green") ? "text-green-800" :
                      "text-orange-800";

    return (
      <motion.a
        key={i}
        href={v.href || "#"}
        whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative block rounded-2xl overflow-hidden border-2 border-border/50 backdrop-blur-sm bg-background/70 ${hoverBg} ${hoverBorder} transition-all duration-300 group`}
        target="_blank"
        rel="noopener noreferrer"
      >
        
        <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 z-10" style={{
          background: `linear-gradient(135deg, ${gradient.replace('from-', '').replace(' to-', ', ')})`
        }} />

        {v.thumbnail && (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={v.thumbnail}
              alt={v.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/85 border border-white/70 backdrop-blur-sm grid place-items-center shadow-md">
                <Play className="h-7 w-7 text-indigo-600" />
              </div>
            </div>
          </div>
        )}

        <div className="p-6 relative z-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${textColor}`}>{v.title}</h3>
            {v.badge && (
              <Badge 
                variant="outline" 
                className={`border-${gradient.split("-")[1]}-400 text-${gradient.split("-")[1]}-700 bg-${gradient.split("-")[1]}-50/50 backdrop-blur-sm`}
              >
                {v.badge}
              </Badge>
            )}
          </div>
          <p className={`text-gray-700 mb-4 leading-relaxed text-sm ${textColor.replace('text-', 'text-')}`}>
            {v.desc}
          </p>
          <Button 
            variant="ghost" 
            className={`gap-2 px-3 py-2 text-sm font-medium ${textColor} hover:bg-${gradient.split("-")[1]}-100/50`}
          >
            <Play className="h-4 w-4" /> 
            {i === 0 ? "Watch now" : "Start session"}
          </Button>
        </div>

        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 grid place-items-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play className="h-6 w-6 text-white/90" />
        </div>
      </motion.a>
        );
      })}
    </div>
  </CardContent>
</Card>
)}
{(data?.resources?.length ?? 0) > 0 && (
<Card className="mb-12">
  <CardHeader>
    <CardTitle className="text-2xl">{ui.resourcesTitle || "Downloadable Resources"}</CardTitle>
    <CardDescription>{ui.resourcesDescription || "Practical templates and checklists to streamline your preparation."}</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {data.resources.map((r: any, i: number) => {
    const bgColors = [
      "bg-purple-50",
      "bg-blue-50",
      "bg-green-50"
    ]
    const bgColor = bgColors[i % bgColors.length] || "bg-gray-50"

    return (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        whileHover={{
          scale: 1.005,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.03)",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="relative group"
      >
        <Card className={`h-full border border-gray-100 ${bgColor} hover:border-gray-200 transition-all duration-200 overflow-hidden`}>
          
          <div className={`h-0.5 ${
            r.accent === 'purple' ? 'bg-purple-500' :
            r.accent === 'blue' ? 'bg-blue-500' :
            r.accent === 'green' ? 'bg-green-500' :
            r.accent === 'orange' ? 'bg-orange-500' :
            'bg-gray-300'
          }`} />

          <div className="flex justify-center pt-6 pb-4">
            <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center shadow-sm border border-gray-100">
              <Download className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          <CardHeader className="pb-2 px-4 pt-0">
            <h3 className="text-lg font-medium text-gray-900 leading-tight text-center">
              {r.title}
            </h3>
          </CardHeader>

          <CardContent className="px-4 pb-6 pt-2">
            <p className="text-gray-700 text-sm leading-relaxed text-center mb-4">
              {r.desc}
            </p>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="w-full justify-center gap-2 px-4 py-2 text-sm font-normal border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              aria-label={`Download ${r.title}`}
            >
              <a href={r.href} download>
                Download PDF
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  })}
</div>

  <p className="text-center text-xs text-gray-500 mt-8 italic">
    These are living documents — update them as you grow.
  </p>

</CardContent>
</Card>
)}
  {quizQuestions.length > 0 && (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="text-2xl">{ui.quizTitle || "Career Fit Mini-Quiz"}</CardTitle>
        <CardDescription>{ui.quizDesc || "Pick one option per question. We’ll show what you lean toward."}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {quizQuestions.map((item: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-4 rounded-lg border bg-white hover:shadow-sm transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-3">{item.q}</p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {(item.options ?? []).map((opt: any, oi: number) => {
                      const checked = quiz[i] === oi
                      return (
                        <label
                          key={oi}
                          className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition
                            ${checked ? "border-purple-400 bg-purple-50" : "hover:bg-gray-50"}`}
                          onClick={() => setQuiz((qz) => {
                            const next = [...qz]
                            next[i] = oi
                            return next
                          })}
                        >
                          <input type="radio" className="accent-purple-600" checked={checked} onChange={() => {}} />
                          <span className="text-sm text-gray-800">{opt.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={computeQuiz} className="gap-2">
            {ui.computeQuiz || "Compute result"}
          </Button>
          <Button variant="outline" onClick={resetQuiz}>
            {ui.resetQuiz || "Reset quiz"}
          </Button>

          {(Object.values(quizScore).reduce((a, b) => a + (b || 0), 0) > 0) && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {(() => {
                const entries = Object.entries(quizScore).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
                const [first, second] = entries
                return (
                  <>
                    {first && <Badge className="bg-purple-600 text-white">{(ui.quizTop || "Top")}: {first[0]} ({first[1]})</Badge>}
                    {second && <Badge variant="secondary">{(ui.quizNext || "Next")}: {second[0]} ({second[1]})</Badge>}
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )}

  {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
  {loading && <p className="mt-6 text-sm text-gray-500">Loading content…</p>}
</div>
</motion.div>
)
}

