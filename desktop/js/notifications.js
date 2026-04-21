// Notifications inbox (Screen 18).
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

let activeFilter = "all";

const FILTERS = [
  { id: "all",       label: "All" },
  { id: "mention",   label: "Mentions" },
  { id: "approval",  label: "Approvals" },
  { id: "ai",        label: "AI" },
  { id: "thread",    label: "Threads" },
  { id: "budget",    label: "Budget" },
];

function kindLabel(k) {
  return ({ mention: "@", approval: "AP", ai: "AI", thread: "TH", budget: "$" })[k] || "•";
}

function renderNotif(n) {
  const actor = D.userById(n.actorId);
  const avatar = actor
    ? `<div class="avatar sm" style="background:${actor.color || "#6b7280"};flex-shrink:0">${actor.initials}</div>`
    : "";
  return `
    <div class="inbox-item ${n.unread ? "unread" : ""}" data-notif-id="${n.id}" data-kind="${n.kind}">
      <div class="ii-kind ${n.kind}">${kindLabel(n.kind)}</div>
      ${avatar}
      <div class="ii-body">
        <div class="ii-title">${n.title}</div>
        <div class="ii-snippet">${n.preview}</div>
      </div>
      <div class="ii-ts">${n.ts}</div>
    </div>
  `;
}

function handleNotifClick(n) {
  n.unread = false; // mark read (demo-local mutation)
  if (n.kind === "mention" || n.kind === "thread") {
    if (n.threadId) {
      window.app.navigateTo("thread-detail", { threadId: n.threadId });
      return;
    }
    if (n.channelId) {
      window.app.navigateTo("channel-chat", { channelId: n.channelId });
      return;
    }
  }
  if (n.kind === "approval" && n.approvalId) {
    window.app.openRightView("approval-review", { approvalId: n.approvalId });
    window.app.navigateTo("channel-chat", { channelId: "c-vendor" });
    return;
  }
  if (n.kind === "ai" && n.artifactId) {
    window.app.navigateTo("artifact-workspace", { artifactId: n.artifactId });
    return;
  }
  if (n.kind === "budget" && n.aiEmployeeId) {
    window.app.navigateTo("ai-employee", { aiEmployeeId: n.aiEmployeeId });
    return;
  }
}

export function renderNotifications() {
  const container = document.getElementById("screen-notifications");
  const list = activeFilter === "all"
    ? D.notifications
    : D.notifications.filter(n => n.kind === activeFilter);
  const unreadCount = D.unreadNotificationCount();

  const filters = FILTERS.map(f => `
    <button class="if-btn ${activeFilter === f.id ? "active" : ""}" data-filter="${f.id}">${f.label}</button>
  `).join("");

  const items = list.length
    ? list.map(renderNotif).join("")
    : `<div class="text-muted text-sm" style="padding:20px 4px">No notifications in this view.</div>`;

  container.innerHTML = `
    <div class="inbox">
      <div class="kh-head">
        <div>
          <h1>Inbox</h1>
          <div class="kh-sub">${unreadCount} unread · ${D.notifications.length} total</div>
        </div>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-secondary btn-sm" id="mark-all-read">${iconSvg("check", 14)} Mark all read</button>
      </div>
      <div class="inbox-filters">${filters}</div>
      <div class="inbox-list">${items}</div>
    </div>
  `;

  container.querySelectorAll(".if-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      renderNotifications();
    });
  });

  container.querySelectorAll(".inbox-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.notifId;
      const n = D.notifications.find(x => x.id === id);
      if (n) handleNotifClick(n);
      // Re-render sidebar to update unread badge
      if (window.app && window.app.refreshSidebar) window.app.refreshSidebar();
    });
  });

  const mark = document.getElementById("mark-all-read");
  if (mark) mark.addEventListener("click", () => {
    D.notifications.forEach(n => n.unread = false);
    renderNotifications();
    if (window.app && window.app.refreshSidebar) window.app.refreshSidebar();
  });
}
