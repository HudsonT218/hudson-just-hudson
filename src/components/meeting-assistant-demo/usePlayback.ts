import { useCallback, useEffect, useRef, useState } from "react";
import { scenario } from "./scenario";

export type PlaybackState =
  | "idle-pre"
  | "loading-context"
  | "transitioning"
  | "playing"
  | "idle-post";

const PULSE_LEAD = 0.3;
const CONTEXT_STAGGER_MS = 280;
const READY_HOLD_MS = 700;
const COLLAPSE_MS = 400;

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>("idle-pre");
  const [currentTime, setCurrentTime] = useState(0);
  const [pillsLoaded, setPillsLoaded] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const tick = useCallback(() => {
    if (startedAtRef.current == null) return;
    const elapsed = (performance.now() - startedAtRef.current) / 1000;
    setCurrentTime(elapsed);
    if (elapsed >= scenario.durationSec) {
      setState("idle-post");
      startedAtRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const beginTimeline = useCallback(() => {
    setCurrentTime(0);
    setState("playing");
    startedAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const start = useCallback(() => {
    clearTimers();
    setCurrentTime(0);
    setPillsLoaded(0);
    setState("loading-context");

    const total = scenario.context.length;
    for (let i = 1; i <= total; i++) {
      const id = window.setTimeout(() => setPillsLoaded(i), i * CONTEXT_STAGGER_MS);
      timersRef.current.push(id);
    }
    const readyAt = total * CONTEXT_STAGGER_MS + READY_HOLD_MS;
    const transId = window.setTimeout(() => setState("transitioning"), readyAt);
    timersRef.current.push(transId);
    const playId = window.setTimeout(() => beginTimeline(), readyAt + COLLAPSE_MS);
    timersRef.current.push(playId);
  }, [beginTimeline]);

  const replay = useCallback(() => {
    clearTimers();
    setState("idle-pre");
    setCurrentTime(0);
    setPillsLoaded(0);
    startedAtRef.current = null;
    // kick off again next tick
    const id = window.setTimeout(() => start(), 50);
    timersRef.current.push(id);
  }, [start]);

  useEffect(() => () => clearTimers(), []);

  const revealedTranscriptIds = new Set(
    scenario.transcript.filter((t) => currentTime >= t.startAt).map((t) => t.id),
  );
  const revealedAnnotationIds = new Set(
    scenario.annotations.filter((a) => currentTime >= a.fireAt + PULSE_LEAD).map((a) => a.id),
  );
  const pendingAnnotationIds = new Set(
    scenario.annotations
      .filter((a) => currentTime >= a.fireAt && currentTime < a.fireAt + PULSE_LEAD)
      .map((a) => a.id),
  );

  return {
    state,
    currentTime,
    pillsLoaded,
    revealedTranscriptIds,
    revealedAnnotationIds,
    pendingAnnotationIds,
    start,
    replay,
  };
}
