// Pre-scripted demo data for the KChat B2B desktop click-through.
// All data is static; no network calls are ever made.

export const workspace = {
  id: "ws-acme",
  name: "Acme Corp",
  logo: "assets/logos/kchat-logo.svg",
  memberCount: 248,
};

export const users = [
  { id: "u-ken",   name: "Ken Nguyen",   role: "Head of Ops",       initials: "KN", color: "#6366f1" },
  { id: "u-mira",  name: "Mira Patel",   role: "Vendor Manager",    initials: "MP", color: "#ec4899" },
  { id: "u-dan",   name: "Dan Kim",      role: "Logistics Lead",    initials: "DK", color: "#22c55e" },
  { id: "u-sofia", name: "Sofia Reyes",  role: "Compliance",        initials: "SR", color: "#f59e0b" },
  { id: "u-tom",   name: "Tom Becker",   role: "Sales Director",    initials: "TB", color: "#0ea5e9" },
  { id: "u-ana",   name: "Ana Wu",       role: "Product Manager",   initials: "AW", color: "#a855f7" },
];

export const currentUserId = "u-ken";

export const aiEmployees = [
  {
    id: "ai-kara",
    name: "Kara Ops AI",
    role: "Ops Coordinator",
    initials: "KA",
    color: "#8b5cf6",
    allowedChannels: ["c-vendor", "c-logistics"],
    status: "Drafting weekly vendor risk summary",
    concurrency: 2,
    enabled: true,
    queue: [
      { id: "t-kara-1", title: "Weekly vendor risk summary",        status: "running", lastUpdated: "2m ago",  recipe: "summarize", sources: ["#vendor-management", "vendor-register base"] },
      { id: "t-kara-2", title: "Update risk register from contracts", status: "queued",  lastUpdated: "5m ago", recipe: "extract",   sources: ["drive:/contracts"] },
      { id: "t-kara-3", title: "Prepare compliance checklist",       status: "blocked", lastUpdated: "1h ago",  recipe: "draft-sop", sources: ["#compliance"] , blockedReason: "Waiting for user input: approver list" },
      { id: "t-kara-4", title: "Last week's ops summary",            status: "done",    lastUpdated: "Mon",     recipe: "summarize", sources: ["#vendor-management"] },
    ],
  },
  {
    id: "ai-mika",
    name: "Mika Sales AI",
    role: "Sales Assist",
    initials: "MI",
    color: "#10b981",
    allowedChannels: ["c-pipeline", "c-deals"],
    status: "Idle",
    concurrency: 2,
    enabled: true,
    queue: [
      { id: "t-mika-1", title: "QBR deck outline for Globex",    status: "done",    lastUpdated: "1d",  recipe: "create-qbr", sources: ["#deals"] },
      { id: "t-mika-2", title: "Pipeline health digest",         status: "queued",  lastUpdated: "30m", recipe: "summarize",  sources: ["#pipeline"] },
    ],
  },
  {
    id: "ai-nina",
    name: "Nina PM AI",
    role: "Product Co-Pilot",
    initials: "NI",
    color: "#f97316",
    allowedChannels: ["c-roadmap", "c-specs"],
    status: "Drafting PRD: Vendor Portal v2",
    concurrency: 1,
    enabled: true,
    queue: [
      { id: "t-nina-1", title: "PRD draft: Vendor Portal v2",   status: "running", lastUpdated: "just now", recipe: "draft-prd", sources: ["#specs", "thread: vendor portal"] },
      { id: "t-nina-2", title: "Compare competitor feature set", status: "queued", lastUpdated: "10m", recipe: "compare", sources: ["drive:/research"] },
    ],
  },
];

export const domains = [
  {
    id: "d-ops",
    name: "Operations",
    icon: "ops",
    channels: ["c-vendor", "c-logistics", "c-compliance"],
  },
  {
    id: "d-sales",
    name: "Sales",
    icon: "sales",
    channels: ["c-pipeline", "c-deals"],
  },
  {
    id: "d-product",
    name: "Product",
    icon: "product",
    channels: ["c-roadmap", "c-specs"],
  },
];

