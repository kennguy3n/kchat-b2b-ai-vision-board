// AI tab: full-screen Action Launcher + brief builder + processing + output.
// Also exposes a half-sheet variant of the launcher for the chat compose bar.

import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";
import { openSheet, closeSheet } from "./sheets.js";
import { delay, showToast } from "./transitions.js";

const MODE_BADGES = {
  auto:   { label: "Auto" },
  inline: { label: "Inline" },
};

const PROC_STEPS = [
  { id: "read",  label: "Reading sources" },
  { id: "plan",  label: "Planning outline" },
  { id: "draft", label: "Drafting sections" },
  { id: "ready", label: "Ready for review" },
];

const CHANNEL_SUGGESTIONS = {
  "c-vendor": [
    { id: "analyze-summary", label: "Summarize Orbix email", sub: "AI recap of latest remediation thread" },
    { id: "plan-tasks",      label: "Extract Tasks",         sub: "Pull action items from this thread" },
    { id: "approve-new",     label: "Create Approval",       sub: "Prefill from the conversation" },
  ],
  "c-specs": [
    { id: "create-prd",  label: "Draft PRD",      sub: "Standard product requirements doc",  recipeId: "r-draft-prd",  templateId: "tpl-prd" },
    { id: "plan-tasks",  label: "Extract Tasks",  sub: "Turn discussion into assignments" },
  ],
  "c-deals": [
    { id: "create-qbr",      label: "Create QBR",     sub: "Quarterly business review deck", recipeId: "r-create-qbr", templateId: "tpl-qbr" },
    { id: "analyze-summary", label: "Summarize",      sub: "Pipeline + risk highlights" },
  ],
};
const DEFAULT_SUGGESTIONS = [
  { id: "analyze-summary", label: "Summarize Thread", sub: "Key points with sources" },
  { id: "plan-tasks",      label: "Extract Tasks",    sub: "Turn messages into action items" },
  { id: "create-prd",      label: "Draft Doc",        sub: "Kick off a structured draft", recipeId: "r-draft-prd", templateId: "tpl-prd" },
];

function actionTileHTML(a, intentLabel = "") {
  const badge = a.mode && MODE_BADGES[a.mode]
    ? `<span class="mode-badge mode-${a.mode}">${MODE_BADGES[a.mode].label}</span>`
    : "";
  return `
    <button class="action-tile-mob" data-action-id="${a.id}" data-recipe-id="${a.recipeId || ""}" data-template-id="${a.templateId || ""}" data-action-label="${a.label}">
      <span class="at-icon">${a.icon || a.label[0]}</span>
      <span class="at-label">${a.label} ${badge}</span>
      <span class="at-sub">${a.sub || intentLabel}</span>
    </button>
  `;
}

/* ---------- AI Tab — full-screen launcher ---------- */

export function renderAILauncher(state) {
  const el = document.querySelector('[data-screen="ai-launcher"]');
  if (!el) return;

  const intentTabs = D.coreIntents.map(i =>
    `<button class="pill${state.aiIntent === i.id ? " active" : ""}" data-intent-tab="${i.id}">${iconSvg(i.icon, 12)} ${i.label}</button>`
  ).join("");
  const allPill = `<button class="pill${!state.aiIntent ? " active" : ""}" data-intent-tab="">All</button>`;

  const channelId = state.channelId;
  const suggestions = CHANNEL_SUGGESTIONS[channelId] || DEFAULT_SUGGESTIONS;
  const suggHTML = suggestions.slice(0, 3).map(s => `
    <div class="ai-suggest-card" data-action-id="${s.id}" data-recipe-id="${s.recipeId || ""}" data-template-id="${s.templateId || ""}" data-action-label="${s.label}">
      <span class="as-icon">${iconSvg("ai", 16)}</span>
      <div>
        <div class="as-label">${s.label}</div>
        <div class="as-sub">${s.sub}</div>
      </div>
    </div>
  `).join("");

  const intents = D.coreIntents.filter(i => !state.aiIntent || i.id === state.aiIntent);
  const groupsHTML = intents.map(i => `
    <div class="sec-head"><span>${i.label} · ${i.sub}</span></div>
    <div class="action-grid">
      ${i.actions.map(a => actionTileHTML(a, i.label)).join("")}
    </div>
  `).join("");

  el.innerHTML = `
    <div class="search-bar">
      <input type="search" placeholder="Search actions" />
    </div>
    <div class="chip-row">
      ${allPill}
      ${intentTabs}
    </div>
    <div class="sec-head"><span>Suggested for you</span></div>
    <div class="action-grid">
      ${suggHTML.replace(/<div class="ai-suggest-card"/g, '<div class="ai-suggest-card"')}
    </div>
    ${groupsHTML}
  `;
}

