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
            "radial-gradient(20% 80% at 20% 0%, var(--app-blue-soft), transparent)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, var(--app-radial-tint) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="max-w-2xl">
          {/* OPEN badge */}
          <div
            className="inline-flex items-center gap-3 mb-8"
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
                backgroundColor: "rgba(234,179,8,0.15)",
                color: "#facc15",
              }}
            >
              PAUSED
            </span>
            <span className="text-sm text-gray-400">
              not taking on new projects right now
            </span>
          </div>

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
            I'm on a break from new projects at the moment. Drop me an email and
            I'll get back to you when I'm taking on work again.
          </p>

          <div className="mb-6">
            <a
              href="mailto:hudsonturansky@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-white px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                border: "1px solid var(--app-border-stronger)",
                backgroundColor: "var(--app-card-bg)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--app-card-bg-bright)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--app-card-bg)";
              }}
            >
              Email me
            </a>
          </div>

          <p className="text-gray-700 text-xs">
            hudsonturansky@gmail.com
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
