"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Download, CheckCircle, Star, ArrowRight, Copy, ChevronDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BreadcrumbNav } from "@/components/navigation/breadcrumb";

function DownloadButton({
  onClick,
  children,
  className = "",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - target.left;
    const y = e.clientY - target.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 600);
    onClick?.();
  };
  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.98, boxShadow: "0 0 0 10px rgba(107,114,128,0.2)" }}
      className={
        "relative overflow-hidden w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:shadow-md transition " +
        className
      }
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-400/30"
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
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(12); opacity: 0; }
        }
      `}</style>
    </motion.button>
  );
}

type ResumeData = {
  stats: { value: string; label: string; accent: "blue" | "green" | "purple" }[];
  sections: { title: string; description: string; tips: string[]; example: string }[];
  templates: {
    name: string;
    description: string;
    features: string[];
    fileUrl: string;
    format: "PDF" | "DOCX";
    size?: string;
  }[];
  commonMistakes: string[];
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function AnimatedCounter({ value, duration = 900 }: { value: string; duration?: number }) {
  const nf = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const num = Number(String(value).replace(/[^\d]/g, "")) || 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(num * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [num, duration]);

  const parts = String(value).split(/(\d+)/);
  let first = true;
  const rendered = parts.map((part) => {
    if (!/^\d+$/.test(part)) return part;
    if (first) {
      first = false;
      return nf.format(n);
    }
    return nf.format(Number(part));
  });

  return <>{rendered}</>;
}

export default function ResumePage() {
  const { toast } = useToast();
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recent, setRecent] = useState<string[]>([]);
  const [formatFilter, setFormatFilter] = useState<"ALL" | "PDF" | "DOCX">("ALL");

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/data/resume.json", { cache: "no-store" });
        const json: ResumeData = await res.json();
        setData(json);
      } catch (e) {
        console.error("Failed to load /data/resume.json", e);
      } finally {
        setLoading(false);
      }
    };
    run();
    const rv = JSON.parse(localStorage.getItem("recentlyViewedTemplates") || "[]");
    setRecent(rv);
  }, []);

  const onDownload = (tplName: string, url: string) => {
    const a = document.createElement("a");
    a.href = url;
    const urlName = url.split("/").pop() || "";
    const hasExt = /\.[a-z0-9]+$/i.test(urlName);
    const fallback = tplName.trim().replace(/\s+/g, "_");
    a.download = hasExt ? urlName : `${fallback}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Download started",
      description: `“${tplName}” is downloading. Check your browser downloads.`,
      duration: 2500,
    });

    setRecent((prev) => {
      const next = [tplName, ...prev.filter((n) => n !== tplName)].slice(0, 6);
      localStorage.setItem("recentlyViewedTemplates", JSON.stringify(next));
      return next;
    });
  };

  const accentMap = useMemo(
    () => ({
      blue: "text-blue-600 bg-blue-100",
      green: "text-green-600 bg-green-100",
      purple: "text-purple-600 bg-purple-100",
    }),
    []
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load resume content.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BreadcrumbNav />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resume Guidelines</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create a professional resume that showcases your skills and gets you noticed by employers.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {data.stats.map((s, i) => (
            <motion.div key={i} variants={item}>
              <Card className="text-center bg-card hover:bg-card/70 hover:backdrop-blur-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <CardContent className="pt-6">
                  <div className={`text-3xl font-bold mb-2 inline-block rounded-md px-2 ${accentMap[s.accent]}`}>
                    <AnimatedCounter value={s.value} />
                  </div>
                  <p className="text-gray-600">{s.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <section className="mb-12">
          <Card className="mb-6 bg-card hover:bg-card/70 hover:backdrop-blur-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-base">Quick Navigation</CardTitle>
              <CardDescription>Select a section to jump to it</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {data.sections.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="whitespace-nowrap text-sm px-3 py-2 rounded-md border bg-background hover:bg-gray-50 transition"
                  >
                    {new Intl.NumberFormat("en-US").format(i + 1)}. {s.title}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card hover:bg-card/70 hover:backdrop-blur-sm transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Essential Resume Sections</CardTitle>
              <CardDescription>Learn how to craft each section of your resume for maximum impact.</CardDescription>
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
                    key={index}
                    variants={item}
                    id={`sec-${index}`}
                    className="group relative rounded-xl border bg-white/80 hover:bg-white/60 hover:backdrop-blur-sm transition-colors p-5 shadow-sm"
                  >
                    <span className="absolute left-0 top-6 h-10 w-1 rounded-r bg-gradient-to-b from-blue-500 to-indigo-500" />

                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-bold">
                        {new Intl.NumberFormat("en-US").format(index + 1)}
                      </span>
                      <h3 className="text-lg md:text-xl font-semibold text-gray-900">{section.title}</h3>
                    </div>

                    <p className="text-gray-600 mb-4">{section.description}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Best Practices</h4>
                        <ul className="space-y-2">
                          {section.tips.map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                              <span className="text-gray-700 text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border bg-gray-50 hover:bg-gray-100/70 transition-colors p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Example</h4>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(section.example || "");
                              toast({ title: "Copied", description: "Example copied to clipboard." });
                            }}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border bg-white hover:bg-gray-50 transition"
                          >
                            <Copy className="h-3.5 w-3.5" /> Copy
                          </button>
                        </div>

                        <details className="mt-2 group">
                          <summary className="cursor-pointer select-none text-sm font-medium text-gray-900 flex items-center gap-1">
                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                            Show/Hide
                          </summary>
                          <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap font-mono">{section.example}</pre>
                        </details>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </section>

        <Card className="mb-12 bg-card hover:bg-card/70 hover:backdrop-blur-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">Professional Resume Templates</CardTitle>
            <CardDescription>Download professionally designed templates to get started quickly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex flex-wrap gap-2">
              {(["ALL", "PDF", "DOCX"] as const).map((k) => (
                <Button
                  key={k}
                  variant={formatFilter === k ? "default" : "outline"}
                  size="sm"
                  className={formatFilter === k ? "" : "bg-transparent"}
                  onClick={() => setFormatFilter(k)}
                >
                  {k}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.templates
                .filter((t) => (formatFilter === "ALL" ? true : t.format === formatFilter))
                .map((t, i) => (
                  <motion.div
                    key={`${t.name}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="h-full border bg-white/80 hover:bg-gradient-to-br hover:from-blue-50 hover:to
                    -indigo-50 hover:backdrop-blur-sm transition-all duration
                    -300 shadow-sm hover:shadow-xl rounded-xl border-gray-100 hover:border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">{t.name}</CardTitle>
                        <CardDescription>{t.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                          <ul className="space-y-1">
                            {t.features.map((f, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t.format}</span>
                          {t.size ? <span>{t.size}</span> : null}
                        </div>

                        <div className="flex gap-2">
                          <DownloadButton onClick={() => onDownload(t.name, t.fileUrl)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DownloadButton>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>

            {recent.length > 0 && (
              <>
                <div className="relative my-8">
                  <Separator />
                  <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-3 text-xs font-medium text-muted-foreground">
                    Recently viewed
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {recent.map((name) => (
                    <button
                      key={name}
                      className="text-xs rounded-full px-3 py-1 border bg-background hover:bg-gray-50 transition"
                      onClick={() => {
                        const el = Array.from(document.querySelectorAll("h3, h2, .text-lg"))
                          .find((n) => n.textContent?.trim() === name) as HTMLElement | undefined;
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    >
                      {name}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      localStorage.removeItem("recentlyViewedTemplates");
                      setRecent([]);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="mb-12 bg-card hover:bg-card/70 hover:backdrop-blur-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Common Resume Mistakes to Avoid</CardTitle>
            <CardDescription>
              Learn from these frequent errors that can hurt your chances of getting an interview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.commonMistakes.map((m, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-red-600 text-sm font-bold">✗</span>
                  </div>
                  <span className="text-red-800">{m}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card hover:bg-card/70 hover:backdrop-blur-sm transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl">Next Steps</CardTitle>
            <CardDescription>Ready to create your resume? Follow these steps to get started.</CardDescription>
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
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold">
                      {new Intl.NumberFormat("en-US").format(i + 1)}
                    </span>
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="flex-1">
                <Link href="/quiz">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Take Our Career Quiz
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1 bg-transparent">
                <Link href="/interview">
                  <FileText className="h-5 w-5 mr-2" />
                  View Interview Tips
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
