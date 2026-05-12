import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const RATES = [
  {
    rate: "$75",
    label: "Web Development & Custom Software",
    body: "Landing pages, business sites, internal tools, operations software, integrations.",
  },
  {
    rate: "$100",
    label: "AI Solutions & Agents",
    body: "Custom AI assistants, agents, automations, and anything that involves language models.",
  },
];

const ESTIMATES = [
  { type: "Landing page", hours: "6–12 hrs", cost: "$450–$900" },
  { type: "Business site (multi-page)", hours: "15–30 hrs", cost: "$1,125–$2,250" },
  { type: "Operations software / internal tool", hours: "30–80 hrs", cost: "$2,250–$6,000" },
  { type: "Personal AI assistant", hours: "8–20 hrs", cost: "$800–$2,000" },
  { type: "Company AI agent", hours: "25–60 hrs", cost: "$2,500–$6,000" },
];

const HONEST_NOTES = [
  "I'm early in client work. My rate reflects that — I'm not charging what a senior agency charges.",
  "AI is moving fast. I'll be honest with you if something we build might become obsolete. Sometimes the right answer is a simpler solution.",
];

const InterestedPage = () => {
  return (
    <div className="min-h-screen relative z-10">
      <Helmet>
        <title>Pricing — Hudson Turansky</title>
        <meta
          name="description"
          content="Hourly rates for web development and AI solutions. Transparent pricing, no surprises."
        />
        <meta name="robots" content="noindex" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Here's how I{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              charge.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto">
            Hourly. No surprises. You only pay for what we agreed on.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* Rates */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RATES.map((r) => (
              <div
                key={r.label}
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="mb-6 flex items-baseline gap-2">
                  <span
                    className="text-5xl font-extrabold text-white"
                    style={{ letterSpacing: "-0.03em" }}
                  >
                    {r.rate}
                  </span>
                  <span className="text-lg text-gray-500 font-light">/ hr</span>
                </div>
                <h3
                  className="text-base font-semibold text-white mb-3"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {r.label}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* Typical projects */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Typical Projects
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              What does a project actually cost?
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-6 py-4">
                    Project Type
                  </th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-6 py-4">
                    Typical Hours
                  </th>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-6 py-4">
                    Rough Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {ESTIMATES.map((e, i) => (
                  <tr
                    key={e.type}
                    style={{
                      borderTop:
                        i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <td className="px-6 py-4 text-gray-300 font-light">
                      {e.type}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-light">
                      {e.hours}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-light">
                      {e.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600 font-light mt-4">
            These are rough estimates, not quotes. Every project is scoped on a
            call first.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* Honest notes */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Honest Notes
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              A few things up front.
            </h2>
          </div>

          <ul className="space-y-5">
            {HONEST_NOTES.map((note, i) => (
              <li
                key={i}
                className="flex items-start gap-4 text-gray-400 font-light leading-relaxed"
              >
                <span className="text-blue-400 mt-1.5 shrink-0">—</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* CTA */}
      <section
        className="relative py-28 px-6 overflow-hidden"
        style={{ backgroundColor: "#09090b" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-medium text-white leading-tight mb-6"
            style={{ textWrap: "balance", letterSpacing: "-0.03em" }}
          >
            Book a free call.
          </h2>
          <p
            className="text-gray-500 text-sm sm:text-lg font-light mb-10"
            style={{ letterSpacing: "0.02em" }}
          >
            30 minutes. Tell me what you're working on. No commitment.
          </p>
          <a
            href="https://calendly.com/hudsonturansky/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: "#ffffff",
              color: "#09090b",
            }}
          >
            Schedule a Call →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Hudson Turansky
        </p>
      </footer>
    </div>
  );
};

export default InterestedPage;
