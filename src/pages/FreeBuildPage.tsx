import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const FreeBuildPage = () => {
  return (
    <div
      id="main-content"
      role="main"
      className="min-h-screen relative z-10"
      style={{ color: "var(--app-text-strong)" }}
    >
      <Helmet>
        <title>Not taking on new work right now · Hudson Turansky</title>
        <meta
          name="description"
          content="I'm currently on a break from taking on new projects. Send me an email and I'll be in touch when I'm available again."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://hudsonturansky.com/free-build" />
      </Helmet>

      {/* Minimal header — wordmark only, no nav. */}
      <header className="pt-8 pb-2 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="text-sm font-medium tracking-tight transition-colors"
            style={{ color: "var(--app-text-strong)", letterSpacing: "-0.01em" }}
          >
            Hudson Turansky
          </Link>
        </div>
      </header>

      {/* Pause hero */}
      <section className="relative pt-20 pb-24 px-6">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-5"
            style={{ color: "#60a5fa" }}
          >
            Currently paused
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-6"
            style={{
              color: "var(--app-text-strong)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Not taking on new work at the moment.
          </h1>
          <p
            className="text-base sm:text-lg font-light leading-relaxed mb-10"
            style={{ color: "var(--app-text-med)" }}
          >
            I've stepped back from new projects for now. If you'd like to be in touch
            about future availability, send me an email and I'll reach out when I'm
            taking on work again.
          </p>

          <a
            href="mailto:hudsonturansky@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: "var(--app-button-bg)",
              color: "var(--app-button-fg)",
            }}
          >
            Email me →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-10"
        style={{ borderTop: "1px solid var(--app-border-med)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-sm font-light"
            style={{ color: "var(--app-text-med)" }}
          >
            Curious what I've built?{" "}
            <Link
              to="/work"
              className="underline decoration-1 underline-offset-4 transition-colors"
              style={{ color: "var(--app-text-strong)" }}
            >
              Explore the full site →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FreeBuildPage;
