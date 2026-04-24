// Pre-scripted demo data for the KChat B2B desktop click-through (v2).
// All data is static; no network calls are ever made.

export const workspace = {
  id: "ws-acme",
  name: "Acme Corp",
  logo: "assets/logos/kchat-logo.svg",
  memberCount: 248,
};

export const users = [
  { id: "u-ken",   name: "Ken Nguyen",   role: "Head of Ops",     initials: "KN", color: "#6366f1" },
  { id: "u-mira",  name: "Mira Patel",   role: "Vendor Manager",  initials: "MP", color: "#ec4899" },
  { id: "u-dan",   name: "Dan Kim",      role: "Logistics Lead",  initials: "DK", color: "#22c55e" },
  { id: "u-sofia", name: "Sofia Reyes",  role: "Compliance",      initials: "SR", color: "#f59e0b" },
  { id: "u-tom",   name: "Tom Becker",   role: "Sales Director",  initials: "TB", color: "#0ea5e9" },
  { id: "u-ana",   name: "Ana Wu",       role: "Product Manager", initials: "AW", color: "#a855f7" },
  { id: "u-lisa",  name: "Lisa Chen",    role: "HR Manager",      initials: "LC", color: "#d946ef" },
  { id: "u-raj",   name: "Raj Mehta",    role: "Finance Lead",    initials: "RM", color: "#14b8a6" },
];

export const currentUserId = "u-ken";

/* ---------------- AI Employees (v2: budget + cooldown) ---------------- */
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
    budget: {
      monthlyCap: 250.0,
      spentThisPeriod: 182.4,
      cooldown: { state: "ready", nextAvailable: null, reason: null },
      recentRuns: [
        { recipe: "summarize", cost: 0.42, at: "2m ago"  },
        { recipe: "extract",   cost: 0.31, at: "12m ago" },
        { recipe: "draft-sop", cost: 1.80, at: "1h ago"  },
      ],
    },
    queue: [
      { id: "t-kara-1", title: "Weekly vendor risk summary",         status: "running", lastUpdated: "2m ago", recipe: "summarize", sources: ["#vendor-management", "vendor-register base"] },
      { id: "t-kara-2", title: "Update risk register from contracts", status: "queued",  lastUpdated: "5m ago", recipe: "extract",   sources: ["drive:/contracts"] },
      { id: "t-kara-3", title: "Prepare compliance checklist",        status: "blocked", lastUpdated: "1h ago", recipe: "draft-sop", sources: ["#compliance"], blockedReason: "Waiting for approver list" },
      { id: "t-kara-4", title: "Last week's ops summary",             status: "done",    lastUpdated: "Mon",    recipe: "summarize", sources: ["#vendor-management"] },
    ],
  },
  {
    id: "ai-mika",
    name: "Mika Sales AI",
    role: "Sales Assist",
    initials: "MI",
    color: "#10b981",
    allowedChannels: ["c-pipeline", "c-deals"],
    status: "Cooling down — budget cap",
    concurrency: 2,
    enabled: true,
    budget: {
      monthlyCap: 180.0,
      spentThisPeriod: 178.9,
      cooldown: {
        state: "cooling-down",
        nextAvailable: "in 3h 42m",
        reason: "98% of monthly AI budget used. Paused until Friday 09:00 or admin override.",
      },
      recentRuns: [
        { recipe: "create-qbr", cost: 2.40, at: "1d"  },
        { recipe: "summarize",  cost: 0.38, at: "30m" },
      ],
    },
    queue: [
      { id: "t-mika-1", title: "QBR deck outline for Globex", status: "done",   lastUpdated: "1d",  recipe: "create-qbr", sources: ["#deals"] },
      { id: "t-mika-2", title: "Pipeline health digest",       status: "queued", lastUpdated: "30m", recipe: "summarize",  sources: ["#pipeline"] },
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
    budget: {
      monthlyCap: 300.0,
      spentThisPeriod: 96.2,
      cooldown: { state: "ready", nextAvailable: null, reason: null },
      recentRuns: [
        { recipe: "draft-prd", cost: 3.10, at: "just now" },
        { recipe: "compare",   cost: 0.90, at: "10m" },
      ],
    },
    queue: [
      { id: "t-nina-1", title: "PRD draft: Vendor Portal v2",    status: "running", lastUpdated: "just now", recipe: "draft-prd", sources: ["#specs", "thread: vendor portal"] },
      { id: "t-nina-2", title: "Compare competitor feature set", status: "queued",  lastUpdated: "10m",      recipe: "compare",   sources: ["drive:/research"] },
    ],
  },
  {
    id: "ai-hana",
    name: "Hana HR AI",
    role: "HR Assistant",
    initials: "HA",
    color: "#d946ef",
    allowedChannels: ["c-hr-people", "c-procurement"],
    status: "Monitoring leave requests",
    concurrency: 1,
    enabled: true,
    budget: {
      monthlyCap: 150.0,
      spentThisPeriod: 42.8,
      cooldown: { state: "ready", nextAvailable: null, reason: null },
      recentRuns: [
        { recipe: "leave-check", cost: 0.12, at: "5m ago" },
      ],
    },
    queue: [
      { id: "t-hana-1", title: "Process Sofia's leave request",       status: "done",    lastUpdated: "5m ago", recipe: "leave-check",      sources: ["#hr-people"] },
      { id: "t-hana-2", title: "Onboarding equipment requisition",    status: "running", lastUpdated: "2m ago", recipe: "procurement-req",  sources: ["#hr-people", "#procurement"] },
    ],
  },
  {
    id: "ai-finn",
    name: "Finn Finance AI",
    role: "Finance Analyst",
    initials: "FI",
    color: "#14b8a6",
    allowedChannels: ["c-finance", "c-procurement"],
    status: "Reconciling Q2 budget",
    concurrency: 2,
    enabled: true,
    budget: {
      monthlyCap: 200.0,
      spentThisPeriod: 88.5,
      cooldown: { state: "ready", nextAvailable: null, reason: null },
      recentRuns: [
        { recipe: "budget-analysis", cost: 0.65, at: "10m ago" },
        { recipe: "bill-match",      cost: 0.22, at: "30m ago" },
      ],
    },
    queue: [
      { id: "t-finn-1", title: "Q2 Ops budget analysis",          status: "done", lastUpdated: "10m ago", recipe: "budget-analysis", sources: ["#finance", "ledger"] },
      { id: "t-finn-2", title: "Match TechDirect invoice to PO",  status: "done", lastUpdated: "30m ago", recipe: "bill-match",      sources: ["#finance", "AP subledger"] },
    ],
  },
];

/* ---------------- Tenants / Communities ---------------- */
// The far-left rail on the sidebar maps 1:1 to tenants — each icon is a
// separate community / workspace the current user belongs to. Picking a
// tenant filters the rest of the sidebar (domains, channels, DMs, AI
// employees) to just that tenant's surface.
export const tenants = [
  {
    id: "t-acme",
    name: "Acme Corp",
    initials: "AC",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    description: "KChat Business · 248 members",
    domainIds: ["d-ops", "d-sales", "d-product", "d-people", "d-finance"],
    dmIds: ["dm-mira", "dm-tom", "dm-ana"],
    aiEmployeeIds: ["ai-kara", "ai-mika", "ai-nina", "ai-hana", "ai-finn"],
    primary: true,
  },
  {
    id: "t-globex",
    name: "Globex Partners",
    initials: "GX",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #0ea5e9)",
    description: "Partner network · 42 members",
    domainIds: ["d-gx"],
    dmIds: [],
    aiEmployeeIds: [],
  },
  {
    id: "t-labs",
    name: "Acme Labs",
    initials: "AL",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    description: "R&D subsidiary · 18 members",
    domainIds: ["d-labs"],
    dmIds: [],
    aiEmployeeIds: [],
  },
];

/* ---------------- Domains / Channels / DMs ---------------- */
export const domains = [
  { id: "d-ops",     tenantId: "t-acme",   name: "Operations",       icon: "ops",     channels: ["c-vendor", "c-logistics", "c-compliance", "c-procurement"], knowledge: { policies: 3, templates: 2, summary: "3 shared policies, 2 SOP templates" } },
  { id: "d-sales",   tenantId: "t-acme",   name: "Sales",            icon: "sales",   channels: ["c-pipeline", "c-deals", "c-shieldnet"],                     knowledge: { policies: 1, templates: 3, summary: "1 policy, 3 deal templates"      } },
  { id: "d-product", tenantId: "t-acme",   name: "Product",          icon: "product", channels: ["c-roadmap", "c-specs"],                                     knowledge: { policies: 2, templates: 4, summary: "2 policies, 4 PRD templates"    } },
  { id: "d-people",  tenantId: "t-acme",   name: "People & Culture", icon: "ops",     channels: ["c-hr-people"],                                              knowledge: { policies: 2, templates: 1, summary: "2 HR policies, 1 onboarding template" } },
  { id: "d-finance", tenantId: "t-acme",   name: "Finance",          icon: "sales",   channels: ["c-finance"],                                                knowledge: { policies: 3, templates: 2, summary: "3 finance policies, 2 report templates" } },
  { id: "d-gx",      tenantId: "t-globex", name: "Account",          icon: "sales",   channels: ["c-gx-general", "c-gx-qbrs"],                                knowledge: { policies: 0, templates: 1, summary: "Joint account workspace"           } },
  { id: "d-labs",    tenantId: "t-labs",   name: "Research",         icon: "product", channels: ["c-labs-general"],                                           knowledge: { policies: 0, templates: 0, summary: "R&D lab"                          } },
];

