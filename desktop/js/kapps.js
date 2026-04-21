// KApps in the right panel: Forms, Base, Sheet, Tasks
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

/* ---------------- Tasks panel ---------------- */
export function renderTaskPanel(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const mode = params.mode || "list";
  const list = D.tasks.map(taskRow).join("");
  const kanban = ["todo", "in-progress", "done"].map(col => {
    const items = D.tasks.filter(t => t.status === col).map(t => {
      const owner = D.userById(t.ownerId);
      return `<div class="kanban-card" data-task-id="${t.id}">
        <div class="b">${t.title}</div>
        <div class="due">${owner?.name || ""} · Due ${t.due}</div>
      </div>`;
    }).join("");
    return `<div class="kanban-col">
      <h5>${col.replace("-", " ")}</h5>
      ${items}
    </div>`;
  }).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Tasks</div>
        <div class="sub">${D.tasks.length} total · ${D.tasks.filter(t => t.isAIExtracted).length} AI-extracted</div>
      </div>
      <span class="spacer"></span>
      <div class="task-tabs" id="task-tabs">
        <button class="${mode === "list" ? "active" : ""}" data-mode="list">List</button>
        <button class="${mode === "board" ? "active" : ""}" data-mode="board">Board</button>
      </div>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="ai-inline-hint">${iconSvg("ai", 14)} Extracted from the active thread with on-device AI.</div>
      <div id="task-view-list" style="${mode === "list" ? "" : "display:none"}">
        <div class="task-list">${list}</div>
      </div>
      <div id="task-view-board" style="${mode === "board" ? "" : "display:none"}">
        <div class="kanban">${kanban}</div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost">Export</button>
      <button class="btn btn-primary">+ New Task</button>
    </div>
  `;
  wireTaskEvents();
}

function taskRow(t) {
  const owner = D.userById(t.ownerId);
  const aiBadge = t.isAIExtracted ? `<span class="ai-chip">AI-extracted</span>` : "";
  return `<div class="task-row" data-task-id="${t.id}">
    <div>
      <div class="t-title">${t.title} ${aiBadge}</div>
      <div class="t-sub">${owner?.name || ""} · source: ${t.sourceThreadId ? "thread" : "manual"}</div>
    </div>
    <div class="avatar sm" style="background:${owner?.color || "#888"}">${owner?.initials || "?"}</div>
    <span class="t-sub">Due ${t.due}</span>
    <span class="status-pill ${t.status}">${t.status.replace("-", " ")}</span>
  </div>`;
}

function wireTaskEvents() {
  document.querySelectorAll("#task-tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#task-tabs button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.getAttribute("data-mode");
      document.getElementById("task-view-list").style.display  = mode === "list"  ? "" : "none";
      document.getElementById("task-view-board").style.display = mode === "board" ? "" : "none";
    });
  });
  document.querySelectorAll(".task-row, .kanban-card").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-task-id");
      window.app.openRightView("task-detail", { taskId: id });
    });
  });
}

export function renderTaskDetail(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const task = D.tasks.find(t => t.id === params.taskId) || D.tasks[0];
  const owner = D.userById(task.ownerId);
  const sourceThread = task.sourceThreadId ? D.threadById(task.sourceThreadId) : null;
  view.innerHTML = `
    <div class="rp-head">
      <button class="icon-btn" data-back-view="task-panel">${iconSvg("back", 14)}</button>
      <div>
        <div class="title">Task</div>
        <div class="sub">${task.isAIExtracted ? "AI-extracted" : "Manual"}</div>
      </div>
      <span class="spacer"></span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="approval-card">
        <h3 style="margin:0 0 6px;">${task.title}</h3>
        <div class="text-sm text-muted">Extracted from thread + assigned automatically. Confirm before publishing to KApp.</div>
        <div class="mt-4 grid-2">
          <div><div class="text-xs text-muted">Owner</div>
            <div class="row gap-2 mt-2"><div class="avatar sm" style="background:${owner?.color}">${owner?.initials}</div> ${owner?.name}</div>
          </div>
          <div><div class="text-xs text-muted">Due</div><div class="b mt-2">${task.due}</div></div>
          <div><div class="text-xs text-muted">Status</div><div class="mt-2"><span class="status-pill ${task.status}">${task.status.replace("-"," ")}</span></div></div>
          <div><div class="text-xs text-muted">Source</div><div class="mt-2">${sourceThread ? sourceThread.title : "Manual"}</div></div>
        </div>
      </div>
      <div class="output-sec">
        <h4>Activity</h4>
        <div class="audit-trail mt-2">
          <div class="audit-step"><span class="dot"></span> Created by Kara Ops AI <span class="text-soft">09:33</span></div>
          <div class="audit-step"><span class="dot"></span> Assigned to ${owner?.name} <span class="text-soft">09:33</span></div>
          <div class="audit-step pending"><span class="dot"></span> Awaiting start <span class="text-soft">now</span></div>
        </div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost">Reassign</button>
      <button class="btn btn-primary">Mark as done</button>
    </div>
  `;
  document.querySelector("[data-back-view]")?.addEventListener("click", () => {
    window.app.openRightView("task-panel");
  });
}

/* ---------------- Forms KApp ---------------- */
export function renderForm(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const form = D.forms["f-vendor-intake"];
  const fields = form.fields.map(f => {
    const aiBadge = f.aiPrefilled ? `<span class="ai-prefill-badge">AI prefill</span>` : "";
    if (f.type === "select") {
      const opts = f.options.map(o => `<option${o === f.prefill ? " selected" : ""}>${o}</option>`).join("");
      return `<div class="form-field">
        <label>${f.label} ${aiBadge}</label>
        <select>${opts}</select>
      </div>`;
    }
    return `<div class="form-field">
      <label>${f.label} ${aiBadge}</label>
      <input type="${f.type}" value="${f.prefill || ""}"/>
    </div>`;
  }).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">${form.title}</div>
        <div class="sub">Auto-linked to vendor register</div>
      </div>
      <span class="spacer"></span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="ai-inline-hint">${iconSvg("ai", 14)} Prefilled from the current thread. Review before submitting.</div>
      ${fields}
      <div class="divider"></div>
      <div class="text-sm text-muted">Response will be linked to:</div>
      <div class="row gap-2 mt-2">
        <a href="#" class="tag">Task #12</a>
        <a href="#" class="tag">Base: Vendor Register</a>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" data-close-right>Cancel</button>
      <button class="btn btn-primary" id="form-submit">Submit</button>
    </div>
  `;
  const submit = document.getElementById("form-submit");
  if (submit) submit.addEventListener("click", () => {
    showToast("Response submitted. Linked to Vendor Register.");
  });
}

