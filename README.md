# KChat B2B — AI Vision Board

Static click-through vision board for **KChat B2B** — enterprise messaging with on-device AI coworkers and native structured apps (KApps).

- **Proposal:** see [`PROPOSAL.md`](./PROPOSAL.md) for phases, features, use case flow, and architecture.
- **Desktop demo:** fully working static HTML/CSS/JS under [`desktop/`](./desktop/). No build tools, no frameworks, no server calls.
- **Mobile demo:** messaging-first click-through under [`mobile/`](./mobile/) — see [`mobile/README.md`](./mobile/README.md). Reuses the desktop demo data and icons via ES module relative imports.
- **Shared:** design tokens at [`shared/design-tokens.json`](./shared/design-tokens.json).
- **Progress log:** see [`PROGRESS.md`](./PROGRESS.md) for the change log (current: v0.6 Mobile click-through).

> **Core Intents.** Every AI action is organized under four verbs so
> users don't have to know which *kind* of AI they want before picking a
> task:
> - **Create** — Document · Slides · Sheet · Schedule · PRD · QBR · SOP · Proposal · Form
> - **Analyze** — Summarize · Extract · Compare · Report · Spreadsheet AI
> - **Plan** — Tasks · Project Plan · Agenda · Risk Register · Budget
> - **Approve** — Purchase · Exception · Policy · Budget
>
> Each tile carries a small mode badge — **Auto** (AI Employee runs it
> in the queue) or **Inline** (AI Co-pilot assists you in the editor).
> Both modes are first-class in Doc, Slides, and Sheet surfaces.

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

## Run the mobile demo locally

The mobile click-through reuses the same demo data, so it must be served from the **repo root** (not `mobile/`) so that `mobile/js/*.js` can import from `../desktop/js/`.

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000/mobile/index.html
```

For the best feel, use Chrome DevTools' device toolbar and pick **iPhone 14 Pro** (390 × 844). The demo is fluid up to 428px wide and gracefully scales down on smaller phones. See [`mobile/README.md`](./mobile/README.md) for the click-through guide.

## Click-through guide (18 screens + onboarding)

The demo is a state machine. `desktop/js/app.js` controls which `<section data-screen="...">` is visible. You can click through the whole story in order:

1. **Login / workspace select** — click *Continue*.
1a. **Guided onboarding tour (first visit only)** — a 5-step overlay walks through sidebar domains, channels, AI Employees, the compose bar, and the right panel. Completion is stored in `localStorage` under `kchat.onboarded`; clear local storage to see it again.
2. **Workspace home** — hero, then the **Core Intents** row (Create / Analyze / Plan / Approve — each card opens the Action Launcher scrolled to that intent), then a "Your workspace" row (Inbox / My Tasks / Approvals / Templates with live counts), then domain cards, recent channels, pinned items.
3. **Domain view** — channel list for the domain. Click `#vendor-management`.
4. **Channel chat** — 3-column layout. Hover a message for action icons. Click `+` in the compose bar for the Action Launcher.
5. **Thread detail** — click *Open Thread* on any message; use the thread action bar (Extract Tasks / Summarize / Draft Doc / Create Approval).
6. **Action Launcher (modal)** — intent-organized actions (Create / Analyze / Plan / Approve) with a pill filter bar and a per-tile **Auto / Inline** mode badge. Pick *Create → PRD*.
7. **Guided intake / brief builder (right panel)** — goal, audience chips, sources, template, tone, missing info, compute-mode privacy review.
8. **AI processing (right panel)** — 4-step animation (Reading sources → Planning outline → Drafting sections → Ready for review). Auto-advances to output review.
9. **AI output review (right panel)** — draft PRD with citations, per-section confidence, sources. Click *Edit in Workspace*.
10. **Document artifact workspace (center)** — outline nav, editable sections, version history, *Publish* (confirmation modal). Also home to the **Document Co-pilot**: select any paragraph to surface the floating **Rewrite / Shorten / Expand / Tone / Translate** toolbar, press **Tab** on the ghost-autocomplete hint to accept a suggestion, or use the **"Ask AI about this document"** chat under the Compute card in the right aside.
11. **Slide workspace (center)** — new *slide-workspace* screen. Left rail of slide thumbnails, large center canvas, right rail of **per-slide AI actions** (Simplify slide, Add chart placeholder, Generate speaker notes, Suggest layout). The header's **Design with AI** dropdown applies consistent theme / transitions / narrative reorder. Entered via the *Deck* action in the launcher or the *Design a deck* quick action on home.
12. **Task KApp (right panel)** — list / Kanban toggle, AI-extracted badge, task detail.
13. **Approval flow** — form → pending card → review → approved with immutable audit trail.
14. **Forms KApp (right panel)** — AI-prefilled New Vendor Intake form.
15. **Base / Sheet KApps (right panel)** — Vendor Register (Base) and Budget Tracker (Sheet). The Sheet now carries the **Sheet Co-pilot**: an **AI formula bar** at the top (try *"total variance"*, *"over budget"*, *"Logistics"*, *"highest"*), a **Visualize** button that renders an inline variance bar chart, **AI explain** popovers on any Variance cell, and a hover **AI icon on each column header** with Summarize / Detect anomalies / Categorize.
16. **AI Employee profile** — click *Kara Ops AI* in the sidebar for her profile + task queue.
17. **Workspace settings (modal)** — click the gear in the sidebar footer. Tabs: General / Privacy & AI / Connectors / AI Employees / Templates.

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

