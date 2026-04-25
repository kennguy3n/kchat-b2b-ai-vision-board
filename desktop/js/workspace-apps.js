// Top-level consolidated views for Email, Calendar, and Drive.
// Each view is a full-page screen aggregating data across every channel
// the current user has access to, in addition to the channel-scoped
// right-panel views surfaced from chat.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

/* ------------------------------ helpers ------------------------------ */

function channelChip(channelId) {
  const ch = D.channelById(channelId);
  if (!ch) return "";
  return `<button class="wa-chan-chip" data-channel="${channelId}" title="Open #${ch.name}">#${ch.name}</button>`;
}

function privacyBadge(mode) {
  if (!mode) return "";
  return `<span class="privacy-badge" title="${mode}">${iconSvg("shield", 10)} ${mode}</span>`;
}

function fileIcon(type) {
  const map = { pdf: "PDF", spreadsheet: "XLS", archive: "ZIP", presentation: "PPT", doc: "DOC", csv: "CSV" };
  return map[type] || (type || "FILE").slice(0, 3).toUpperCase();
}

function wireChannelChips(container) {
  container.querySelectorAll("[data-channel]").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.getAttribute("data-channel");
      window.app.navigateTo("channel-chat", { channelId: id });
    });
  });
}

/* ------------------------------ Email ------------------------------ */

let mailFolder = "inbox"; // inbox | unread | flagged | sent

