import { useState } from "react";
import { Link } from "react-router-dom";

const CAPABILITIES = [
  {
    label: "Web Development",
    title: "Custom websites that actually work",
    desc: "Landing pages, business sites, internal tools. Built clean, shipped fast, handed off with documentation. I use AI to move faster without cutting corners.",
    rgb: "59,130,246",
  },
  {
    label: "AI Solutions",
    title: "Real AI, not AI-flavored hype",
    desc: "Custom assistants, agents, and automations built for your specific workflow. I'll tell you what's worth building and what's not, AI is moving fast and I'll be honest about what lasts.",
    rgb: "16,185,129",
  },
  {
    label: "Custom Software",
    title: "Internal tools & operations software",
    desc: "If you have a workflow that's held together by spreadsheets and Slack messages, there's probably a better way. I build the thing that makes your team's day easier.",
    rgb: "245,158,11",
  },
];

const WhatIBuild = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null);

  return (
    <section id="what-i-build" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            What I Build
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="block text-white">Three things,</span>
            <span className="block text-gray-600">done well.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CAPABILITIES.map((c, i) => {
            const isActive = hoveredIdx === i || focusedIdx === i;
            const isFocused = focusedIdx === i;
            return (
              <div
                key={c.title}
                tabIndex={0}
                onFocus={() => setFocusedIdx(i)}
                onBlur={() => setFocusedIdx(null)}
                className="rounded-2xl p-8 transition-all duration-300 cursor-default focus:outline-none"
                style={{
                  backgroundColor: isActive
                    ? `rgba(${c.rgb},0.04)`
                    : "rgba(255,255,255,0.02)",
                  border: isActive
                    ? `1px solid rgba(${c.rgb},0.15)`
                    : "1px solid var(--app-border-soft)",
                  transform: isActive ? "translateY(-2px)" : "none",
                  outline: isFocused ? "2px solid rgba(96,165,250,0.5)" : "none",
                  outlineOffset: isFocused ? "2px" : undefined,
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <p
                  className="text-xs uppercase tracking-widest font-medium mb-4"
                  style={{ color: `rgba(${c.rgb},1)` }}
                >
                  {c.label}
                </p>
                <h3
                  className="text-lg font-semibold text-white mb-3"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {c.title}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/interested"
            className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
          >
            Curious about pricing? →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhatIBuild;