export const channels = {
  "c-vendor":     { id: "c-vendor",     domainId: "d-ops",     name: "vendor-management", description: "Vendor onboarding, reviews, risk",           members: 14 },
  "c-logistics":  { id: "c-logistics",  domainId: "d-ops",     name: "logistics",          description: "Shipping, carriers, warehouses",              members: 9 },
  "c-compliance": { id: "c-compliance", domainId: "d-ops",     name: "compliance",         description: "Policy, audits, SOC2",                        members: 6 },
  "c-pipeline":   { id: "c-pipeline",   domainId: "d-sales",   name: "pipeline",           description: "Opportunities and forecast",                  members: 11 },
  "c-deals":      { id: "c-deals",      domainId: "d-sales",   name: "deals",              description: "Active deals, QBRs",                          members: 7 },
  "c-roadmap":    { id: "c-roadmap",    domainId: "d-product", name: "roadmap",            description: "Quarterly planning",                          members: 10 },
  "c-specs":      { id: "c-specs",      domainId: "d-product", name: "specs",              description: "PRDs, RFCs, design docs",                     members: 12 },
};

export const directMessages = [
  { id: "dm-mira", withUserId: "u-mira", unread: 2 },
  { id: "dm-tom",  withUserId: "u-tom",  unread: 0 },
  { id: "dm-ana",  withUserId: "u-ana",  unread: 1 },
];

// Messages keyed by channelId (or dm id). Timestamps are demo strings.
export const messages = {
  "c-vendor": [
    { id: "m-v-1", senderId: "u-mira", ts: "09:12", text: "Hey team — quarterly vendor reviews are due Friday. Sharing the latest contract dump from Drive.", attachments: [{ name: "vendor-contracts-q2.zip", size: "12.4 MB" }] },
    { id: "m-v-2", senderId: "u-ken",  ts: "09:14", text: "Thanks. @sofia can you flag any that lapse this quarter?", mentions: ["u-sofia"] },
    { id: "m-v-3", senderId: "u-sofia", ts: "09:17", text: "On it. Three vendors need renewal review — NimbusLogix, Orbix, and Paperstack." },
    { id: "m-v-4", senderId: "ai-kara", isAI: true, ts: "09:18", text: "I can extract a renewal checklist from the contract dump. Want me to run it?", cardType: "ai-suggest" },
    { id: "m-v-5", senderId: "u-ken",  ts: "09:19", text: "Yes please — use the on-device recipe and surface any PII risks." },
    { id: "m-v-6", senderId: "ai-kara", isAI: true, ts: "09:22", text: "Draft ready for review.", card: { type: "artifact", refId: "a-vendor-checklist" } },
    { id: "m-v-7", senderId: "u-mira", ts: "09:27", text: "Meanwhile I opened a task list — see the thread below.", threadOf: "m-v-7", card: { type: "task-list", count: 5, refId: "thread-vendor-tasks" } },
    { id: "m-v-8", senderId: "u-dan",  ts: "09:31", text: "Logistics angle: Orbix is blocking two shipments. Needs an approval to unblock payment hold.", card: { type: "approval", refId: "ap-orbix" } },
    { id: "m-v-9", senderId: "u-ken",  ts: "09:35", text: "Approved path — let's get a summary and formal approval filed.", mentions: [] },
    { id: "m-v-10", senderId: "u-sofia", ts: "09:40", text: "Filed. Pending your review.", card: { type: "approval", refId: "ap-orbix" } },
  ],
  "c-logistics": [
    { id: "m-l-1", senderId: "u-dan",  ts: "08:55", text: "Carrier capacity is tight this week — NSK has a 3-day backlog." },
    { id: "m-l-2", senderId: "u-mira", ts: "09:02", text: "Can we divert to FleetOne for priority SKUs?" },
    { id: "m-l-3", senderId: "u-dan",  ts: "09:05", text: "Pulling rates now." },
  ],
  "c-compliance": [
    { id: "m-cp-1", senderId: "u-sofia", ts: "10:00", text: "SOC2 evidence collection window opens Monday. Gentle reminder." },
  ],
  "c-pipeline": [
    { id: "m-p-1", senderId: "u-tom", ts: "11:10", text: "Globex moved to verbal. Drafting QBR with Mika." },
  ],
  "c-deals": [
    { id: "m-d-1", senderId: "u-tom",  ts: "11:20", text: "QBR draft attached.", card: { type: "artifact", refId: "a-qbr-globex" } },
    { id: "m-d-2", senderId: "ai-mika", isAI: true, ts: "11:21", text: "I pulled the last 4 quarters of activity and flagged 2 risks. Citations attached." },
  ],
  "c-roadmap": [
    { id: "m-r-1", senderId: "u-ana", ts: "13:05", text: "Q3 themes forming up: vendor portal v2, approval unification, analytics." },
  ],
  "c-specs": [
    { id: "m-s-1", senderId: "u-ana",  ts: "14:30", text: "Kicking off PRD for Vendor Portal v2. Thread below with scope notes.", card: null },
    { id: "m-s-2", senderId: "ai-nina", isAI: true, ts: "14:33", text: "Drafting from the linked thread + research folder.", card: { type: "artifact", refId: "a-prd-vendor-portal" } },
  ],
};

