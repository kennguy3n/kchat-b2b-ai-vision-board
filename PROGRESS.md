# KChat B2B — Progress Log

A running log of meaningful changes to the vision board prototype under
`desktop/` and (as of v0.6) `mobile/`. Each entry names the release, the
audit findings it addresses, and which SME segments benefit most from the
changes.

---

## Mobile — B2C-Mirrored Rebuild (v0.7)

**Goal:** Rebuild the mobile click-through so it **mirrors the B2C prototype's
exact 5-tab shell** (Message · Notification · Tasks · Settings · More) while
surfacing **B2B content** (workspaces, Core Intents, AI Employees, approvals,
compute-mode badges). The app is the same structure — only the features differ
depending on the tenant (community is a tenant construct).

### Why

The previous v0.6 mobile effort invented its own 5-tab shape (Chat / AI /
Inbox / Activity / Me) with ES-module imports from `desktop/js/`. Shipping a
second, divergent shell fragments engineering: every B2C mobile fix would
need a manual reapplication. This rebuild re-uses B2C's tab IDs, labels,
icons, `onTabClick` switch, `updateTabs` map, and CSS variable *names* so
future consumer-side fixes drop into B2B unchanged.

### Changes

- [x] **Pure static HTML/CSS/JS under `mobile/`** — no build tools, no
      frameworks, no ES modules. A single `window.KDATA` in `js/data.js`
      holds all demo content; `js/simulate-ai.js` is copied verbatim from
      the B2C prototype.
- [x] **5-tab bottom bar identical to B2C** — same `data-tab` IDs
      (`chats` · `notifications` · `tasks` · `settings` · `more`), same
      labels (Message · Notification · Tasks · Settings · More), same
      icons (💬 🔔 📅 ⚙ ···), same red-pill badge pattern, same
      `KApp.onTabClick(tab)` switch.
- [x] **B2B content mapped into the B2C tabs**
  - **Message** → workspace home (tenant switcher, Core Intents row),
    channel list, channel chat with inline AI/approval/email cards,
    thread detail, action launcher, brief builder, AI processing, AI
    output review, artifact workspace.
  - **Notification** → priority-grouped inbox (Action Required /
    Updates) covering approvals, AI completions, mentions, calendar,
    email.
  - **Tasks** → task list with AI-extracted badges + segmented control
    toggling **Approvals**.
  - **Settings** → **AI Employees** as a prominent top group (Kara Ops,
    Mika Sales, Nina PM, Hana HR, Finn Finance), AI Memory, Compute
    Transparency, Connectors, Workspace, Preferences.
  - **More** → Ask KChat AI, AI Insights, Metrics Dashboard, Template
    gallery, Packaging & Tiers, KApps (Form / Base / Sheet), Connectors.
- [x] **B2B CSS tokens under B2C variable names** — `--k-primary:
      #6366F1`, `--k-accent: #8B5CF6`, `--k-ai: #8B5CF6`, etc. so the
      shared `components.css` works unchanged but the palette comes from
      the B2B desktop variables.
- [x] **25 screens** across 3 phases (see `mobile/README.md`).
- [x] **3 guided demo paths** — Vendor Review Week, Draft a PRD with
      Nina, AI Employee Check-in with Kara. Each step deep-links a
      screen plus a hint toast.
- [x] **AI simulation via `KAI.processInto`** on `ai-processing`,
      `ai-output-review`, `approval-review`, `ai-employee-detail`, and
      `task-detail` screens. Privacy strip (compute-mode badge) on every
      AI result.
- [x] **Tab bar visibility** mirrors B2C: visible on primary screens
      (home, channel-list, channel-chat, notifications, task-list,
      settings, more, connectors), hidden on deep flows (threads,
      approvals, AI processing, AI output, artifact workspace, brief
      builder, bottom sheets).
- [x] **README at `mobile/README.md`** documenting the architecture,
      run command, tab mapping, screen inventory, and demo paths.

### Segments that benefit most

- **Operations (Kara, Mira, Sofia, Dan)** — vendor-review flow, approval
  audit trail, thread task extraction on mobile.
- **Product (Nina, Ken)** — Draft-a-PRD flow all the way through artifact
  workspace.
- **Platform / IT** — compute-mode transparency screen and
  per-AI-employee budget caps are browsable on the phone.

