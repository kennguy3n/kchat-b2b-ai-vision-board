// Render KApp cards (artifact, task list, approval, ai-suggest) inline in chat.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

export function renderCard(card) {
  if (!card || !card.type) return "";
  switch (card.type) {
    case "artifact":       return artifactCard(card.refId);
    case "task-list":      return taskListCard(card);
    case "approval":       return approvalCard(card.refId);
    case "ai-suggest":     return aiSuggestCard(card);
    case "leave-balance":  return leaveBalanceCard(card.refId);
    case "leave-request":  return leaveRequestCard(card.refId);
    case "purchase-req":   return purchaseReqCard(card.refId);
    case "purchase-order": return purchaseOrderCard(card.refId);
    case "budget-check":   return budgetCheckCard(card.refId);
    case "budget-summary": return budgetSummaryCard(card.refId);
    case "ai-insight":     return aiInsightCard(card.refId);
    case "bill-match":     return billMatchCard(card.refId);
    case "journal-entry":  return journalEntryCard(card.refId);
    case "deal":           return dealCard(card.refId);
    case "quote":          return quoteCard(card.refId);
  }
  return "";
}

function kcardShell({ icon, kind, title, body, foot, dataRef, onClick }) {
  const attrs = dataRef ? `data-card-ref="${dataRef}"` : "";
  const click = onClick ? `data-card-action="${onClick}"` : "";
  return `
    <div class="kcard ${kind}" ${attrs} ${click}>
      <div class="kcard-head">
        <div class="kc-icon">${icon}</div>
        <span class="kc-title">${title}</span>
        <span class="spacer"></span>
      </div>
      <div class="kcard-body">${body}</div>
      ${foot ? `<div class="kcard-foot">${foot}</div>` : ""}
    </div>
  `;
}

function artifactCard(refId) {
  const a = D.artifactById(refId);
  if (!a) return "";
  const icon = a.type === "deck" ? "D" : "F";
  return kcardShell({
    icon,
    kind: "kcard-artifact",
    title: `${a.template} · ${a.type === "deck" ? "Deck" : "Doc"}`,
    body: `
      <div class="row gap-3 items-start">
        <div class="art-icon">${icon}</div>
        <div class="flex-1">
          <div class="kcard-title">${a.title}</div>
          <div class="kcard-desc">${a.sections[0]?.body || ""}</div>
          <div class="mt-2 row gap-2" style="flex-wrap:wrap">
            <span class="tag">${a.version}</span>
            <span class="tag">${a.status}</span>
            <span class="ai-chip">On-device AI</span>
          </div>
        </div>
      </div>
    `,
    foot: `
      <span class="meta">${a.sources.length} sources</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-artifact" data-artifact-id="${a.id}">Open</button>
    `,
    dataRef: refId,
    onClick: "open-artifact",
  });
}

function taskListCard(card) {
  const refId = card.refId || "thread-vendor-tasks";
  const t = D.threadById(refId);
  const taskPreview = D.tasks.slice(0, card.count || 5).map(tk => {
    const owner = D.userById(tk.ownerId);
    return `<div class="task-mini">
      <div>
        <div class="tt">${tk.title}</div>
        <div class="tm">${owner?.name || ""} · Due ${tk.due}</div>
      </div>
      <span class="status-pill ${tk.status}">${tk.status.replace("-", " ")}</span>
    </div>`;
  }).join("");
  return kcardShell({
    icon: "T",
    kind: "kcard-tasks",
    title: `${card.count || 5} tasks · AI-extracted`,
    body: taskPreview,
    foot: `
      <span class="meta">Source: ${t?.title || "thread"}</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-tasks">View all</button>
    `,
  });
}

function approvalCard(refId) {
  const a = D.approvalById(refId);
  if (!a) return "";
  const submitter = D.userById(a.submittedBy);
  return kcardShell({
    icon: "A",
    kind: "kcard-approval",
    title: "Approval request",
    body: `
      <div class="kcard-title">${a.title}</div>
      <div class="kcard-desc">${a.description}</div>
      <div class="mt-2 row justify-between">
        <div class="ap-amount">${a.amount}</div>
        <span class="status-pill ${a.status}">${a.status}</span>
      </div>
      <div class="mt-2 text-xs text-muted">Submitted by ${submitter?.name || ""} · ${a.submittedAt}</div>
    `,
    foot: `
      <span class="meta">${a.supportingDocs.length} attached</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-approval" data-approval-id="${a.id}">Review</button>
    `,
  });
}

function aiSuggestCard() {
  return `<div class="ai-suggest">${iconSvg("ai", 12)} <span>AI suggestion — click to run</span></div>`;
}

