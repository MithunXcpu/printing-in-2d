# AGENTS.md — Personal Software Builder (Printing in 2D Desktop)

## Project overview

Personal Software Builder is an Electron desktop application that enables enterprise professionals to build custom software tools through conversational AI interviews. Users speak to a local AI avatar that interviews them about their workflow, then generates a working tool tailored to their needs. Runs entirely locally with no external API dependencies for core functionality.

## Tech stack

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS + Radix UI components
- Framer Motion (animations)
- React Router v7
- TanStack React Query & React Table
- Recharts (data visualization)
- Zustand (state management)

### Desktop
- Electron 33 (desktop shell)
- Electron Builder (packaging)
- better-sqlite3 (local database)

### AI & Voice
- Ollama (local LLM server) — handles conversational AI
- Whisper (OpenAI) — Speech-to-Text via HuggingFace transformers
- Kokoro — Text-to-Speech (local)
- TalkingHead — 3D lip-synced avatar rendering

## Setup commands

```bash
# Install dependencies
npm install

# Start dev server + Electron
npm run dev

# Start Electron with Vite watcher
npm run electron:dev

# Full production build
npm run build

# TypeScript validation
npm run typecheck

# ESLint check
npm run lint
```

## Prerequisites

- **Ollama** must be installed and running locally (`ollama serve`)
- Default model: `qwen3:8b` (can be changed in settings)
- Voice AI (Whisper + Kokoro) optional but recommended

## Code style

- TypeScript strict mode
- Electron IPC handlers in `/electron/ipc/`
- Services in `/electron/services/`
- React components in `/src/components/`
- Zustand stores in `/src/stores/`
- Custom hooks in `/src/hooks/`
- Use `const` by default, `let` only when reassignment needed
- Prefer async/await over raw promises

## Architecture

### Main screens
1. **OnboardingScreen** — Setup and dependency checks (Ollama, Voice AI, Avatar)
2. **InterviewScreen** — AI conversation interface with transcript
3. **SettingsScreen** — Ollama model selection, Voice AI config

### IPC Handlers (`electron/ipc/`)
- `conversation.ipc.ts` — Interview workflow with structured tool extraction
- `ollama.ipc.ts` — Local AI model management
- `data-ingest.ipc.ts` — File parsing and schema inference
- `storage.ipc.ts` — Secure API key storage
- `window.ipc.ts` — Window controls

### Services (`electron/services/`)
- `ollama.service.ts` — Manages Ollama connection, chat history, tool calling
- `heygen.service.ts` — Optional AI avatar generation

### Stores (`src/stores/`)
- `app.store.ts` — Global app state
- `tool.store.ts` — Generated tool data
- `conversation.store.ts` — Interview messages
- `user-profile.store.ts` — User profile from interview

### Interview stages
1. GREETING — Warm introduction
2. ROLE_DISCOVERY — Job title and responsibilities
3. DEPARTMENT_CONTEXT — Department and company info
4. OUTCOME_ELICITATION — Desired outcomes/deliverables
5. PAIN_POINTS — Current workflow issues
6. DATA_LANDSCAPE — Data source discovery
7. TOOL_RECOMMENDATION — Suggest optimal tool type

### Tool templates
Built-in: CRM, Dashboard, Report Builder, Workflow Tracker, Forecasting Model, Knowledge Base

## Testing instructions

- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Test onboarding flow — all 3 checks should pass
- Start interview and verify real-time transcript
- Test voice input (requires microphone permission)
- Verify tool recommendation extracts structured data
- Test generated tool preview renders correctly

## Do not

- Do NOT add external API dependencies — this is local-first
- Do NOT store sensitive data outside electron-store
- Do NOT modify IPC preload without updating security policy
- Do NOT bypass context isolation between renderer/main
- Do NOT hardcode Ollama model — use settings

## Build & distribution

```bash
# Build for current platform
npm run build

# Package formats:
# - macOS: DMG
# - Windows: NSIS
# - Linux: AppImage/DEB
```

Window size: 1400x900px, custom title bar

## MCP servers (recommended)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

## Prompt patterns

```markdown
## Task
[Specific. Include screen name, IPC handler, store affected.]

## Background
[Relevant code. Include Electron IPC signatures if touching main process.]

## Do not
[What should NOT be touched. Protect IPC security, Ollama connection, stores.]
```
