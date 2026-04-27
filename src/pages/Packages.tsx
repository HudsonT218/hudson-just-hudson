import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const WEBSITE_PACKAGES = [
  {
    title: "Landing Page",
    price: "$500",
    salePrice: "$250",
    description:
      "A single-page site that looks great and converts — perfect for launches, services, or personal brands.",
    features: [
      "Single-page responsive design",
      "Mobile optimized",
      "Up to 7 sections",
      "2 rounds of revisions",
      "Discovery call included",
      "Deployed & handed off",
    ],
    popular: false,
    rgb: "255,255,255",
    calendly: "https://calendly.com/hudsonturansky/landing-page-discovery-call",
  },
  {
    title: "Business Site",
    price: "$1,500",
    salePrice: "$750",
    description:
      "A multi-page website for businesses and organizations that need more than a single page.",
    features: [
      "Up to 5 pages",
      "Custom design direction",
      "Mobile optimized",
      "Blog or gallery if needed",
      "5 rounds of revisions",
      "Discovery call included",
      "Deployed & handed off",
    ],
    popular: true,
    rgb: "59,130,246",
    calendly: "https://calendly.com/hudsonturansky/business-site-discovery-call",
  },
  {
    title: "Operations Software",
    price: "$5,000",
    salePrice: "$2,500",
    description:
      "Custom internal tools, dashboards, and platforms built around how your team actually works.",
    features: [
      "Full-stack custom application",
      "Admin dashboard",
      "User management",
      "Custom integrations",
      "Iterative build process",
      "Deep discovery & scoping",
      "Deployment + documentation",
      "30 days post-launch support",
    ],
    popular: false,
    rgb: "255,255,255",
    calendly: "https://calendly.com/hudsonturansky/operations-software-discovery-call",
  },
];

const AI_PACKAGES = [
  {
    title: "Personal AI Assistant",
    price: "$1,000",
    description:
      "A custom AI assistant tailored to your specific needs — research, writing, scheduling, or any personal workflow.",
    features: [
      "Custom-trained for your use case",
      "Discovery call to scope behavior",
      "Testing & refinement",
      "Deployment & setup",
      "Usage documentation",
      "2 rounds of revisions",
    ],
    rgb: "255,255,255",
    calendly: "https://calendly.com/hudsonturansky/personal-ai-assistant-discovery-call",
  },
  {
    title: "Company AI Agent",
    price: "$5,000",
    description:
      "A production-grade AI agent that handles real workflows — capable of replacing or augmenting significant workload within your team.",
    features: [
      "Full workflow analysis",
      "Custom multi-step agent",
      "Integration with your tools",
      "Testing with real scenarios",
      "Deployment & monitoring setup",
      "Team training / handoff",
      "5 rounds of revisions",
      "30 days post-launch support",
    ],
    rgb: "255,255,255",
    calendly: "https://calendly.com/hudsonturansky/company-ai-agent-discovery-call",
  },
];

const COMING_SOON = [
  {
    title: "Build Your Website",
    description:
      "Design your own site with our configurator — pick a style, choose your sections, and we'll build it. No calls needed.",
    mailto:
      "mailto:hudsonturansky@gmail.com?subject=Build Your Website Waitlist",
  },
  {
    title: "Scripts & Bots Store",
    description:
      "Browse our library of pre-built AI automations and bots. Pick what you need, we'll help you set it up.",
    mailto:
      "mailto:hudsonturansky@gmail.com?subject=Scripts %26 Bots Store Waitlist",
  },
];

const FAQ = [
  {
    q: "What's included in the discovery call?",
    a: "A free 30-minute call where we talk about what you need, your goals, and how I can help. No commitment, no pressure.",
  },
  {
    q: "How long does a project take?",
    a: "Landing pages are typically delivered in 3-5 days. Business sites take 1-2 weeks. Operations software and AI agents vary based on scope — we'll nail down timelines during discovery.",
  },
  {
    q: "Why are your prices so low?",
    a: "I use AI-powered workflows to move faster without cutting corners. You get the same quality you'd expect from a traditional agency at a fraction of the cost.",
  },
  {
    q: "What happens after delivery?",
    a: "You get your rounds of revisions included in the package. After that, we can set up a retainer or hourly arrangement for ongoing work.",
  },
  {
    q: "Can I upgrade my package later?",
    a: "Absolutely. Start with what you need now and we can expand from there.",
  },
];