/* ---------------- Business-suite cards (HR / Procurement / Finance / CRM) ---------------- */

const fmtUSD = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function leaveBalanceCard(refId) {
  const lb = D.leaveBalanceById(refId);
  if (!lb) return "";
  const employee = D.userById(lb.employeeId);
  const rows = lb.lines.map(l => `
    <div class="bz-row">
      <div class="bz-label">${l.type}</div>
      <div class="bz-bar">
        <div class="bz-bar-fill" style="width:${Math.round((l.used / Math.max(l.accrued, 1)) * 100)}%"></div>
      </div>
      <div class="bz-values"><b>${l.remaining}</b><span class="text-muted">/${l.accrued} days</span></div>
    </div>
  `).join("");
  return kcardShell({
    icon: "L",
    kind: "kcard-biz kcard-leave-balance",
    title: `Leave balance · ${employee?.name || "Employee"}`,
    body: `<div class="bz-grid">${rows}</div>`,
    foot: `<span class="meta">As of ${lb.asOf}</span>`,
  });
}

function leaveRequestCard(refId) {
  const lr = D.leaveRequestById(refId);
  if (!lr) return "";
  const employee = D.userById(lr.employeeId);
  const approver = D.userById(lr.approverId);
  const calendar = lr.calendarBlocked ? `<span class="tag">Calendar blocked</span>` : "";
  return kcardShell({
    icon: "L",
    kind: "kcard-biz kcard-leave-request",
    title: `Leave request · ${lr.type}`,
    body: `
      <div class="kcard-title">${employee?.name || ""} · ${lr.startDate} → ${lr.endDate}</div>
      <div class="kcard-desc">${lr.days} day${lr.days === 1 ? "" : "s"} · ${lr.reason}</div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="status-pill ${lr.status}">${lr.status}</span>
        ${calendar}
        <span class="tag">Balance ${lr.balanceBefore} → ${lr.balanceAfter} days</span>
      </div>
    `,
    foot: `<span class="meta">${lr.status === "approved" ? `Approved by ${approver?.name || ""}` : `Pending ${approver?.name || ""}`} · ${lr.decidedAt || lr.submittedAt}</span>`,
  });
}

function purchaseReqCard(refId) {
  const pr = D.purchaseReqById(refId);
  if (!pr) return "";
  const requestor = D.userById(pr.requestorId);
  const items = pr.items.map(i => `
    <div class="bz-line">
      <span>${i.qty} × ${i.name}</span>
      <span class="num">${fmtUSD(i.total)}</span>
    </div>
  `).join("");
  return kcardShell({
    icon: "P",
    kind: "kcard-biz kcard-purchase-req",
    title: `Purchase req · ${pr.number}`,
    body: `
      <div class="kcard-title">${pr.title}</div>
      <div class="bz-lines">${items}</div>
      <div class="bz-total row justify-between mt-2">
        <span class="text-muted">Subtotal</span>
        <b>${fmtUSD(pr.subtotal)}</b>
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="tag">${pr.costCenter}</span>
        <span class="status-pill ${pr.status.toLowerCase()}">${pr.status}</span>
      </div>
    `,
    foot: `<span class="meta">Filed by ${requestor?.name || ""} · ${pr.submittedAt}</span>`,
  });
}

function purchaseOrderCard(refId) {
  const po = D.purchaseOrderById(refId);
  if (!po) return "";
  const items = po.items.map(i => `
    <div class="bz-line">
      <span>${i.qty} × ${i.name}</span>
      <span class="num">${fmtUSD(i.total)}</span>
    </div>
  `).join("");
  return kcardShell({
    icon: "O",
    kind: "kcard-biz kcard-purchase-order",
    title: `Purchase order · ${po.number}`,
    body: `
      <div class="kcard-title">${po.supplier}</div>
      <div class="bz-lines">${items}</div>
      <div class="bz-total row justify-between mt-2">
        <span class="text-muted">Total</span>
        <b>${fmtUSD(po.total)}</b>
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="tag">Delivery ${po.expectedDelivery}</span>
        <span class="status-pill ${po.status.toLowerCase()}">${po.status}</span>
      </div>
    `,
    foot: `<span class="meta">Issued ${po.issuedAt} · Sent to ${po.supplierEmail}</span>`,
  });
}

