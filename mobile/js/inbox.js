// Inbox tab
import * as D from "../../desktop/js/demo-data.js";
import { iconSvg } from "../../desktop/js/icons.js";

const KIND_ICON = {
  mention:  "more",
  approval: "approve",
  ai:       "sparkle",
  thread:   "thread",
  budget:   "shield",
  email:    "send",
  calendar: "bell",
};
const KIND_LABEL = {
  mention:  "@",
  approval: "✓",
  ai:       "AI",
  thread:   "↩",
  budget:   "$",
  email:    "✉",
  calendar: "📅",
};

const FILTERS = [
  { id: "all",       label: "All" },
  { id: "mention",   label: "Mentions" },
  { id: "approval",  label: "Approvals" },
  { id: "ai",        label: "AI Updates" },
];

export function renderInbox(state) {
  const el = document.querySelector('[data-screen="inbox"]');
  if (!el) return;
  const f = state.inboxFilter || "all";
  const items = D.notifications.filter(n => f === "all" ? true : n.kind === f);
  const actionRequired = items.filter(n => n.unread && (n.kind === "approval" || n.kind === "mention" || (n.priority === "action")));
  const updates = items.filter(n => !actionRequired.includes(n));

  const row = (n) => `
    <div class="inbox-row k-${n.kind}${n.unread ? " unread" : ""}" data-action="open-notification" data-id="${n.id}">
      <div class="ib-icon">${KIND_LABEL[n.kind] || iconSvg(KIND_ICON[n.kind] || "bell", 14)}</div>
      <div>
        <div class="ib-title">${n.title}</div>
        <div class="ib-preview">${n.preview}</div>
      </div>
      <div class="ib-right">
        <span>${n.ts}</span>
        ${n.unread ? `<span class="unread-dot"></span>` : ""}
      </div>
    </div>
  `;

  el.innerHTML = `
    <div class="chip-row">
      ${FILTERS.map(x => `<button class="pill${f === x.id ? " active" : ""}" data-inbox-filter="${x.id}">${x.label}</button>`).join("")}
    </div>
    ${actionRequired.length ? `
      <div class="action-required-banner">${iconSvg("approve", 12)} Action required · ${actionRequired.length}</div>
      <div class="sec-head"><span>Action required</span></div>
      ${actionRequired.map(row).join("")}
    ` : ""}
    ${updates.length ? `
      <div class="sec-head"><span>Updates</span></div>
      ${updates.map(row).join("")}
    ` : ""}
    ${items.length === 0 ? `<div class="empty">Inbox is clear</div>` : ""}
  `;
}

export function wireInbox() {
  const el = document.querySelector('[data-screen="inbox"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const f = e.target.closest("[data-inbox-filter]")?.dataset.inboxFilter;
    if (f) { window.app.state.inboxFilter = f; renderInbox(window.app.state); return; }
    const id = e.target.closest("[data-id]")?.dataset.id;
    if (!id) return;
    const n = D.notifications.find(x => x.id === id);
    if (!n) return;
    n.unread = false;
    if (n.approvalId) { window.app.navigate("approval-review", { approvalId: n.approvalId }); return; }
    if (n.artifactId) { window.app.navigate("ai-output", { artifactId: n.artifactId }); return; }
    if (n.threadId)   { window.app.navigate("thread-detail", { threadId: n.threadId }); return; }
    if (n.aiEmployeeId) { window.app.navigate("ai-employee", { aiEmployeeId: n.aiEmployeeId }); return; }
    if (n.channelId)  {
      window.app.switchTab("chat");
      window.app.navigate("channel-chat", { channelId: n.channelId });
      return;
    }
  });
}