function renderMailApp() {
  const container = document.getElementById("screen-mail-app");
  if (!container) return;

  const all = Object.values(D.emailThreads);
  const unread = all.filter(e => !e.isRead);
  const list = mailFolder === "unread" ? unread : all;
  // Sort: unread first, then by id (proxy for time) descending
  const sorted = [...list].sort((a, b) => {
    if ((a.isRead ? 1 : 0) !== (b.isRead ? 1 : 0)) return a.isRead ? 1 : -1;
    return a.id < b.id ? 1 : -1;
  });
  const focusId = sorted[0]?.id;
  const focused = D.emailById(focusId);

  const folders = [
    { id: "inbox",   label: "Inbox",   count: all.length, icon: "inbox" },
    { id: "unread",  label: "Unread",  count: unread.length, icon: "mail" },
    { id: "flagged", label: "Flagged", count: 0, icon: "pin" },
    { id: "sent",    label: "Sent",    count: 0, icon: "send" },
  ];

  const folderHTML = folders.map(f => `
    <button class="wa-folder ${mailFolder === f.id ? "active" : ""}" data-folder="${f.id}">
      ${iconSvg(f.icon, 14)}
      <span>${f.label}</span>
      ${f.count ? `<span class="wa-folder-count">${f.count}</span>` : ""}
    </button>
  `).join("");

  const labels = [
    { name: "Vendor Mgmt", color: "#7c3aed" },
    { name: "Sales / CRM", color: "#10b981" },
    { name: "Finance",     color: "#14b8a6" },
  ];

  const labelHTML = labels.map(l => `
    <button class="wa-label">
      <span class="wa-label-dot" style="background:${l.color}"></span>
      <span>${l.name}</span>
    </button>
  `).join("");

  const rowHTML = sorted.map(e => {
    const ch = D.channelById(e.channelId);
    const isFocus = e.id === focusId;
    const attach = (e.attachments || []).length
      ? `<span class="wm-attach" title="${e.attachments.length} attachment">${iconSvg("attach", 11)}</span>`
      : "";
    return `
      <div class="wm-row${isFocus ? " selected" : ""}${e.isRead ? "" : " unread"}" data-email-id="${e.id}">
        <span class="wm-dot" aria-hidden="true"></span>
        <div class="wm-from">
          <div class="wm-name">${e.from.split("@")[0]}</div>
          <div class="wm-domain">${e.from}</div>
        </div>
        <div class="wm-body">
          <div class="wm-subject">${e.subject}</div>
          <div class="wm-snippet">${e.snippet}</div>
          <div class="wm-meta">${ch ? `<span class="wm-chan">#${ch.name}</span>` : ""} ${attach}</div>
        </div>
        <div class="wm-ts">${e.receivedAt}</div>
      </div>
    `;
  }).join("");

  const detail = focused ? renderMailDetail(focused) : `<div class="list-empty">Select an email.</div>`;

  container.innerHTML = `
    <div class="wa-app wa-mail">
      <aside class="wa-sidebar">
        <button class="wa-compose">${iconSvg("plus", 14)} Compose</button>
        <div class="wa-folders">${folderHTML}</div>
        <div class="wa-section-label">Labels</div>
        <div class="wa-folders">${labelHTML}</div>
        <div class="wa-foot">
          ${iconSvg("shield", 11)}
          <span>KMail · Standard Private</span>
        </div>
      </aside>

      <section class="wa-list">
        <div class="wa-list-head">
          <h2>${folders.find(f => f.id === mailFolder).label}</h2>
          <span class="wa-list-sub">${sorted.length} thread${sorted.length === 1 ? "" : "s"} · across ${new Set(all.map(e => e.channelId)).size} channels</span>
          <span class="spacer" style="flex:1"></span>
          <button class="icon-btn" title="Search">${iconSvg("search", 14)}</button>
          <button class="icon-btn" title="Filter">${iconSvg("filter", 14)}</button>
        </div>
        <div class="wa-list-body">${rowHTML || `<div class="list-empty">No threads.</div>`}</div>
      </section>

      <section class="wa-detail">${detail}</section>
    </div>
  `;

  container.querySelectorAll("[data-folder]").forEach(btn => {
    btn.addEventListener("click", () => { mailFolder = btn.dataset.folder; renderMailApp(); });
  });
  container.querySelectorAll(".wm-row").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.dataset.emailId;
      const e = D.emailById(id); if (e) e.isRead = true;
      // re-render with this row focused
      container.querySelectorAll(".wm-row").forEach(r => r.classList.remove("selected"));
      row.classList.add("selected");
      const detailEl = container.querySelector(".wa-detail");
      if (detailEl && e) detailEl.innerHTML = renderMailDetail(e);
      wireMailDetail(container);
    });
  });
  wireMailDetail(container);
  const compose = container.querySelector(".wa-compose");
  if (compose) compose.addEventListener("click", () => showToast("Compose: AI will draft from your last 10 messages…"));
}

function renderMailDetail(e) {
  const ch = D.channelById(e.channelId);
  const attachList = (e.attachments || []).map(a =>
    `<div class="wm-file">${iconSvg("attach", 12)} <span>${a.name}</span><span class="text-xs text-muted">${a.size}</span></div>`
  ).join("");
  return `
    <div class="wm-detail">
      <div class="wm-detail-head">
        <div class="wm-detail-subject">${e.subject}</div>
        <div class="wm-detail-meta">
          <span><b>${e.from}</b> → ${e.to}</span>
          <span class="wm-detail-ts">${e.receivedAt}</span>
        </div>
        <div class="wm-detail-tags">
          ${ch ? `<button class="wa-chan-chip" data-channel="${ch.id}" title="Open #${ch.name}">#${ch.name}</button>` : ""}
          ${privacyBadge(e.privacyMode)}
        </div>
      </div>
      <div class="wm-detail-body">
        <p>${e.snippet}</p>
        <div class="em-ai-summary">
          ${iconSvg("ai", 12)}
          <span><b>AI summary:</b> ${e.aiSummary}</span>
        </div>
        ${attachList ? `<div class="em-files">${attachList}</div>` : ""}
      </div>
      <div class="wm-detail-actions">
        <button class="btn btn-primary btn-sm" data-act="reply">${iconSvg("reply", 12)} Reply</button>
        <button class="btn btn-secondary btn-sm" data-act="forward">${iconSvg("send", 12)} Forward to chat</button>
        <button class="btn btn-secondary btn-sm" data-act="archive">${iconSvg("download", 12)} Archive</button>
      </div>
    </div>
  `;
}

function wireMailDetail(container) {
  container.querySelectorAll(".wa-detail [data-act]").forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.dataset.act;
      const msg = a === "reply" ? "Drafting reply with AI context from this thread…"
                : a === "forward" ? "Forwarded — opening channel composer…"
                : "Archived";
      showToast(msg);
    });
  });
  wireChannelChips(container);
}

/* ----------------------------- Calendar ----------------------------- */

function renderCalendarApp() {
  const container = document.getElementById("screen-calendar-app");
  if (!container) return;

  const events = D.calendarEvents.slice();
  // Group: today / this week / upcoming
  const today = events.filter(e => /Today/i.test(e.time));
  const thisWeek = events.filter(e => !/Today|Tomorrow/i.test(e.time));
  const tomorrow = events.filter(e => /Tomorrow/i.test(e.time));

  const counts = {
    meetings: events.filter(e => e.type === "meeting").length,
    deadlines: events.filter(e => e.type === "deadline").length,
  };

  const renderEv = (ev) => {
    const ch = D.channelById(ev.channelId);
    const avatars = (ev.attendees || []).slice(0, 4).map(uid => {
      const u = D.userById(uid);
      if (!u) return "";
      return `<span class="avatar sm" style="background:${u.color}" title="${u.name}">${u.initials}</span>`;
    }).join("");
    return `
      <div class="wc-event wc-${ev.type}" data-event-id="${ev.id}">
        <div class="wc-time">
          <div class="wc-time-main">${ev.time}</div>
          <div class="wc-time-sub">${ev.duration}</div>
        </div>
        <div class="wc-bar"></div>
        <div class="wc-meta">
          <div class="wc-title">${ev.title} <span class="status-pill ${ev.type}">${ev.type}</span></div>
          <div class="wc-row">
            <div class="avatar-stack">${avatars}</div>
            ${ch ? `<button class="wa-chan-chip" data-channel="${ch.id}">#${ch.name}</button>` : ""}
          </div>
          ${ev.aiNote ? `<div class="wc-ai"><em>${iconSvg("ai", 11)} ${ev.aiNote}</em></div>` : ""}
        </div>
      </div>
    `;
  };

  // Today summary card with hour grid (just visual)
  const hourSlots = ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM"];
  const hourMarkers = hourSlots.map(h => `<div class="wc-hour"><span>${h}</span></div>`).join("");
  const todayPlaced = today.map(ev => {
    // crude: place 2:00 PM at slot 3 etc.
    const m = /(\d{1,2})\s*([AaPp])M/.exec(ev.time) || [];
    const hr = parseInt(m[1] || "9", 10) + (/p/i.test(m[2] || "") && parseInt(m[1] || "0", 10) < 12 ? 12 : 0);
    const top = Math.max(0, ((hr - 8) / 8) * 100);
    return `<div class="wc-block wc-${ev.type}" style="top:${top}%" data-event-id="${ev.id}">
      <div class="wc-block-title">${ev.title}</div>
      <div class="wc-block-meta">${ev.time} · ${ev.duration}</div>
    </div>`;
  }).join("");

  container.innerHTML = `
    <div class="wa-app wa-calendar">
      <aside class="wa-sidebar">
        <button class="wa-compose">${iconSvg("plus", 14)} Schedule</button>
        <div class="wa-mini-cal">
          <div class="wa-mini-head">April 2026</div>
          <div class="wa-mini-grid">
            ${["S","M","T","W","T","F","S"].map(d => `<span class="wa-mini-dow">${d}</span>`).join("")}
            ${Array.from({length: 30}, (_, i) => {
              const day = i + 1;
              const today = day === 24 ? " today" : "";
              const dot = (day === 24 || day === 25 || day === 28 || day === 29) ? " has-event" : "";
              return `<span class="wa-mini-day${today}${dot}">${day}</span>`;
            }).join("")}
          </div>
        </div>
        <div class="wa-section-label">My calendars</div>
        <div class="wa-folders">
          <button class="wa-label"><span class="wa-label-dot" style="background:#6366f1"></span> Work</button>
          <button class="wa-label"><span class="wa-label-dot" style="background:#10b981"></span> Channels</button>
          <button class="wa-label"><span class="wa-label-dot" style="background:#f59e0b"></span> Deadlines</button>
        </div>
        <div class="wa-foot">${iconSvg("link", 11)} <span>Synced with KMail Calendar</span></div>
      </aside>

      <section class="wa-list wa-cal-main">
        <div class="wa-list-head">
          <h2>This week</h2>
          <span class="wa-list-sub">${events.length} events · ${counts.meetings} meetings · ${counts.deadlines} deadlines</span>
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn-secondary btn-sm">Day</button>
          <button class="btn btn-primary btn-sm">Week</button>
          <button class="btn btn-secondary btn-sm">Month</button>
        </div>

        <div class="wa-list-body">
          <div class="wc-today">
            <div class="wc-today-head">
              <div>
                <h3>Today · Friday, Apr 24</h3>
                <div class="wa-list-sub">${today.length} event${today.length === 1 ? "" : "s"}</div>
              </div>
              <span class="spacer" style="flex:1"></span>
            </div>
            <div class="wc-today-grid">
              ${hourMarkers}
              ${todayPlaced}
            </div>
          </div>

          ${tomorrow.length ? `
            <div class="wc-section-title">Tomorrow</div>
            ${tomorrow.map(renderEv).join("")}
          ` : ""}

          <div class="wc-section-title">Later this week</div>
          ${thisWeek.map(renderEv).join("") || `<div class="list-empty">No events.</div>`}
        </div>
      </section>
    </div>
  `;

  wireChannelChips(container);
  container.querySelectorAll(".wc-event, .wc-block").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = el.getAttribute("data-event-id");
      const ev = D.calendarEventById(id);
      if (ev?.channelId) {
        window.app.navigateTo("channel-chat", { channelId: ev.channelId }, () => {
          window.app.openRightView("calendar", { eventId: id });
        });
      }
    });
  });
  const compose = container.querySelector(".wa-compose");
  if (compose) compose.addEventListener("click", () => showToast("AI scheduling — checking attendee availability…"));
}

/* ------------------------------ Drive ------------------------------ */

let driveFilter = "all"; // all | recent | shared | aiGenerated | fromEmail

function renderDriveApp() {
  const container = document.getElementById("screen-drive-app");
  if (!container) return;

  // Flatten: every file from every channel folder
  const folders = Object.entries(D.driveFiles).map(([cid, folder]) => ({
    cid, folder,
  }));
  const allFiles = folders.flatMap(({ cid, folder }) =>
    (folder.files || []).map(f => ({ ...f, channelId: cid, folderName: folder.folderName }))
  );

  const filtered = (() => {
    switch (driveFilter) {
      case "aiGenerated": return allFiles.filter(f => f.aiGenerated);
      case "fromEmail":   return allFiles.filter(f => f.fromEmail);
      case "recent":      return allFiles.filter(f => /Today|Yesterday/.test(f.modified));
      case "shared":      return allFiles; // demo: all are shared in their channel
      default:            return allFiles;
    }
  })();

  const totalSize = folders.reduce((acc, { folder }) => {
    const m = /^([\d.]+)/.exec(folder.storageUsed || "0");
    return acc + (m ? parseFloat(m[1]) : 0);
  }, 0);

  const folderTabs = [
    { id: "all",         label: "All files",     count: allFiles.length, icon: "folder" },
    { id: "recent",      label: "Recent",        count: allFiles.filter(f => /Today|Yesterday/.test(f.modified)).length, icon: "thread" },
    { id: "shared",      label: "Shared",        count: allFiles.length, icon: "link" },
    { id: "aiGenerated", label: "AI generated",  count: allFiles.filter(f => f.aiGenerated).length, icon: "ai" },
    { id: "fromEmail",   label: "From email",    count: allFiles.filter(f => f.fromEmail).length, icon: "mail" },
  ];

  const folderTabHTML = folderTabs.map(t => `
    <button class="wa-folder ${driveFilter === t.id ? "active" : ""}" data-filter="${t.id}">
      ${iconSvg(t.icon, 14)}
      <span>${t.label}</span>
      ${t.count ? `<span class="wa-folder-count">${t.count}</span>` : ""}
    </button>
  `).join("");

  const channelFolders = folders.map(({ cid, folder }) => {
    const ch = D.channelById(cid);
    return `
      <button class="wa-label" data-channel="${cid}">
        <span class="wa-label-dot" style="background:#6366f1"></span>
        <span>${ch ? `#${ch.name}` : folder.folderName}</span>
        <span class="wa-folder-count">${folder.files?.length || 0}</span>
      </button>
    `;
  }).join("");

  // Build folder cards (channel folders) for the body header
  const folderCards = folders.map(({ cid, folder }) => {
    const ch = D.channelById(cid);
    return `
      <button class="wa-folder-card" data-channel="${cid}">
        <div class="wfc-icon">${iconSvg("folder", 18)}</div>
        <div>
          <div class="wfc-name">${ch ? `#${ch.name}` : folder.folderName}</div>
          <div class="wfc-meta">${folder.files?.length || 0} file${folder.files?.length === 1 ? "" : "s"} · ${folder.storageUsed || "—"}</div>
        </div>
      </button>
    `;
  }).join("");

  const fileRow = (f) => {
    const ch = D.channelById(f.channelId);
    const mod = f.modifiedBy ? D.userById(f.modifiedBy) || D.aiById(f.modifiedBy) : null;
    const modAvatar = mod
      ? `<span class="avatar sm" style="background:${mod.color || "#6b7280"}" title="${mod.name || ""}">${mod.initials || "·"}</span>`
      : `<span class="avatar sm" style="background:#8a93a6" title="From email">${iconSvg("attach", 10)}</span>`;
    const badges = [];
    if (f.aiGenerated) badges.push(`<span class="tag">AI generated</span>`);
    if (f.fromEmail)   badges.push(`<span class="tag">From email</span>`);
    return `
      <div class="wd-row" data-file-id="${f.id}">
        <div class="wd-icon">${fileIcon(f.type)}</div>
        <div class="wd-name">
          <div class="wd-name-main">${f.name}</div>
          <div class="wd-name-sub">${ch ? `<span class="wm-chan">#${ch.name}</span>` : ""} ${badges.join(" ")}</div>
        </div>
        <div class="wd-owner">${modAvatar}</div>
        <div class="wd-modified">${f.modified}</div>
        <div class="wd-size">${f.size}</div>
        <div class="wd-priv">${privacyBadge(f.privacyMode)}</div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="wa-app wa-drive">
      <aside class="wa-sidebar">
        <button class="wa-compose">${iconSvg("plus", 14)} Upload</button>
        <div class="wa-folders">${folderTabHTML}</div>
        <div class="wa-section-label">Channel folders</div>
        <div class="wa-folders">${channelFolders}</div>
        <div class="wa-foot">
          ${iconSvg("shield", 11)}
          <span>ZK Object Fabric · Managed Encrypted · ${totalSize.toFixed(1)} MB used</span>
        </div>
      </aside>

      <section class="wa-list wa-drive-main">
        <div class="wa-list-head">
          <h2>${folderTabs.find(t => t.id === driveFilter).label}</h2>
          <span class="wa-list-sub">${filtered.length} file${filtered.length === 1 ? "" : "s"} · across ${folders.length} channels</span>
          <span class="spacer" style="flex:1"></span>
          <button class="icon-btn" title="Sort">${iconSvg("sort", 14)}</button>
          <button class="icon-btn" title="Filter">${iconSvg("filter", 14)}</button>
        </div>

        ${driveFilter === "all" ? `
          <div class="wa-folder-grid">${folderCards}</div>
          <div class="wc-section-title">All files</div>
        ` : ""}

        <div class="wa-list-body wd-table">
          <div class="wd-row wd-head">
            <div class="wd-icon"></div>
            <div class="wd-name">Name</div>
            <div class="wd-owner">Owner</div>
            <div class="wd-modified">Modified</div>
            <div class="wd-size">Size</div>
            <div class="wd-priv">Privacy</div>
          </div>
          ${filtered.map(fileRow).join("") || `<div class="list-empty">No files match this filter.</div>`}
        </div>
      </section>
    </div>
  `;

  container.querySelectorAll("[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => { driveFilter = btn.dataset.filter; renderDriveApp(); });
  });
  wireChannelChips(container);
  container.querySelectorAll(".wd-row[data-file-id]").forEach(row => {
    row.addEventListener("click", () => {
      const fid = row.dataset.fileId;
      const file = Object.values(D.driveFiles).flatMap(f => f.files || []).find(f => f.id === fid);
      showToast(`Previewing ${file?.name || "file"} — encrypted at rest`);
    });
  });
  const upload = container.querySelector(".wa-compose");
  if (upload) upload.addEventListener("click", () => showToast("Upload: files encrypt client-side before leaving your device"));
}

export { renderMailApp, renderCalendarApp, renderDriveApp };
