const STEPS = [
  {
    num: "01",
    title: "Discovery Call",
    desc: "We talk about your goals, pain points, and what success looks like \u2014 no commitment needed.",
  },
  {
    num: "02",
    title: "Proposal & Scope",
    desc: "I put together a clear plan with timeline, deliverables, and pricing so there are no surprises.",
  },
  {
    num: "03",
    title: "Build & Deliver",
    desc: "I build your project fast using AI-powered workflows and deliver a polished result. You get up to 5 rounds of revisions to make sure it\u2019s exactly right.",
  },
  {
    num: "04",
    title: "Launch & Handoff",
    desc: "Once revisions are complete, I launch your project and hand over everything. Need ongoing work after that? We can set up a retainer or hourly arrangement.",
  },
];

const Process = () => {
  return (
    <section id="process" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Simple process,
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            exceptional results.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 relative">
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 10%, rgba(255,255,255,0.06) 90%, transparent)",
            }}
          />

          {STEPS.map((s) => (
            <div key={s.num} className="relative">
              <span
                className="block text-5xl font-extrabold leading-none select-none mb-4"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.04em",
                }}
              >
                {s.num}
              </span>
              <h3
                className="text-sm font-semibold text-white mb-2"
                style={{ letterSpacing: "-0.01em" }}
              >
                {s.title}
              </h3>
              <p className="text-gray-500 text-sm font-light leading-relaxed">
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
