// Action launcher, brief builder, AI processing steps, AI output review.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { openModal, closeModal } from "./modals.js";
import { delay, showToast } from "./transitions.js";

/* ---------------- Action Launcher modal ---------------- */
export function openActionLauncher() {
  const body = document.getElementById("action-launcher-body");
  body.innerHTML = `
    <div class="launcher-top">
      <div class="launcher-search">
        ${iconSvg("search", 14)}
        <input placeholder="Search actions — e.g. 'draft PRD', 'summarize thread'"/>
      </div>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
    </div>
    <div class="action-groups">
      ${D.actionGroups.map(g => `
        <div class="action-group">
          <h4>${g.group}</h4>
          <div class="action-tiles">
            ${g.actions.map(a => `
              <div class="action-tile" data-action="${a.id}" data-recipe="${a.recipeId || ""}">
                <div class="at-icon">${a.label[0]}</div>
                <div class="at-label">${a.label}</div>
                <div class="text-xs text-muted">${g.group}</div>
              </div>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;
  openModal("action-launcher");
  wireLauncherEvents();
}

function wireLauncherEvents() {
  document.querySelectorAll("#action-launcher-body .action-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const id = tile.getAttribute("data-action");
      const recipe = tile.getAttribute("data-recipe");
      closeModal("action-launcher");
      // Route by action id to the right right-panel view
      if (id === "collect-form" || id === "collect-intake" || id === "collect-feedback") {
        window.app.openRightView("form");
      } else if (id === "track-base" || id === "track-risk") {
        window.app.openRightView("base");
      } else if (id === "track-sheet" || id === "track-budget") {
        window.app.openRightView("sheet");
      } else if (id === "plan-tasks") {
        window.app.openRightView("task-panel");
      } else if (id.startsWith("approve-")) {
        window.app.openRightView("approval-form");
      } else if (id === "analyze-summary") {
        window.app.openRightView("summary");
      } else {
        window.app.openRightView("brief", { recipeId: recipe || "r-draft-prd" });
      }
    });
  });
}

/* ---------------- Brief builder (right panel) ---------------- */
export function renderBrief(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const recipe = D.recipes.find(r => r.id === params.recipeId) || D.recipes[2];
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">${recipe.display}</div>
        <div class="sub">Guided intake · Brief builder</div>
      </div>
      <span class="spacer"></span>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="brief-field">
        <label>Goal</label>
        <textarea>Ship PRD v1 for Vendor Portal v2 with scope, metrics, and open questions.</textarea>
      </div>
      <div class="brief-field">
        <label>Audience</label>
        <div class="chips">
          <span class="chip selected">Engineering</span>
          <span class="chip selected">Leadership</span>
          <span class="chip">Customer-facing</span>
        </div>
      </div>
      <div class="brief-field">
        <label>Sources</label>
        <div class="source-pills">
          <span class="source-pill"><span class="check">✓</span> Current thread</span>
          <span class="source-pill"><span class="check">✓</span> research/competitor-scan.pdf</span>
          <span class="source-pill"><span class="check">✓</span> #specs</span>
        </div>
      </div>
      <div class="brief-field">
        <label>Template</label>
        <select>
          <option>Standard PRD</option>
          <option>Light PRD</option>
          <option>Technical PRD</option>
        </select>
      </div>
      <div class="brief-field">
        <label>Tone</label>
        <div class="chips">
          <span class="chip selected">Neutral</span>
          <span class="chip">Authoritative</span>
          <span class="chip">Narrative</span>
        </div>
      </div>
      <div class="brief-field">
        <label>Missing information</label>
        <div class="text-sm text-muted">AI flagged: SSO provider list, tenant-level data residency, scoring model ownership.</div>
      </div>
      <div class="divider"></div>
      <div class="output-sec">
        <div class="oh">
          <h4>Source / Privacy review</h4>
          <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
        </div>
        <div class="source-list">
          <a><span>Current thread</span><span class="kind">✓ approved</span></a>
          <a><span>research/competitor-scan.pdf</span><span class="kind">✓ approved</span></a>
          <a><span>#specs</span><span class="kind">✓ approved</span></a>
        </div>
        <div class="compute-card">
          <h5>Compute mode: on-device</h5>
          <p>0 bytes leave the workspace. Model: kchat-lite-7b. Egress summary: none.</p>
        </div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" data-close-right>Cancel</button>
      <button class="btn btn-primary" id="brief-generate">${iconSvg("ai", 14)} Generate Draft</button>
    </div>
  `;

  view.querySelectorAll(".chip").forEach(c => {
    c.addEventListener("click", () => c.classList.toggle("selected"));
  });
  document.getElementById("brief-generate").addEventListener("click", () => {
    window.app.openRightView("processing");
  });
}

/* ---------------- AI Processing animation ---------------- */
export async function renderProcessing(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const steps = [
    { label: "Reading sources", state: "Scanning thread + attached files" },
    { label: "Planning outline", state: "Structuring sections" },
    { label: "Drafting sections", state: "Composing content + citations" },
    { label: "Ready for review",  state: "Validating with source pins" },
  ];
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Generating draft</div>
        <div class="sub">PRD · Standard template</div>
      </div>
      <span class="spacer"></span>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
    </div>
    <div class="rp-body">
      <div class="ai-inline-hint">${iconSvg("ai", 14)} Running on-device. No data leaves your workspace.</div>
      <div class="ai-steps" id="ai-steps">
        ${steps.map((s, i) => `
          <div class="ai-step" data-step="${i}">
            <div class="idx">${i+1}</div>
            <div>
              <div class="label">${s.label}</div>
              <div class="state">${s.state}</div>
            </div>
            <div class="spinner"></div>
          </div>
        `).join("")}
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" data-close-right>Cancel</button>
      <button class="btn btn-primary" id="skip-review" disabled>Open Review</button>
    </div>
  `;

  const stepEls = Array.from(document.querySelectorAll("#ai-steps .ai-step"));
  for (let i = 0; i < stepEls.length; i++) {
    stepEls[i].classList.add("active");
    await delay(700);
    stepEls[i].classList.remove("active");
    stepEls[i].classList.add("done");
    stepEls[i].querySelector(".idx").textContent = "✓";
  }
  await delay(200);
  if (window.app.state.rightView === "processing") {
    window.app.openRightView("output-review", { artifactId: "a-prd-vendor-portal" });
  }
}

/* ---------------- AI Output Review ---------------- */
export function renderOutputReview(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const artifactId = params.artifactId || "a-prd-vendor-portal";
  const a = D.artifactById(artifactId);
  if (!a) return;
  const sections = a.sections.map((s, i) => `
    <div class="output-sec">
      <div class="oh">
        <h4>${s.heading}</h4>
        <span class="confidence ${s.confidence === "review" ? "review" : "high"}">${s.confidence === "review" ? "Review recommended" : "High confidence"}</span>
      </div>
      <p>${s.body.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')}</p>
    </div>
  `).join("");
  const sources = a.sources.map((s, i) => `<a><span>[${i+1}] ${s.name}</span><span class="kind">${s.kind}</span></a>`).join("");

  view.innerHTML = `
    <div class="rp-head">
      <button class="icon-btn" data-back-view="brief">${iconSvg("back", 14)}</button>
      <div>
        <div class="title">${a.title}</div>
        <div class="sub">${a.template} · ${a.version}</div>
      </div>
      <span class="spacer"></span>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="row gap-2" style="flex-wrap:wrap">
        <span class="tag">${a.type === "deck" ? "Deck" : "Doc"}</span>
        <span class="tag">${a.version}</span>
        <span class="tag">${a.status}</span>
      </div>
      <div class="divider"></div>
      ${sections}
      <div class="output-sec">
        <h4>Sources</h4>
        <div class="source-list">${sources}</div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" id="discard-draft">Discard</button>
      <button class="btn btn-secondary" id="publish-draft">Publish to Channel</button>
      <button class="btn btn-primary" id="edit-in-ws">Edit in Workspace</button>
    </div>
  `;
  view.querySelector("[data-back-view]").addEventListener("click", () => {
    window.app.openRightView("brief");
  });
  document.getElementById("edit-in-ws").addEventListener("click", () => {
    window.app.navigateTo("artifact-workspace", { artifactId });
  });
  document.getElementById("publish-draft").addEventListener("click", () => openModal("publish-confirm"));
  document.getElementById("discard-draft").addEventListener("click", () => {
    showToast("Draft discarded.");
    window.app.closeRightView();
  });
}

/* ---------------- Summary right-panel (simple) ---------------- */
export function renderSummary(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Thread summary</div>
        <div class="sub">${D.aiOutputs.threadSummary.length} key points</div>
      </div>
      <span class="spacer"></span>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="ai-inline-hint">${iconSvg("ai", 14)} Summarized with sources pinned. Citations open source view.</div>
      <div class="output-sec">
        <h4>Key points</h4>
        <ul style="padding-left:18px; margin:6px 0">
          ${D.aiOutputs.threadSummary.map((p, i) => `<li>${p} <span class="cite">[${i+1}]</span></li>`).join("")}
        </ul>
      </div>
      <div class="output-sec">
        <h4>Sources</h4>
        <div class="source-list">
          <a><span>[1] Thread: vendor review</span><span class="kind">thread</span></a>
          <a><span>[2] vendor-contracts-q2.zip</span><span class="kind">file</span></a>
          <a><span>[3] #vendor-management</span><span class="kind">channel</span></a>
        </div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" data-close-right>Close</button>
      <button class="btn btn-primary">Post to channel</button>
    </div>
  `;
}
