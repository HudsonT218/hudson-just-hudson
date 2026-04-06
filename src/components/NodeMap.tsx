import { useRef, useEffect, useState, useCallback } from "react";

interface SkillNode {
  label: string;
  emoji: string;
  r: number;
  baseAngle: number;
  orbitRadius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

const SKILLS: Omit<SkillNode, "baseAngle" | "orbitRadius" | "x" | "y" | "vx" | "vy" | "phase">[] = [
  { label: "Website Development", emoji: "\u{1F310}", r: 48 },
  { label: "AI Agents", emoji: "\u{1F916}", r: 44 },
  { label: "Custom Software OS", emoji: "\u2699\uFE0F", r: 46 },
  { label: "OpenClaw", emoji: "\u{1F517}", r: 40 },
  { label: "Automation & Scripts", emoji: "\u{1F4DC}", r: 42 },
  { label: "Bots", emoji: "\u{1F4AC}", r: 36 },
  { label: "Landing Pages", emoji: "\u{1F680}", r: 40 },
  { label: "Full Stack Dev", emoji: "\u{1F6E0}\uFE0F", r: 42 },
];

const NodeMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dragIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState({ w: 850, h: 480 });

  const getCenterX = useCallback(() => dimensions.w / 2, [dimensions.w]);
  const getCenterY = useCallback(() => dimensions.h / 2, [dimensions.h]);

  const initNodes = useCallback(() => {
    const cx = getCenterX();
    const cy = getCenterY();
    const baseOrbit = Math.min(dimensions.w, dimensions.h) * 0.36;

    nodesRef.current = SKILLS.map((s, i) => {
      const angle = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2;
      const orbit = baseOrbit + (i % 2 === 0 ? 12 : -8);
      return {
        ...s,
        baseAngle: angle,
        orbitRadius: orbit,
        x: cx + Math.cos(angle) * orbit,
        y: cy + Math.sin(angle) * orbit,
        vx: 0,
        vy: 0,
        phase: i * 0.8,
      };
    });
  }, [dimensions, getCenterX, getCenterY]);

  useEffect(() => {
    initNodes();
  }, [initNodes]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const w = Math.min(rect.width, 850);
      setDimensions({ w, h: Math.min(480, w * 0.56) });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = getCenterX();
    const cy = getCenterY();
    const centerR = 52;

    const draw = () => {
      timeRef.current += 0.005;
      const t = timeRef.current;
      const nodes = nodesRef.current;

      // Physics
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (dragIndexRef.current === i) continue;

        const driftAngle = n.baseAngle + Math.sin(t * 0.6 + n.phase) * 0.1;
        const targetX = cx + Math.cos(driftAngle) * n.orbitRadius;
        const targetY = cy + Math.sin(driftAngle) * n.orbitRadius;

        n.vx += (targetX - n.x) * 0.018;
        n.vy += (targetY - n.y) * 0.018;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = n.x - nodes[j].x;
          const dy = n.y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = n.r + nodes[j].r + 16;
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) * 0.04;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        n.vx *= 0.94;
        n.vy *= 0.94;
        n.x += n.vx;
        n.y += n.vy;
      }

      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      // Connection lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = hoverIndexRef.current === i;
        const alpha = isHovered ? 0.25 : 0.05;

        const grad = ctx.createLinearGradient(cx, cy, n.x, n.y);
        grad.addColorStop(0, `rgba(59,130,246,${alpha})`);
        grad.addColorStop(1, `rgba(124,58,237,${alpha})`);

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isHovered ? 1.5 : 1;
        ctx.stroke();

        if (isHovered) {
          const dotT = (t * 1.5) % 1;
          const dotX = cx + (n.x - cx) * dotT;
          const dotY = cy + (n.y - cy) * dotT;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(59,130,246,0.6)";
          ctx.fill();
        }
      }

      // Center glow
      const glowGrad = ctx.createRadialGradient(cx, cy, centerR * 0.5, cx, cy, centerR * 3);
      glowGrad.addColorStop(0, "rgba(59,130,246,0.1)");
      glowGrad.addColorStop(1, "rgba(59,130,246,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, centerR * 3, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Center node
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      const centerGrad = ctx.createLinearGradient(cx - centerR, cy - centerR, cx + centerR, cy + centerR);
      centerGrad.addColorStop(0, "#3b82f6");
      centerGrad.addColorStop(1, "#7c3aed");
      ctx.fillStyle = centerGrad;
      ctx.shadowColor = "rgba(59,130,246,0.3)";
      ctx.shadowBlur = 50;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Center text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "600 14px Inter, system-ui, sans-serif";
      ctx.fillText("Hudson", cx, cy - 8);
      ctx.globalAlpha = 0.7;
      ctx.font = "300 11px Inter, system-ui, sans-serif";
      ctx.fillText("Turansky", cx, cy + 8);
      ctx.globalAlpha = 1;

      // Skill nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = hoverIndexRef.current === i;

        const breath = 1 + Math.sin(t * 1.2 + n.phase) * 0.02;
        const hoverScale = isHovered ? 1.06 : 1;
        const r = n.r * breath * hoverScale;

        // Shadow
        if (isHovered) {
          ctx.shadowColor = "rgba(59,130,246,0.2)";
          ctx.shadowBlur = 20;
        }

        // Fill
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? "rgba(24,24,27,0.95)" : "rgba(15,15,18,0.9)";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;

        // Border
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered
          ? "rgba(59,130,246,0.3)"
          : "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Emoji
        ctx.font = `${Math.round(r * 0.42)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.emoji, n.x, n.y - r * 0.13);

        // Label
        ctx.fillStyle = isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)";
        const fontSize = Math.max(8, Math.round(r * 0.2));
        ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillText(n.label, n.x, n.y + r * 0.36);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [dimensions, getCenterX, getCenterY]);

  const getNodeAtPoint = useCallback(
    (px: number, py: number): number | null => {
      const nodes = nodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const dx = px - nodes[i].x;
        const dy = py - nodes[i].y;
        if (dx * dx + dy * dy <= nodes[i].r * nodes[i].r * 1.15) return i;
      }
      return null;
    },
    []
  );

  const getCanvasCoords = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      const idx = getNodeAtPoint(x, y);
      if (idx !== null) {
        dragIndexRef.current = idx;
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      }
    },
    [getCanvasCoords, getNodeAtPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const { x, y } = getCanvasCoords(e);
      if (dragIndexRef.current !== null) {
        const n = nodesRef.current[dragIndexRef.current];
        n.x = x;
        n.y = y;
        n.vx = 0;
        n.vy = 0;
      }
      hoverIndexRef.current = getNodeAtPoint(x, y);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor =
          dragIndexRef.current !== null
            ? "grabbing"
            : hoverIndexRef.current !== null
              ? "grab"
              : "default";
      }
    },
    [getCanvasCoords, getNodeAtPoint]
  );

  const handlePointerUp = useCallback(() => {
    dragIndexRef.current = null;
  }, []);

  const handlePointerLeave = useCallback(() => {
    hoverIndexRef.current = null;
    dragIndexRef.current = null;
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.w, height: dimensions.h, maxWidth: 850 }}
        className="touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      />
    </div>
  );
};

export default NodeMap;
