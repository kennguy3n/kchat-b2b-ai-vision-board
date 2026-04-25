# KChat B2B — Mobile Click-Through

A pure static HTML/CSS/JS click-through that retells the desktop vision board's KChat B2B product story with **mobile-native** UX patterns. Inspired by Slack mobile and Lark mobile: bottom tab bar, single-column screens, push/pop view stacks, bottom sheets for contextual actions, and thumb-zone-friendly touch targets.

The mobile demo **does not duplicate any data**. It imports the desktop demo's exports — `desktop/js/demo-data.js`, `desktop/js/icons.js`, `desktop/js/cards.js`, `desktop/css/cards.css`, `desktop/css/variables.css` — via ES module relative paths (`../desktop/js/`). That's why the mobile shell must be served from the repo root.

## Run

```bash
# from the repo root (NOT from mobile/)
python3 -m http.server 8000
# then open http://localhost:8000/mobile/index.html
```

For the best fidelity, open Chrome DevTools, toggle the device toolbar, and pick **iPhone 14 Pro** (390 × 844) or **iPhone 14 Pro Max** (428 × 926). The shell is fluid between 320px and 428px wide.

## What's different from desktop

- **Messaging-first.** The default landing tab is **Chat** (channel list), not a workspace dashboard. The home screen / domain dashboards / workspace landing pages are **intentionally absent** — opening the app drops you straight into your conversations, exactly like Slack mobile and WhatsApp.
- **5-tab bottom navigation.** Chat / AI / Inbox / Activity / Me. Unread badges appear on Chat (unread channel count) and Inbox (action-required count).
- **Single-column screens.** No 3-column grid, no side panels, no sidebar. The desktop's right-panel surfaces (brief / processing / output / approval / task panel / AI employee) become **full-screen pushed views** in their own navigation stack.
- **Per-tab navigation stacks.** Each tab keeps its own push/pop history; switching tabs preserves where you were.
- **Bottom sheets for context actions.** The Action Launcher invoked from the chat compose bar slides up as a half-sheet; from the AI tab, it's the full-screen root.
- **Inline KApp cards.** Artifact / approval / task-list / email / deal / calendar cards reuse `desktop/js/cards.js` directly, with the desktop's `desktop/css/cards.css` chrome and a `max-width: 100%` mobile override so they fit a phone column.
- **No onboarding tour, no template gallery, no slide / sheet / artifact workspaces, no settings modal.** Those are desktop-only flows. On mobile the surface focuses on the *messaging-first* loop: discuss in chat → invoke AI → review draft → approve → done.

## Screens (12)

| # | Screen | Tab | Pushed from |
|---|--------|-----|-------------|
| 1 | Channel list (root) | Chat | — |
| 2 | Channel chat | Chat | tap a channel |
| 3 | Thread detail | Chat | tap *Thread* on a message |
| 4 | AI Action Launcher (root) | AI | — |
| 5 | Brief Builder | AI | tap a Create action |
| 6 | AI Processing | AI | tap *Generate Draft* |
| 7 | AI Output Review | AI | auto after Processing |
| 8 | Inbox | Inbox | — |
| 9 | Activity | Activity | — |
| 10 | Me | Me | — |
| 11 | Tasks (+ Task Detail) | any | thread chip / Me / inline card |
| 12 | Approval Review | any | Inbox / inline card / thread |
| — | AI Employee profile | any | Me strip / chat author |

(Tasks counts as one screen + a pushed detail view; AI Employee is a pushed view from the Me tab strip or any chat author tap.)

## Click-through happy path

