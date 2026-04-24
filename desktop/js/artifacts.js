// Document Artifact Workspace (center panel)
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { openModal, closeModal } from "./modals.js";
import { showToast, fadeSwap } from "./transitions.js";

// Scopes the document-level mousedown listener added by wireSelectionToolbar
// so re-renders of the artifact workspace do not leak handlers against
// detached DOM.
let docAbort = null;

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

  const body = a.sections.map((s, i) => {
    const ghost = D.docGhostCompletions ? D.docGhostCompletions[s.heading] : null;
    const ghostHTML = ghost
      ? `<div class="ghost-autocomplete" data-ghost-section="${i}" tabindex="0">
           <span class="ghost-text">${ghost}</span>
           <span class="ghost-hint">(Tab to accept)</span>
         </div>`
      : "";
    return `
      <section class="sec" id="sec-${i}" data-section-idx="${i}" data-heading="${s.heading.replace(/"/g, '&quot;')}" tabindex="0">
        <div class="sec-head">
          <h2>${s.heading}</h2>
          <button class="sec-chat-btn" data-section-chat-open="${i}" title="Ask AI to edit this section">${iconSvg("ai", 12)} Edit with AI</button>
        </div>
        <p class="sec-body" data-selectable>${s.body.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')}</p>
        ${ghostHTML}
        <div class="sec-chat" id="sec-chat-${i}" hidden></div>
      </section>
    `;
  }).join("");

  const deckCta = a.type === "deck"
    ? `<button class="btn btn-ai btn-sm" id="art-open-slides">${iconSvg("ai", 12)} Open in Slide Workspace</button>`
    : "";

  container.innerHTML = `
    <div class="channel-header">
      <button class="icon-btn" data-artifact-back>${iconSvg("back", 16)}</button>
      <div>
        <div class="ch-title">${a.title}</div>
        <div class="ch-desc">${a.template} · ${a.version}</div>
      </div>
      <span class="spacer"></span>
      <span class="tag">${a.status}</span>
      <span class="badge-ai co-pilot-badge">${iconSvg("ai", 12)} Co-pilot active</span>
      ${deckCta}
      <button class="btn btn-secondary btn-sm" id="art-share">Share</button>
      <button class="btn btn-primary btn-sm" id="art-publish">Publish</button>
    </div>

    <div class="doc-wrap">
      <div class="doc-outline">
        <h4>Outline</h4>
        ${outline}
      </div>
      <div class="doc-main" id="doc-main">
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
        <h4 class="mt-4">Ask AI about this document</h4>
        <div class="doc-chat">
          <input type="text" id="doc-chat-input" placeholder="Ask AI about this document..." />
          <button class="btn btn-ai btn-sm" id="doc-chat-send">${iconSvg("ai", 12)} Ask</button>
          <div class="doc-chat-hints">
            <span class="doc-chat-hint" data-doc-chat-hint="Make the tone more authoritative">Make tone more authoritative</span>
            <span class="doc-chat-hint" data-doc-chat-hint="Make the whole document shorter">Shorten</span>
            <span class="doc-chat-hint" data-doc-chat-hint="Flag risks in the requirements">Flag risks</span>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-selection-toolbar" id="ai-selection-toolbar" hidden>
      <button data-copilot-action="rewrite"   title="Rewrite selection">${iconSvg("ai", 12)} Rewrite</button>
      <button data-copilot-action="shorten"   title="Shorten selection">${iconSvg("ai", 12)} Shorten</button>
      <button data-copilot-action="expand"    title="Expand selection">${iconSvg("ai", 12)} Expand</button>
      <button data-copilot-action="tone"      title="Change tone">${iconSvg("ai", 12)} Tone</button>
      <button data-copilot-action="translate" title="Translate">${iconSvg("ai", 12)} Translate</button>
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

  const openSlidesBtn = document.getElementById("art-open-slides");
  if (openSlidesBtn) openSlidesBtn.addEventListener("click", () => {
    window.app.navigateTo("slide-workspace", { artifactId: a.id });
  });

  // Tear down document-level listeners from the previous render so they do
  // not accumulate across artifact switches / panel re-opens.
  if (docAbort) docAbort.abort();
  docAbort = new AbortController();

  wireSelectionToolbar(container, docAbort.signal);
  wireGhostAutocomplete(container);
  wireDocChat(container);
}

/* ---------------- Co-pilot: inline selection toolbar ---------------- */
function wireSelectionToolbar(container, signal) {
  const toolbar = container.querySelector("#ai-selection-toolbar");
  const main = container.querySelector("#doc-main");
  if (!toolbar || !main) return;

  let activeSection = null;

  function hide() {
    toolbar.hidden = true;
    activeSection = null;
  }

  function showAt(rect, section) {
    activeSection = section;
    toolbar.hidden = false;
    const mainRect = main.getBoundingClientRect();
    const top = Math.max(8, rect.top - mainRect.top - 44);
    const left = Math.max(8, rect.left - mainRect.left + (rect.width / 2) - (toolbar.offsetWidth / 2));
    toolbar.style.top = `${top}px`;
    toolbar.style.left = `${left}px`;
  }

  main.addEventListener("mouseup", () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { hide(); return; }
    const text = sel.toString().trim();
    if (!text) { hide(); return; }
    const anchor = sel.anchorNode;
    const secBody = anchor && (anchor.nodeType === 3 ? anchor.parentElement : anchor).closest(".sec-body");
    if (!secBody) { hide(); return; }
    const section = secBody.closest(".sec");
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    showAt(rect, section);
  });

  main.addEventListener("scroll", hide);
  document.addEventListener("mousedown", (e) => {
    if (!toolbar.contains(e.target)) {
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) hide();
      }, 0);
    }
  }, { signal });

  toolbar.querySelectorAll("button[data-copilot-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.getAttribute("data-copilot-action");
      if (!activeSection) return;
      applyCopilotAction(activeSection, action);
      hide();
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    });
  });
}

function applyCopilotAction(section, action) {
  const bodyEl = section.querySelector(".sec-body");
  if (!bodyEl) return;
  const heading = section.getAttribute("data-heading") || "";
  const variants = D.docCopilotSuggestions && D.docCopilotSuggestions[heading];
  const replacement = variants && variants[action];
  if (!replacement) {
    showToast(`No pre-scripted ${action} for "${heading}" — demo fallback.`);
    return;
  }
  bodyEl.classList.add("copilot-pulse");
  fadeSwap(bodyEl, () => {
    bodyEl.innerHTML = replacement.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>');
  });
  setTimeout(() => bodyEl.classList.remove("copilot-pulse"), 800);
  showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} applied.`);
}

