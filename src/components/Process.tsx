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
    <section id="process" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Simple process,
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-300 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            exceptional results.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
          {/* Connector line (desktop only) */}
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-px"
            style={{
              background: "linear-gradient(90deg, transparent, #e5e7eb 10%, #e5e7eb 90%, transparent)",
            }}
          />

          {STEPS.map((s) => (
            <div key={s.num} className="relative">
              <span
                className="block text-5xl font-extrabold leading-none select-none mb-4"
                style={{
                  background: "linear-gradient(180deg, #d1d5db, #f3f4f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.04em",
                }}
              >
                {s.num}
              </span>
              <h3
                className="text-base font-semibold text-gray-900 mb-2"
                style={{ letterSpacing: "-0.01em" }}
              >
                {s.title}
              </h3>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