1. Open the app → **Chat tab** with an Unreads section at the top, then domain-grouped channels and DMs.
2. Tap **#vendor-management** → channel chat with messages, attachments, AI suggestion pills, and inline KApp cards (Vendor Renewal Checklist artifact, 5-task list, Orbix payment-hold approval, calendar reminder).
3. Tap a message → the message-action bar appears with **Reply / Thread / Task / AI**. Tap **Thread** to push the Thread Detail view.
4. In Thread Detail, tap the **5 Tasks** chip → Tasks full-screen list. Back twice to the channel.
5. Tap the AI sparkle in the **compose bar** → the Action Launcher slides up as a bottom sheet with channel-aware suggestions on top and the full action grid below. Pick **PRD** → Brief Builder → tap **Generate Draft** → Processing animation auto-advances → AI Output Review with sections, citations, and per-section confidence.
6. Back to the channel, scroll to the **Orbix payment hold approval** card and tap **Review** → Approval Review with audit trail. Tap **Approve $42,500** → toast + audit trail updates inline.
7. Tap **Inbox tab** → priority-grouped notifications; the *Action required* section surfaces unread approvals + mentions.
8. Tap **AI tab** → the Action Launcher as a full-screen root with intent filter pills (All / Create / Analyze / Plan / Approve) and 2-column action grid.
9. Tap **Me tab** → profile, AI Employee chips horizontal scroll, quick actions, **Communities** list (tenant switcher).
10. Tap **Kara Ops AI** → AI Employee profile with allowed channels, monthly budget bar, cooldown state, task queue.
11. Back to Me → tap **Globex Partners** → workspace switches, toast confirms.

## Folder layout

```
mobile/
├── index.html              # Single shell with all screen <section>s
├── css/
│   ├── variables.css       # Mobile layout tokens (inherits color tokens from desktop)
│   ├── layout.css          # Phone shell, top bar, content stack, sticky footer
│   ├── tabs.css            # Bottom 5-tab bar with unread badges
│   ├── components.css      # Pills, badges, avatars, list rows, status pills, mention
│   ├── chat.css            # Channel list, channel chat, compose bar, message action bar, typing
│   ├── thread.css          # Thread detail header, linked chips, action bar
│   ├── ai.css              # Suggestion cards, action grid, brief form, processing, output
│   ├── kapps.css           # Tasks, task detail, approval review, AI employee profile
│   ├── inbox.css           # Inbox kind icons + action-required banner
│   ├── activity.css        # Activity timeline rows
│   ├── profile.css         # Me hero, AI strip, communities list
│   └── transitions.css     # Push/pop screen animation, bottom sheet slide-up, toast
├── js/
│   ├── app.js              # State machine, per-tab nav stacks, screen routing
│   ├── navigation.js       # Top bar (back + title) and bottom tab bar rendering
│   ├── channels.js         # Channel list + channel chat + message action bar
│   ├── thread.js           # Thread detail
│   ├── ai-actions.js       # Action Launcher (full-screen + bottom-sheet) + brief + processing + output
│   ├── kapps.js            # Tasks, task detail, approval review, AI employee profile
│   ├── inbox.js            # Inbox tab
│   ├── activity.js         # Activity tab
│   ├── profile.js          # Me tab
│   ├── sheets.js           # Bottom sheet primitive
│   └── transitions.js      # Toast + push/pop animation helpers
└── assets/                 # Symlink → ../desktop/assets (logos)
```

## State + persistence

- One `state` object in `mobile/js/app.js` with a per-tab `tabStacks` map. `navigate(screen, params)` pushes onto the active tab's stack; `back()` pops; `switchTab(tabId)` restores the top of the destination tab's stack.
- `localStorage` key: `kchat.mobile.lastScreen` — stores the active tab, all tab stacks, and the current tenant. Reload to restore your spot.
- The desktop `kchat.lastScreen` key is left untouched; the two demos persist independently.

## Implementation notes

- **No frameworks, no build tools.** Plain ES modules. The `<script type="module">` tag in `index.html` is the only entry point.
- **Inline KApp cards** are rendered by importing `renderCard` from `../desktop/js/cards.js` directly. The desktop's `cards.css` is included as-is and a `max-width: 100% !important` mobile override in `mobile/css/chat.css` lets cards fill the phone column.
- **Icons** are rendered via `iconSvg(name, size)` from `../desktop/js/icons.js`.
- **AI processing** is simulated client-side: a 4-step animation auto-advances and then `replaceCurrent()`s the stack entry with the Output Review screen so the back button returns to the Brief Builder, not back to a stale processing screen.
- **Approvals** mutate the same `D.approvals` map the desktop uses, so an approve on mobile will (until the page reloads) reflect in the audit trail. They're not persisted because the demo data is module-scoped.
- **Safe areas** — the bottom tab bar adds `env(safe-area-inset-bottom)` padding so the home-indicator doesn't overlap.
- **Accessibility** — every interactive element is at least 44px tall (Apple HIG), tab buttons use `role="tablist"` / `role="tab"` / `aria-selected`, and the bottom sheet sets `aria-modal="true"` while open.
