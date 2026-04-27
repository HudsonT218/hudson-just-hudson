import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

const Index = () => {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) setShowArrow(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen relative z-10">
      <Helmet>
        <title>Hudson Turansky — Web Design, AI Agents & Custom Software</title>
        <meta
          name="description"
          content="I build custom websites, AI agents, and software that help businesses move faster. Landing pages, business sites, and AI solutions — fast delivery, affordable pricing."
        />
        <link rel="canonical" href="https://hudsonturansky.com/" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Subtle radial blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          {/* NOW badge */}
          <div className="flex justify-center mb-8">
            <a
              href="#contact"
              className="inline-flex items-center gap-3 group"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
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
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Hudson{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Turansky
            </span>
          </h1>

          <p className="text-lg text-gray-400 font-light max-w-lg mx-auto mb-10">
            I build websites, AI agents, and custom software that help businesses
            move faster.
          </p>

          <div className="flex justify-center mb-8">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: "#ffffff",
                color: "#09090b",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Book a Call
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
        </div>
      </section>

      {/* Scroll hint */}
      {showArrow && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-700"
          style={{ opacity: 1 }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <path
              d="M7 11L14 18L21 11"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      <Services />

      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      <Work />

      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

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