export const threads = {
  "thread-vendor-tasks": {
    id: "thread-vendor-tasks",
    channelId: "c-vendor",
    parentMessageId: "m-v-7",
    title: "Vendor review task breakdown",
    messages: [
      { id: "tr-1", senderId: "u-mira", ts: "09:28", text: "Here are the open actions for this quarter:" },
      { id: "tr-2", senderId: "u-sofia", ts: "09:30", text: "I'll own the compliance check for NimbusLogix." },
      { id: "tr-3", senderId: "u-ken", ts: "09:32", text: "@kara extract tasks and assign owners.", mentions: ["ai-kara"] },
      { id: "tr-4", senderId: "ai-kara", isAI: true, ts: "09:33", text: "Extracted 5 tasks with owners and due dates.", card: { type: "task-list", count: 5 } },
      { id: "tr-5", senderId: "u-mira", ts: "09:35", text: "Looks right. Converting the risk items into a formal approval too." },
    ],
    linkedObjects: [
      { type: "task-list", refId: "tasks-vendor" },
      { type: "approval",  refId: "ap-orbix" },
    ],
  },
  "thread-prd-vendor-portal": {
    id: "thread-prd-vendor-portal",
    channelId: "c-specs",
    parentMessageId: "m-s-1",
    title: "Vendor Portal v2 scope",
    messages: [
      { id: "pr-1", senderId: "u-ana", ts: "14:31", text: "Scope: self-serve onboarding, doc vault, risk scoring, SSO." },
      { id: "pr-2", senderId: "u-ken", ts: "14:32", text: "Priority on risk scoring — surfaces in ops." },
      { id: "pr-3", senderId: "ai-nina", isAI: true, ts: "14:34", text: "Reading sources — thread + research folder — drafting PRD." },
      { id: "pr-4", senderId: "ai-nina", isAI: true, ts: "14:37", text: "PRD draft v1 ready.", card: { type: "artifact", refId: "a-prd-vendor-portal" } },
    ],
    linkedObjects: [
      { type: "artifact", refId: "a-prd-vendor-portal" },
    ],
  },
};

