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
              <div class="action-tile" data-action="${a.id}" data-recipe="${a.recipeId || ""}" data-template="${a.templateId || ""}">
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
      const template = tile.getAttribute("data-template");
      closeModal("action-launcher");
      // Create actions (v2) → full-screen template intake (Screen 7)
      if (id && id.startsWith("create-")) {
        window.app.navigateTo("template-intake", {
          templateId: template || "tpl-prd",
          recipeId: recipe || "r-draft-prd",
        });
        return;
      }
      // Route remaining actions to the matching right-panel view
      if (id === "collect-form" || id === "collect-intake" || id === "collect-feedback") {
        window.app.openRightView("form");
      } else if (id === "track-base" || id === "track-risk") {
        window.app.openRightView("base");
      } else if (id === "track-sheet" || id === "track-budget") {
        window.app.openRightView("sheet");
      } else if (id === "plan-tasks") {
        window.app.openRightView("task-panel");
      } else if (id && id.startsWith("approve-")) {
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

/* ---------------- Full-screen AI Processing (Screen 8) ---------------- */
export async function renderAIProcessingScreen(params = {}) {
  const container = document.getElementById("screen-ai-processing");
  if (!container) return;
  const tpl = D.templateById(params.templateId) || D.templateById("tpl-prd");
  const steps = [
    { label: "Reading sources",             state: "Scanning thread + attached files" },
    { label: "Retrieving from knowledge",   state: "Pulling relevant entities from channel knowledge" },
    { label: "Drafting sections",           state: `Composing ${(tpl.outputSections || []).length} sections with citations` },
    { label: "Ready for review",            state: "Validating source pins" },
  ];

  container.innerHTML = `
    <div class="aip-wrap">
      <div class="aip-card">
        <div class="aip-head">
          <div class="aip-title">${iconSvg("ai", 16)} Generating ${tpl.name}</div>
          <span class="badge-ai">${iconSvg("ai", 12)} On-device AI · 0 bytes egress</span>
        </div>
        <div class="ai-inline-hint">${iconSvg("ai", 14)} Running on-device. No data leaves your workspace.</div>
        <div class="ai-steps" id="aip-steps">
          ${steps.map((s, i) => `
            <div class="ai-step" data-step="${i}">
              <div class="idx">${i + 1}</div>
              <div>
                <div class="label">${s.label}</div>
                <div class="state">${s.state}</div>
              </div>
              <div class="spinner"></div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  const stepEls = Array.from(container.querySelectorAll("#aip-steps .ai-step"));
  for (let i = 0; i < stepEls.length; i++) {
    if (window.app.state.screen !== "ai-processing") return;
    stepEls[i].classList.add("active");
    await delay(750);
    stepEls[i].classList.remove("active");
    stepEls[i].classList.add("done");
    stepEls[i].querySelector(".idx").textContent = "✓";
  }
  await delay(250);
  if (window.app.state.screen === "ai-processing") {
    window.app.navigateTo("ai-output-review", {
      templateId: params.templateId,
      recipeId: params.recipeId,
      artifactId: params.artifactId || "a-prd-vendor-portal",
    });
  }
}

/* ---------------- Full-screen AI Output Review (Screen 9) ---------------- */
// Contextual section chat: click [✎] on a section → inline chat input →
// on submit, after 1.5s show a pre-scripted before/after diff with Undo/Accept.
const sectionEditsByHeading = {
  "Overview":            { after: "Vendor Portal v2 centralizes onboarding, risk scoring, and document lifecycle for all strategic vendors. Scope prioritizes real-time risk scoring surfaced to ops owners and self-serve document uploads with expiration tracking. [1][2]" },
  "Problem Statement":   { after: "Current onboarding relies on email threads and shared drives, leading to 6+ business day cycle times and inconsistent risk scoring across ops. Manual re-scoring lags behind renewals by 2–3 weeks. [1]" },
  "Requirements":        { after: "Self-serve onboarding flow; doc vault with expiration tracking; real-time risk scoring with OIDC SSO; admin audit trail with per-action lineage; per-vendor access scope. [2]" },
  "Success Metrics":     { after: "Cycle time < 3 business days (median); risk re-scoring lag < 48h; admin audit coverage 100% of write actions; vendor self-serve completion ≥ 80%. [2]" },
  "Open Questions":      { after: "Which SSO providers are required in v2? What is the data residency tier for vendor uploads? Is risk scoring owned by Compliance or Ops? [3]" },
  "Executive summary":   { after: "Q2 momentum is strong on expansion, offset by two at-risk accounts. Proposed Q3 plan focuses on closing risk and accelerating pipeline coverage. [1][2]" },
  "Wins":                { after: "3 net-new expansions closed; ARR growth of 14% QoQ; 2 reference customers converted from deal thread commitments. [1]" },
  "Risks":               { after: "Globex renewal at risk pending platform-parity review; FleetOne churn probability raised due to executive sponsor change. [2]" },
  "Next quarter":        { after: "Prioritize a parity push for Globex; build a dedicated CSM motion for FleetOne; instrument early-warning signals in deal thread analyzer. [2]" },
};

function renderOutputSectionHTML(s, i) {
  return `
    <section class="or-section" data-sec-idx="${i}" data-sec-heading="${s.heading}">
      <div class="or-sec-head">
        <h2>${s.heading}</h2>
        <span class="confidence ${s.confidence === "review" ? "review" : "high"}">${s.confidence === "review" ? "Review recommended" : "High confidence"}</span>
        <span class="spacer" style="flex:1"></span>
        <button class="icon-btn or-sec-edit" title="Edit with AI" data-sec-idx="${i}">${iconSvg("ai", 14)}</button>
      </div>
      <p class="or-sec-body" data-sec-body>${s.body.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')}</p>
      <div class="or-sec-chat" data-sec-chat style="display:none"></div>
    </section>
  `;
}

function wireSectionChat(container, artifactId) {
  container.querySelectorAll(".or-sec-edit").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-sec-idx");
      const sec = container.querySelector(`.or-section[data-sec-idx="${idx}"]`);
      if (!sec) return;
      const chatHost = sec.querySelector("[data-sec-chat]");
      if (chatHost.style.display !== "none") {
        chatHost.style.display = "none";
        chatHost.innerHTML = "";
        return;
      }
      chatHost.style.display = "block";
      chatHost.innerHTML = `
        <div class="or-chat">
          <div class="or-chat-input">
            ${iconSvg("ai", 14)}
            <input type="text" placeholder="Tell the AI what to change (e.g., 'tighten this, add the OIDC SSO requirement')" data-sec-input/>
            <button class="btn btn-primary btn-sm" data-sec-send>Rewrite</button>
            <button class="btn btn-ghost btn-sm" data-sec-cancel>Cancel</button>
          </div>
        </div>
      `;
      const input = chatHost.querySelector("[data-sec-input]");
      if (input) input.focus();
      chatHost.querySelector("[data-sec-cancel]").addEventListener("click", () => {
        chatHost.style.display = "none";
        chatHost.innerHTML = "";
      });
      chatHost.querySelector("[data-sec-send]").addEventListener("click", async () => {
        const prompt = (input.value || "").trim() || "Tighten and clarify.";
        const heading = sec.getAttribute("data-sec-heading");
        const pre = sectionEditsByHeading[heading];
        const bodyEl = sec.querySelector("[data-sec-body]");
        const before = bodyEl.innerHTML;
        chatHost.innerHTML = `
          <div class="or-chat">
            <div class="or-chat-turn ai-turn">${iconSvg("ai", 14)} Thinking about "<em>${prompt}</em>"…</div>
          </div>
        `;
        await delay(1500);
        const afterText = pre ? pre.after : "Refined per your instruction — shorter, with one added citation. [1]";
        bodyEl.innerHTML = afterText.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>');
        chatHost.innerHTML = `
          <div class="or-chat">
            <div class="or-chat-turn ai-turn">${iconSvg("ai", 14)} Rewritten. Review the diff and accept or undo.</div>
            <div class="or-chat-actions">
              <button class="btn btn-secondary btn-sm" data-sec-undo>Undo</button>
              <button class="btn btn-primary btn-sm" data-sec-accept>Accept</button>
            </div>
          </div>
        `;
        chatHost.querySelector("[data-sec-undo]").addEventListener("click", () => {
          bodyEl.innerHTML = before;
          chatHost.style.display = "none";
          chatHost.innerHTML = "";
          showToast("Change undone.");
        });
        chatHost.querySelector("[data-sec-accept]").addEventListener("click", () => {
          chatHost.style.display = "none";
          chatHost.innerHTML = "";
          showToast("Section updated.");
        });
      });
    });
  });
}

