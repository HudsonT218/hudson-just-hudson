import DottedSurface from "@/components/DottedSurface";
import Navbar from "@/components/Navbar";
import NodeMap from "@/components/NodeMap";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#09090b" }}>
      <DottedSurface />
      <Navbar />

      {/* Hero */}
      <section id="hero" className="relative pt-36 pb-16 px-6 text-center overflow-hidden">
        {/* Subtle radial shading */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(20% 80% at 20% 0%, rgba(255,255,255,0.06), transparent)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* NOW badge */}
          <div className="flex justify-center mb-8">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 group"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: "9999px",
                padding: "4px 14px 4px 4px",
              }}
            >
              <span
                className="font-mono text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                }}
              >
                NOW
              </span>
              <span className="text-sm text-gray-400">
                accepting new client projects
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="text-gray-500 transition-transform duration-200 group-hover:translate-x-0.5"
              >
                <path
                  d="M5.5 3L9.5 7L5.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            AI Solutions & Web Development
          </p>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Hudson{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Turansky
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-500 font-light max-w-xl mx-auto mb-14">
            I build websites, AI agents, and custom software that help businesses move faster.
          </p>

          <NodeMap />
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      <Services />

      <div className="max-w-5xl mx-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      <Work />

      <div className="max-w-5xl mx-auto" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      <Process />

      <Contact />

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Hudson Turansky
        </p>
      </footer>
    </div>
  );
};

export default Index;
