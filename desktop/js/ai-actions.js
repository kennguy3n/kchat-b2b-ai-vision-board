// Action launcher, brief builder, AI processing steps, AI output review.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { openModal, closeModal } from "./modals.js";
import { delay, showToast } from "./transitions.js";

/* ---------------- Action Launcher modal ---------------- */

// Small catalog of contextual suggestions per channel. Keeps the action
// launcher approachable for non-technical SME users — the most-relevant
// actions surface without forcing them to scan every group.
const CHANNEL_SUGGESTIONS = {
  "c-vendor": [
    // Cross-service AI: email summary + calendar scheduling + drive attach.
    { id: "integration-summarize-email", label: "Summarize Orbix email", sub: "AI recap of latest remediation thread" },
    { id: "integration-schedule-review", label: "Schedule vendor review",  sub: "AI finds a slot across attendees" },
    { id: "integration-attach-risk",     label: "Attach risk matrix",      sub: "Pull Risk-Scoring-Matrix from Drive" },
    { id: "plan-tasks",    label: "Extract Tasks",    sub: "Pull action items out of this thread" },
    { id: "approve-new",   label: "Create Approval",  sub: "Prefill from the conversation" },
    { id: "copilot-sheet", label: "Analyze Budget",   sub: "Open budget sheet with AI formula bar" },
  ],
  "c-specs": [
    { id: "create-prd", label: "Draft PRD", recipeId: "r-draft-prd", templateId: "tpl-prd", sub: "Standard product requirements doc" },
    { id: "copilot-doc", label: "Write with AI", sub: "Open editor with inline AI assist" },
    { id: "plan-tasks", label: "Extract Tasks", sub: "Turn discussion into assignments" },
  ],
  "c-deals": [
    { id: "integration-qbr-from-crm",     label: "Prepare QBR from CRM",     sub: "AI pulls Globex pipeline data" },
    { id: "integration-followup-globex",  label: "Follow-up email to Globex", sub: "AI-drafted email with context" },
    { id: "create-qbr",       label: "Create QBR",    recipeId: "r-create-qbr", templateId: "tpl-qbr", sub: "Quarterly business review deck" },
    { id: "copilot-slides",   label: "Design slides", sub: "Open slide workspace with per-slide AI" },
    { id: "analyze-summary",  label: "Summarize",     sub: "Pipeline + risk highlights" },
  ],
};
const DEFAULT_SUGGESTIONS = [
  { id: "analyze-summary", label: "Summarize Thread", sub: "Key points with sources" },
  { id: "plan-tasks", label: "Extract Tasks", sub: "Turn messages into action items" },
  { id: "create-prd", label: "Draft Doc", recipeId: "r-draft-prd", templateId: "tpl-prd", sub: "Kick off a structured draft" },
];
const RECENTLY_USED = [
  { id: "analyze-summary", label: "Summarize" },
  { id: "plan-tasks", label: "Extract Tasks" },
  { id: "copilot-doc", label: "Write with AI" },
];
// Mode → small badge rendered on a launcher tile. Keeps the Employee vs.
// Co-pilot distinction available at a glance without making it the top-level
// organizing principle (intents are).
const MODE_BADGES = {
  auto:   { label: "Auto",   tip: "AI Employee: autonomous, queued, governed." },
  inline: { label: "Inline", tip: "AI Co-pilot: inline, real-time — you drive." },
};

