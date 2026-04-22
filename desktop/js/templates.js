// Template intake (Screen 7) — curated templates with required/optional inputs,
// auto-detected sources, output section preview, and "Generate Draft" action.
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

// In-memory intake state (not persisted — demo click-through only)
const intakeState = {
  templateId: null,
  recipeId: null,
  values: {},     // fieldId -> string or array
};

// Contextual helper copy — keyed by field label/id so we don't have to
// modify the demo-data templates. Anything matched renders as italic
// guidance directly beneath the label so SME users understand what to write.
function helpTextFor(field) {
  if (field.helpText) return field.helpText;
  const label = (field.label || "").toLowerCase();
  const id = (field.id || "").toLowerCase();
  if (label.includes("goal") || id.includes("goal"))
    return "e.g., Ship a PRD that engineering can estimate from.";
  if (label.includes("audience") || id.includes("audience"))
    return "Who will read this document?";
  if (label.includes("tone") || id.includes("tone"))
    return "How formal should the output be?";
  if (label.includes("scope") || id.includes("scope"))
    return "What is in and out of scope for this draft?";
  if (label.includes("deadline") || label.includes("due") || id.includes("due"))
    return "When do you need the final output ready?";
  if (label.includes("metric") || label.includes("success"))
    return "How will you know this was successful?";
  return "";
}

function helpHTML(field) {
  const t = helpTextFor(field);
  return t ? `<div class="ti-help">${t}</div>` : "";
}

function renderField(field, required) {
  const val = intakeState.values[field.id];
  const reqDot = required ? `<span class="req-dot" aria-hidden="true">*</span>` : "";
  const help = helpHTML(field);

  if (field.type === "textarea") {
    return `
      <div class="ti-field" data-field-id="${field.id}" data-required="${required}">
        <label>${field.label}${reqDot}</label>
        ${help}
        <textarea data-intake="${field.id}" placeholder="${field.placeholder || ""}">${val || ""}</textarea>
        <div class="ti-hint"></div>
      </div>
    `;
  }
  if (field.type === "select") {
    const opts = (field.options || []).map(o => `<option value="${o}" ${o === val ? "selected" : ""}>${o}</option>`).join("");
    return `
      <div class="ti-field" data-field-id="${field.id}" data-required="${required}">
        <label>${field.label}${reqDot}</label>
        ${help}
        <select data-intake="${field.id}">
          <option value="" ${!val ? "selected" : ""}>Select…</option>
          ${opts}
        </select>
        <div class="ti-hint"></div>
      </div>
    `;
  }
  if (field.type === "chips") {
    const selected = Array.isArray(val) ? val : [];
    const chips = (field.options || []).map(o =>
      `<span class="chip ${selected.includes(o) ? "selected" : ""}" data-chip="${o}">${o}</span>`
    ).join("");
    return `
      <div class="ti-field" data-field-id="${field.id}" data-required="${required}" data-kind="chips">
        <label>${field.label}${reqDot}</label>
        ${help}
        <div class="ti-chips" data-intake="${field.id}">${chips}</div>
        <div class="ti-hint"></div>
      </div>
    `;
  }
  // default: text
  return `
    <div class="ti-field" data-field-id="${field.id}" data-required="${required}">
      <label>${field.label}${reqDot}</label>
      ${help}
      <input type="text" data-intake="${field.id}" placeholder="${field.placeholder || ""}" value="${val || ""}"/>
      <div class="ti-hint"></div>
    </div>
  `;
}

function detectedSourcesForRecipe(recipeId, channelId) {
  const ch = D.channelById(channelId) || D.channelById("c-specs");
  const k = D.knowledgeForChannel(ch?.id);
  const sources = [];
  sources.push({ kind: "thread",  name: "Current thread (active)", detail: "auto-attached" });
  if (ch)  sources.push({ kind: "channel", name: `Channel knowledge: #${ch.name}`, detail: `${ch.knowledgeEntityCount || 0} entities · rebuilt ${ch.knowledgeRebuilt || "recently"}` });
  if (k && k.entities?.length) {
    const top = k.entities.slice(0, 3).map(e => e.label).join(", ");
    sources.push({ kind: "entities", name: "Related entities", detail: top });
  }
  // Recipe-specific synthetic sources
  if (recipeId === "r-draft-proposal" || recipeId === "r-create-qbr") {
    sources.push({ kind: "crm", name: "Salesforce export (linked)", detail: "last 4 quarters" });
  }
  if (recipeId === "r-draft-prd") {
    sources.push({ kind: "drive", name: "drive:/research (3 files)", detail: "competitor scan, design notes" });
  }
  return sources;
}

function requiredFilled(tpl) {
  return (tpl.required || []).every(f => {
    const v = intakeState.values[f.id];
    if (f.type === "chips") return Array.isArray(v) && v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  });
}

