interface CalendlyCardProps {
  url: string;
  service: string;
  onBook: () => void;
}

const CalendlyCard = ({ url, service, onBook }: CalendlyCardProps) => {
  const handleClick = () => {
    onBook();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="mx-4 p-4 rounded-xl flex flex-col gap-3"
      style={{
        background: "rgba(59,130,246,0.04)",
        border: "1px solid rgba(59,130,246,0.12)",
      }}
    >
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
        {service}
      </p>
      <button
        onClick={handleClick}
        className="w-full text-sm font-medium px-4 py-3 rounded-md transition-colors duration-200"
        style={{
          backgroundColor: "#ffffff",
          color: "#09090b",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#ffffff";
        }}
      >
        Book a Discovery Call
      </button>
      <p className="text-xs text-gray-500 text-center">
        Free 30-minute call. No commitment.
      </p>
    </div>
  );
};

export default CalendlyCard;
