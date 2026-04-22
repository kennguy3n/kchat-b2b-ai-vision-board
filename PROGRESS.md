# KChat B2B — Progress Log

A running log of meaningful changes to the vision board prototype under
`desktop/`. Each entry names the release, the audit findings it addresses,
and which SME segments benefit most from the changes.

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