export function openActionLauncher(params = {}) {
  const body = document.getElementById("action-launcher-body");
  const channelId = window.app?.state?.channelId || null;
  const focusIntent = params.intent || null;
  const suggestions = CHANNEL_SUGGESTIONS[channelId] || DEFAULT_SUGGESTIONS;

  const suggestHTML = suggestions.map(a => `
    <div class="action-tile suggest" data-action="${a.id}" data-recipe="${a.recipeId || ""}" data-template="${a.templateId || ""}">
      <div class="at-icon">${iconSvg("ai", 16)}</div>
      <div class="at-label">${a.label}</div>
      <div class="text-xs text-muted">${a.sub}</div>
    </div>
  `).join("");

  const recentHTML = RECENTLY_USED.map(a => `
    <div class="action-chip" data-action="${a.id}" data-recipe="" data-template="">${a.label}</div>
  `).join("");

  const tileHTML = (a, intentLabel) => {
    const badge = a.mode && MODE_BADGES[a.mode]
      ? `<span class="mode-badge mode-${a.mode}" title="${MODE_BADGES[a.mode].tip}">${MODE_BADGES[a.mode].label}</span>`
      : "";
    return `
      <div class="action-tile" data-action="${a.id}" data-recipe="${a.recipeId || ""}" data-template="${a.templateId || ""}">
        <div class="at-icon">${a.icon || a.label[0]}</div>
        <div class="at-label">${a.label}${badge}</div>
        <div class="text-xs text-muted">${a.sub || intentLabel}</div>
      </div>
    `;
  };

  const intentTabsHTML = D.coreIntents.map(i =>
    `<button class="intent-tab${focusIntent === i.id ? " active" : ""}" type="button" data-intent-tab="${i.id}">${iconSvg(i.icon, 12)} ${i.label}</button>`,
  ).join("");

  const intentGroupsHTML = D.coreIntents.map(i => `
    <div class="action-group intent-group${focusIntent && focusIntent !== i.id ? " dim" : ""}" data-intent="${i.id}">
      <h4>${iconSvg(i.icon, 14)} ${i.label} <span class="group-sub">${i.sub}</span></h4>
      <div class="action-tiles">
        ${i.actions.map(a => tileHTML(a, i.label)).join("")}
        ${i.id === "create" ? `
          <div class="action-tile browse-all" data-action="browse-templates">
            <div class="at-icon">⊞</div>
            <div class="at-label">Browse all templates</div>
            <div class="text-xs text-muted">Gallery view</div>
          </div>
        ` : ""}
      </div>
    </div>
  `).join("");

  body.innerHTML = `
    <div class="launcher-top">
      <div class="launcher-search">
        ${iconSvg("search", 14)}
        <input placeholder="What do you need to create, analyze, plan, or approve?"/>
      </div>
      <div class="launcher-tagline text-xs text-muted">
        Pick what you want to do — AI decides whether an Employee runs it or a Co-pilot assists inline.
      </div>
    </div>

    <div class="action-group suggest-group">
      <h4>Recommended in this channel</h4>
      <div class="action-tiles suggest-tiles">${suggestHTML}</div>
    </div>

    <div class="action-recent">
      <span class="ar-label">Recently used</span>
      ${recentHTML}
    </div>

    <div class="divider"></div>
    <div class="action-groups-label">
      Core intents
      <div class="intent-tabs">
        <button class="intent-tab${focusIntent ? "" : " active"}" type="button" data-intent-tab="all">All</button>
        ${intentTabsHTML}
      </div>
    </div>
    <div class="action-groups">
      ${intentGroupsHTML}
    </div>
  `;
  openModal("action-launcher");
  wireLauncherEvents();
  if (focusIntent) {
    const target = body.querySelector(`.intent-group[data-intent="${focusIntent}"]`);
    if (target) target.scrollIntoView({ block: "start", behavior: "smooth" });
  }
}

function wireLauncherEvents() {
  // Intent tab filter — hides non-matching intent groups without rerendering.
  document.querySelectorAll("#action-launcher-body [data-intent-tab]").forEach(tab => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-intent-tab");
      document.querySelectorAll("#action-launcher-body .intent-tab").forEach(t =>
        t.classList.toggle("active", t === tab),
      );
      document.querySelectorAll("#action-launcher-body .intent-group").forEach(g => {
        const intent = g.getAttribute("data-intent");
        g.classList.toggle("dim", target !== "all" && intent !== target);
      });
      if (target !== "all") {
        const focus = document.querySelector(
          `#action-launcher-body .intent-group[data-intent="${target}"]`,
        );
        if (focus) focus.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    });
  });
  document.querySelectorAll("#action-launcher-body .action-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const id = chip.getAttribute("data-action");
      closeModal("action-launcher");
      routeAction(id);
    });
  });
  document.querySelectorAll("#action-launcher-body .action-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const id = tile.getAttribute("data-action");
      const recipe = tile.getAttribute("data-recipe");
      const template = tile.getAttribute("data-template");
      closeModal("action-launcher");
      routeAction(id, { recipe, template });
    });
  });
}

