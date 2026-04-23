// Slide Workspace (Co-pilot) — renders the QBR deck as individual slides with
// a thumbnail rail, a large slide canvas, and a right panel of per-slide AI
// actions. Pure demo: swaps pre-scripted content on button press, no real AI.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast, fadeSwap } from "./transitions.js";

// Pre-scripted per-slide edits used by the co-pilot right panel actions.
const SLIDE_SIMPLIFIED = {
  "Executive Summary": [
    "18% YoY growth, led by logistics",
    "Two Q3 risks flagged (mitigations in place)",
    "Renewal on track",
  ],
  "Wins": [
    "Renewal locked through FY27",
    "2 new regions live",
    "Reference customer converted",
  ],
  "Risks": [
    "Analytics module slipped 2 weeks",
    "EU FX exposure ~$180k",
    "FleetOne sponsor change",
  ],
  "Next Quarter": [
    "Ship analytics by end of Q3",
    "3-account LATAM pilot",
    "Dedicated CSM for at-risk accounts",
  ],
};

const SLIDE_SPEAKER_NOTES_REGENERATED = {
  "Executive Summary": "Lead with the 18% YoY headline. Globex is our reference account; the growth story sells itself. Pivot quickly to the two risks so leadership sees the full picture. 60 seconds max.",
  "Wins": "Renewal is the top-line win — frame it as a multi-year commitment. Name-check the reference customer (AcmeCo) and connect it back to the deal thread Mika pulled from. Keep under 90 seconds.",
  "Risks": "Be surgical. Analytics delay is 2 weeks — we own it, here is the plan. EU FX exposure is the material risk for leadership to weigh in on. Don't dwell on FleetOne sponsor change — it's a heads-up, not a crisis.",
  "Next Quarter": "End on commitments, not wishes. Analytics ship date is firm. LATAM pilot is stretch — label it as such. Close with the CSM investment as the connective tissue.",
};

const LAYOUT_SUGGESTIONS = {
  "Executive Summary": "two-column",
  "Wins":              "big-number",
  "Risks":             "traffic-light",
  "Next Quarter":      "timeline",
};

