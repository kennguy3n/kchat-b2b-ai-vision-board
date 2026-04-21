// Document Artifact Workspace (center panel)
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { openModal, closeModal } from "./modals.js";
import { showToast } from "./transitions.js";

export function renderArtifactWorkspace(artifactId) {
  const a = D.artifactById(artifactId) || D.artifactById("a-prd-vendor-portal");
  const container = document.getElementById("screen-artifact-workspace");

  const outline = a.sections.map((s, i) => `
    <div class="outline-item ${i === 0 ? "active" : ""}" data-scroll-to="sec-${i}">${s.heading}</div>
  `).join("");

  const body = a.sections.map((s, i) => `
    <section class="sec" id="sec-${i}" data-section-idx="${i}" tabindex="0">
      <h2>${s.heading}</h2>
      <p>${s.body.replace(/\[(\d+)\]/g, '<span class="cite">[$1]</span>')}</p>
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

  document.getElementById("art-publish").addEventListener("click", () => openModal("publish-confirm"));
  document.getElementById("art-share").addEventListener("click", () => showToast("Share link copied."));
}
