import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { listApprovedReferencesPublic } from "@/lib/references-db";
import type { PublicApprovedReference } from "@/lib/references-types";

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--app-card-bg)",
  border: "1px solid var(--app-border-soft)",
};

const ReferenceCard = ({ reference }: { reference: PublicApprovedReference }) => (
  <div className="rounded-2xl p-6 flex flex-col" style={CARD_STYLE}>
    <blockquote className="border-l-2 border-blue-400/60 pl-4 text-base text-gray-300 italic leading-snug">
      {reference.headline}
    </blockquote>
    <div
      className="mt-6 pt-4 flex items-center justify-between"
      style={{ borderTop: "1px solid var(--app-border-soft)" }}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-white truncate">
          {reference.name}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {reference.role_title}
        </div>
      </div>
      {reference.linkedin_url && (
        <a
          href={reference.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-blue-400 transition-colors shrink-0 ml-3"
          aria-label={`${reference.name} on LinkedIn`}
        >
          <Linkedin size={16} />
        </a>
      )}
    </div>
  </div>
);

const Collaborators = () => {
  const [refs, setRefs] = useState<PublicApprovedReference[] | null>(null);

  useEffect(() => {
    listApprovedReferencesPublic()
      .then(setRefs)
      .catch(() => setRefs([]));
  }, []);

  if (!refs || refs.length === 0) return null;

  return (
    <section id="references" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Trust
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold leading-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="block text-white">Collaborators</span>
            <span className="block text-gray-600">& References.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {refs.map((r) => (
            <ReferenceCard key={r.id} reference={r} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collaborators;
