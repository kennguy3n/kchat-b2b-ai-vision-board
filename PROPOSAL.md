# KChat B2B — Product Proposal

**Status:** Vision / Pitch Draft
**Owner:** KChat Product
**Version:** 0.1 (Desktop vision board)
**Accompanying artifact:** Static HTML/CSS/JS click-through under `desktop/`

---

## 1. Executive Summary

KChat B2B is **enterprise messaging with on-device AI workers and native structured apps ("KApps")**. It merges what teams today split across four separate tools — a chat client (Slack/Teams), a document tool (Google Docs/Notion), a no-code ops tool (Airtable/Smartsheet), and an AI assistant (ChatGPT/Copilot) — into a single workspace whose primary unit of work is the **thread**.

The differentiator is not "another chat with AI bolted on." It is:

1. **AI Employees** — named, scoped coworkers with task queues, allowed channels, and recipes (not just a chat bubble).
2. **KApps as first-class citizens** — Tasks, Forms, Base tables, Sheets, Approvals, and Doc Artifacts rendered inline as structured cards, not links to other tools.
3. **On-device AI by default** — regulated enterprises can run the core AI recipes on-device, with explicit escalation to confidential-server or frontier models controlled by workspace policy.
4. **Thread-native structure** — every artifact (task, doc, approval, sheet row) is traceable back to the thread where it was created, with an immutable audit trail.

This proposal walks through the problem space, the proposed solution, a phased build plan, the feature inventory, and a concrete end-to-end demonstration of the product using the accompanying click-through prototype in `desktop/`.

---

## 2. Problem

Mid-market and enterprise B2B teams today live in a fragmented stack:

| Function                  | Tool                       | Problem                                                                 |
|---------------------------|----------------------------|-------------------------------------------------------------------------|
| Real-time comms           | Slack / Teams              | Messages are ephemeral; work lives outside the thread.                  |
| Docs / specs              | Google Docs / Notion       | Disconnected from the thread; stale links; no provenance.               |
| Structured data           | Airtable / Smartsheet      | Separate login, separate permissions, manual copy-paste from chat.      |
| Approvals                 | Email / Docusign / forms   | No audit trail tied to the originating discussion.                      |
| AI assistance             | ChatGPT / Copilot          | Context-less; sends data to third parties; no policy enforcement.       |

The cost shows up as:

- Knowledge loss ("where did we decide that?").
- Policy risk (AI tooling without workspace-level data controls).
- Slow ops loops (manual extraction of tasks / approvals from chat).
- Reduced trust in AI output (no citations back to source threads or docs).

## 3. Solution: KChat B2B

A single workspace built around three primitives:

1. **Channels & threads** (familiar).
2. **KApps** — inline structured cards that render inside chat: Task List, Doc Artifact, Approval, Form, Base, Sheet, AI Suggestion.
3. **AI Employees** — scoped AI coworkers (e.g. *Kara Ops AI*, *Mika Sales AI*, *Nina PM AI*) with allowed channels, task queues, statuses, recipes, and review gates.

Every AI-generated artifact is:

- **Cited** — every section links back to specific source pins.
- **Governed** — compute mode is shown on every output (on-device / confidential-server / frontier), matching workspace policy.
- **Reviewable** — a human approves before publish; audit trail is immutable.

---

## 4. Phased Development Plan

The product is sized in four phases, each independently shippable and demoable to design partners.

### Phase 1 — Foundation (weeks 0–6)

Goal: a working chat client with domain/channel/thread structure and the KApp card framework.

