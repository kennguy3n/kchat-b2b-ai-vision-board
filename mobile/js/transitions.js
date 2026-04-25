// Toast + screen push/pop helpers for the mobile demo.

export function showToast(message, ms = 2200) {
  const phone = document.getElementById("phone") || document.body;
  const existing = phone.querySelector(".toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = message;
  phone.appendChild(t);
  // double-RAF so the show transition fires reliably
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 220);
  }, ms);
}

export function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

export function pushAnim(el) {
  if (!el) return;
  el.classList.add("push-enter");
  setTimeout(() => el.classList.remove("push-enter"), 260);
}

export function popAnim(el, done) {
  if (!el) return done && done();
  el.classList.add("pop-leave");
  setTimeout(() => {
    el.classList.remove("pop-leave");
    done && done();
  }, 200);
}
