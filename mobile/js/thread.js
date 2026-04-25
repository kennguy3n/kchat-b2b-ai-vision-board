// Thread detail screen.
import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";
import { renderCard } from "../../desktop/js/cards.js";
import { showToast } from "./transitions.js";

function avatarHTML(user) {
  return `<div class="avatar md" style="background:${user.color || "#6b7280"}">${user.initials}</div>`;
}

function renderThreadMessage(m) {
  const sender = D.userById(m.senderId);
  if (!sender) return "";
  const aiClass = m.isAI ? " ai" : "";
  const aiPill = m.isAI ? `<span class="pill-ai">${sender.role || "AI"}</span>` : "";
  let body = m.text || "";
  if (m.mentions) {
    m.mentions.forEach(uid => {
      const u = D.userById(uid);
      if (!u) return;
      const name = u.name.split(" ")[0];
      const re = new RegExp(`@${name}`, "ig");
      body = body.replace(re, `<span class="mention">@${name}</span>`);
    });
  }
  const card = renderCard(m.card);
  return `
    <div class="message-mob" data-msg-id="${m.id}">
      ${avatarHTML(sender)}
      <div>
        <div class="head">
          <span class="name${aiClass}">${sender.name}</span>${aiPill}
          <span class="ts">${m.ts}</span>
        </div>
        <div class="body">${body}</div>
        ${card}
      </div>
    </div>
  `;
}

export function renderThreadDetail(state) {
  const el = document.querySelector('[data-screen="thread-detail"]');
  if (!el) return;
  const t = D.threadById(state.threadId);
  if (!t) { el.innerHTML = `<div class="empty">Thread not found</div>`; return; }

  const ch = D.channelById(t.channelId);
  const linkedChips = (t.linkedObjects || []).map(obj => {
    if (obj.type === "task-list") {
      const count = D.tasks.filter(tk => tk.sourceThreadId === t.id).length || 5;
      return `<button class="linked-chip" data-link-action="open-tasks">${iconSvg("tasks", 14)} ${count} Tasks</button>`;
    }
    if (obj.type === "approval") {
      return `<button class="linked-chip" data-link-action="open-approval" data-approval-id="${obj.refId}">${iconSvg("approve", 14)} Approval</button>`;
    }
    if (obj.type === "artifact") {
      return `<button class="linked-chip" data-link-action="open-artifact" data-artifact-id="${obj.refId}">${iconSvg("doc", 14)} Doc</button>`;
    }
    return "";
  }).join("");

  el.innerHTML = `
    <div class="thread-screen">
      <div>
        <div class="thread-header">
          <div class="th-parent">In # ${ch?.name || "channel"}</div>
          <div class="th-title">${t.title}</div>
        </div>
        ${linkedChips ? `<div class="thread-linked">${linkedChips}</div>` : ""}
      </div>
      <div class="thread-messages">
        ${(t.messages || []).map(renderThreadMessage).join("")}
      </div>
      <div class="thread-actions-bar">
        <button class="pill" data-thread-action="extract-tasks">${iconSvg("tasks", 12)} Extract Tasks</button>
        <button class="pill" data-thread-action="summarize">${iconSvg("sparkle", 12)} Summarize</button>
        <button class="pill" data-thread-action="draft-doc">${iconSvg("doc", 12)} Draft Doc</button>
        <button class="pill" data-thread-action="approval">${iconSvg("approve", 12)} Approval</button>
      </div>
    </div>
  `;
}

export function wireThreadDetail() {
  const el = document.querySelector('[data-screen="thread-detail"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const linkAction = e.target.closest("[data-link-action]")?.dataset.linkAction;
    if (linkAction === "open-tasks")    { window.app.navigate("tasks"); return; }
    if (linkAction === "open-approval") {
      const apid = e.target.closest("[data-approval-id]")?.dataset.approvalId;
      window.app.navigate("approval-review", { approvalId: apid });
      return;
    }
    if (linkAction === "open-artifact") {
      const aid = e.target.closest("[data-artifact-id]")?.dataset.artifactId;
      window.app.navigate("ai-output", { artifactId: aid });
      return;
    }
    const ta = e.target.closest("[data-thread-action]")?.dataset.threadAction;
    if (ta === "extract-tasks") { window.app.navigate("tasks"); return; }
    if (ta === "summarize")     { showToast("Summary generated (demo)"); return; }
    if (ta === "draft-doc")     {
      window.app.navigate("ai-brief", { briefTemplate: { id: "tpl-prd", name: "PRD" } });
      return;
    }
    if (ta === "approval")      {
      window.app.navigate("approval-review", { approvalId: "ap-orbix" });
      return;
    }
  });
}