---

## Mobile Click-Through (v0.6 — superseded by v0.7)

**Goal:** Retell the same KChat B2B product story on a phone with
**mobile-native** UX patterns. The desktop demo's home / domain dashboards
are intentionally absent — the mobile app is **messaging-first**, opening
straight into the channel list (Slack mobile / WhatsApp pattern). Every
desktop right-panel surface (brief / processing / output / approval / task
panel / AI employee) is reframed as a full-screen pushed view in a
per-tab navigation stack.

### Changes

- [x] **Pure static HTML/CSS/JS under `mobile/`** — no frameworks, no
      build tools. Reuses `desktop/js/demo-data.js`, `desktop/js/icons.js`,
      `desktop/js/cards.js`, and `desktop/css/cards.css` via ES module
      relative imports (`../desktop/js/`). Served from the repo root.
- [x] **5-tab bottom navigation** — Chat / AI / Inbox / Activity / Me.
      Unread badges on Chat (unread channel count) and Inbox
      (action-required count). Per-tab navigation stacks with
      back-button push/pop animations and `localStorage` persistence
      under `kchat.mobile.lastScreen`.
- [x] **Chat tab is the root** — channel list with an Unreads section,
      domain-grouped channels, DMs, last-message preview, and unread
      counts. No separate "Home" tab.
- [x] **Channel chat with mobile-width KApp cards** — desktop's
      `renderCard` reused as-is; cards reflow to the phone column. Tap
      any message to surface a **Reply / Thread / Task / AI** action
      bar (mobile equivalent of desktop hover actions). Pinned compose
      bar at bottom with attach / input / AI sparkle / send.
- [x] **Thread Detail** as a pushed view — flat message list, linked
      object chips at the top (5 Tasks, 1 Approval, etc.), and a
      thread action bar at the bottom (Extract Tasks / Summarize /
      Draft Doc / Create Approval).
- [x] **AI Action Launcher in two modes** — full-screen embedded as
      the AI tab root (intent filter pills, channel-aware suggestions,
      2-column action grid grouped by Create / Analyze / Plan /
      Approve), and as a bottom sheet when triggered from the chat
      compose bar's sparkle button.
- [x] **Brief Builder → Processing → Output Review** flow as a
      3-screen push stack — same fields and 4-step animation as
      desktop, with sticky footers for the primary CTAs (*Generate
      Draft*, *Edit in Workspace* / *Publish to Channel*).
- [x] **Inbox tab** with priority grouping (Action required vs.
      Updates), kind filter pills (All / Mentions / Approvals / AI
      Updates), and routing back into the originating channel,
      thread, approval, or AI output.
- [x] **Activity tab** as a chronological timeline of channel
      activity + AI employee state changes. Simpler than Inbox — just
      the feed.
