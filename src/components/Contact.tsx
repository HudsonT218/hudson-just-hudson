const Contact = () => {
  return (
    <section
      id="contact"
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "var(--app-page-bg)" }}
    >
      {/* Radial overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(20% 80% at 20% 0%, rgba(255,255,255,0.06), transparent)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="max-w-2xl">
          {/* OPEN badge */}
          <a
            href="https://calendly.com/hudsonturansky/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 mb-8 group"
            style={{
              border: "1px solid var(--app-border-strong)",
              backgroundColor: "var(--app-card-bg-hover)",
              borderRadius: "9999px",
              padding: "4px 14px 4px 4px",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              className="font-mono text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: "rgba(59,130,246,0.15)",
                color: "#60a5fa",
              }}
            >
              OPEN
            </span>
            <span className="text-sm text-gray-400">
              scheduling discovery calls now
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

          {/* Heading */}
          <h2
            className="text-4xl md:text-5xl font-medium text-white leading-tight mb-6"
            style={{ textWrap: "balance", letterSpacing: "-0.03em" }}
          >
            Let's talk.
          </h2>

          <p
            className="text-gray-500 text-sm sm:text-lg font-light mb-10"
            style={{ letterSpacing: "0.02em" }}
          >
            Book a free 30-minute call. No pitch, no pressure, just a
            conversation about what you're working on and whether I can help.
          </p>

          <div className="mb-6">
            <a
              href="https://calendly.com/hudsonturansky/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                border: "1px solid var(--app-border-stronger)",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--app-card-bg-bright)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M13.3 2.7H12V1.3a.67.67 0 0 0-1.33 0v1.34H5.33V1.3A.67.67 0 0 0 4 1.3v1.34H2.67A1.33 1.33 0 0 0 1.33 4v9.33a1.33 1.33 0 0 0 1.34 1.34h10.66a1.33 1.33 0 0 0 1.34-1.34V4a1.33 1.33 0 0 0-1.34-1.3ZM2.67 4H13.3v1.33H2.67V4Zm10.66 9.33H2.67V6.67h10.66v6.66Z"
                  fill="currentColor"
                />
              </svg>
              Book a Call
            </a>
          </div>

          <p className="text-gray-700 text-xs">
            Free 30-minute discovery call. No commitment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
