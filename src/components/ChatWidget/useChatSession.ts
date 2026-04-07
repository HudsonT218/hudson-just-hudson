import { useState, useCallback, useRef } from "react";
import type { ChatMessage, ChatAction, ChatApiResponse } from "./types";

const API_URL = import.meta.env.VITE_CHAT_API_URL || "http://localhost:3001";
const SESSION_KEY = "hjh-chat-session";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

let messageCounter = 0;

export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAction, setCurrentAction] = useState<ChatAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const initialized = useRef(false);

  const sessionId = useRef(getSessionId());

  const sendMessage = useCallback(
    async (text: string) => {
      if (isLoading) return;

      // Add user message to UI (unless it's the init greeting)
      if (text !== "__init__") {
        const userMsg: ChatMessage = {
          id: `msg-${++messageCounter}`,
          role: "user",
          content: text,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, userMsg]);
      }

      setIsLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId.current,
            message: text === "__init__" ? "" : text,
          }),
        });

        const data: ChatApiResponse = await res.json();

        if (data.reply) {
          const assistantMsg: ChatMessage = {
            id: `msg-${++messageCounter}`,
            role: "assistant",
            content: data.reply,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, assistantMsg]);
        }

        if (data.action) {
          setCurrentAction(data.action);
        }
      } catch {
        const errorMsg: ChatMessage = {
          id: `msg-${++messageCounter}`,
          role: "assistant",
          content:
            "Hmm, I'm having trouble connecting. Try again in a moment?",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading]
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);

    // Auto-greet on first open
    if (!initialized.current) {
      initialized.current = true;
      sendMessage("__init__");
    }
  }, [sendMessage]);

  const handleBookCall = useCallback(() => {
    // Fire tracking event
    fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionId.current,
        message: "",
        event: "booked_call",
      }),
    }).catch(() => {});
  }, []);

  return {
    messages,
    currentAction,
    isLoading,
    isOpen,
    hasUnread,
    setIsOpen,
    handleOpen,
    sendMessage,
    handleBookCall,
  };
}