export const channels = {
  "c-vendor":      { id: "c-vendor",      tenantId: "t-acme",   domainId: "d-ops",     name: "vendor-management", description: "Vendor onboarding, reviews, risk", members: 14, knowledgeRebuilt: "12m ago", knowledgeEntityCount: 18 },
  "c-logistics":   { id: "c-logistics",   tenantId: "t-acme",   domainId: "d-ops",     name: "logistics",          description: "Shipping, carriers, warehouses",   members:  9, knowledgeRebuilt: "1h ago",  knowledgeEntityCount: 11 },
  "c-compliance":  { id: "c-compliance",  tenantId: "t-acme",   domainId: "d-ops",     name: "compliance",         description: "Policy, audits, SOC2",             members:  6, knowledgeRebuilt: "3h ago",  knowledgeEntityCount:  7 },
  "c-pipeline":    { id: "c-pipeline",    tenantId: "t-acme",   domainId: "d-sales",   name: "pipeline",           description: "Opportunities and forecast",       members: 11, knowledgeRebuilt: "23m ago", knowledgeEntityCount: 14 },
  "c-deals":       { id: "c-deals",       tenantId: "t-acme",   domainId: "d-sales",   name: "deals",              description: "Active deals, QBRs",               members:  7, knowledgeRebuilt: "45m ago", knowledgeEntityCount: 22 },
  "c-roadmap":     { id: "c-roadmap",     tenantId: "t-acme",   domainId: "d-product", name: "roadmap",            description: "Quarterly planning",               members: 10, knowledgeRebuilt: "2h ago",  knowledgeEntityCount:  9 },
  "c-specs":       { id: "c-specs",       tenantId: "t-acme",   domainId: "d-product", name: "specs",              description: "PRDs, RFCs, design docs",          members: 12, knowledgeRebuilt: "15m ago", knowledgeEntityCount: 26 },
  "c-gx-general":  { id: "c-gx-general",  tenantId: "t-globex", domainId: "d-gx",      name: "general",            description: "Joint working channel",            members: 12, knowledgeRebuilt: "1d ago",  knowledgeEntityCount:  4 },
  "c-gx-qbrs":     { id: "c-gx-qbrs",     tenantId: "t-globex", domainId: "d-gx",      name: "qbrs",               description: "Quarterly business reviews",       members:  8, knowledgeRebuilt: "2d ago",  knowledgeEntityCount:  6 },
  "c-labs-general":{ id: "c-labs-general",tenantId: "t-labs",   domainId: "d-labs",    name: "general",            description: "Lab announcements",                members: 18, knowledgeRebuilt: "1w ago", knowledgeEntityCount:  2 },
  "c-hr-people":   { id: "c-hr-people",   tenantId: "t-acme",   domainId: "d-people",  name: "hr-people",          description: "Leave, onboarding, HR requests",   members: 18, knowledgeRebuilt: "30m ago", knowledgeEntityCount: 12 },
  "c-procurement": { id: "c-procurement", tenantId: "t-acme",   domainId: "d-ops",     name: "procurement",        description: "Purchase requests, POs, suppliers",members:  8, knowledgeRebuilt: "1h ago",  knowledgeEntityCount:  9 },
  "c-finance":     { id: "c-finance",     tenantId: "t-acme",   domainId: "d-finance", name: "finance",            description: "Budget, invoices, ledger",         members:  6, knowledgeRebuilt: "20m ago", knowledgeEntityCount: 15 },
  "c-shieldnet":   { id: "c-shieldnet",   tenantId: "t-acme",   domainId: "d-sales",   name: "shieldnet-360",      description: "ShieldNet 360 deal room",          members:  5, knowledgeRebuilt: "15m ago", knowledgeEntityCount:  8 },
};

export const directMessages = [
  { id: "dm-mira", tenantId: "t-acme", withUserId: "u-mira", unread: 2 },
  { id: "dm-tom",  tenantId: "t-acme", withUserId: "u-tom",  unread: 0 },
  { id: "dm-ana",  tenantId: "t-acme", withUserId: "u-ana",  unread: 1 },
];

/* ---------------- Messages ---------------- */
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
    { id: "m-v-9", senderId: "u-ken",  ts: "09:35", text: "Approved path — let's get a summary and formal approval filed." },
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
    { id: "m-s-1", senderId: "u-ana",  ts: "14:30", text: "Kicking off PRD for Vendor Portal v2. Thread below with scope notes." },
    { id: "m-s-2", senderId: "ai-nina", isAI: true, ts: "14:33", text: "Drafting from the linked thread + research folder.", card: { type: "artifact", refId: "a-prd-vendor-portal" } },
  ],

  /* Flow 1 — HR leave + onboarding requisition */
  "c-hr-people": [
    { id: "m-hr-1",  senderId: "u-sofia", ts: "10:05", text: "I need to take 3 days off next week (Mon–Wed) for a family event. Can someone check my balance?" },
    { id: "m-hr-2",  senderId: "ai-hana", isAI: true, ts: "10:06", text: "Checking your leave balance now, Sofia.", card: { type: "leave-balance", refId: "lb-sofia" } },
    { id: "m-hr-3",  senderId: "u-sofia", ts: "10:07", text: "Great — please file the request for Mon–Wed." },
    { id: "m-hr-4",  senderId: "ai-hana", isAI: true, ts: "10:08", text: "Leave request filed. Routing to Ken for approval.", card: { type: "leave-request", refId: "lr-sofia-1" } },
    { id: "m-hr-5",  senderId: "u-ken",   ts: "10:15", text: "Reviewed — no team conflicts. Approved." },
    { id: "m-hr-6",  senderId: "ai-hana", isAI: true, ts: "10:16", text: "Leave approved. Calendar blocked Mon–Wed. Balance updated: Annual leave 12 → 9 days.", card: { type: "leave-request", refId: "lr-sofia-1" } },
    { id: "m-hr-7",  senderId: "u-mira",  ts: "10:30", text: "We have 3 new hires starting May 5. They'll need laptops and monitors for onboarding." },
    { id: "m-hr-8",  senderId: "ai-hana", isAI: true, ts: "10:31", text: "I see 3 pending onboarding records. I can generate a procurement request for standard dev equipment (3× laptop + 3× monitor = $6,750). Shall I?", cardType: "ai-suggest" },
    { id: "m-hr-9",  senderId: "u-mira",  ts: "10:32", text: "Yes — standard dev setup. Route it to #procurement." },
    { id: "m-hr-10", senderId: "ai-hana", isAI: true, ts: "10:33", text: "Purchase requisition filed and cross-posted to #procurement.", card: { type: "purchase-req", refId: "pr-onboard-equip" } },
  ],

  /* Flow 2 — Smart procurement */
  "c-procurement": [
    { id: "m-proc-1", senderId: "ai-hana", isAI: true, ts: "10:33", text: "HR onboarding triggered: 3× Dev Laptop ($1,800 ea) + 3× Monitor ($450 ea). Total: $6,750. Purchase requisition filed.", card: { type: "purchase-req", refId: "pr-onboard-equip" } },
    { id: "m-proc-2", senderId: "ai-kara", isAI: true, ts: "10:34", text: "Budget check: IT Equipment has $18,200 remaining in Q2. This PR uses 37% of remaining budget. Within policy threshold.", card: { type: "budget-check", refId: "bc-it-equip" } },
    { id: "m-proc-3", senderId: "u-ken",   ts: "10:38", text: "Looks good. Generate the PO — route to TechDirect." },
    { id: "m-proc-4", senderId: "ai-kara", isAI: true, ts: "10:39", text: "PO generated and sent to TechDirect.", card: { type: "purchase-order", refId: "po-2026-0047" } },
    { id: "m-proc-5", senderId: "u-ken",   ts: "10:42", text: "Approved. Track delivery and update when goods arrive." },
    { id: "m-proc-6", senderId: "ai-kara", isAI: true, ts: "10:43", text: "PO confirmed. Expected delivery: Apr 30. I'll notify #finance when the invoice arrives and match it against this PO." },
  ],

  /* Flow 3 — Budget + PR/PO close-out */
  "c-finance": [
    { id: "m-fin-1", senderId: "u-ken",   ts: "11:00", text: "Finn, pull the Q2 budget status for Operations." },
    { id: "m-fin-2", senderId: "ai-finn", isAI: true, ts: "11:01", text: "Here's the Q2 Ops budget summary. 2 lines flagged over 5% threshold.", card: { type: "budget-summary", refId: "bs-q2-ops" } },
    { id: "m-fin-3", senderId: "u-ken",   ts: "11:03", text: "The Logistics line is 5.3% over — what's driving it?" },
    { id: "m-fin-4", senderId: "ai-finn", isAI: true, ts: "11:04", text: "Logistics overspend driven by 2 factors: (1) FleetOne emergency carrier diversion +$4,200, (2) NSK backlog surcharge +$2,500. Both traced to the carrier capacity issue in #logistics on Apr 8.", card: { type: "ai-insight", refId: "ins-logistics-over" } },
    { id: "m-fin-5", senderId: "u-dan",   ts: "11:20", text: "TechDirect invoice just arrived for the laptop PO — $6,750.", attachments: [{ name: "INV-TD-8842.pdf", size: "340 KB" }] },
    { id: "m-fin-6", senderId: "ai-finn", isAI: true, ts: "11:21", text: "Matching against PO-2026-0047. All items and amounts match.", card: { type: "bill-match", refId: "bm-techdirect" } },
    { id: "m-fin-7", senderId: "u-ken",   ts: "11:22", text: "Post it." },
    { id: "m-fin-8", senderId: "ai-finn", isAI: true, ts: "11:23", text: "Posted. Journal entry JE-2026-0412 created. AP subledger updated. IT Equipment budget: $18,200 → $11,450 remaining.", card: { type: "journal-entry", refId: "je-2026-0412" } },
  ],

  /* Flow 4 — CRM pipeline (ShieldNet 360) */
  "c-shieldnet": [
    { id: "m-sn-1",  senderId: "u-tom",   ts: "14:00", text: "Just got off a call with ShieldNet's CISO. They're interested in our 360 platform — 200 seats, enterprise tier." },
    { id: "m-sn-2",  senderId: "ai-mika", isAI: true, ts: "14:01", text: "I can create a deal from this thread. Detected: ShieldNet Inc, 200 seats × $180/seat/yr = $36,000 ARR, contact: CISO. Shall I file it?", cardType: "ai-suggest" },
    { id: "m-sn-3",  senderId: "u-tom",   ts: "14:02", text: "Yes — set close date to end of Q2." },
    { id: "m-sn-4",  senderId: "ai-mika", isAI: true, ts: "14:03", text: "Deal created.", card: { type: "deal", refId: "deal-shieldnet-360" } },
    { id: "m-sn-5",  senderId: "u-tom",   ts: "14:30", text: "ShieldNet wants a formal proposal with volume discount." },
    { id: "m-sn-6",  senderId: "ai-mika", isAI: true, ts: "14:31", text: "Generating a quote from the enterprise price list. 10% volume discount applied.", card: { type: "quote", refId: "q-shieldnet-1" } },
    { id: "m-sn-7",  senderId: "u-tom",   ts: "14:35", text: "Advance to proposal stage." },
    { id: "m-sn-8",  senderId: "ai-mika", isAI: true, ts: "14:36", text: "Deal advanced to Proposal. Follow-up activity scheduled for Thursday. Call logged.", card: { type: "deal", refId: "deal-shieldnet-360" } },
    { id: "m-sn-9",  senderId: "u-tom",   ts: "15:00", text: "ShieldNet accepted. They want to negotiate payment terms — Net-30 vs Net-45." },
    { id: "m-sn-10", senderId: "ai-mika", isAI: true, ts: "15:01", text: "Advancing to Negotiation. Risk assessment: Low — ShieldNet has strong credit, no outstanding AR. Recommend Net-30.", card: { type: "deal", refId: "deal-shieldnet-360" } },
    { id: "m-sn-11", senderId: "u-tom",   ts: "16:00", text: "Deal closed! ShieldNet signed on Net-30 terms." },
    { id: "m-sn-12", senderId: "ai-mika", isAI: true, ts: "16:01", text: "Congratulations! Marked as Won. Deal moved to Closed-Won at $36,000 ARR. Activity logged, contract workflow kicked off, and #finance notified to schedule the first invoice.", card: { type: "deal", refId: "deal-shieldnet-360" } },
  ],
};

