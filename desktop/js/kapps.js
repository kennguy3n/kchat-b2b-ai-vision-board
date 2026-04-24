// KApps in the right panel: Forms, Base, Sheet, Tasks
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

// Scopes document-level listeners added by the Sheet co-pilot (cell popover
// + column menu outside-click dismissers) so re-renders of renderSheet do not
// leak handlers against detached DOM.
let sheetAbort = null;

// Shared empty-state primitive. Returned as HTML so callers can inline it
// into their rp-body when a collection is empty.
export function renderEmptyState({ icon = "?", title, description, ctaLabel, ctaId }) {
  return `
    <div class="empty-state" role="status">
      <div class="es-icon">${icon}</div>
      <div class="es-title">${title}</div>
      <div class="es-desc">${description}</div>
      ${ctaLabel ? `<div class="es-actions"><button class="btn btn-primary btn-sm" id="${ctaId || ""}">${ctaLabel}</button></div>` : ""}
    </div>
  `;
}

// Expand/collapse toggle used by Tasks / Base / Sheet right-panel views.
function expandBtnHTML() {
  return `<button class="icon-btn" data-expand-right title="Expand" aria-label="Expand right panel">${iconSvg("expand", 14)}</button>`;
}
function wireExpandButtons() {
  document.querySelectorAll("[data-expand-right]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.app.expandRightView();
    });
  });
}

/* ---------------- Tasks panel ---------------- */
export function renderTaskPanel(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const mode = params.mode || "list";
  const hasTasks = D.tasks && D.tasks.length > 0;
  const list = hasTasks
    ? D.tasks.map(taskRow).join("")
    : renderEmptyState({
        icon: iconSvg("tasks", 20),
        title: "No tasks yet",
        description: "Extract tasks from a thread with AI, or create one manually.",
        ctaLabel: "+ Create Task",
        ctaId: "empty-create-task",
      });
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
      ${expandBtnHTML()}
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
  wireExpandButtons();
  document.getElementById("empty-create-task")?.addEventListener("click", () => {
    showToast("Demo: new task form would open here.");
  });
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
      <div class="text-sm text-muted">After submission, this response will be:</div>
      <ul class="text-sm text-muted" style="padding-left:18px;margin:6px 0">
        <li>Linked to <a href="#" class="tag" style="display:inline-flex">Task #12</a> and <a href="#" class="tag" style="display:inline-flex">Base: Vendor Register</a></li>
        <li>Posted back to the thread so the team sees the outcome</li>
        <li>Reviewable by the approver before any amount-based action fires</li>
      </ul>
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
      <button class="icon-btn" title="Filter" aria-label="Filter rows">${iconSvg("filter", 14)}</button>
      <button class="icon-btn" title="Sort" aria-label="Sort rows">${iconSvg("sort", 14)}</button>
      ${expandBtnHTML()}
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body" style="padding:0">
      <table class="table">
        <thead>
          <tr>
            <th title="Vendor display name">Name</th>
            <th title="Procurement category used for policy + risk weighting">Category</th>
            <th title="Risk score — combines data sensitivity, financial exposure, and SLA history">Risk</th>
            <th title="Signed contract value for the current term">Contract Value</th>
            <th title="Lifecycle stage — active, in renewal, suspended, etc.">Status</th>
            <th title="Date of the last compliance / risk re-review">Last Review</th>
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
  wireExpandButtons();
}

