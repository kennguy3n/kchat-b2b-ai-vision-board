// Sidebar rendering + interaction.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderWorkspaceHeader() {
  return `
    <div class="sb-head">
      <div class="sb-ws-logo">Ac</div>
      <div>
        <div class="sb-ws-name">${D.workspace.name}</div>
        <div class="sb-ws-tier">Business • ${D.workspace.memberCount} members</div>
      </div>
    </div>
    <div class="sb-search" role="search">
      ${iconSvg("search", 14)}
      <input placeholder="Search channels, people, docs" aria-label="Search"/>
      <span class="kbd">⌘K</span>
    </div>
  `;
}

function renderDomainSection(domain, state) {
  const chanItems = domain.channels.map(cid => {
    const c = D.channels[cid];
    const active = state.channelId === cid ? " active" : "";
    return `<div class="sb-item${active}" data-nav="channel" data-id="${cid}">
      <span class="hash">#</span>${c.name}
    </div>`;
  }).join("");
  const collapsed = state.collapsed.has(domain.id) ? " collapsed" : "";
  const domActive = state.domainId === domain.id && !state.channelId ? " active" : "";
  return `
    <div class="sb-domain${collapsed}${domActive ? "" : ""}" data-toggle-domain="${domain.id}" data-nav="domain" data-id="${domain.id}">
      <span class="chev">▾</span>
      <span class="name">${domain.name}</span>
    </div>
    <div class="sb-domain-body">${chanItems}</div>
  `;
}

function renderDMs() {
  return D.directMessages.map(dm => {
    const u = D.userById(dm.withUserId);
    const badge = dm.unread ? `<span class="badge">${dm.unread}</span>` : "";
    return `<div class="sb-item online" data-nav="dm" data-id="${dm.id}">
      <span class="status-dot"></span>${u.name}${badge}
    </div>`;
  }).join("");
}

function renderAIEmployees(state) {
  return D.aiEmployees.map(ai => {
    const active = state.aiEmployeeId === ai.id ? " active" : "";
    const idle = ai.status === "Idle" ? " idle" : "";
    const coolState = ai.budget?.cooldown?.state || "ready";
    const coolClass = coolState === "cooling-down" ? " cooling" : coolState === "throttled" ? " throttled" : "";
    const statusLc = (ai.status || "").toLowerCase();
    const alreadyMentions =
      (coolState === "cooling-down" && (statusLc.includes("cooling") || statusLc.includes("cool down"))) ||
      (coolState === "throttled" && statusLc.includes("throttl"));
    const coolDot = !alreadyMentions && coolState === "cooling-down" ? " · cooling"
                  : !alreadyMentions && coolState === "throttled" ? " · throttled"
                  : "";
    return `<div class="sb-ai${active}${idle}${coolClass}" data-nav="ai" data-id="${ai.id}">
      <div class="ai-avatar" style="background:${ai.color}">${ai.initials}</div>
      <div class="ai-meta">
        <div class="ai-name">${ai.name}</div>
        <div class="ai-sub">${ai.status}${coolDot}</div>
      </div>
      <div class="ai-status" title="${ai.status}"></div>
    </div>`;
  }).join("");
}

function renderFooter() {
  const me = D.userById(D.currentUserId);
  return `
    <div class="sb-foot">
      <div class="avatar md" style="background:${me.color}">${me.initials}</div>
      <div class="who">${me.name}<br><small>${me.role}</small></div>
      <button class="foot-gear" data-open-settings title="Settings">${iconSvg("gear", 16)}</button>
    </div>
  `;
}

export function renderSidebar(state) {
  const el = document.getElementById("sidebar");
  if (!el) return;
  el.setAttribute("role", "navigation");
  el.setAttribute("aria-label", "Workspace navigation");
  const sections = [
    { id: "channels", title: "Domains", body: D.domains.map(d => renderDomainSection(d, state)).join("") },
    { id: "dms",      title: "Direct Messages", body: renderDMs() },
    { id: "ai",       title: "AI Employees", body: renderAIEmployees(state) },
  ];
  const unread = D.unreadNotificationCount();
  const inboxBadge = unread > 0 ? `<span class="ib-badge">${unread}</span>` : "";
  el.innerHTML = `
    ${renderWorkspaceHeader()}
    <div class="sb-scroll">
      <div class="sb-section" data-section="home">
        <div class="sb-item${state.screen === "workspace-home" ? " active" : ""}" data-nav="home">
          ${iconSvg("home", 14)} Home
        </div>
        <div class="sb-inbox${state.screen === "notifications" ? " active" : ""}" data-nav="inbox" role="button" aria-label="Open inbox">
          <span class="ib-icon">${iconSvg("inbox", 14)}</span>Inbox${inboxBadge}
        </div>
        <div class="sb-item" data-nav="tasks">
          ${iconSvg("tasks", 14)} My Tasks
        </div>
        <div class="sb-item" data-nav="approvals">
          ${iconSvg("approve", 14)} Approvals
        </div>
        <div class="sb-item" data-nav="artifacts">
          ${iconSvg("doc", 14)} Artifacts
        </div>
        <div class="sb-item${state.screen === "connectors" ? " active" : ""}" data-nav="connectors">
          ${iconSvg("gear", 14)} Connectors
        </div>
      </div>
      ${sections.map(s => `
        <div class="sb-section${state.collapsed.has(s.id) ? " collapsed" : ""}" data-section="${s.id}">
          <div class="sb-section-title" data-toggle-section="${s.id}">
            <span class="chev">▾</span>${s.title}
          </div>
          <div class="sb-section-body">${s.body}</div>
        </div>
      `).join("")}
    </div>
    ${renderFooter()}
  `;
  wireSidebarEvents();
}

function wireSidebarEvents() {
  const el = document.getElementById("sidebar");
  if (!el) return;

  el.querySelectorAll("[data-toggle-section]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle-section");
      window.app.toggleSection(id);
    });
  });
  el.querySelectorAll("[data-toggle-domain]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // only toggle if clicking the chevron area, otherwise navigate too
      e.stopPropagation();
      const id = btn.getAttribute("data-toggle-domain");
      window.app.toggleSection(id);
    });
  });
  el.querySelectorAll("[data-nav]").forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const kind = item.getAttribute("data-nav");
      const id = item.getAttribute("data-id");
      switch (kind) {
        case "home":     window.app.navigateTo("workspace-home"); break;
        case "inbox":    window.app.navigateTo("notifications"); break;
        case "connectors": window.app.navigateTo("connectors"); break;
        case "tasks":    window.app.navigateTo("channel-chat", { channelId: "c-vendor" }, () => window.app.openRightView("task-panel")); break;
        case "approvals":window.app.navigateTo("channel-chat", { channelId: "c-vendor" }, () => window.app.openRightView("approval-review", { approvalId: "ap-orbix" })); break;
        case "artifacts":window.app.navigateTo("channel-chat", { channelId: "c-specs" }, () => window.app.openRightView("output-review", { artifactId: "a-prd-vendor-portal" })); break;
        case "domain":   window.app.navigateTo("domain-view", { domainId: id }); break;
        case "channel":  window.app.navigateTo("channel-chat", { channelId: id }); break;
        case "dm":       window.app.navigateTo("channel-chat", { channelId: "c-vendor" }); break; // demo: reuse channel view
        case "ai":       window.app.navigateTo("ai-employee", { aiEmployeeId: id }); break;
      }
    });
  });
  const gear = el.querySelector("[data-open-settings]");
  if (gear) gear.addEventListener("click", () => window.app.openSettings());
}