function budgetCheckCard(refId) {
  const bc = D.budgetCheckById(refId);
  if (!bc) return "";
  const ok = bc.percentOfRemaining <= bc.thresholdPercent;
  const statusLabel = ok ? "Within policy" : "Over threshold";
  return kcardShell({
    icon: "B",
    kind: "kcard-biz kcard-budget-check",
    title: `Budget check · ${bc.costCenter}`,
    body: `
      <div class="bz-row-split">
        <div>
          <div class="text-muted text-xs">${bc.period} remaining</div>
          <div class="bz-big">${fmtUSD(bc.remaining)}</div>
        </div>
        <div>
          <div class="text-muted text-xs">Proposed charge</div>
          <div class="bz-big">${fmtUSD(bc.proposedCharge)}</div>
        </div>
        <div>
          <div class="text-muted text-xs">After</div>
          <div class="bz-big">${fmtUSD(bc.remainingAfter)}</div>
        </div>
      </div>
      <div class="bz-bar mt-2">
        <div class="bz-bar-fill ${ok ? "" : "warn"}" style="width:${Math.min(bc.percentOfRemaining, 100)}%"></div>
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="tag">${bc.percentOfRemaining}% of remaining</span>
        <span class="status-pill ${ok ? "approved" : "flagged"}">${statusLabel}</span>
      </div>
    `,
  });
}

function budgetSummaryCard(refId) {
  const bs = D.budgetSummaryById(refId);
  if (!bs) return "";
  const flagged = bs.lines.filter(l => l.flag === "over").length;
  const rows = bs.lines.map(l => {
    const sign = l.variancePct > 0 ? "+" : "";
    const flagCls = l.flag === "over" ? " flagged" : "";
    return `
      <div class="bz-bsum-row${flagCls}">
        <span class="bz-bsum-name">${l.name}</span>
        <span class="bz-bsum-bud">${fmtUSD(l.budget)}</span>
        <span class="bz-bsum-act">${fmtUSD(l.actual)}</span>
        <span class="bz-bsum-var">${sign}${l.variancePct.toFixed(1)}%</span>
      </div>`;
  }).join("");
  return kcardShell({
    icon: "Σ",
    kind: "kcard-biz kcard-budget-summary",
    title: `Budget summary · ${bs.title}`,
    body: `
      <div class="bz-bsum-head">
        <span class="bz-bsum-name">Line</span>
        <span class="bz-bsum-bud">Budget</span>
        <span class="bz-bsum-act">Actual</span>
        <span class="bz-bsum-var">Var</span>
      </div>
      ${rows}
    `,
    foot: `<span class="meta">${flagged} line${flagged === 1 ? "" : "s"} flagged over ${bs.thresholdPct}% · As of ${bs.asOf}</span>`,
  });
}

function aiInsightCard(refId) {
  const ins = D.aiInsightById(refId);
  if (!ins) return "";
  const bullets = ins.bullets.map(b => `
    <div class="bz-line">
      <span>${b.label}</span>
      <span class="num warn">${b.amount}</span>
    </div>
  `).join("");
  return kcardShell({
    icon: "∿",
    kind: "kcard-biz kcard-ai-insight",
    title: `AI insight · ${ins.topic}`,
    body: `
      <div class="kcard-title">${ins.title}</div>
      <div class="bz-lines">${bullets}</div>
      <div class="bz-total row justify-between mt-2">
        <span class="text-muted">Total variance</span>
        <b class="warn">${ins.totalVariance}</b>
      </div>
      <div class="mt-2 text-xs text-muted">
        Traced to <b>${ins.tracedTo.thread}</b> in ${ins.tracedTo.channel} · ${ins.tracedTo.date}
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="ai-chip">On-device AI</span>
        <span class="tag">Confidence: ${ins.confidence}</span>
      </div>
    `,
    foot: `<span class="meta">Recommendation: ${ins.recommendation}</span>`,
  });
}

function billMatchCard(refId) {
  const bm = D.billMatchById(refId);
  if (!bm) return "";
  const rows = bm.lineChecks.map(l => `
    <div class="bz-bsum-row ${l.match ? "" : "flagged"}">
      <span class="bz-bsum-name">${l.name}</span>
      <span class="bz-bsum-bud">PO ${l.poQty} × ${fmtUSD(l.poUnit)}</span>
      <span class="bz-bsum-act">Inv ${l.invQty} × ${fmtUSD(l.invUnit)}</span>
      <span class="bz-bsum-var">${l.match ? "✓" : "✗"}</span>
    </div>`).join("");
  const ok = bm.totalsMatch && bm.exceptions.length === 0;
  return kcardShell({
    icon: "M",
    kind: "kcard-biz kcard-bill-match",
    title: `Bill match · ${bm.invoice.number}`,
    body: `
      <div class="kcard-title">${bm.invoice.supplier} · ${fmtUSD(bm.invoice.amount)}</div>
      <div class="text-xs text-muted">Matched against PO ${bm.poId.toUpperCase()}</div>
      <div class="bz-bsum-head mt-2">
        <span class="bz-bsum-name">Line</span>
        <span class="bz-bsum-bud">PO</span>
        <span class="bz-bsum-act">Invoice</span>
        <span class="bz-bsum-var">Match</span>
      </div>
      ${rows}
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="status-pill ${ok ? "approved" : "flagged"}">${ok ? "All match" : "Exceptions"}</span>
        <span class="tag">${bm.status}</span>
      </div>
    `,
  });
}

