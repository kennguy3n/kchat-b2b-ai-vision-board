// Tasks list, task detail, approval review.
import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";
import { showToast } from "./transitions.js";

/* ---------- Tasks list ---------- */

function ownerAvatar(uid) {
  const u = D.userById(uid);
  if (!u) return "";
  return `<div class="avatar sm" style="background:${u.color || "#6b7280"}">${u.initials}</div>`;
}

export function renderTasks(state) {
  const el = document.querySelector('[data-screen="tasks"]');
  if (!el) return;
  const filter = state.taskFilter || "all";
  const tasks = D.tasks.filter(t => filter === "all" ? true : t.status === filter);
  el.innerHTML = `
    <div class="chip-row">
      ${["all", "todo", "in-progress", "done"].map(f =>
        `<button class="pill${filter === f ? " active" : ""}" data-task-filter="${f}">${f === "all" ? "All" : f.replace("-", " ")}</button>`
      ).join("")}
    </div>
    ${tasks.length === 0 ? `<div class="empty">No tasks</div>` : tasks.map(t => `
      <div class="task-row" data-action="open-task" data-task-id="${t.id}">
        ${ownerAvatar(t.ownerId)}
        <div>
          <div class="tt">${t.title}</div>
          <div class="tm">
            <span>Due ${t.due}</span>
            ${t.isAIExtracted ? `<span class="ai-chip">AI-extracted</span>` : ""}
          </div>
        </div>
        <span class="status-pill ${t.status}">${t.status.replace("-", " ")}</span>
      </div>
    `).join("")}
  `;
}

export function wireTasks() {
  const el = document.querySelector('[data-screen="tasks"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const f = e.target.closest("[data-task-filter]")?.dataset.taskFilter;
    if (f) { window.app.state.taskFilter = f; renderTasks(window.app.state); return; }
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "open-task") {
      const id = e.target.closest("[data-task-id]")?.dataset.taskId;
      window.app.navigate("task-detail", { taskId: id });
    }
  });
}

/* ---------- Task detail ---------- */

export function renderTaskDetail(state) {
  const el = document.querySelector('[data-screen="task-detail"]');
  if (!el) return;
  const t = D.tasks.find(x => x.id === state.taskId);
  if (!t) { el.innerHTML = `<div class="empty">Task not found</div>`; return; }
  const owner = D.userById(t.ownerId);
  el.innerHTML = `
    <div class="task-detail">
      <h2>${t.title}</h2>
      <div class="row gap-2">
        <span class="status-pill ${t.status}">${t.status.replace("-", " ")}</span>
        ${t.isAIExtracted ? `<span class="ai-chip">AI-extracted</span>` : ""}
      </div>
      <div class="meta-grid">
        <div class="k">Owner</div><div>${owner?.name || "Unassigned"}</div>
        <div class="k">Due</div><div>${t.due}</div>
        <div class="k">Source</div><div>${t.sourceThreadId ? `Thread (${t.sourceThreadId})` : "Manual"}</div>
      </div>
    </div>
    <div class="sticky-footer">
      <button class="btn btn-primary btn-block" data-action="mark-done">${iconSvg("check", 14)} Mark done</button>
      <button class="btn btn-secondary btn-block" data-action="reassign">Reassign</button>
    </div>
  `;
}

export function wireTaskDetail() {
  const el = document.querySelector('[data-screen="task-detail"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]")?.dataset.action;
    if (a === "mark-done") { showToast("Task marked done"); window.app.back(); }
    if (a === "reassign")  { showToast("Demo · reassign menu would open"); }
  });
}

/* ---------- Approval review ---------- */

