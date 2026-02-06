# CLAUDE.md — Printing in 2D

## What This Is
AI micro-tool builder. Users chat with AI avatars that design workflow diagrams for automation tasks.

## Tech Stack
- Next.js 16, React 19, TypeScript
- Tailwind CSS v4 (NEVER use custom `*` CSS reset or arbitrary bracket values like `bg-[#hex]`)
- Framer Motion for animations
- Zustand for state management
- Supabase for database (7 tables with RLS)
- Clerk for auth
- Stripe for payments (Free + $29/mo Pro)
- Anthropic Claude SDK for AI chat
- Three.js + TalkingHead for 3D avatars

## Key Architecture
- `/build` flow: avatar selection → onboard (4 steps) → session (chat + diagram) → workorders
- Split-screen session: left = AI chat panel, right = live workflow diagram
- API routes handle AI, TTS, image gen, code gen, sessions, checkout, webhooks
- Zustand stores: conversation, session, workflow, interview, workorder

## Commands
```bash
npm run dev    # Start dev server on localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

## Database
Schema in `supabase-schema.sql`. Tables: users, sessions, messages, workflow_nodes, workflow_connections, interview_profiles, work_orders. All have RLS enabled.

## Environment
All keys in `.env.example`. Need: Anthropic, OpenAI, ElevenLabs, Tavus, Gemini, Clerk, Supabase, Stripe.

## Conventions
- Dark theme throughout
- Formspree for /contact page (needs form ID — currently placeholder)
- Webhook handlers for Clerk user sync and Stripe subscription events
- Avatar system supports 4 personalities: Oracle, Spark, Forge, Flow
