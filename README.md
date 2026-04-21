# KChat B2B — AI Vision Board

Static click-through vision board for **KChat B2B** — enterprise messaging with on-device AI coworkers and native structured apps (KApps).

- **Proposal:** see [`PROPOSAL.md`](./PROPOSAL.md) for phases, features, use case flow, and architecture.
- **Desktop demo:** fully working static HTML/CSS/JS under [`desktop/`](./desktop/). No build tools, no frameworks, no server calls.
- **Mobile / shared:** reserved for future tasks.

---

## Run the desktop demo locally

Because the demo uses ES modules, it must be served over HTTP (browsers block `file://` module loading). Any static server will do.

**Python 3 (no dependencies):**

```bash
cd desktop
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

**Node (npx):**

```bash
cd desktop
npx --yes http-server -p 8000 -c-1
# then open http://localhost:8000/index.html
```

There is nothing to install — all CSS and JS are in the repo and the demo data is pre-scripted in `desktop/js/demo-data.js`.

## Click-through guide (16 screens)

The demo is a state machine. `desktop/js/app.js` controls which `<section data-screen="...">` is visible. You can click through the whole story in order:

1. **Login / workspace select** — click *Continue*.
2. **Workspace home** — 3 domain cards, recent channels, pinned items. Click a domain.
3. **Domain view** — channel list for the domain. Click `#vendor-management`.
4. **Channel chat** — 3-column layout. Hover a message for action icons. Click `+` in the compose bar for the Action Launcher.
5. **Thread detail** — click *Open Thread* on any message; use the thread action bar (Extract Tasks / Summarize / Draft Doc / Create Approval).
6. **Action Launcher (modal)** — grouped actions (Create / Track / Plan / Approve / Collect / Analyze). Pick *Create → PRD*.
7. **Guided intake / brief builder (right panel)** — goal, audience chips, sources, template, tone, missing info, compute-mode privacy review.
8. **AI processing (right panel)** — 4-step animation (Reading sources → Planning outline → Drafting sections → Ready for review). Auto-advances to output review.
9. **AI output review (right panel)** — draft PRD with citations, per-section confidence, sources. Click *Edit in Workspace*.
10. **Document artifact workspace (center)** — outline nav, editable sections, version history, *Publish* (confirmation modal).
11. **Task KApp (right panel)** — list / Kanban toggle, AI-extracted badge, task detail.
12. **Approval flow** — form → pending card → review → approved with immutable audit trail.
13. **Forms KApp (right panel)** — AI-prefilled New Vendor Intake form.
14. **Base / Sheet KApps (right panel)** — Vendor Register (Base) and Budget Tracker (Sheet).
15. **AI Employee profile** — click *Kara Ops AI* in the sidebar for her profile + task queue.
16. **Workspace settings (modal)** — click the gear in the sidebar footer. Tabs: General / Privacy & AI / Connectors / AI Employees / Templates.

## Repository layout

```
.
├── PROPOSAL.md              # Product proposal (phases, features, use case, architecture)
├── README.md                # This file
├── LICENSE
├── desktop/                 # Desktop click-through demo
│   ├── index.html
│   ├── css/                 # variables, layout, sidebar, main-panel, right-panel,
│   │                        #   cards, modals, ai, components
│   ├── js/                  # app (state machine) + one module per feature area
│   │   ├── app.js           # state machine, routing, topbar, home, domain
│   │   ├── navigation.js    # sidebar
│   │   ├── chat.js          # channel view
│   │   ├── threads.js       # thread detail
│   │   ├── cards.js         # inline KApp cards
│   │   ├── kapps.js         # Tasks / Forms / Base / Sheet
│   │   ├── ai-actions.js    # action launcher / brief / processing / output
│   │   ├── ai-employees.js  # AI Employee profile + queue
│   │   ├── artifacts.js     # document artifact workspace
│   │   ├── approvals.js     # approval form + review
│   │   ├── settings.js      # workspace settings modal
│   │   ├── modals.js        # modal primitives
│   │   ├── transitions.js   # toasts + small animation helpers
│   │   ├── icons.js         # inline SVG icon library
│   │   └── demo-data.js     # pre-scripted users / channels / messages / KApps
│   └── assets/
│       ├── logos/kchat-logo.svg
│       ├── icons/
│       └── avatars/
├── mobile/                  # Reserved for future mobile demo
└── shared/                  # Reserved for future cross-surface primitives
```

## Design notes

- **Three-column layout**: sidebar (260px) + center (flexible) + right panel (380px, toggleable).
- **State lives in `app.js`**: one `state` object, one `navigateTo()` entry point; right-panel view is tracked separately from the center screen.
- **Inline SVG icons** (`js/icons.js`) keep the demo self-contained.
- **`desktop/js/demo-data.js`** is the single source of truth for all pre-scripted data — edit there to tweak content.
- The demo writes `lastScreen` to `localStorage` for refresh persistence. To reset, clear local storage or open in an incognito window.

## What this demo is not

- Not a real app — no API calls, no persistence, no auth.
- Not mobile — desktop only. Mobile is reserved as a future task.
- Not production code — intentionally framework-free for a fast click-through.

See [`PROPOSAL.md`](./PROPOSAL.md) for the production vision, phased build plan, and governance model.
