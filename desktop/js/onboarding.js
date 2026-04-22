// Lightweight first-run onboarding tour. Shows a 5-step overlay highlighting
// key parts of the workspace. Completion is persisted in localStorage so the
// tour only runs on the first visit. Framework-free to match the rest of the
// demo.

const STORAGE_KEY = "kchat.onboarded";

const STEPS = [
  {
    target: "#sidebar",
    title: "Domains",
    body: "These are your Domains — think of them as departments. Expand one to see its channels.",
    placement: "right",
  },
  {
    target: "#sidebar .sb-section-body",
    title: "Channels",
    body: "Channels are where your team conversations happen. Click one to jump into the chat.",
    placement: "right",
  },
  {
    target: "#sidebar .sb-ai",
    title: "AI Employees",
    body: "AI coworkers that help with tasks — they work within rules you set (budget, data scope, approvals).",
    placement: "right",
  },
  {
    target: ".compose .btn-ai, .compose .btn-compose, #topbar-inbox",
    title: "Ask AI from anywhere",
    body: "Click the + in the compose bar to ask AI to draft documents, extract tasks, or summarize a thread.",
    placement: "top",
  },
  {
    target: "#right-panel, .workarea",
    title: "Context, not page-hopping",
    body: "Details, approvals, tasks and drafts open in the right panel — you never leave your conversation.",
    placement: "left",
  },
];

let stepIndex = 0;
let isActive = false;

function hasSeenTour() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markComplete() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {}
}

function findTarget(selector) {
  if (!selector) return null;
  const parts = selector.split(",").map((s) => s.trim());
  for (const part of parts) {
    const el = document.querySelector(part);
    if (el && el.getBoundingClientRect().width > 0) return el;
  }
  return document.querySelector(parts[0]) || null;
}

function placeTooltip(tooltip, rect, placement) {
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = tooltip.offsetWidth;
  const th = tooltip.offsetHeight;
  let top = rect.top;
  let left = rect.left;
  switch (placement) {
    case "right":
      top = Math.max(pad, Math.min(vh - th - pad, rect.top + rect.height / 2 - th / 2));
      left = Math.min(vw - tw - pad, rect.right + pad);
      break;
    case "left":
      top = Math.max(pad, Math.min(vh - th - pad, rect.top + rect.height / 2 - th / 2));
      left = Math.max(pad, rect.left - tw - pad);
      break;
    case "top":
      top = Math.max(pad, rect.top - th - pad);
      left = Math.max(pad, Math.min(vw - tw - pad, rect.left + rect.width / 2 - tw / 2));
      break;
    case "bottom":
    default:
      top = Math.min(vh - th - pad, rect.bottom + pad);
      left = Math.max(pad, Math.min(vw - tw - pad, rect.left + rect.width / 2 - tw / 2));
      break;
  }
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

function renderStep() {
  const step = STEPS[stepIndex];
  if (!step) return finish();

  let backdrop = document.querySelector(".onb-backdrop");
  let spotlight = document.querySelector(".onb-spotlight");
  let tooltip = document.querySelector(".onb-tooltip");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.className = "onb-backdrop";
    document.body.appendChild(backdrop);
  }
  if (!spotlight) {
    spotlight = document.createElement("div");
    spotlight.className = "onb-spotlight";
    document.body.appendChild(spotlight);
  }
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "onb-tooltip";
    tooltip.setAttribute("role", "dialog");
    tooltip.setAttribute("aria-label", "Product tour");
    document.body.appendChild(tooltip);
  }

  const target = findTarget(step.target);
  const rect = target
    ? target.getBoundingClientRect()
    : { top: window.innerHeight / 2 - 60, left: window.innerWidth / 2 - 120, width: 240, height: 120, right: window.innerWidth / 2 + 120, bottom: window.innerHeight / 2 + 60 };

  spotlight.style.top = `${rect.top - 4}px`;
  spotlight.style.left = `${rect.left - 4}px`;
  spotlight.style.width = `${rect.width + 8}px`;
  spotlight.style.height = `${rect.height + 8}px`;
  spotlight.style.display = target ? "block" : "none";

  const isLast = stepIndex === STEPS.length - 1;
  tooltip.innerHTML = `
    <div class="onb-title">${step.title}</div>
    <div class="onb-body">${step.body}</div>
    <div class="onb-foot">
      <span class="onb-step">Step ${stepIndex + 1} of ${STEPS.length}</span>
      <span class="spacer"></span>
      <button class="btn btn-ghost btn-sm" data-onb-skip>Skip tour</button>
      <button class="btn btn-primary btn-sm" data-onb-next>${isLast ? "Got it" : "Next"}</button>
    </div>
  `;

  requestAnimationFrame(() => placeTooltip(tooltip, rect, step.placement));

  tooltip.querySelector("[data-onb-next]").addEventListener("click", next, { once: true });
  tooltip.querySelector("[data-onb-skip]").addEventListener("click", skip, { once: true });
}

function next() {
  stepIndex += 1;
  if (stepIndex >= STEPS.length) finish();
  else renderStep();
}

function skip() {
  finish();
}

function finish() {
  isActive = false;
  markComplete();
  document.querySelector(".onb-backdrop")?.remove();
  document.querySelector(".onb-spotlight")?.remove();
  document.querySelector(".onb-tooltip")?.remove();
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("resize", onResize);
}

function onKey(e) {
  if (!isActive) return;
  if (e.key === "Escape") skip();
  else if (e.key === "Enter" || e.key === "ArrowRight") next();
}

function onResize() {
  if (isActive) renderStep();
}

export function startOnboarding({ force = false } = {}) {
  if (!force && hasSeenTour()) return;
  // Clean up any in-progress tour before restarting so we don't stack listeners.
  if (isActive) {
    document.querySelector(".onb-backdrop")?.remove();
    document.querySelector(".onb-spotlight")?.remove();
    document.querySelector(".onb-tooltip")?.remove();
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", onResize);
  }
  stepIndex = 0;
  isActive = true;
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);
  // Defer so the workspace home has painted and the sidebar sections expanded.
  requestAnimationFrame(() => setTimeout(renderStep, 80));
}

export function resetOnboarding() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}
