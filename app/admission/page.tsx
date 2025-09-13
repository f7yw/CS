"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Globe, GraduationCap, FileText, Download, ExternalLink,
  CheckCircle, ArrowRight, ChevronDown, FlaskRound, BriefcaseBusiness, Palette, Cog,
} from "lucide-react";

type Stream = {
  id: string; name: string; icon: string; description: string;
  requirements: string[]; careers: string[]; image?: string;
  difficulty?: "easy" | "moderate" | "hard"; avgSalary?: string;
};
type Step = { step: number; title: string; description: string; details: string[]; estimatedTime?: string; costRange?: string; };
type Country = { name: string; flag: string; popular: string; info?: string; visaRequirement?: string; language?: string; acceptanceRate?: number; };
type DownloadItem = { label: string; file: string; size?: string };
type ExternalResource = { name: string; url: string; desc: string };
type AdmissionData = {
  title: string; subtitle?: string; streams: Stream[]; studyAbroadSteps: Step[];
  countries: Country[]; downloads: DownloadItem[]; externalResources: ExternalResource[];
};


const isImage = (v?: string) => !!v && (/^https?:\/\//.test(v) || v.startsWith("/"));
const pickDownloadStyle = (label: string, file: string) => {
  const l = (label || "").toLowerCase(), f = (file || "").toLowerCase();
  const A = l.includes("admission") || f.includes("admission");
  const S = l.includes("study") || l.includes("checklist") || f.includes("study-abroad");
  const P = l.includes("scholarship") || f.includes("scholarship");
  if (A) return { wrap: "bg-green-50", dot: "bg-green-100", iconColor: "text-green-600", btn: "bg-green-600 hover:bg-green-700" };
  if (S) return { wrap: "bg-blue-50",  dot: "bg-blue-100",  iconColor: "text-blue-600",  btn: "bg-blue-600 hover:bg-blue-700"  };
  if (P) return { wrap: "bg-purple-50",dot: "bg-purple-100",iconColor: "text-purple-600",btn: "bg-purple-600 hover:bg-purple-700" };
  return { wrap: "bg-gray-50", dot: "bg-gray-200", iconColor: "text-gray-700", btn: "bg-gray-800 hover:bg-gray-900" };
};

const streamIcons: Record<string, JSX.Element> = {
  science:   <FlaskRound className="h-6 w-6 text-emerald-600" />,
  commerce:  <BriefcaseBusiness className="h-6 w-6 text-blue-600" />,
  arts:      <Palette className="h-6 w-6 text-pink-500" />,
  technical: <Cog className="h-6 w-6 text-gray-700" />,
};
const TiltCard: React.FC<React.PropsWithChildren<{ onClick?: () => void; open?: boolean; className?: string }>> =
({ children, onClick, open, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);
  const handle = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -8, ry = ((x / r.width) - 0.5) * 12;
    el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${x}px`);  el.style.setProperty("--my", `${y}px`);
  };
  const reset = () => { const el = ref.current; if (!el) return; el.style.setProperty("--rx","0deg"); el.style.setProperty("--ry","0deg"); };

  return (
    <div
      ref={ref} onMouseMove={handle} onMouseLeave={reset} onClick={onClick}
      className={`relative group rounded-2xl [transform:perspective(900px)_rotateX(var(--rx))_rotateY(var(--ry))] transition-transform duration-200 will-change-transform ${className}`}
      aria-expanded={!!open}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100"
        style={{ background:"linear-gradient(90deg,#34d39955,#22d3ee55,#a78bfa55)", backgroundSize:"200% 200%" }}
        animate={{ backgroundPosition: ["0% 50%","100% 50%","0% 50%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className={`relative rounded-2xl bg-white border border-gray-100 shadow-md group-hover:shadow-xl overflow-hidden h-full flex flex-col ${open ? "ring-2 ring-emerald-400 bg-emerald-50/40" : ""}`}>
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 mix-blend-plus-lighter transition-opacity"
          style={{ background:"radial-gradient(400px 200px at var(--mx) var(--my), rgba(16,185,129,.15), transparent 60%)" }}
        />
        {children}
      </div>
    </div>
  );
};

const StreamCard: React.FC<{
  s: Stream; open: boolean; onToggle: () => void;
}> = ({ s, open, onToggle }) => (
  <TiltCard onClick={onToggle} open={open} className="h-full">
    <div className="relative">
      <motion.img
        src={s.image || "/placeholder.svg"} alt={s.name} loading="lazy"
        className="w-full h-48 object-cover" initial={{ scale: 1.02 }} whileHover={{ scale: 1.08 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
        onError={(e: any) => (e.currentTarget.src = "/placeholder.svg")}
      />
      
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl animate-[pulse_2s_ease-in-out_infinite]">{s.icon}</span>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
          {s.avgSalary && <p className="text-xs text-gray-500">{s.avgSalary} annual salary</p>}
        </div>
      </div>

      <p className="text-gray-600">{s.description}</p>

      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
        <span className="opacity-80">{open ? "Click to collapse" : "Click to see details"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0, y: open ? 0 : [0, 2, 0] }}
          transition={{ rotate: { duration: 0.2 }, y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
          className="inline-flex"
        >
          <ChevronDown className={`h-4 w-4 ${open ? "text-emerald-700" : "group-hover:text-emerald-700"}`} />
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="mt-4 space-y-4 border-t pt-4 overflow-hidden"
          >
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
              <ul className="flex flex-wrap gap-2">
                {s.requirements.map((req, i) => (
                  <li key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Career Paths:</h4>
              <div className="flex flex-wrap gap-2">
                {s.careers.map((c, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{c}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </TiltCard>
);

const StepItem: React.FC<{
  step: Step; open: boolean; onToggle: () => void;
}> = ({ step, open, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
    className={`relative ml-12 rounded-2xl border bg-white shadow-md hover:shadow-xl transition-all cursor-pointer ${open ? "ring-2 ring-green-500 bg-emerald-50/50" : ""}`}
    onClick={onToggle} role="button" tabIndex={0} aria-expanded={open}
  >
    <div className="absolute -left-12 top-6 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-white font-bold shadow-md">
      {step.step}
    </div>
    <div className="p-6">
      <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
      <p className="text-gray-600 mb-3">{step.description}</p>
      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
        {step.estimatedTime && <span> {step.estimatedTime}</span>}
        {step.costRange && <span> {step.costRange}</span>}
      </div>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{open ? "Hide details" : "Read more"}</span>
        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180 text-green-600" : "group-hover:text-green-600"}`} />
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            className="mt-4 space-y-2 border-t pt-4"
          >
            {step.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <ArrowRight className="h-4 w-4 text-green-500 mt-1" /> <span>{d}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const CountryCard: React.FC<{
  c: Country; open: boolean; onToggle: () => void;
}> = ({ c, open, onToggle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    className="relative group rounded-2xl cursor-pointer h-full"
    onClick={onToggle} aria-expanded={open}
  >
    <motion.div
      className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-[2px]"
      style={{ background:"linear-gradient(90deg, rgba(110,231,183,0.35), rgba(45,212,191,0.35), rgba(34,211,238,0.35))", backgroundSize:"200% 200%" }}
      animate={{ backgroundPosition: ["0% 50%","100% 50%","0% 50%"] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className={`relative bg-white rounded-2xl p-6 shadow-md border border-gray-100 transition-all h-full flex flex-col group-hover:-translate-y-0.5 group-hover:bg-emerald-50/30 group-hover:shadow-[0_8px_24px_rgba(16,185,129,0.12)] ${open ? "ring-2 ring-emerald-400 shadow-xl" : "hover:shadow-lg"}`}>
      <div className="flex items-center gap-3 mb-4">
        {isImage(c.flag) ? (
          <img src={c.flag} alt={`${c.name} flag`} loading="lazy" className="w-12 h-8 object-contain bg-white ring-1 ring-gray-200 rounded-sm" />
        ) : (<span className="text-3xl">{c.flag}</span>)}
        <div>
          <h4 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{c.name}</h4>
          <p className="text-xs text-gray-500 capitalize">{c.language ?? "—"}</p>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-3">
        <span className="font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">Popular Universities:</span> {c.popular}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>Acceptance Rate: {c.acceptanceRate ?? "—"}%</span>
        <span className="group-hover:text-emerald-700 transition-colors">{c.visaRequirement ?? ""}</span>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between text-sm text-gray-500 select-none">
        <span className={`opacity-80 ${open ? "text-emerald-700" : ""}`}>{open ? "Hide details" : "Show more"}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0, y: open ? 0 : [0, 2, 0] }}
          transition={{ rotate: { duration: 0.2, ease: "easeOut" }, y: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }}
          className="inline-flex items-center justify-center"
        >
          <ChevronDown className={`h-4 w-4 ${open ? "text-emerald-700" : "group-hover:text-emerald-700"}`} />
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open && c.info && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="mt-4 text-sm text-gray-700 pt-3 border-t border-gray-100"
          >
            {c.info}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </motion.div>
);

const DownloadCard: React.FC<{ d: DownloadItem }> = ({ d }) => {
  const style = pickDownloadStyle(d.label, d.file);
  const tone = ((l: string, f: string) => {
    l = (l || "").toLowerCase(); f = (f || "").toLowerCase();
    const A = l.includes("admission") || f.includes("admission");
    const S = l.includes("study") || l.includes("checklist") || f.includes("study-abroad");
    const P = l.includes("scholarship") || f.includes("scholarship");
    if (A) return { overlay: "from-emerald-200/60 via-teal-200/60 to-cyan-200/60", icon: "group-hover:bg-emerald-50 group-hover:ring-emerald-200" };
    if (S) return { overlay: "from-sky-200/60 via-cyan-200/60 to-blue-200/60", icon: "group-hover:bg-sky-50 group-hover:ring-sky-200" };
    if (P) return { overlay: "from-violet-200/60 via-fuchsia-200/60 to-purple-200/60", icon: "group-hover:bg-violet-50 group-hover:ring-violet-200" };
    return { overlay: "from-slate-200/60 via-gray-200/60 to-zinc-200/60", icon: "group-hover:bg-slate-50 group-hover:ring-slate-200" };
  })(d.label, d.file);

  return (
    <div className="relative group text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-xl transition-all h-full flex flex-col">
      <div className={`pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity bg-gradient-to-r ${tone.overlay}`} />
      <div className="relative z-10 flex-1 flex flex-col">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-sm bg-gray-50 ring-1 ring-gray-200 transition-all ${tone.icon}`}>
          <FileText className={`h-8 w-8 ${style.iconColor}`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{d.label}</h3>
        {d.size && <p className="text-sm text-gray-500 mb-4">({d.size})</p>}
        <div className="mt-auto">
          <a
            href={d.file} download
            className={`relative inline-flex items-center gap-2 text-white px-6 py-3 rounded-xl overflow-hidden shadow-md transition-all ${style.btn} group-hover:scale-[1.03]`}
          >
            <Download className="h-4 w-4" /> Download Now
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function AdmissionPage() {
  const [data, setData] = useState<AdmissionData | null>(null);
  const [selectedStream, setSelectedStream] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/admission.json").then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return null;
  const { title, subtitle, streams, studyAbroadSteps, countries, downloads, externalResources } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <h1 className="text-4xl font-bold text-gray-900">{title}</h1>
            </motion.div>
            {subtitle && <p className="text-xl text-gray-600 max-w-3xl mx-auto">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section>
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="h-6 w-6 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">Stream Selection Guide</h2>
            </motion.div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Choose the right academic path based on your interests, strengths, and career goals</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {streams.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="h-full">
                <StreamCard s={s} open={selectedStream === s.id} onToggle={() => setSelectedStream(selectedStream === s.id ? null : s.id)} />
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 mb-4">
              <Globe className="h-6 w-6 text-green-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Application Process</h2>
            </motion.div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Follow these steps to complete your study abroad application smoothly.</p>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 w-1 h-full bg-gradient-to-b from-green-300 via-emerald-400 to-green-600 rounded-full opacity-30" />
            <div className="space-y-8">
              {studyAbroadSteps.map((st, i) => (
                <StepItem key={st.step} step={st} open={activeStep === st.step} onToggle={() => setActiveStep(activeStep === st.step ? null : st.step)} />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Study Destinations</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {countries.map((c, i) => (
                <CountryCard key={c.name} c={c} open={activeCountry === c.name} onToggle={() => setActiveCountry(activeCountry === c.name ? null : c.name)} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900">Download Resources</h2>
            </motion.div>
            <p className="text-lg text-gray-600">Get comprehensive guides and templates to support your academic journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12 items-stretch">
            {downloads.map((d, i) => (
              <motion.div key={d.file} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="h-full">
                <DownloadCard d={d} />
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Useful External Resources</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {externalResources.map((r, i) => (
                <motion.a
                  key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-semibold text-gray-900">{r.name}</div>
                    <div className="text-sm text-gray-600">{r.desc}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
