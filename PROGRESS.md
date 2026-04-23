# KChat B2B — Progress Log

A running log of meaningful changes to the vision board prototype under
`desktop/`. Each entry names the release, the audit findings it addresses,
and which SME segments benefit most from the changes.

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
