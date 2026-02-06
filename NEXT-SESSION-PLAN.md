# Printing in 2D — Next Session Plan

## What This App Is
AI-powered "micro tool builder" — users describe a repetitive task to an AI avatar, and it designs a visual workflow diagram for a small automation tool.

**Stack:** Next.js 16 + React 19 + TypeScript + Tailwind 4 + Zustand + Supabase + Clerk + Stripe + Anthropic SDK + Three.js + TalkingHead avatars

## Current State (as of Feb 6, 2026)
- **40 uncommitted changes** spanning auth, payments, persistence, onboarding, dashboard, pricing
- **No GitHub remote** — local only, no backup
- **Boilerplate README** — not customized
- **No CLAUDE.md** — no agent context file
- **.env.example is incomplete** — lists 1 of 14 required vars
- **Unused deps:** prisma, @prisma/client (app uses Supabase directly)
- **Vercel:** linked but not synced with a GitHub repo

## Sibling Project: printing-in-2d-site
- Static marketing/landing page (index.html + app.html)
- Deployed on Vercel separately
- Has AGENTS.md but no git repo
- Needs to be either merged or given its own GitHub repo

## Tasks for Next Session

### 1. Git + GitHub Setup
- [ ] Commit all 40 uncommitted changes
- [ ] Create GitHub repo `MithunXcpu/printing-in-2d`
- [ ] Push to remote
- [ ] Init git for printing-in-2d-site, push to separate repo

### 2. Clean Up Code
- [ ] Remove prisma and @prisma/client from package.json
- [ ] Update .env.example with all 14 environment variables
- [ ] Ensure .env.local is in .gitignore (it is)

### 3. Add Project Documentation
- [ ] Write real README.md (what it does, setup, env vars, architecture)
- [ ] Create CLAUDE.md (project context for AI agents)
- [ ] Add AGENTS.md if needed

### 4. Sync Desktop ↔ GitHub ↔ Vercel
- [ ] Connect Vercel project to GitHub repo for auto-deploy
- [ ] Verify deployment works
- [ ] Ensure env vars are set in Vercel dashboard

### 5. Snake Game Integration (Optional)
- Browser-based Snake game could be a fun Easter egg or demo
- Would need to be built from scratch (the tweet's version is Tkinter/Python, not web)
- Could be a Canvas-based mini-game within the workflow builder

## Architecture Overview

### Pages
- `/` — Landing page
- `/build` — Avatar selection (Oracle, Spark, Forge, Flow)
- `/build/onboard` — 4-step onboarding form
- `/build/session/[id]` — Split-screen: AI chat + live workflow diagram
- `/build/session/[id]/review` — Blueprint review
- `/build/session/[id]/workorders` — Implementation tasks
- `/dashboard` — Past sessions (Supabase)
- `/pricing` — Free vs Pro ($29/mo)
- `/sign-in`, `/sign-up` — Clerk auth

### Key Patterns
- Zustand stores for state (session, conversation, workflow, interview, workorder)
- Streaming chat via JSON-line events
- Mock mode when no API key set
- All external services (Clerk, Supabase, Stripe, Tavus) gracefully degrade

### API Routes
- `/api/chat` — Claude streaming chat with tool use
- `/api/generate-image` — DALL-E 3 image gen
- `/api/tavus` — Video avatar management
- `/api/checkout` — Stripe checkout
- `/api/sessions` — CRUD for sessions
- `/api/webhooks` — Clerk/Stripe webhooks

### Database (Supabase)
7 tables: users, sessions, messages, workflow_nodes, workflow_connections, interview_profiles, work_orders

### Environment Variables Needed
- ANTHROPIC_API_KEY
- OPENAI_API_KEY
- ELEVENLABS_API_KEY
- TAVUS_API_KEY
- GEMINI_API_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_SIGN_UP_URL
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID_PRO
