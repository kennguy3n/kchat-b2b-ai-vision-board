/* KChat B2B mobile prototype — hardcoded sample data.
 * All content is static (window.KDATA pattern — no ES modules). */

window.KDATA = {
  user: { name: 'Ken Nguyen', handle: '@ken', avatar: 'KN', role: 'Head of Ops' },

  tenants: [
    { id: 't-acme',   name: 'Acme Corp',      short: 'Acme',   avatar: 'AC', color: 'a2', active: true, members: 248, description: 'KChat Business · 248 members' },
    { id: 't-globex', name: 'Globex Partners', short: 'Globex', avatar: 'GX', color: 'a3',              members:  42, description: 'Partner network · 42 members' },
    { id: 't-labs',   name: 'Acme Labs',       short: 'Labs',   avatar: 'AL', color: 'a4',              members:  18, description: 'R&D subsidiary · 18 members' },
  ],

  channels: [
    // Pinned announcement — always shown at top, above domain groups
    { id: 'c-announce',   tenantId: 't-acme', domain: 'Pinned',     name: 'announcement',       pinned: true, emoji: '📢', color: 'a5',
      last: 'Ken Nguyen: Q2 all-hands moved to Wed 10 AM · agenda in thread', time: '08:12', unread: 0 },

    { id: 'c-vendor',     tenantId: 't-acme', domain: 'Operations', name: 'vendor-management',  members: 14, color: 'a2',
      last: 'Kara Ops AI: Orbix remediation summary ready',   time: '09:46', unread: 4, ai: true },
    { id: 'c-logistics',  tenantId: 't-acme', domain: 'Operations', name: 'logistics',          members:  9, color: 'a2',
      last: 'Dan: Pulling FleetOne rates now',                time: '09:05', unread: 1 },
    { id: 'c-compliance', tenantId: 't-acme', domain: 'Operations', name: 'compliance',         members:  6, color: 'a2',
      last: 'Sofia: SOC2 evidence window opens Monday',       time: '10:00', unread: 0 },

    { id: 'c-pipeline',   tenantId: 't-acme', domain: 'Sales',      name: 'pipeline',           members: 11, color: 'a3',
      last: 'Tom: Globex moved to verbal',                    time: '11:10', unread: 2 },
    { id: 'c-deals',      tenantId: 't-acme', domain: 'Sales',      name: 'deals',              members:  7, color: 'a3',
      last: 'Mika Sales AI: QBR draft attached · 2 risks',    time: '11:32', unread: 1, ai: true },

    { id: 'c-roadmap',    tenantId: 't-acme', domain: 'Product',    name: 'roadmap',            members: 10, color: 'a4',
      last: 'Ana: Q3 themes forming up',                      time: 'Thu',   unread: 0 },
    { id: 'c-specs',      tenantId: 't-acme', domain: 'Product',    name: 'specs',              members: 12, color: 'a4',
      last: 'Nina PM AI: Drafting Vendor Portal v2 PRD',      time: '14:33', unread: 3, ai: true },

    { id: 'c-hr-people',  tenantId: 't-acme', domain: 'People',     name: 'hr-people',          members:  8, color: 'a5',
      last: 'Hana HR AI: Leave request routed to Ken',        time: '10:08', unread: 1, ai: true },

    { id: 'c-finance',    tenantId: 't-acme', domain: 'Finance',    name: 'finance',            members:  5, color: 'a3',
      last: 'Finn Finance AI: Q2 accruals reconciled',        time: 'Yesterday', unread: 0, ai: true },

    // Globex tenant — partner-network channels
    { id: 'c-gx-partners',  tenantId: 't-globex', domain: 'Partners',     name: 'partner-network', members: 24, color: 'a3',
      last: 'Lia: Onboarding packet sent to 3 new partners',  time: '11:20', unread: 2 },
    { id: 'c-gx-deals',     tenantId: 't-globex', domain: 'Deals',        name: 'joint-deals',     members: 18, color: 'a3',
      last: 'Mika Sales AI: 2 co-sell opportunities flagged', time: 'Wed',   unread: 1, ai: true },
    { id: 'c-gx-support',   tenantId: 't-globex', domain: 'Support',      name: 'partner-support', members: 11, color: 'a2',
      last: 'Sofia: Escalation queue cleared · 0 open',       time: 'Tue',   unread: 0 },

    // Labs tenant — R&D channels
    { id: 'c-lb-research',  tenantId: 't-labs',   domain: 'Research',     name: 'research',        members: 12, color: 'a4',
      last: 'Nina PM AI: New paper summary posted',            time: '15:04', unread: 2, ai: true },
    { id: 'c-lb-builds',    tenantId: 't-labs',   domain: 'Engineering', name: 'builds',          members:  9, color: 'a2',
      last: 'Alex: Nightly build green · 0 regressions',       time: 'Mar 10',unread: 0 },
  ],

  coreIntents: [
    { id: 'create',  icon: '✏️', label: 'Create',  sub: 'Doc · Slides · PRD · SOP',    modes: ['Auto', 'Inline'] },
    { id: 'analyze', icon: '🔍', label: 'Analyze', sub: 'Summarize · Extract · Report', modes: ['Auto', 'Inline'] },
    { id: 'plan',    icon: '📋', label: 'Plan',    sub: 'Tasks · Agenda · Risk',        modes: ['Auto', 'Inline'] },
    { id: 'approve', icon: '✅', label: 'Approve', sub: 'Purchase · Policy · Budget',   modes: ['Auto'] },
  ],

  // Vendor-management channel — the primary demo thread
  vendorMessages: [
    { id: 'm-v-1', from: 'Mira Patel',    text: 'Hey team — quarterly vendor reviews are due Friday. Sharing the latest contract dump from Drive.', time: '09:12', avatar: 'MP', color: 'a3',
      attachments: [{ name: 'vendor-contracts-q2.zip', size: '12.4 MB' }] },
    { id: 'm-v-2', from: 'Ken Nguyen',    text: 'Thanks. @sofia can you flag any that lapse this quarter?', time: '09:14', avatar: 'KN', color: 'a2', mention: true },
    { id: 'm-v-3', from: 'Sofia Reyes',   text: 'On it. Three vendors need renewal review — NimbusLogix, Orbix, and Paperstack.', time: '09:17', avatar: 'SR', color: 'a4' },
    { id: 'm-v-4', from: 'Kara Ops AI',   text: 'I can extract a renewal checklist from the contract dump. Want me to run it?', time: '09:18', avatar: 'KA', color: 'a5', isAI: true, compute: 'On-device' },
    { id: 'm-v-5', from: 'Ken Nguyen',    text: 'Yes please — use the on-device recipe and surface any PII risks.', time: '09:19', avatar: 'KN', color: 'a2' },
    { id: 'm-v-6', from: 'Kara Ops AI',   text: 'Draft ready for review.', time: '09:22', avatar: 'KA', color: 'a5', isAI: true, compute: 'On-device',
      artifact: { title: 'Vendor Renewal Checklist · Q2', kind: 'SOP', sections: 5, confidence: 92 } },
    { id: 'm-v-7', from: 'Mira Patel',    text: 'Meanwhile I opened a task list — see the thread below.', time: '09:27', avatar: 'MP', color: 'a3',
      taskList: { count: 5, threadId: 'th-vendor-tasks' } },
    { id: 'm-v-8', from: 'Dan Kim',       text: 'Logistics angle: Orbix is blocking two shipments. Needs an approval to unblock payment hold.', time: '09:31', avatar: 'DK', color: 'a4',
      approval: { id: 'ap-orbix', title: 'Orbix payment-hold release · $42,500', status: 'Pending' } },
    { id: 'm-v-9', from: 'Ken Nguyen',    text: "Approved path — let's get a summary and formal approval filed.", time: '09:35', avatar: 'KN', color: 'a2' },
    { id: 'm-v-10', from: 'Sofia Reyes',  text: 'Filed. Pending your review.', time: '09:40', avatar: 'SR', color: 'a4',
      approval: { id: 'ap-orbix', title: 'Orbix payment-hold release · $42,500', status: 'Pending your review' } },
    { id: 'm-v-11', from: 'KChat',        text: '✉ Email received from contracts@orbix.io', time: '09:45', avatar: '·', color: 'a6', isSystem: true,
      email: { id: 'em-orbix', subject: 'Updated Remediation Terms · v3', preview: 'New penalty clause added…' } },
    { id: 'm-v-12', from: 'Kara Ops AI',  text: 'Orbix sent updated remediation terms. AI summary: new penalty clause added; requires legal review before counter-signing. The PDF is in your channel drive.', time: '09:46', avatar: 'KA', color: 'a5', isAI: true, compute: 'Confidential server' },
  ],

  threadMessages: {
    id: 'th-vendor-tasks',
    title: 'Vendor review · 5 tasks',
    parent: 'Mira Patel · 09:27',
    messages: [
      { id: 'th-1', from: 'Mira Patel', text: 'Splitting this into 5 tasks so we can parallelize. Tagging owners inline.', time: '09:28', avatar: 'MP', color: 'a3' },
      { id: 'th-2', from: 'Kara Ops AI', text: 'Extracted 5 tasks from the thread. Review and assign below.', time: '09:29', avatar: 'KA', color: 'a5', isAI: true, compute: 'On-device',
        extractedTasks: [
          { title: 'Review NimbusLogix renewal terms', owner: 'Sofia',  due: 'Fri' },
          { title: 'Compare Orbix vs FleetOne rates',  owner: 'Dan',    due: 'Thu' },
          { title: 'Flag PII-handling clauses',         owner: 'Sofia',  due: 'Fri' },
          { title: 'Draft Paperstack SOW amendment',    owner: 'Mira',   due: 'Fri' },
          { title: 'File Orbix payment-hold approval',  owner: 'Sofia',  due: 'Thu' },
        ] },
      { id: 'th-3', from: 'Sofia Reyes',  text: 'Taking #1, #3, #5. Dan can you grab #2?', time: '09:33', avatar: 'SR', color: 'a4' },
      { id: 'th-4', from: 'Dan Kim',      text: 'Yep, on it.', time: '09:34', avatar: 'DK', color: 'a4' },
    ],
    linkedObjects: [
      { kind: 'tasks',    label: '5 Tasks',    icon: '📅' },
      { kind: 'approval', label: '1 Approval', icon: '✅' },
      { kind: 'artifact', label: 'SOP draft',  icon: '📄' },
    ],
  },

  notifications: {
    actionRequired: [
      { id: 'n-1', icon: '✅', title: 'Approve · Orbix payment-hold release', body: 'Sofia Reyes filed the approval · $42,500', source: '#vendor-management', time: '5m', screen: 'approval-review' },
      { id: 'n-2', icon: '📋', title: 'Task assigned to you', body: 'Sign Vendor Portal v2 PRD sign-off · from Nina PM AI', source: '#specs',                  time: '18m', screen: 'task-detail' },
      { id: 'n-3', icon: '✉', title: 'Legal review requested', body: 'Orbix remediation v3 · new penalty clause', source: '#vendor-management',               time: '32m', screen: 'email-detail' },
    ],
    updates: [
      { id: 'n-4', icon: '✦', title: 'Kara Ops AI finished · Vendor Renewal Checklist', body: '5 sections · 92% confidence · on-device', source: '#vendor-management', time: '1h', screen: 'ai-output-review' },
      { id: 'n-5', icon: '✦', title: 'Nina PM AI · PRD draft ready', body: 'Vendor Portal v2 · 6 sections · citations linked', source: '#specs', time: '2h', screen: 'ai-output-review' },
      { id: 'n-6', icon: '📅', title: 'Vendor review · Thursday 10 AM', body: 'Calendar reminder · Ken, Mira, Sofia, Dan', source: '#vendor-management', time: '3h', screen: 'channel-chat' },
      { id: 'n-7', icon: '@', title: 'Mira mentioned you', body: '"@ken can you grab the budget gate for Q3?"', source: '#roadmap', time: '4h', screen: 'channel-chat' },
      { id: 'n-8', icon: '💬', title: 'Sofia replied in thread', body: '"Taking #1, #3, #5. Dan grab #2?"', source: '#vendor-management', time: '5h', screen: 'thread-detail' },
    ],
  },

  tasks: [
    { id: 't1', title: 'Review NimbusLogix renewal terms', due: 'Fri Apr 26 · 5 PM', source: '#vendor-management · from Kara AI', owner: 'You',    ai: true,  status: 'in-progress', priority: 'High' },
    { id: 't2', title: 'Compare Orbix vs FleetOne rates',  due: 'Thu Apr 25',        source: '#logistics · from Dan',             owner: 'Dan',   ai: false, status: 'todo',        priority: 'High' },
    { id: 't3', title: 'Flag PII-handling clauses',         due: 'Fri Apr 26',        source: '#compliance · AI-extracted',        owner: 'You',    ai: true,  status: 'todo',        priority: 'Med'  },
    { id: 't4', title: 'Draft Paperstack SOW amendment',    due: 'Fri Apr 26',        source: '#vendor-management · from Mira',    owner: 'Mira',   ai: false, status: 'todo',        priority: 'Med'  },
    { id: 't5', title: 'File Orbix payment-hold approval',  due: 'Thu Apr 25',        source: '#vendor-management · AI-extracted', owner: 'Sofia',  ai: true,  status: 'done',        priority: 'High' },
    { id: 't6', title: 'Vendor Portal v2 PRD sign-off',     due: 'Mon Apr 29',        source: '#specs · from Nina AI',             owner: 'You',    ai: true,  status: 'todo',        priority: 'Med'  },
    { id: 't7', title: 'Q2 accrual spot-check',             due: 'Wed May 1',         source: '#finance · from Finn AI',           owner: 'You',    ai: true,  status: 'todo',        priority: 'Low'  },
  ],

  approvals: [
    { id: 'ap-orbix',     title: 'Orbix payment-hold release',    amount: '$42,500', kind: 'Purchase · Exception',    requester: 'Sofia Reyes',  channel: '#vendor-management', status: 'Pending your review', filed: '5m ago',   slaDue: 'Today 5 PM', audit: [
      { t: '09:22', who: 'Kara Ops AI', action: 'Extracted from Orbix remediation · flagged PII risk'   },
      { t: '09:31', who: 'Dan Kim',     action: 'Opened payment-hold · 2 blocked shipments'            },
      { t: '09:40', who: 'Sofia Reyes', action: 'Filed formal approval · $42,500 · SLA Today 5 PM'    },
    ]},
    { id: 'ap-prd',       title: 'Vendor Portal v2 · PRD sign-off', amount: '—',       kind: 'Policy · Scope gate',    requester: 'Nina PM AI',    channel: '#specs',              status: 'Awaiting reviewers', filed: '1h ago',   slaDue: 'Mon 5 PM' },
    { id: 'ap-budget',    title: 'Q3 marketing budget · +$18K',      amount: '$18,000', kind: 'Budget · Over-plan',     requester: 'Tom Becker',    channel: '#deals',              status: 'Approved',           filed: 'Yesterday', slaDue: '—' },
    { id: 'ap-leave',     title: 'Sofia Reyes · 3 days leave',        amount: '—',       kind: 'HR · Leave',             requester: 'Hana HR AI',    channel: '#hr-people',          status: 'Pending your review', filed: '2h ago',   slaDue: 'Wed 12 PM' },
  ],

  aiEmployees: [
    { id: 'ai-kara', name: 'Kara Ops AI',    role: 'Ops Coordinator', avatar: 'KA', color: 'a5', status: 'Running · vendor risk summary', compute: 'On-device',
      budget: { cap: 250, spent: 182.4, state: 'ready' },
      channels: ['vendor-management', 'logistics', 'procurement'],
      queue: [
        { title: 'Weekly vendor risk summary',       state: 'running',  ts: '2m'  },
        { title: 'Update risk register',              state: 'queued',   ts: '5m'  },
        { title: 'Prepare compliance checklist',      state: 'blocked',  ts: '1h', reason: 'Awaiting approver list' },
        { title: "Last week's ops summary",            state: 'done',     ts: 'Mon' },
      ] },
    { id: 'ai-mika', name: 'Mika Sales AI',  role: 'Sales Assist',     avatar: 'MI', color: 'a3', status: 'Cooling down · budget cap',    compute: 'Confidential server',
      budget: { cap: 180, spent: 178.9, state: 'cooling-down', nextAvailable: '3h 42m', reason: '98% of monthly AI budget used' },
      channels: ['pipeline', 'deals', 'shieldnet'],
      queue: [
        { title: 'QBR deck outline for Globex', state: 'done',   ts: '1d' },
        { title: 'Pipeline health digest',       state: 'queued', ts: '30m' },
      ] },
    { id: 'ai-nina', name: 'Nina PM AI',     role: 'Product Co-Pilot', avatar: 'NI', color: 'a4', status: 'Drafting · Vendor Portal v2',  compute: 'On-device',
      budget: { cap: 300, spent: 96.2,  state: 'ready' },
      channels: ['roadmap', 'specs'],
      queue: [
        { title: 'PRD draft: Vendor Portal v2',    state: 'running', ts: 'now' },
        { title: 'Compare competitor feature set', state: 'queued',  ts: '10m' },
      ] },
    { id: 'ai-hana', name: 'Hana HR AI',     role: 'HR Assistant',     avatar: 'HA', color: 'a5', status: 'Monitoring leave requests',    compute: 'Confidential server',
      budget: { cap: 150, spent: 42.1,  state: 'ready' },
      channels: ['hr-people', 'procurement'],
      queue: [
        { title: 'Sofia Reyes · 3 days leave', state: 'running', ts: 'just now' },
      ] },
    { id: 'ai-finn', name: 'Finn Finance AI', role: 'Finance Assist',  avatar: 'FI', color: 'a2', status: 'Reconciling Q2 accruals',      compute: 'Frontier · redacted',
      budget: { cap: 200, spent: 88.7,  state: 'ready' },
      channels: ['finance'],
      queue: [
        { title: 'Q2 accrual reconciliation', state: 'running', ts: '10m' },
        { title: 'Budget variance report',    state: 'queued',  ts: '1h'  },
      ] },
  ],

  artifact: {
    id: 'a-vendor-checklist',
    title: 'Vendor Renewal Checklist · Q2',
    kind: 'SOP',
    owner: 'Kara Ops AI',
    compute: 'On-device',
    confidence: 92,
    sections: [
      { h: 'Renewal targets',     body: 'NimbusLogix, Orbix, Paperstack — all lapsing before Jul 1.',                                    conf: 95, citations: 3 },
      { h: 'Risk flags',          body: 'Orbix has 2 blocked shipments; NimbusLogix SOC2 report is 9 months stale.',                      conf: 88, citations: 4 },
      { h: 'Required approvals',  body: 'Orbix payment-hold release ($42.5K) → Ken; Paperstack SOW amendment → Legal + Mira.',            conf: 94, citations: 2 },
      { h: 'PII / data handling', body: 'NimbusLogix processes EU customer records — needs updated DPA before renewal.',                  conf: 90, citations: 2 },
      { h: 'Timeline',            body: 'File all three by Fri Apr 26, 5 PM. Orbix unblocks Thu once approval closes.',                   conf: 93, citations: 1 },
    ],
  },

  briefBuilder: {
    title: 'PRD · Vendor Portal v2',
    owner: 'Nina PM AI',
    compute: 'On-device',
    fields: [
      { label: 'Goal',            value: 'Let vendors self-serve onboarding, contract lookup, and payment status.' },
      { label: 'Audience',        value: 'External vendors (Acme Corp + Globex partner network).' },
      { label: 'Sources',         value: '#specs thread · research folder · competitor compare · last QBR notes' },
      { label: 'Tone',            value: 'Concise, decision-oriented. One-page exec summary up top.' },
      { label: 'Output format',   value: 'Long-form doc · 6 sections · exec summary · citations' },
      { label: 'Compute mode',    value: 'On-device (sources stay local)' },
    ],
  },

  templates: [
    { id: 'tpl-prd',   icon: '📘', title: 'PRD',                    sub: 'Product Req Doc · 6 sections'        },
    { id: 'tpl-qbr',   icon: '📊', title: 'QBR',                    sub: 'Quarterly Business Review'            },
    { id: 'tpl-sop',   icon: '📄', title: 'SOP',                    sub: 'Standard Operating Procedure'         },
    { id: 'tpl-proposal', icon: '📑', title: 'Proposal',             sub: 'Sales proposal · 5 sections'          },
    { id: 'tpl-agenda', icon: '🗓',  title: 'Agenda',                 sub: 'Meeting agenda · AI pre-fill'         },
    { id: 'tpl-risk',   icon: '⚠️',  title: 'Risk Register',         sub: 'Top risks · owners · mitigations'     },
    { id: 'tpl-budget', icon: '💰', title: 'Budget',                 sub: 'Budget plan · variance tracker'       },
    { id: 'tpl-form',   icon: '📝', title: 'Form',                   sub: 'Custom intake form'                   },
  ],

  connectors: [
    { id: 'cn-drive',    icon: '📁',  name: 'Drive',          state: 'connected',     note: '12 folders indexed' },
    { id: 'cn-mail',     icon: '✉',  name: 'Email (KMail)',  state: 'connected',     note: 'Inbox scan on-device' },
    { id: 'cn-cal',      icon: '📅', name: 'Calendar',        state: 'connected',     note: 'Acme + Globex cals'  },
    { id: 'cn-crm',      icon: '🤝', name: 'CRM',             state: 'connected',     note: '1,248 deals'         },
    { id: 'cn-erp',      icon: '🏭', name: 'ERP (Kapp)',      state: 'connected',     note: 'Inventory, finance'   },
    { id: 'cn-jira',     icon: '🧭', name: 'Jira',             state: 'pending',      note: 'Awaiting admin SSO' },
    { id: 'cn-github',   icon: '🐙', name: 'GitHub',          state: 'disconnected', note: 'Connect to enable code search' },
  ],

  privacyStrips: {
    local:        { label: 'On-device',         sources: 'this channel',           note: 'No data leaves workspace' },
    confidential: { label: 'Confidential server', sources: 'Acme Corp region',     note: 'Enclave-bound · not logged' },
    frontier:     { label: 'Frontier · redacted', sources: 'redacted snippets',    note: 'Per-row egress policy',    remote: true },
  },

  metrics: {
    runsThisWeek: 324,
    aiHoursSaved: 18.6,
    onDevicePct: 72,
    confidentialPct: 24,
    frontierPct: 4,
    topRecipes: [
      { name: 'summarize',  runs: 112 },
      { name: 'extract',    runs: 78  },
      { name: 'draft-prd',  runs: 21  },
      { name: 'draft-sop',  runs: 18  },
      { name: 'compare',    runs: 12  },
    ],
  },

  packagingTiers: [
    { name: 'Core',     price: '$12 / seat / mo',  perks: ['Messaging + channels', 'Basic tasks & approvals', 'On-device AI · 100 runs/mo'] },
    { name: 'Business', price: '$24 / seat / mo',  perks: ['Everything in Core',  'Up to 5 AI Employees',      'Confidential server runs',  'Audit log + retention'], badge: 'Most popular' },
    { name: 'Enterprise', price: 'Custom',          perks: ['Everything in Business', 'Unlimited AI Employees',  'Frontier compute w/ egress policy', 'Dedicated region + CMK'] },
  ],

  aiInsights: [
    { head: 'Vendor ↔ Compliance', body: 'PII-handling clauses appear in 3 of 4 open contracts.', connection: '🛡 Flagged by Kara · routed to #compliance → Sofia reviewing' },
    { head: 'Sales ↔ Finance',      body: 'QBR slippage correlates with late Q1 accrual postings.', connection: '📊 Detected by Mika + Finn · surfaced in metrics dashboard' },
    { head: 'Product ↔ Ops',        body: 'Vendor Portal v2 would eliminate 62% of manual onboarding tickets.', connection: '🧭 Nina cited 8 tickets from #vendor-management' },
  ],

  email: {
    id: 'em-orbix',
    from: 'contracts@orbix.io',
    to: 'vendors@acme.com',
    subject: 'Updated Remediation Terms · v3',
    date: 'Today 09:45',
    preview: 'Per our call, attached is v3 with the revised penalty clause and updated SLA schedule…',
    body: `Ken,

Per our call this morning, attached is v3 of the remediation plan with the revised penalty clause and updated SLA schedule.

Key deltas vs v2:
  • New clause 4.3 — late-delivery penalty raised to 2% of invoice value per week
  • SLA response window tightened from 48h to 24h for P1 incidents
  • Added data-handling rider to match your SOC2 requirements

We are happy to counter-sign once your legal team approves.

— Diana Lau, Orbix`,
    aiSummary: [
      'New penalty clause 4.3 adds a 2%/week late-delivery fee.',
      'SLA response tightened to 24h for P1 — matches our internal standard.',
      'Data-handling rider closes the SOC2 gap flagged on Monday.',
      'Action: route to Legal for review before counter-signing.',
    ],
    compute: 'Confidential server',
  },

  baseView: {
    title: 'Vendor Register',
    icon: '🗂',
    rows: [
      { name: 'NimbusLogix', status: 'Renewal review', owner: 'Sofia', lapse: 'Jun 30', risk: 'Med' },
      { name: 'Orbix',       status: 'Approval open',  owner: 'Sofia', lapse: 'Apr 25', risk: 'High' },
      { name: 'Paperstack',  status: 'SOW amendment',  owner: 'Mira',  lapse: 'May 15', risk: 'Med' },
      { name: 'FleetOne',    status: 'Active',          owner: 'Dan',   lapse: 'Jan 12 \'27', risk: 'Low' },
      { name: 'Briarwood',   status: 'Active',          owner: 'Dan',   lapse: 'Oct 04',      risk: 'Low' },
    ],
  },

  sheetView: {
    title: 'Q2 Vendor Spend',
    icon: '📈',
    rows: [
      { label: 'NimbusLogix', q1: '$42,100', q2: '$44,300', trend: '+5%' },
      { label: 'Orbix',        q1: '$38,900', q2: '$42,500', trend: '+9%' },
      { label: 'Paperstack',   q1: '$12,400', q2: '$11,200', trend: '-10%' },
      { label: 'FleetOne',     q1: '$22,600', q2: '$23,100', trend: '+2%' },
      { label: 'Briarwood',    q1: '$9,800',  q2: '$10,100', trend: '+3%' },
    ],
  },

  formView: {
    title: 'Vendor Onboarding · NimbusLogix',
    icon: '📝',
    fields: [
      { label: 'Legal entity',  value: 'NimbusLogix Ltd.' },
      { label: 'Primary contact', value: 'Maria Chen <maria@nimbuslogix.com>' },
      { label: 'SOC2 report',   value: 'Stale · 9 months', warn: true },
      { label: 'DPA version',   value: 'v2.0 · needs refresh', warn: true },
      { label: 'Payment terms', value: 'Net-45' },
      { label: 'Renewal date',  value: 'Jun 30 · Q2' },
    ],
  },

  search: {
    placeholder: 'Ask across channels, docs, tasks, contracts…',
    suggestions: [
      'What\'s the status of the Orbix approval?',
      'Summarize Vendor Portal v2 PRD',
      'Which vendors have stale SOC2 reports?',
      'Show me all approvals over $25k this quarter',
      'Draft a QBR for Globex from the last 4 quarters',
    ],
    recent: [
      'Orbix remediation terms',
      'QBR deck template',
      'Q2 vendor spend',
    ],
  },

  demoSteps: {
    'vendor-review': [
      { screen: 'home',            hint: 'Acme Corp workspace · tap #vendor-management to enter the main channel', target: '' },
      { screen: 'channel-chat',    hint: 'Long-press the AI message from Kara to see context actions',              target: '#msg-m-v-6' },
      { screen: 'long-press-menu', hint: 'KChat AI suggested "Open thread" — tap it',                              target: '#menu-thread' },
      { screen: 'thread-detail',   hint: 'Kara extracted 5 tasks from the thread · tap "5 Tasks"',                   target: '#thread-chip-tasks' },
      { screen: 'task-list',       hint: 'Five AI-extracted tasks · switch to Approvals for Orbix',                  target: '#tasks-seg-approvals' },
      { screen: 'approval-form',   hint: 'Approval form filled in by Kara · tap Review →',                           target: '#approval-review-cta' },
      { screen: 'approval-review', hint: 'Audit trail + compute transparency · approve $42,500',                     target: '#approve-btn' },
      { screen: 'notifications',   hint: 'Notification cleared · Action required list is shorter',                   target: '' },
    ],
    'draft-prd': [
      { screen: 'home',             hint: 'Tap #specs to join the Product team',                                     target: '' },
      { screen: 'channel-chat',     hint: 'Tap the + AI sparkle to open the Action Launcher',                        target: '#ai-sparkle' },
      { screen: 'action-launcher',  hint: 'Core Intents · Create → tap PRD',                                         target: '#intent-create' },
      { screen: 'brief-builder',    hint: 'Nina pre-filled every field · tap Generate Draft',                        target: '#brief-generate' },
      { screen: 'ai-processing',    hint: 'Nina drafting on-device · 4 steps animated',                              target: '' },
      { screen: 'ai-output-review', hint: 'Per-section confidence + citations · tap Edit in Workspace',              target: '#output-edit' },
      { screen: 'artifact-workspace', hint: 'Section-level editing + AI assist · publish when ready',                target: '' },
    ],
    'ai-employee': [
      { screen: 'home',              hint: 'Tap the Settings tab (⚙) in the bottom bar',                              target: '' },
      { screen: 'settings',          hint: 'AI Employees section pinned at the top · tap through',                    target: '#settings-ai-employees' },
      { screen: 'ai-employee-list',  hint: 'Five AI Employees across Ops / Sales / Product / HR / Finance',           target: '' },
      { screen: 'ai-employee-detail', hint: 'Budget bar, compute mode, queue · tap Back to jump into her channel',    target: '' },
      { screen: 'channel-chat',      hint: 'Kara just finished the weekly summary · inline artifact card',            target: '' },
    ],
  },
};
