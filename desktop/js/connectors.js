// Connectors (company-wide vs personal tiers).
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

let activeTab = "company";

function providerInitials(p) {
  const map = { google: "G", atlassian: "J", salesforce: "SF", microsoft: "MS", notion: "N", github: "GH" };
  return map[(p || "").toLowerCase()] || "?";
}

function renderCard(c) {
  const status = c.connected
    ? `<span class="cc-status">${c.tier === "personal" ? "Connected (you)" : "Connected"}</span>`
    : `<span class="cc-status disconnected">Not connected</span>`;
  const actions = c.connected
    ? `<button class="btn btn-secondary btn-sm" data-cc-action="disconnect" data-cc-id="${c.id}">Disconnect</button>
       <button class="btn btn-secondary btn-sm" data-cc-action="sync" data-cc-id="${c.id}">Sync now</button>`
    : `<button class="btn btn-primary btn-sm" data-cc-action="connect" data-cc-id="${c.id}">Connect</button>`;
  const meta = c.connected
    ? `Scope: ${c.scope || "(all)"} · Last sync ${c.lastSync || "—"}`
    : `No scope configured`;
  return `
    <div class="connector-card" data-cc-id="${c.id}">
      <div class="cc-head">
        <div class="cc-icon">${providerInitials(c.provider)}</div>
        <div>
          <div class="cc-name">${c.name}</div>
          <div class="cc-meta">${c.tier === "company" ? "Company-wide" : "Personal"}</div>
        </div>
        <span class="spacer" style="flex:1"></span>
        ${status}
      </div>
      <div class="cc-meta">${meta}</div>
      <div class="cc-actions">${actions}</div>
    </div>
  `;
}

export function renderConnectors() {
  const container = document.getElementById("screen-connectors");
  const list = activeTab === "company" ? D.connectors.companyWide : D.connectors.personal;
  const cards = list.map(renderCard).join("");

  container.innerHTML = `
    <div class="connectors">
      <div class="kh-head">
        <div>
          <h1>Connectors</h1>
          <div class="kh-sub">Grant AI Employees and KApps access to external systems.</div>
        </div>
        <span class="spacer" style="flex:1"></span>
        <span class="badge-ai">${iconSvg("shield", 12)} Company admin controls</span>
      </div>

      <div class="connector-tabs">
        <button class="ct-tab ${activeTab === "company" ? "active" : ""}" data-tab="company">
          Company-wide · ${D.connectors.companyWide.length}
        </button>
        <button class="ct-tab ${activeTab === "personal" ? "active" : ""}" data-tab="personal">
          Personal · ${D.connectors.personal.length}
        </button>
      </div>

      <div class="connector-grid">${cards}</div>
    </div>
  `;

  container.querySelectorAll(".ct-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeTab = btn.dataset.tab;
      renderConnectors();
    });
  });

  container.querySelectorAll("[data-cc-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.ccAction;
      const id = btn.dataset.ccId;
      const card = container.querySelector(`.connector-card[data-cc-id="${id}"]`);
      if (action === "connect") {
        btn.disabled = true;
        btn.textContent = "Connecting…";
        setTimeout(() => {
          showToast("Connector connected.");
          btn.textContent = "Connect";
          btn.disabled = false;
          if (card) {
            const st = card.querySelector(".cc-status");
            if (st) { st.className = "cc-status"; st.textContent = "Connected"; }
          }
        }, 900);
      } else if (action === "disconnect") {
        showToast("Connector disconnected.");
      } else if (action === "sync") {
        btn.disabled = true;
        btn.textContent = "Syncing…";
        setTimeout(() => {
          btn.textContent = "Sync now";
          btn.disabled = false;
          showToast("Synced.");
        }, 700);
      }
    });
  });
}
