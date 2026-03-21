# AGENTS.md — Printing in 2D Site

## Project overview

Printing in 2D is a landing page and interactive demo for an AI-powered workflow automation platform. Users select an AI avatar personality, describe their workflow through conversational dialogue, and see a live diagram build in real-time. This is a **single-file architecture** — no build tools, no frameworks, no bundler.

## Tech stack

- Pure HTML/CSS/JS (two files: `index.html`, `app.html`)
- Google Fonts via CDN (Outfit, Fraunces, JetBrains Mono)
- Tavus API for AI video avatar generation (pending integration)
- Deployed on Vercel as a static site

## Setup commands

```bash
# Dev server
npx serve .
# or just open index.html in browser

# Deploy
npx vercel --prod

# Lint HTML
npx htmlhint index.html app.html
```

## Code style

- This is a multi-file static project. Do NOT add build tools unless explicitly asked.
- CSS uses custom properties defined in `:root` — always use variables, never hardcode colors.
- Class names are short and semantic (`.av-thumb`, `.wf-node`, `.chat-msg`).
- JavaScript is vanilla — no jQuery, no libraries, no build step.
- Use `const` by default, `let` only when reassignment is needed.
- Prefer template literals over string concatenation.
- All animations use CSS `@keyframes` — avoid JS-based animation unless interactive.

## Design system

```
Colors (CSS vars):
--white: #fafcf8          --off-white: #f3f6ef
--cream: #eef2e8           --green-50 to --green-600 (brand green)
--ink: #0d1208             --ink-80 to --ink-20 (grays)

Fonts:
- Outfit (body, sans-serif)
- Fraunces (headings, serif — italics for emphasis)
- JetBrains Mono (labels, tags, monospace elements)

Spacing:
- border-radius: 16px (--radius), 24px (--radius-lg)
- Section padding: 110px vertical, 40px horizontal
- Max content width: 1080px

Avatar color mapping:
- Oracle: green (#2d8014 / #1a5c08)
- Spark:  orange/amber (#f59e0b / #d97706)
- Forge:  indigo (#6366f1 / #4338ca)
- Flow:   cyan (#06b6d4 / #0891b2)
```

## Architecture

### Files
- `index.html` — Marketing landing page with hero, features, testimonials
- `app.html` — Interactive 3-screen workflow builder

### Landing page sections (index.html)
1. `nav` — Fixed top bar, shrinks on scroll
2. `.hero` — Badge, headline, avatar showcase card, CTAs
3. `.how-section` — Three cards: Talk → Show → Ship
4. `.workflow-section` — Animated diagram with SVG connection lines
5. `.modes-section` — Orchestration vs Consolidation cards
6. `.recording-section` — Screen recording visual + feature list
7. `.marketplace-section` — Three example workflow cards
8. `.final-cta` — Dark section CTA
9. `footer`

### App screens (app.html)
1. **Avatar Selection** — Choose Oracle, Spark, Forge, or Flow
2. **Chat + Diagram** — Conversational interview with live node reveal
3. **Completion** — Workflow summary with deploy button

### Avatar system (JavaScript)
The `avatarData` object stores all four personalities with their conversation flows. Each avatar has 5-step dialogue with branching user responses.

### Diagram system
- 9 fixed nodes (3 sources, 3 processors, 3 outputs)
- Connections render when both connected nodes are revealed
- SVG lines drawn dynamically based on node positions

## Testing instructions

- Open `index.html` in Chrome and Safari — verify all animations play
- Click each avatar thumbnail — verify colors, chat, traits all swap
- Scroll down — verify `.reveal` elements fade in
- Resize to ≤960px — verify single-column layout
- Resize to ≤600px — verify stacked CTAs, mobile nav
- Test `app.html` — complete full avatar → chat → completion flow

## Do not

- Do NOT add npm dependencies or a build step
- Do NOT change the CSS custom property names (design tokens)
- Do NOT remove the Tavus badge or attribution
- Do NOT use JavaScript animation libraries — CSS `@keyframes` only
- Do NOT change avatar personality names (Oracle, Spark, Forge, Flow)
- Do NOT hardcode colors — always use CSS variables
- Do NOT add frameworks (React, Vue, Tailwind, etc.)

## Tavus integration (pending)

To integrate real Tavus videos:

1. Replace `.vp` div inside `.video-frame` with:
   ```html
   <video id="avatarVideo" src="TAVUS_URL" autoplay loop muted playsinline></video>
   ```
2. Update `selectAvatar()` to swap video src
3. Replace emoji placeholders in `.av-ph` with `<img>` headshots
4. See `avatar-scripts.md` for Tavus API curl commands

## Deployment

```bash
# Vercel (static site)
npx vercel --prod

# Or drag-and-drop at vercel.com/new
```

## MCP servers (recommended)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright"]
    }
  }
}
```

## Prompt patterns

```markdown
## Task
[Specific. Include section names, class names, expected behavior.]

## Background
[Paste relevant HTML/CSS/JS snippets. Include screenshots if visual.]

## Do not
[What should NOT be touched. Be explicit about boundaries.]
```
