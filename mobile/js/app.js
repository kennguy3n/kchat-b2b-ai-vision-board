// Mobile state machine + router. One state object, per-tab navigation
// stacks, screen switching via [data-screen] and [data-tab] attributes.

import * as D from "../../desktop/js/demo-data.js";
import { renderTopbar, renderTabbar } from "./navigation.js";
import { renderChannelList, wireChannelList, renderChannelChat, wireChannelChat } from "./channels.js";
import { renderThreadDetail, wireThreadDetail } from "./thread.js";
import {
  renderAILauncher, wireAILauncher,
  renderBrief, wireBrief,
  renderProcessing,
  renderOutput, wireOutput,
} from "./ai-actions.js";
import { renderInbox, wireInbox } from "./inbox.js";
import { renderActivity, wireActivity } from "./activity.js";
import { renderMe, wireMe } from "./profile.js";
import {
  renderTasks, wireTasks,
  renderTaskDetail, wireTaskDetail,
  renderApprovalReview, wireApprovalReview,
  renderAIEmployee,
} from "./kapps.js";
import { initSheet, closeSheet } from "./sheets.js";
import { pushAnim } from "./transitions.js";

/* ---------- State ---------- */
const TAB_ROOTS = {
  chat:     "channel-list",
  ai:       "ai-launcher",
  inbox:    "inbox",
  activity: "activity",
  me:       "me",
};

const state = {
  tab: "chat",
  screen: "channel-list",
  tabStacks: {
    chat:     [{ screen: "channel-list", params: {} }],
    ai:       [{ screen: "ai-launcher",  params: {} }],
    inbox:    [{ screen: "inbox",        params: {} }],
    activity: [{ screen: "activity",     params: {} }],
    me:       [{ screen: "me",           params: {} }],
  },
  // Domain-level state (mirrors desktop fields).
  tenantId: D.primaryTenantId(),
  channelId: null,
  threadId: null,
  taskId: null,
  approvalId: null,
  artifactId: null,
  aiEmployeeId: null,
  briefTemplate: null,
  aiIntent: null,
  inboxFilter: "all",
  taskFilter: "all",
  collapsed: new Set(),
  approvalDecision: null,
};

window.app = {
  state,
  navigate,
  back,
  switchTab,
  replaceCurrent,
  refreshAll,
};

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", init);

function init() {
  initSheet();
  wireGlobal();

  // Wire every screen once. Render-on-demand happens in render().
  wireChannelList();
  wireChannelChat();
  wireThreadDetail();
  wireAILauncher();
  wireBrief();
  wireOutput();
  wireInbox();
  wireActivity();
  wireMe();
  wireTasks();
  wireTaskDetail();
  wireApprovalReview();

  // Restore last screen if reasonable
  const saved = safeGetLastScreen();
  if (saved && saved.tab && TAB_ROOTS[saved.tab]) {
    state.tab = saved.tab;
    if (saved.tabStacks) state.tabStacks = saved.tabStacks;
    if (typeof saved.tenantId === "string") state.tenantId = saved.tenantId;
  }
  // Always start at the root of the active tab — no half-states.
  const top = currentEntry();
  applyEntryState(top);
  renderActiveScreen();
  renderTopbar(state);
  renderTabbar(state);
}

function wireGlobal() {
  // Tab bar
  document.getElementById("tabbar").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]")?.dataset.tab;
    if (t) switchTab(t);
  });
  // Top bar back / right action
  document.getElementById("topbar").addEventListener("click", (e) => {
    const action = e.target.closest("[data-nav-action]")?.dataset.navAction;
    if (action === "back") back();
    if (action === "compose-new") { /* compose new message — demo only */ }
  });
}

/* ---------- Persistence ---------- */
function safeGetLastScreen() {
  try {
    const raw = localStorage.getItem("kchat.mobile.lastScreen");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function persist() {
  try {
    localStorage.setItem("kchat.mobile.lastScreen", JSON.stringify({
      tab: state.tab,
      tabStacks: state.tabStacks,
      tenantId: state.tenantId,
    }));
  } catch {}
}

/* ---------- Navigation ---------- */
function currentEntry() {
  const stack = state.tabStacks[state.tab];
  return stack[stack.length - 1];
}
function applyEntryState(entry) {
  const p = entry.params || {};
  state.screen = entry.screen;
  if ("channelId" in p)     state.channelId = p.channelId;
  if ("threadId" in p)      state.threadId = p.threadId;
  if ("taskId" in p)        state.taskId = p.taskId;
  if ("approvalId" in p)    state.approvalId = p.approvalId;
  if ("artifactId" in p)    state.artifactId = p.artifactId;
  if ("aiEmployeeId" in p)  state.aiEmployeeId = p.aiEmployeeId;
  if ("briefTemplate" in p) state.briefTemplate = p.briefTemplate;
}

function navigate(screen, params = {}) {
  // Pushed views inherit params from previous state.
  const stack = state.tabStacks[state.tab];
  stack.push({ screen, params });
  applyEntryState({ screen, params });
  state.approvalDecision = null;
  closeSheet();
  renderActiveScreen({ animate: true });
  renderTopbar(state);
  renderTabbar(state);
  persist();
}

function replaceCurrent(screen, params = {}) {
  const stack = state.tabStacks[state.tab];
  if (stack.length > 0) stack.pop();
  stack.push({ screen, params });
  applyEntryState({ screen, params });
  renderActiveScreen({ animate: true });
  renderTopbar(state);
  renderTabbar(state);
  persist();
}

function back() {
  const stack = state.tabStacks[state.tab];
  if (stack.length <= 1) return;
  stack.pop();
  const top = stack[stack.length - 1];
  applyEntryState(top);
  renderActiveScreen();
  renderTopbar(state);
  renderTabbar(state);
  persist();
}

function switchTab(tabId) {
  if (!TAB_ROOTS[tabId]) return;
  state.tab = tabId;
  const top = currentEntry();
  applyEntryState(top);
  renderActiveScreen();
  renderTopbar(state);
  renderTabbar(state);
  persist();
}

/* ---------- Screen rendering ---------- */

const RENDERERS = {
  "channel-list":  renderChannelList,
  "channel-chat":  renderChannelChat,
  "thread-detail": renderThreadDetail,
  "ai-launcher":   renderAILauncher,
  "ai-brief":      renderBrief,
  "ai-processing": renderProcessing,
  "ai-output":     renderOutput,
  "inbox":         renderInbox,
  "activity":      renderActivity,
  "me":            renderMe,
  "tasks":         renderTasks,
  "task-detail":   renderTaskDetail,
  "approval-review": renderApprovalReview,
  "ai-employee":   renderAIEmployee,
};

function renderActiveScreen({ animate = false } = {}) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(s => s.classList.remove("active"));

  const target = document.querySelector(`.screen[data-screen="${state.screen}"]`);
  if (!target) return;
  const renderer = RENDERERS[state.screen];
  if (renderer) renderer(state);
  target.classList.add("active");
  if (animate) pushAnim(target);
}

function refreshAll() {
  // Re-render the currently active screen and topbar (used after tenant
  // switches to refresh content scoped by tenant).
  renderActiveScreen();
  renderTopbar(state);
  renderTabbar(state);
}