- [x] **Me tab** consolidating profile, workspace summary, AI
      Employees horizontal scroll, **My Tasks** / **My Approvals**
      quick actions, and the **Communities** tenant switcher (replaces
      the desktop's far-left tenant rail).
- [x] **KApps as full-screen pushed views** — Tasks list with status
      filter + Task Detail, Approval Review with audit trail and
      stacked Approve / Deny CTAs (2-step confirmation), AI Employee
      profile with allowed channels, monthly budget bar, cooldown
      state, and task queue.
- [x] **Touch-target and safe-area hygiene** — every interactive
      element is at least 44px tall, tab bar respects
      `env(safe-area-inset-bottom)`, top bar reserves 28px for the
      status bar so the demo also looks right inside the iOS notch
      area.

### What's NOT on mobile (by design)

- No onboarding tour, no template gallery, no slide / sheet / document
  artifact workspaces, no settings modal, no channel knowledge panel.
  The desktop demo retains all of those; mobile stays focused on the
  messaging-first loop (discuss → invoke AI → review → approve).

### Files

- `mobile/index.html`, `mobile/css/*` (12 stylesheets), `mobile/js/*`
  (11 modules), `mobile/assets/` symlink to `desktop/assets/`.
- New documentation: `mobile/README.md` (click-through guide,
  architecture, screen index). Root `README.md` gains a *Run the
  mobile demo* section.

### SME alignment

- **Asset-light SMEs (sales, services, ops):** Same lightweight loop
  on the go — read the channel, invoke AI from compose, approve from
  Inbox, switch tenants from Me. No desktop required.
- **Asset-heavy SMEs (manufacturing, logistics, distribution):**
  Approval Review with audit trail and 2-step Approve / Deny is fully
  usable from a phone, so floor managers and field teams can clear
  the approval queue without going back to a workstation.

---

## Integrated Workspace — Email, Calendar, Drive, Business (v0.5)

**Goal:** Subtly blend email (KMail), calendar, document management (ZK
Drive), and business apps (Kapp) into the messaging-first experience —
not as standalone features but as contextual, AI-enabled surfaces that
appear where work happens. Every surface stays scoped to the current
channel so the thread remains the unit of work.

### Changes

- [x] **Email-in-chat cards with AI summaries** — new `emailCard`
      renderer in `cards.js`; inbound emails appear as inline chat
      cards with `aiSummary`, privacy badge, attachment count, and a
      "Reply from chat" affordance that drafts in the same channel.
- [x] **Calendar right-panel with AI scheduling suggestions** —
      `renderCalendarPanel` in new `js/integrations.js` shows a
      channel-scoped week view; each event carries an AI note, and
      the "+ Schedule" CTA simulates an AI-availability check.
- [x] **ZK Drive file panel scoped to channel folders** —
      `renderDrivePanel` lists `driveFiles[channelId]` with type icon,
      modified-by avatar, "AI generated" / "From email" badges, and a
      "ZK Object Fabric" encrypted-upload affordance at the bottom.
- [x] **Business record cards (CRM deals, invoices, alerts)** —
      `dealCard` inline in chat plus a channel-scoped `renderBusinessPanel`
      grouping Deals / Invoices / Alerts (collapsible) with health dots
      and AI insights.
- [x] **Channel context bar showing connected services** — slim row
      under the channel header in `chat.js` rendering only the
      indicators that have data: "✉ N threads", "📅 Next: …", "📁 N
      files", "💼 N deals". Each indicator routes to the matching
      right panel.
- [x] **Unified inbox merging email, calendar, chat, approvals** —
      `notifications.js` now renders `email`/`calendar` kinds with
      distinct icon labels and routes clicks back into the originating
      channel + right panel; email/calendar items with
      `priority: "action"` join the "Action required" rail.
- [x] **Enhanced Action Launcher with cross-service AI actions** —
      `CHANNEL_SUGGESTIONS` in `ai-actions.js` grew context-aware
      tiles per channel ("Summarize Orbix email", "Schedule vendor
      review", "Attach risk matrix from Drive", "Prepare QBR from
      CRM", "Follow-up email to Globex"). New Core Intent actions
      (`create-email`, `plan-meeting`, `analyze-deal`) are wired
      through the same `routeAction` dispatcher.
- [x] **Compose bar with Drive attach and calendar availability** —
      two new subtle buttons in `chat.js` compose box: 📁 opens
      `rp-drive`, 📅 toasts an inserted availability block.
- [x] **Home screen "Connected workspace" ambient status row** —
      `renderWorkspaceHome()` adds a muted 4-card row (Email,
      Calendar, Drive, Business) between "Your workspace" and
      "Domains"; each tile deep-links into #vendor-management plus
      the matching right panel.
- [x] **Sidebar channel indicators for email / calendar / files** —
      `navigation.js` renders a tiny ✉ / 📅 / 📁 count row below
      channel names, only when the channel has linked data, so it
      reads as metadata rather than another nav destination.

### Design constraints held

- No new top-level navigation. Email/Drive/Business never appear as
  tabs — everything surfaces through existing card, right-panel,
  compose, launcher, and notification patterns.
- AI is the connective tissue: every integration point has an AI
  angle (email summaries, scheduling, drive recommendations, deal
  insights, CRM-driven QBR).
- Privacy-first: every email card, drive file, and drive panel shows
  the privacy / encryption mode via the shared `.privacy-badge`
  style.
- Subtle, not loud: integration chrome uses `var(--text-muted)`,
  `var(--fs-xs)`, and existing color tokens — no new accent colors.
- Channel-scoped: email threads, calendar events, drive folders, and
  CRM records are all keyed to `channelId`, reinforcing the
  thread-as-unit-of-work principle.
- No framework changes: new `integrations.js` follows the same ES
  module pattern as `kapps.js` / `artifacts.js`.

---

## Core Intents taxonomy + multi-tenant rail (v0.4)

**Goal:** flatten the growing surface area of AI actions into a single
**intent-first** taxonomy (Create / Analyze / Plan / Approve) so users
don't have to know whether they want an "AI Employee" or an "AI Co-pilot"
to find what they need; and align the shell with KChat's
multi-community pattern (far-left tenant rail → sidebar → main).

### Changes

- [x] **1. Core Intents data model** — new `coreIntents` export in
      `desktop/js/demo-data.js` with four buckets (Create / Analyze /
      Plan / Approve). Each action carries a `mode` hint (`auto` = AI
      Employee queue, `inline` = AI Co-pilot edit-in-place) and a short
      `sub` caption. `actionGroups` is kept as a legacy alias derived
      from `coreIntents`.
- [x] **2. Home — Core Intents row** — `renderWorkspaceHome()` replaces
      the separate "AI Employee" + "AI Co-pilot" strips with a single
      4-card Core Intents row (gradient cards with peek of top tiles).
      A secondary "Your workspace" row keeps fast access to Inbox /
      Tasks / Approvals / Templates with live counts.
- [x] **3. Action Launcher — intent-first layout** — `openActionLauncher()`
      now renders the four intents as collapsible groups with a pill
      filter bar ("All · Create · Analyze · Plan · Approve"). Tiles
      carry an **Auto** / **Inline** mode badge. The old
      "AI Employee" / "AI Co-pilot" sub-labels are gone; the taglines
      up top explain the distinction once: "Pick what you want to do —
      AI decides whether an Employee runs it or a Co-pilot assists
      inline." Intent cards on Home open the launcher pre-scrolled to
      that intent via a new `{ intent }` param.
- [x] **4. Routing consolidation** — `wireLauncherEvents` now delegates
      to a single `routeAction(id, opts)` function so every entry point
      (launcher tile, recent chip, home intent card, channel
      suggestion) lands on the same surface for a given action id.
      Added routing for `create-schedule` (toast placeholder) and the
      inline `copilot-sheet-analyze` alias.
- [x] **5. CSS** — new `.intent-cards` / `.intent-card` styles in
      `components.css`; `.intent-tabs` / `.intent-tab` pill filter;
      `.mode-badge.mode-auto` / `.mode-badge.mode-inline` in `ai.css`.
      Removed the obsolete `.launcher-modes`, `.copilot-group`,
      `.copilot-tile`, and `.quick-actions-copilot` rules.
- [x] **6. Multi-tenant rail (earlier in v0.4)** — new far-left
      `tenant-rail.css` + `renderTenantRail()` in `navigation.js`; each
      tenant has domains / channels / AI employees filtered via
      `state.tenantId`. Topbar shows the active tenant name.
- [x] **7. Docs** — PROPOSAL §5.7 reframed as *Core Intents — the
      user-facing taxonomy*, with §5.7.1 keeping the inline co-pilot
      detail. README banner + click-through guide updated for the
      intent row and launcher filter bar.

### What's next

- Surface Core Intents in the sidebar `+ New` menu (quick intent
  selector before the launcher opens).
- Pipe channel-aware "suggested" tiles onto the matching intent tab
  by default so the user lands on the most relevant verb.
- Per-tenant theming of the intent cards (community accent color
  bleeds into the Home gradient).

---

## AI Co-pilot Layer (v0.3)

**Goal:** balance the existing autonomous *AI Employee* chrome with an
inline, human-driven *AI Co-pilot* layer on the three work surfaces that
knowledge workers actually live inside — **Document, Slides, Sheet** —
while keeping the demo pure static HTML/CSS/JS.

> **AI Employee = "AI does it for you"** (autonomous, queued, governed)
> **AI Co-pilot = "AI helps you do it"** (inline, real-time, human-driven)
>
> Both are now first-class in the vision board.

### Changes

- [x] **1. Document Co-pilot** — enhanced `desktop/js/artifacts.js`:
      floating **selection toolbar** (Rewrite / Shorten / Expand / Change
      tone / Translate) that swaps the selected text with a pre-scripted
      alternative + pulse animation; **ghost autocomplete** block at the
      end of each section with Tab-to-accept; **"Ask AI about this
      document"** chat placed below the Compute card in the right aside,
      with pre-scripted prompts.
      *Surfaces:* PRDs, SOPs, any artifact workspace.
- [x] **2. Slides Co-pilot** — new `desktop/js/slides.js` +
      `slide-workspace` screen in `desktop/index.html`. Three-column
      editor (thumbnail rail / canvas / AI panel). Per-slide AI actions
      (Simplify slide, Add chart placeholder, Generate speaker notes,
      Suggest layout); a **Design with AI** dropdown in the header
      (consistent theme, transitions, narrative reorder). The QBR
      artifact now carries a `slides[]` array in `demo-data.js`.
      *Surfaces:* QBR / EBR decks, customer reviews.
- [x] **3. Sheet Co-pilot** — enhanced `renderSheet()` in
      `desktop/js/kapps.js`: **AI formula bar** above the table with
      NL-to-formula suggestions + insert action; **cell-level AI** popover
      on any Variance cell explaining the computation; hover **AI icon
      per column header** → Summarize / Detect anomalies / Categorize
      menu; **Visualize** button renders an inline CSS bar chart; NL
      queries highlight matching rows (e.g. "over budget" → rows with
      positive variance).
      *Surfaces:* Budget tracker, any tabular KApp.
- [x] **4. Rebalanced Action Launcher** — `desktop/js/ai-actions.js` now
      surfaces a dedicated **Co-pilot** group between "Suggested for you"
      and "All actions" with three tiles (Write with AI / Design slides /
      Analyze a spreadsheet). Channel suggestions include one co-pilot
      option alongside the recipe option. Top mode badges + glossary
      tooltips make the Employee/Co-pilot distinction explicit. Launcher
      routes co-pilot tiles to the correct target screen.
- [x] **5. Home quick-actions row** — `renderWorkspaceHome()` now shows
      two rows: the existing "AI Employee" cards (approvals / tasks /
      draft / inbox) and a new "AI Co-pilot" row (Write a document /
      Design a deck / Analyze a spreadsheet). The rows carry sub-labels
      so the distinction is visible at a glance.
- [x] **6. Demo data** — `desktop/js/demo-data.js` gained `slides[]` on
      `a-qbr-globex`, plus new `docCopilotSuggestions` (rewrite / shorten
      / expand per section heading) and `sheetCopilotData`
      (formulaSuggestions, columnInsights, nlQueries). Added a
      `Budget Analysis` template of kind `sheet`.
- [x] **7. CSS** — `desktop/css/ai.css` gained a co-pilot accent palette
      and styles for the selection toolbar, ghost autocomplete, doc
      chat, AI formula bar, cell popover, column AI menu, NL row
      highlights, inline bar chart, co-pilot tiles in the launcher, and
      the full slide-workspace layout.
- [x] **8. Documentation** — README click-through guide expanded to
      describe the new Document / Slides / Sheet co-pilot behaviours and
      the new `slide-workspace` screen. PROPOSAL gained section **5.7
      AI Co-pilot Layer** alongside the AI Employee fabric.

### What's next

- Wire a real brief → draft handoff so a Brief in the launcher can
  land the user directly in Document / Slide co-pilot with the draft
  pre-populated.
- Voice-driven cell edits in the Sheet co-pilot (mic button next to the
  formula bar).
- Mobile click-through in `mobile/` with co-pilot-first ergonomics.

---

## UX Audit & SME Suitability Pass (v0.2)

**Goal:** make the click-through demo usable end-to-end by mass SME office
workers across Finance, HR, Sales, Ops, Compliance, and non-technical
segments — without introducing frameworks or build tooling.

### Changes

- [x] **1. Guided onboarding overlay** — new `desktop/js/onboarding.js`
      module. First visit shows a 5-step tour (Sidebar domains → Channels →
      AI Employees → Compose bar → Right panel). Keyboard-navigable, stores
      completion in `localStorage` under `kchat.onboarded`, skip button
      always visible.
      *Addresses:* onboarding gap, non-technical users.
- [x] **2. Role-based quick actions on Home** — `renderWorkspaceHome()` now
      shows four contextual cards between hero and domains: "Review pending
      approvals", "Check my tasks", "Draft a document", "View inbox". Each
      carries a live count pulled from demo data and routes into the right
      screen + right panel.
      *Addresses:* Finance, Sales, Ops — gets users to their daily task in
      one click.
- [x] **3. Simplified Action Launcher** — `openActionLauncher()` now shows
      "Suggested for you" (3 channel-aware suggestions) and "Recently used"
      chips above the full grouped grid under an "All actions" divider.
      *Addresses:* non-technical users, AI jargon barrier.
- [x] **4. Approval confirmation dialog** — `renderApprovalReview()` no
      longer commits on the first click. Approve/Deny replace the footer
      with an inline `role="alertdialog"` confirmation that restates the
      title + amount and flags the action as immutable. Second click seals
      the audit trail.
      *Addresses:* Finance, Compliance — approval safety.
- [x] **5. Contextual help on template intake** — `renderField()` in
      `templates.js` now emits a `.ti-help` italic hint below the label
      for Goal / Audience / Tone / Scope / Deadline / Success-metric
      fields.
      *Addresses:* non-technical users — first-time drafters need examples.
- [x] **6. Empty states for KApp views** — new `renderEmptyState()` helper
      in `kapps.js`; `renderTaskPanel()` uses it when no tasks exist;
      `renderForm()` explains what happens after submission; `renderBase()`
      gets column-header tooltips; `renderKnowledge()` gets a proper empty
      state with "Rebuild now" + "Learn more".
      *Addresses:* first-run empty channels, non-technical users.
- [x] **7. Icon semantics** — `inbox`, `bell`, `expand`, `collapse` icons
      added to `icons.js`. Topbar inbox button + sidebar inbox entry now
      use the inbox icon instead of the shield (shield is reserved for
      privacy/security contexts).
      *Addresses:* general clarity.
- [x] **8. Notification priority grouping** — `renderNotifications()` now
      splits the all-view into "Action required" (unread approvals +
      mentions) and "Updates". Action-required items carry a warning-color
      left border. Filtered views remain flat so the filter intent is clear.
      *Addresses:* Finance, HR, Sales — prevents missed approvals/mentions.
- [x] **9. Accessibility improvements** — sidebar items, AI rows, and
      hover-action buttons bumped to ≥ 8px vertical padding; risk pills
      and status pills gained shape prefixes (▲ / ◆ / ▽ and ○ / ◐ / ● / ⊘)
      so state is not color-only; sidebar + topbar + main + right panel
      regions declared via `role` attributes; sidebar inbox declared as a
      button with `aria-label`.
      *Addresses:* accessibility (WCAG touch targets + color-independence).
- [x] **10. AI jargon glossary tooltips** — `.glossary-tip` component in
      `components.css`; applied to "On-device AI" (topbar + launcher),
      "Compute mode: on-device", "PII tokenization", "Egress" on the brief
      view.
      *Addresses:* non-technical users, AI jargon barrier.
- [x] **11. Expandable right panel** — `workarea.with-right.right-expanded`
      layout rule + `expandRightView()` in `app.js` + `expand` button in
      the `rp-head` of `renderTaskPanel()`, `renderBase()`, `renderSheet()`.
      Lets power users focus on the KApp without the chat column.
      *Addresses:* Ops, Compliance — real work surface space.
- [x] **12. This progress log** — baseline for v0.2 and future passes.
- [x] **13. README update** — onboarding tour called out, segment
      suitability matrix added, design notes expanded.
- [x] **14. Proposal update** — Section 11 ("UX Audit Findings &
      Mitigations") plus feature-breakdown and use-case refinements.

### Segment impact at a glance

| Segment         | Biggest wins |
|-----------------|------------------------------------------------------|
| Finance         | Approval confirmation, priority inbox, glossary tips |
| HR              | Priority inbox, quick actions, empty states          |
| Sales           | Channel-aware launcher suggestions, quick actions    |
| Ops             | Expandable right panel, empty states, base tooltips  |
| Compliance      | Confirmation dialog, status/risk pill prefixes       |
| Non-technical   | Onboarding tour, glossary tips, intake help text     |

### What's next

- Mobile click-through in `mobile/`.
- Real API + policy engine behind the recipe router (replaces
  `demo-data.js`).
- User testing with 3–5 SME teams per segment; roll findings into a v0.3
  pass.
- Segment-specific sidebar simplification (open question in
  `PROPOSAL.md` §10).
