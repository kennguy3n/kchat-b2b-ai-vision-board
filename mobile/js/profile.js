// Me tab: profile, AI employees, quick actions, tenant switcher.
import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";
import { showToast } from "./transitions.js";

export function renderMe(state) {
  const el = document.querySelector('[data-screen="me"]');
  if (!el) return;
  const me = D.userById(D.currentUserId);
  const tenant = D.tenantById(state.tenantId) || D.tenantById(D.primaryTenantId());
  const aiEmps = D.aiEmployees.filter(a =>
    (tenant?.aiEmployeeIds || []).length === 0 || (tenant?.aiEmployeeIds || []).includes(a.id)
  );

  const tenants = D.tenants.map(t => `
    <div class="tenant-row${t.id === state.tenantId ? " active" : ""}" data-action="switch-tenant" data-tenant-id="${t.id}">
      <div class="t-icon" style="background:${t.gradient || t.color}">${t.initials}</div>
      <div>
        <div class="t-name">${t.name}</div>
        <div class="t-desc">${t.description}</div>
      </div>
      <div class="t-check">${t.id === state.tenantId ? iconSvg("check", 18) : ""}</div>
    </div>
  `).join("");

  const aiStrip = aiEmps.map(a => {
    const cooling = a.budget?.cooldown?.state !== "ready";
    return `
      <div class="ai-chip-card" data-action="open-ai" data-ai-id="${a.id}">
        <div class="avatar lg" style="background:${a.color}">${a.initials}</div>
        <div class="row gap-2">
          <span class="status-dot${cooling ? " cooling" : ""}"></span>
          <span class="name">${a.name.split(" ")[0]}</span>
        </div>
      </div>
    `;
  }).join("");

  el.innerHTML = `
    <div class="me-page">
      <div class="me-hero">
        <div class="avatar lg" style="background:${me?.color}">${me?.initials || "K"}</div>
        <div>
          <div class="me-name">${me?.name || "You"}</div>
          <div class="me-role">${me?.role || ""}</div>
          <div class="me-ws">${tenant?.name || D.workspace.name} · On-device AI preferred</div>
        </div>
      </div>

      <div class="me-section">
        <h3>Workspace</h3>
        <div class="me-row">
          <span class="me-ic">${iconSvg("home", 18)}</span>
          <div>${D.workspace.name}<div class="text-xs text-muted">${D.workspace.memberCount} members</div></div>
          <span class="ai-chip">On-device AI</span>
        </div>
      </div>

      <div class="me-section">
        <h3>AI Employees</h3>
        <div class="ai-employee-strip">${aiStrip}</div>
      </div>

      <div class="me-section">
        <h3>Quick actions</h3>
        <div class="me-row" data-action="open-tasks">
          <span class="me-ic">${iconSvg("tasks", 18)}</span>
          <div>My Tasks<div class="text-xs text-muted">${D.tasks.filter(t => t.ownerId === D.currentUserId).length} assigned</div></div>
          <span>›</span>
        </div>
        <div class="me-row" data-action="open-approvals">
          <span class="me-ic">${iconSvg("approve", 18)}</span>
          <div>My Approvals<div class="text-xs text-muted">${Object.values(D.approvals).filter(a => a.approverId === D.currentUserId).length} to review</div></div>
          <span>›</span>
        </div>
      </div>

      <div class="me-section">
        <h3>Communities</h3>
        ${tenants}
      </div>

      <div class="me-section">
        <h3>Account</h3>
        <div class="me-row" data-action="settings">
          <span class="me-ic">${iconSvg("gear", 18)}</span>
          <div>Settings</div><span>›</span>
        </div>
        <div class="me-row" data-action="about">
          <span class="me-ic">${iconSvg("shield", 18)}</span>
          <div>About KChat</div><span>›</span>
        </div>
        <div class="me-row" data-action="signout">
          <span class="me-ic">${iconSvg("close", 18)}</span>
          <div>Sign out</div><span>›</span>
        </div>
      </div>
    </div>
  `;
}

export function wireMe() {
  const el = document.querySelector('[data-screen="me"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "open-ai") {
      const id = e.target.closest("[data-ai-id]")?.dataset.aiId;
      window.app.navigate("ai-employee", { aiEmployeeId: id });
      return;
    }
    if (action === "open-tasks")    { window.app.navigate("tasks"); return; }
    if (action === "open-approvals") {
      // Find first pending approval the current user owns
      const ap = Object.values(D.approvals).find(a => a.approverId === D.currentUserId && a.status === "pending")
              || Object.values(D.approvals)[0];
      window.app.navigate("approval-review", { approvalId: ap.id });
      return;
    }
    if (action === "switch-tenant") {
      const tid = e.target.closest("[data-tenant-id]")?.dataset.tenantId;
      const t = D.tenantById(tid);
      window.app.state.tenantId = tid;
      showToast(`Switched to ${t?.name || "community"}`);
      window.app.refreshAll();
      return;
    }
    if (action === "settings" || action === "about" || action === "signout") {
      showToast("Demo · not wired");
    }
  });
}
