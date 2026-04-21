// Thread detail view
import * as D from "./demo-data.js";
import { renderCard } from "./cards.js";
import { iconSvg } from "./icons.js";

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderReply(m, isParent = false) {
  const sender = D.userById(m.senderId);
  if (!sender) return "";
  const aiPill = m.isAI ? `<span class="pill-ai">${sender.role || "AI"}</span>` : "";
  const cardHTML = renderCard(m.card);
  return `
    <div class="message ${isParent ? "thread-parent" : ""}">
      ${avatarHTML(sender)}
      <div class="col">
        <div class="head">
          <span class="name${m.isAI ? " ai" : ""}">${sender.name}</span>
          ${aiPill}
          <span class="ts">${m.ts}</span>
        </div>
        <div class="body">${m.text || ""}</div>
        ${cardHTML}
      </div>
    </div>
  `;
}

export function renderThread(threadId) {
  const t = D.threadById(threadId);
  if (!t) return;
  const ch = D.channelById(t.channelId);
  const parent = (D.messages[t.channelId] || []).find(m => m.id === t.parentMessageId);
  const parentHTML = parent ? renderReply(parent, true) : "";
  const replies = t.messages.map(r => renderReply(r)).join("");

  const container = document.getElementById("screen-thread-detail");
  container.innerHTML = `
    <div class="channel-header">
      <button class="icon-btn" data-thread-back>${iconSvg("back", 16)}</button>
      <div>
        <div class="ch-title">${t.title}</div>
        <div class="ch-desc">Thread in <span class="ch-hash">#</span>${ch.name} · ${t.messages.length} replies</div>
      </div>
      <span class="spacer"></span>
      <button class="icon-btn" title="More">${iconSvg("more", 16)}</button>
    </div>

    <div class="messages">
      ${parentHTML}
      <div class="divider-day">${t.messages.length} replies</div>
      ${replies}
    </div>

    <div class="thread-action-bar">
      <button class="btn" data-thread-action="extract">${iconSvg("tasks", 14)} Extract Tasks</button>
      <button class="btn" data-thread-action="summarize">${iconSvg("ai", 14)} Summarize</button>
      <button class="btn" data-thread-action="draft">${iconSvg("doc", 14)} Draft Doc</button>
      <button class="btn" data-thread-action="approval">${iconSvg("approve", 14)} Create Approval</button>
    </div>

    <div class="compose">
      <div class="compose-box">
        <button class="btn-compose" title="Attach">${iconSvg("attach", 18)}</button>
        <textarea placeholder="Reply in thread" rows="1"></textarea>
        <button class="btn-ai">${iconSvg("plus", 14)} AI Actions</button>
        <button class="btn-send">${iconSvg("send", 14)} Reply</button>
      </div>
      <div class="compose-hint">Replies stay in this thread. Use <span class="kbd">⇧⏎</span> for a new line.</div>
    </div>
  `;

  wireThreadEvents();
}

function wireThreadEvents() {
  const back = document.querySelector("[data-thread-back]");
  if (back) back.addEventListener("click", () => {
    window.app.navigateTo("channel-chat", { channelId: window.app.state.channelId || "c-vendor" });
  });

  document.querySelectorAll("[data-thread-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.getAttribute("data-thread-action");
      switch (a) {
        case "extract":   window.app.openRightView("task-panel"); break;
        case "summarize": window.app.openRightView("summary"); break;
        case "draft":     window.app.openRightView("brief", { recipeId: "r-draft-prd" }); break;
        case "approval":  window.app.openRightView("approval-form"); break;
      }
    });
  });

  document.querySelectorAll(".kcard [data-card-action]").forEach(el => {
    el.addEventListener("click", () => {
      const action = el.getAttribute("data-card-action");
      if (action === "open-artifact") {
        const id = el.getAttribute("data-artifact-id");
        window.app.openRightView("output-review", { artifactId: id });
      } else if (action === "open-tasks") {
        window.app.openRightView("task-panel");
      } else if (action === "open-approval") {
        const id = el.getAttribute("data-approval-id");
        window.app.openRightView("approval-review", { approvalId: id });
      }
    });
  });
}
