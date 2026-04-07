import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-4 py-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Ask me anything..."
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none px-3 py-2 rounded-lg"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity"
        style={{
          background: "rgba(59,130,246,0.2)",
          opacity: disabled || !value.trim() ? 0.4 : 1,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </form>
  );
};

export default ChatInput;
