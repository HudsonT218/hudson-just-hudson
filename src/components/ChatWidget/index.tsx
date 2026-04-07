import { useIsMobile } from "@/hooks/use-mobile";
import { useChatSession } from "./useChatSession";
import ChatPanel from "./ChatPanel";

const ChatWidget = () => {
  const isMobile = useIsMobile();
  const {
    messages,
    currentAction,
    isLoading,
    isOpen,
    hasUnread,
    setIsOpen,
    handleOpen,
    sendMessage,
    handleBookCall,
  } = useChatSession();

  if (isOpen) {
    return (
      <ChatPanel
        messages={messages}
        currentAction={currentAction}
        isLoading={isLoading}
        onSend={sendMessage}
        onClose={() => setIsOpen(false)}
        onBookCall={handleBookCall}
      />
    );
  }

  return (
    <button
      onClick={handleOpen}
      className="group transition-transform hover:scale-105"
      style={{
        position: "fixed",
        bottom: isMobile ? "16px" : "24px",
        right: isMobile ? "16px" : "24px",
        width: isMobile ? "48px" : "56px",
        height: isMobile ? "48px" : "56px",
        borderRadius: "50%",
        background: "rgba(59,130,246,0.15)",
        border: "1px solid rgba(59,130,246,0.25)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      aria-label="Open chat"
    >
      {/* Chat bubble icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>

      {/* Unread dot */}
      {hasUnread && (
        <span
          className="absolute"
          style={{
            top: isMobile ? "0" : "2px",
            right: isMobile ? "0" : "2px",
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: "#3b82f6",
            animation: "pulse 2s infinite",
          }}
        />
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </button>
  );
};

export default ChatWidget;
