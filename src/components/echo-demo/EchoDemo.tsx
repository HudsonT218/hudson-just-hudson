import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Play, RotateCcw, Check, ChevronDown, FileText } from "lucide-react";
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
  const dur = Math.max(400, Math.min(600, entry.text.length * 18));
  const shown = useTypewriter(entry.text, true, dur);
  const initial = entry.speaker[0];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
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
      transition={{ duration: 0.25 }}
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
      <span className="text-xs text-gray-500">Echo is thinking</span>
    </motion.div>
  );
}

export default function EchoDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const {
    state,
    revealedTranscriptIds,
    revealedAnnotationIds,
    pendingAnnotationIds,
    start,
    replay,
  } = usePlayback();

  const { isPaused, catchUp } = useAutoScroll(containerRef, state === "playing");

  // Pre-meeting context pill load-in
  const [pillsLoaded, setPillsLoaded] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setHasEntered(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!hasEntered || state !== "idle-pre") return;
    setPillsLoaded(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setPillsLoaded(i);
      if (i >= scenario.context.length) window.clearInterval(id);
    }, 250);
    return () => window.clearInterval(id);
  }, [hasEntered, state]);

  const allLoaded = pillsLoaded >= scenario.context.length;
  const isPlaying = state === "playing";
  const statusText =
    state === "playing" ? "Q4 Review · Recording" : state === "idle-post" ? "Q4 Review · Idle" : allLoaded ? "Ready" : "Loading context";

  const visibleTranscript = scenario.transcript.filter((t) => revealedTranscriptIds.has(t.id));
  const visibleAnnotations = scenario.annotations.filter((a) => revealedAnnotationIds.has(a.id));
  const pendingAnnotations = scenario.annotations.filter((a) => pendingAnnotationIds.has(a.id));

  // Mobile: map each annotation to its triggering transcript entry
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
                  state === "idle-post"
                    ? "text-white"
                    : "text-gray-400 hover:text-gray-200"
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

        {/* Context strip */}
        <div
          className="px-4 py-3 flex flex-wrap gap-2 items-center"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <span className="text-[11px] uppercase tracking-wider text-gray-500 mr-2">Context</span>
          {scenario.context.map((c, i) => {
            const loaded = i < pillsLoaded;
            return (
              <motion.span
                key={c.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: loaded ? 1 : 0.2, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-mono"
                style={{
                  backgroundColor: loaded ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${loaded ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
                  color: loaded ? "rgb(134,239,172)" : "rgba(255,255,255,0.4)",
                }}
              >
                {loaded && <Check size={10} />}
                {c.name}
              </motion.span>
            );
          })}
        </div>

        {/* Body */}
        <motion.div layout className="p-6">
          {state === "idle-pre" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-gray-400 mb-1">Pre-meeting context</p>
              <p className="text-xs text-gray-500 mb-6">
                {allLoaded ? "All sources loaded. Echo is ready." : "Loading sources…"}
              </p>
              <button
                onClick={start}
                disabled={!allLoaded}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#ffffff", color: "#09090b" }}
              >
                <Play size={14} />
                Start demo
              </button>
            </div>
          ) : isMobile ? (
            <div>
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
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
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
                  <Sparkles size={12} /> Echo · agent notes
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
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Catch-up pill */}
      <AnimatePresence>
        {isPlaying && isPaused && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={catchUp}
            className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium shadow-lg"
            style={{
              backgroundColor: "rgba(59,130,246,0.95)",
              color: "white",
            }}
          >
            <ChevronDown size={14} />
            Catch up
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
