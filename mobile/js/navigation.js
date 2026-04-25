// Top bar + tab bar rendering. Reads from window.app.state to know which
// screen is active and what the current tab stack looks like.
import { iconSvg } from "../../desktop/js/icons.js";
import * as D from "../../desktop/js/demo-data.js";

const TABS = [
  { id: "chat",     icon: "thread",   label: "Chat" },
  { id: "ai",       icon: "sparkle",  label: "AI" },
  { id: "inbox",    icon: "inbox",    label: "Inbox" },
  { id: "activity", icon: "bell",     label: "Activity" },
  { id: "me",       icon: "briefcase",label: "Me" },
];

// Title resolver per screen. Handlers receive the global state and return
// either { title, subtitle?, action? } or just a plain string.
const TITLES = {
  "channel-list":  () => ({ title: D.workspace.name, action: { icon: "plus", id: "compose-new" } }),
  "channel-chat":  (s) => {
    const ch = D.channelById(s.channelId);
    return ch
      ? { title: `# ${ch.name}`, subtitle: `${ch.members} members` }
      : { title: "Channel" };
  },
  "thread-detail": (s) => {
    const t = D.threadById(s.threadId);
    return { title: "Thread", subtitle: t?.title || "" };
  },
  "ai-launcher":   () => ({ title: "AI Actions" }),
  "ai-brief":      (s) => ({ title: s.briefTemplate?.name ? `Create: ${s.briefTemplate.name}` : "Create" }),
  "ai-processing": () => ({ title: "AI is working…" }),
  "ai-output":     () => ({ title: "Review AI draft" }),
  "inbox":         () => {
    const c = D.actionRequiredCount();
    return { title: "Inbox", subtitle: c ? `${c} action required` : "" };
  },
  "activity":      () => ({ title: "Activity" }),
  "me":            () => ({ title: "You" }),
  "tasks":         () => ({ title: "Tasks" }),
  "task-detail":   (s) => {
    const t = D.tasks.find(x => x.id === s.taskId);
    return { title: t?.title ? "Task" : "Task", subtitle: t?.title || "" };
  },
  "approval-review": (s) => {
    const a = D.approvalById(s.approvalId);
    return { title: "Approval", subtitle: a?.title || "" };
  },
  "ai-employee":   (s) => {
    const a = D.aiById(s.aiEmployeeId);
    return { title: a?.name || "AI Employee", subtitle: a?.role || "" };
  },
};

export function renderTopbar(state) {
  const tb = document.getElementById("topbar");
  if (!tb) return;
  const desc = (TITLES[state.screen] || (() => ({ title: "" })))(state);
  const { title, subtitle, action } = desc;
  const stack = state.tabStacks[state.tab] || [];
  const canBack = stack.length > 1;

  tb.innerHTML = `
    <button class="tb-back" data-nav-action="back" aria-label="Back" ${canBack ? "" : "hidden"}>${iconSvg("back", 22)}</button>
    <div class="tb-title">
      <span>${title || ""}</span>
      ${subtitle ? `<span class="tb-sub">${subtitle}</span>` : ""}
    </div>
    <div class="tb-actions">
      ${action ? `<button class="tb-action" data-nav-action="${action.id}" aria-label="${action.id}">${iconSvg(action.icon, 22)}</button>` : ""}
    </div>
  `;
}

export function renderTabbar(state) {
  const bar = document.getElementById("tabbar");
  if (!bar) return;
  // Counts
  const unreadChannels = computeUnreadChannelCount();
  const inboxCount = D.actionRequiredCount();
  const counts = { chat: unreadChannels, inbox: inboxCount };

  bar.innerHTML = TABS.map(t => {
    const active = state.tab === t.id ? " active" : "";
    const c = counts[t.id];
    const badge = c ? `<span class="badge">${c > 9 ? "9+" : c}</span>` : "";
    return `
      <button class="tab-btn${active}" data-tab="${t.id}" role="tab" aria-selected="${state.tab === t.id}">
        <span class="ti">${iconSvg(t.icon, 22)}</span>
        <span class="tl">${t.label}</span>
        ${badge}
      </button>
    `;
  }).join("");
}

export function computeUnreadChannelCount() {
  // The desktop demo doesn't track per-channel unread; synthesize from DM
  // unreads + a fixed set of channels that have lively recent activity.
  const dmUnread = D.directMessages.filter(d => d.unread).length;
  const mentionChannels = new Set(
    D.notifications.filter(n => n.unread && n.channelId).map(n => n.channelId)
  );
  return dmUnread + mentionChannels.size;
}
