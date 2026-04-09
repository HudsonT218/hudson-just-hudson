import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

const PROJECTS = [
  {
    title: "Custom Organizational OS",
    word: "Custom",
    desc: "A full-stack internal platform with dashboards, volunteer management, and real-time reporting for a nonprofit.",
    tags: ["Full Stack", "Custom Software", "Dashboard"],
    rgb: "255,255,255",
    backDesc:
      "A nonprofit needed a way to track volunteer hours and coordinate scheduling across their team. I built them a full redesign of their public-facing site plus a custom volunteer management system integrated into the backend — giving staff a single platform for scheduling, hour tracking, and reporting.",
    backTags: ["React", "Full Stack", "Volunteer Mgmt", "Custom Software"],
  },
  {
    title: "AI Agent Workflows",
    word: "Agent",
    desc: "Multi-step AI agents that automate research, outreach, and data processing — built with OpenClaw.",
    tags: ["AI Agents", "OpenClaw", "Automation"],
    rgb: "59,130,246",
    backDesc:
      "I run a team of 9 OpenClaw agents that help me manage day-to-day business operations — from research to scheduling to lead generation. I also build Claude Code agents that run automated research loops, surface qualified leads, and draft personalized outreach — all hands-off.",
    backTags: ["OpenClaw", "Claude Code", "Automation", "Lead Gen"],
  },
  {
    title: "AI-Built Landing Pages",
    word: "Landing",
    desc: "A scalable pipeline for generating high-quality landing pages using AI — from design to deployment.",
    tags: ["Web Dev", "AI Pipeline", "Scalable"],
    rgb: "139,92,246",
    backDesc:
      "I've built landing pages for companies, projects, and personal brands — designed for conversion and shipped fast. My AI-accelerated workflow means clients get polished, production-ready sites at a fraction of the typical agency timeline and cost.",
    backTags: ["Web Dev", "Landing Pages", "AI Pipeline", "Fast Delivery"],
  },
];

const Work = () => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (selectedIdx === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIdx(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx]);

  return (
    <section id="work" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            Things I've built
          </h2>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            that actually ship.
          </h2>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.title}
                layout
                layoutId={`card-${i}`}
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  opacity: selectedIdx === i ? 0 : 1,
                  visibility: selectedIdx === i ? "hidden" as const : "visible" as const,
                }}
                whileHover={selectedIdx === null ? { y: -4 } : undefined}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setSelectedIdx(i)}
              >
                <div
                  className="h-48 relative overflow-hidden flex items-center justify-center"
                  style={{ background: `rgba(${p.rgb},0.06)` }}
                >
                  <div
                    className="absolute w-28 h-28 rounded-full"
                    style={{
                      background: `rgba(${p.rgb},0.1)`,
                      filter: "blur(35px)",
                      top: "20%",
                      right: "10%",
                    }}
                  />
                  <span
                    className="text-7xl font-extrabold select-none"
                    style={{
                      letterSpacing: "-0.04em",
                      color: `rgba(${p.rgb},0.15)`,
                    }}
                  >
                    {p.word}
                  </span>
                </div>

                <div className="p-6">
                  <h3
                    className="text-base font-semibold text-white mb-2"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
                    {p.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.04)",
                          color: "rgba(255,255,255,0.35)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Overlay + Flip Card */}
          <AnimatePresence>
            {selectedIdx !== null && (
              <motion.div
                className="fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onClick={() => setSelectedIdx(null)}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <motion.div
                  layoutId={`card-${selectedIdx}`}
                  className="relative max-w-[90vw]"
                  style={{
                    width: 380,
                    perspective: 1000,
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) scale(1.2)",
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FlipCard project={PROJECTS[selectedIdx]} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
};

const FlipCard = ({
  project,
}: {
  project: (typeof PROJECTS)[number];
}) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front Face */}
        <div
          className="rounded-2xl overflow-hidden w-full"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            backfaceVisibility: "hidden",
          }}
        >
          <div
            className="h-48 relative overflow-hidden flex items-center justify-center"
            style={{ background: `rgba(${project.rgb},0.06)` }}
          >
            <div
              className="absolute w-28 h-28 rounded-full"
              style={{
                background: `rgba(${project.rgb},0.1)`,
                filter: "blur(35px)",
                top: "20%",
                right: "10%",
              }}
            />
            <span
              className="text-7xl font-extrabold select-none"
              style={{
                letterSpacing: "-0.04em",
                color: `rgba(${project.rgb},0.15)`,
              }}
            >
              {project.word}
            </span>
          </div>

          <div className="p-6">
            <h3
              className="text-base font-semibold text-white mb-2"
              style={{ letterSpacing: "-0.01em" }}
            >
              {project.title}
            </h3>
            <p className="text-gray-500 text-sm font-light leading-relaxed mb-4">
              {project.desc}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div
          className="rounded-2xl overflow-hidden w-full absolute top-0 left-0"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid rgba(${project.rgb},0.15)`,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div
            className="h-48 relative overflow-hidden flex items-center justify-center"
            style={{ background: `rgba(${project.rgb},0.08)` }}
          >
            <div
              className="absolute w-36 h-36 rounded-full"
              style={{
                background: `rgba(${project.rgb},0.12)`,
                filter: "blur(40px)",
                top: "15%",
                left: "10%",
              }}
            />
            <span
              className="text-5xl font-extrabold select-none"
              style={{
                letterSpacing: "-0.04em",
                color: `rgba(${project.rgb},0.2)`,
              }}
            >
              Details
            </span>
          </div>

          <div className="p-6">
            <h3
              className="text-base font-semibold text-white mb-3"
              style={{ letterSpacing: "-0.01em" }}
            >
              {project.title}
            </h3>
            <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">
              {project.backDesc}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.backTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `rgba(${project.rgb},0.08)`,
                    color: `rgba(${project.rgb},0.6)`,
                    border: `1px solid rgba(${project.rgb},0.12)`,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Work;