export const tasks = [
  { id: "tk-1", title: "Collect renewal terms for NimbusLogix",   ownerId: "u-sofia", due: "Fri",       status: "in-progress", isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-2", title: "Re-score Orbix risk based on latest audit", ownerId: "u-mira", due: "Thu",       status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-3", title: "Confirm Paperstack contract owner",        ownerId: "u-ken",   due: "Wed",       status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-4", title: "Draft vendor portal PRD v1",               ownerId: "u-ana",   due: "Mon",       status: "in-progress", isAIExtracted: false, sourceThreadId: "thread-prd-vendor-portal" },
  { id: "tk-5", title: "Approve Orbix exception payment",          ownerId: "u-ken",   due: "Today",     status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-6", title: "Pull logistics variance report",           ownerId: "u-dan",   due: "Fri",       status: "todo",        isAIExtracted: false, sourceThreadId: null },
  { id: "tk-7", title: "QBR slides for Globex",                    ownerId: "u-tom",   due: "Tue",       status: "done",        isAIExtracted: true,  sourceThreadId: null },
  { id: "tk-8", title: "SOC2 evidence staging",                    ownerId: "u-sofia", due: "Next week", status: "todo",        isAIExtracted: false, sourceThreadId: null },
];

export const approvals = {
  "ap-orbix": {
    id: "ap-orbix",
    title: "Orbix payment hold release",
    description: "Release $42,500 payment hold for Orbix to unblock two shipments. Vendor has remediated SLA breaches; risk re-scored to Medium.",
    amount: "$42,500",
    status: "pending", // pending | approved | denied
    submittedBy: "u-sofia",
    submittedAt: "Today, 09:40",
    approverId: "u-ken",
    supportingDocs: [
      { name: "Orbix SLA remediation memo.pdf" },
      { name: "Risk rescore worksheet.xlsx" },
    ],
    audit: [
      { step: "submitted", actorId: "u-sofia", ts: "09:40", note: "Filed from thread" },
      { step: "reviewed",  actorId: "u-ken",   ts: "09:44", note: "Reviewed supporting docs" },
    ],
    comment: "",
  },
  "ap-software-license": {
    id: "ap-software-license",
    title: "Annual license renewal — Paperstack",
    description: "Renew Paperstack annual license at standard terms.",
    amount: "$18,000",
    status: "approved",
    submittedBy: "u-mira",
    submittedAt: "Mon, 14:12",
    approverId: "u-ken",
    supportingDocs: [{ name: "Paperstack quote.pdf" }],
    audit: [
      { step: "submitted", actorId: "u-mira", ts: "Mon 14:12", note: "Filed from #vendor-management" },
      { step: "reviewed",  actorId: "u-ken",   ts: "Mon 14:30", note: "Standard renewal, no changes" },
      { step: "approved",  actorId: "u-ken",   ts: "Mon 14:32", note: "Approved — proceed with renewal" },
    ],
    comment: "Approved — proceed with renewal",
  },
};

export const artifacts = {
  "a-vendor-checklist": {
    id: "a-vendor-checklist",
    type: "doc",
    title: "Vendor Renewal Checklist — Q2",
    template: "SOP",
    version: "Draft v1",
    status: "Private Draft",
    sources: [
      { name: "vendor-contracts-q2.zip", kind: "file" },
      { name: "#vendor-management", kind: "channel" },
    ],
    sections: [
      { heading: "Overview",            body: "This checklist covers Q2 vendor renewals for NimbusLogix, Orbix, and Paperstack. Use this document to track evidence collection and approval gates.", confidence: "high" },
      { heading: "Pre-renewal checks",  body: "Verify current SLA performance, PII handling agreement [1], and insurance certificates. Flag deviations to the compliance owner.", confidence: "high", cite: [1] },
      { heading: "Risk re-scoring",     body: "Re-score risk using the updated scoring matrix [2]. Any vendor at 'High' requires executive sign-off prior to renewal.", confidence: "review", cite: [2] },
      { heading: "Approval flow",       body: "File a formal approval using the approval KApp. Attach remediation memos for any previously flagged issues.", confidence: "high" },
    ],
  },
  "a-qbr-globex": {
    id: "a-qbr-globex",
    type: "deck",
    title: "Globex Q2 QBR",
    template: "Deck",
    version: "Draft v2",
    status: "Private Draft",
    sources: [{ name: "#deals", kind: "channel" }, { name: "CRM export", kind: "file" }],
    sections: [
      { heading: "Executive summary", body: "Globex expanded 18% YoY, led by logistics SKUs. Two risks flagged.", confidence: "high" },
      { heading: "Wins",              body: "Renewed master agreement; added 2 new regions.", confidence: "high" },
      { heading: "Risks",             body: "Implementation delay on analytics module; pricing exposure in EU.", confidence: "review" },
      { heading: "Next quarter",      body: "Accelerate analytics rollout; expand to LATAM pilot.", confidence: "high" },
    ],
  },
  "a-prd-vendor-portal": {
    id: "a-prd-vendor-portal",
    type: "doc",
    title: "Vendor Portal v2 — PRD",
    template: "Standard PRD",
    version: "Draft v1",
    status: "Private Draft",
    sources: [
      { name: "thread: Vendor Portal v2 scope", kind: "thread" },
      { name: "research/competitor-scan.pdf",   kind: "file" },
    ],
    sections: [
      { heading: "Overview",          body: "Vendor Portal v2 modernizes the onboarding experience, introduces a document vault, and exposes live risk scores to vendor admins [1].", confidence: "high", cite: [1] },
      { heading: "Problem Statement", body: "Today vendors onboard via email and shared drives, leading to manual effort and inconsistent compliance evidence [2].", confidence: "high", cite: [2] },
      { heading: "Requirements",      body: "Self-serve onboarding, doc vault with expiration tracking, real-time risk scoring, SSO via OIDC, admin audit trail.", confidence: "review" },
      { heading: "Success Metrics",   body: "Onboarding time reduced 60%; evidence completeness > 95%; admin NPS > 40.", confidence: "high" },
      { heading: "Open Questions",    body: "SSO provider list; tenant-level data residency; scoring model ownership.", confidence: "review" },
    ],
  },
};

export const forms = {
  "f-vendor-intake": {
    id: "f-vendor-intake",
    title: "New Vendor Intake Form",
    fields: [
      { id: "name",     label: "Vendor Name",    type: "text",   prefill: "NimbusLogix",         aiPrefilled: true },
      { id: "category", label: "Category",       type: "select", options: ["Software", "Logistics", "Consulting", "Hardware"], prefill: "Logistics", aiPrefilled: true },
      { id: "email",    label: "Contact Email",  type: "email",  prefill: "vendors@nimbuslogix.com", aiPrefilled: true },
      { id: "annual",   label: "Annual Value",   type: "text",   prefill: "$120,000",             aiPrefilled: false },
      { id: "risk",     label: "Risk Level",     type: "select", options: ["Low", "Medium", "High"], prefill: "Medium", aiPrefilled: true },
    ],
  },
};

export const baseRows = [
  { name: "NimbusLogix",    category: "Logistics",  risk: "Medium", value: "$120,000", status: "Renewing",  lastReview: "Apr 12" },
  { name: "Orbix",          category: "Logistics",  risk: "Medium", value: "$42,500",  status: "On Hold",   lastReview: "Apr 15" },
  { name: "Paperstack",     category: "Software",   risk: "Low",    value: "$18,000",  status: "Active",    lastReview: "Mar 29" },
  { name: "FleetOne",       category: "Logistics",  risk: "Low",    value: "$88,000",  status: "Active",    lastReview: "Mar 30" },
  { name: "Globex Analytics", category: "Software", risk: "High",   value: "$210,000", status: "Review",    lastReview: "Apr 02" },
];

export const sheetData = {
  title: "Ops Budget Tracker — FY26",
  columns: ["Category", "Q1 Budget", "Q1 Actual", "Q2 Budget", "Q2 Actual", "Variance"],
  rows: [
    ["Vendor spend",     "$180,000", "$172,400", "$190,000", "$188,600", "-1.2%"],
    ["Logistics",        "$95,000",  "$101,200", "$102,000", "$108,700", "+5.3%"],
    ["Compliance tools", "$22,000",  "$21,400",  "$22,500",  "$22,600",  "+0.4%"],
    ["AI compute",       "$14,000",  "$12,800",  "$18,000",  "$17,200",  "-4.4%"],
    ["Training",         "$9,000",   "$8,100",   "$10,000",  "$7,800",   "-22.0%"],
    ["Software licenses","$34,000",  "$33,100",  "$35,000",  "$35,900",  "+2.6%"],
    ["Contractors",      "$48,000",  "$51,900",  "$50,000",  "$52,400",  "+4.8%"],
  ],
};

export const aiOutputs = {
  threadSummary: [
    "3 vendors (NimbusLogix, Orbix, Paperstack) need renewal review this quarter.",
    "Orbix is blocking 2 shipments; approval for payment hold release filed.",
    "Sofia owns compliance checks; Mira owns contract collection.",
  ],
  extractedTasks: tasks.filter(t => t.isAIExtracted).slice(0, 5),
  approvalPrefill: {
    title: "Orbix payment hold release",
    description: "Release payment hold to unblock logistics shipments. Risk remediated per attached memo.",
    amount: "$42,500",
  },
  meetingNotes: [
    "Attendees: Ken, Mira, Sofia, Dan",
    "Decisions: proceed with Orbix approval; re-score vendor risk on Thursday.",
    "Actions: 5 tasks extracted.",
  ],
};

export const recipes = [
  { id: "r-summarize",    display: "Summarize thread",    group: "Analyze", intake: ["Audience", "Length"], sources: ["current thread"] },
  { id: "r-extract-tasks", display: "Extract tasks",       group: "Plan",    intake: ["Owner hints", "Due date rules"], sources: ["current thread"] },
  { id: "r-draft-prd",    display: "Draft PRD",           group: "Create",  intake: ["Goal", "Audience", "Template", "Tone"], sources: ["current thread", "linked files"] },
  { id: "r-draft-proposal", display: "Draft Proposal",    group: "Create",  intake: ["Customer", "Template"], sources: ["deal thread", "CRM export"] },
  { id: "r-create-qbr",   display: "Create QBR",          group: "Create",  intake: ["Customer", "Quarter"], sources: ["deal thread", "CRM export"] },
];

// Action Launcher groups
export const actionGroups = [
  { group: "Create",  actions: [
    { id: "create-doc",       label: "Doc",       recipeId: "r-draft-prd" },
    { id: "create-deck",      label: "Deck",      recipeId: "r-create-qbr" },
    { id: "create-proposal",  label: "Proposal",  recipeId: "r-draft-proposal" },
    { id: "create-sop",       label: "SOP",       recipeId: "r-draft-prd" },
    { id: "create-prd",       label: "PRD",       recipeId: "r-draft-prd" },
  ]},
  { group: "Track",   actions: [
    { id: "track-sheet",      label: "Sheet" },
    { id: "track-base",       label: "Base Table" },
    { id: "track-budget",     label: "Budget" },
    { id: "track-risk",       label: "Risk Register" },
  ]},
  { group: "Plan",    actions: [
    { id: "plan-tasks",       label: "Tasks" },
    { id: "plan-agenda",      label: "Agenda" },
    { id: "plan-project",     label: "Project Plan" },
  ]},
  { group: "Approve", actions: [
    { id: "approve-purchase", label: "Purchase" },
    { id: "approve-exception",label: "Exception" },
    { id: "approve-policy",   label: "Policy" },
    { id: "approve-budget",   label: "Budget" },
  ]},
  { group: "Collect", actions: [
    { id: "collect-form",     label: "Form" },
    { id: "collect-intake",   label: "Intake" },
    { id: "collect-feedback", label: "Feedback" },
  ]},
  { group: "Analyze", actions: [
    { id: "analyze-summary",  label: "Summarize",  recipeId: "r-summarize" },
    { id: "analyze-compare",  label: "Compare" },
    { id: "analyze-extract",  label: "Extract",    recipeId: "r-extract-tasks" },
    { id: "analyze-report",   label: "Report" },
  ]},
];

export const settings = {
  privacy: {
    allowConfidentialServerAI: false,
    allowFrontierFallback:     false,
    requirePIITokenization:    true,
    onDevicePreferred:         true,
  },
  connectors: [
    { id: "gdrive",   name: "Google Drive", connected: true,  scope: "#vendor-management" },
    { id: "onedrive", name: "OneDrive",     connected: false, scope: null },
  ],
  templates: [
    { id: "tpl-prd",      name: "PRD",      kind: "doc" },
    { id: "tpl-rfc",      name: "RFC",      kind: "doc" },
    { id: "tpl-proposal", name: "Proposal", kind: "doc" },
    { id: "tpl-sop",      name: "SOP",      kind: "doc" },
  ],
};

// Utility lookup helpers
export function userById(id) {
  return users.find(u => u.id === id) || aiEmployees.find(a => a.id === id) || null;
}
export function channelById(id)     { return channels[id] || null; }
export function domainById(id)      { return domains.find(d => d.id === id) || null; }
export function aiById(id)          { return aiEmployees.find(a => a.id === id) || null; }
export function artifactById(id)    { return artifacts[id] || null; }
export function approvalById(id)    { return approvals[id] || null; }
export function threadById(id)      { return threads[id] || null; }
