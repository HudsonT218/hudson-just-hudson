

# Optimize Chatbot Conversation Flow

## What Changes
Update the system prompt in the backend edge function to add a "discovery" step before offering the Calendly link. The bot will probe deeper into what the client specifically wants done before suggesting a call.

## Updated Conversation Flow
1. **Greet** — ask what brings them here
2. **Understand** — learn their general need (website, AI agent, etc.)
3. **Probe deeper** — ask 1-2 specific follow-up questions: "What's the main goal of the site?", "Do you have existing branding?", "What features do you need?", etc.
4. **Summarize & ask** — reflect back what they said, then ask if they'd like to book a free call
5. **Show Calendly** — only after they confirm yes

## Technical Detail
- **File:** `supabase/functions/chat/index.ts` — update `SYSTEM_PROMPT` conversation flow section
- Add a new step 3 between understanding needs and suggesting the call
- Instruct the model to ask at least one specific follow-up about their project before ever mentioning the discovery call
- Keep the rule that `show_calendly` only fires after explicit user confirmation

No frontend changes needed.

