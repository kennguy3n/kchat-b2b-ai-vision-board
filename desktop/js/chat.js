// Channel view (header + messages + compose)
import * as D from "./demo-data.js";
import { renderCard } from "./cards.js";
import { iconSvg } from "./icons.js";

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderMessage(m) {
  const sender = D.userById(m.senderId);
  if (!sender) return "";
  const aiClass = m.isAI ? " ai" : "";
  const aiPill = m.isAI ? `<span class="pill-ai">${sender.role || "AI"}</span>` : "";

  // Mentions: @user.name
  let body = m.text || "";
  if (m.mentions) {
    m.mentions.forEach(uid => {
      const u = D.userById(uid);
      if (!u) return;
      const name = u.name.split(" ")[0].toLowerCase();
      const re = new RegExp(`@${name}`, "ig");
      body = body.replace(re, `<span class="mention">@${u.name.split(" ")[0]}</span>`);
    });
  }

  // Attachments
  const attachments = (m.attachments || []).map(a => `
    <div class="attachment">
      <div class="file-icon">${a.name.split(".").pop().toUpperCase().slice(0,3)}</div>
      <div>
        <div class="b">${a.name}</div>
        <div class="text-xs text-muted">${a.size}</div>
      </div>
    </div>
  `).join("");

  const card = renderCard(m.card) + (m.cardType === "ai-suggest" ? renderCard({ type: "ai-suggest" }) : "");

  return `
    <div class="message" data-msg-id="${m.id}">
      ${avatarHTML(sender)}
      <div class="col">
        <div class="head">
          <span class="name${aiClass}">${sender.name}</span>
          ${aiPill}
          <span class="ts">${m.ts}</span>
        </div>
        <div class="body">${body}</div>
        ${attachments ? `<div class="attachments">${attachments}</div>` : ""}
        ${card}
      </div>
      <div class="hover-actions">
        <button class="btn-icon" title="Reply" data-msg-action="reply" data-id="${m.id}">${iconSvg("reply", 14)}</button>
        <button class="btn-icon" title="Open thread" data-msg-action="thread" data-id="${m.id}">${iconSvg("thread", 14)}</button>
        <button class="btn-icon" title="Create task" data-msg-action="task" data-id="${m.id}">${iconSvg("tasks", 14)}</button>
        <button class="btn-icon" title="AI actions" data-msg-action="ai" data-id="${m.id}">${iconSvg("ai", 14)}</button>
        <button class="btn-icon" title="More" data-msg-action="more" data-id="${m.id}">${iconSvg("more", 14)}</button>
      </div>
    </div>
  `;
}

export function renderChannel(channelId) {
  const ch = D.channelById(channelId);
  if (!ch) return;
  const domain = D.domainById(ch.domainId);
  const msgs = (D.messages[channelId] || []).map(renderMessage).join("");

  const container = document.getElementById("screen-channel-chat");
  container.innerHTML = `
    <div class="channel-header">
      <div>
        <div class="ch-title"><span class="ch-hash">#</span>${ch.name}</div>
        <div class="ch-desc">${ch.description} · ${ch.members} members · in ${domain?.name || ""}</div>
      </div>
      <span class="spacer"></span>
      <button class="icon-btn" title="Pin">${iconSvg("shield", 16)}</button>
      <button class="icon-btn" title="Search">${iconSvg("search", 16)}</button>
      <div class="avatar-stack">
        ${D.users.slice(0,4).map(u => avatarHTML(u, "sm")).join("")}
      </div>
    </div>
    <div class="messages" id="messages-list">
      <div class="divider-day">Today</div>
      ${msgs}
    </div>
    <div class="compose">
      <div class="compose-box">
        <button class="btn-compose" title="Attach">${iconSvg("attach", 18)}</button>
        <textarea placeholder="Message #${ch.name}" rows="1"></textarea>
        <button class="btn-ai" id="compose-ai">${iconSvg("plus", 14)} AI Actions</button>
        <button class="btn-send" id="compose-send">${iconSvg("send", 14)} Send</button>
      </div>
      <div class="compose-hint">Tip: press <span class="kbd">+</span> for AI actions or <span class="kbd">/</span> for slash commands.</div>
    </div>
  `;

  wireChannelEvents();
}

function wireChannelEvents() {
  document.querySelectorAll("[data-msg-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.getAttribute("data-msg-action");
      const msgId = btn.getAttribute("data-id");
      if (action === "thread") {
        // Open the primary thread for demo
        window.app.navigateTo("thread-detail", { threadId: "thread-vendor-tasks" });
      } else if (action === "ai") {
        window.app.openActionLauncher();
      } else if (action === "task") {
        window.app.openRightView("task-panel");
      } else if (action === "reply" || action === "more") {
        // no-op visual-only
      }
    });
  });

  document.querySelectorAll(".kcard [data-card-action]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
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

  // Make task-list cards clickable on the body too
  document.querySelectorAll(".kcard-tasks").forEach(c => {
    c.addEventListener("click", () => window.app.openRightView("task-panel"));
  });

  const ai = document.getElementById("compose-ai");
  if (ai) ai.addEventListener("click", () => window.app.openActionLauncher());
  const send = document.getElementById("compose-send");
  if (send) send.addEventListener("click", () => {
    const ta = document.querySelector(".compose textarea");
    if (ta && ta.value.trim()) {
      // visually add message
      const list = document.getElementById("messages-list");
      const me = D.userById(D.currentUserId);
      const div = document.createElement("div");
      div.innerHTML = renderMessage({
        id: "m-local-" + Date.now(),
        senderId: me.id,
        ts: "now",
        text: ta.value.trim(),
      });
      list.appendChild(div.firstElementChild);
      ta.value = "";
      list.scrollTop = list.scrollHeight;
    }
  });
}
