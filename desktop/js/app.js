// Entry point: state machine, routing, and screen wiring for the desktop demo.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { initModals, openModal, closeModal, closeAllModals } from "./modals.js";
import { renderSidebar } from "./navigation.js";
import { renderChannel } from "./chat.js";
import { renderThread } from "./threads.js";
import { renderTaskPanel, renderTaskDetail, renderForm, renderBase, renderSheet } from "./kapps.js";
import { openActionLauncher, renderBrief, renderProcessing, renderOutputReview, renderSummary, renderAIProcessingScreen, renderAIOutputReviewScreen } from "./ai-actions.js";
import { renderAIEmployee } from "./ai-employees.js";
import { renderArtifactWorkspace } from "./artifacts.js";
import { renderSlideWorkspace } from "./slides.js";
import { renderApprovalForm, renderApprovalReview } from "./approvals.js";
import { openSettings } from "./settings.js";
import { renderTemplateIntake } from "./templates.js";
import { renderKnowledge } from "./knowledge.js";
import { renderConnectors } from "./connectors.js";
import { renderNotifications } from "./notifications.js";
import { showToast } from "./transitions.js";
import { startOnboarding } from "./onboarding.js";

/* ---------- State ---------- */
const state = {
  screen: "login",           // login | workspace-home | domain-view | channel-chat | thread-detail | ai-employee | artifact-workspace | template-intake | ai-processing | ai-output-review | notifications | channel-knowledge | connectors
  domainId: null,
  channelId: null,
  threadId: null,
  aiEmployeeId: null,
  artifactId: null,
  templateId: null,
  recipeId: null,
  rightView: null,           // brief | processing | output-review | task-panel | task-detail | form | base | sheet | approval-form | approval-review | summary
  collapsed: new Set(),      // section / domain ids that are collapsed in sidebar
};
window.app = {
  state,
  navigateTo,
  openRightView,
  closeRightView,
  expandRightView,
  openActionLauncher: () => openActionLauncher(),
  openSettings: () => openSettings(),
  toggleSection,
  refreshSidebar: () => renderSidebar(state),
  startOnboarding: (opts) => startOnboarding(opts),
};

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", init);

function init() {
  initModals();
  wireLoginScreen();
  wireHomeScreen();
  wireDomainScreen();
  wirePublishConfirm();
  wireTopbarBackForward();

  // Restore last screen from localStorage (except never restore to processing or login)
  const saved = safeGetLastScreen();
  if (saved && saved.screen && saved.screen !== "login" && saved.screen !== "ai-processing") {
    navigateTo(saved.screen, saved.params || {});
  } else {
    navigateTo("login");
  }
}

