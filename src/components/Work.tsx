const PROJECTS = [
  {
    title: "Custom Organizational OS",
    word: "Custom",
    desc: "A full-stack internal platform with dashboards, volunteer management, and real-time reporting for a nonprofit.",
    tags: ["Full Stack", "Custom Software", "Dashboard"],
    gradient: "#f8fafc, #f1f5f9",
    accent: "#0f172a",
  },
  {
    title: "AI Agent Workflows",
    word: "Agent",
    desc: "Multi-step AI agents that automate research, outreach, and data processing — built with OpenClaw.",
    tags: ["AI Agents", "OpenClaw", "Automation"],
    gradient: "#eff6ff, #eef2ff",
    accent: "#2563eb",
  },
  {
    title: "AI-Built Landing Pages",
    word: "Landing",
    desc: "A scalable pipeline for generating high-quality landing pages using AI — from design to deployment.",
    tags: ["Web Dev", "AI Pipeline", "Scalable"],
    gradient: "#faf5ff, #fdf2f8",
    accent: "#7c3aed",
  },
];

const Work = () => {
  return (
    <section id="work" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Things I've built
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-300 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            that actually ship.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROJECTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              style={{ border: "1px solid #f1f1f1" }}
            >
              {/* Header */}
              <div
                className="h-48 relative overflow-hidden flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${p.gradient})` }}
              >
                {/* Blurred accent circle */}
                <div
                  className="absolute w-24 h-24 rounded-full opacity-20"
                  style={{
                    background: p.accent,
                    filter: "blur(30px)",
                    top: "20%",
                    right: "15%",
                  }}
                />
                {/* Large decorative word */}
                <span
                  className="text-6xl font-extrabold select-none opacity-[0.07]"
                  style={{ letterSpacing: "-0.04em", color: p.accent }}
                >
                  {p.word}
                </span>
              </div>

              {/* Info */}
              <div className="p-6 bg-white">
                <h3
                  className="text-base font-semibold text-gray-900 mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {p.title}
                </h3>
                <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: "#f5f5f5", color: "#999" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
