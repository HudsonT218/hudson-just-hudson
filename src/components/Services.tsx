const SERVICES = [
  {
    emoji: "🌐",
    title: "Website Development",
    desc: "Modern, responsive websites built with the latest frameworks — enhanced with AI-powered workflows for speed and quality.",
  },
  {
    emoji: "🤖",
    title: "AI Agents & Automation",
    desc: "Custom AI agents powered by OpenClaw that handle real tasks — from customer support to internal ops.",
  },
  {
    emoji: "⚙️",
    title: "Custom Software Systems",
    desc: "Internal tools, dashboards, and platforms tailored to how your team actually works.",
  },
  {
    emoji: "📜",
    title: "Scripts & Bots",
    desc: "Targeted automation that saves hours — Slack bots, data pipelines, scheduled workflows, and more.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
          What I Do
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Services</h2>
        <p className="text-gray-500 max-w-xl mb-14">
          I help businesses and teams build the tools, sites, and systems they need to move faster and work smarter.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-gray-200 rounded-2xl p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              <span className="text-3xl">{s.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
