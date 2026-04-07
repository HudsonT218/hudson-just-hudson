import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  GoogleGenerativeAI,
  SchemaType,
} from "https://esm.sh/@google/generative-ai@0.24.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Hudson's AI assistant on his freelance web development and AI agent building website. Your job is to have a friendly conversation with potential clients, understand what they need, and gently guide them toward booking a free discovery call.

## About Hudson
- Freelance web developer and AI agent builder
- Services:
  - Landing Pages — Single-page sites for launches, services, or personal brands
  - Business Sites — Multi-page websites with custom design, blog/gallery options
  - Operations Software — Custom internal tools, dashboards, and platforms
  - Personal AI Assistants — Custom-trained AI for personal workflows
  - Company AI Agents — Production-grade agents that handle real team workflows with integrations
- Uses AI-powered workflows to deliver faster and cheaper than traditional agencies
- All projects start with a free 30-minute discovery call, no commitment

## Your Personality
- Friendly, direct, and knowledgeable — like talking to a smart colleague, not a salesperson
- Brief responses (2-4 sentences max). No walls of text.
- You can discuss technical topics intelligently — this itself is social proof that Hudson builds great AI
- Warm and conversational, but always subtly steering toward a discovery call

## Conversation Flow
1. GREET warmly. Ask what brings them here or what they're working on.
2. UNDERSTAND their situation through natural back-and-forth. Ask about what they need built, what problem it solves, or what their business does. Don't rapid-fire questions.
3. CONNECT their needs to how Hudson can help — mention the relevant service category without quoting prices. Then EXPLICITLY ASK "Would you like to schedule a free discovery call with Hudson to discuss the details?" or similar. You MUST ask this as a direct question.
4. WAIT for confirmation. Only call qualify_lead with action "show_calendly" AFTER the user says yes/sure/let's do it. Until then, use "keep_chatting".

## Rules
- NEVER share pricing. If someone asks about cost, say "Pricing depends on the scope — Hudson covers all of that on the discovery call so he can give you an accurate quote. Would you like me to set that up?"
- NEVER make up capabilities Hudson doesn't have. Stick to the 5 services listed.
- If someone needs something outside these services, suggest a general discovery call to discuss it.
- Your goal is to get them excited about what's possible and make the discovery call feel like a no-brainer next step. It's free, it's short, no commitment.
- Don't be pushy or salesy. Be genuinely helpful and let the value speak for itself. If they're not ready, that's fine — leave the door open.
- ONLY call qualify_lead with "show_calendly" when the user explicitly agrees to book. Use "keep_chatting" otherwise.
- Keep responses SHORT. 2-4 sentences max.`;

const CALENDLY_MAP: Record<string, string> = {
  landing_page:
    "https://calendly.com/hudsonturansky/landing-page-discovery-call",
  business_site:
    "https://calendly.com/hudsonturansky/business-site-discovery-call",
  ops_software:
    "https://calendly.com/hudsonturansky/operations-software-discovery-call",
  personal_ai:
    "https://calendly.com/hudsonturansky/personal-ai-assistant-discovery-call",
  company_agent:
    "https://calendly.com/hudsonturansky/company-ai-agent-discovery-call",
  unclear: "https://calendly.com/hudsonturansky/30min",
};

const SERVICE_LABELS: Record<string, string> = {
  landing_page: "Landing Page",
  business_site: "Business Site",
  ops_software: "Operations Software",
  personal_ai: "Personal AI Assistant",
  company_agent: "Company AI Agent",
  unclear: "General Discovery",
};

// In-memory conversation store (resets on cold start, fine for a chatbot)
const sessions = new Map<
  string,
  { role: string; parts: { text: string }[] }[]
>();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, message, history: clientHistory } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "sessionId required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction: SYSTEM_PROMPT,
      tools: [
        {
          functionDeclarations: [
            {
              name: "qualify_lead",
              description:
                "Call this when you have enough information to qualify the lead and suggest next steps.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  service_interest: {
                    type: SchemaType.STRING,
                    format: "enum",
                    enum: [
                      "landing_page",
                      "business_site",
                      "ops_software",
                      "personal_ai",
                      "company_agent",
                      "unclear",
                    ],
                    description: "The service that best matches what they need",
                  },
                  qualification_score: {
                    type: SchemaType.NUMBER,
                    description:
                      "1-10 score. 10 = ready to buy today. 1 = just browsing.",
                  },
                  summary: {
                    type: SchemaType.STRING,
                    description:
                      "2-sentence summary of what this person needs and why.",
                  },
                  action: {
                    type: SchemaType.STRING,
                    format: "enum",
                    enum: ["show_calendly", "keep_chatting"],
                    description:
                      "Next step. show_calendly = ready to book. keep_chatting = need more info.",
                  },
                },
                required: [
                  "service_interest",
                  "qualification_score",
                  "summary",
                  "action",
                ],
              },
            },
          ],
        },
      ],
    });

    const normalizedClientHistory = Array.isArray(clientHistory)
      ? clientHistory
          .filter(
            (entry) =>
              entry &&
              typeof entry.role === "string" &&
              typeof entry.content === "string" &&
              entry.content.trim() !== ""
          )
          .map((entry) => ({
            role: entry.role === "assistant" ? "model" : "user",
            parts: [{ text: entry.content.trim() }],
          }))
      : [];

    const sanitizedClientHistory = [...normalizedClientHistory];
    while (sanitizedClientHistory[0]?.role === "model") {
      sanitizedClientHistory.shift();
    }

    let history = sanitizedClientHistory.length > 0
      ? sanitizedClientHistory
      : sessions.get(sessionId) || [];

    const isInit = !message || message.trim() === "";
    const userMessage = isInit ? "Hi, I just opened the chat." : message.trim();
    const lastHistoryMessage = history[history.length - 1]?.parts?.[0]?.text;

    if (!isInit || lastHistoryMessage !== userMessage) {
      history.push({ role: "user", parts: [{ text: userMessage }] });
    }

    const chatHistory = history.slice(0, -1);
    const chatSession = model.startChat({
      history: chatHistory.length > 0 ? chatHistory : undefined,
    });

    const result = await chatSession.sendMessage([{ text: userMessage }]);
    const response = result.response;

    let reply = "";
    let action = undefined;

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          reply += part.text;
        }
        if (part.functionCall) {
          const args = part.functionCall.args as Record<string, unknown>;
          const serviceInterest = (args.service_interest as string) || "unclear";

          if (args.action === "show_calendly") {
            action = {
              type: "show_calendly",
              url: CALENDLY_MAP[serviceInterest] || CALENDLY_MAP.unclear,
              service: SERVICE_LABELS[serviceInterest] || "General Discovery",
            };
          }
        }
      }
    }

    if (!reply && action) {
      reply =
        "Sounds like Hudson could really help with this! You can book a free 30-minute discovery call to go over the details together.";
    } else if (!reply) {
      reply = "Tell me more about what you're looking for!";
    }

    history.push({ role: "model", parts: [{ text: reply }] });
    sessions.set(sessionId, history);

    return new Response(
      JSON.stringify({ reply, action, sessionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({
        reply: "Sorry, I'm having a moment. Try again in a sec?",
        sessionId: "",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