function recomputeValidation() {
  const tpl = D.templateById(intakeState.templateId);
  if (!tpl) return;
  const ok = requiredFilled(tpl);
  const btn = document.getElementById("ti-generate");
  if (btn) btn.disabled = !ok;
  const msg = document.querySelector(".ti-validation-msg");
  if (msg) msg.textContent = ok ? "" : "Fill all required fields to generate a draft.";
  // Red borders only if the field is empty AND has been touched (data-touched)
  document.querySelectorAll(".ti-field[data-required='true']").forEach(el => {
    const fid = el.getAttribute("data-field-id");
    const v = intakeState.values[fid];
    const isFilled = (el.getAttribute("data-kind") === "chips")
      ? (Array.isArray(v) && v.length > 0)
      : (typeof v === "string" && v.trim().length > 0);
    if (!isFilled && el.dataset.touched === "1") {
      el.classList.add("invalid");
      const hint = el.querySelector(".ti-hint");
      if (hint) hint.textContent = "This field is required.";
    } else {
      el.classList.remove("invalid");
      const hint = el.querySelector(".ti-hint");
      if (hint) hint.textContent = "";
    }
  });
}

function wireIntake(tpl) {
  // Text / textarea inputs
  document.querySelectorAll("[data-intake]").forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.addEventListener("input", () => {
        intakeState.values[el.dataset.intake] = el.value;
        const fld = el.closest(".ti-field");
        if (fld) fld.dataset.touched = "1";
        recomputeValidation();
      });
      el.addEventListener("blur", () => {
        const fld = el.closest(".ti-field");
        if (fld) fld.dataset.touched = "1";
        recomputeValidation();
      });
    } else if (el.tagName === "SELECT") {
      el.addEventListener("change", () => {
        intakeState.values[el.dataset.intake] = el.value;
        const fld = el.closest(".ti-field");
        if (fld) fld.dataset.touched = "1";
        recomputeValidation();
      });
    }
  });

  // Chips
  document.querySelectorAll(".ti-chips").forEach(container => {
    const fid = container.dataset.intake;
    container.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const val = chip.dataset.chip;
        const cur = intakeState.values[fid];
        const arr = Array.isArray(cur) ? cur.slice() : [];
        const idx = arr.indexOf(val);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
        intakeState.values[fid] = arr;
        chip.classList.toggle("selected");
        const fld = container.closest(".ti-field");
        if (fld) fld.dataset.touched = "1";
        recomputeValidation();
      });
    });
  });

  // Buttons
  const genBtn = document.getElementById("ti-generate");
  if (genBtn) genBtn.addEventListener("click", () => {
    if (!requiredFilled(tpl)) {
      // Mark all required fields touched so red borders show
      document.querySelectorAll(".ti-field[data-required='true']").forEach(el => el.dataset.touched = "1");
      recomputeValidation();
      showToast("Please complete the required fields.");
      return;
    }
    window.app.navigateTo("ai-processing", {
      templateId: intakeState.templateId,
      recipeId: intakeState.recipeId,
    });
  });
  const cancelBtn = document.getElementById("ti-cancel");
  if (cancelBtn) cancelBtn.addEventListener("click", () => {
    const chId = window.app.state.channelId || "c-specs";
    window.app.navigateTo("channel-chat", { channelId: chId });
  });
}

export function renderTemplateIntake(params = {}) {
  const tpl = D.templateById(params.templateId) || D.templateById("tpl-prd");
  intakeState.templateId = tpl.id;
  intakeState.recipeId   = params.recipeId || null;
  intakeState.values     = {}; // reset each render

  const sources = detectedSourcesForRecipe(intakeState.recipeId, window.app.state.channelId);

  const requiredHTML = (tpl.required || []).map(f => renderField(f, true)).join("");
  const optionalHTML = (tpl.optional || []).map(f => renderField(f, false)).join("");
  const outputSecs   = (tpl.outputSections || []).map(s => `<div class="ti-output-row">${s}</div>`).join("");

  const srcHTML = sources.map(s => `
    <div class="ti-source">
      <div class="ts-check">${iconSvg("check", 10)}</div>
      <div class="ts-name">${s.name}</div>
      <div class="ts-kind">${s.kind}</div>
    </div>
  `).join("");

  const container = document.getElementById("screen-template-intake");
  container.innerHTML = `
    <div class="template-intake">
      <div class="ti-head">
        <div class="ti-icon">${(tpl.kind || "d").toString().slice(0,1).toUpperCase()}</div>
        <div>
          <h1>${tpl.name}</h1>
          <div class="ti-sub">${tpl.description}</div>
          <div class="ti-curated" title="Curated template">
            ${iconSvg("shield", 12)} Curated by ${tpl.curatedBy || "Workspace admin"}
          </div>
        </div>
        <span class="spacer" style="flex:1"></span>
        <span class="badge-ai">${iconSvg("ai", 12)} On-device AI</span>
      </div>

      <div class="ti-section">
        <h3>Required inputs <span class="req-badge">required</span></h3>
        ${requiredHTML || '<div class="text-muted text-sm">No required inputs.</div>'}
      </div>

      ${(tpl.optional && tpl.optional.length) ? `
      <div class="ti-section">
        <h3>Optional inputs</h3>
        ${optionalHTML}
      </div>` : ""}

      <div class="ti-section">
        <h3>Detected sources</h3>
        <div class="ti-sources">${srcHTML}</div>
      </div>

      <div class="ti-section">
        <h3>Output sections (preview)</h3>
        <div class="ti-outputs">${outputSecs}</div>
      </div>

      <div class="ti-foot">
        <span class="ti-validation-msg"></span>
        <button class="btn btn-secondary" id="ti-cancel">Cancel</button>
        <button class="btn btn-primary" id="ti-generate" disabled>${iconSvg("ai", 14)} Generate Draft</button>
      </div>
    </div>
  `;

  wireIntake(tpl);
  recomputeValidation();
}
