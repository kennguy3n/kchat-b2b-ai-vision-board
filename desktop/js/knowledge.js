// Channel knowledge panel (Screen 19) — entities, simple graph, and Q&A.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";

function entityColor(type) {
  switch ((type || "").toLowerCase()) {
    case "vendor":   return "#8b5cf6";
    case "policy":   return "#ef4444";
    case "template": return "#f59e0b";
    case "product":  return "#6366f1";
    case "concept":  return "#0ea5e9";
    case "research": return "#10b981";
    case "contract": return "#22c55e";
    case "contact":  return "#f59e0b";
    case "decision": return "#ec4899";
    case "milestone":return "#60a5fa";
    default:         return "#6b7280";
  }
}

function renderGraph(k) {
  const ents = k.entities || [];
  if (!ents.length) return `<svg></svg>`;
  const cx = 260, cy = 140, rx = 220, ry = 110;
  const n = ents.length;
  const nodes = ents.map((e, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      id: e.id,
      label: e.label.length > 14 ? e.label.slice(0, 12) + "…" : e.label,
      type: e.type,
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    };
  });
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const edges = (k.relationships || [])
    .filter(r => nodeMap[r.from] && nodeMap[r.to])
    .map(r => {
      const a = nodeMap[r.from], b = nodeMap[r.to];
      return `
        <line class="gedge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />
        <text class="gedge-label" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 4}">${r.rel}</text>
      `;
    }).join("");
  const nodesHTML = nodes.map(nd => `
    <g data-entity-id="${nd.id}">
      <circle class="gnode" cx="${nd.x}" cy="${nd.y}" r="28" fill="${entityColor(nd.type)}" fill-opacity="0.22" stroke="${entityColor(nd.type)}"/>
      <text class="glabel" x="${nd.x}" y="${nd.y}">${nd.label}</text>
    </g>
  `).join("");
  return `<svg viewBox="0 0 ${cx * 2} 280" role="img" aria-label="Entity graph">${edges}${nodesHTML}</svg>`;
}

export function renderKnowledge(channelId) {
  const ch = D.channelById(channelId) || D.channelById("c-vendor");
  const k = D.knowledgeForChannel(ch.id);
  const container = document.getElementById("screen-channel-knowledge");

  if (!k) {
    container.innerHTML = `
      <div class="knowledge">
        <div class="kh-head">
          <div>
            <h1>#${ch.name} knowledge</h1>
            <div class="kh-sub">No knowledge has been indexed for this channel yet.</div>
          </div>
          <span class="spacer" style="flex:1"></span>
          <button class="btn btn-secondary btn-sm" id="kh-back-empty">${iconSvg("back", 14)} Back to channel</button>
        </div>
        <div class="empty-state" style="margin-top:24px">
          <div class="es-icon">${iconSvg("ai", 22)}</div>
          <div class="es-title">Channel knowledge is still warming up</div>
          <div class="es-desc">Knowledge is automatically built from your conversations, files, and decisions. Once the channel has a few threads, you'll see entities, relationships, and a searchable Q&amp;A here.</div>
          <div class="es-actions">
            <a class="btn btn-ghost btn-sm" href="#" id="kh-learn-more">Learn more</a>
            <button class="btn btn-primary btn-sm" id="kh-rebuild-empty">${iconSvg("ai", 14)} Rebuild now</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById("kh-back-empty")?.addEventListener("click", () => {
      window.app.navigateTo("channel-chat", { channelId: ch.id });
    });
    document.getElementById("kh-learn-more")?.addEventListener("click", (e) => {
      e.preventDefault();
      // Demo: no external docs — surface inline guidance instead.
      alert("Channel knowledge indexes entities (vendors, policies, products), relationships, and FAQs from the channel. On-device AI keeps it private to this workspace.");
    });
    document.getElementById("kh-rebuild-empty")?.addEventListener("click", (ev) => {
      const btn = ev.currentTarget;
      btn.disabled = true;
      btn.textContent = "Rebuilding…";
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `${iconSvg("check", 14)} Rebuilt just now`;
      }, 1400);
    });
    return;
  }

  const entitiesHTML = k.entities.map(e => `
    <div class="entity-item" data-entity-id="${e.id}">
      <span class="ent-type ${e.type.toLowerCase()}">${e.type}</span>
      <div>
        <div class="ent-name">${e.label}</div>
        <div class="ent-meta">${e.summary}</div>
      </div>
      <span class="spacer" style="flex:1"></span>
      <span class="ent-meta">${e.sourceRefs} refs</span>
    </div>
  `).join("");

  const qaHTML = (k.qa || []).map(item => `
    <div class="qa-item">
      <div class="q">Q: ${item.q}</div>
      <div class="a">A: ${item.a}</div>
      <div class="cite">Sources: ${(item.sources || []).map(s => `<span class="cite">[${s}]</span>`).join(" ")}</div>
    </div>
  `).join("");

  container.innerHTML = `
    <div class="knowledge">
      <div class="kh-head">
        <div>
          <h1>#${ch.name} · Channel Knowledge</h1>
          <div class="kh-sub">Auto-indexed from channel history, pinned messages, and attached files.</div>
          <div class="kh-meta">
            <span class="tag">Last rebuilt ${k.rebuiltAt}</span>
            <span class="tag">${k.entities.length} entities</span>
            <span class="tag">${(k.relationships || []).length} relationships</span>
            <span class="tag">Coverage: ${k.coverage}</span>
          </div>
        </div>
        <span class="spacer" style="flex:1"></span>
        <button class="btn btn-secondary btn-sm" id="kh-back">${iconSvg("back", 14)} Back to channel</button>
        <button class="btn btn-primary btn-sm" id="kh-rebuild">${iconSvg("ai", 14)} Rebuild now</button>
      </div>

      <div class="kh-cols">
        <div class="kh-card">
          <h3>Entities</h3>
          <div class="entity-list">${entitiesHTML}</div>
        </div>
        <div class="kh-card">
          <h3>Entity graph</h3>
          <div class="kh-graph">${renderGraph(k)}</div>
        </div>
        <div class="kh-card">
          <h3>Frequently asked</h3>
          <div class="qa-list">${qaHTML || '<div class="text-muted text-sm">No captured Q&A yet.</div>'}</div>
        </div>
      </div>
    </div>
  `;

  const back = document.getElementById("kh-back");
  if (back) back.addEventListener("click", () => {
    window.app.navigateTo("channel-chat", { channelId: ch.id });
  });
  const rebuild = document.getElementById("kh-rebuild");
  if (rebuild) rebuild.addEventListener("click", () => {
    rebuild.disabled = true;
    rebuild.textContent = "Rebuilding…";
    setTimeout(() => {
      rebuild.disabled = false;
      rebuild.innerHTML = `${iconSvg("check", 14)} Rebuilt just now`;
    }, 1400);
  });

  // Entity click → highlight graph node
  container.querySelectorAll(".entity-item").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.entityId;
      container.querySelectorAll(".kh-graph .gnode").forEach(n => n.classList.remove("sel"));
      const node = container.querySelector(`.kh-graph [data-entity-id="${id}"] .gnode`);
      if (node) node.classList.add("sel");
    });
  });
}
