// Render KApp cards (artifact, task list, approval, ai-suggest) inline in chat.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

export function renderCard(card) {
  if (!card || !card.type) return "";
  switch (card.type) {
    case "artifact":          return artifactCard(card.refId);
    case "task-list":         return taskListCard(card);
    case "approval":          return approvalCard(card.refId);
    case "ai-suggest":        return aiSuggestCard(card);
    case "email":             return emailCard(card.refId);
    case "deal":              return dealCard(card.refId);
    case "calendar-reminder": return calendarCard(card.eventId || card.refId);
  }
  return "";
}

function kcardShell({ icon, kind, title, body, foot, dataRef, onClick }) {
  const attrs = dataRef ? `data-card-ref="${dataRef}"` : "";
  const click = onClick ? `data-card-action="${onClick}"` : "";
  return `
    <div class="kcard ${kind}" ${attrs} ${click}>
      <div class="kcard-head">
        <div class="kc-icon">${icon}</div>
        <span class="kc-title">${title}</span>
        <span class="spacer"></span>
      </div>
      <div class="kcard-body">${body}</div>
      ${foot ? `<div class="kcard-foot">${foot}</div>` : ""}
    </div>
  `;
}

function artifactCard(refId) {
  const a = D.artifactById(refId);
  if (!a) return "";
  const icon = a.type === "deck" ? "D" : "F";
  return kcardShell({
    icon,
    kind: "kcard-artifact",
    title: `${a.template} · ${a.type === "deck" ? "Deck" : "Doc"}`,
    body: `
      <div class="row gap-3 items-start">
        <div class="art-icon">${icon}</div>
        <div class="flex-1">
          <div class="kcard-title">${a.title}</div>
          <div class="kcard-desc">${a.sections[0]?.body || ""}</div>
          <div class="mt-2 row gap-2" style="flex-wrap:wrap">
            <span class="tag">${a.version}</span>
            <span class="tag">${a.status}</span>
            <span class="ai-chip">On-device AI</span>
          </div>
        </div>
      </div>
    `,
    foot: `
      <span class="meta">${a.sources.length} sources</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-artifact" data-artifact-id="${a.id}">Open</button>
    `,
    dataRef: refId,
    onClick: "open-artifact",
  });
}

function taskListCard(card) {
  const refId = card.refId || "thread-vendor-tasks";
  const t = D.threadById(refId);
  const taskPreview = D.tasks.slice(0, card.count || 5).map(tk => {
    const owner = D.userById(tk.ownerId);
    return `<div class="task-mini">
      <div>
        <div class="tt">${tk.title}</div>
        <div class="tm">${owner?.name || ""} · Due ${tk.due}</div>
      </div>
      <span class="status-pill ${tk.status}">${tk.status.replace("-", " ")}</span>
    </div>`;
  }).join("");
  return kcardShell({
    icon: "T",
    kind: "kcard-tasks",
    title: `${card.count || 5} tasks · AI-extracted`,
    body: taskPreview,
    foot: `
      <span class="meta">Source: ${t?.title || "thread"}</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-tasks">View all</button>
    `,
  });
}

function approvalCard(refId) {
  const a = D.approvalById(refId);
  if (!a) return "";
  const submitter = D.userById(a.submittedBy);
  return kcardShell({
    icon: "A",
    kind: "kcard-approval",
    title: "Approval request",
    body: `
      <div class="kcard-title">${a.title}</div>
      <div class="kcard-desc">${a.description}</div>
      <div class="mt-2 row justify-between">
        <div class="ap-amount">${a.amount}</div>
        <span class="status-pill ${a.status}">${a.status}</span>
      </div>
      <div class="mt-2 text-xs text-muted">Submitted by ${submitter?.name || ""} · ${a.submittedAt}</div>
    `,
    foot: `
      <span class="meta">${a.supportingDocs.length} attached</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-approval" data-approval-id="${a.id}">Review</button>
    `,
  });
}

function aiSuggestCard() {
  return `<div class="ai-suggest">${iconSvg("ai", 12)} <span>AI suggestion — click to run</span></div>`;
}

