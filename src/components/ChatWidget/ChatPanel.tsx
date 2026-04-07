import { useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import CalendlyCard from "./CalendlyCard";
import TypingIndicator from "./TypingIndicator";
import type { ChatMessage as ChatMessageType, ChatAction } from "./types";

interface ChatPanelProps {
  messages: ChatMessageType[];
  currentAction: ChatAction | null;
  isLoading: boolean;
  onSend: (message: string) => void;
  onClose: () => void;
  onBookCall: () => void;
}

const ChatPanel = ({
  messages,
  currentAction,
  isLoading,
  onSend,
  onClose,
  onBookCall,
}: ChatPanelProps) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, currentAction]);

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        position: "fixed",
        bottom: isMobile ? "16px" : "24px",
        right: isMobile ? "16px" : "24px",
        left: isMobile ? "16px" : "auto",
        width: isMobile ? "auto" : "380px",
        maxHeight: isMobile ? "calc(100vh - 120px)" : "600px",
        background: "rgba(9,9,11,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        zIndex: 60,
        animation: "chatPanelIn 0.2s ease-out",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{
          height: "56px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium text-white">Hudson's AI</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white transition-colors"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 flex flex-col gap-3"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}

        {/* Calendly booking card */}
        {currentAction?.type === "show_calendly" &&
          currentAction.url && (
            <CalendlyCard
              url={currentAction.url}
              service={currentAction.service || "Discovery Call"}
              onBook={onBookCall}
            />
          )}
      </div>

      {/* Input */}
      <ChatInput onSend={onSend} disabled={isLoading} />

      <style>{`
        @keyframes chatPanelIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatPanel;
