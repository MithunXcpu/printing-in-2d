# Printing in 2D

AI-powered micro-tool builder. Describe repetitive tasks to AI avatars that design visual workflow diagrams and generate implementation blueprints.

## How It Works

1. **Choose an avatar** — Pick from Oracle, Spark, Forge, or Flow
2. **Describe your task** — Chat with the AI about what you want to automate
3. **Watch it build** — See a live workflow diagram take shape as you talk
4. **Get your blueprint** — Review generated work orders and implementation tasks

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS v4, Framer Motion
- **Auth:** Clerk
- **Database:** Supabase (7 tables with RLS)
- **Payments:** Stripe (Free + $29/mo Pro)
- **AI:** Anthropic Claude, OpenAI, Google Gemini, ElevenLabs TTS, Tavus avatars
- **3D:** Three.js, TalkingHead
- **State:** Zustand

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys in .env.local

# Set up Supabase tables
# Run the SQL in supabase-schema.sql against your Supabase project

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (chat, code gen, image gen, TTS, sessions, checkout, webhooks)
│   ├── build/         # Avatar selection → onboarding → session → workorders
│   ├── dashboard/     # Past sessions
│   ├── pricing/       # Free vs Pro tiers
│   ├── contact/       # Contact form
│   └── sign-in/       # Clerk auth
├── components/
│   ├── avatar/        # AvatarCanvas, GenerativeAvatar
│   ├── chat/          # ChatPanel, MessageBubble, ChatInput, CallControls
│   └── diagram/       # WorkflowDiagram, DiagramConnection
├── hooks/             # useAvatar
├── lib/               # System prompts, tool definitions, workflow layout, configs
└── stores/            # Zustand stores (conversation, session, workflow, interview, workorder)
```

## Environment Variables

See `.env.example` for all required variables. You need keys for:
- Anthropic, OpenAI, Google Gemini, ElevenLabs, Tavus
- Clerk (auth)
- Supabase (database)
- Stripe (payments)

## Deploy

Deployed on [Vercel](https://vercel.com). Push to `main` to trigger auto-deploy.
