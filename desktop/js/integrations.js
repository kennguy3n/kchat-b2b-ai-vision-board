// Integrated workspace right-panel views (v0.5) — email, calendar, drive,
// business. Each view is channel-scoped so the surfaces mirror the chat
// context the user is currently in. All render fns use the existing
// rp-head / rp-body / rp-foot pattern so they slot into the right panel
// without any layout changes.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

function activeChannelId() {
  return window.app?.state?.channelId || "c-vendor";
}

function activeChannel() {
  return D.channelById(activeChannelId());
}

function expandBtnHTML() {
  return `<button class="icon-btn" data-expand-right title="Expand" aria-label="Expand right panel">${iconSvg("expand", 14)}</button>`;
}
function wireExpandButtons() {
  document.querySelectorAll("[data-expand-right]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.app.expandRightView();
    });
  });
}

function privacyBadge(mode) {
  if (!mode) return "";
  return `<span class="privacy-badge" title="${mode}">${iconSvg("shield", 10)} ${mode}</span>`;
}

function fileIcon(type) {
  const map = { pdf: "PDF", spreadsheet: "XLS", archive: "ZIP", presentation: "PPT", doc: "DOC", csv: "CSV" };
  return map[type] || (type || "FILE").slice(0, 3).toUpperCase();
}