/* ---------------- Threads ---------------- */
export const threads = {
  "thread-vendor-tasks": {
    id: "thread-vendor-tasks",
    channelId: "c-vendor",
    parentMessageId: "m-v-7",
    title: "Vendor review task breakdown",
    messages: [
      { id: "tr-1", senderId: "u-mira",  ts: "09:28", text: "Here are the open actions for this quarter:" },
      { id: "tr-2", senderId: "u-sofia", ts: "09:30", text: "I'll own the compliance check for NimbusLogix." },
      { id: "tr-3", senderId: "u-ken",   ts: "09:32", text: "@kara extract tasks and assign owners.", mentions: ["ai-kara"] },
      { id: "tr-4", senderId: "ai-kara", isAI: true, ts: "09:33", text: "Extracted 5 tasks with owners and due dates.", card: { type: "task-list", count: 5 } },
      { id: "tr-5", senderId: "u-mira",  ts: "09:35", text: "Looks right. Converting the risk items into a formal approval too." },
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
      { id: "pr-1", senderId: "u-ana",   ts: "14:31", text: "Scope: self-serve onboarding, doc vault, risk scoring, SSO." },
      { id: "pr-2", senderId: "u-ken",   ts: "14:32", text: "Priority on risk scoring — surfaces in ops." },
      { id: "pr-3", senderId: "ai-nina", isAI: true, ts: "14:34", text: "Reading sources — thread + research folder — drafting PRD." },
      { id: "pr-4", senderId: "ai-nina", isAI: true, ts: "14:37", text: "PRD draft v1 ready.", card: { type: "artifact", refId: "a-prd-vendor-portal" } },
    ],
    linkedObjects: [
      { type: "artifact", refId: "a-prd-vendor-portal" },
    ],
  },
};

