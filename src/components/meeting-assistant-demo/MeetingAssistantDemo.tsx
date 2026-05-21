import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileType,
  Globe,
  Loader2,
} from "lucide-react";
import { scenario, type Annotation, type TranscriptEntry } from "./scenario";
import { usePlayback } from "./usePlayback";
import { useAutoScroll } from "./useAutoScroll";

const BADGE_STYLES: Record<Annotation["type"], { label: string; bg: string; text: string; ring: string }> = {
  claim_check: {
    label: "CLAIM CHECK",
    bg: "rgba(250, 204, 21, 0.12)",
    text: "rgb(250, 204, 21)",
    ring: "rgba(250, 204, 21, 0.3)",
  },
  question_answered: {
    label: "QUESTION ANSWERED",
    bg: "rgba(34, 211, 238, 0.12)",
    text: "rgb(34, 211, 238)",
    ring: "rgba(34, 211, 238, 0.3)",
  },
  insight: {
    label: "INSIGHT",
    bg: "rgba(168, 85, 247, 0.12)",
    text: "rgb(192, 132, 252)",
    ring: "rgba(168, 85, 247, 0.3)",
  },
};

function getDocIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return FileText;
  if (lower.endsWith(".csv")) return FileSpreadsheet;
  if (lower.endsWith(".docx")) return FileType;
  return Globe;
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

function useTypewriter(text: string, active: boolean, durationMs: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) {
      setN(0);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const loop = () => {
      const t = Math.min(1, (performance.now() - start) / durationMs);
      setN(Math.floor(t * text.length));
      if (t < 1) raf = requestAnimationFrame(loop);
      else setN(text.length);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [text, active, durationMs]);
  return text.slice(0, n);
}

function TranscriptLine({ entry }: { entry: TranscriptEntry }) {
  const dur = Math.max(133, Math.min(200, entry.text.length * 6));
  const shown = useTypewriter(entry.text, true, dur);
  const initial = entry.speaker[0];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.12 }}
      className="flex gap-3"
    >
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">{entry.speaker}</div>
        <div className="text-sm text-gray-200 font-light leading-relaxed">
          {shown}
          {shown.length < entry.text.length && <span className="opacity-50">▍</span>}
        </div>
      </div>
    </motion.div>
  );
}

function CitationChip({ citation }: { citation: Annotation["citation"] }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 mt-3 px-2 py-1 rounded text-[11px] font-mono cursor-pointer"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        color: "rgba(255,255,255,0.55)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <FileText size={11} />
      <span>
        {citation.source} · {citation.locator}
      </span>
    </div>
  );
}

function AnnotationCard({ annotation }: { annotation: Annotation }) {
  const s = BADGE_STYLES[annotation.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      className="rounded-lg p-4"
      style={{
        backgroundColor: "rgba(255,255,255,0.03)",
        border: `1px solid ${s.ring}`,
      }}
    >
      <span
        className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider mb-2"
        style={{ backgroundColor: s.bg, color: s.text }}
      >
        {s.label}
      </span>
      <div className="text-sm text-gray-200 font-light leading-relaxed">{annotation.text}</div>
      <CitationChip citation={annotation.citation} />
    </motion.div>
  );
}

function ThinkingPulse() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="rounded-lg p-4 flex items-center gap-2"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.1)",
      }}
    >
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="text-gray-400 text-sm"
      >
        ···
      </motion.span>
      <span className="text-xs text-gray-500">Thinking…</span>
    </motion.div>
  );
}

