import Navbar from "@/components/Navbar";
import NodeMap from "@/components/NodeMap";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section id="hero" className="relative pt-36 pb-16 px-6 text-center overflow-hidden">
        {/* Decorative gradient orbs */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-40 left-[60%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)",
          }}
        />

        <div className="relative">
          <p className="text-xs uppercase tracking-widest text-blue-600 font-medium mb-5">
            AI Solutions & Web Development
          </p>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 mb-5"
            style={{ letterSpacing: "-0.04em" }}
          >
            Hudson{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Turansky
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 font-light max-w-xl mx-auto mb-14">
            I build websites, AI agents, and custom software that help businesses move faster.
          </p>
          <NodeMap />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      <Services />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      <Work />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      <Process />

      <Contact />

      {/* Footer */}
      <footer className="py-8 px-6 text-center bg-white">
        <p className="text-xs text-gray-300">
          &copy; {new Date().getFullYear()} Hudson Turansky
        </p>
      </footer>
    </div>
  );
};

export default Index;
