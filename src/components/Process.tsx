const STEPS = [
  {
    num: "01",
    title: "Discovery Call",
    desc: "We talk about your goals, pain points, and what success looks like — no commitment needed.",
  },
  {
    num: "02",
    title: "Proposal & Scope",
    desc: "I put together a clear plan with timeline, deliverables, and pricing so there are no surprises.",
  },
  {
    num: "03",
    title: "Build & Iterate",
    desc: "I build in short cycles with regular check-ins so you see progress and can steer the direction.",
  },
  {
    num: "04",
    title: "Launch & Support",
    desc: "We ship it, I make sure everything runs smooth, and I stick around for any tweaks you need.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-blue-600 tracking-wide uppercase mb-2">
          How It Works
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-14">My Process</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((s) => (
            <div key={s.num} className="relative">
              <span className="text-6xl font-bold text-gray-100 leading-none select-none">
                {s.num}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