export function renderSlideWorkspace(artifactId) {
  const a = D.artifactById(artifactId) || D.artifactById("a-qbr-globex");
  const container = document.getElementById("screen-slide-workspace");
  if (!container) return;

  // Fall back gracefully if the artifact has no slides yet.
  const slides = a.slides && a.slides.length
    ? a.slides
    : a.sections.map(s => ({
        heading: s.heading,
        layout: "title-bullets",
        bullets: s.body.split(/[.;]\s+/).filter(Boolean).slice(0, 4),
        speakerNotes: "",
      }));

  const state = { activeIdx: 0 };

  function thumbHTML(s, i) {
    return `
      <div class="slide-thumb ${i === state.activeIdx ? "active" : ""}" data-slide-idx="${i}">
        <div class="st-num">${i + 1}</div>
        <div class="st-preview">
          <div class="st-title">${s.heading}</div>
          <div class="st-lines">
            ${(s.bullets || []).slice(0, 3).map(() => `<span class="st-line"></span>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function canvasHTML(s) {
    return `
      <div class="slide-canvas-paper" id="slide-canvas-paper">
        <div class="slide-layout-tag">${s.layout || "title-bullets"}</div>
        <h1 class="slide-title" contenteditable="true">${s.heading}</h1>
        <ul class="slide-bullets" id="slide-bullets">
          ${(s.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join("")}
        </ul>
      </div>
      <div class="slide-notes">
        <h4>Speaker notes</h4>
        <div class="slide-notes-body" id="slide-notes-body" contenteditable="true">${s.speakerNotes || "Add speaker notes…"}</div>
      </div>
    `;
  }

  function aiPanelHTML() {
    return `
      <div class="slide-ai-panel">
        <div class="sap-head">
          <span class="badge-ai">${iconSvg("ai", 12)} Co-pilot</span>
          <div class="sap-title">Slide actions</div>
          <div class="sap-sub">Inline AI on the active slide</div>
        </div>
        <div class="sap-group">
          <h5>Edit</h5>
          <button class="sap-btn" data-slide-ai="simplify">${iconSvg("ai", 12)} Simplify slide</button>
          <button class="sap-btn" data-slide-ai="expand-notes">${iconSvg("ai", 12)} Generate speaker notes</button>
        </div>
        <div class="sap-group">
          <h5>Visuals</h5>
          <button class="sap-btn" data-slide-ai="chart">${iconSvg("ai", 12)} Add chart placeholder</button>
          <button class="sap-btn" data-slide-ai="layout">${iconSvg("ai", 12)} Suggest layout</button>
        </div>
        <div class="sap-group">
          <h5>Context</h5>
          <div class="sap-context">
            ${a.sources.map(s => `<div class="sap-ctx-item"><span>${s.name}</span><span class="text-muted">${s.kind}</span></div>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    container.innerHTML = `
      <div class="channel-header">
        <button class="icon-btn" data-slide-back>${iconSvg("back", 16)}</button>
        <div>
          <div class="ch-title">${a.title}</div>
          <div class="ch-desc">${slides.length} slides · ${a.version}</div>
        </div>
        <span class="spacer"></span>
        <span class="tag">${a.status}</span>
        <span class="badge-ai">${iconSvg("ai", 12)} Co-pilot</span>
        <div class="design-ai-wrap">
          <button class="btn btn-secondary btn-sm" id="design-ai-btn">${iconSvg("ai", 14)} Design with AI</button>
          <div class="design-ai-menu" id="design-ai-menu" hidden>
            <div class="dam-item" data-design="theme">Apply consistent theme</div>
            <div class="dam-item" data-design="transitions">Add transitions</div>
            <div class="dam-item" data-design="reorder">Reorder for narrative flow</div>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" id="slide-present">Present</button>
      </div>

      <div class="slide-wrap">
        <aside class="slide-rail" aria-label="Slide thumbnails">
          <div class="sr-head">
            <h4>Slides</h4>
            <button class="btn btn-ghost btn-sm" id="slide-add">+ Slide</button>
          </div>
          <div class="slide-thumbs" id="slide-thumbs">
            ${slides.map(thumbHTML).join("")}
          </div>
        </aside>
        <main class="slide-canvas" id="slide-canvas">
          ${canvasHTML(slides[state.activeIdx])}
        </main>
        <aside class="slide-aside" aria-label="Slide AI actions">
          ${aiPanelHTML()}
        </aside>
      </div>
    `;
    wireEvents();
  }

  function wireEvents() {
    container.querySelector("[data-slide-back]").addEventListener("click", () => {
      window.app.navigateTo("channel-chat", { channelId: window.app.state.channelId || "c-deals" });
    });
    container.querySelectorAll(".slide-thumb").forEach(th => {
      th.addEventListener("click", () => {
        state.activeIdx = parseInt(th.getAttribute("data-slide-idx"), 10);
        render();
      });
    });
    const designBtn = container.querySelector("#design-ai-btn");
    const designMenu = container.querySelector("#design-ai-menu");
    if (designBtn && designMenu) {
      designBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        designMenu.hidden = !designMenu.hidden;
      });
      document.addEventListener("click", () => { designMenu.hidden = true; }, { once: true });
      designMenu.querySelectorAll(".dam-item").forEach(item => {
        item.addEventListener("click", () => {
          const kind = item.getAttribute("data-design");
          designMenu.hidden = true;
          if (kind === "theme")       showToast("Applied consistent theme across all 4 slides.");
          if (kind === "transitions") showToast("Added subtle fade transitions.");
          if (kind === "reorder")     showToast("Reordered: Exec Summary → Wins → Risks → Next Quarter.");
        });
      });
    }
    const addBtn = container.querySelector("#slide-add");
    if (addBtn) addBtn.addEventListener("click", () => showToast("Slide added — draft from context."));
    const presentBtn = container.querySelector("#slide-present");
    if (presentBtn) presentBtn.addEventListener("click", () => showToast("Present mode queued — demo only."));

    container.querySelectorAll("[data-slide-ai]").forEach(btn => {
      btn.addEventListener("click", () => runSlideAction(btn.getAttribute("data-slide-ai")));
    });
  }

  function runSlideAction(kind) {
    const s = slides[state.activeIdx];
    if (kind === "simplify") {
      const simpler = SLIDE_SIMPLIFIED[s.heading];
      if (!simpler) { showToast("Simplified (no pre-scripted variant)."); return; }
      const bulletsEl = container.querySelector("#slide-bullets");
      fadeSwap(bulletsEl, () => {
        s.bullets = simpler;
        bulletsEl.innerHTML = simpler.map(b => `<li contenteditable="true">${b}</li>`).join("");
      });
      showToast("Slide simplified.");
      return;
    }
    if (kind === "expand-notes") {
      const notesEl = container.querySelector("#slide-notes-body");
      const updated = SLIDE_SPEAKER_NOTES_REGENERATED[s.heading] || "Generated speaker notes. Review for accuracy.";
      fadeSwap(notesEl, () => {
        s.speakerNotes = updated;
        notesEl.textContent = updated;
      });
      showToast("Speaker notes regenerated.");
      return;
    }
    if (kind === "chart") {
      const paper = container.querySelector("#slide-canvas-paper");
      if (paper && !paper.querySelector(".slide-chart-placeholder")) {
        const ph = document.createElement("div");
        ph.className = "slide-chart-placeholder";
        ph.innerHTML = `
          <div class="scp-label">Chart placeholder · suggested: <b>bar chart</b></div>
          <div class="scp-bars">
            <span style="height:40%"></span>
            <span style="height:72%"></span>
            <span style="height:55%"></span>
            <span style="height:88%"></span>
          </div>
        `;
        paper.appendChild(ph);
      }
      showToast("Chart placeholder added — wire real data later.");
      return;
    }
    if (kind === "layout") {
      const suggestion = LAYOUT_SUGGESTIONS[s.heading] || "two-column";
      const tag = container.querySelector(".slide-layout-tag");
      if (tag) {
        fadeSwap(tag, () => {
          s.layout = suggestion;
          tag.textContent = suggestion;
        });
      }
      showToast(`Suggested layout: ${suggestion}.`);
      return;
    }
  }

  render();
}
