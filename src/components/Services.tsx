import { useState } from "react";

const SERVICES = [
  {
    emoji: "\u{1F310}",
    title: "Website Development",
    desc: "Modern, responsive websites built with the latest frameworks \u2014 enhanced with AI-powered workflows for speed and quality.",
    rgb: "59,130,246",
  },
  {
    emoji: "\u{1F916}",
    title: "AI Agents & Automation",
    desc: "Custom AI agents powered by OpenClaw that handle real tasks \u2014 from customer support to internal ops.",
    rgb: "16,185,129",
  },
  {
    emoji: "\u2699\uFE0F",
    title: "Custom Software Systems",
    desc: "Internal tools, dashboards, and platforms tailored to how your team actually works.",
    rgb: "245,158,11",
  },
  {
    emoji: "\u{1F4DC}",
    title: "Scripts & Bots",
    desc: "Targeted automation that saves hours \u2014 Slack bots, data pipelines, scheduled workflows, and more.",
    rgb: "168,85,247",
  },
];

const Services = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="services" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Services built for the
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            modern business.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((s, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div
                key={s.title}
                className="rounded-2xl p-8 transition-all duration-300 cursor-default"
                style={{
                  backgroundColor: isHovered
                    ? `rgba(${s.rgb},0.04)`
                    : "rgba(255,255,255,0.02)",
                  border: isHovered
                    ? `1px solid rgba(${s.rgb},0.15)`
                    : "1px solid rgba(255,255,255,0.05)",
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center text-xl transition-all duration-300"
                  style={{
                    backgroundColor: isHovered
                      ? `rgba(${s.rgb},0.12)`
                      : `rgba(${s.rgb},0.06)`,
                  }}
                >
                  {s.emoji}
                </div>
                <h3
                  className="text-base font-semibold text-white mt-5 mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {s.title}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
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
