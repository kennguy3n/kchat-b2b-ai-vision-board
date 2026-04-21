// Document Artifact Workspace (center panel)
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { openModal, closeModal } from "./modals.js";
import { showToast } from "./transitions.js";

// Pre-scripted section edits keyed by heading (demo-only)
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

export function renderArtifactWorkspace(artifactId) {
  const a = D.artifactById(artifactId) || D.artifactById("a-prd-vendor-portal");
  const container = document.getElementById("screen-artifact-workspace");

  const outline = a.sections.map((s, i) => `
    <div class="outline-item ${i === 0 ? "active" : ""}" data-scroll-to="sec-${i}">${s.heading}</div>
  `).join("") + `<div class="outline-add" data-outline-add>+ Add section</div>`;

  const body = a.sections.map((s, i) => `
    <section class="sec" id="sec-${i}" data-section-idx="${i}" data-heading="${s.heading.replace(/"/g, '&quot;')}" tabindex="0">
      <div class="sec-head">
        <h2>${s.heading}</h2>
        <button class="sec-chat-btn" data-section-chat-open="${i}" title="Ask AI to edit this section">${iconSvg("ai", 12)} Edit with AI</button>
      </div>
      <p class="sec-body">${s.body.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')}</p>
      <div class="sec-chat" id="sec-chat-${i}" hidden></div>
    </section>
  `).join("");

  container.innerHTML = `
    <div class="channel-header">
      <button class="icon-btn" data-artifact-back>${iconSvg("back", 16)}</button>
      <div>
        <div class="ch-title">${a.title}</div>
        <div class="ch-desc">${a.template} · ${a.version}</div>
      </div>
      <span class="spacer"></span>
      <span class="tag">${a.status}</span>
      <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      <button class="btn btn-secondary btn-sm" id="art-share">Share</button>
      <button class="btn btn-primary btn-sm" id="art-publish">Publish</button>
    </div>

    <div class="doc-wrap">
      <div class="doc-outline">
        <h4>Outline</h4>
        ${outline}
      </div>
      <div class="doc-main">
        <div class="doc-paper">
          <h1>${a.title}</h1>
          <div class="text-muted text-sm">${a.template} · ${a.version} · Last edited just now</div>
          <div class="divider"></div>
          ${body}
        </div>
      </div>
      <div class="doc-aside">
        <h4>Version history</h4>
        <div class="aside-item">
          <div class="avatar sm" style="background:#6366f1">AI</div>
          <div>
            <div class="b">Draft v1</div>
            <div class="text-xs text-muted">Generated just now</div>
          </div>
        </div>
        <h4 class="mt-4">Sources</h4>
        ${a.sources.map(s => `<div class="aside-item"><span style="flex:1">${s.name}</span><span class="text-xs text-muted">${s.kind}</span></div>`).join("")}
        <h4 class="mt-4">Template</h4>
        <div class="aside-item">${a.template}</div>
        <h4 class="mt-4">Compute</h4>
        <div class="aside-item ai-bg" style="background:var(--ai-50); color:var(--ai-strong)">On-device · 0 egress</div>
      </div>
    </div>
  `;

  container.querySelector("[data-artifact-back]").addEventListener("click", () => {
    window.app.navigateTo("channel-chat", { channelId: window.app.state.channelId || "c-specs" });
  });
  container.querySelectorAll(".outline-item").forEach(item => {
    item.addEventListener("click", () => {
      container.querySelectorAll(".outline-item").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const id = item.getAttribute("data-scroll-to");
      const tgt = container.querySelector("#" + id);
      if (tgt) tgt.scrollIntoView({ behavior: "smooth", block: "start" });
      const sec = container.querySelector("#" + id);
      if (sec) {
        container.querySelectorAll(".sec").forEach(s => s.classList.remove("focused"));
        sec.classList.add("focused");
      }
    });
  });
  container.querySelectorAll(".sec").forEach(sec => {
    sec.addEventListener("click", () => {
      container.querySelectorAll(".sec").forEach(s => s.classList.remove("focused"));
      sec.classList.add("focused");
    });
  });

  container.querySelectorAll("[data-section-chat-open]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const idx = btn.getAttribute("data-section-chat-open");
      openSectionChat(container, idx);
    });
  });

  const addBtn = container.querySelector("[data-outline-add]");
  if (addBtn) addBtn.addEventListener("click", () => showToast("Section drafted — review in editor."));

  document.getElementById("art-publish").addEventListener("click", () => openModal("publish-confirm"));
  document.getElementById("art-share").addEventListener("click", () => showToast("Share link copied."));
}

function openSectionChat(container, idx) {
  const host = container.querySelector(`#sec-chat-${idx}`);
  const sec = container.querySelector(`#sec-${idx}`);
  if (!host || !sec) return;
  host.hidden = false;
  host.innerHTML = `
    <div class="sec-chat-input">
      <input type="text" placeholder="Tell the AI what to change..." data-section-chat-prompt="${idx}" />
      <button class="btn btn-primary btn-sm" data-section-chat-submit="${idx}">Apply</button>
      <button class="btn btn-ghost btn-sm" data-section-chat-cancel="${idx}">Cancel</button>
    </div>
  `;
  const input = host.querySelector("input");
  if (input) input.focus();
  const cancel = host.querySelector(`[data-section-chat-cancel="${idx}"]`);
  if (cancel) cancel.addEventListener("click", () => { host.hidden = true; host.innerHTML = ""; });
  const submit = host.querySelector(`[data-section-chat-submit="${idx}"]`);
  if (submit) submit.addEventListener("click", () => runSectionChat(container, idx));
  if (input) input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSectionChat(container, idx);
  });
}

function runSectionChat(container, idx) {
  const host = container.querySelector(`#sec-chat-${idx}`);
  const sec  = container.querySelector(`#sec-${idx}`);
  const bodyEl = sec ? sec.querySelector(".sec-body") : null;
  if (!host || !sec || !bodyEl) return;
  const promptInput = host.querySelector(`[data-section-chat-prompt="${idx}"]`);
  const prompt = (promptInput && promptInput.value) || "Tighten this section.";
  const heading = sec.getAttribute("data-heading") || "";
  const before = bodyEl.innerHTML;
  const edit = sectionEditsByHeading[heading];
  const after = (edit && edit.after) || before;

  host.innerHTML = `
    <div class="sec-chat-turn ai-turn">
      ${iconSvg("ai", 12)} <span>Rewriting with: <em>“${prompt.replace(/</g, "&lt;")}”</em></span>
    </div>
  `;

  setTimeout(() => {
    bodyEl.innerHTML = after.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>');
    host.innerHTML = `
      <div class="sec-chat-turn ai-turn">${iconSvg("ai", 12)} Section updated.</div>
      <div class="sec-chat-actions">
        <button class="btn btn-ghost btn-sm" data-section-chat-undo>Undo</button>
        <button class="btn btn-primary btn-sm" data-section-chat-accept>Accept</button>
      </div>
    `;
    const undo = host.querySelector("[data-section-chat-undo]");
    if (undo) undo.addEventListener("click", () => {
      bodyEl.innerHTML = before;
      host.hidden = true;
      host.innerHTML = "";
      showToast("Change reverted.");
    });
    const accept = host.querySelector("[data-section-chat-accept]");
    if (accept) accept.addEventListener("click", () => {
      host.hidden = true;
      host.innerHTML = "";
      showToast("Section accepted.");
    });
  }, 1500);
}