/* --- Integrated workspace cards (v0.5) ---
 * Each card is a subtle inline surface for email (KMail), CRM deals
 * (Kapp), and calendar events. They use kcardShell so spacing and hover
 * affordances match existing artifact / approval / task cards. */
function emailCard(refId) {
  const e = D.emailById(refId);
  if (!e) return "";
  const attachCount = (e.attachments || []).length;
  const unread = !e.isRead ? `<span class="unread-dot" aria-hidden="true"></span>` : "";
  return kcardShell({
    icon: "✉",
    kind: "kcard-email",
    title: `Email · ${e.from}`,
    body: `
      <div class="kcard-title">${unread}${e.subject}</div>
      <div class="kcard-desc">${e.snippet}</div>
      <div class="mt-2 email-ai-summary">
        ${iconSvg("ai", 12)}
        <span>AI summary: ${e.aiSummary}</span>
      </div>
      <div class="mt-2 row gap-2" style="flex-wrap:wrap">
        <span class="privacy-badge">${iconSvg("shield", 10)} ${e.privacyMode}</span>
        ${attachCount ? `<span class="tag">${iconSvg("attach", 10)} ${attachCount} attachment${attachCount > 1 ? "s" : ""}</span>` : ""}
        <span class="tag">${e.receivedAt}</span>
      </div>
    `,
    foot: `
      <span class="meta">Powered by KMail</span>
      <button class="btn btn-ghost btn-sm" data-card-action="reply-email" data-email-id="${e.id}">Reply from chat</button>
      <button class="btn btn-secondary btn-sm" data-card-action="open-email" data-email-id="${e.id}">View email</button>
    `,
    dataRef: refId,
    onClick: "open-email",
  });
}

function dealCard(refId) {
  const d = D.dealById(refId);
  if (!d) return "";
  const owner = D.userById(d.owner);
  return kcardShell({
    icon: "💼",
    kind: "kcard-deal",
    title: `Deal · ${d.stage}`,
    body: `
      <div class="kcard-title">${d.name}</div>
      <div class="mt-1 row justify-between items-center">
        <div class="ap-amount">${d.value}</div>
        <span class="health-dot health-${d.health}" title="${d.health}">${d.health.replace("-", " ")}</span>
      </div>
      <div class="mt-2 deal-ai-insight">${iconSvg("ai", 12)} <em>${d.aiInsight}</em></div>
      <div class="mt-2 text-xs text-muted">Owner: ${owner?.name || "—"}</div>
    `,
    foot: `
      <span class="meta">Kapp CRM</span>
      <button class="btn btn-secondary btn-sm" data-card-action="open-deal" data-deal-id="${d.id}">View deal</button>
    `,
    dataRef: refId,
    onClick: "open-deal",
  });
}

/* Calendar reminder — deliberately compact, closer to a system message
   than a full card. Renders the event title, time, a short attendee
   stack, and the AI note as an italic sub-line. */
function calendarCard(eventId) {
  const ev = D.calendarEventById(eventId);
  if (!ev) return "";
  const avatars = (ev.attendees || []).slice(0, 3).map(uid => {
    const u = D.userById(uid);
    if (!u) return "";
    return `<span class="cal-avatar avatar sm" style="background:${u.color}" title="${u.name}">${u.initials}</span>`;
  }).join("");
  return `
    <div class="kcard kcard-calendar" data-card-ref="${ev.id}" data-card-action="open-event">
      <div class="kc-cal-icon">📅</div>
      <div class="kc-cal-body">
        <div class="kc-cal-title">${ev.title}</div>
        <div class="kc-cal-meta">${ev.time} · ${ev.duration}</div>
        ${ev.aiNote ? `<div class="kc-cal-ai"><em>${ev.aiNote}</em></div>` : ""}
      </div>
      <div class="kc-cal-right">
        <div class="avatar-stack">${avatars}</div>
        <button class="btn btn-ghost btn-sm" data-card-action="open-event" data-event-id="${ev.id}">Open</button>
      </div>
    </div>
  `;
}