- Workspace + domain + channel model.
- Threads as first-class objects (parent message + reply chain, linkable).
- Message compose, attachments, mentions, reactions.
- KApp card shell + 2 card types: **Doc Artifact card** and **Task List card**.
- Sidebar navigation (domains → channels → DMs → AI Employees section).
- Workspace admin: members, roles, policy toggles (scaffold only).
- Desktop shell (this repo's `desktop/` directory).

**Exit criteria:** A team can chat in channels, open threads, paste a doc, and see a task card render inline.

### Phase 2 — AI Employees & Recipes (weeks 6–14)

Goal: named AI workers running scoped recipes with governance.

- AI Employee profile + task queue.
- Recipe registry: `summarize`, `extract_tasks`, `draft_prd`, `draft_proposal`, `create_qbr`.
- Guided intake (brief builder) → processing animation → output review with citations.
- Policy engine: on-device vs confidential-server vs frontier routing, enforced at the recipe level.
- Source pins: every output is tied to enumerable source documents.
- Human-in-the-loop review gate before any AI artifact is published.

**Exit criteria:** Kara Ops AI can be assigned a task in a channel, run a recipe on-device, produce a PRD draft with citations, and a human can Edit-in-Workspace or Publish-to-Channel.

### Phase 3 — Full KApp Suite & Approvals (weeks 14–22)

Goal: KApps reach parity with stand-alone ops tools.

- **Forms KApp**: form builder, AI-prefill from thread context, response linking (to Base, Sheet, or Task).
- **Base KApp**: table-style records (vendor register, risk register, SOP register).
- **Sheet KApp**: spreadsheet-like grid with formulas and "AI: Generate Summary" action.
- **Approval KApp**: structured request → review → immutable decision with audit trail.
- Task KApp: list view + Kanban board toggle, owner/due/status, AI-extracted badge.
- Cross-KApp linking: every Task, Approval, Form response points back to a thread and to any related Base/Sheet row.

**Exit criteria:** An ops team can run a full vendor-renewal cycle (intake form → risk re-score in Base → approval → publish SOP) entirely inside KChat.

### Phase 4 — Enterprise & Mobile (weeks 22–30)

Goal: production-readiness.

- SSO, SCIM, audit exports, data-residency controls.
- Connectors: Google Drive, OneDrive/SharePoint, Jira, Salesforce (scoped to specific channels).
- Templates marketplace (PRD, RFC, Proposal, SOP, QBR) with custom template authoring.
- Mobile client (iOS / Android) using the same state model; reserved in `mobile/` for a future task.
- Usage analytics, concurrency controls per AI Employee, per-channel AI budget.

**Exit criteria:** A regulated enterprise (finance / healthcare) can adopt KChat as its primary comms + ops surface with policy-enforced AI.

---

## 5. Feature Breakdown

Grouped by capability area. Each row maps to a screen in the desktop click-through (`desktop/index.html`).

### 5.1 Navigation & shell

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| Login / workspace select      | Screen 1                | MFA hint, workspace dropdown.                          |
| Workspace home                | Screen 2                | Domain cards, recent channels, pinned items.           |
| Domain view                   | Screen 3                | Domain-scoped channel list.                            |
| Sidebar (domains, DMs, AI)    | all post-login screens  | Accordion domains, DM unread counts, AI status dots.   |

### 5.2 Chat & threads

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| Channel chat                  | Screen 4                | Messages, mentions, attachments, hover actions.        |
| Thread detail                 | Screen 5                | Linked objects, thread action bar.                     |
| Compose bar with AI actions   | Screen 4                | `+` opens Action Launcher.                             |

### 5.3 AI recipes

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| Action Launcher               | Screen 6 (modal)        | Grouped by Create / Track / Plan / Approve / Collect / Analyze. |
| Guided intake / brief builder | Screen 7 (right panel)  | Goal, audience, sources, template, tone, missing info. |
| Processing animation          | Screen 8 (right panel)  | 4-step on-device run; compute mode always visible.     |
| Output review with citations  | Screen 9 (right panel)  | Section-level confidence, source pins, actions.        |

### 5.4 Artifacts & KApps

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| Document artifact workspace   | Screen 10               | Outline nav, version history, Publish to channel.      |
| Task KApp (list + Kanban)     | Screen 11 (right panel) | AI-extracted badge, owner/due/status, source thread.   |
| Approval flow                 | Screen 12 (right panel) | Form → review → immutable decision with audit trail.   |
| Forms KApp                    | Screen 13 (right panel) | AI-prefilled fields, response linking.                 |
| Base / Sheet KApp             | Screen 14 (right panel) | Vendor register table, budget tracker grid.            |

### 5.5 AI Employees

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| AI Employee profile + queue   | Screen 15               | Allowed channels, current status, task queue table.    |
| AI as chat participant        | Screen 4                | Appears in message list with role pill and status.     |

### 5.6 Admin / governance

| Feature                       | Screen in demo          | Notes                                                  |
|-------------------------------|-------------------------|--------------------------------------------------------|
| Workspace settings            | Screen 16 (modal)       | General / Privacy & AI / Connectors / AI Employees / Templates. |
| Compute-mode badge            | shell + every AI view   | `On-device AI` / `Confidential server` / `Frontier`.   |
| Source pins on every output   | Screen 9, Screen 10     | Every section shows the exact sources used.            |

---

## 6. Use Case — End-to-End Demo Flow

The desktop click-through walks through a single realistic week in the life of an ops team at **Acme Corp**. It is organized as a narrative so a design partner can follow it start-to-finish.

### Setting

- **Workspace:** Acme Corp.
- **Domain:** Operations.
- **Channel:** `#vendor-management`.
- **Actors:**
  - Ken Nguyen (Head of Ops, the user).
  - Mira Patel (Ops PM), Sofia Reyes, Dan Kim (Ops).
  - **Kara Ops AI** (AI Employee, Ops Coordinator).
  - **Nina PM AI** (AI Employee, Product).

### Flow

**Step 1 — Sign in (Screen 1).**
Ken signs into Acme Corp. Workspace policy is on-device-preferred.

**Step 2 — Home (Screen 2).**
Home surfaces: 3 domains (Operations / Sales / Product), recent channels, and pinned items — including a pending approval and an AI-extracted task list. One click to any.

**Step 3 — Domain + channel (Screens 3 → 4).**
Ken clicks *Operations* → `#vendor-management`. Channel shows the morning's thread: quarterly vendor reviews are due Friday, Mira posted the contract dump.

**Step 4 — AI coworker proposes a recipe (Screen 4).**
Kara Ops AI (AI Employee) posts a message: *"I can extract a renewal checklist from the contract dump. Want me to run it?"* Ken replies *"Yes — on-device, flag PII."* Kara posts a **Doc Artifact card** with the checklist. This is Kara acting as a coworker, not a chatbot.

**Step 5 — Task extraction (Screen 4 → 11).**
Mira kicks off a thread and clicks *Extract Tasks*. The right panel opens a **Task KApp** with five AI-extracted tasks. Each task carries an *AI-extracted* badge and links back to its source thread.

**Step 6 — Approval (Screen 12).**
Dan flags that Orbix is blocking two shipments and needs a payment-hold release. Sofia clicks *Request Approval* on the thread. The right panel opens with an approval form pre-filled from thread context ($42,500, justification, attached audit evidence). Sofia submits — the approval card appears inline, state *Pending*. Ken (approver) clicks *Review*, adds a comment, clicks *Approve*. The card updates to *Approved*, and an immutable audit trail is appended (submitted → reviewed → approved, with timestamps).

**Step 7 — Draft the PRD (Screens 6 → 7 → 8 → 9).**
Later, in `#specs`, Ana asks for the Vendor Portal v2 PRD. Ken clicks `+` in the compose bar to open the **Action Launcher** (Screen 6), picks *Create → PRD*. The **Brief Builder** (Screen 7) opens in the right panel: goal, audience chips, source pills (current thread + Drive PDF + `#specs`), template selector, tone, and AI-flagged missing information. A *Source / Privacy review* panel at the bottom shows compute mode `On-device AI`, 0 bytes egress, and approved sources.

Ken clicks *Generate Draft*. The **Processing view** (Screen 8) animates through four steps: *Reading sources → Planning outline → Drafting sections → Ready for review*. Compute-mode badge remains visible throughout.

The **Output Review** (Screen 9) then shows the draft PRD with section headings, pre-written content, citation markers `[1]`, `[2]`, per-section confidence (*High confidence* / *Review recommended*), and a sources panel. Action buttons: *Edit in Workspace*, *Publish to Channel*, *Discard*.

**Step 8 — Open the artifact workspace (Screen 10).**
Ken clicks *Edit in Workspace*. The center panel becomes a **Document Artifact Workspace**: outline nav on the left (click a section to jump), editable document in the center, and an aside with *version history*, *sources used*, *template: Standard PRD*, and the compute-mode badge. Ken edits a section, clicks *Publish*. A confirmation modal appears. On confirm, the artifact card posts into `#specs` and `v1` is stamped.

**Step 9 — AI Employee profile (Screen 15).**
Ken clicks *Kara Ops AI* in the sidebar. Her profile shows:

- Role: *Ops Coordinator*.
- Allowed channels: `#vendor-management`, `#logistics`.
- Current status: *Drafting weekly vendor risk summary*.
- Task queue (running / queued / blocked / done) — each with recipe name, sources, last-updated, and a *Review Draft* button on completed items.

This is how governance lands in practice: Kara's work is scoped, visible, reviewable, and tied to threads.

**Step 10 — Forms / Base / Sheet (Screens 13, 14).**
For onboarding a new vendor, Ken opens a **Form KApp** (New Vendor Intake) — some fields are pre-filled with an *AI Prefill* badge. Submitted responses link to a row in the **Base KApp** (Vendor Register) and roll up into the **Sheet KApp** (Budget Tracker) with a variance column and an *AI: Generate Summary* button.

**Step 11 — Settings (Screen 16).**
Ken opens workspace settings via the gear. Tabs: *General / Privacy & AI Policy / Connectors / AI Employees / Templates*. On *Privacy & AI Policy*, toggles: *Allow confidential server AI*, *Allow frontier model fallback*, *Require PII tokenization*, *On-device preferred* (checked). Connectors shows *Google Drive* scoped to `#vendor-management` (connected) and *OneDrive* (not connected).

### What the demo proves

- AI is a **coworker**, not a popup.
- Every AI output is **cited, policy-tagged, and human-reviewable**.
- Structured work (tasks, approvals, forms, tables, docs) lives **inside the thread** that produced it.
- Compliance-sensitive customers can deploy with **on-device compute by default**.

---

## 7. Architecture Overview

This section documents how the prototype is organized, and how the production system should map onto the same shape.

### 7.1 Client architecture (mirrored by the prototype)

```
┌──────────────────────────────────────────────────────────────┐
│                           Desktop                            │
│                                                              │
│   ┌──────────┐   ┌─────────────────────┐   ┌─────────────┐   │
│   │ Sidebar  │   │   Center (screens)  │   │ Right panel │   │
│   │          │   │                     │   │             │   │
│   │ nav,     │   │  login, home,       │   │ brief,      │   │
│   │ domains, │   │  domain, channel,   │   │ processing, │   │
│   │ DMs,     │   │  thread, artifact,  │   │ output,     │   │
│   │ AI emps  │   │  AI employee, ...   │   │ tasks,      │   │
│   │          │   │                     │   │ approval,   │   │
│   │          │   │                     │   │ forms, base,│   │
│   │          │   │                     │   │ sheet       │   │
│   └──────────┘   └─────────────────────┘   └─────────────┘   │
│                                                              │
│   ┌──────────────────────────────────────────────────────┐   │
│   │       Modals: Action Launcher, Settings, Publish     │   │
│   └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

- **State machine (`desktop/js/app.js`)** — a single `state` object holds `{ screen, domainId, channelId, threadId, aiEmployeeId, artifactId, rightView }`. `navigateTo(screenId, params)` is the only way to change screens; it also updates `history.pushState` and persists `lastScreen` to `localStorage` for refresh.
- **Right panel** (`openRightView(name, params)`) is independent of the center screen — e.g., a thread in the center can coexist with a brief builder in the right panel.
- **Modules** are ES modules with a single render entry point each:
  - `navigation.js` — sidebar.
  - `chat.js` — channel.
  - `threads.js` — thread detail.
  - `cards.js` — KApp cards (artifact / task / approval / AI suggestion).
  - `kapps.js` — Tasks, Forms, Base, Sheet.
  - `ai-actions.js` — Action Launcher, brief, processing, output review.
  - `ai-employees.js` — AI Employee profile + queue.
  - `artifacts.js` — Document workspace.
  - `approvals.js` — approval form + review.
  - `settings.js` — workspace settings modal.
  - `modals.js` / `transitions.js` / `icons.js` — primitives.
  - `demo-data.js` — all pre-scripted data.
- **CSS is modular**: `variables.css` (design tokens) + one file per major region (`sidebar`, `main-panel`, `right-panel`, `cards`, `modals`, `ai`, `components`).

### 7.2 Production mapping

The same shape works for production; the only additions are:

- Replace `demo-data.js` with a data layer that talks to the API over WebSocket for chat events and REST/GraphQL for KApp records.
- Replace the ES-module script tags with a build step (Vite / esbuild) + TS types; the module boundaries don't need to change.
- AI recipes live behind a **recipe router**: inputs → policy check (on-device / confidential-server / frontier) → run → output with source pins → audit log entry.
- Every KApp record is an object in a typed schema (`Task`, `Approval`, `FormResponse`, `BaseRow`, `Artifact`) with a pointer to its originating `threadId` and optional `recipeRunId`.

### 7.3 Governance model

| Control                   | How it is enforced                                                   |
|---------------------------|----------------------------------------------------------------------|
| On-device preferred       | Workspace policy toggle; every recipe declares its compute needs.    |
| PII tokenization          | Pre-processing step on recipe inputs; tokens re-hydrated post-output.|
| Channel scoping for AI    | AI Employee has explicit `allowedChannels`; recipe rejects otherwise.|
| Immutable approvals       | Append-only audit log; decisions cannot be deleted, only superseded. |
| Citations everywhere      | Recipe contract: every output section must carry ≥ 1 source pin.     |
| Human-in-the-loop publish | AI outputs are always *Draft* until a human clicks *Publish*.        |

---

## 8. Why now

- Enterprises are adopting AI but rejecting consumer chatbots because they can't enforce policy.
- On-device / small-model inference has caught up enough for 80% of ops recipes (summarization, extraction, prefill, re-formatting).
- Slack and Teams are stuck in a "bot ecosystem" model — they will not rebuild around AI Employees without breaking backwards compatibility.

KChat B2B ships AI-Employee-native from day one, with governance as the default, not a compliance retrofit.

---

## 9. What's in this repo

- `desktop/` — fully working static HTML/CSS/JS click-through of the 16 screens described above. Open `desktop/index.html` (via a static server) to run it. Pre-scripted data lives in `desktop/js/demo-data.js`. No server, no build, no framework.
- `mobile/` — **reserved** for the iOS/Android shell in a future task.
- `shared/` — **reserved** for cross-surface types and primitives.
- `README.md` — how to run the demo and click-through guide.
- `PROPOSAL.md` — this document.

---

## 10. Open questions

1. Template authoring — is the v1 template set curated (PRD, RFC, Proposal, SOP, QBR) or open to customers from day one?
2. Data-residency granularity — per-workspace, per-domain, or per-channel?
3. AI Employee concurrency — flat limit, or budget-tiered per workspace?
4. Mobile priority — does mobile ship with full KApp authoring, or read/approve only?
5. Connector scope — first-party set (Drive, OneDrive, Jira, Salesforce) vs an open connector SDK.

These are intentionally flagged here rather than silently resolved in the click-through; each one changes the scope of Phase 3/4.
