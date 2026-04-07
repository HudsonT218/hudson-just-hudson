export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatAction {
  type: "show_calendly" | "end_conversation";
  url?: string;
  service?: string;
}

export interface ChatApiResponse {
  reply: string;
  action?: ChatAction;
  sessionId: string;
}
