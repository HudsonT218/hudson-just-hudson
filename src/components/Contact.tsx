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
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Contact
          </p>

          <h2
            className="text-4xl md:text-5xl font-medium text-white leading-tight mb-6"
            style={{ textWrap: "balance", letterSpacing: "-0.03em" }}
          >
            Let's talk.
          </h2>

          <p
            className="text-gray-400 text-base sm:text-lg font-light mb-10 leading-relaxed"
            style={{ letterSpacing: "0.01em" }}
          >
            Email me at{" "}
            <a
              href="mailto:hudsonturansky@gmail.com"
              className="text-white underline decoration-1 underline-offset-4 hover:text-blue-300 transition-colors"
            >
              hudsonturansky@gmail.com
            </a>
            . I read everything, whether it's feedback on something I built or you're working on
            something at the same AI and finance intersection.
          </p>

          <div>
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
