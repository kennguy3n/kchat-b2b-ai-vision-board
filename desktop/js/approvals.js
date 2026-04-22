// Approval form + review flows
import * as D from "./demo-data.js";
import { iconSvg } from "./icons.js";
import { showToast } from "./transitions.js";

export function renderApprovalForm(containerId) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const prefill = D.aiOutputs.approvalPrefill;
  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">New approval request</div>
        <div class="sub">Prefilled from thread</div>
      </div>
      <span class="spacer"></span>
      <span class="badge-ai">${iconSvg("ai", 12)} AI prefill</span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="form-field">
        <label>Title</label>
        <input type="text" value="${prefill.title}"/>
      </div>
      <div class="form-field">
        <label>Description</label>
        <textarea class="form-field" style="width:100%;min-height:70px;border:1px solid var(--border);border-radius:8px;padding:8px 10px">${prefill.description}</textarea>
      </div>
      <div class="form-field">
        <label>Amount</label>
        <input type="text" value="${prefill.amount}"/>
      </div>
      <div class="form-field">
        <label>Approver</label>
        <select>
          ${D.users.map(u => `<option ${u.id === "u-ken" ? "selected" : ""}>${u.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-field">
        <label>Supporting documents</label>
        <div class="source-pills">
          <span class="source-pill"><span class="check">✓</span> Orbix SLA remediation memo.pdf</span>
          <span class="source-pill"><span class="check">✓</span> Risk rescore worksheet.xlsx</span>
        </div>
      </div>
    </div>
    <div class="rp-foot">
      <button class="btn btn-ghost" data-close-right>Cancel</button>
      <button class="btn btn-primary" id="approval-submit">Submit for approval</button>
    </div>
  `;
  const btn = document.getElementById("approval-submit");
  if (btn) btn.addEventListener("click", () => {
    showToast("Approval submitted — pending review.");
    window.app.openRightView("approval-review", { approvalId: "ap-orbix" });
  });
}

export function renderApprovalReview(containerId, params = {}) {
  const view = document.getElementById(containerId);
  if (!view) return;
  const a = D.approvalById(params.approvalId) || D.approvalById("ap-orbix");
  const submitter = D.userById(a.submittedBy);
  const approver = D.userById(a.approverId);

  const auditHTML = a.audit.map(s => {
    const who = D.userById(s.actorId);
    const cls = s.step === "approved" ? "" : s.step === "denied" ? "denied" : "";
    return `<div class="audit-step ${cls}"><span class="dot"></span>${s.step} by ${who?.name || ""} — ${s.note}<span class="text-soft">${s.ts}</span></div>`;
  }).join("");

  const isPending = a.status === "pending";
  const actionBtns = isPending
    ? `<button class="btn btn-ghost" id="deny-btn">Deny</button>
       <button class="btn btn-success" id="approve-btn">${iconSvg("check", 14)} Approve</button>`
    : `<button class="btn btn-ghost" data-close-right>Close</button>`;

  view.innerHTML = `
    <div class="rp-head">
      <div>
        <div class="title">${a.title}</div>
        <div class="sub">Approval · ${a.status}</div>
      </div>
      <span class="spacer"></span>
      <span class="status-pill ${a.status}">${a.status}</span>
      <button class="rp-close" data-close-right>${iconSvg("close", 14)}</button>
    </div>
    <div class="rp-body">
      <div class="approval-card">
        <h3 style="margin:0 0 6px">${a.title}</h3>
        <div class="text-sm text-muted">${a.description}</div>
        <div class="grid-2 mt-4">
          <div><div class="text-xs text-muted">Amount</div><div class="b mt-2" style="font-size:18px">${a.amount}</div></div>
          <div><div class="text-xs text-muted">Submitted by</div>
            <div class="row gap-2 mt-2"><div class="avatar sm" style="background:${submitter?.color}">${submitter?.initials}</div> ${submitter?.name}</div>
          </div>
          <div><div class="text-xs text-muted">Approver</div>
            <div class="row gap-2 mt-2"><div class="avatar sm" style="background:${approver?.color}">${approver?.initials}</div> ${approver?.name}</div>
          </div>
          <div><div class="text-xs text-muted">Submitted</div><div class="b mt-2">${a.submittedAt}</div></div>
        </div>
        <div class="mt-4">
          <div class="text-xs text-muted">Supporting documents</div>
          <div class="source-pills mt-2">
            ${a.supportingDocs.map(d => `<span class="source-pill">${iconSvg("doc", 12)} ${d.name}</span>`).join("")}
          </div>
        </div>
      </div>

      ${isPending ? `
      <div class="form-field">
        <label>Comment (optional)</label>
        <textarea id="approve-comment" style="width:100%;min-height:60px;border:1px solid var(--border);border-radius:8px;padding:8px 10px" placeholder="Leave a note for the submitter"></textarea>
      </div>` : ""}

      <div class="output-sec">
        <h4>Audit trail — immutable</h4>
        <div class="audit-trail mt-2">
          ${auditHTML}
          ${a.status === "approved" ? `<div class="audit-step"><span class="dot"></span>approved by ${approver?.name} — ${a.comment || "Approved"}<span class="text-soft">${a.audit.at(-1)?.ts || ""}</span></div>` : ""}
        </div>
      </div>
    </div>
    <div class="rp-foot">${actionBtns}</div>
  `;

  if (isPending) {
    document.getElementById("approve-btn")?.addEventListener("click", () => {
      showConfirmFoot("approve");
    });
    document.getElementById("deny-btn")?.addEventListener("click", () => {
      showConfirmFoot("deny");
    });
  }

  // Replace the footer with an inline confirmation step. Nothing mutates
  // until the user clicks the second, explicit confirm button — mirrors
  // the audit-trail-is-immutable messaging the approval flow relies on.
  function showConfirmFoot(kind) {
    const foot = view.querySelector(".rp-foot");
    if (!foot) return;
    const noteEl = document.getElementById("approve-comment");
    const note = (noteEl && noteEl.value) || (kind === "approve" ? "Approved" : "Denied");
    const verb = kind === "approve" ? "approving" : "denying";
    const primary = kind === "approve"
      ? `<button class="btn btn-success" id="confirm-primary-btn">${iconSvg("check", 14)} Confirm Approve</button>`
      : `<button class="btn btn-danger" id="confirm-primary-btn">Confirm Deny</button>`;
    foot.outerHTML = `
      <div class="rp-foot rp-confirm-foot" role="alertdialog" aria-live="polite">
        <div class="rp-confirm-msg">
          You are ${verb} <b>${a.title}</b> for <b>${a.amount}</b>.
          <span class="text-soft">This action is immutable and sealed in the audit trail.</span>
        </div>
        <div class="rp-confirm-actions">
          <button class="btn btn-ghost" id="confirm-cancel-btn">Cancel</button>
          ${primary}
        </div>
      </div>
    `;
    document.getElementById("confirm-cancel-btn")?.addEventListener("click", () => {
      renderApprovalReview(containerId, params);
    });
    document.getElementById("confirm-primary-btn")?.addEventListener("click", () => {
      if (kind === "approve") {
        a.status = "approved";
        a.audit.push({ step: "approved", actorId: a.approverId, ts: "now", note });
        a.comment = note;
        showToast("Approved — audit trail sealed.");
      } else {
        a.status = "denied";
        a.audit.push({ step: "denied", actorId: a.approverId, ts: "now", note: note === "Approved" ? "Denied" : note });
        showToast("Denied — audit trail sealed.");
      }
      renderApprovalReview(containerId, params);
    });
  }
}
