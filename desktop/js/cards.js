// Render KApp cards (artifact, task list, approval, ai-suggest) inline in chat.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

export function renderCard(card) {
  if (!card || !card.type) return "";
  switch (card.type) {
    case "artifact":  return artifactCard(card.refId);
    case "task-list": return taskListCard(card);
    case "approval":  return approvalCard(card.refId);
    case "ai-suggest":return aiSuggestCard(card);
  }
  return "";
}

function kcardShell({ icon, kind, title, body, foot, dataRef, onClick }) {
  const attrs = dataRef ? `data-card-ref="${dataRef}"` : "";
  const click = onClick ? `data-card-action="${onClick}"` : "";
  return `
    <div class="kcard ${kind}" ${attrs} ${click}>
      <div class="kcard-head">
        <div class="kc-icon">${icon}</div>
        <span class="kc-title">${title}</span>
        <span class="spacer"></span>
      </div>
      <div class="kcard-body">${body}</div>
      ${foot ? `<div class="kcard-foot">${foot}</div>` : ""}
    </div>
  `;
}

function artifactCard(refId) {
  const a = D.artifactById(refId);
  if (!a) return "";
  const icon = a.type === "deck" ? "D" : "F";
  return kcardShell({
    icon,
    kind: "kcard-artifact",
    title: `${a.template} · ${a.type === "deck" ? "Deck" : "Doc"}`,
    body: `
      <div class="row gap-3 items-start">
        <div class="art-icon">${icon}</div>
        <div class="flex-1">
          <div class="kcard-title">${a.title}</div>
          <div class="kcard-desc">${a.sections[0]?.body || ""}</div>
          <div class="mt-2 row gap-2" style="flex-wrap:wrap">
            <span class="tag">${a.version}</span>
            <span class="tag">${a.status}</span>
            <span class="ai-chip">On-device AI</span>
          </div>
        </div>
      </div>
    `,
    foot: `
      <span class="meta">${a.sources.length} sources</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-artifact" data-artifact-id="${a.id}">Open</button>
    `,
    dataRef: refId,
    onClick: "open-artifact",
  });
}

function taskListCard(card) {
  const refId = card.refId || "thread-vendor-tasks";
  const t = D.threadById(refId);
  const taskPreview = D.tasks.slice(0, card.count || 5).map(tk => {
    const owner = D.userById(tk.ownerId);
    return `<div class="task-mini">
      <div>
        <div class="tt">${tk.title}</div>
        <div class="tm">${owner?.name || ""} · Due ${tk.due}</div>
      </div>
      <span class="status-pill ${tk.status}">${tk.status.replace("-", " ")}</span>
    </div>`;
  }).join("");
  return kcardShell({
    icon: "T",
    kind: "kcard-tasks",
    title: `${card.count || 5} tasks · AI-extracted`,
    body: taskPreview,
    foot: `
      <span class="meta">Source: ${t?.title || "thread"}</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-tasks">View all</button>
    `,
  });
}

function approvalCard(refId) {
  const a = D.approvalById(refId);
  if (!a) return "";
  const submitter = D.userById(a.submittedBy);
  return kcardShell({
    icon: "A",
    kind: "kcard-approval",
    title: "Approval request",
    body: `
      <div class="kcard-title">${a.title}</div>
      <div class="kcard-desc">${a.description}</div>
      <div class="mt-2 row justify-between">
        <div class="ap-amount">${a.amount}</div>
        <span class="status-pill ${a.status}">${a.status}</span>
      </div>
      <div class="mt-2 text-xs text-muted">Submitted by ${submitter?.name || ""} · ${a.submittedAt}</div>
    `,
    foot: `
      <span class="meta">${a.supportingDocs.length} attached</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-approval" data-approval-id="${a.id}">Review</button>
    `,
  });
}

function aiSuggestCard() {
  return `<div class="ai-suggest">${iconSvg("ai", 12)} <span>AI suggestion — click to run</span></div>`;
}