/* ---------------- Co-pilot: ghost autocomplete ---------------- */
function wireGhostAutocomplete(container) {
  container.querySelectorAll(".ghost-autocomplete").forEach(g => {
    g.addEventListener("click", () => acceptGhost(g));
    g.addEventListener("keydown", (e) => {
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        acceptGhost(g);
      }
    });
  });
  container.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusedSec = container.querySelector(".sec.focused");
    if (!focusedSec) return;
    const ghost = focusedSec.querySelector(".ghost-autocomplete:not(.accepted)");
    if (!ghost) return;
    e.preventDefault();
    acceptGhost(ghost);
  });
}

function acceptGhost(ghost) {
  if (ghost.classList.contains("accepted")) return;
  const text = ghost.querySelector(".ghost-text").textContent;
  const sec = ghost.closest(".sec");
  const bodyEl = sec && sec.querySelector(".sec-body");
  if (!bodyEl) return;
  fadeSwap(ghost, () => {
    ghost.classList.add("accepted");
    ghost.innerHTML = "";
  });
  setTimeout(() => {
    bodyEl.innerHTML = bodyEl.innerHTML.replace(/\s*$/, "") + " " + text;
    showToast("Ghost completion accepted.");
  }, 160);
}

/* ---------------- Co-pilot: doc-level chat ---------------- */
function wireDocChat(container) {
  const input = container.querySelector("#doc-chat-input");
  const send = container.querySelector("#doc-chat-send");
  if (!input || !send) return;

  function submit() {
    const q = input.value.trim();
    if (!q) return;
    input.value = "";
    const match = (D.docCopilotChatResponses || []).find(r => r.match.test(q));
    const response = match ? match.response : "Applied — review your draft for AI changes.";
    showToast(response);
  }

  send.addEventListener("click", submit);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  container.querySelectorAll("[data-doc-chat-hint]").forEach(hint => {
    hint.addEventListener("click", () => {
      input.value = hint.getAttribute("data-doc-chat-hint");
      submit();
    });
  });
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
