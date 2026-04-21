// Small animation / transition helpers

export function fadeSwap(el, updater) {
  if (!el) return;
  el.style.transition = "opacity 140ms ease";
  el.style.opacity = "0";
  setTimeout(() => {
    updater();
    el.style.opacity = "1";
  }, 140);
}

export function showToast(message, ms = 2200) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}
