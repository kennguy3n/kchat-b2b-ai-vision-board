// Thin wrappers around modal open/close and escape handling.

const backdrops = () => document.querySelectorAll(".modal-backdrop");

export function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add("active");
  el.setAttribute("aria-hidden", "false");
}

export function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("active");
  el.setAttribute("aria-hidden", "true");
}

export function closeAllModals() {
  backdrops().forEach(m => m.classList.remove("active"));
}

export function initModals() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllModals();
  });
  backdrops().forEach(bd => {
    bd.addEventListener("click", (e) => {
      if (e.target === bd) closeAllModals();
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close-modal");
      if (id) closeModal(id);
      else closeAllModals();
    });
  });
}
