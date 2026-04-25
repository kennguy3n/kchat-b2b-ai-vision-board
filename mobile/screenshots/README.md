# Mobile Walkthrough Screenshots

Captured from `mobile/index.html` against a 390×844 iPhone 14 Pro frame on the
local server (`python3 -m http.server`), then taken at desktop resolution so
the device frame, status bar and notch are visible.

The numbering follows a logical click-through order across the three guided
demo paths (Vendor Review Week · Draft a PRD · AI Employee Check-in) and the
five-tab shell (Message / Notification / Tasks / Settings / More).

## Phase 1 — Core navigation

| # | Screen | What it shows |
|---|---|---|
| 01 | Launcher | Demo landing with three guided demo entry points |
| 02 | Home | Workspace **dashboard** — reachable from the ⊞ icon in the channel-list topbar and from the launcher's secondary "Workspace dashboard" button. Tenant switcher, Core Intents row, quick actions, recent channels. Not the Message-tab landing (that's the channel list — see 03). |
| 03 | Channel list | Generic "👥 Community" topbar; community/tenant strip with the personal-chat icon separated from the B2B communities by a vertical divider (Chat · Acme · Globex · Labs · +Join) and an underline indicator under the selected community; active-tenant header below the strip ("Acme Corp › · 🌐 General · 248 members") with a trailing search icon; pinned `📌 Announcement`; "Joined groups (9)" header with rich rows (group avatars + last-message previews + relative timestamps + unread badges) |
| 04 | Channel chat | `#vendor-management` with AI cards, approval cards, email card, compute-mode badges |
| 05 | Thread detail | Vendor review thread with AI-extracted task list |

## Phase 2 — AI flows (Path B: Draft a PRD with Nina)

| # | Screen | What it shows |
|---|---|---|
| 06 | Action Launcher | Bottom-sheet style intent picker with Auto/Inline mode badges |
| 07 | Brief Builder | Pre-filled PRD brief with compute-mode privacy strip |
| 08 | AI Processing | Nina's animated processing steps (mid-state) |
| 09 | AI Output Review | Per-section confidence + citations on Vendor Renewal Checklist |
| 10 | Artifact Workspace | Mobile document editor with inline AI suggestions |

## Notification & Tasks tabs

| # | Screen | What it shows |
|---|---|---|
| 11 | Notifications | Priority-grouped inbox (Action required / Updates) |
| 12 | Task list | AI-extracted tasks with segmented control to Approvals |
| 12b | Approval list | Approvals segment of the Tasks tab |
| 13 | Task detail | Full task view with linked objects |
| 14 | Approval form | Pre-filled approval with compute-mode privacy strip |
| 15 | Approval review | Approval hero with audit trail |

## Settings tab (Path C: AI Employee Check-in)

| # | Screen | What it shows |
|---|---|---|
| 16 | Settings | AI Employees as the prominent top group |
| 17 | AI Employee list | All five AI Employees with budget + compute-mode |
| 18 | AI Employee detail | Kara — budget bar, allowed channels, queue |
| 19 | AI Memory | Per-workspace facts |
| 20 | Compute Transparency | On-device / Confidential server / Frontier mix |
| 21 | Connectors | Drive, Mail, Calendar, CRM, ERP, Jira, GitHub |

## More tab — KApps & shortcuts

| # | Screen | What it shows |
|---|---|---|
| 22 | More | Ask KChat AI hero + shortcuts + connected apps |
| 23 | Search | Ask KChat AI search with suggested queries |
| 24 | Metrics dashboard | AI runs, compute mix, top recipes |
| 25 | AI Insights | Cross-channel pattern callouts |
| 26 | Template gallery | PRD / QBR / SOP / Proposal / Agenda / Risk / Budget / Form |
| 27 | Packaging & Tiers | Core / Business / Enterprise plans |
| 28 | Form (KApp) | Vendor onboarding form with risk flags |
| 29 | Base (KApp) | Vendor Register table |
| 30 | Sheet (KApp) | Q2 Vendor Spend |
| 31 | Email detail | Orbix remediation email with on-device AI summary |
| 32 | Long-press menu | Bottom-sheet AI action menu on a Kara message |