function safeGetLastScreen() {
  try {
    const v = localStorage.getItem("kchat.lastScreen");
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function persistLastScreen() {
  try {
    localStorage.setItem("kchat.lastScreen", JSON.stringify({
      screen: state.screen,
      params: {
        domainId: state.domainId,
        channelId: state.channelId,
        threadId: state.threadId,
        aiEmployeeId: state.aiEmployeeId,
        artifactId: state.artifactId,
        templateId: state.templateId,
        recipeId: state.recipeId,
      },
    }));
  } catch {}
}

/* ---------- Navigation ---------- */
function navigateTo(screenId, params = {}, afterRender) {
  // Merge params into state
  if (params.domainId)     state.domainId     = params.domainId;
  if (params.channelId)    state.channelId    = params.channelId;
  if (params.threadId)     state.threadId     = params.threadId;
  if (params.aiEmployeeId) state.aiEmployeeId = params.aiEmployeeId;
  if (params.artifactId)   state.artifactId   = params.artifactId;
  if (params.templateId)   state.templateId   = params.templateId;
  if (params.recipeId)     state.recipeId     = params.recipeId;

  state.screen = screenId;

  // Close right panel on screen changes unless explicitly keeping it
  if (!params.keepRight) {
    state.rightView = null;
  }

  applyShellForScreen(screenId);
  showScreen(screenId);
  renderScreen(screenId);
  persistLastScreen();

  // pushState for back/forward
  try {
    history.pushState({ screenId, ...params }, "", `#${screenId}`);
  } catch {}

  if (typeof afterRender === "function") afterRender();
}

function applyShellForScreen(screenId) {
  const app = document.getElementById("app");
  const work = document.getElementById("workarea");
  const sidebar = document.getElementById("sidebar");

  if (screenId === "login") {
    app.classList.add("hidden");
  } else {
    app.classList.remove("hidden");
    app.classList.remove("no-sidebar");
    sidebar.classList.remove("hidden");
    work.classList.remove("hidden");
    renderSidebar(state);
  }

  // Right panel only applies inside chat-like screens
  const allowRight = ["channel-chat", "thread-detail", "ai-employee"].includes(screenId);
  if (!allowRight || !state.rightView) {
    work.classList.remove("with-right");
    work.classList.remove("right-expanded");
  } else {
    work.classList.add("with-right");
  }

  // Topbar content
  const tb = document.getElementById("topbar");
  if (tb) {
    tb.innerHTML = renderTopbar(screenId);
    wireTopbarBackForward();
  }
}

function renderTopbar(screenId) {
  let title = "KChat B2B";
  let sub = "";
  if (screenId === "workspace-home") { title = "Home"; sub = D.workspace.name; }
  if (screenId === "domain-view") {
    const d = D.domainById(state.domainId);
    title = d ? d.name : "Domain";
    sub = D.workspace.name;
  }
  if (screenId === "channel-chat") {
    const c = D.channelById(state.channelId);
    title = c ? "#" + c.name : "Channel";
    sub = D.workspace.name;
  }
  if (screenId === "thread-detail") {
    const t = D.threadById(state.threadId);
    title = t ? "Thread · " + t.title : "Thread";
    sub = "Threaded reply";
  }
  if (screenId === "ai-employee") {
    const a = D.aiById(state.aiEmployeeId);
    title = a ? a.name : "AI Employee";
    sub = "AI workforce";
  }
  if (screenId === "artifact-workspace") {
    const a = D.artifactById(state.artifactId);
    title = a ? a.title : "Artifact";
    sub = "Document workspace";
  }
  if (screenId === "slide-workspace") {
    const a = D.artifactById(state.artifactId);
    title = a ? a.title : "Slides";
    sub = "Slide workspace · Co-pilot";
  }
  if (screenId === "template-intake") {
    const t = D.templateById(state.templateId);
    title = t ? "Create: " + t.name : "Create from template";
    sub = "Template intake";
  }
  if (screenId === "ai-processing") {
    title = "AI is working…";
    sub = "On-device AI";
  }
  if (screenId === "ai-output-review") {
    title = "Review AI draft";
    sub = "Output review";
  }
  if (screenId === "notifications") {
    title = "Inbox";
    sub = `${D.unreadNotificationCount()} unread`;
  }
  if (screenId === "channel-knowledge") {
    const c = D.channelById(state.channelId);
    title = c ? `#${c.name} · Knowledge` : "Channel Knowledge";
    sub = "Entities, graph, Q&A";
  }
  if (screenId === "connectors") {
    title = "Connectors";
    sub = "Company & personal";
  }

  const unread = D.unreadNotificationCount();
  const unreadBadge = unread > 0 ? `<span class="topbar-unread">${unread}</span>` : "";
  return `
    <span class="topbar-kmark" aria-label="KChat" title="KChat">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs><linearGradient id="kg-tb" x1="0" y1="0" x2="24" y2="24"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
        <rect width="24" height="24" rx="6" fill="url(#kg-tb)"/>
        <path d="M5 6v12M5 12l6-6M5 12l6 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <button class="icon-btn" id="topbar-back" title="Back">${iconSvg("back", 16)}</button>
    <div>
      <div class="topbar-title">${title}</div>
      <div class="topbar-sub">${sub}</div>
    </div>
    <span class="spacer"></span>
    <div class="top-search">
      ${iconSvg("search", 14)}
      <input placeholder="Search KChat"/>
      <span class="kbd">⌘K</span>
    </div>
    <div class="top-actions">
      <button class="badge-ai glossary-tip" type="button" data-tip="AI runs on your device. Chat data never leaves your workspace — no cloud training, no cross-tenant sharing.">${iconSvg("ai", 12)} On-device AI</button>
      <button class="icon-btn" id="topbar-inbox" title="Inbox" aria-label="Open inbox" style="position:relative">${iconSvg("inbox", 16)}${unreadBadge}</button>
      <div class="avatar sm" style="background:${D.userById(D.currentUserId).color}">${D.userById(D.currentUserId).initials}</div>
    </div>
  `;
}

function wireTopbarBackForward() {
  const back = document.getElementById("topbar-back");
  if (back) back.addEventListener("click", () => history.back());
  const inbox = document.getElementById("topbar-inbox");
  if (inbox) inbox.addEventListener("click", () => navigateTo("notifications"));
}

window.addEventListener("popstate", (e) => {
  const s = e.state;
  if (!s || !s.screenId) return;
  // avoid recursive pushState
  state.screen = s.screenId;
  if (s.channelId)     state.channelId     = s.channelId;
  if (s.domainId)      state.domainId      = s.domainId;
  if (s.threadId)      state.threadId      = s.threadId;
  if (s.aiEmployeeId)  state.aiEmployeeId  = s.aiEmployeeId;
  if (s.artifactId)    state.artifactId    = s.artifactId;
  if (s.templateId)    state.templateId    = s.templateId;
  if (s.recipeId)      state.recipeId      = s.recipeId;
  applyShellForScreen(s.screenId);
  showScreen(s.screenId);
  renderScreen(s.screenId);
});

/* ---------- Screen switching ---------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.classList.add("active");
}

function renderScreen(id) {
  switch (id) {
    case "login": /* static markup */ break;
    case "workspace-home":    renderWorkspaceHome(); break;
    case "domain-view":       renderDomainView(state.domainId); break;
    case "channel-chat":      renderChannel(state.channelId || "c-vendor"); break;
    case "thread-detail":     renderThread(state.threadId || "thread-vendor-tasks"); break;
    case "ai-employee":       renderAIEmployee(state.aiEmployeeId || "ai-kara"); break;
    case "artifact-workspace":renderArtifactWorkspace(state.artifactId || "a-prd-vendor-portal"); break;
    case "slide-workspace":   renderSlideWorkspace(state.artifactId || "a-qbr-globex"); break;
    case "template-intake":   renderTemplateIntake({ templateId: state.templateId, recipeId: state.recipeId }); break;
    case "ai-processing":     renderAIProcessingScreen({ templateId: state.templateId, recipeId: state.recipeId }); break;
    case "ai-output-review":  renderAIOutputReviewScreen({ templateId: state.templateId, recipeId: state.recipeId, artifactId: state.artifactId }); break;
    case "notifications":     renderNotifications(); break;
    case "channel-knowledge": renderKnowledge(state.channelId || "c-vendor"); break;
    case "connectors":        renderConnectors(); break;
  }
}

