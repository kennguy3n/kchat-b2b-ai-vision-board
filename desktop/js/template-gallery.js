// Template Gallery screen — Canva/MiniMax-inspired marketplace for browsing
// templates before entering the intake form.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

const CATEGORIES = [
  { id: "all",       label: "All" },
  { id: "Documents", label: "Documents" },
  { id: "Decks",     label: "Decks" },
  { id: "Sheets",    label: "Sheets" },
  { id: "Forms",     label: "Forms" },
  { id: "popular",   label: "Popular" },
];

// Single source of truth for the current filter state. Lives at module scope
// so re-renders triggered by tab / search input reuse the same state without
// re-reading the DOM.
const galleryState = {
  category: "all",
  query: "",
};

function allTemplates() {
  return Object.values(D.templates);
}

function formatUses(n) {
  if (typeof n !== "number") return "";
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k uses`;
  return `${n} uses`;
}

function kindLabel(kind) {
  switch (kind) {
    case "doc":   return "Doc";
    case "deck":  return "Deck";
    case "sheet": return "Sheet";
    case "form":  return "Form";
    default:      return kind;
  }
}

function cardIconLetter(t) {
  // Prefer an initial that reads cleanly on the gradient preview.
  if (t.kind === "deck")  return "▰";
  if (t.kind === "sheet") return "▦";
  if (t.kind === "form")  return "▤";
  return (t.name || "?").trim().charAt(0).toUpperCase();
}

function matchesQuery(t, q) {
  if (!q) return true;
  const hay = [
    t.name,
    t.description,
    t.preview,
    t.curatedBy,
    ...(Array.isArray(t.tags) ? t.tags : []),
  ].filter(Boolean).join(" ").toLowerCase();
  return hay.includes(q);
}

function filteredTemplates() {
  const q = galleryState.query.trim().toLowerCase();
  let list = allTemplates().filter(t => matchesQuery(t, q));
  if (galleryState.category === "popular") {
    list = [...list].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
  } else if (galleryState.category !== "all") {
    list = list.filter(t => t.category === galleryState.category);
  }
  return list;
}

function cardHTML(t, { featured = false } = {}) {
  const uses = formatUses(t.usageCount);
  const kind = kindLabel(t.kind);
  const icon = cardIconLetter(t);
  const preview = t.preview || t.description || "";
  return `
    <button class="tg-card${featured ? " featured" : ""}" type="button" data-template-id="${t.id}" aria-label="Use template: ${t.name}">
      <div class="tg-card-preview" style="background:${t.color || "linear-gradient(135deg,#6366f1,#8b5cf6)"}">
        <span class="tg-kind-pill">${kind}</span>
        <span class="tg-card-icon" aria-hidden="true">${icon}</span>
        <span class="tg-card-overlay">${iconSvg("ai", 12)} Use template</span>
      </div>
      <div class="tg-card-body">
        <div class="tg-card-name">${t.name}</div>
        <div class="tg-card-desc">${preview}</div>
        <div class="tg-card-footer">
          <span class="tg-curator">By ${t.curatedBy || "Acme"}</span>
          ${uses ? `<span class="tg-uses">${iconSvg("ai", 11)} ${uses}</span>` : ""}
        </div>
      </div>
    </button>
  `;
}

function tabsHTML() {
  return CATEGORIES.map(c => `
    <button class="tg-tab${galleryState.category === c.id ? " active" : ""}" type="button" data-category="${c.id}">${c.label}</button>
  `).join("");
}

function gridHTML() {
  const list = filteredTemplates();
  if (list.length === 0) {
    return `<div class="tg-empty">
      <div class="tg-empty-icon">${iconSvg("search", 20)}</div>
      <div class="tg-empty-title">No templates match your search</div>
      <div class="tg-empty-sub">Try a broader term — e.g. "PRD", "budget", or "form".</div>
    </div>`;
  }
  return `<div class="tg-grid">${list.map(t => cardHTML(t)).join("")}</div>`;
}

function featuredHTML() {
  // Featured only shows on "All" without an active search — treat it as a
  // hero row, not a competing filtered view.
  if (galleryState.category !== "all" || galleryState.query.trim()) return "";
  const featured = allTemplates().filter(t => t.featured);
  if (featured.length === 0) return "";
  return `
    <div class="tg-section-head">
      <h2>Featured</h2>
      <span class="tg-section-sub">Hand-picked by the Acme PM Guild</span>
    </div>
    <div class="tg-featured">
      ${featured.slice(0, 4).map(t => cardHTML(t, { featured: true })).join("")}
    </div>
  `;
}

export function renderTemplateGallery() {
  const container = document.getElementById("screen-template-gallery");
  if (!container) return;

  container.innerHTML = `
    <div class="tg-wrap">
      <div class="tg-header">
        <div class="tg-header-main">
          <h1 class="tg-title">Templates</h1>
          <div class="tg-sub">Browse curated starting points — the AI fills in the blanks from your channel, thread, and connected sources.</div>
        </div>
        <div class="tg-header-actions">
          <div class="tg-search">
            ${iconSvg("search", 14)}
            <input id="tg-search-input" type="search" placeholder="Search templates — e.g., 'PRD', 'budget', 'onboarding'" autocomplete="off" aria-label="Search templates" value="${galleryState.query.replace(/"/g, "&quot;")}"/>
          </div>
          <button class="btn btn-ghost" id="tg-create-custom" type="button">${iconSvg("plus", 14)} Create custom template</button>
        </div>
      </div>

      <div class="tg-tabs" role="tablist" aria-label="Template categories">
        ${tabsHTML()}
      </div>

      <div class="tg-results" id="tg-results">
        ${featuredHTML()}
        <div class="tg-section-head">
          <h2>${galleryState.category === "all" ? "All templates" : galleryState.category === "popular" ? "Most used" : galleryState.category}</h2>
          <span class="tg-section-sub" id="tg-result-count">${filteredTemplates().length} templates</span>
        </div>
        ${gridHTML()}
      </div>
    </div>
  `;

  wireGallery();
}

function rerenderResults() {
  const host = document.getElementById("tg-results");
  if (!host) return;
  host.innerHTML = `
    ${featuredHTML()}
    <div class="tg-section-head">
      <h2>${galleryState.category === "all" ? "All templates" : galleryState.category === "popular" ? "Most used" : galleryState.category}</h2>
      <span class="tg-section-sub">${filteredTemplates().length} templates</span>
    </div>
    ${gridHTML()}
  `;
  wireCards();
}

function wireGallery() {
  // Tab switching
  document.querySelectorAll("#screen-template-gallery .tg-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      galleryState.category = tab.getAttribute("data-category");
      document.querySelectorAll("#screen-template-gallery .tg-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      rerenderResults();
    });
  });

  // Real-time search
  const input = document.getElementById("tg-search-input");
  if (input) {
    input.addEventListener("input", () => {
      galleryState.query = input.value || "";
      rerenderResults();
      // Refocus preserved — input stays live because we only re-render results.
    });
  }

  // Custom template CTA
  const custom = document.getElementById("tg-create-custom");
  if (custom) {
    custom.addEventListener("click", () => {
      showToast("Custom template creation is coming soon. Pick a starting point for now.");
    });
  }

  wireCards();
}

function wireCards() {
  document.querySelectorAll("#screen-template-gallery .tg-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.getAttribute("data-template-id");
      if (!id) return;
      // recipeId:null clears any stale value from a prior Action Launcher flow
      // so the intake screen's "Detected sources" reflects this template, not the last recipe.
      window.app.navigateTo("template-intake", { templateId: id, recipeId: null });
    });
  });
}