export function renderApprovalReview(state) {
  const el = document.querySelector('[data-screen="approval-review"]');
  if (!el) return;
  const a = D.approvalById(state.approvalId);
  if (!a) { el.innerHTML = `<div class="empty">Approval not found</div>`; return; }
  const submitter = D.userById(a.submittedBy);

  const auditHTML = (a.audit || []).map(step => {
    const actor = D.userById(step.actorId);
    return `
      <div class="audit-step">
        <span class="as-dot"></span>
        <div>
          <div><b>${actor?.name || step.actorId}</b> · ${step.step}</div>
          <div class="as-meta">${step.note || ""}</div>
        </div>
        <div class="text-xs text-muted">${step.ts}</div>
      </div>
    `;
  }).join("") + (a.status === "pending"
    ? `<div class="audit-step pending"><span class="as-dot"></span><div><b>Awaiting your decision</b></div><div class="text-xs">now</div></div>`
    : "");

  const docs = (a.supportingDocs || []).map(d => `
    <div class="attachment">
      <div class="file-icon">${d.name.split(".").pop().toUpperCase().slice(0,3)}</div>
      <div><div class="b">${d.name}</div></div>
    </div>
  `).join("");

  const isPending = a.status === "pending" && !state.approvalDecision;
  const footer = isPending
    ? `
      <button class="btn btn-success btn-block" data-action="approve">${iconSvg("check", 16)} Approve ${a.amount}</button>
      <button class="btn btn-danger btn-block" data-action="deny">${iconSvg("close", 16)} Deny</button>
    `
    : `
      <button class="btn btn-secondary btn-block" data-action="back">Done</button>
    `;

  el.innerHTML = `
    <div class="approval-screen">
      <div class="approval-hero">
        <div class="row gap-2">
          <span class="status-pill ${a.status}">${a.status}</span>
          <span class="text-xs text-muted">Submitted ${a.submittedAt} · ${submitter?.name || ""}</span>
        </div>
        <h2>${a.title}</h2>
        <div class="amount">${a.amount}</div>
        <div class="desc">${a.description}</div>
      </div>
      ${docs ? `<div class="card padded"><h3 style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Supporting docs</h3>${docs}</div>` : ""}
      <div class="audit-trail">
        <h3>Audit trail</h3>
        ${auditHTML}
      </div>
    </div>
    <div class="sticky-footer">${footer}</div>
  `;
}

export function wireApprovalReview() {
  const el = document.querySelector('[data-screen="approval-review"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (!action) return;
    if (action === "back") { window.app.back(); return; }
    const a = D.approvalById(window.app.state.approvalId);
    if (!a) return;
    if (action === "approve" || action === "deny") {
      // Two-step confirmation via toast then state update.
      const verb = action === "approve" ? "Approved" : "Denied";
      showToast(`${verb} ${a.amount}`);
      a.status = action === "approve" ? "approved" : "denied";
      a.audit = [...(a.audit || []), { step: a.status, actorId: D.currentUserId, ts: "now", note: `${verb} on mobile` }];
      window.app.state.approvalDecision = a.status;
      renderApprovalReview(window.app.state);
    }
  });
}

/* ---------- AI Employee profile ---------- */

export function renderAIEmployee(state) {
  const el = document.querySelector('[data-screen="ai-employee"]');
  if (!el) return;
  const a = D.aiById(state.aiEmployeeId);
  if (!a) { el.innerHTML = `<div class="empty">AI Employee not found</div>`; return; }
  const allowed = (a.allowedChannels || []).map(cid => {
    const c = D.channelById(cid);
    return c ? `<span class="pill">#${c.name}</span>` : "";
  }).join("");

  const pct = Math.min(100, Math.round((a.budget?.spentThisPeriod / a.budget?.monthlyCap) * 100));
  const cooling = a.budget?.cooldown?.state !== "ready";

  const queue = (a.queue || []).map(q => `
    <div class="queue-item">
      <div>
        <div style="font-weight:600;font-size:13px">${q.title}</div>
        <div class="text-xs text-muted">${q.recipe || ""}${q.lastUpdated ? ` · ${q.lastUpdated}` : ""}${q.blockedReason ? ` · ${q.blockedReason}` : ""}</div>
      </div>
      <span class="status-pill ${q.status === "running" ? "in-progress" : q.status === "done" ? "done" : q.status === "queued" ? "todo" : "pending"}">${q.status}</span>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="ai-emp-screen">
      <div class="ai-emp-hero">
        <div class="avatar lg" style="background:${a.color}">${a.initials}</div>
        <div>
          <div style="font-weight:700;font-size:18px">${a.name}</div>
          <div class="role">${a.role}</div>
          <div class="status">${a.status}</div>
        </div>
      </div>

      <div class="card padded">
        <div class="text-xs text-muted" style="font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Allowed channels</div>
        <div class="row gap-2 mt-2" style="flex-wrap:wrap">${allowed || `<span class="text-muted text-xs">None</span>`}</div>
      </div>

      <div class="ai-budget${cooling ? " cooling" : ""}">
        <div class="row justify-between">
          <div style="font-weight:700">Monthly budget</div>
          <div class="text-xs text-muted">$${a.budget?.spentThisPeriod?.toFixed(2)} / $${a.budget?.monthlyCap?.toFixed(2)}</div>
        </div>
        <div class="bar"><div style="width:${pct}%"></div></div>
        ${cooling
          ? `<div class="text-xs" style="color:var(--warning)"><b>Cooling down</b> · ${a.budget.cooldown.reason || ""} · ${a.budget.cooldown.nextAvailable || ""}</div>`
          : `<div class="text-xs text-muted">${pct}% used this period</div>`
        }
      </div>

      <div class="card padded">
        <div class="text-xs text-muted" style="font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Task queue</div>
        ${queue || `<div class="text-muted text-xs">Idle</div>`}
      </div>
    </div>
  `;
}