/* ---------------- Email panel (KMail) ---------------- */
export function renderEmailPanel(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const ch = activeChannel();
  const channelName = ch ? `#${ch.name}` : "#workspace";
  const list = D.emailsByChannel(activeChannelId());
  const focusId = params.emailId || (list[0] && list[0].id);

  const rows = list.map(e => {
    const unread = !e.isRead
      ? `<span class="unread-dot" aria-hidden="true"></span>`
      : `<span class="read-dot" aria-hidden="true"></span>`;
    const attach = (e.attachments || []).length
      ? `<span class="em-attach" title="${e.attachments.length} attachment">${iconSvg("attach", 11)}</span>`
      : "";
    const isFocus = e.id === focusId ? " expanded" : "";
    const attachList = (e.attachments || []).map(a =>
      `<div class="em-file">${iconSvg("attach", 11)} <span>${a.name}</span><span class="text-xs text-muted">${a.size}</span></div>`,
    ).join("");
    return `
      <div class="email-row${isFocus}" data-email-id="${e.id}">
        <div class="em-row-head">
          ${unread}
          <div class="em-meta">
            <div class="em-from">${e.from}</div>
            <div class="em-subject">${e.subject}</div>
          </div>
          ${attach}
          <span class="em-ts text-xs text-muted">${e.receivedAt}</span>
        </div>
        <div class="em-expand">
          <div class="em-snippet">${e.snippet}</div>
          <div class="em-ai-summary">
            ${iconSvg("ai", 12)}
            <span><b>AI summary:</b> ${e.aiSummary}</span>
          </div>
          ${attachList ? `<div class="em-files">${attachList}</div>` : ""}
          <div class="em-actions">
            <button class="btn btn-ghost btn-sm" data-em-action="reply"   data-id="${e.id}">Reply from chat</button>
            <button class="btn btn-ghost btn-sm" data-em-action="forward" data-id="${e.id}">Forward to thread</button>
            <button class="btn btn-secondary btn-sm" data-em-action="open" data-id="${e.id}">Open in KMail</button>
          </div>
          <div class="em-privacy">${privacyBadge(e.privacyMode)}</div>
        </div>
      </div>
    `;
  }).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Email · ${channelName}</div>
        <div class="sub">${list.length} thread${list.length === 1 ? "" : "s"} · ${list.filter(e => !e.isRead).length} unread</div>
      </div>
      <span class="spacer"></span>
      ${privacyBadge("Standard Private")}
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body rp-email">
      ${list.length ? rows : `<div class="list-empty">No email threads linked to this channel.</div>`}
    </div>
    <div class="rp-foot">
      <span class="text-xs text-muted">${iconSvg("shield", 11)} Powered by KMail · Standard Private</span>
    </div>
  `;

  view.querySelectorAll(".email-row .em-row-head").forEach(head => {
    head.addEventListener("click", () => {
      const row = head.closest(".email-row");
      row.classList.toggle("expanded");
    });
  });
  view.querySelectorAll("[data-em-action]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = btn.getAttribute("data-em-action");
      const label = action === "reply" ? "Reply drafted in chat — AI pre-filled context"
                   : action === "forward" ? "Email forwarded to active thread"
                   : "Opening email in KMail…";
      showToast(label);
    });
  });
}

/* ---------------- Calendar panel ---------------- */
export function renderCalendarPanel(containerId /* , params */) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const ch = activeChannel();
  const channelName = ch ? `#${ch.name}` : "this channel";
  const events = D.calendarForChannel(activeChannelId());

  const rows = events.map(ev => {
    const avatars = (ev.attendees || []).slice(0, 4).map(uid => {
      const u = D.userById(uid);
      if (!u) return "";
      return `<span class="avatar sm" style="background:${u.color}" title="${u.name}">${u.initials}</span>`;
    }).join("");
    return `
      <div class="cal-event cal-${ev.type}" data-event-id="${ev.id}">
        <div class="cal-time">${ev.time}<br><span class="text-xs text-muted">${ev.duration}</span></div>
        <div class="cal-meta">
          <div class="cal-title">${ev.title} <span class="status-pill ${ev.type}">${ev.type}</span></div>
          <div class="avatar-stack">${avatars}</div>
          ${ev.aiNote ? `<div class="cal-ai"><em>${iconSvg("ai", 11)} ${ev.aiNote}</em></div>` : ""}
        </div>
      </div>
    `;
  }).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Calendar · This week</div>
        <div class="sub">${events.length} event${events.length === 1 ? "" : "s"} in ${channelName}</div>
      </div>
      <span class="spacer"></span>
      <button class="btn btn-secondary btn-sm" id="cal-schedule">+ Schedule</button>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body rp-calendar">
      ${events.length ? rows : `<div class="list-empty">No upcoming events in this channel.</div>`}
    </div>
    <div class="rp-foot">
      <span class="text-xs text-muted">${iconSvg("link", 11)} Synced with KMail Calendar</span>
    </div>
  `;

  const schedule = view.querySelector("#cal-schedule");
  if (schedule) schedule.addEventListener("click", () =>
    showToast("AI scheduling — checking availability across attendees"));
}

/* ---------------- Drive panel (ZK Drive) ---------------- */
export function renderDrivePanel(containerId /* , params */) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const ch = activeChannel();
  const channelName = ch ? `#${ch.name}` : "#workspace";
  const drive = D.driveForChannel(activeChannelId());
  const files = drive?.files || [];

  const rows = files.map(f => {
    const mod = f.modifiedBy ? D.userById(f.modifiedBy) || D.aiById(f.modifiedBy) : null;
    const modAvatar = mod
      ? `<span class="avatar sm" style="background:${mod.color || "#6b7280"}" title="${mod.name || ""}">${mod.initials || "·"}</span>`
      : `<span class="avatar sm" style="background:#8a93a6" title="From email">${iconSvg("attach", 10)}</span>`;
    const badges = [];
    if (f.aiGenerated) badges.push(`<span class="tag">AI generated</span>`);
    if (f.fromEmail)   badges.push(`<span class="tag">From email</span>`);
    return `
      <div class="drive-file" data-file-id="${f.id}">
        <div class="df-icon">${fileIcon(f.type)}</div>
        <div class="df-meta">
          <div class="df-name">${f.name}</div>
          <div class="df-sub">${f.size} · ${f.modified}${badges.length ? " · " + badges.join(" ") : ""}</div>
        </div>
        ${modAvatar}
      </div>
    `;
  }).join("");

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Files · ${channelName}</div>
        <div class="sub">${files.length} file${files.length === 1 ? "" : "s"}</div>
      </div>
      <span class="spacer"></span>
      ${privacyBadge(drive?.encryptionMode || "Managed Encrypted")}
      ${expandBtnHTML()}
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body rp-drive">
      ${files.length ? rows : `<div class="list-empty">No files in this channel's drive folder yet.</div>`}
      <div class="drive-upload">
        ${iconSvg("attach", 14)}
        <div>
          <div><b>Drop files or click to upload</b></div>
          <div class="text-xs text-muted">Encrypted with ZK Object Fabric</div>
        </div>
      </div>
    </div>
    <div class="rp-foot">
      <span class="text-xs text-muted">${iconSvg("shield", 11)} ZK Drive · ${drive?.encryptionMode || "Managed Encrypted"} · ${drive?.storageUsed || "0 MB"} used</span>
    </div>
  `;

  wireExpandButtons();
  view.querySelectorAll(".drive-file").forEach(row => {
    row.addEventListener("click", () => {
      const id = row.getAttribute("data-file-id");
      const f = (drive?.files || []).find(x => x.id === id);
      showToast(`Previewing ${f?.name || "file"} — Open in ZK Drive`);
    });
  });
  const upload = view.querySelector(".drive-upload");
  if (upload) upload.addEventListener("click", () =>
    showToast("Upload: files would encrypt client-side before leaving your device"));
}

/* ---------------- Business panel (Kapp) ---------------- */
export function renderBusinessPanel(containerId /* , params */) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const ch = activeChannel();
  const channelName = ch ? `#${ch.name}` : "#workspace";
  const biz = D.businessRecordsForChannel(activeChannelId());

  const dealRows = biz.deals.map(d => `
    <div class="biz-record biz-deal" data-deal-id="${d.id}">
      <div class="br-head">
        <div class="br-title">${d.name}</div>
        <span class="status-pill ${d.stage.toLowerCase().replace(/\s+/g, "-")}">${d.stage}</span>
      </div>
      <div class="br-row">
        <div class="ap-amount">${d.value}</div>
        <span class="health-dot health-${d.health}" title="${d.health}">${d.health.replace("-", " ")}</span>
      </div>
      ${d.aiInsight ? `<div class="br-ai"><em>${iconSvg("ai", 11)} ${d.aiInsight}</em></div>` : ""}
    </div>
  `).join("");

  const invoiceRows = biz.invoices.map(i => `
    <div class="biz-record biz-invoice" data-inv-id="${i.id}">
      <div class="br-row">
        <div class="br-title">${i.vendor}</div>
        <span class="status-pill ${i.status}">${i.status.replace("-", " ")}</span>
      </div>
      <div class="br-sub">
        <span class="ap-amount">${i.amount}</span>
        <span class="text-xs text-muted">Due ${i.due}</span>
      </div>
      ${i.aiInsight ? `<div class="br-ai"><em>${iconSvg("ai", 11)} ${i.aiInsight}</em></div>` : ""}
    </div>
  `).join("");

  const alertRows = biz.alerts.map(a => `
    <div class="biz-record biz-alert">
      <div class="br-row">
        <div class="br-title">${a.alert}</div>
        <span class="status-pill ${a.severity}">${a.severity}</span>
      </div>
      ${a.aiInsight ? `<div class="br-ai"><em>${iconSvg("ai", 11)} ${a.aiInsight}</em></div>` : ""}
    </div>
  `).join("");

  function section(title, body, countLabel) {
    if (!body) return "";
    return `
      <details class="biz-section" open>
        <summary><span>${title}</span><span class="text-xs text-muted">${countLabel}</span></summary>
        <div class="biz-list">${body}</div>
      </details>
    `;
  }

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">Business · ${channelName}</div>
        <div class="sub">${biz.deals.length} deal${biz.deals.length === 1 ? "" : "s"} · ${biz.invoices.length} invoice${biz.invoices.length === 1 ? "" : "s"}${biz.alerts.length ? ` · ${biz.alerts.length} alert${biz.alerts.length === 1 ? "" : "s"}` : ""}</div>
      </div>
      <span class="spacer"></span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body rp-business">
      ${section("Deals", dealRows, `${biz.deals.length}`)}
      ${section("Invoices", invoiceRows, `${biz.invoices.length}`)}
      ${section("Alerts", alertRows, `${biz.alerts.length}`)}
      ${!biz.deals.length && !biz.invoices.length && !biz.alerts.length
        ? `<div class="list-empty">No business records tagged to this channel.</div>` : ""}
    </div>
    <div class="rp-foot">
      <span class="text-xs text-muted">${iconSvg("briefcase", 11)} Kapp Business Suite</span>
    </div>
  `;
}
