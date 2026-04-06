const PROJECTS = [
  {
    title: "Custom Organizational OS",
    word: "Custom",
    desc: "A full-stack internal platform with dashboards, volunteer management, and real-time reporting for a nonprofit.",
    tags: ["Full Stack", "Custom Software", "Dashboard"],
    rgb: "255,255,255",
  },
  {
    title: "AI Agent Workflows",
    word: "Agent",
    desc: "Multi-step AI agents that automate research, outreach, and data processing \u2014 built with OpenClaw.",
    tags: ["AI Agents", "OpenClaw", "Automation"],
    rgb: "59,130,246",
  },
  {
    title: "AI-Built Landing Pages",
    word: "Landing",
    desc: "A scalable pipeline for generating high-quality landing pages using AI \u2014 from design to deployment.",
    tags: ["Web Dev", "AI Pipeline", "Scalable"],
    rgb: "139,92,246",
  },
];

const Work = () => {
  return (
    <section id="work" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Things I've built
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            that actually ship.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROJECTS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="h-48 relative overflow-hidden flex items-center justify-center"
                style={{ background: `rgba(${p.rgb},0.06)` }}
              >
                <div
                  className="absolute w-28 h-28 rounded-full"
                  style={{
                    background: `rgba(${p.rgb},0.1)`,
                    filter: "blur(35px)",
                    top: "20%",
                    right: "10%",
                  }}
                />
                <span
                  className="text-7xl font-extrabold select-none"
                  style={{
                    letterSpacing: "-0.04em",
                    color: `rgba(${p.rgb},0.15)`,
                  }}
                >
                  {p.word}
                </span>
              </div>

              <div className="p-6" style={{ backgroundColor: "rgba(255,255,255,0.025)" }}>
                <h3
                  className="text-base font-semibold text-white mb-2"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {p.title}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                  {p.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
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