/* ---------------- Sheet KApp ---------------- */
export function renderSheet(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const s = D.sheetData;
  const copilot = D.sheetCopilotData || {};
  const varianceIdx = s.columns.length - 1;

  const head = s.columns.map((c, ci) => {
    const hasInsight = copilot.columnInsights && copilot.columnInsights[c];
    return `<th data-col-idx="${ci}" data-col-name="${c}">
      <span class="col-label">${c}</span>
      ${hasInsight ? `<button class="col-ai-btn" data-col-ai="${ci}" title="AI actions for ${c}">${iconSvg("ai", 11)}</button>` : ""}
    </th>`;
  }).join("");

  const rows = s.rows.map((r, ri) => `<tr data-row-idx="${ri}">${r.map((v,i) => {
    const isVariance = i === varianceIdx;
    const cls = isVariance
      ? (v.startsWith("-") ? "text-muted" : v.startsWith("+") ? "" : "")
      : "";
    const cellAttrs = isVariance
      ? ` class="${cls} variance-cell" data-variance-cell data-row-idx="${ri}"`
      : (cls ? ` class="${cls}"` : "");
    return `<td${cellAttrs}>${v}</td>`;
  }).join("")}</tr>`).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">${s.title}</div>
        <div class="sub">Sheet · ${s.rows.length} rows · <span class="ai-chip">Co-pilot</span></div>
      </div>
      <span class="spacer"></span>
      <button class="btn btn-ai btn-sm" id="sheet-visualize" title="Render a chart of the variance column">${iconSvg("ai", 12)} Visualize</button>
      <button class="btn btn-ai btn-sm" id="sheet-ai">${iconSvg("ai", 12)} Generate Summary</button>
      ${expandBtnHTML()}
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body" style="padding:0">
      <div class="ai-formula-bar" id="ai-formula-bar">
        <span class="afb-label">${iconSvg("ai", 12)} fx</span>
        <input id="ai-formula-input" ${params.focusFormula ? "autofocus" : ""}
               placeholder="Ask AI: e.g., 'total variance across all categories'" />
        <button class="btn btn-ai btn-sm" id="ai-formula-run">Run</button>
        <div class="afb-result" id="afb-result" hidden></div>
      </div>
      <table class="table sheet-table" id="sheet-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="sheet-chart" id="sheet-chart" hidden></div>
      <div class="cell-popover" id="cell-popover" hidden></div>
      <div class="col-ai-menu" id="col-ai-menu" hidden></div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost">Export CSV</button>
      <button class="btn btn-primary">+ Row</button>
    </div>
  `;
  const ai = document.getElementById("sheet-ai");
  if (ai) ai.addEventListener("click", () => window.app.openRightView("summary"));
  const viz = document.getElementById("sheet-visualize");
  if (viz) viz.addEventListener("click", () => toggleSheetChart(view, s, varianceIdx));
  wireExpandButtons();

  // Tear down document-level listeners from the previous renderSheet so the
  // cell popover + column menu outside-click handlers do not accumulate.
  if (sheetAbort) sheetAbort.abort();
  sheetAbort = new AbortController();
  const sheetSignal = sheetAbort.signal;

  wireFormulaBar(view, s, copilot, varianceIdx);
  wireVarianceCells(view, copilot, sheetSignal);
  wireColumnAI(view, s, copilot, sheetSignal);

  if (params.focusFormula) {
    setTimeout(() => document.getElementById("ai-formula-input")?.focus(), 50);
  }
}

/* ---------------- Sheet co-pilot: AI formula bar ---------------- */
function wireFormulaBar(view, s, copilot, varianceIdx) {
  const input = view.querySelector("#ai-formula-input");
  const run = view.querySelector("#ai-formula-run");
  const result = view.querySelector("#afb-result");
  if (!input || !run || !result) return;

  function runQuery() {
    const q = input.value.trim();
    if (!q) return;
    clearHighlights(view);

    const formula = (copilot.formulaSuggestions || []).find(f => f.match.test(q));
    if (formula) {
      result.hidden = false;
      result.innerHTML = `
        <div class="afb-formula">
          <code>${formula.formula}</code>
          <span class="afb-arrow">→</span>
          <b>${formula.result}</b>
        </div>
        <div class="afb-explain">${formula.explain}</div>
        <div class="afb-actions">
          <button class="btn btn-primary btn-sm" data-afb-insert>Insert</button>
          <button class="btn btn-ghost btn-sm" data-afb-dismiss>Dismiss</button>
        </div>
      `;
      result.querySelector("[data-afb-insert]").addEventListener("click", () => {
        showToast(`Formula ${formula.formula} inserted.`);
        result.hidden = true;
      });
      result.querySelector("[data-afb-dismiss]").addEventListener("click", () => {
        result.hidden = true;
      });
    }

    // NL query → row highlights (independent of formula suggestion).
    const nl = (copilot.nlQueries || []).find(n => n.match.test(q));
    if (nl) {
      applyHighlights(view, s, varianceIdx, nl.highlightPredicate);
      showToast(nl.message);
    } else if (!formula) {
      showToast("Try: 'total variance', 'over budget', 'Logistics', 'highest'.");
    }
  }

  run.addEventListener("click", runQuery);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") runQuery(); });
}

function applyHighlights(view, s, varianceIdx, predicate) {
  clearHighlights(view);
  view.querySelectorAll("tbody tr").forEach(tr => {
    const idx = parseInt(tr.getAttribute("data-row-idx"), 10);
    const row = s.rows[idx];
    const varianceVal = row[varianceIdx];
    if (predicate(varianceVal, row)) tr.classList.add("highlight");
  });
}
function clearHighlights(view) {
  view.querySelectorAll("tbody tr.highlight").forEach(tr => tr.classList.remove("highlight"));
}

/* ---------------- Sheet co-pilot: cell-level AI explain ---------------- */
function wireVarianceCells(view, copilot, signal) {
  const popover = view.querySelector("#cell-popover");
  if (!popover) return;
  const explain = copilot.cellExplanations && copilot.cellExplanations.variance;
  if (!explain) return;

  view.querySelectorAll("[data-variance-cell]").forEach(cell => {
    cell.addEventListener("click", (e) => {
      e.stopPropagation();
      const rect = cell.getBoundingClientRect();
      const bodyRect = view.getBoundingClientRect();
      popover.innerHTML = `
        <div class="cp-head">${iconSvg("ai", 12)} AI Explain</div>
        <div class="cp-body">${explain}</div>
        <div class="cp-foot">
          <span class="text-xs text-muted">Value: <b>${cell.textContent}</b></span>
          <button class="btn btn-ghost btn-sm" data-cp-close>Close</button>
        </div>
      `;
      popover.style.top = `${rect.bottom - bodyRect.top + 6}px`;
      popover.style.left = `${Math.max(8, rect.left - bodyRect.left - 120)}px`;
      popover.hidden = false;
      popover.querySelector("[data-cp-close]").addEventListener("click", () => { popover.hidden = true; });
    });
  });
  document.addEventListener("click", (e) => {
    if (popover && !popover.hidden && !popover.contains(e.target) && !e.target.closest("[data-variance-cell]")) {
      popover.hidden = true;
    }
  }, { signal });
}

/* ---------------- Sheet co-pilot: column header AI menu ---------------- */
function wireColumnAI(view, s, copilot, signal) {
  const menu = view.querySelector("#col-ai-menu");
  if (!menu) return;

  view.querySelectorAll(".col-ai-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.getAttribute("data-col-ai"), 10);
      const name = s.columns[idx];
      const insight = copilot.columnInsights && copilot.columnInsights[name];
      if (!insight) return;
      const [primary, detail] = insight;

      const rect = btn.getBoundingClientRect();
      const bodyRect = view.getBoundingClientRect();
      menu.innerHTML = `
        <div class="cam-head">${iconSvg("ai", 12)} Column · <b>${name}</b></div>
        <div class="cam-item" data-cam-action="primary">${primary}</div>
        <div class="cam-item" data-cam-action="anomaly">Detect anomalies</div>
        <div class="cam-item" data-cam-action="categorize">Categorize values</div>
      `;
      menu.style.top = `${rect.bottom - bodyRect.top + 4}px`;
      menu.style.left = `${Math.max(8, rect.left - bodyRect.left - 40)}px`;
      menu.hidden = false;

      menu.querySelectorAll(".cam-item").forEach(item => {
        item.addEventListener("click", () => {
          const action = item.getAttribute("data-cam-action");
          menu.hidden = true;
          if (action === "primary") showToast(`${name}: ${detail}`);
          if (action === "anomaly") showToast(`${name}: anomaly scan complete — 0 outliers.`);
          if (action === "categorize") showToast(`${name}: categorized into ${name === "Category" ? "3 groups (Ops, Software, People)" : "buckets (low / mid / high)"}.`);
        });
      });
    });
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !e.target.closest(".col-ai-btn")) {
      menu.hidden = true;
    }
  }, { signal });
}

/* ---------------- Sheet co-pilot: inline bar chart ---------------- */
function toggleSheetChart(view, s, varianceIdx) {
  const chart = view.querySelector("#sheet-chart");
  if (!chart) return;
  if (!chart.hidden) { chart.hidden = true; chart.innerHTML = ""; return; }

  const values = s.rows.map(r => {
    const raw = r[varianceIdx];
    const num = parseFloat(String(raw).replace(/[^-\d.]/g, ""));
    return { label: r[0], raw, num: isNaN(num) ? 0 : num };
  });
  const maxAbs = Math.max(...values.map(v => Math.abs(v.num))) || 1;

  const bars = values.map(v => {
    const pct = Math.abs(v.num) / maxAbs * 100;
    const sign = v.num >= 0 ? "pos" : "neg";
    return `
      <div class="scb-row">
        <div class="scb-label">${v.label}</div>
        <div class="scb-track">
          <div class="scb-fill ${sign}" style="width:${pct}%"></div>
        </div>
        <div class="scb-val ${sign}">${v.raw}</div>
      </div>
    `;
  }).join("");

  chart.innerHTML = `
    <div class="sc-head">
      <div class="sc-title">${iconSvg("ai", 12)} Variance by category</div>
      <button class="btn btn-ghost btn-sm" data-sc-close>Hide</button>
    </div>
    <div class="sc-body">${bars}</div>
  `;
  chart.hidden = false;
  chart.querySelector("[data-sc-close]").addEventListener("click", () => {
    chart.hidden = true;
    chart.innerHTML = "";
  });
}