function HeroContextLoader({ pillsLoaded }: { pillsLoaded: number }) {
  const total = scenario.context.length;
  const status =
    pillsLoaded >= total
      ? "Ready, starting meeting"
      : pillsLoaded >= 4
        ? "Indexing…"
        : "Reading…";

  return (
    <motion.div
      key="hero"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4 }}
      className="overflow-hidden"
    >
      <div className="text-center mb-6">
        <p className="text-[11px] uppercase tracking-widest text-blue-400 font-medium mb-2">
          Pre-meeting context
        </p>
        <p className="text-xs text-gray-500 font-mono">
          9 documents · 2,840 KB · ready in 1.8s
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenario.context.map((c, i) => {
          const loaded = i < pillsLoaded;
          const Icon = getDocIcon(c.name);
          return (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: loaded ? 1 : 0.25, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg"
              style={{
                backgroundColor: loaded
                  ? "rgba(34,197,94,0.06)"
                  : "rgba(255,255,255,0.02)",
                border: `1px solid ${loaded ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
                style={{
                  backgroundColor: loaded ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                  color: loaded ? "rgb(134,239,172)" : "rgba(255,255,255,0.4)",
                }}
              >
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-mono truncate"
                  style={{ color: loaded ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)" }}
                >
                  {c.name}
                </div>
              </div>
              <div className="flex-shrink-0">
                {loaded ? (
                  <Check size={14} style={{ color: "rgb(134,239,172)" }} />
                ) : (
                  <Loader2 size={14} className="animate-spin text-gray-500" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-5 text-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-gray-400 font-mono"
          >
            {status}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function MeetingAssistantDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const hasAutoStartedRef = useRef(false);
  const {
    state,
    pillsLoaded,
    revealedTranscriptIds,
    revealedAnnotationIds,
    pendingAnnotationIds,
    start,
    replay,
  } = usePlayback();

  const isPlaying = state === "playing";
  const showHero = state === "idle-pre" || state === "loading-context";
  const showCompactStrip = state === "transitioning" || state === "playing" || state === "idle-post";

  const { isPaused, catchUp } = useAutoScroll(containerRef, isPlaying);

  // Auto-start on scroll-into-view, once per page load
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAutoStartedRef.current) {
          hasAutoStartedRef.current = true;
          start();
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [start]);

  const allLoaded = pillsLoaded >= scenario.context.length;
  const statusText =
    state === "playing"
      ? "Q4 Review · Recording"
      : state === "idle-post"
        ? "Q4 Review · Idle"
        : state === "transitioning"
          ? "Starting meeting"
          : state === "loading-context"
            ? allLoaded
              ? "Ready"
              : "Loading context"
            : "Idle";

  const visibleTranscript = scenario.transcript.filter((t) => revealedTranscriptIds.has(t.id));
  const visibleAnnotations = scenario.annotations.filter((a) => revealedAnnotationIds.has(a.id));
  const pendingAnnotations = scenario.annotations.filter((a) => pendingAnnotationIds.has(a.id));

  const annotationByTranscriptId = useMemo(() => {
    const map = new Map<string, Annotation[]>();
    for (const a of scenario.annotations) {
      const trigger = [...scenario.transcript].reverse().find((t) => t.startAt <= a.fireAt);
      if (!trigger) continue;
      if (!map.has(trigger.id)) map.set(trigger.id, []);
      map.get(trigger.id)!.push(a);
    }
    return map;
  }, []);

  return (
    <>
      <motion.div
        ref={containerRef}
        layout
        transition={{ duration: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#febc2e" }} />
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28c840" }} />
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={statusText}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-400 font-medium"
              >
                {statusText}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <motion.span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#ef4444" }}
                animate={isPlaying ? { opacity: [1, 0.3, 1] } : { opacity: 0.3 }}
                transition={isPlaying ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              />
              <span className="text-[11px] text-gray-500 uppercase tracking-wider">Live</span>
            </div>
            {(state === "idle-post" || isPlaying) && (
              <button
                onClick={replay}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors ${
                  state === "idle-post" ? "text-white" : "text-gray-400 hover:text-gray-200"
                }`}
                style={
                  state === "idle-post"
                    ? { backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.4)" }
                    : { backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                <RotateCcw size={11} />
                Replay
              </button>
            )}
          </div>
        </div>

        {/* Compact context strip (after hero collapses) */}
        {showCompactStrip && (
          <div
            className="px-4 py-3 flex flex-wrap gap-2 items-center"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-[11px] uppercase tracking-wider text-gray-500 mr-2">Context</span>
            {scenario.context.map((c) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono"
                style={{
                  backgroundColor: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "rgb(134,239,172)",
                }}
              >
                <Check size={10} />
                {c.name}
              </span>
            ))}
          </div>
        )}

        {/* Body */}
        <motion.div layout transition={{ duration: 0.1 }} className="p-6">
          <AnimatePresence mode="wait">
            {showHero ? (
              <HeroContextLoader key="hero-loader" pillsLoaded={pillsLoaded} />
            ) : isMobile ? (
              <motion.div key="mobile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider text-gray-500">
                  <Mic size={12} /> Transcript
                </div>
                <motion.div layout className="space-y-5">
                  {visibleTranscript.map((t) => {
                    const inline = (annotationByTranscriptId.get(t.id) || []).filter((a) =>
                      revealedAnnotationIds.has(a.id),
                    );
                    const inlinePending = (annotationByTranscriptId.get(t.id) || []).filter((a) =>
                      pendingAnnotationIds.has(a.id),
                    );
                    return (
                      <div key={t.id}>
                        <TranscriptLine entry={t} />
                        {(inline.length > 0 || inlinePending.length > 0) && (
                          <div className="mt-3 ml-10 space-y-2">
                            {inline.map((a) => (
                              <AnnotationCard key={a.id} annotation={a} />
                            ))}
                            <AnimatePresence>
                              {inlinePending.map((a) => (
                                <ThinkingPulse key={a.id} />
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="desktop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 gap-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider text-gray-500">
                    <Mic size={12} /> Transcript
                  </div>
                  <motion.div layout className="space-y-5">
                    {visibleTranscript.map((t) => (
                      <TranscriptLine key={t.id} entry={t} />
                    ))}
                  </motion.div>
                </div>
                <div style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "1.5rem" }}>
                  <div className="flex items-center gap-2 mb-4 text-xs uppercase tracking-wider text-gray-500">
                    <Sparkles size={12} /> Agent notes
                  </div>
                  <motion.div layout className="space-y-3">
                    {visibleAnnotations.map((a) => (
                      <AnnotationCard key={a.id} annotation={a} />
                    ))}
                    <AnimatePresence>
                      {pendingAnnotations.map((a) => (
                        <ThinkingPulse key={a.id} />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isPlaying && isPaused && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={catchUp}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium shadow-lg"
            style={{ backgroundColor: "rgba(59,130,246,0.95)", color: "white" }}
          >
            <ChevronDown size={14} />
            Catch up
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
