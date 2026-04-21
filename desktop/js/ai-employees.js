// AI Employee profile + queue rendering in the center panel
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

export function renderAIEmployee(aiId) {
  const ai = D.aiById(aiId) || D.aiEmployees[0];
  const container = document.getElementById("screen-ai-employee");
  const channels = ai.allowedChannels.map(cid => {
    const c = D.channelById(cid);
    return c ? `<span class="tag">#${c.name}</span>` : "";
  }).join("");

  const queueRows = ai.queue.map(q => {
    const isDone = q.status === "done";
    return `
      <div class="qr">
        <div>
          <div class="t-title">${q.title}</div>
          <div class="t-sub">Recipe: ${q.recipe} · ${q.sources.join(", ")} ${q.blockedReason ? "· " + q.blockedReason : ""}</div>
        </div>
        <span class="status-pill ${q.status}">${q.status}</span>
        <div class="t-sub">Updated ${q.lastUpdated}</div>
        ${isDone
          ? `<button class="review-btn" data-review-id="a-prd-vendor-portal">Review Draft</button>`
          : `<span class="text-muted text-xs">—</span>`}
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="channel-header">
      <div>
        <div class="breadcrumb">
          <a data-nav-home>Workspace</a>
          <span class="sep">/</span>
          <a data-nav-ai-list>AI Employees</a>
          <span class="sep">/</span>
          <span>${ai.name}</span>
        </div>
        <div class="ch-title" style="margin-top:2px">${ai.name}</div>
      </div>
      <span class="spacer"></span>
      <button class="btn btn-secondary btn-sm">Share</button>
      <button class="btn btn-primary btn-sm">Configure</button>
    </div>

    <div class="ai-profile-wrap">
      <div class="ai-profile-hero">
        <div class="avatar xl" style="background:${ai.color}">${ai.initials}</div>
        <div>
          <h1>${ai.name}</h1>
          <div class="role">${ai.role} · on-device preferred</div>
          <div class="status-line"><span class="dot"></span>${ai.status}</div>
          <div class="ai-channels-chips">
            <span class="text-xs text-muted">Allowed in:</span>
            ${channels}
          </div>
        </div>
        <div class="col gap-2" style="align-items:flex-end">
          <span class="badge-ai">${iconSvg("ai", 12)} ${ai.enabled ? "Enabled" : "Disabled"}</span>
          <span class="text-xs text-muted">Concurrency ${ai.concurrency}</span>
        </div>
      </div>

      <div class="section-head">
        <h2>Task queue</h2>
        <span class="more">View full history</span>
      </div>

      <div class="ai-queue">
        <div class="qh">
          <div>Task</div>
          <div>Status</div>
          <div>Sources · last update</div>
          <div></div>
        </div>
        ${queueRows}
      </div>

      <div class="section-head">
        <h2>Channel presence</h2>
      </div>
      <div class="output-sec">
        <div class="row gap-2 items-start">
          <div class="avatar md" style="background:${ai.color}">${ai.initials}</div>
          <div>
            <div class="b">${ai.name} · in #vendor-management</div>
            <div class="text-sm text-muted">Reading sources — vendor-contracts-q2.zip, #vendor-management</div>
            <div class="text-sm text-muted">Draft ready for review — Vendor Renewal Checklist</div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelectorAll("[data-nav-home]").forEach(a => a.addEventListener("click", () => window.app.navigateTo("workspace-home")));
  container.querySelectorAll("[data-nav-ai-list]").forEach(a => a.addEventListener("click", () => window.app.navigateTo("workspace-home")));
  container.querySelectorAll("[data-review-id]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-review-id");
    window.app.navigateTo("channel-chat", { channelId: "c-vendor" }, () => {
      window.app.openRightView("output-review", { artifactId: id });
    });
  }));
}
