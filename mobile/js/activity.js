// Activity tab — chronological cross-channel feed.
import * as D from "../../desktop/js/demo-data.js";

function buildActivityFeed() {
  const items = [];
  // Synthesize from the latest message in each channel + AI employee status.
  for (const channelId of Object.keys(D.messages || {})) {
    const ch = D.channelById(channelId);
    if (!ch) continue;
    const msgs = D.messages[channelId];
    const last = msgs[msgs.length - 1];
    if (!last) continue;
    const sender = D.userById(last.senderId);
    if (!sender) continue;
    const verb = last.isAI ? "posted in" : last.card ? "shared a card in" : "posted in";
    items.push({
      ts: last.ts,
      actorId: last.senderId,
      text: `<b>${sender.name}</b> ${verb} <b>#${ch.name}</b>`,
      route: { tab: "chat", screen: "channel-chat", params: { channelId } },
    });
  }
  // AI employee statuses
  D.aiEmployees.forEach(a => {
    items.push({
      ts: "now",
      actorId: a.id,
      text: `<b>${a.name}</b> · ${a.status}`,
      route: { screen: "ai-employee", params: { aiEmployeeId: a.id } },
    });
  });
  return items;
}

function avatar(actor) {
  return `<div class="avatar md" style="background:${actor?.color || "#6b7280"}">${actor?.initials || "·"}</div>`;
}

export function renderActivity() {
  const el = document.querySelector('[data-screen="activity"]');
  if (!el) return;
  const feed = buildActivityFeed();
  el.innerHTML = `
    ${feed.length === 0 ? `<div class="empty">No recent activity</div>` : ""}
    ${feed.map((item, idx) => {
      const actor = D.userById(item.actorId);
      return `
        <div class="activity-row" data-action="open-activity" data-idx="${idx}">
          ${avatar(actor)}
          <div class="ac-text">${item.text}</div>
          <div class="ac-ts">${item.ts}</div>
        </div>
      `;
    }).join("")}
  `;
  // Stash feed on element for click handler
  el.dataset.feedLength = String(feed.length);
  el._feed = feed;
}

export function wireActivity() {
  const el = document.querySelector('[data-screen="activity"]');
  if (!el) return;
  el.addEventListener("click", (e) => {
    const idx = e.target.closest("[data-idx]")?.dataset.idx;
    if (idx == null) return;
    const item = el._feed?.[Number(idx)];
    if (!item) return;
    if (item.route.tab) window.app.switchTab(item.route.tab);
    window.app.navigate(item.route.screen, item.route.params);
  });
}
