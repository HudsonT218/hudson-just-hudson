import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>404 · Hudson Turansky</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`https://hudsonturansky.com${location.pathname}`} />
      </Helmet>
      <Navbar />

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-xl mx-auto">
          <h1
            className="text-7xl sm:text-8xl font-extrabold mb-6"
            style={{
              letterSpacing: "-0.04em",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </h1>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Page not found
          </h2>
          <p className="text-lg text-gray-400 font-light mb-10">
            The page you're looking for doesn't exist. It may have been moved or never existed.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
            style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
          >
            Return home →
          </a>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
