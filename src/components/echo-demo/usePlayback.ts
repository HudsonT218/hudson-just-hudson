import { useCallback, useEffect, useRef, useState } from "react";
import { scenario } from "./scenario";

export type PlaybackState = "idle-pre" | "playing" | "idle-post";

const PULSE_LEAD = 0.6; // seconds before fireAt to start the thinking pulse

export function usePlayback() {
  const [state, setState] = useState<PlaybackState>("idle-pre");
  const [currentTime, setCurrentTime] = useState(0);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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

  const start = useCallback(() => {
    setCurrentTime(0);
    setState("playing");
    startedAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const replay = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setState("idle-pre");
    setCurrentTime(0);
    startedAtRef.current = null;
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

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
    revealedTranscriptIds,
    revealedAnnotationIds,
    pendingAnnotationIds,
    start,
    replay,
  };
}
