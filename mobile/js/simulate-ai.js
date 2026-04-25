/* KChat prototype — simulate AI with typing indicator + delayed card reveal. */

window.KAI = (function() {

  function typingHTML(label) {
    return (
      '<div class="ai-thinking">' +
        '<div class="typing">' +
          '<span class="ai-star">✦</span>' +
          '<div class="dots"><span></span><span></span><span></span></div>' +
        '</div>' +
        '<div class="muted-2 text-xs">' + (label || 'KChat AI is thinking…') + '</div>' +
      '</div>'
    );
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /**
   * Show typing, then fade in content.
   * @param {HTMLElement} host
   * @param {string} finalHTML
   * @param {number} delay
   * @param {string} label
   */
  async function processInto(host, finalHTML, delay, label) {
    if (!host) return;
    const prev = host.dataset.aiState;
    if (prev === 'done') return;
    host.innerHTML = typingHTML(label);
    await sleep(delay || 1400);
    host.innerHTML = finalHTML;
    host.dataset.aiState = 'done';
    host.querySelectorAll('.reveal-child').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.animationDelay = (i * 90) + 'ms';
    });
    // trigger reveal animation on the whole host if applicable
    host.classList.remove('reveal');
    void host.offsetWidth;
    host.classList.add('reveal');
  }

  function resetHost(host) {
    if (!host) return;
    host.dataset.aiState = '';
  }

  // Long-press simulation: mousedown/touchstart, hold ~500ms
  function attachLongPress(el, onLongPress, duration) {
    if (!el) return;
    duration = duration || 500;
    let timer = null;
    let triggered = false;
    const start = (e) => {
      if (e.button === 2) return; // right click handled separately
      triggered = false;
      timer = setTimeout(() => { triggered = true; onLongPress(e); }, duration);
    };
    const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchmove', cancel);
    // Shortcut: right-click always triggers
    el.addEventListener('contextmenu', (e) => { e.preventDefault(); onLongPress(e); });
  }

  return { processInto, sleep, resetHost, attachLongPress, typingHTML };
})();
