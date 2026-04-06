const PROJECTS = [
  {
    emoji: "🏗️",
    title: "Custom Organizational OS",
    desc: "A full-stack internal platform with dashboards, volunteer management, and real-time reporting for a nonprofit.",
    tags: ["Full Stack", "Custom Software", "Dashboard"],
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    emoji: "🤖",
    title: "AI Agent Workflows",
    desc: "Multi-step AI agents that automate research, outreach, and data processing — built with OpenClaw.",
    tags: ["AI Agents", "OpenClaw", "Automation"],
    gradient: "from-purple-50 to-pink-50",
  },
  {
    emoji: "🚀",
    title: "AI-Built Landing Pages",
    desc: "A scalable pipeline for generating high-quality landing pages using AI — from design to deployment.",
    tags: ["Web Dev", "AI Pipeline", "Scalable"],
    gradient: "from-emerald-50 to-teal-50",
  },
];

const Work = () => {
  return (
    <section id="work" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
          Portfolio
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-14">What I've Built</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECTS.map((p) => (
            <div
              key={p.title}
              className="border border-gray-200 rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <div
                className={`bg-gradient-to-br ${p.gradient} h-40 flex items-center justify-center`}
              >
                <span className="text-5xl">{p.emoji}</span>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full"
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
