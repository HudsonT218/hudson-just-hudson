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
}

const SKILLS: Omit<SkillNode, "baseAngle" | "orbitRadius" | "x" | "y" | "vx" | "vy">[] = [
  { label: "Website Development", emoji: "🌐", r: 46 },
  { label: "AI Agents", emoji: "🤖", r: 42 },
  { label: "Custom Software OS", emoji: "⚙️", r: 44 },
  { label: "OpenClaw", emoji: "🔗", r: 38 },
  { label: "Automation & Scripts", emoji: "📜", r: 40 },
  { label: "Bots", emoji: "💬", r: 34 },
  { label: "Landing Pages", emoji: "🚀", r: 38 },
  { label: "Full Stack Dev", emoji: "🛠️", r: 40 },
];

const NodeMap = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SkillNode[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dragIndexRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ w: 900, h: 520 });

  const getCenterX = useCallback(() => dimensions.w / 2, [dimensions.w]);
  const getCenterY = useCallback(() => dimensions.h / 2, [dimensions.h]);

  const initNodes = useCallback(() => {
    const cx = getCenterX();
    const cy = getCenterY();
    const baseOrbit = Math.min(dimensions.w, dimensions.h) * 0.34;

    nodesRef.current = SKILLS.map((s, i) => {
      const angle = (i / SKILLS.length) * Math.PI * 2 - Math.PI / 2;
      const orbit = baseOrbit + (i % 2 === 0 ? 10 : -10);
      return {
        ...s,
        baseAngle: angle,
        orbitRadius: orbit,
        x: cx + Math.cos(angle) * orbit,
        y: cy + Math.sin(angle) * orbit,
        vx: 0,
        vy: 0,
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
      setDimensions({ w: rect.width, h: Math.min(520, rect.width * 0.58) });
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
      timeRef.current += 0.004;
      const t = timeRef.current;
      const nodes = nodesRef.current;

      // Physics: orbit drift + spring back + repulsion
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        if (dragIndexRef.current === i) continue;

        // Target position with gentle orbit drift
        const driftAngle = n.baseAngle + Math.sin(t + i * 0.7) * 0.12;
        const targetX = cx + Math.cos(driftAngle) * n.orbitRadius;
        const targetY = cy + Math.sin(driftAngle) * n.orbitRadius;

        // Spring force toward base position
        const springK = 0.02;
        n.vx += (targetX - n.x) * springK;
        n.vy += (targetY - n.y) * springK;

        // Repulsion between nodes
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = n.x - nodes[j].x;
          const dy = n.y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = n.r + nodes[j].r + 20;
          if (dist < minDist && dist > 0) {
            const force = (minDist - dist) * 0.05;
            n.vx += (dx / dist) * force;
            n.vy += (dy / dist) * force;
          }
        }

        // Damping
        n.vx *= 0.88;
        n.vy *= 0.88;
        n.x += n.vx;
        n.y += n.vy;
      }

      // Clear
      ctx.clearRect(0, 0, dimensions.w, dimensions.h);

      // Connection lines
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = hoverIndexRef.current === i;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(n.x, n.y);
        ctx.strokeStyle = isHovered ? "rgba(37,99,235,0.45)" : "rgba(37,99,235,0.12)";
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();
      }

      // Center node
      ctx.beginPath();
      ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
      centerGrad.addColorStop(0, "#3b82f6");
      centerGrad.addColorStop(1, "#2563eb");
      ctx.fillStyle = centerGrad;
      ctx.fill();
      ctx.shadowColor = "rgba(37,99,235,0.35)";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      // Center text
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Hudson", cx, cy - 7);
      ctx.fillText("Turansky", cx, cy + 7);

      // Skill nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = hoverIndexRef.current === i;
        const scale = isHovered ? 1.08 : 1;
        const r = n.r * scale;

        // Shadow
        ctx.shadowColor = isHovered ? "rgba(37,99,235,0.3)" : "rgba(0,0,0,0.08)";
        ctx.shadowBlur = isHovered ? 18 : 8;
        ctx.shadowOffsetY = 2;

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Border
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? "rgba(37,99,235,0.5)" : "rgba(0,0,0,0.08)";
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.stroke();

        // Glow on hover
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(37,99,235,0.15)";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        // Emoji
        ctx.font = `${Math.round(r * 0.48)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.emoji, n.x, n.y - r * 0.15);

        // Label
        ctx.fillStyle = "#1e293b";
        const fontSize = Math.max(8, Math.round(r * 0.22));
        ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.fillText(n.label, n.x, n.y + r * 0.35);
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
        if (dx * dx + dy * dy <= nodes[i].r * nodes[i].r) return i;
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
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
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
      mouseRef.current = { x, y };

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
        canvas.style.cursor = hoverIndexRef.current !== null ? "grab" : "default";
        if (dragIndexRef.current !== null) canvas.style.cursor = "grabbing";
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
        style={{ width: dimensions.w, height: dimensions.h, maxWidth: 900 }}
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
