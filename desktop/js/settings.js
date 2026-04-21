// Settings modal (workspace admin panel)
import * as D from "./demo-data.js";
import { openModal, closeModal } from "./modals.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

const TABS = [
  { id: "general",   label: "General" },
  { id: "privacy",   label: "Privacy & AI Policy" },
  { id: "connectors",label: "Connectors" },
  { id: "ai",        label: "AI Employees" },
  { id: "templates", label: "Templates" },
];

export function openSettings() {
  const body = document.getElementById("settings-body");
  body.innerHTML = `
    <div class="settings-body">
      <div class="settings-side">
        ${TABS.map((t, i) => `<button class="${i === 0 ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`).join("")}
      </div>
      <div id="settings-tab-content"></div>
    </div>
  `;
  openModal("settings-modal");
  // wire tabs
  body.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      body.querySelectorAll("[data-tab]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderTab(btn.getAttribute("data-tab"));
    });
  });
  renderTab("general");
}

function renderTab(id) {
  const el = document.getElementById("settings-tab-content");
  if (id === "general")    el.innerHTML = generalTab();
  if (id === "privacy")    { el.innerHTML = privacyTab();    wireToggles(); }
  if (id === "connectors") el.innerHTML = connectorsTab();
  if (id === "ai")         { el.innerHTML = aiTab();         wireToggles(); }
  if (id === "templates")  el.innerHTML = templatesTab();
}

function generalTab() {
  return `
    <div class="setting-row">
      <div>
        <div class="label">Workspace name</div>
        <div class="sub">Shown in the sidebar and login screens</div>
      </div>
      <div>${D.workspace.name}</div>
    </div>
    <div class="setting-row">
      <div>
        <div class="label">Workspace logo</div>
        <div class="sub">Square SVG / PNG recommended</div>
      </div>
      <div class="avatar md" style="background:linear-gradient(135deg,#6366f1,#8b5cf6)">Ac</div>
    </div>
    <div class="setting-row">
      <div>
        <div class="label">Members</div>
        <div class="sub">${D.workspace.memberCount} active, 12 pending invites</div>
      </div>
      <button class="btn btn-secondary btn-sm">Manage</button>
    </div>
  `;
}

function privacyTab() {
  const p = D.settings.privacy;
  const row = (key, label, sub) => `
    <div class="setting-row">
      <div>
        <div class="label">${label}</div>
        <div class="sub">${sub}</div>
      </div>
      <div class="toggle ${p[key] ? "on" : ""}" data-setting-toggle="${key}" role="switch" aria-checked="${p[key]}"></div>
    </div>
  `;
  return `
    <div class="ai-inline-hint">${iconSvg("shield", 14)} Policy controls who and what can leave the workspace. Defaults favor on-device AI.</div>
    ${row("onDevicePreferred",        "On-device preferred",        "Run on-device models before falling back")}
    ${row("allowConfidentialServerAI","Allow confidential server AI","Permit K-Chat confidential compute nodes when on-device is insufficient")}
    ${row("allowFrontierFallback",    "Allow frontier model fallback","Permit third-party frontier models for non-sensitive work")}
    ${row("requirePIITokenization",   "Require PII tokenization",   "Automatically tokenize personally identifiable info before egress")}
  `;
}

function connectorsTab() {
  return D.settings.connectors.map(c => `
    <div class="setting-row">
      <div>
        <div class="label">${c.name} ${c.connected ? `<span class="tag" style="background:var(--success-50);color:#066a4f">Connected</span>` : ""}</div>
        <div class="sub">${c.connected ? `Scoped to ${c.scope}` : "Not connected"}</div>
      </div>
      ${c.connected ? `<button class="btn btn-secondary btn-sm">Manage</button>` : `<button class="btn btn-primary btn-sm">Connect</button>`}
    </div>
  `).join("");
}

function aiTab() {
  return D.aiEmployees.map(ai => `
    <div class="setting-row">
      <div>
        <div class="label">${ai.name}</div>
        <div class="sub">${ai.role} · concurrency ${ai.concurrency} · channels ${ai.allowedChannels.length}</div>
      </div>
      <div class="toggle ${ai.enabled ? "on" : ""}" data-setting-toggle="ai-${ai.id}" role="switch"></div>
    </div>
  `).join("");
}

function templatesTab() {
  return D.settings.templates.map(t => `
    <div class="setting-row">
      <div>
        <div class="label">${t.name}</div>
        <div class="sub">Template · ${t.kind}</div>
      </div>
      <button class="btn btn-secondary btn-sm">Edit</button>
    </div>
  `).join("");
}

function wireToggles() {
  document.querySelectorAll("[data-setting-toggle]").forEach(tog => {
    tog.addEventListener("click", () => {
      tog.classList.toggle("on");
      showToast("Setting updated (demo only).", 1400);
    });
  });
}
