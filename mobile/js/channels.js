// Chat tab: channel list + channel chat + compose bar.
import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";
import { renderCard } from "../../desktop/js/cards.js";
import { showToast } from "./transitions.js";
import { openSheet, closeSheet } from "./sheets.js";
import { openActionLauncherSheet } from "./ai-actions.js";

/* ---------- Channel list (Chat tab root) ---------- */

function lastMessagePreview(channelId) {
  const msgs = D.messages[channelId] || [];
  const last = msgs[msgs.length - 1];
  if (!last) return "";
  const sender = D.userById(last.senderId);
  const prefix = sender ? `${sender.name.split(" ")[0]}: ` : "";
  // Strip mentions / cards down to a one-line preview.
  const text = last.text || (last.card ? `[${last.card.type}]` : "");
  return prefix + text.replace(/<[^>]+>/g, "");
}

function unreadCountFor(channelId) {
  // Synthesize from notifications referencing this channel.
  return D.notifications.filter(n => n.unread && n.channelId === channelId).length;
}

export function renderChannelList(state) {
  const el = document.querySelector('[data-screen="channel-list"]');
  if (!el) return;
  const tenantId = state.tenantId;
  const tenant = D.tenantById(tenantId);
  const tenantDomains = D.domains.filter(d => d.tenantId === tenantId);

  // Unread channels (synthetic): channels with notification mentions OR a
  // hand-picked default set so the user always sees the "Unreads" rail.
  const channelsForTenant = tenantDomains.flatMap(d =>
    d.channels.map(cid => D.channelById(cid)).filter(Boolean)
  );
  const unreadChannels = channelsForTenant.filter(c => unreadCountFor(c.id) > 0);

  const dmRows = D.directMessages
    .filter(dm => dm.tenantId === tenantId)
    .map(dm => {
      const u = D.userById(dm.withUserId);
      if (!u) return "";
      const last = "Last DM preview…";
      return `
        <div class="channel-row dm-row${dm.unread ? " unread" : ""}" data-action="open-dm" data-dm-id="${dm.id}">
          <div class="avatar md" style="background:${u.color}">${u.initials}</div>
          <div>
            <div class="ch-name">${u.name}</div>
            <div class="ch-preview">${last}</div>
          </div>
          <div class="ch-right">
            <span>9:24</span>
            ${dm.unread ? `<span class="unread-badge">${dm.unread}</span>` : ""}
          </div>
        </div>
      `;
    }).join("");

  const channelRow = (c) => {
    const unread = unreadCountFor(c.id);
    return `
      <div class="channel-row${unread ? " unread" : ""}" data-action="open-channel" data-channel-id="${c.id}">
        <div class="ch-hash">#</div>
        <div>
          <div class="ch-name">${c.name}</div>
          <div class="ch-preview">${lastMessagePreview(c.id) || c.description}</div>
        </div>
        <div class="ch-right">
          <span>9:32</span>
          ${unread ? `<span class="unread-badge">${unread}</span>` : ""}
        </div>
      </div>
    `;
  };

  const domainSections = tenantDomains.map(d => {
    const isCollapsed = state.collapsed.has(d.id);
    const rows = d.channels.map(cid => D.channelById(cid)).filter(Boolean).map(channelRow).join("");
    return `
      <div class="sec-head" data-collapsed="${isCollapsed}">
        <span>${d.name}</span>
        <button data-action="toggle-section" data-section-id="${d.id}">
          <span class="caret">▾</span>
        </button>
      </div>
      ${isCollapsed ? "" : `<div class="domain-section">${rows}</div>`}
    `;
  }).join("");

  el.innerHTML = `
    <div class="search-bar">
      <input type="search" placeholder="Search ${tenant?.name || ""}…" data-action="search"/>
    </div>
    <div class="channel-list">
      ${unreadChannels.length ? `
        <div class="sec-head"><span>Unreads</span><span class="text-xs">${unreadChannels.length}</span></div>
        ${unreadChannels.map(channelRow).join("")}
      ` : ""}
      ${domainSections}
      <div class="sec-head"><span>Direct Messages</span></div>
      ${dmRows || `<div class="empty">No DMs yet</div>`}
    </div>
  `;
}

/* ---------- Channel chat ---------- */

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderMessageMobile(m, isContinuation = false) {
  const sender = D.userById(m.senderId);
  if (!sender) return "";
  if (m.isSystem || sender.isSystem) {
    const card = renderCard(m.card);
    return `
      <div class="message-mob system" data-msg-id="${m.id}">
        <div class="row justify-between"><span>${m.text || ""}</span><span class="text-xs">${m.ts}</span></div>
        ${card}
      </div>
    `;
  }
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
  const driveRef = m.driveRef
    ? `<button class="drive-ref-pill" data-msg-action="open-drive">${iconSvg("attach", 12)}<span>${m.driveRef.name}</span></button>`
    : "";
  const left = isContinuation
    ? `<div class="avatar-spacer"></div>`
    : avatarHTML(sender);
  const head = isContinuation
    ? ""
    : `<div class="head"><span class="name${aiClass}">${sender.name}</span>${aiPill}<span class="ts">${m.ts}</span></div>`;
  return `
    <div class="message-mob${isContinuation ? " continuation" : ""}" data-msg-id="${m.id}" data-action="tap-message">
      ${left}
      <div>
        ${head}
        <div class="body">${body}</div>
        ${driveRef}
        ${attachments ? `<div class="attachments">${attachments}</div>` : ""}
        ${card}
      </div>
    </div>
  `;
}

