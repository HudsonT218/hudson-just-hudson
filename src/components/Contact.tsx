const Contact = () => {
  return (
    <section
      id="contact"
      className="relative py-28 px-6 overflow-hidden"
      style={{ backgroundColor: "#09090b" }}
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
            Ready to Build Something
            <br />
            That Drives Growth?
          </h2>

          <p
            className="text-gray-500 text-sm sm:text-lg font-light mb-10"
            style={{ letterSpacing: "0.02em" }}
          >
            Let's hop on a quick call and figure out how I can help. No pressure,
            no pitch — just a conversation about what you need.
          </p>

          {/* Button */}
          <div className="mb-6">
            <a
              href="https://calendly.com/hudsonturansky/30min"
              target="_blank"
              rel="noopener noreferrer"
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

          <p className="text-gray-700 text-xs">
            Free 30-minute discovery call. No commitment.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