/* ---------------- Tasks / Approvals / Artifacts / Forms / Base / Sheet ---------------- */
export const tasks = [
  { id: "tk-1", title: "Collect renewal terms for NimbusLogix",     ownerId: "u-sofia", due: "Fri",       status: "in-progress", isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-2", title: "Re-score Orbix risk based on latest audit", ownerId: "u-mira",  due: "Thu",       status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-3", title: "Confirm Paperstack contract owner",         ownerId: "u-ken",   due: "Wed",       status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-4", title: "Draft vendor portal PRD v1",                ownerId: "u-ana",   due: "Mon",       status: "in-progress", isAIExtracted: false, sourceThreadId: "thread-prd-vendor-portal" },
  { id: "tk-5", title: "Approve Orbix exception payment",           ownerId: "u-ken",   due: "Today",     status: "todo",        isAIExtracted: true,  sourceThreadId: "thread-vendor-tasks" },
  { id: "tk-6", title: "Pull logistics variance report",            ownerId: "u-dan",   due: "Fri",       status: "todo",        isAIExtracted: false, sourceThreadId: null },
  { id: "tk-7", title: "QBR slides for Globex",                     ownerId: "u-tom",   due: "Tue",       status: "done",        isAIExtracted: true,  sourceThreadId: null },
  { id: "tk-8", title: "SOC2 evidence staging",                     ownerId: "u-sofia", due: "Next week", status: "todo",        isAIExtracted: false, sourceThreadId: null },
];

export const approvals = {
  "ap-orbix": {
    id: "ap-orbix",
    title: "Orbix payment hold release",
    description: "Release $42,500 payment hold for Orbix to unblock two shipments. Vendor has remediated SLA breaches; risk re-scored to Medium.",
    amount: "$42,500",
    status: "pending",
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
      { step: "reviewed",  actorId: "u-ken",  ts: "Mon 14:30", note: "Standard renewal, no changes" },
      { step: "approved",  actorId: "u-ken",  ts: "Mon 14:32", note: "Approved — proceed with renewal" },
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
    templateId: "tpl-sop",
    version: "Draft v1",
    status: "Private Draft",
    sources: [
      { name: "vendor-contracts-q2.zip", kind: "file" },
      { name: "#vendor-management",      kind: "channel" },
    ],
    sections: [
      { heading: "Overview",           body: "This checklist covers Q2 vendor renewals for NimbusLogix, Orbix, and Paperstack. Use this document to track evidence collection and approval gates.", confidence: "high" },
      { heading: "Pre-renewal checks", body: "Verify current SLA performance, PII handling agreement [1], and insurance certificates. Flag deviations to the compliance owner.", confidence: "high" },
      { heading: "Risk re-scoring",    body: "Re-score risk using the updated scoring matrix [2]. Any vendor at 'High' requires executive sign-off prior to renewal.", confidence: "review" },
      { heading: "Approval flow",      body: "File a formal approval using the approval KApp. Attach remediation memos for any previously flagged issues.", confidence: "high" },
    ],
  },
  "a-qbr-globex": {
    id: "a-qbr-globex",
    type: "deck",
    title: "Globex Q2 QBR",
    template: "Deck",
    templateId: "tpl-qbr",
    version: "Draft v2",
    status: "Private Draft",
    sources: [{ name: "#deals", kind: "channel" }, { name: "CRM export", kind: "file" }],
    sections: [
      { heading: "Executive summary", body: "Globex expanded 18% YoY, led by logistics SKUs. Two risks flagged.", confidence: "high" },
      { heading: "Wins",              body: "Renewed master agreement; added 2 new regions.", confidence: "high" },
      { heading: "Risks",             body: "Implementation delay on analytics module; pricing exposure in EU.", confidence: "review" },
      { heading: "Next quarter",      body: "Accelerate analytics rollout; expand to LATAM pilot.", confidence: "high" },
    ],
    slides: [
      {
        heading: "Executive Summary",
        layout: "title-bullets",
        bullets: [
          "Globex expanded 18% YoY, led by logistics SKUs",
          "Two risks flagged for Q3 mitigation",
          "Renewal on track; analytics module delayed 2 weeks",
        ],
        speakerNotes: "Open with the headline number. Globex is a reference account; lean on the YoY growth story. Acknowledge risks early so leadership knows we have a plan.",
      },
      {
        heading: "Wins",
        layout: "title-bullets",
        bullets: [
          "Master agreement renewed through FY27",
          "Added 2 new regions (LATAM, APAC)",
          "Reference customer converted from deal thread",
        ],
        speakerNotes: "Celebrate the master agreement renewal. Mention the reference customer by name and tie back to the deal thread the AI pulled from.",
      },
      {
        heading: "Risks",
        layout: "title-bullets",
        bullets: [
          "Analytics module implementation delayed 2 weeks",
          "EU pricing exposure from currency shift (~$180k)",
          "Executive sponsor change on FleetOne account",
        ],
        speakerNotes: "Be direct about the analytics delay. We have a mitigation plan — do not sugarcoat. EU pricing exposure is the real risk to flag.",
      },
      {
        heading: "Next Quarter",
        layout: "title-bullets",
        bullets: [
          "Accelerate analytics rollout (target: end of Q3)",
          "Expand to LATAM pilot with 3 new accounts",
          "Dedicated CSM motion for at-risk accounts",
        ],
        speakerNotes: "End on the forward plan. Analytics acceleration is the key commitment. LATAM pilot is stretch — set expectations.",
      },
    ],
  },
  "a-prd-vendor-portal": {
    id: "a-prd-vendor-portal",
    type: "doc",
    title: "Vendor Portal v2 — PRD",
    template: "Standard PRD",
    templateId: "tpl-prd",
    version: "Draft v1",
    status: "Private Draft",
    sources: [
      { name: "thread: Vendor Portal v2 scope", kind: "thread" },
      { name: "research/competitor-scan.pdf",   kind: "file" },
      { name: "#specs knowledge",               kind: "knowledge" },
    ],
    sections: [
      { heading: "Overview",          body: "Vendor Portal v2 modernizes the onboarding experience, introduces a document vault, and exposes live risk scores to vendor admins [1].", confidence: "high" },
      { heading: "Problem Statement", body: "Today vendors onboard via email and shared drives, leading to manual effort and inconsistent compliance evidence [2].", confidence: "high" },
      { heading: "Requirements",      body: "Self-serve onboarding, doc vault with expiration tracking, real-time risk scoring, SSO via OIDC, admin audit trail.", confidence: "review" },
      { heading: "Success Metrics",   body: "Onboarding time reduced 60%; evidence completeness > 95%; admin NPS > 40.", confidence: "high" },
      { heading: "Open Questions",    body: "SSO provider list; tenant-level data residency; scoring model ownership.", confidence: "review" },
    ],
  },
};

/* ---------------- Business-suite reference data (HR / Procurement / Finance / CRM) ---------------- */
// Backs the new inline cards shown in the HR, procurement, finance, and
// ShieldNet sales channels. Keyed by refId used inside each message's
// `card.refId`. Lookup helpers are exported at the bottom of this file.

export const leaveBalances = {
  "lb-sofia": {
    id: "lb-sofia",
    employeeId: "u-sofia",
    asOf: "Today",
    lines: [
      { type: "Annual leave",   accrued: 15, used: 3, remaining: 12 },
      { type: "Sick leave",     accrued: 10, used: 2, remaining: 8  },
      { type: "Personal days",  accrued: 3,  used: 0, remaining: 3  },
    ],
  },
};

export const leaveRequests = {
  "lr-sofia-1": {
    id: "lr-sofia-1",
    employeeId: "u-sofia",
    type: "Annual leave",
    startDate: "Mon Apr 27",
    endDate: "Wed Apr 29",
    days: 3,
    reason: "Family event",
    status: "approved",
    approverId: "u-ken",
    submittedAt: "10:08",
    decidedAt: "10:16",
    balanceBefore: 12,
    balanceAfter: 9,
    calendarBlocked: true,
  },
};

export const purchaseReqs = {
  "pr-onboard-equip": {
    id: "pr-onboard-equip",
    number: "PR-2026-0112",
    title: "Onboarding equipment — 3 new hires (May 5)",
    requestorId: "u-mira",
    submittedAt: "10:33",
    items: [
      { name: "Dev Laptop (std config)",  qty: 3, unitPrice: 1800, total: 5400 },
      { name: "External Monitor 27\"",    qty: 3, unitPrice: 450,  total: 1350 },
    ],
    subtotal: 6750,
    currency: "USD",
    costCenter: "IT Equipment",
    status: "Approved",
    linkedChannelId: "c-procurement",
    linkedPOId: "po-2026-0047",
    sourceChannelId: "c-hr-people",
  },
};

export const purchaseOrders = {
  "po-2026-0047": {
    id: "po-2026-0047",
    number: "PO-2026-0047",
    supplier: "TechDirect Inc",
    supplierEmail: "orders@techdirect.com",
    items: [
      { name: "Dev Laptop (std config)",  qty: 3, unitPrice: 1800, total: 5400 },
      { name: "External Monitor 27\"",    qty: 3, unitPrice: 450,  total: 1350 },
    ],
    total: 6750,
    currency: "USD",
    issuedAt: "10:39",
    expectedDelivery: "Apr 30",
    status: "Confirmed",
    linkedPRId: "pr-onboard-equip",
  },
};

export const budgetChecks = {
  "bc-it-equip": {
    id: "bc-it-equip",
    costCenter: "IT Equipment",
    period: "Q2 FY26",
    budgeted: 30000,
    spent: 11800,
    remaining: 18200,
    proposedCharge: 6750,
    remainingAfter: 11450,
    percentOfRemaining: 37,
    thresholdPercent: 50,
    status: "within-policy",
  },
};

export const budgetSummaries = {
  "bs-q2-ops": {
    id: "bs-q2-ops",
    title: "Q2 FY26 — Operations",
    asOf: "Today",
    thresholdPct: 5.0,
    lines: [
      { name: "Vendor spend",      budget: 190000, actual: 188600, variancePct: -0.7, flag: null   },
      { name: "Logistics",         budget: 102000, actual: 107406, variancePct:  5.3, flag: "over" },
      { name: "Compliance tools",  budget:  22500, actual:  22600, variancePct:  0.4, flag: null   },
      { name: "AI compute",        budget:  18000, actual:  17200, variancePct: -4.4, flag: null   },
      { name: "IT Equipment",      budget:  30000, actual:  11800, variancePct: -60.7, flag: null  },
      { name: "Software licenses", budget:  35000, actual:  35900, variancePct:  2.6, flag: null   },
      { name: "Contractors",       budget:  50000, actual:  52400, variancePct:  4.8, flag: null   },
      { name: "Training",          budget:  10000, actual:  15700, variancePct: 57.0, flag: "over" },
    ],
  },
};

export const aiInsights = {
  "ins-logistics-over": {
    id: "ins-logistics-over",
    title: "Logistics overspend — driver analysis",
    topic: "Q2 Logistics variance",
    bullets: [
      { label: "FleetOne emergency carrier diversion", amount: "+$4,200" },
      { label: "NSK backlog surcharge",                amount: "+$2,500" },
    ],
    totalVariance: "+$6,700 (5.3%)",
    tracedTo: { thread: "Carrier capacity — 3-day NSK backlog", channel: "#logistics", date: "Apr 8" },
    recommendation: "Pre-commit FleetOne priority SLA for May to avoid repeat.",
    confidence: "high",
  },
};

export const billMatches = {
  "bm-techdirect": {
    id: "bm-techdirect",
    invoice: { number: "INV-TD-8842", supplier: "TechDirect Inc", amount: 6750, date: "Today" },
    poId: "po-2026-0047",
    lineChecks: [
      { name: "Dev Laptop (std config)", poQty: 3, invQty: 3, poUnit: 1800, invUnit: 1800, match: true },
      { name: "External Monitor 27\"",   poQty: 3, invQty: 3, poUnit:  450, invUnit:  450, match: true },
    ],
    totalsMatch: true,
    exceptions: [],
    status: "ready-to-post",
  },
};

export const journalEntries = {
  "je-2026-0412": {
    id: "je-2026-0412",
    number: "JE-2026-0412",
    postedAt: "11:23",
    description: "TechDirect laptop + monitor — PO-2026-0047 invoice",
    lines: [
      { account: "6200 — IT Equipment (expense)",      debit: 6750, credit: 0    },
      { account: "2010 — Accounts Payable · TechDirect", debit: 0,    credit: 6750 },
    ],
    total: 6750,
    relatedPOId: "po-2026-0047",
    postedById: "u-ken",
  },
};

export const deals = {
  "deal-shieldnet-360": {
    id: "deal-shieldnet-360",
    name: "ShieldNet — 360 Platform",
    account: "ShieldNet Inc",
    contactRole: "CISO",
    seats: 200,
    pricePerSeat: 180,
    term: "Annual",
    arr: 36000,
    currency: "USD",
    stage: "Closed Won",
    closeDate: "End of Q2",
    ownerId: "u-tom",
    risk: "Low",
    terms: "Net-30",
    stageHistory: [
      { stage: "Qualified",   at: "14:03" },
      { stage: "Proposal",    at: "14:36" },
      { stage: "Negotiation", at: "15:01" },
      { stage: "Closed Won",  at: "16:01" },
    ],
  },
};

export const quotes = {
  "q-shieldnet-1": {
    id: "q-shieldnet-1",
    number: "Q-2026-0118",
    dealId: "deal-shieldnet-360",
    items: [
      { name: "ShieldNet 360 — Enterprise tier", qty: 200, unit: 180, subtotal: 36000 },
    ],
    subtotal: 36000,
    discountPct: 10,
    discount: 3600,
    total: 32400,
    currency: "USD",
    terms: "Net-30 (proposed)",
    validUntil: "End of Q2",
    status: "Sent",
  },
};

export const forms = {
  "f-vendor-intake": {
    id: "f-vendor-intake",
    title: "New Vendor Intake Form",
    fields: [
      { id: "name",     label: "Vendor Name",   type: "text",   prefill: "NimbusLogix",             aiPrefilled: true  },
      { id: "category", label: "Category",      type: "select", options: ["Software", "Logistics", "Consulting", "Hardware"], prefill: "Logistics", aiPrefilled: true },
      { id: "email",    label: "Contact Email", type: "email",  prefill: "vendors@nimbuslogix.com", aiPrefilled: true  },
      { id: "annual",   label: "Annual Value",  type: "text",   prefill: "$120,000",                 aiPrefilled: false },
      { id: "risk",     label: "Risk Level",    type: "select", options: ["Low", "Medium", "High"],  prefill: "Medium",   aiPrefilled: true },
    ],
  },
};

export const baseRows = [
  { name: "NimbusLogix",      category: "Logistics", risk: "Medium", value: "$120,000", status: "Renewing", lastReview: "Apr 12" },
  { name: "Orbix",            category: "Logistics", risk: "Medium", value: "$42,500",  status: "On Hold",  lastReview: "Apr 15" },
  { name: "Paperstack",       category: "Software",  risk: "Low",    value: "$18,000",  status: "Active",   lastReview: "Mar 29" },
  { name: "FleetOne",         category: "Logistics", risk: "Low",    value: "$88,000",  status: "Active",   lastReview: "Mar 30" },
  { name: "Globex Analytics", category: "Software",  risk: "High",   value: "$210,000", status: "Review",   lastReview: "Apr 02" },
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
  // Pre-scripted before/after section edits for the contextual section chat.
  sectionEdits: {
    Overview: {
      before: "Vendor Portal v2 modernizes the onboarding experience, introduces a document vault, and exposes live risk scores to vendor admins [1].",
      after:  "Vendor Portal v2 modernizes the onboarding experience, introduces a document vault with expiration tracking, and exposes live risk scores to vendor admins. Primary users are vendor admins and Acme's compliance team [1].",
    },
    "Problem Statement": {
      before: "Today vendors onboard via email and shared drives, leading to manual effort and inconsistent compliance evidence [2].",
      after:  "Today vendors onboard via email and shared drives, leading to manual effort and inconsistent compliance evidence. Ops spends an estimated 9 hours/vendor on manual follow-up [2].",
    },
    Requirements: {
      before: "Self-serve onboarding, doc vault with expiration tracking, real-time risk scoring, SSO via OIDC, admin audit trail.",
      after:  "Self-serve onboarding, doc vault with expiration tracking, real-time risk scoring with tier thresholds, SSO via OIDC, SCIM provisioning, admin audit trail with immutable export.",
    },
    "Success Metrics": {
      before: "Onboarding time reduced 60%; evidence completeness > 95%; admin NPS > 40.",
      after:  "Onboarding time reduced 60% (baseline 9h); evidence completeness > 95%; admin NPS > 40; time-to-first-shipment reduced 30%.",
    },
    "Open Questions": {
      before: "SSO provider list; tenant-level data residency; scoring model ownership.",
      after:  "SSO provider list (Okta, Azure AD, Google); tenant-level data residency (US/EU); scoring model ownership (Ops vs Risk team).",
    },
  },
};

/* ---------------- AI Co-pilot data (inline, human-driven) ---------------- */

// Document co-pilot: pre-scripted rewrite / shorten / expand / tone / translate
// variants keyed by section heading. The inline floating toolbar swaps selected
// text with one of these based on the button clicked.
export const docCopilotSuggestions = {
  Overview: {
    rewrite: "Vendor Portal v2 rebuilds onboarding from the ground up, introduces a compliance-grade document vault, and surfaces live risk scores to every vendor admin.",
    shorten: "Vendor Portal v2 modernizes onboarding, adds a doc vault, and exposes live risk scores.",
    expand:  "Vendor Portal v2 modernizes the onboarding experience end-to-end, introduces a document vault with expiration tracking and audit trail, and exposes live risk scores to vendor admins alongside the compliance team, replacing today's fragmented email + drive workflow.",
    tone:    "Vendor Portal v2 represents a decisive step forward: a modern onboarding system, a first-class document vault, and live risk scoring surfaced directly to every vendor admin.",
    translate: "Vendor Portal v2 moderniza la experiencia de incorporación, introduce una bóveda de documentos y expone puntuaciones de riesgo en vivo a los administradores de proveedores.",
  },
  "Problem Statement": {
    rewrite: "Vendors today onboard through ad-hoc email threads and shared drives, producing manual work and inconsistent evidence.",
    shorten: "Today's onboarding is manual email + drives, with inconsistent evidence.",
    expand:  "Today vendors onboard via email threads and shared drives, creating significant manual follow-up (9 hours/vendor on average), inconsistent compliance evidence, and no single source of truth for contract status or risk posture.",
    tone:    "The current onboarding flow is unsustainable: manual, inconsistent, and actively blocking our ability to scale.",
    translate: "Hoy los proveedores se incorporan por correo electrónico y unidades compartidas, lo que genera trabajo manual y evidencia inconsistente.",
  },
  Requirements: {
    rewrite: "Scope covers: self-serve onboarding, a document vault with expiration tracking, real-time risk scoring, OIDC SSO, and an admin audit trail.",
    shorten: "Self-serve onboarding, doc vault, live risk scoring, SSO, audit trail.",
    expand:  "Self-serve onboarding with progressive disclosure, document vault with expiration tracking and renewal reminders, real-time risk scoring with tier thresholds, SSO via OIDC (Okta, Azure AD, Google), SCIM provisioning, and an immutable admin audit trail exportable to SOC2 evidence packs.",
    tone:    "Requirements are non-negotiable: self-serve onboarding, compliant document vault, real-time risk scoring, enterprise SSO, and a complete audit trail.",
    translate: "Incorporación autoservicio, bóveda de documentos, puntuación de riesgo en tiempo real, SSO vía OIDC y registro de auditoría de administrador.",
  },
  "Success Metrics": {
    rewrite: "Target metrics: 60% reduction in onboarding time, evidence completeness above 95%, and admin NPS above 40.",
    shorten: "Onboarding −60%, evidence ≥95%, admin NPS ≥40.",
    expand:  "Onboarding time reduced 60% from a 9-hour baseline; evidence completeness > 95% measured at quarterly compliance review; admin NPS > 40; time-to-first-shipment reduced 30%; SOC2 evidence export < 15 minutes.",
    tone:    "We will ship this when onboarding drops 60%, evidence clears 95%, and admin NPS exceeds 40. No earlier.",
    translate: "Tiempo de incorporación reducido 60%; integridad de evidencia > 95%; NPS de administrador > 40.",
  },
  "Open Questions": {
    rewrite: "Unresolved: which SSO providers to support in v2, data residency tier, and scoring model ownership.",
    shorten: "Open: SSO list, residency, scoring owner.",
    expand:  "Open questions: which SSO providers (Okta, Azure AD, Google, Ping?) ship in v2; tenant-level data residency (US/EU/APAC) commitment; scoring model ownership (Ops vs Risk team) and escalation path for disputed scores.",
    tone:    "These must be resolved before spec freeze: SSO provider list, data residency commitment, and scoring model ownership.",
    translate: "Abiertas: lista de proveedores SSO, residencia de datos por inquilino y propiedad del modelo de puntuación.",
  },
  "Executive summary": {
    rewrite: "Q2 delivered 18% YoY growth at Globex, concentrated in logistics SKUs, with two risks flagged for Q3 mitigation.",
    shorten: "Globex grew 18% YoY in Q2; two Q3 risks flagged.",
    expand:  "Q2 delivered 18% YoY growth at Globex, concentrated in logistics SKUs, with the master agreement renewed through FY27 and two risks (analytics delay, EU FX exposure) flagged for Q3 mitigation.",
    tone:    "Q2 was decisive for Globex: 18% YoY growth, renewal locked, and a clear plan for the two risks we are calling out.",
    translate: "Globex creció 18% interanual en el segundo trimestre; se marcaron dos riesgos para mitigación en el tercer trimestre.",
  },
};

// Doc-level chat: pre-scripted Q&A for the "Ask AI about this document" input
// in the right aside.
export const docCopilotChatResponses = [
  { match: /authoritative|tone.*authoritative|more.*formal/i, response: "Tone updated across 3 sections.", effect: "toast" },
  { match: /shorter|tighten|condense/i,                       response: "Document shortened by 22%. Review changes.", effect: "toast" },
  { match: /translate|spanish|español/i,                      response: "Translated 5 sections to Spanish. Draft v2 saved.", effect: "toast" },
  { match: /metric|quantif/i,                                 response: "Added 4 quantitative anchors across Metrics + Overview.", effect: "toast" },
  { match: /risk|flag/i,                                      response: "Flagged 2 under-supported claims in Requirements.", effect: "toast" },
];

// Ghost autocomplete suggestions keyed by section heading (doc co-pilot).
export const docGhostCompletions = {
  Overview:          "Primary users are vendor admins and Acme's compliance team.",
  "Problem Statement": "Ops spends an estimated 9 hours per vendor on manual follow-up.",
  Requirements:      "SCIM provisioning and immutable audit export are required for SOC2.",
  "Success Metrics": "Time-to-first-shipment reduced 30% is a stretch goal.",
  "Open Questions":  "Confirm scoring model ownership split between Ops and Risk.",
  "Executive summary": "Renewal locked through FY27; two risks queued for Q3 mitigation.",
};

// Sheet co-pilot: formula suggestions, column insights, NL query → highlight.
export const sheetCopilotData = {
  formulaSuggestions: [
    { match: /total.*variance|overall.*variance|net.*variance/i,
      formula: "=SUM(F2:F8)/COUNT(F2:F8)",
      result:  "-2.1%",
      explain: "Average variance across all 7 categories.",
    },
    { match: /over.*budget|positive.*variance|exceeds/i,
      formula: "=COUNTIF(F2:F8,\">0%\")",
      result:  "4 categories",
      explain: "Logistics, Compliance tools, Software licenses, Contractors all over budget.",
    },
    { match: /under.*budget|negative.*variance|savings/i,
      formula: "=COUNTIF(F2:F8,\"<0%\")",
      result:  "3 categories",
      explain: "Vendor spend, AI compute, Training all under budget.",
    },
    { match: /highest|max|worst/i,
      formula: "=INDEX(A2:A8,MATCH(MAX(F2:F8),F2:F8,0))",
      result:  "Logistics (+5.3%)",
      explain: "Logistics is the most over-budget line.",
    },
    { match: /lowest|min|best.*saving/i,
      formula: "=INDEX(A2:A8,MATCH(MIN(F2:F8),F2:F8,0))",
      result:  "Training (-22.0%)",
      explain: "Training has the largest underspend.",
    },
  ],
  columnInsights: {
    Category:     ["Categorize values", "7 categories detected — grouped by Ops / Software / People"],
    "Q1 Budget":  ["Summarize column", "Q1 total budget: $402,000 · Average: $57,429"],
    "Q1 Actual":  ["Summarize column", "Q1 total actual: $400,900 · Variance vs budget: -0.3%"],
    "Q2 Budget":  ["Summarize column", "Q2 total budget: $427,500 · +6.3% vs Q1"],
    "Q2 Actual":  ["Summarize column", "Q2 total actual: $433,200 · Variance vs budget: +1.3%"],
    Variance:     ["Detect anomalies", "Training variance (-22%) is a 3σ outlier — investigate"],
  },
  nlQueries: [
    { match: /over.*budget|positive/i,     highlightPredicate: v => v.startsWith("+"), message: "Highlighted 4 rows over budget." },
    { match: /under.*budget|saving|negative/i, highlightPredicate: v => v.startsWith("-"), message: "Highlighted 3 rows under budget." },
    { match: /logistics/i,                  highlightPredicate: (v, row) => row[0].toLowerCase().includes("logistics"), message: "Highlighted Logistics row." },
    { match: /software|license/i,           highlightPredicate: (v, row) => /software|license/i.test(row[0]), message: "Highlighted Software-related rows." },
  ],
  cellExplanations: {
    // Variance cell formula + explanation shown on click (column 5 = Variance).
    variance: "=(Q2 Actual − Q2 Budget) / Q2 Budget · Expressed as a percentage. Negative = under budget, positive = over budget.",
  },
};

/* ---------------- Recipes + Action Launcher groups ---------------- */
export const recipes = [
  { id: "r-summarize",      display: "Summarize thread", group: "Analyze", intake: ["Audience", "Length"],            sources: ["current thread"] },
  { id: "r-extract-tasks",  display: "Extract tasks",    group: "Plan",    intake: ["Owner hints", "Due date rules"], sources: ["current thread"] },
  { id: "r-draft-prd",      display: "Draft PRD",        group: "Create",  intake: ["Goal", "Audience", "Template"],  sources: ["current thread", "linked files", "channel knowledge"] },
  { id: "r-draft-proposal", display: "Draft Proposal",   group: "Create",  intake: ["Customer", "Template"],          sources: ["deal thread", "CRM export"] },
  { id: "r-create-qbr",     display: "Create QBR",       group: "Create",  intake: ["Customer", "Quarter"],           sources: ["deal thread", "CRM export"] },
];

/* ---------------- Core Intents (v3) ----------------
   Unified intent taxonomy — users pick what they want to *do* (Create,
   Analyze, Plan, Approve) and the surface decides whether an AI Employee
   (autonomous) or AI Co-pilot (inline) flow fits. `mode` on each action
   is a hint the launcher renders as a subtle badge ("Auto" / "Inline"),
   not a separate top-level section, so the taxonomy scales as skills,
   templates, and connectors grow. */
export const coreIntents = [
  {
    id: "create",
    label: "Create",
    sub: "Docs, slides, sheets, schedules",
    icon: "plus",
    actions: [
      { id: "copilot-doc",     label: "Document",  mode: "inline", sub: "Write with inline AI co-pilot",            icon: "D" },
      { id: "copilot-slides",  label: "Slides",    mode: "inline", sub: "Per-slide AI + layout suggestions",        icon: "K" },
      { id: "copilot-sheet",   label: "Sheet",     mode: "inline", sub: "NL formula bar + cell AI + visualize",     icon: "≡" },
      { id: "create-schedule", label: "Schedule",  mode: "auto",   sub: "AI-drafted agenda + invite",               icon: "📅" },
      { id: "create-prd",      label: "PRD",       mode: "auto",   recipeId: "r-draft-prd",      templateId: "tpl-prd",      sub: "Structured product requirements", icon: "R" },
      { id: "create-qbr",      label: "QBR Deck",  mode: "auto",   recipeId: "r-create-qbr",     templateId: "tpl-qbr",      sub: "Quarterly business review",        icon: "Q" },
      { id: "create-sop",      label: "SOP",       mode: "auto",   recipeId: "r-draft-prd",      templateId: "tpl-sop",      sub: "Standard operating procedure",     icon: "S" },
      { id: "create-proposal", label: "Proposal",  mode: "auto",   recipeId: "r-draft-proposal", templateId: "tpl-proposal", sub: "Customer-ready proposal",          icon: "P" },
      { id: "collect-form",    label: "Form",      mode: "auto",   sub: "Collect structured input",                 icon: "F" },
    ],
  },
  {
    id: "analyze",
    label: "Analyze",
    sub: "Summarize, compare, extract, visualize",
    icon: "filter",
    actions: [
      { id: "analyze-summary", label: "Summarize", mode: "auto",   recipeId: "r-summarize",     sub: "Key points with sources", icon: "Σ" },
      { id: "analyze-extract", label: "Extract",   mode: "auto",   recipeId: "r-extract-tasks", sub: "Pull data out of threads", icon: "E" },
      { id: "analyze-compare", label: "Compare",   mode: "auto",   sub: "Side-by-side highlights",                   icon: "⇄" },
      { id: "analyze-report",  label: "Report",    mode: "auto",   sub: "Structured rollup",                         icon: "R" },
      { id: "copilot-sheet-analyze", label: "Spreadsheet AI", mode: "inline", sub: "Cell-level explain + NL formula", icon: "Σ" },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    sub: "Tasks, projects, agendas, trackers",
    icon: "tasks",
    actions: [
      { id: "plan-tasks",   label: "Tasks",        mode: "auto", sub: "Extract action items",       icon: "✓" },
      { id: "plan-project", label: "Project Plan", mode: "auto", sub: "Milestones + owners",        icon: "P" },
      { id: "plan-agenda",  label: "Agenda",       mode: "auto", sub: "Structured meeting plan",    icon: "A" },
      { id: "track-risk",   label: "Risk Register",mode: "auto", sub: "Flag + score risks",         icon: "!" },
      { id: "track-budget", label: "Budget",       mode: "auto", sub: "Track plan vs actual",       icon: "$" },
    ],
  },
  {
    id: "approve",
    label: "Approve",
    sub: "Purchase, exception, policy, budget",
    icon: "approve",
    actions: [
      { id: "approve-purchase",  label: "Purchase",  mode: "auto", sub: "Route PO for sign-off",         icon: "$" },
      { id: "approve-exception", label: "Exception", mode: "auto", sub: "Policy exception request",      icon: "!" },
      { id: "approve-policy",    label: "Policy",    mode: "auto", sub: "Policy change",                 icon: "§" },
      { id: "approve-budget",    label: "Budget",    mode: "auto", sub: "Budget approval",               icon: "B" },
    ],
  },
];

/* Legacy alias so older callers that imported `actionGroups` keep working
   — the launcher and home screen now prefer `coreIntents`. */
export const actionGroups = coreIntents.map(i => ({
  group: i.label,
  actions: i.actions.map(a => ({ ...a })),
}));

/* ---------------- Templates (v2: curated with hidden meta-prompts + visual metadata) ---------------- */
export const templates = {
  "tpl-prd": {
    id: "tpl-prd",
    name: "Standard PRD",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    iconLarge: "doc-large",
    usageCount: 2400,
    tags: ["product", "engineering", "requirements", "prd", "spec"],
    featured: true,
    preview: "Ship specs engineering can estimate from.",
    description: "Product Requirements Document with problem, requirements, metrics, and open questions.",
    curatedBy: "Acme PM Guild",
    metaPrompt: "You are writing a PRD. Cite every assumption with the thread or file it came from. Prefer on-device summarization for PII. Use Acme tone: neutral, specific, quantitative. Keep sections concise and actionable.",
    required: [
      { id: "goal",     label: "Goal",     type: "textarea", placeholder: "What shipping this doc achieves, in 1–2 sentences." },
      { id: "audience", label: "Audience", type: "chips",    options: ["Engineering", "Leadership", "Customer-facing", "Compliance"] },
      { id: "tone",     label: "Tone",     type: "select",   options: ["Neutral", "Authoritative", "Narrative"] },
    ],
    optional: [
      { id: "length",     label: "Length target", type: "select",   options: ["Short (1–2 pages)", "Standard (3–4 pages)", "Long (5+ pages)"] },
      { id: "exclusions", label: "Out of scope",  type: "textarea" },
    ],
    outputSections: ["Overview", "Problem Statement", "Requirements", "Success Metrics", "Open Questions"],
  },
  "tpl-sop": {
    id: "tpl-sop",
    name: "SOP",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #10b981, #14b8a6)",
    iconLarge: "doc-large",
    usageCount: 1680,
    tags: ["operations", "procedure", "compliance", "sop", "runbook"],
    featured: false,
    preview: "Repeatable procedures with owners and evidence.",
    description: "Standard Operating Procedure with steps, owners, and evidence checklist.",
    curatedBy: "Ops Council",
    metaPrompt: "You are writing an SOP. Every step must have an owner. Reference the canonical risk matrix. Flag PII at each step.",
    required: [
      { id: "subject", label: "Subject", type: "text",   placeholder: "What operation does this SOP cover?" },
      { id: "owner",   label: "Owner",   type: "select", options: ["Ops", "Compliance", "Logistics", "Finance"] },
    ],
    optional: [
      { id: "trigger", label: "Trigger", type: "text", placeholder: "When should this SOP be invoked?" },
    ],
    outputSections: ["Overview", "Pre-renewal checks", "Risk re-scoring", "Approval flow"],
  },
  "tpl-proposal": {
    id: "tpl-proposal",
    name: "Proposal",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #f59e0b, #f97316)",
    iconLarge: "doc-large",
    usageCount: 3120,
    tags: ["sales", "proposal", "pricing", "customer", "scope"],
    featured: true,
    preview: "Customer-ready proposal in minutes, not hours.",
    description: "Customer-facing proposal with scope, pricing, and success criteria.",
    curatedBy: "Sales Enablement",
    metaPrompt: "You are writing a customer proposal. Match the customer's tone. Prices must be cited from the CRM export.",
    required: [
      { id: "customer", label: "Customer", type: "text" },
      { id: "scope",    label: "Scope",    type: "textarea" },
    ],
    optional: [
      { id: "deadline", label: "Deadline", type: "text" },
    ],
    outputSections: ["Executive summary", "Scope", "Pricing", "Success criteria", "Next steps"],
  },
  "tpl-qbr": {
    id: "tpl-qbr",
    name: "QBR Deck",
    kind: "deck",
    category: "Decks",
    color: "linear-gradient(135deg, #ec4899, #f43f5e)",
    iconLarge: "deck-large",
    usageCount: 1950,
    tags: ["sales", "qbr", "review", "deck", "quarterly"],
    featured: false,
    preview: "Close the quarter with a deck that writes itself.",
    description: "Quarterly Business Review: wins, risks, next quarter.",
    curatedBy: "Sales Enablement",
    metaPrompt: "You are writing a QBR deck. Wins and risks must cite the CRM or deal thread. Lead with the executive summary.",
    required: [
      { id: "customer", label: "Customer", type: "text" },
      { id: "quarter",  label: "Quarter",  type: "select", options: ["Q1", "Q2", "Q3", "Q4"] },
    ],
    optional: [
      { id: "attendees", label: "Attendees", type: "text" },
    ],
    outputSections: ["Executive summary", "Wins", "Risks", "Next quarter"],
  },
  "tpl-rfc": {
    id: "tpl-rfc",
    name: "RFC",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    iconLarge: "doc-large",
    usageCount: 980,
    tags: ["engineering", "architecture", "rfc", "design", "technical"],
    featured: false,
    preview: "Make architectural trade-offs legible to reviewers.",
    description: "Technical Request for Comments for architectural decisions.",
    curatedBy: "Eng Guild",
    metaPrompt: "You are writing a technical RFC. Be explicit about alternatives considered and trade-offs.",
    required: [
      { id: "problem",      label: "Problem",                 type: "textarea" },
      { id: "alternatives", label: "Alternatives considered", type: "textarea" },
    ],
    optional: [],
    outputSections: ["Summary", "Motivation", "Design", "Alternatives", "Risks"],
  },
  "tpl-meeting-notes": {
    id: "tpl-meeting-notes",
    name: "Meeting Notes",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #64748b, #334155)",
    iconLarge: "doc-large",
    usageCount: 4120,
    tags: ["meeting", "notes", "decisions", "actions", "recap"],
    featured: true,
    preview: "Auto-structured notes pulled from a thread.",
    description: "Meeting notes with attendees, decisions, action items, and source pins.",
    curatedBy: "Acme Ops Council",
    metaPrompt: "You are structuring meeting notes from a chat thread. Pull decisions, action items with owners, and open questions. Cite each item back to the message it came from.",
    required: [
      { id: "subject",   label: "Meeting subject", type: "text",     placeholder: "Weekly ops sync, kickoff, retrospective…" },
      { id: "attendees", label: "Attendees",       type: "text",     placeholder: "Names or @mentions of who was present." },
    ],
    optional: [
      { id: "goals", label: "Meeting goals", type: "textarea", placeholder: "What were you trying to decide or align on?" },
    ],
    outputSections: ["Attendees", "Decisions", "Action Items", "Open Questions"],
  },
  "tpl-status-update": {
    id: "tpl-status-update",
    name: "Weekly Status Update",
    kind: "doc",
    category: "Documents",
    color: "linear-gradient(135deg, #0ea5e9, #10b981)",
    iconLarge: "doc-large",
    usageCount: 2860,
    tags: ["status", "weekly", "update", "report", "progress"],
    featured: false,
    preview: "Ship a tight weekly update leadership will actually read.",
    description: "Concise weekly status: wins, risks, blockers, next week.",
    curatedBy: "Leadership Comms",
    metaPrompt: "You are writing a weekly status update. Keep it tight and scannable. Lead with the top 3 wins. Be honest about risks and blockers. End with next week's focus.",
    required: [
      { id: "team",   label: "Team or project", type: "text",     placeholder: "Which team / initiative is this update for?" },
      { id: "period", label: "Period",          type: "select",   options: ["This week", "Last week", "Last 2 weeks"] },
    ],
    optional: [
      { id: "audience", label: "Audience", type: "chips", options: ["Leadership", "Cross-functional", "Broad company"] },
    ],
    outputSections: ["Summary", "Wins", "Risks & Blockers", "Next Week"],
  },
  "tpl-budget-analysis": {
    id: "tpl-budget-analysis",
    name: "Budget Analysis",
    kind: "sheet",
    category: "Sheets",
    color: "linear-gradient(135deg, #22c55e, #059669)",
    iconLarge: "sheet-large",
    usageCount: 1540,
    tags: ["finance", "budget", "analysis", "spreadsheet", "variance"],
    featured: false,
    preview: "Plan vs. actual with variance flags, out of the box.",
    description: "Spreadsheet template for plan vs. actual, variance, and forecast.",
    curatedBy: "Finance Ops",
    metaPrompt: "You are preparing a budget analysis sheet. Generate columns for Plan, Actual, Variance ($), Variance (%), and Notes. Call out any line items exceeding 10% variance.",
    required: [
      { id: "period",  label: "Period",  type: "select", options: ["This month", "This quarter", "Year to date"] },
      { id: "scope",   label: "Scope",   type: "text",   placeholder: "Department, project, or cost center." },
    ],
    optional: [
      { id: "threshold", label: "Variance alert threshold (%)", type: "text", placeholder: "e.g. 10" },
    ],
    outputSections: ["Summary", "Line items", "Variance callouts", "Forecast"],
  },
  "tpl-pipeline-forecast": {
    id: "tpl-pipeline-forecast",
    name: "Pipeline Forecast",
    kind: "sheet",
    category: "Sheets",
    color: "linear-gradient(135deg, #f97316, #ef4444)",
    iconLarge: "sheet-large",
    usageCount: 1220,
    tags: ["sales", "pipeline", "forecast", "revenue", "deals"],
    featured: false,
    preview: "Forecast committed, best case, and pipeline — with risk.",
    description: "Sales pipeline forecast with committed, best case, and risk-adjusted views.",
    curatedBy: "Sales Enablement",
    metaPrompt: "You are producing a pipeline forecast sheet. Columns: Deal, Owner, Stage, Close date, ARR, Confidence, Risk notes. Summarize committed vs. best case at the top.",
    required: [
      { id: "quarter", label: "Quarter", type: "select", options: ["Q1", "Q2", "Q3", "Q4"] },
      { id: "segment", label: "Segment", type: "select", options: ["SMB", "Mid-Market", "Enterprise", "All"] },
    ],
    optional: [
      { id: "filter", label: "Owner filter", type: "text", placeholder: "Leave blank for all reps." },
    ],
    outputSections: ["Summary", "Committed", "Best case", "Risk-adjusted"],
  },
  "tpl-onboarding-form": {
    id: "tpl-onboarding-form",
    name: "New Hire Onboarding Form",
    kind: "form",
    category: "Forms",
    color: "linear-gradient(135deg, #a855f7, #7c3aed)",
    iconLarge: "form-large",
    usageCount: 870,
    tags: ["hr", "onboarding", "new hire", "form", "intake"],
    featured: false,
    preview: "Collect everything HR + IT need on day one.",
    description: "Structured intake for new hires: equipment, access, payroll, emergency contact.",
    curatedBy: "People Team",
    metaPrompt: "You are generating an onboarding form. Include sections for personal info, equipment, access, payroll, and emergency contact. Tokenize any PII before AI processing.",
    required: [
      { id: "role",  label: "Role",           type: "text",   placeholder: "Job title of the new hire." },
      { id: "start", label: "Start date",     type: "text",   placeholder: "MM/DD/YYYY" },
    ],
    optional: [
      { id: "manager", label: "Hiring manager", type: "text" },
    ],
    outputSections: ["Personal info", "Equipment", "Access", "Payroll", "Emergency contact"],
  },
  "tpl-vendor-intake-form": {
    id: "tpl-vendor-intake-form",
    name: "Vendor Intake Form",
    kind: "form",
    category: "Forms",
    color: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    iconLarge: "form-large",
    usageCount: 690,
    tags: ["vendor", "intake", "procurement", "form", "compliance"],
    featured: false,
    preview: "Qualify new vendors against policy in one pass.",
    description: "Intake form for new vendors with compliance, security, and contract questions.",
    curatedBy: "Procurement",
    metaPrompt: "You are generating a vendor intake form. Include sections for company details, security posture, compliance certifications, and contract terms. Flag any missing certifications.",
    required: [
      { id: "vendor",   label: "Vendor name", type: "text", placeholder: "Legal entity name." },
      { id: "category", label: "Category",    type: "select", options: ["Software", "Logistics", "Services", "Infrastructure"] },
    ],
    optional: [
      { id: "sponsor", label: "Internal sponsor", type: "text" },
    ],
    outputSections: ["Company details", "Security posture", "Compliance", "Contract terms"],
  },
  "tpl-pitch-deck": {
    id: "tpl-pitch-deck",
    name: "Pitch Deck",
    kind: "deck",
    category: "Decks",
    color: "linear-gradient(135deg, #e11d48, #f59e0b)",
    iconLarge: "deck-large",
    usageCount: 2210,
    tags: ["pitch", "deck", "investor", "fundraising", "story"],
    featured: true,
    preview: "Tell a tight 10-slide story that lands the meeting.",
    description: "Investor-style pitch deck: problem, solution, market, traction, ask.",
    curatedBy: "Founder Council",
    metaPrompt: "You are writing a pitch deck. Keep each slide to one idea. Lead with the problem, not the solution. Every market claim must cite a source.",
    required: [
      { id: "company",  label: "Company",  type: "text", placeholder: "Who is pitching?" },
      { id: "audience", label: "Audience", type: "select", options: ["Seed investors", "Series A", "Strategic", "Internal"] },
    ],
    optional: [
      { id: "ask", label: "Ask", type: "text", placeholder: "Round size or specific request." },
    ],
    outputSections: ["Problem", "Solution", "Market", "Traction", "Team", "Ask"],
  },
};

/* ---------------- Channel knowledge (v2) ---------------- */
export const knowledge = {
  "c-vendor": {
    channelId: "c-vendor",
    rebuiltAt: "12m ago",
    coverage: "High",
    entities: [
      { id: "k-nimbus",   type: "Vendor",   label: "NimbusLogix",                summary: "Logistics vendor, $120k annual, renewing Q2",    sourceRefs: 6 },
      { id: "k-orbix",    type: "Vendor",   label: "Orbix",                      summary: "Logistics vendor, on payment hold",               sourceRefs: 4 },
      { id: "k-paperstk", type: "Vendor",   label: "Paperstack",                 summary: "Software vendor, standard renewal approved",      sourceRefs: 3 },
      { id: "k-sla",      type: "Policy",   label: "Vendor SLA Policy",          summary: "Defines latency, uptime, remediation windows",    sourceRefs: 2 },
      { id: "k-risk",     type: "Policy",   label: "Risk Scoring Matrix",        summary: "Scoring rubric for vendor risk tiers",            sourceRefs: 2 },
      { id: "k-renewal",  type: "Template", label: "Renewal Checklist Template", summary: "SOP used for Q2 renewal cycles",                  sourceRefs: 1 },
    ],
    relationships: [
      { from: "k-orbix",   rel: "has",        to: "k-sla" },
      { from: "k-nimbus",  rel: "has",        to: "k-sla" },
      { from: "k-orbix",   rel: "scored_by",  to: "k-risk" },
      { from: "k-nimbus",  rel: "scored_by",  to: "k-risk" },
      { from: "k-renewal", rel: "applies_to", to: "k-nimbus"   },
      { from: "k-renewal", rel: "applies_to", to: "k-orbix"    },
      { from: "k-renewal", rel: "applies_to", to: "k-paperstk" },
    ],
    qa: [
      { q: "Which vendors are on payment hold?",
        a: "Orbix is currently on payment hold. An approval to release $42,500 is pending review.",
        sources: ["thread: vendor tasks", "ap-orbix"] },
      { q: "What does the renewal checklist require?",
        a: "Pre-renewal checks (SLA, PII, insurance), risk re-scoring, and a filed approval with remediation memos.",
        sources: ["a-vendor-checklist", "k-renewal"] },
      { q: "Who owns risk re-scoring?",
        a: "Mira Patel owns re-scoring for Orbix; Sofia Reyes owns compliance checks overall.",
        sources: ["thread-vendor-tasks"] },
    ],
  },
  "c-specs": {
    channelId: "c-specs",
    rebuiltAt: "15m ago",
    coverage: "High",
    entities: [
      { id: "k-portal",  type: "Product",  label: "Vendor Portal v2",       summary: "Self-serve onboarding + risk scoring", sourceRefs: 7 },
      { id: "k-sso",     type: "Concept",  label: "SSO via OIDC",           summary: "Authentication requirement",           sourceRefs: 3 },
      { id: "k-scoring", type: "Concept",  label: "Real-time risk scoring", summary: "Exposed to vendor admins",             sourceRefs: 4 },
      { id: "k-comp",    type: "Research", label: "Competitor scan",        summary: "Research file uploaded by Ana",        sourceRefs: 2 },
    ],
    relationships: [
      { from: "k-portal", rel: "uses",             to: "k-sso"     },
      { from: "k-portal", rel: "uses",             to: "k-scoring" },
      { from: "k-portal", rel: "reviewed_against", to: "k-comp"    },
    ],
    qa: [
      { q: "What are the core requirements of Vendor Portal v2?",
        a: "Self-serve onboarding, doc vault with expiration tracking, real-time risk scoring, SSO via OIDC, and an admin audit trail.",
        sources: ["thread-prd-vendor-portal", "a-prd-vendor-portal"] },
    ],
  },
};

/* ---------------- Connectors (v2: company-wide + personal tiers) ---------------- */
export const connectors = {
  companyWide: [
    { id: "gdrive-corp",     name: "Google Drive", provider: "google",     connected: true,  scope: "#vendor-management, #specs", connectedBy: "u-ken", lastSync: "5m ago",  tier: "company" },
    { id: "jira-corp",       name: "Jira",         provider: "atlassian",  connected: true,  scope: "#roadmap, #specs",           connectedBy: "u-ana", lastSync: "12m ago", tier: "company" },
    { id: "salesforce-corp", name: "Salesforce",   provider: "salesforce", connected: true,  scope: "#deals, #pipeline",          connectedBy: "u-tom", lastSync: "3m ago",  tier: "company" },
    { id: "onedrive-corp",   name: "OneDrive",     provider: "microsoft",  connected: false, scope: null,                         connectedBy: null,    lastSync: null,      tier: "company" },
    { id: "sharepoint-corp", name: "SharePoint",   provider: "microsoft",  connected: false, scope: null,                         connectedBy: null,    lastSync: null,      tier: "company" },
  ],
  personal: [
    { id: "gdrive-me",   name: "Google Drive (personal)", provider: "google", connected: true,  scope: "Only visible to you", connectedBy: "u-ken", lastSync: "just now", tier: "personal" },
    { id: "notion-me",   name: "Notion",                  provider: "notion", connected: true,  scope: "Only visible to you", connectedBy: "u-ken", lastSync: "1h ago",   tier: "personal" },
    { id: "calendar-me", name: "Google Calendar",         provider: "google", connected: false, scope: null,                  connectedBy: null,    lastSync: null,       tier: "personal" },
    { id: "github-me",   name: "GitHub",                  provider: "github", connected: false, scope: null,                  connectedBy: null,    lastSync: null,       tier: "personal" },
  ],
};

/* ---------------- Notifications (v2: inbox) ---------------- */
export const notifications = [
  { id: "n-1", kind: "mention",  title: "Sofia mentioned you in #vendor-management",   preview: "@ken Orbix remediation memo attached…",               channelId: "c-vendor",  ts: "5m ago",    unread: true,  actorId: "u-sofia" },
  { id: "n-2", kind: "approval", title: "Approval pending: Orbix payment hold",        preview: "Sofia filed a $42,500 approval for your review",     approvalId: "ap-orbix", ts: "25m ago",   unread: true,  actorId: "u-sofia" },
  { id: "n-3", kind: "ai",       title: "Kara Ops AI finished a draft",                preview: "Vendor Renewal Checklist is ready for review",       artifactId: "a-vendor-checklist",  ts: "1h ago",   unread: true,  actorId: "ai-kara" },
  { id: "n-4", kind: "thread",   title: "New reply in 'Vendor review task breakdown'", preview: "Mira: converting risk items into a formal approval", threadId: "thread-vendor-tasks",   ts: "2h ago",   unread: false, actorId: "u-mira" },
  { id: "n-5", kind: "ai",       title: "Nina PM AI posted a PRD draft in #specs",     preview: "Vendor Portal v2 PRD draft v1 ready",                 artifactId: "a-prd-vendor-portal", ts: "3h ago",   unread: false, actorId: "ai-nina" },
  { id: "n-6", kind: "budget",   title: "Mika Sales AI hit 98% of monthly budget",     preview: "Cooling down until Friday 09:00 or admin override",   aiEmployeeId: "ai-mika", ts: "4h ago",    unread: false, actorId: "ai-mika" },
  { id: "n-7", kind: "mention",  title: "Ana mentioned you in #specs",                 preview: "@ken priority on risk scoring — surfaces in ops",     channelId: "c-specs",    ts: "yesterday", unread: false, actorId: "u-ana" },
  { id: "n-8", kind: "approval", title: "Approval approved: Paperstack renewal",       preview: "You approved the Paperstack annual renewal",          approvalId: "ap-software-license", ts: "Mon", unread: false, actorId: "u-ken" },
];

/* ---------------- Settings ---------------- */
export const settings = {
  privacy: {
    allowConfidentialServerAI: false,
    allowFrontierFallback:     false,
    requirePIITokenization:    true,
    onDevicePreferred:         true,
  },
  // Used by the Settings modal's "Templates" tab — keep in sync with `templates`.
  templates: [
    { id: "tpl-prd",                name: "Standard PRD",             kind: "doc"   },
    { id: "tpl-sop",                name: "SOP",                      kind: "doc"   },
    { id: "tpl-proposal",           name: "Proposal",                 kind: "doc"   },
    { id: "tpl-qbr",                name: "QBR Deck",                 kind: "deck"  },
    { id: "tpl-rfc",                name: "RFC",                      kind: "doc"   },
    { id: "tpl-meeting-notes",      name: "Meeting Notes",            kind: "doc"   },
    { id: "tpl-status-update",      name: "Weekly Status Update",     kind: "doc"   },
    { id: "tpl-budget-analysis",    name: "Budget Analysis",          kind: "sheet" },
    { id: "tpl-pipeline-forecast",  name: "Pipeline Forecast",        kind: "sheet" },
    { id: "tpl-onboarding-form",    name: "New Hire Onboarding Form", kind: "form"  },
    { id: "tpl-vendor-intake-form", name: "Vendor Intake Form",       kind: "form"  },
    { id: "tpl-pitch-deck",         name: "Pitch Deck",               kind: "deck"  },
  ],
  // Legacy connectors list used by the Settings modal's Connectors tab; the
  // dedicated Connectors screen uses `connectors` above.
  connectors: [
    { id: "gdrive",     name: "Google Drive", connected: true,  scope: "#vendor-management, #specs" },
    { id: "jira",       name: "Jira",         connected: true,  scope: "#roadmap, #specs"           },
    { id: "salesforce", name: "Salesforce",   connected: true,  scope: "#deals, #pipeline"          },
    { id: "onedrive",   name: "OneDrive",     connected: false, scope: null                         },
  ],
};

/* ---------------- Utility lookup helpers ---------------- */
export function userById(id) {
  return users.find(u => u.id === id) || aiEmployees.find(a => a.id === id) || null;
}
export function channelById(id)   { return channels[id] || null; }
export function domainById(id)    { return domains.find(d => d.id === id) || null; }
export function tenantById(id)    { return tenants.find(t => t.id === id) || null; }
export function primaryTenantId() { return (tenants.find(t => t.primary) || tenants[0]).id; }
export function aiById(id)        { return aiEmployees.find(a => a.id === id) || null; }
export function artifactById(id)  { return artifacts[id] || null; }
export function approvalById(id)  { return approvals[id] || null; }
export function threadById(id)    { return threads[id] || null; }
export function templateById(id)  { return templates[id] || null; }
export function knowledgeForChannel(channelId) { return knowledge[channelId] || null; }
export function unreadNotificationCount()      { return notifications.filter(n => n.unread).length; }
export function leaveBalanceById(id)  { return leaveBalances[id]  || null; }
export function leaveRequestById(id)  { return leaveRequests[id]  || null; }
export function purchaseReqById(id)   { return purchaseReqs[id]   || null; }
export function purchaseOrderById(id) { return purchaseOrders[id] || null; }
export function budgetCheckById(id)   { return budgetChecks[id]   || null; }
export function budgetSummaryById(id) { return budgetSummaries[id]|| null; }
export function aiInsightById(id)     { return aiInsights[id]     || null; }
export function billMatchById(id)     { return billMatches[id]    || null; }
export function journalEntryById(id)  { return journalEntries[id] || null; }
export function dealById(id)          { return deals[id]          || null; }
export function quoteById(id)         { return quotes[id]         || null; }
