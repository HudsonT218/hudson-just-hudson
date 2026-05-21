import { useCallback, useEffect, useRef, useState } from "react";

export function useAutoScroll(
  containerRef: React.RefObject<HTMLElement>,
  active: boolean,
) {
  const [isPaused, setIsPaused] = useState(false);
  const programmaticScrollRef = useRef(false);
  const lastBottomRef = useRef(0);

  // Pause on user input
  useEffect(() => {
    if (!active) return;
    const onUserScroll = () => {
      if (programmaticScrollRef.current) return;
      setIsPaused(true);
    };
    const onWheel = () => setIsPaused(true);
    const onKey = (e: KeyboardEvent) => {
      if (
        ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)
      ) {
        setIsPaused(true);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  // Auto-follow bottom when not paused and active
  useEffect(() => {
    if (!active || isPaused) return;
    let raf = 0;
    const loop = () => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const containerBottom = rect.bottom; // viewport coords
        const targetVisible = window.innerHeight - 120; // keep bottom 120px above fold
        if (containerBottom > targetVisible && containerBottom !== lastBottomRef.current) {
          const delta = containerBottom - targetVisible;
          // Don't scroll past container's own bottom, implicit since we anchor to it.
          programmaticScrollRef.current = true;
          window.scrollBy({ top: delta, behavior: "smooth" });
          // Release programmatic flag after the smooth scroll roughly settles.
          window.setTimeout(() => {
            programmaticScrollRef.current = false;
          }, 350);
          lastBottomRef.current = containerBottom;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, isPaused, containerRef]);

  // Reset paused state when playback turns off
  useEffect(() => {
    if (!active) setIsPaused(false);
  }, [active]);

  const catchUp = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    programmaticScrollRef.current = true;
    const rect = el.getBoundingClientRect();
    const targetVisible = window.innerHeight - 120;
    const delta = rect.bottom - targetVisible;
    if (delta > 0) {
      window.scrollBy({ top: delta, behavior: "smooth" });
    }
    window.setTimeout(() => {
      programmaticScrollRef.current = false;
      setIsPaused(false);
    }, 400);
  }, [containerRef]);

  return { isPaused, catchUp };
}
