# KChat B2B — Mobile Click-Through

A static HTML/CSS/JS click-through that mirrors the **B2C prototype's exact 5‑tab
mobile shell** (see [`kchat-b2c-ai-vision-board/prototype/`](https://github.com/kennguy3n/kchat-b2c-ai-vision-board/tree/main/prototype))
but is populated with **B2B enterprise content** — workspaces, Core Intents, AI
Employees, approvals with audit trails, compute-mode badges, and KApps.

> The app is the same structure — only the features differ depending on the
> community. **Community is a tenant construct.** On mobile, a tenant is a
> workspace (Acme Corp, Globex, Acme Labs).

## Run locally

```bash
cd /path/to/kchat-b2b-ai-vision-board
python3 -m http.server 8000
# open http://localhost:8000/mobile/
```

No build, no npm, no frameworks. Just open `mobile/index.html` through any
static server.

## Architecture (mirrors B2C)

```
mobile/
  index.html              iPhone frame + all screens + tab bar
  css/
    style.css             Global styles, iPhone frame, B2B design tokens, transitions
    components.css        Cards, chips, buttons, bubbles, privacy strip, AI bits
  js/
    data.js               window.KDATA — hardcoded B2B demo content (no ES modules)
    simulate-ai.js        Copied verbatim from B2C — KAI.processInto / attachLongPress / typingHTML
    app.js                Navigation (KApp namespace), SCREEN_ENTER hooks, guided demos
  screenshots/            PR screenshots
```

The CSS variable names (`--k-primary`, `--k-accent`, …) match the B2C prototype
exactly; only the **values** are swapped to the B2B desktop palette
(primary `#6366F1`, accent `#8B5CF6`, danger `#EF4444`, …) so the shared
`components.css` and `simulate-ai.js` work unchanged.

## Bottom tab bar — identical to B2C

| Tab | Icon | B2C content | B2B content (same shape, different features) |
|---|---|---|---|
| `chats` / **Message** | 💬 | DMs, communities | Workspace home, channel list, channel chat, threads, action launcher, brief, AI processing/output, artifact workspace, email detail |
| `notifications` / **Notification** | 🔔 | Social notifications | Priority-grouped inbox: Action Required (approvals, tasks, legal review) + Updates (AI completions, calendar, mentions) |
| `tasks` / **Tasks** | 📅 | Personal tasks | Task list with AI-extracted badges + segmented control to **Approvals** list |
| `settings` / **Settings** | ⚙ | Personal settings | **AI Employees** as prominent top group, AI Memory, Compute Transparency, Connectors, Workspace, Preferences |
| `more` / **More** | ··· | Tools | Ask KChat AI, AI Insights, Metrics Dashboard, Template gallery, Packaging & Tiers, KApps (Form/Base/Sheet), Connectors |

Same `data-tab` IDs, same red-pill badge pattern, same `KApp.onTabClick(tab)`
switch, same `updateTabs(screenId)` map pattern — so future B2C fixes to the
tab bar drop into B2B with zero rework.

## Screens (25)

### Phase 1 — Core navigation (8)
1. `launcher` — guided-demo landing
2. `home` — Acme Corp **workspace dashboard** (tenant switcher, Core Intents, quick actions, recent channels). Reachable from the **⊞** icon in the `channel-list` topbar and from the launcher's secondary "Workspace dashboard" button. **Not the Message-tab landing** — the Message tab (💬) opens `channel-list` directly, since a chat app's home is chat.
3. `channel-list` — community/tenant strip at top (Chat · Acme · Globex · Labs · +Join), pinned `announcement` row, then "Joined groups (9)" with domain sub-sections for the active community. Rich rows show a colored group avatar, name, relative time, last-message preview, and unread badge; tenant switching persists via `localStorage` under `kchat-b2b-tenant`.
4. `channel-chat` — `#vendor-management` with 12 messages, AI cards, approval card, email card
5. `thread-detail` — 5 extracted tasks inline, thread chips
6. `notifications` — 3 action-required + 5 updates
7. `task-list` — 7 tasks (Tasks/Approvals segmented control)
8. `settings` — AI Employees, AI & Privacy, Workspace, Preferences

### Phase 2 — AI & enterprise flows (10)
9.  `action-launcher` — bottom-sheet Core Intents with mode badges
10. `brief-builder` — pre-filled intake
11. `ai-processing` — step-by-step thinking with compute-mode privacy strip
12. `ai-output-review` — 5 sections with per-section confidence & citations
13. `artifact-workspace` — mobile document editor with section chats
14. `approval-form` — pre-filled approval intake
15. `approval-review` — audit trail with timestamps
16. `ai-employee-list` — 5 AI Employees with budget, compute mode
17. `ai-employee-detail` — Kara profile with queue, allowed channels, budget bar
18. `long-press-menu` — bottom-sheet context actions

### Phase 3 — KApps & more (7)
19. `task-detail` — AI-extracted task with source
20. `form-view` — KApp Form (vendor onboarding)
21. `base-view` — KApp Base (Vendor Register)
22. `sheet-view` — KApp Sheet (Q2 Vendor Spend)
23. `search` — Ask KChat AI natural-language queries
24. `email-detail` — inbound email with AI summary
25. `more` — Ask KChat AI · shortcuts · connected apps
26. Plus secondary screens: `ai-memory`, `compute-transparency`, `connectors`, `metrics-dashboard`, `ai-insights`, `template-gallery`, `packaging-tiers`, `approval-list`.

## Guided demo paths

- **Vendor Review Week** (8 steps) — home → channel-chat → long-press → thread → tasks → approval-form → approval-review → notifications
- **Draft a PRD with Nina** (7 steps) — home → channel-chat → action-launcher → brief-builder → ai-processing → ai-output-review → artifact-workspace
- **AI Employee Check-in** (5 steps) — home → settings → ai-employee-list → ai-employee-detail (Kara) → channel-chat

Start a demo from the launcher or call `KApp.startDemo('vendor-review')` /
`'draft-prd'` / `'ai-employee'` from the console.

## Mobile UX principles

- Single-column, full-screen push navigation (no 3-column layout)
- Right panels → full screens with back button
- Action Launcher & long-press → bottom sheets
- Tab bar hidden on deep flows (threads, AI processing, approvals, artifact workspace)
- Horizontal scroll for overflow (Core Intents, channel context chips)
- Privacy strip on every AI result
- Touch targets ≥ 44px
- Tested at 390×844 viewport

## B2B-specific adaptations (content only, shape unchanged)

1. Tenant switcher (Acme / Globex / Labs) instead of personal communities
2. **Core Intents** row (Create / Analyze / Plan / Approve) instead of B2C "Catch me up"
3. AI Employees section in Settings
4. Approval flows with audit trails (accessible from Tasks tab)
5. Channel context bar with connected services (Drive, Calendar, KMail, Base)
6. Action Launcher with **Auto / Inline** mode badges
7. Compute-mode badges: **On-device** / **Confidential server** / **Frontier**
8. Simplified mobile co-pilot surfaces for Doc / Slide / Sheet
