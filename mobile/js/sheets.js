// Bottom sheet primitive. Renders content into #sheet-body and toggles the
// .open class on #sheet-root. Tap on the backdrop or grabber dismisses.

const root = () => document.getElementById("sheet-root");
const body = () => document.getElementById("sheet-body");

export function openSheet(html, { onMount } = {}) {
  const r = root();
  if (!r) return;
  body().innerHTML = html;
  r.classList.add("open");
  r.setAttribute("aria-hidden", "false");
  if (typeof onMount === "function") onMount(body());
}

export function closeSheet() {
  const r = root();
  if (!r) return;
  r.classList.remove("open");
  r.setAttribute("aria-hidden", "true");
  setTimeout(() => { if (!r.classList.contains("open")) body().innerHTML = ""; }, 260);
}

export function initSheet() {
  const r = root();
  if (!r) return;
  r.addEventListener("click", (e) => {
    const action = e.target.closest("[data-sheet-action]")?.dataset.sheetAction;
    if (action === "close") closeSheet();
  });
}