export function renderChannelChat(state) {
  const el = document.querySelector('[data-screen="channel-chat"]');
  if (!el) return;
  const ch = D.channelById(state.channelId);
  if (!ch) { el.innerHTML = `<div class="empty">Channel not found</div>`; return; }
  const msgs = (D.messages[state.channelId] || []).map((m, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const isCont = !!(prev && prev.senderId === m.senderId && !m.card && !m.cardType);
    return renderMessageMobile(m, isCont);
  }).join("");

  el.innerHTML = `
    <div class="chat-screen">
      <div class="chat-messages" id="chat-messages-${ch.id}">
        ${msgs}
      </div>
      <div class="compose">
        <button class="btn-icon" data-action="attach" aria-label="Attach">${iconSvg("attach", 20)}</button>
        <input type="text" placeholder="Message #${ch.name}" data-action="compose-input"/>
        <button class="btn-icon sparkle" data-action="open-launcher-sheet" aria-label="AI">${iconSvg("ai", 20)}</button>
        <button class="btn-icon send" data-action="send" aria-label="Send">${iconSvg("send", 20)}</button>
      </div>
    </div>
  `;

  // Auto-scroll messages to bottom
  const list = el.querySelector(".chat-messages");
  if (list) list.scrollTop = list.scrollHeight;
}

/* ---------- Message action bar (shown on tap) ---------- */

export function showMessageActionBar(messageEl, msgId) {
  document.querySelectorAll(".msg-action-bar").forEach(b => b.remove());
  const bar = document.createElement("div");
  bar.className = "msg-action-bar";
  bar.dataset.msgId = msgId;
  bar.innerHTML = `
    <button data-msg-action="reply">Reply</button>
    <button data-msg-action="thread">Thread</button>
    <button data-msg-action="task">Task</button>
    <button class="ai" data-msg-action="ai">AI</button>
  `;
  messageEl.appendChild(bar);
  setTimeout(() => {
    document.addEventListener("click", function dismiss(e) {
      if (!bar.contains(e.target)) {
        bar.remove();
        document.removeEventListener("click", dismiss);
      }
    });
  }, 0);
}

/* ---------- Channel chat event wiring ---------- */

export function wireChannelChat() {
  const el = document.querySelector('[data-screen="channel-chat"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    // Card actions take precedence over tap-message so cards rendered
    // inside non-system messages (approval, artifact, task-list) still
    // route to their detail screens.
    const cardAction = e.target.closest("[data-card-action]")?.dataset.cardAction;
    if (cardAction === "open-artifact") {
      const aid = e.target.closest("[data-artifact-id]")?.dataset.artifactId;
      window.app.navigate("ai-output", { artifactId: aid });
      return;
    }
    if (cardAction === "open-approval") {
      const apid = e.target.closest("[data-approval-id]")?.dataset.approvalId;
      window.app.navigate("approval-review", { approvalId: apid });
      return;
    }
    if (cardAction === "open-tasks") {
      window.app.navigate("tasks");
      return;
    }

    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "tap-message") {
      const m = e.target.closest(".message-mob");
      const id = m?.dataset.msgId;
      if (!id) return;
      if (m.classList.contains("system")) return;
      showMessageActionBar(m, id);
      return;
    }
    if (action === "send") {
      showToast("Demo · message sending is simulated");
      return;
    }
    if (action === "open-launcher-sheet") {
      openActionLauncherSheet();
      return;
    }
    if (action === "attach") {
      showToast("Demo · attachment picker would open");
      return;
    }
    const msgAction = e.target.closest("[data-msg-action]")?.dataset.msgAction;
    if (msgAction === "thread") {
      const msgId = e.target.closest(".msg-action-bar")?.dataset.msgId;
      // Pick the first thread that matches the parent message, or default.
      const thread = Object.values(D.threads).find(t => t.parentMessageId === msgId)
                  || Object.values(D.threads)[0];
      if (thread) window.app.navigate("thread-detail", { threadId: thread.id });
      document.querySelectorAll(".msg-action-bar").forEach(b => b.remove());
      return;
    }
    if (msgAction === "ai") {
      openActionLauncherSheet();
      document.querySelectorAll(".msg-action-bar").forEach(b => b.remove());
      return;
    }
    if (msgAction === "task") {
      window.app.navigate("tasks");
      document.querySelectorAll(".msg-action-bar").forEach(b => b.remove());
      return;
    }
    if (msgAction === "reply") {
      showToast("Replied (demo)");
      document.querySelectorAll(".msg-action-bar").forEach(b => b.remove());
      return;
    }
  });
}

/* ---------- Channel list event wiring ---------- */
export function wireChannelList() {
  const el = document.querySelector('[data-screen="channel-list"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "open-channel") {
      const id = e.target.closest("[data-channel-id]")?.dataset.channelId;
      window.app.navigate("channel-chat", { channelId: id });
      return;
    }
    if (action === "open-dm") {
      showToast("DM view not in this demo");
      return;
    }
    if (action === "toggle-section") {
      const sid = e.target.closest("[data-section-id]")?.dataset.sectionId;
      if (!sid) return;
      const s = window.app.state.collapsed;
      if (s.has(sid)) s.delete(sid); else s.add(sid);
      renderChannelList(window.app.state);
    }
  });
}
