// Channel view (header + messages + compose)
import * as D from "./demo-data.js";
import { renderCard } from "./cards.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderMessage(m, isContinuation = false) {
  const sender = D.userById(m.senderId);
  if (!sender) return "";
  // System messages (e.g. inbound email notices, calendar reminders) render
  // as subtle grey full-width rows rather than the avatar+name chat layout.
  if (m.isSystem || sender.isSystem) {
    const card = renderCard(m.card);
    return `
      <div class="message system-message" data-msg-id="${m.id}">
        <div class="sys-row">
          <span class="sys-text">${m.text || ""}</span>
          <span class="sys-ts">${m.ts}</span>
        </div>
        ${card}
      </div>
    `;
  }
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
  // Subtle drive-file reference rendered as a small inline pill under the
  // message body — used when an AI mentions a file it saved to the channel
  // drive without forcing the full file card layout.
  const driveRef = m.driveRef
    ? `<button class="drive-ref-pill" data-msg-action="open-drive" data-file-id="${m.driveRef.fileId}" title="Open in channel files">${iconSvg("attach", 12)}<span>${m.driveRef.name}</span></button>`
    : "";

  const leftCol = isContinuation
    ? `<div class="avatar-spacer" aria-hidden="true"></div>`
    : avatarHTML(sender);
  const headBlock = isContinuation
    ? ""
    : `<div class="head">
          <span class="name${aiClass}">${sender.name}</span>
          ${aiPill}
          <span class="ts">${m.ts}</span>
        </div>`;
  const hoverTs = isContinuation ? `<span class="ts-hover">${m.ts}</span>` : "";
  const contClass = isContinuation ? " continuation" : "";

  return `
    <div class="message${contClass}" data-msg-id="${m.id}">
      ${leftCol}
      <div class="col">
        ${headBlock}
        <div class="body">${body}${hoverTs}</div>
        ${driveRef}
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
  const msgs = (D.messages[channelId] || []).map((m, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const isContinuation = !!(prev && prev.senderId === m.senderId && !m.card && !m.cardType);
    return renderMessage(m, isContinuation);
  }).join("");

  const container = document.getElementById("screen-channel-chat");
  // Domain/knowledge references are retained for right-panel wiring below.
  void domain;

  // Channel context bar — a slim row of integration indicators below the
  // channel header. Only renders indicators that have data for the current
  // channel so it reads as metadata, not navigation.
  const emails   = D.emailsByChannel(channelId);
  const cal      = D.calendarForChannel(channelId);
  const drive    = D.driveForChannel(channelId);
  const biz      = D.businessRecordsForChannel(channelId);
  const dealsCnt = biz.deals.length;
  const invCnt   = biz.invoices.length;
  const ctxItems = [];
  if (emails.length) {
    ctxItems.push(`<button class="ctx-indicator" data-ctx="email" title="View email threads">✉ ${emails.length} email thread${emails.length > 1 ? "s" : ""}</button>`);
  }
  if (cal.length) {
    const next = cal[0];
    ctxItems.push(`<button class="ctx-indicator" data-ctx="calendar" title="View calendar">📅 Next: ${next.title}, ${next.time}</button>`);
  }
  if (drive?.files?.length) {
    ctxItems.push(`<button class="ctx-indicator" data-ctx="drive" title="View channel files">📁 ${drive.files.length} files</button>`);
  }
  if (dealsCnt || invCnt) {
    const bits = [];
    if (dealsCnt) bits.push(`${dealsCnt} deal${dealsCnt > 1 ? "s" : ""}`);
    if (invCnt)   bits.push(`${invCnt} invoice${invCnt > 1 ? "s" : ""}`);
    ctxItems.push(`<button class="ctx-indicator" data-ctx="business" title="View business records">💼 ${bits.join(" · ")}</button>`);
  }
  const ctxBar = ctxItems.length
    ? `<div class="channel-context-bar" aria-label="Channel connected services">${ctxItems.join("")}</div>`
    : "";

  container.innerHTML = `
    <div class="channel-header">
      <div>
        <div class="ch-title"><span class="ch-hash">#</span>${ch.name}</div>
        <div class="ch-desc">${ch.description}</div>
      </div>
      <span class="spacer"></span>
      <span class="ch-members">${ch.members} members</span>
      <button class="icon-btn" title="Search channel">${iconSvg("search", 16)}</button>
      <div class="avatar-stack">
        ${D.users.slice(0,4).map(u => avatarHTML(u, "sm")).join("")}
      </div>
    </div>
    ${ctxBar}
    <div class="messages" id="messages-list">
      <div class="divider-day">Today</div>
      ${msgs}
    </div>
    <div class="typing-indicator" id="typing-indicator" style="display:none">
      <span class="typing-dots"><span></span><span></span><span></span></span>
      <span class="typing-name">Kara Ops AI is typing...</span>
    </div>
    <div class="compose">
      <div class="compose-box">
        <button class="btn-compose" title="Attach file">${iconSvg("attach", 18)}</button>
        <button class="btn-compose" id="compose-drive" title="Attach from Drive">📁</button>
        <button class="btn-compose" id="compose-cal" title="Share availability">📅</button>
        <textarea placeholder="Write a message..." rows="1"></textarea>
        <button class="btn-compose" title="Emoji">😊</button>
        <button class="btn-compose btn-ai-sparkle" id="compose-ai" title="AI Actions">${iconSvg("ai", 18)}</button>
        <button class="btn-send" id="compose-send">${iconSvg("send", 14)}</button>
      </div>
      <div class="compose-hint">
        <span class="kbd">/</span> commands · <span class="kbd">@</span> mention · <span class="kbd">⌘K</span> search
      </div>
    </div>
  `;

  wireChannelEvents();

  // Briefly show the typing indicator for demo feel.
  setTimeout(() => {
    const ti = document.getElementById("typing-indicator");
    if (ti) {
      ti.style.display = "flex";
      setTimeout(() => { ti.style.display = "none"; }, 3000);
    }
  }, 1500);
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
      } else if (action === "open-email") {
        const id = el.getAttribute("data-email-id");
        window.app.openRightView("email", { emailId: id });
      } else if (action === "reply-email") {
        showToast("Reply drafted in chat — AI pre-filled context");
      } else if (action === "open-deal") {
        window.app.openRightView("business");
      } else if (action === "open-event") {
        window.app.openRightView("calendar");
      }
    });
  });

  // Also allow clicking the card body (not just buttons) to open panels.
  document.querySelectorAll(".kcard-email").forEach(c => {
    c.addEventListener("click", () => {
      const id = c.getAttribute("data-card-ref");
      window.app.openRightView("email", { emailId: id });
    });
  });
  document.querySelectorAll(".kcard-deal").forEach(c => {
    c.addEventListener("click", () => window.app.openRightView("business"));
  });
  document.querySelectorAll(".kcard-calendar").forEach(c => {
    c.addEventListener("click", () => window.app.openRightView("calendar"));
  });

  // Channel context bar — slim clickable indicators open the matching
  // right-panel view for the current channel.
  document.querySelectorAll(".channel-context-bar [data-ctx]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const view = btn.getAttribute("data-ctx");
      window.app.openRightView(view);
    });
  });

  // Subtle inline drive pill on AI messages opens the drive panel.
  document.querySelectorAll(".drive-ref-pill").forEach(pill => {
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      window.app.openRightView("drive");
    });
  });

  // Make task-list cards clickable on the body too
  document.querySelectorAll(".kcard-tasks").forEach(c => {
    c.addEventListener("click", () => window.app.openRightView("task-panel"));
  });

  const ai = document.getElementById("compose-ai");
  if (ai) ai.addEventListener("click", () => window.app.openActionLauncher());
  const drive = document.getElementById("compose-drive");
  if (drive) drive.addEventListener("click", () => window.app.openRightView("drive"));
  const cal = document.getElementById("compose-cal");
  if (cal) cal.addEventListener("click", () => showToast("Availability block inserted"));
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