export function wireAILauncher() {
  const el = document.querySelector('[data-screen="ai-launcher"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const intent = e.target.closest("[data-intent-tab]")?.dataset.intentTab;
    if (intent !== undefined) {
      window.app.state.aiIntent = intent || null;
      renderAILauncher(window.app.state);
      return;
    }
    handleActionTileClick(e);
  });
}

/* ---------- Action launcher as a bottom sheet (from compose bar) ---------- */

export function openActionLauncherSheet() {
  const channelId = window.app?.state?.channelId || null;
  const suggestions = CHANNEL_SUGGESTIONS[channelId] || DEFAULT_SUGGESTIONS;
  const allActions = D.coreIntents.flatMap(i => i.actions);

  const tilesHTML = allActions.map(a => actionTileHTML(a)).join("");

  const html = `
    <h2>AI Actions</h2>
    <div class="sec-head" style="padding-top:0"><span>Suggested for this channel</span></div>
    <div class="action-grid">
      ${suggestions.map(s => `
        <button class="action-tile-mob" data-action-id="${s.id}" data-recipe-id="${s.recipeId || ""}" data-template-id="${s.templateId || ""}" data-action-label="${s.label}">
          <span class="at-icon">${iconSvg("ai", 14)}</span>
          <span class="at-label">${s.label}</span>
          <span class="at-sub">${s.sub}</span>
        </button>
      `).join("")}
    </div>
    <div class="sec-head"><span>All actions</span></div>
    <div class="action-grid">
      ${tilesHTML}
    </div>
  `;
  openSheet(html, {
    onMount: (el) => {
      el.addEventListener("click", (e) => {
        if (handleActionTileClick(e)) closeSheet();
      });
    },
  });
}

function handleActionTileClick(e) {
  const tile = e.target.closest("[data-action-id]");
  if (!tile) return false;
  const actionId = tile.dataset.actionId;
  const templateId = tile.dataset.templateId;
  const label = tile.dataset.actionLabel || actionId;

  // Route Auto-style "Create" tasks into the brief builder; everything
  // else just flashes a toast since deeper flows are desktop-only.
  const isCreate = ["create-prd", "create-qbr", "create-sop", "create-proposal"].includes(actionId);
  if (isCreate || actionId === "analyze-summary" || actionId === "plan-tasks") {
    window.app.navigate("ai-brief", {
      briefTemplate: { id: templateId || actionId, name: label, actionId },
    });
    return true;
  }
  showToast(`${label} (demo)`);
  return true;
}

/* ---------- Brief builder ---------- */

export function renderBrief(state) {
  const el = document.querySelector('[data-screen="ai-brief"]');
  if (!el) return;
  const tpl = state.briefTemplate || { name: "Doc" };
  const channel = D.channelById(state.channelId);
  const audiencePool = ["Engineering", "Product", "Sales", "Operations", "Finance", "Executive"];
  const sourcePool = [
    channel ? `# ${channel.name}` : "current thread",
    "Linked files",
    "Channel knowledge",
  ];

  el.innerHTML = `
    <form class="brief-form" onsubmit="return false">
      <label>Goal
        <textarea placeholder="Draft a 1-pager for ${tpl.name}…">Draft a ${tpl.name} from the latest thread context.</textarea>
      </label>
      <label>Audience
        <div class="chips">
          ${audiencePool.map((a, i) => `<button type="button" class="pill${i < 2 ? " active" : ""}">${a}</button>`).join("")}
        </div>
      </label>
      <label>Sources
        <div class="chips">
          ${sourcePool.map(s => `<button type="button" class="pill active">${s}</button>`).join("")}
        </div>
      </label>
      <label>Template
        <select>
          <option>${tpl.name}</option>
          <option>Standard PRD</option>
          <option>SOP</option>
          <option>Proposal</option>
        </select>
      </label>
      <label>Tone
        <select>
          <option>Neutral</option>
          <option>Concise executive</option>
          <option>Technical</option>
        </select>
      </label>
      <label>Anything missing?
        <input type="text" placeholder="Optional notes for the AI"/>
      </label>
      <div class="privacy-card">
        <span class="pc-icon">${iconSvg("shield", 14)}</span>
        <div>
          <div style="font-weight:700">On-device AI</div>
          <div>Runs locally on this device. 0 bytes egress to external services.</div>
        </div>
      </div>
    </form>
    <div class="sticky-footer">
      <button class="btn btn-primary btn-block" data-action="generate">${iconSvg("sparkle", 16)} Generate Draft</button>
    </div>
  `;
}

