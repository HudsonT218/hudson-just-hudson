// TODO: Hudson — replace placeholder labels with real client/collaborator names,
// or delete this component and remove its import from WorkPage.tsx before launch.

const PLACEHOLDERS = [
  "Placeholder One",
  "Placeholder Two",
  "Placeholder Three",
  "Placeholder Four",
  "Placeholder Five",
];

const SocialProof = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
          Trust
        </p>
        <h3
          className="text-3xl sm:text-4xl font-extrabold text-white mb-10"
          style={{ letterSpacing: "-0.03em" }}
        >
          Collaborators & References
        </h3>
        <div className="flex flex-wrap gap-8">
          {PLACEHOLDERS.map((name) => (
            <span
              key={name}
              className="text-xs uppercase tracking-widest text-gray-500"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
