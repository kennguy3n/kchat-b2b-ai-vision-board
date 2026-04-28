# Mobile Walkthrough Screenshots

Captured from `mobile/index.html` against a 390×844 iPhone 14 Pro frame on the
local server (`python3 -m http.server`), rendered at a 1600×1122 desktop stage
so the device frame, status bar and notch are visible.

The numbering follows a logical click-through order across the three guided
demo paths (Vendor Review Week · Draft a PRD · AI Employee Check-in) and the
five-tab shell (Message / Notification / Tasks / Settings / More).

> **How to regenerate these screenshots.** Start a local server from the repo
> root (`python3 -m http.server 8000`) and run the Playwright capture script
> that drives `KApp.show('<screen>')` for each screen listed below. The exact
> capture routine is documented inline in `mobile/README.md`.

## Phase 1 — Core navigation

| # | Screen | What it shows |
|---|---|---|
| 01 | ![Launcher](01-launcher.png)<br>Launcher | Demo landing with three guided demo entry points |
| 02 | ![Home](02-home.png)<br>Home | Workspace **dashboard** — reachable from the ⊞ icon in the channel-list topbar and from the launcher's secondary "Workspace dashboard" button. Tenant switcher, Core Intents row, quick actions, recent channels. Not the Message-tab landing (that's the channel list — see 03). |
| 03 | ![Channel list](03-channel-list.png)<br>Channel list | Generic "👥 Community" topbar; community/tenant strip with the personal-chat icon separated from the B2B communities by a vertical divider (Chat · Acme · Globex · Labs · +Join) and an underline indicator under the selected community; active-tenant header below the strip ("Acme Corp › · 🌐 General · 248 members") with a trailing search icon; pinned `📌 Announcement`; "Joined groups (9)" header with rich rows (group avatars + last-message previews + relative timestamps + unread badges) |
| 04 | ![Channel chat](04-channel-chat.png)<br>Channel chat | `#vendor-management` with AI cards, approval cards, email card, compute-mode badges |
| 05 | ![Thread detail](05-thread-detail.png)<br>Thread detail | Vendor review thread with AI-extracted task list |

## Phase 2 — AI flows (Path B: Draft a PRD with Nina)

| # | Screen | What it shows |
|---|---|---|
| 06 | ![Action Launcher](06-action-launcher.png)<br>Action Launcher | Bottom-sheet style intent picker with Auto/Inline mode badges |
| 07 | ![Brief Builder](07-brief-builder.png)<br>Brief Builder | Pre-filled PRD brief with compute-mode privacy strip |
| 08 | ![AI Processing](08-ai-processing.png)<br>AI Processing | Nina's animated processing steps (mid-state) |
| 09 | ![AI Output Review](09-ai-output-review.png)<br>AI Output Review | Per-section confidence + citations on Vendor Renewal Checklist |
| 10 | ![Artifact Workspace](10-artifact-workspace.png)<br>Artifact Workspace | Mobile document editor with inline AI suggestions |

## Notification & Tasks tabs

| # | Screen | What it shows |
|---|---|---|
| 11 | ![Notifications](11-notifications.png)<br>Notifications | Priority-grouped inbox (Action required / Updates) |
| 12 | ![Task list](12-task-list.png)<br>Task list | AI-extracted tasks with segmented control to Approvals |
| 12b | ![Approval list](12b-approval-list.png)<br>Approval list | Approvals segment of the Tasks tab |
| 13 | ![Task detail](13-task-detail.png)<br>Task detail | Full task view with linked objects |
| 14 | ![Approval form](14-approval-form.png)<br>Approval form | Pre-filled approval with compute-mode privacy strip |
| 15 | ![Approval review](15-approval-review.png)<br>Approval review | Approval hero with audit trail |

## Settings tab (Path C: AI Employee Check-in)

| # | Screen | What it shows |
|---|---|---|
| 16 | ![Settings](16-settings.png)<br>Settings | AI Employees as the prominent top group |
| 17 | ![AI Employee list](17-ai-employee-list.png)<br>AI Employee list | All five AI Employees with budget + compute-mode |
| 18 | ![AI Employee detail](18-ai-employee-detail.png)<br>AI Employee detail | Kara — budget bar, allowed channels, queue |
| 19 | ![AI Memory](19-ai-memory.png)<br>AI Memory | Per-workspace facts |
| 20 | ![Compute Transparency](20-compute-transparency.png)<br>Compute Transparency | On-device / Confidential server / Frontier mix |
| 21 | ![Connectors](21-connectors.png)<br>Connectors | Drive, Mail, Calendar, CRM, ERP, Jira, GitHub |

## More tab — KApps & shortcuts

| # | Screen | What it shows |
|---|---|---|
| 22 | ![More](22-more.png)<br>More | Ask KChat AI hero + shortcuts + connected apps |
| 23 | ![Search](23-search.png)<br>Search | Ask KChat AI search with suggested queries |
| 24 | ![Metrics dashboard](24-metrics-dashboard.png)<br>Metrics dashboard | AI runs, compute mix, top recipes |
| 25 | ![AI Insights](25-ai-insights.png)<br>AI Insights | Cross-channel pattern callouts |
| 26 | ![Template gallery](26-template-gallery.png)<br>Template gallery | PRD / QBR / SOP / Proposal / Agenda / Risk / Budget / Form |
| 27 | ![Packaging & Tiers](27-packaging-tiers.png)<br>Packaging & Tiers | Core / Business / Enterprise plans |
| 28 | ![Form (KApp)](28-form-view.png)<br>Form (KApp) | Vendor onboarding form with risk flags |
| 29 | ![Base (KApp)](29-base-view.png)<br>Base (KApp) | Vendor Register table |
| 30 | ![Sheet (KApp)](30-sheet-view.png)<br>Sheet (KApp) | Q2 Vendor Spend |
| 31 | ![Email detail](31-email-detail.png)<br>Email detail | Orbix remediation email with on-device AI summary |
| 32 | ![Long-press menu](32-long-press-menu.png)<br>Long-press menu | Bottom-sheet AI action menu on a Kara message |