// Single intent → screen router so every entry point (launcher, chips, home
// intent cards, channel suggestions) lands on the same surface per action id.
function routeAction(id, opts = {}) {
  const recipe = opts.recipe || "";
  const template = opts.template || "";
  if (id === "copilot-doc") {
    window.app.navigateTo("artifact-workspace", { artifactId: "a-prd-vendor-portal" });
    return;
  }
  if (id === "copilot-slides") {
    window.app.navigateTo("slide-workspace", { artifactId: "a-qbr-globex" });
    return;
  }
  if (id === "copilot-sheet" || id === "copilot-sheet-analyze") {
    const channelId = window.app.state.channelId || "c-vendor";
    window.app.navigateTo(
      "channel-chat",
      { channelId },
      () => window.app.openRightView("sheet", { focusFormula: true }),
    );
    return;
  }
  if (id === "create-schedule") {
    showToast("Schedule co-pilot coming soon — drafted agenda + invites.");
    return;
  }
  if (id === "browse-templates") {
    window.app.navigateTo("template-gallery");
    return;
  }
  // Integrated workspace (v0.5) — cross-service AI actions route to the
  // matching right-panel view (or a toast when the action is demo-only).
  if (id === "integration-summarize-email" || id === "create-email") {
    window.app.openRightView("email");
    return;
  }
  if (id === "integration-schedule-review" || id === "plan-meeting") {
    window.app.openRightView("calendar");
    showToast("AI scheduling — checking availability across attendees");
    return;
  }
  if (id === "integration-attach-risk") {
    window.app.openRightView("drive");
    showToast("Attached Risk-Scoring-Matrix-v4.xlsx from channel drive");
    return;
  }
  if (id === "integration-qbr-from-crm" || id === "analyze-deal") {
    window.app.openRightView("business");
    return;
  }
  if (id === "integration-followup-globex") {
    window.app.openRightView("email");
    showToast("AI drafted follow-up email — ready for your review");
    return;
  }
  if (id && id.startsWith("create-")) {
    window.app.navigateTo("template-intake", {
      templateId: template || "tpl-prd",
      recipeId: recipe || "r-draft-prd",
    });
    return;
  }
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
          <h5><span class="glossary-tip" data-tip="AI inference happens on your device only — no chat or document data is sent to external servers.">Compute mode: on-device</span></h5>
          <p>0 bytes leave the workspace. Model: kchat-lite-7b. <span class="glossary-tip" data-tip="Egress is data leaving your workspace. Zero egress means nothing is shared externally.">Egress</span> summary: none. <span class="glossary-tip" data-tip="Personally identifiable information (emails, names, IDs) is masked before AI sees it.">PII tokenization</span> enabled.</p>
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
// Generation counter prevents a stale in-flight run from advancing the
// router when the user rapidly leaves and re-enters the processing screen.
let processingGeneration = 0;
export async function renderAIProcessingScreen(params = {}) {
  const container = document.getElementById("screen-ai-processing");
  if (!container) return;
  const gen = ++processingGeneration;
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
    if (gen !== processingGeneration || window.app.state.screen !== "ai-processing") return;
    stepEls[i].classList.add("active");
    await delay(750);
    if (gen !== processingGeneration) return;
    stepEls[i].classList.remove("active");
    stepEls[i].classList.add("done");
    stepEls[i].querySelector(".idx").textContent = "✓";
  }
  await delay(250);
  if (gen === processingGeneration && window.app.state.screen === "ai-processing") {
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
    <section class="or-section" data-sec-idx="${i}" data-sec-heading="${s.heading.replace(/"/g, "&quot;")}">
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
            <div class="or-chat-turn ai-turn">${iconSvg("ai", 14)} Thinking about "<em>${prompt.replace(/</g, "&lt;")}</em>"…</div>
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