export function wireBrief() {
  const el = document.querySelector('[data-screen="ai-brief"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-action='generate']")) {
      window.app.navigate("ai-processing", {});
    }
    const pill = e.target.closest(".chips .pill");
    if (pill) pill.classList.toggle("active");
  });
}

/* ---------- AI Processing ---------- */

let procTimer = null;
export function renderProcessing(state) {
  const el = document.querySelector('[data-screen="ai-processing"]');
  if (!el) return;
  el.innerHTML = `
    <div class="proc-stage">
      <div class="proc-spinner"></div>
      <div style="font-weight:600;font-size:16px">Drafting your ${state.briefTemplate?.name || "document"}…</div>
      <div class="proc-steps" id="proc-steps">
        ${PROC_STEPS.map((s, i) => `
          <div class="proc-step${i === 0 ? " active" : ""}" data-step="${s.id}">
            <span class="ps-icon">${i === 0 ? iconSvg("sparkle", 14) : iconSvg("check", 14)}</span>
            <span>${s.label}</span>
          </div>
        `).join("")}
      </div>
      <div class="ai-chip">${iconSvg("shield", 12)} On-device AI · 0 bytes egress</div>
    </div>
  `;

  if (procTimer) clearTimeout(procTimer);
  let i = 0;
  function advance() {
    const steps = el.querySelectorAll(".proc-step");
    if (!steps.length) return;
    steps[i].classList.remove("active");
    steps[i].classList.add("done");
    i++;
    if (i >= steps.length) {
      procTimer = setTimeout(() => {
        if (window.app.state.screen === "ai-processing") {
          window.app.replaceCurrent("ai-output", {
            artifactId: window.app.state.artifactId || "a-prd-vendor-portal",
          });
        }
      }, 600);
      return;
    }
    steps[i].classList.add("active");
    procTimer = setTimeout(advance, 900);
  }
  procTimer = setTimeout(advance, 900);
}

/* ---------- AI Output Review ---------- */

export function renderOutput(state) {
  const el = document.querySelector('[data-screen="ai-output"]');
  if (!el) return;
  const a = D.artifactById(state.artifactId) || D.artifactById("a-prd-vendor-portal");
  if (!a) { el.innerHTML = `<div class="empty">Artifact not found</div>`; return; }

  const sections = (a.sections || []).map((s, i) => `
    <div class="section">
      <h3>${s.heading}<span class="conf ${s.confidence === "review" ? "review" : ""}">${s.confidence || "high"}</span></h3>
      <p>${s.body}</p>
    </div>
  `).join("");

  el.innerHTML = `
    <div class="output-doc">
      <div class="ai-chip">${iconSvg("shield", 12)} On-device AI · ${a.sources?.length || 0} sources</div>
      <h2>${a.title}</h2>
      <div class="text-muted text-xs">${a.template} · ${a.version} · ${a.status}</div>
      ${sections}
      <details class="sources" open>
        <summary>Sources</summary>
        <ul>
          ${(a.sources || []).map(s => `<li>${s.name} <span class="text-muted">· ${s.kind}</span></li>`).join("")}
        </ul>
      </details>
    </div>
    <div class="sticky-footer">
      <button class="btn btn-primary btn-block" data-action="edit-workspace">${iconSvg("doc", 14)} Edit in Workspace</button>
      <button class="btn btn-secondary btn-block" data-action="publish">${iconSvg("send", 14)} Publish to Channel</button>
      <button class="btn btn-ghost btn-block" data-action="discard">Discard</button>
    </div>
  `;
}

export function wireOutput() {
  const el = document.querySelector('[data-screen="ai-output"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "edit-workspace") { showToast("Workspace editor is desktop-only"); return; }
    if (action === "publish")        { showToast("Published to channel"); window.app.back(); return; }
    if (action === "discard")        { showToast("Draft discarded"); window.app.back(); return; }
  });
}
