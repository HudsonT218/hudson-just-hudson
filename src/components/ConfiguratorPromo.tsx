import { Link } from "react-router-dom";

const STEPS = [
  {
    num: "01",
    title: "Pick a style",
    desc: "Browse 8 themes — modern, bold, luxury, organic. The preview updates as you click.",
  },
  {
    num: "02",
    title: "Configure sections",
    desc: "Drag, drop, and swap variants. 33 hand-crafted blocks — heroes, pricing, testimonials, more.",
  },
  {
    num: "03",
    title: "Get a live preview",
    desc: "Pay, sit back, and our build agent ships your site to a preview URL within minutes. Iterate up to 5 times.",
  },
];

const ConfiguratorPromo = () => {
  return (
    <section id="build-your-site" className="py-28 px-6 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.05) 0%, transparent 60%)",
        }}
      />
      <div className="max-w-5xl mx-auto relative">
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5 inline-flex items-center gap-2">
              New
              <span
                className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded-sm leading-none bg-blue-500/15"
              >
                BETA
              </span>
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">Build your site</span>
              <span className="block text-gray-600">in minutes, not weeks.</span>
            </h2>
            <p className="text-gray-500 text-sm font-light leading-relaxed max-w-xl mt-5">
              Pick your style, choose your sections, and our AI builds it. No calls
              needed. Live preview as you go.{" "}
              <span className="text-white font-medium">$250 flat.</span>
            </p>
          </div>
          <Link
            to="/configure"
            className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-md transition-colors duration-200 self-start md:self-auto shrink-0"
            style={{ backgroundColor: "#ffffff", color: "#09090b" }}
          >
            Start Building
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M5.5 3L9.5 7L5.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 relative">
          <div
            className="hidden sm:block absolute top-10 left-0 right-0 h-px"
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
                    "linear-gradient(180deg, rgba(96,165,250,0.5), rgba(59,130,246,0.15))",
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

export default ConfiguratorPromo;
