const TypingIndicator = () => (
  <div className="flex items-start gap-2 px-4">
    <div
      className="px-4 py-3 rounded-xl max-w-[85%] text-sm"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px 12px 12px 4px",
      }}
    >
      <div className="flex gap-1 items-center h-5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gray-400"
            style={{
              animation: `typing 1.4s infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes typing {
        0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
        30% { opacity: 1; transform: translateY(-2px); }
      }
    `}</style>
  </div>
);

export default TypingIndicator;