/* ---------------- Base KApp ---------------- */
export function renderBase(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const rows = D.baseRows.map(r => `
    <tr>
      <td><b>${r.name}</b></td>
      <td>${r.category}</td>
      <td><span class="risk-pill ${r.risk}">${r.risk}</span></td>
      <td>${r.value}</td>
      <td>${r.status}</td>
      <td>${r.lastReview}</td>
    </tr>
  `).join("");
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Vendor Register</div>
        <div class="sub">Base · ${D.baseRows.length} rows</div>
      </div>
      <span class="spacer"></span>
      <button class="icon-btn" title="Filter">${iconSvg("filter", 14)}</button>
      <button class="icon-btn" title="Sort">${iconSvg("sort", 14)}</button>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body" style="padding:0">
      <table class="table">
        <thead>
          <tr>
            <th>Name</th><th>Category</th><th>Risk</th><th>Contract Value</th><th>Status</th><th>Last Review</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost">Export</button>
      <button class="btn btn-primary">+ Add Row</button>
    </div>
  `;
}

/* ---------------- Sheet KApp ---------------- */
export function renderSheet(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const s = D.sheetData;
  const head = s.columns.map(c => `<th>${c}</th>`).join("");
  const rows = s.rows.map(r => `<tr>${r.map((v,i) => {
    const cls = i === s.columns.length - 1
      ? (v.startsWith("-") ? "text-muted" : v.startsWith("+") ? "" : "")
      : "";
    const formula = i === s.columns.length - 1 ? ` title="=formula"` : "";
    return `<td class="${cls}"${formula}>${v}</td>`;
  }).join("")}</tr>`).join("");
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">${s.title}</div>
        <div class="sub">Sheet · ${s.rows.length} rows</div>
      </div>
      <span class="spacer"></span>
      <button class="btn btn-ai btn-sm" id="sheet-ai">${iconSvg("ai", 12)} Generate Summary</button>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body" style="padding:0">
      <table class="table">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost">Export CSV</button>
      <button class="btn btn-primary">+ Row</button>
    </div>
  `;
  const ai = document.getElementById("sheet-ai");
  if (ai) ai.addEventListener("click", () => window.app.openRightView("summary"));
}