export function renderAIOutputReviewScreen(params = {}) {
  const container = document.getElementById("screen-ai-output-review");
  const artifactId = params.artifactId || "a-prd-vendor-portal";
  const a = D.artifactById(artifactId);
  if (!container || !a) return;

  const sections = a.sections.map(renderOutputSectionHTML).join("");
  const sources = a.sources.map((s, i) =>
    `<span class="src-pill" data-src="${i+1}">[${i+1}] ${s.name} <span class="kind">${s.kind}</span></span>`
  ).join("");

  container.innerHTML = `
    <div class="or-wrap">
      <div class="or-head">
        <div>
          <h1>${a.title}</h1>
          <div class="or-sub">${a.template} · ${a.version} · ${a.status}</div>
        </div>
        <span class="spacer" style="flex:1"></span>
        <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      </div>
      <div class="or-body">${sections}</div>
      <div class="or-sources">
        <h3>Sources</h3>
        <div class="src-pills">${sources}</div>
      </div>
      <div class="or-foot">
        <button class="btn btn-ghost" id="or-discard">Discard</button>
        <button class="btn btn-secondary" id="or-publish">Publish to Channel</button>
        <button class="btn btn-primary" id="or-edit-ws">Edit in Workspace</button>
      </div>
    </div>
  `;

  wireSectionChat(container, artifactId);

  const edit = document.getElementById("or-edit-ws");
  if (edit) edit.addEventListener("click", () => {
    window.app.navigateTo("artifact-workspace", { artifactId });
  });
  const pub = document.getElementById("or-publish");
  if (pub) pub.addEventListener("click", () => openModal("publish-confirm"));
  const disc = document.getElementById("or-discard");
  if (disc) disc.addEventListener("click", () => {
    showToast("Draft discarded.");
    const chId = window.app.state.channelId || "c-specs";
    window.app.navigateTo("channel-chat", { channelId: chId });
  });
}