/* ---------- Right panel management ---------- */
function openRightView(name, params = {}) {
  state.rightView = name;
  const work = document.getElementById("workarea");
  work.classList.add("with-right");

  // Show the correct rp-view
  document.querySelectorAll(".rp-view").forEach(v => v.classList.remove("active"));
  const id = `rp-${name}`;
  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active");
    switch (name) {
      case "brief":           renderBrief(id, params); break;
      case "processing":      renderProcessing(id); break;
      case "output-review":   renderOutputReview(id, params); break;
      case "task-panel":      renderTaskPanel(id, params); break;
      case "task-detail":     renderTaskDetail(id, params); break;
      case "form":            renderForm(id); break;
      case "base":            renderBase(id); break;
      case "sheet":           renderSheet(id); break;
      case "approval-form":   renderApprovalForm(id); break;
      case "approval-review": renderApprovalReview(id, params); break;
      case "summary":         renderSummary(id); break;
    }
  }
  // wire close buttons once
  document.querySelectorAll("[data-close-right]").forEach(btn => {
    btn.addEventListener("click", closeRightView, { once: true });
  });
}

function closeRightView() {
  state.rightView = null;
  const work = document.getElementById("workarea");
  work.classList.remove("with-right");
  work.classList.remove("right-expanded");
  document.querySelectorAll(".rp-view").forEach(v => v.classList.remove("active"));
}

