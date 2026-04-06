import { useState } from "react";

const SERVICES = [
  {
    emoji: "\u{1F310}",
    title: "Website Development",
    desc: "Modern, responsive websites built with the latest frameworks — enhanced with AI-powered workflows for speed and quality.",
    accent: "#2563eb",
    hoverBg: "linear-gradient(135deg, #eff6ff, #eef2ff)",
    iconBg: "#dbeafe",
    iconBgHover: "#bfdbfe",
  },
  {
    emoji: "\u{1F916}",
    title: "AI Agents & Automation",
    desc: "Custom AI agents powered by OpenClaw that handle real tasks — from customer support to internal ops.",
    accent: "#059669",
    hoverBg: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
    iconBg: "#d1fae5",
    iconBgHover: "#a7f3d0",
  },
  {
    emoji: "\u2699\uFE0F",
    title: "Custom Software Systems",
    desc: "Internal tools, dashboards, and platforms tailored to how your team actually works.",
    accent: "#d97706",
    hoverBg: "linear-gradient(135deg, #fefce8, #fff7ed)",
    iconBg: "#fef3c7",
    iconBgHover: "#fde68a",
  },
  {
    emoji: "\u{1F4DC}",
    title: "Scripts & Bots",
    desc: "Targeted automation that saves hours — Slack bots, data pipelines, scheduled workflows, and more.",
    accent: "#9333ea",
    hoverBg: "linear-gradient(135deg, #fdf2f8, #faf5ff)",
    iconBg: "#f3e8ff",
    iconBgHover: "#e9d5ff",
  },
];

const Services = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="services" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Services built for the
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-300 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            modern business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SERVICES.map((s, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={s.title}
                className="rounded-2xl p-8 transition-all duration-300 cursor-default"
                style={{
                  background: isHovered ? s.hoverBg : "#fafafa",
                  border: "1px solid #f1f1f1",
                  transform: isHovered ? "translateY(-2px)" : "none",
                  boxShadow: isHovered
                    ? "0 8px 30px rgba(0,0,0,0.04)"
                    : "none",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors duration-300"
                  style={{
                    backgroundColor: isHovered ? s.iconBgHover : s.iconBg,
                  }}
                >
                  {s.emoji}
                </div>
                <h3
                  className="text-base font-semibold text-gray-900 mt-5 mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {s.title}
                </h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
