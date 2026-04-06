import Navbar from "@/components/Navbar";
import NodeMap from "@/components/NodeMap";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Process from "@/components/Process";
import Contact from "@/components/Contact";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section id="hero" className="pt-32 pb-12 px-6 text-center">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 tracking-tight mb-4">
          Hudson Turansky
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 max-w-xl mx-auto mb-12">
          I build websites, AI agents, and custom software that help businesses move faster.
        </p>
        <NodeMap />
      </section>

      <Services />
      <Work />
      <Process />
      <Contact />

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Hudson Turansky. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
