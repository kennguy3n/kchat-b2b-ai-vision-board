// Sidebar rendering + interaction.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

function avatarHTML(user, size = "md") {
  const color = user.color || "#6b7280";
  return `<div class="avatar ${size}" style="background:${color}">${user.initials}</div>`;
}

function renderTenantBanner(tenant) {
  // KChat-style community banner: large tinted header with tenant name and a
  // chevron hint, sitting above the channel list. Gradient stands in for the
  // uploaded community cover image.
  const gradient = tenant.gradient || `linear-gradient(135deg, ${tenant.color}, #1d2030)`;
  return `
    <div class="sb-tenant">
      <div class="banner" style="background-image:${gradient}"></div>
      <div class="banner-overlay"></div>
      <div class="sb-tenant-meta">
        <div class="sb-tenant-name">${tenant.name} <span class="chev">›</span></div>
        <div class="sb-tenant-sub"><span>🌐</span> ${tenant.description}</div>
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
  const unreadChannels = new Set(["c-vendor", "c-specs"]);
  const chanItems = domain.channels.map(cid => {
    const c = D.channels[cid];
    if (!c) return "";
    const active = state.channelId === cid ? " active" : "";
    const hasUnread = unreadChannels.has(cid);
    const unreadClass = hasUnread ? " unread" : "";
    const unreadBadge = hasUnread ? `<span class="unread-dot" aria-hidden="true"></span>` : "";
    return `<div class="sb-item${active}${unreadClass}" data-nav="channel" data-id="${cid}">
      <span class="hash">#</span>${c.name}${unreadBadge}
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

function renderDMs(tenant) {
  const allowed = new Set(tenant.dmIds || []);
  const list = D.directMessages.filter(dm => allowed.has(dm.id));
  if (!list.length) {
    return `<div class="sb-section-empty">No direct messages in ${tenant.name}.</div>`;
  }
  return list.map(dm => {
    const u = D.userById(dm.withUserId);
    const badge = dm.unread ? `<span class="badge">${dm.unread}</span>` : "";
    return `<div class="sb-item online" data-nav="dm" data-id="${dm.id}">
      <span class="status-dot"></span>${u.name}${badge}
    </div>`;
  }).join("");
}

function renderAIEmployees(state, tenant) {
  const allowed = new Set(tenant.aiEmployeeIds || []);
  const list = D.aiEmployees.filter(ai => allowed.has(ai.id));
  if (!list.length) {
    return `<div class="sb-section-empty">No AI employees provisioned in ${tenant.name}.</div>`;
  }
  return list.map(ai => {
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

/* ---------- Tenant / community rail (far-left) ---------- */
export function renderTenantRail(state) {
  const el = document.getElementById("tenant-rail");
  if (!el) return;
  const items = D.tenants.map(t => {
    const active = t.id === state.tenantId ? " active" : "";
    const unread = (t.dmIds || []).reduce((n, id) => {
      const dm = D.directMessages.find(d => d.id === id);
      return n + (dm?.unread || 0);
    }, 0);
    const badge = unread > 0 ? `<span class="tr-unread" aria-hidden="true"></span>` : "";
    return `<button class="tr-item${active}" type="button"
              data-tenant-id="${t.id}" title="${t.name}"
              style="background:${t.gradient || t.color}">${t.initials}${badge}</button>`;
  }).join("");
  el.innerHTML = `
    <div class="tr-chat" title="Chats">${iconSvg("home", 18)}</div>
    <div class="tr-divider"></div>
    ${items}
    <div class="tr-spacer"></div>
    <div class="tr-foot">
      <button class="tr-item" type="button" title="Add community"
              style="background:#2e3348;color:var(--sb-text-mut);font-size:16px">+</button>
      <div class="tr-status" title="Online"></div>
    </div>
  `;
  el.querySelectorAll("[data-tenant-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-tenant-id");
      window.app.selectTenant(id);
    });
  });
}

export function renderSidebar(state) {
  const el = document.getElementById("sidebar");
  if (!el) return;
  el.setAttribute("role", "navigation");
  el.setAttribute("aria-label", "Workspace navigation");

  const tenant = D.tenantById(state.tenantId) || D.tenants[0];
  const tenantDomains = D.domains.filter(d =>
    (tenant.domainIds || []).includes(d.id),
  );
  const domainsBody = tenantDomains.length
    ? tenantDomains.map(d => renderDomainSection(d, state)).join("")
    : `<div class="sb-section-empty">No channels joined in ${tenant.name}.</div>`;

  const sections = [
    { id: "channels", title: "Channels",        body: domainsBody },
    { id: "dms",      title: "Direct Messages", body: renderDMs(tenant) },
    { id: "ai",       title: "AI Employees",    body: renderAIEmployees(state, tenant) },
  ];
  const unread = D.unreadNotificationCount();
  const inboxBadge = unread > 0 ? `<span class="ib-badge">${unread}</span>` : "";
  el.innerHTML = `
    ${renderTenantBanner(tenant)}
    <button class="sb-new-btn" id="sb-new-btn" type="button">
      ${iconSvg("plus", 14)} New
    </button>
    <div class="sb-scroll">
      <div class="sb-section" data-section="home">
        <div class="sb-item${state.screen === "workspace-home" ? " active" : ""}" data-nav="home">
          ${iconSvg("home", 14)} Home
        </div>
        <div class="sb-inbox${state.screen === "notifications" ? " active" : ""}" data-nav="inbox" role="button" aria-label="Open inbox">
          <span class="ib-icon">${iconSvg("inbox", 14)}</span>Inbox${inboxBadge}
        </div>
        <div class="sb-item" data-nav="my-work">
          ${iconSvg("briefcase", 14)} My Work
        </div>
        <div class="sb-item${state.screen === "template-gallery" ? " active" : ""}" data-nav="templates">
          ${iconSvg("ai", 14)} Templates
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
        case "my-work":  window.app.navigateTo("workspace-home", { workTab: "tasks" }); break;
        case "templates":window.app.navigateTo("template-gallery"); break;
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
  const newBtn = el.querySelector("#sb-new-btn");
  if (newBtn) newBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.app.openActionLauncher();
  });
  const gear = el.querySelector("[data-open-settings]");
  if (gear) gear.addEventListener("click", () => window.app.openSettings());
}