function journalEntryCard(refId) {
  const je = D.journalEntryById(refId);
  if (!je) return "";
  const poster = D.userById(je.postedById);
  const lines = je.lines.map(l => `
    <div class="bz-bsum-row">
      <span class="bz-bsum-name">${l.account}</span>
      <span class="bz-bsum-bud">${l.debit ? fmtUSD(l.debit) : ""}</span>
      <span class="bz-bsum-act">${l.credit ? fmtUSD(l.credit) : ""}</span>
      <span class="bz-bsum-var"></span>
    </div>`).join("");
  return kcardShell({
    icon: "J",
    kind: "kcard-biz kcard-journal",
    title: `Journal entry · ${je.number}`,
    body: `
      <div class="kcard-title">${je.description}</div>
      <div class="bz-bsum-head mt-2">
        <span class="bz-bsum-name">Account</span>
        <span class="bz-bsum-bud">Debit</span>
        <span class="bz-bsum-act">Credit</span>
        <span class="bz-bsum-var"></span>
      </div>
      ${lines}
      <div class="bz-total row justify-between mt-2">
        <span class="text-muted">Total</span>
        <b>${fmtUSD(je.total)}</b>
      </div>
    `,
    foot: `<span class="meta">Posted ${je.postedAt} by ${poster?.name || ""}</span>`,
  });
}

function dealCard(refId) {
  const d = D.dealById(refId);
  if (!d) return "";
  const owner = D.userById(d.ownerId);
  const stages = ["Qualified", "Proposal", "Negotiation", "Closed Won"];
  const currentIdx = stages.indexOf(d.stage);
  const pips = stages.map((s, i) => {
    const cls = i < currentIdx ? "done" : i === currentIdx ? "current" : "";
    return `<span class="bz-pip ${cls}">${s}</span>`;
  }).join("");
  return kcardShell({
    icon: "D",
    kind: "kcard-biz kcard-deal",
    title: `Deal · ${d.account}`,
    body: `
      <div class="kcard-title">${d.name} · ${d.seats} seats</div>
      <div class="kcard-desc">${fmtUSD(d.pricePerSeat)}/seat/yr · ${d.term} · ${d.contactRole}</div>
      <div class="bz-pip-row mt-2">${pips}</div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="tag"><b>${fmtUSD(d.arr)}</b> ARR</span>
        <span class="tag">Close ${d.closeDate}</span>
        <span class="tag">Terms: ${d.terms}</span>
        <span class="status-pill ${d.stage === "Closed Won" ? "approved" : "pending"}">${d.stage}</span>
      </div>
    `,
    foot: `<span class="meta">Owner: ${owner?.name || ""} · Risk: ${d.risk}</span>`,
  });
}

function quoteCard(refId) {
  const q = D.quoteById(refId);
  if (!q) return "";
  const items = q.items.map(i => `
    <div class="bz-line">
      <span>${i.qty} × ${i.name}</span>
      <span class="num">${fmtUSD(i.subtotal)}</span>
    </div>
  `).join("");
  return kcardShell({
    icon: "Q",
    kind: "kcard-biz kcard-quote",
    title: `Quote · ${q.number}`,
    body: `
      <div class="bz-lines">${items}</div>
      <div class="bz-total row justify-between">
        <span class="text-muted">Subtotal</span>
        <span class="num">${fmtUSD(q.subtotal)}</span>
      </div>
      <div class="bz-total row justify-between">
        <span class="text-muted">Volume discount (${q.discountPct}%)</span>
        <span class="num warn">−${fmtUSD(q.discount)}</span>
      </div>
      <div class="bz-total row justify-between">
        <span><b>Total</b></span>
        <b>${fmtUSD(q.total)}</b>
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="tag">${q.terms}</span>
        <span class="tag">Valid until ${q.validUntil}</span>
        <span class="status-pill ${q.status.toLowerCase()}">${q.status}</span>
      </div>
    `,
  });
}
