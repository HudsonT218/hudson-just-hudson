const Contact = () => {
  return (
    <section
      id="contact"
      className="relative py-28 px-6 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(37,99,235,0.1) 0%, transparent 60%)",
        }}
      />

      <div className="relative max-w-lg mx-auto text-center">
        <h2
          className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-2"
          style={{ letterSpacing: "-0.03em" }}
        >
          Ready to build
        </h2>
        <h2
          className="text-3xl sm:text-4xl font-extrabold leading-tight mb-6"
          style={{
            letterSpacing: "-0.03em",
            background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          something great?
        </h2>
        <p className="text-gray-400 font-light mb-10">
          Let's hop on a quick call and figure out how I can help. No pressure, no pitch — just a
          conversation about what you need.
        </p>
        <a
          href="https://calendly.com/hudsonturansky"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            boxShadow: "0 0 40px rgba(37,99,235,0.25)",
          }}
        >
          Book a Call
        </a>
        <p className="text-gray-600 text-xs mt-5">
          Free 15-minute discovery call. No commitment.
        </p>
      </div>
    </section>
  );
};

export default Contact;