/* Expand or restore the right panel to take over the center column. Any
   [data-expand-right] button inside a right-view calls this to toggle. */
function expandRightView() {
  const work = document.getElementById("workarea");
  if (!work.classList.contains("with-right")) return;
  work.classList.toggle("right-expanded");
  const expanded = work.classList.contains("right-expanded");
  document.querySelectorAll("[data-expand-right]").forEach(btn => {
    btn.setAttribute("title", expanded ? "Collapse" : "Expand");
    btn.setAttribute("aria-label", expanded ? "Collapse right panel" : "Expand right panel");
    btn.innerHTML = iconSvg(expanded ? "collapse" : "expand", 14);
    btn.dataset.expanded = expanded ? "true" : "false";
  });
}

/* ---------- Sidebar section toggling ---------- */
function toggleSection(id) {
  if (state.collapsed.has(id)) state.collapsed.delete(id);
  else state.collapsed.add(id);
  renderSidebar(state);
}

/* ---------- Login ---------- */
function wireLoginScreen() {
  const btn = document.getElementById("login-continue");
  if (btn) btn.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("workspace-home");
    // First-run tour kicks off once the workspace home has painted.
    startOnboarding();
  });
}

/* ---------- Workspace Home ---------- */
function renderWorkspaceHome() {
  const container = document.getElementById("screen-workspace-home");
  const pendingApprovals = D.approvals ? Object.values(D.approvals).filter(a => a.status === "pending").length : 1;
  const dueTasks = D.tasks ? D.tasks.filter(t => t.status !== "done").length : 3;
  const unreadInbox = D.unreadNotificationCount ? D.unreadNotificationCount() : 0;

  container.innerHTML = `
    <div class="dash-wrap">
      <div class="hero">
        <h1>Welcome back, ${D.userById(D.currentUserId).name.split(" ")[0]}</h1>
        <p>3 domains · 7 channels · AI Employees: ${D.aiEmployees.length} active. On-device AI is preferred for ${D.workspace.name}.</p>
      </div>

      <div class="section-head">
        <h2>AI Employee <span class="section-sub">AI does it for you</span></h2>
        <span class="more" data-restart-tour title="Replay the product tour">Take the tour</span>
      </div>
      <div class="quick-actions">
        <div class="qa-item" data-qa="inbox">
          <div class="qa-icon">${iconSvg("inbox", 18)}</div>
          <div class="qa-label">Inbox</div>
          <div class="qa-count">${unreadInbox} unread</div>
        </div>
        <div class="qa-item" data-qa="tasks">
          <div class="qa-icon">${iconSvg("tasks", 18)}</div>
          <div class="qa-label">My Tasks</div>
          <div class="qa-count">${D.tasks.filter(t => t.ownerId === D.currentUserId && t.status !== 'done').length} open</div>
        </div>
        <div class="qa-item" data-qa="approvals">
          <div class="qa-icon">${iconSvg("approve", 18)}</div>
          <div class="qa-label">Approvals</div>
          <div class="qa-count">${pendingApprovals} pending</div>
        </div>
        <div class="qa-item" data-qa="create">
          <div class="qa-icon">${iconSvg("ai", 18)}</div>
          <div class="qa-label">Create with AI</div>
          <div class="qa-count">5 templates</div>
        </div>
      </div>

      <div class="section-head">
        <h2>AI Co-pilot <span class="section-sub">AI helps you do it — inline</span></h2>
      </div>
      <div class="quick-actions quick-actions-copilot">
        <div class="qa-item qa-copilot" data-qa="copilot-doc">
          <div class="qa-icon">${iconSvg("ai", 18)}</div>
          <div class="qa-label">Write a document</div>
          <div class="qa-count">Inline rewrite / tone / ghost</div>
        </div>
        <div class="qa-item qa-copilot" data-qa="copilot-slides">
          <div class="qa-icon">${iconSvg("ai", 18)}</div>
          <div class="qa-label">Design a deck</div>
          <div class="qa-count">Per-slide AI actions</div>
        </div>
        <div class="qa-item qa-copilot" data-qa="copilot-sheet">
          <div class="qa-icon">${iconSvg("ai", 18)}</div>
          <div class="qa-label">Analyze a spreadsheet</div>
          <div class="qa-count">NL formula bar + visualize</div>
        </div>
      </div>

      <div class="section-head"><h2>Domains</h2><span class="more">Explore all</span></div>
      <div class="grid-3">
        ${D.domains.map(d => {
          const cnames = d.channels.map(cid => "#" + D.channels[cid].name).slice(0,3);
          return `<div class="domain-card" data-domain-id="${d.id}">
            <div class="icon">${d.name[0]}</div>
            <h3>${d.name}</h3>
            <div class="ccount">${d.channels.length} channels</div>
            <div class="chip-row">
              ${cnames.map(c => `<span class="tag">${c}</span>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>

      <div class="section-head"><h2>Recent channels</h2><span class="more">See all</span></div>
      <div class="grid-2">
        ${["c-vendor", "c-specs", "c-deals", "c-logistics"].map(cid => {
          const c = D.channels[cid];
          const d = D.domainById(c.domainId);
          return `<div class="channel-row" data-channel-id="${cid}">
            <span class="ch-hash">#</span>
            <div>
              <div class="ch-name">${c.name}</div>
              <div class="ch-sub">${d.name} · ${c.description}</div>
            </div>
            <span class="mcount">${c.members} members</span>
            <span class="tag">Active</span>
          </div>`;
        }).join("")}
      </div>

      <div class="section-head"><h2>Pinned</h2></div>
      <div class="pinned-list">
        <div class="pinned-item" data-open-artifact="a-prd-vendor-portal">
          <div class="pi-icon">PRD</div>
          <div>
            <div class="pi-title">Vendor Portal v2 — PRD</div>
            <div class="pi-sub">Draft v1 · Nina PM AI</div>
          </div>
          <span class="tag">On-device AI</span>
        </div>
        <div class="pinned-item" data-open-approval="ap-orbix">
          <div class="pi-icon">AP</div>
          <div>
            <div class="pi-title">Orbix payment hold release</div>
            <div class="pi-sub">Pending your approval · $42,500</div>
          </div>
          <span class="status-pill pending">pending</span>
        </div>
        <div class="pinned-item" data-open-tasks>
          <div class="pi-icon">TK</div>
          <div>
            <div class="pi-title">Vendor review tasks</div>
            <div class="pi-sub">5 tasks extracted · 3 due this week</div>
          </div>
          <span class="tag">AI-extracted</span>
        </div>
      </div>
    </div>
  `;
  wireHomeScreen();
}

function wireHomeScreen() {
  document.querySelectorAll("[data-domain-id]").forEach(el => {
    el.addEventListener("click", () => navigateTo("domain-view", { domainId: el.getAttribute("data-domain-id") }));
  });
  document.querySelectorAll("[data-channel-id]").forEach(el => {
    el.addEventListener("click", () => navigateTo("channel-chat", { channelId: el.getAttribute("data-channel-id") }));
  });
  document.querySelectorAll("[data-open-artifact]").forEach(el => {
    el.addEventListener("click", () => navigateTo("channel-chat", { channelId: "c-specs" }, () => openRightView("output-review", { artifactId: el.getAttribute("data-open-artifact") })));
  });
  document.querySelectorAll("[data-open-approval]").forEach(el => {
    el.addEventListener("click", () => navigateTo("channel-chat", { channelId: "c-vendor" }, () => openRightView("approval-review", { approvalId: el.getAttribute("data-open-approval") })));
  });
  document.querySelectorAll("[data-open-tasks]").forEach(el => {
    el.addEventListener("click", () => navigateTo("channel-chat", { channelId: "c-vendor" }, () => openRightView("task-panel")));
  });
  document.querySelectorAll("[data-qa]").forEach(el => {
    el.addEventListener("click", () => {
      const kind = el.getAttribute("data-qa");
      if (kind === "approvals") navigateTo("channel-chat", { channelId: "c-vendor" }, () => openRightView("approval-review", { approvalId: "ap-orbix" }));
      else if (kind === "tasks") navigateTo("channel-chat", { channelId: "c-vendor" }, () => openRightView("task-panel"));
      else if (kind === "create") openActionLauncher();
      else if (kind === "inbox") navigateTo("notifications");
      else if (kind === "copilot-doc") navigateTo("artifact-workspace", { artifactId: "a-prd-vendor-portal" });
      else if (kind === "copilot-slides") navigateTo("slide-workspace", { artifactId: "a-qbr-globex" });
      else if (kind === "copilot-sheet") navigateTo("channel-chat", { channelId: "c-vendor" }, () => openRightView("sheet", { focusFormula: true }));
    });
  });
  const tourLink = document.querySelector("[data-restart-tour]");
  if (tourLink) tourLink.addEventListener("click", () => startOnboarding({ force: true }));
}

/* ---------- Domain View ---------- */
function renderDomainView(domainId) {
  const d = D.domainById(domainId) || D.domains[0];
  const container = document.getElementById("screen-domain-view");
  const chans = d.channels.map(cid => {
    const c = D.channels[cid];
    return `<div class="channel-row" data-channel-id="${cid}">
      <span class="ch-hash">#</span>
      <div>
        <div class="ch-name">${c.name}</div>
        <div class="ch-sub">${c.description}</div>
      </div>
      <span class="mcount">${c.members} members</span>
      <span class="tag">Active</span>
    </div>`;
  }).join("");

  container.innerHTML = `
    <div class="domain-header">
      <div class="big-icon">${d.name[0]}</div>
      <div>
        <h1>${d.name}</h1>
        <div class="sub">${d.channels.length} channels · policy: on-device AI preferred</div>
      </div>
      <span style="flex:1"></span>
      <button class="icon-btn" title="Domain settings">${iconSvg("gear", 16)}</button>
    </div>
    <div class="dash-wrap">
      <div class="section-head"><h2>Channels</h2><span class="more">+ New channel</span></div>
      <div class="grid-2">${chans}</div>

      <div class="section-head"><h2>Highlights</h2></div>
      <div class="grid-3">
        <div class="domain-card">
          <div class="icon">AI</div>
          <h3>AI drafts this week</h3>
          <div class="ccount">6 drafts · 4 reviewed</div>
          <div class="chip-row"><span class="tag">PRDs</span><span class="tag">Summaries</span></div>
        </div>
        <div class="domain-card">
          <div class="icon">AP</div>
          <h3>Approvals</h3>
          <div class="ccount">1 pending · 4 closed</div>
          <div class="chip-row"><span class="tag">$60k open</span></div>
        </div>
        <div class="domain-card">
          <div class="icon">RK</div>
          <h3>Risk register</h3>
          <div class="ccount">2 high · 3 medium</div>
          <div class="chip-row"><span class="tag">Base table</span></div>
        </div>
      </div>
    </div>
  `;
  wireDomainScreen();
}

function wireDomainScreen() {
  document.querySelectorAll("#screen-domain-view [data-channel-id]").forEach(el => {
    el.addEventListener("click", () => navigateTo("channel-chat", { channelId: el.getAttribute("data-channel-id") }));
  });
}

/* ---------- Publish confirm modal ---------- */
function wirePublishConfirm() {
  const btn = document.getElementById("publish-confirm-btn");
  if (btn) btn.addEventListener("click", () => {
    closeModal("publish-confirm");
    showToast("Published to #specs — artifact card posted.");
    // Route back to chat, where the card will appear
    navigateTo("channel-chat", { channelId: state.channelId || "c-specs" });
  });
}