const PackageCard = ({
  title,
  price,
  salePrice,
  description,
  features,
  popular,
  rgb,
  calendly,
}: {
  title: string;
  price: string;
  salePrice?: string;
  description: string;
  features: string[];
  popular?: boolean;
  rgb: string;
  calendly: string;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-8 transition-all duration-300 relative flex flex-col"
      style={{
        backgroundColor: hovered
          ? `rgba(${rgb},0.04)`
          : popular
            ? "rgba(59,130,246,0.03)"
            : "rgba(255,255,255,0.02)",
        border: popular
          ? "1px solid rgba(59,130,246,0.15)"
          : hovered
            ? `1px solid rgba(${rgb},0.12)`
            : "1px solid rgba(255,255,255,0.05)",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: popular
          ? "0 0 60px rgba(59,130,246,0.06)"
          : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {(salePrice || popular) && (
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
          {salePrice && (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(59,130,246,0.2)",
                color: "#ffffff",
                border: "1px solid rgba(59,130,246,0.35)",
              }}
            >
              50% OFF
            </span>
          )}
          {popular && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                backgroundColor: "rgba(59,130,246,0.12)",
                color: "#60a5fa",
              }}
            >
              Most Popular
            </span>
          )}
        </div>
      )}

      <h3
        className="text-base font-semibold text-white mb-4"
        style={{ letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>

      <div className="mb-4 flex items-baseline gap-3">
        <span
          className="text-5xl font-extrabold text-white"
          style={{ letterSpacing: "-0.03em" }}
        >
          {salePrice ?? price}
        </span>
        {salePrice && (
          <span
            className="text-xl font-light text-gray-500 line-through"
            style={{ letterSpacing: "-0.01em" }}
          >
            {price}
          </span>
        )}
      </div>

      <p className="text-gray-500 text-sm font-light leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex-1">
        <ul className="space-y-3 mb-8">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="mt-0.5 shrink-0"
              >
                <path
                  d="M3.5 8.5L6.5 11.5L12.5 4.5"
                  stroke="rgba(96,165,250,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-gray-400 font-light">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={calendly}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200 w-full"
        style={{
          backgroundColor: popular ? "#ffffff" : "rgba(255,255,255,0.06)",
          color: popular ? "#09090b" : "#ffffff",
          border: popular
            ? "1px solid #ffffff"
            : "1px solid rgba(255,255,255,0.1)",
        }}
        onMouseEnter={(e) => {
          if (popular) {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
          } else {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (popular) {
            e.currentTarget.style.backgroundColor = "#ffffff";
          } else {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
          }
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
  );
};

const Packages = () => {
  return (
    <div className="min-h-screen relative z-10">
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
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Packages & Pricing
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Packages &{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pricing
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto">
            AI-optimized workflows mean better results at a fraction of the
            typical cost. No bloated timelines, no surprise invoices.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* Website Packages */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Website Development
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Sites that ship fast
            </h2>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              and actually convert.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {WEBSITE_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.title} {...pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* AI & Automation */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              AI Agents & Automation
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Agents that work
            </h2>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-gray-600 leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              while you sleep.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AI_PACKAGES.map((pkg) => (
              <PackageCard key={pkg.title} {...pkg} />
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* Coming Soon */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Coming Soon
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              What's next.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COMING_SOON.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  backgroundColor: "rgba(255,255,255,0.01)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <h3
                    className="text-base font-semibold text-gray-400"
                    style={{ letterSpacing: "-0.01em" }}
                  >
                    {item.title}
                  </h3>
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.3)",
                    }}
                  >
                    Coming Soon
                  </span>
                </div>

                <p className="text-gray-600 text-sm font-light leading-relaxed mb-6 flex-1">
                  {item.description}
                </p>

                <a
                  href={item.mailto}
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200 w-full"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255,255,255,0.03)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }}
                >
                  Join Waitlist
                </a>
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

      {/* FAQ */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              FAQ
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              Common questions.
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <AccordionTrigger
                  className="text-sm font-medium text-white hover:no-underline py-5"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-500 font-light leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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

export default Packages;
