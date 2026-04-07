import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} px-4`}>
      <div
        className="px-4 py-3 max-w-[85%] text-sm font-light leading-relaxed"
        style={{
          background: isUser
            ? "rgba(59,130,246,0.12)"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(59,130,246,0.2)"
            : "1px solid rgba(255,255,255,0.06)",
          borderRadius: isUser
            ? "12px 12px 4px 12px"
            : "12px 12px 12px 4px",
          color: isUser ? "#fff" : "#d1d5db",
        }}
      >
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