## UX considerations

The v0.2 "UX audit" pass (see [`PROGRESS.md`](./PROGRESS.md)) adds the following so the demo is approachable by mass SME office workers, not just power users:

- **Guided onboarding** — 5-step overlay tour on first visit (`desktop/js/onboarding.js`).
- **Role-based quick actions on home** — approvals / tasks / draft / inbox cards with live counts.
- **Simplified Action Launcher** — channel-aware "Suggested for you" + "Recently used" surface common tasks before the full grouped grid.
- **Approval confirmation dialog** — Approve / Deny requires a second, explicit click before the audit trail is sealed.
- **Contextual help on template intake** — Goal / Audience / Tone / Scope / Deadline fields carry italic guidance.
- **Empty states** — Tasks, Forms, Base columns, and Channel Knowledge all have helpful empty/first-run states with next-action CTAs.
- **Priority inbox** — notifications split into "Action required" (unread approvals + mentions) and "Updates", with a warning-color left border on high-priority items.
- **Accessibility** — larger touch targets in the sidebar and hover actions, shape prefixes (▲ / ◆ / ▽, ○ / ◐ / ● / ⊘) on risk and status pills so state is not color-only, and `role` / `aria-label` attributes on all major landmarks.
- **Glossary tooltips** — "On-device AI", "Compute mode: on-device", "Egress", "PII tokenization" carry hover tooltips so non-technical users aren't gated by jargon.
- **Expandable right panel** — Tasks / Base / Sheet views now have an expand button that hides the chat column for focused KApp work.

### Segment suitability

| Segment         | Biggest wins |
|-----------------|------------------------------------------------------|
| Finance         | Approval confirmation, priority inbox, glossary tips |
| HR              | Priority inbox, quick actions, empty states          |
| Sales           | Channel-aware launcher suggestions, quick actions    |
| Ops             | Expandable right panel, empty states, base tooltips  |
| Compliance      | Confirmation dialog, status/risk pill prefixes       |
| Non-technical   | Onboarding tour, glossary tips, intake help text     |

## Design notes

- **Three-column layout**: sidebar (260px) + center (flexible) + right panel (380px, toggleable). Right panel can **expand to full width** for focused KApp work.
- **State lives in `app.js`**: one `state` object, one `navigateTo()` entry point; right-panel view is tracked separately from the center screen.
- **Inline SVG icons** (`js/icons.js`) keep the demo self-contained. Icon semantics are intentional — `shield` is reserved for privacy/security; `inbox` is used for notifications.
- **`desktop/js/demo-data.js`** is the single source of truth for all pre-scripted data — edit there to tweak content.
- The demo writes `lastScreen` and `kchat.onboarded` to `localStorage`. To reset (replay onboarding, clear last screen), clear local storage or open in an incognito window.
- **Confirmation dialogs** on destructive / immutable actions (approvals, publish) are always a second explicit step.
- **Notifications** are priority-grouped: "Action required" (unread approvals + mentions) and "Updates".

## What this demo is not

- Not a real app — no API calls, no persistence, no auth.
- Not mobile — desktop only. Mobile is reserved as a future task.
- Not production code — intentionally framework-free for a fast click-through.

See [`PROPOSAL.md`](./PROPOSAL.md) for the production vision, phased build plan, and governance model.
