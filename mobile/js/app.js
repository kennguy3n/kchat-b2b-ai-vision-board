/* KChat B2B mobile — navigation, screen lifecycle, AI simulation wiring.
 * Mirrors prototype/js/app.js from the B2C vision board (same history
 * stack, same showScreen/goBack/updateTabs/DEMO pattern) with the
 * screen map pointed at B2B-specific screens. */

(function() {
  'use strict';

  // ---- Clock ----
  function updateClock() {
    const t = new Date();
    const hh = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    document.querySelectorAll('[data-clock]').forEach(el => el.textContent = hh + ':' + mm);
  }
  setInterval(updateClock, 30000);

  // ---- App state ----
  // Shared across screens that need tenant-awareness (channel list,
  // community strip). Persisted in localStorage so switching tenants
  // survives a hash-driven reload.
  const state = {
    tenantId: localStorage.getItem('kchat-b2b-tenant') || 't-acme',
  };

  // ---- Navigation ----
  const history = [];
  let currentScreen = null;

  function showScreen(id, opts) {
    opts = opts || {};
    const target = document.getElementById('screen-' + id);
    if (!target) { console.warn('Screen not found:', id); return; }

    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active', 'back-in');
    });

    // Reset any AI simulation state that should replay on re-entry
    target.querySelectorAll('[data-ai-slot]').forEach(el => {
      if (el.dataset.aiReset === 'always') {
        el.dataset.aiState = '';
        el.innerHTML = '';
      }
    });

    target.classList.add('active');
    if (opts.back) target.classList.add('back-in');
    currentScreen = id;

    // A11y: move focus to the topbar title or back button so screen
    // readers announce the new screen
    setTimeout(() => {
      const focusTarget = target.querySelector('.topbar .back-btn, .topbar .title, .launcher-title');
      if (!focusTarget) return;
      if (!focusTarget.matches('button, a, input, textarea, select, [tabindex]')) {
        focusTarget.setAttribute('tabindex', '-1');
      }
      focusTarget.focus({ preventScroll: true });
    }, 300);

    if (!opts.replace && !opts.back) history.push(id);

    updateTabs(id);

    if (typeof SCREEN_ENTER[id] === 'function') {
      SCREEN_ENTER[id](target);
    }

    const content = target.querySelector('.content');
    if (content) content.scrollTop = 0;

    DEMO.onScreen(id);
  }

  function goBack() {
    if (history.length <= 1) { showScreen('launcher', { replace: true }); return; }
    history.pop();
    const prev = history[history.length - 1] || 'launcher';
    showScreen(prev, { back: true });
  }

  // Map B2B screens to one of the 5 B2C tabs:
  //   chats · notifications · tasks · settings · more
  function updateTabs(screenId) {
    const map = {
      // Message tab (workspace home + channel flows + AI flows + email)
      home: 'chats',
      'channel-list':       'chats',
      'channel-chat':       'chats',
      'thread-detail':      'chats',
      'action-launcher':    'chats',
      'brief-builder':      'chats',
      'ai-processing':      'chats',
      'ai-output-review':   'chats',
      'artifact-workspace': 'chats',
      'email-detail':       'chats',
      'long-press-menu':    'chats',
      'template-gallery':   'chats',

      // Notification tab
      notifications: 'notifications',

      // Tasks tab (Tasks segment + Approvals segment + details)
      'task-list':      'tasks',
      'task-detail':    'tasks',
      'approval-list':  'tasks',
      'approval-form':  'tasks',
      'approval-review':'tasks',
      'form-view':      'tasks',
      'base-view':      'tasks',
      'sheet-view':     'tasks',

      // Settings tab (AI Employees front-and-centre)
      settings: 'settings',
      'ai-employee-list':    'settings',
      'ai-employee-detail':  'settings',
      'ai-memory':           'settings',
      'compute-transparency':'settings',
      'connectors':          'settings',

      // More tab
      more: 'more',
      'search':            'more',
      'metrics-dashboard': 'more',
      'ai-insights':       'more',
      'packaging-tiers':   'more',
      'voice-capture':     'more',
    };

    const tab = map[screenId];
    document.querySelectorAll('.tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tab);
    });

    // Tab bar visibility — show on primary screens only, hide on deep
    // flows (same pattern as B2C)
    const tabbar = document.getElementById('tabbar');
    if (tabbar) {
      const showOn = [
        'home', 'channel-list', 'channel-chat',
        'notifications',
        'task-list', 'approval-list',
        'settings', 'ai-employee-list',
        'connectors', 'ai-memory', 'compute-transparency',
        'more', 'search', 'metrics-dashboard', 'ai-insights', 'packaging-tiers',
      ];
      tabbar.style.display = showOn.indexOf(screenId) >= 0 ? '' : 'none';
    }
  }

  function onTabClick(tab) {
    switch (tab) {
      // Chat app → Message tab lands on the channel list (chat-first),
      // not the workspace dashboard. The dashboard is still reachable
      // via the 🏠 topbar icon on the channel list.
      case 'chats':         showScreen('channel-list'); break;
      case 'notifications': showScreen('notifications'); break;
      case 'tasks':         showScreen('task-list'); break;
      case 'settings':      showScreen('settings'); break;
      case 'more':          showScreen('more'); break;
    }
  }

  // ---- Toast ----
  function toast(msg, ms) {
    const host = document.getElementById('toast-host');
    if (!host) return;
    const t = document.createElement('div');
    t.className = 'demo-toast';
    t.innerHTML = `<div class="demo-dot"></div><div>${msg}</div>`;
    host.appendChild(t);
    setTimeout(() => { t.remove(); }, ms || 2400);
  }

  // ---- Privacy strip helper (matches B2C) ----
  function privacyStrip(variant) {
    const data = (window.KDATA && window.KDATA.privacyStrips[variant]) || window.KDATA.privacyStrips.local;
    const icon = data.remote ? '🌐' : '🔒';
    return `<div class="privacy-strip">
      <span class="privacy-icon">${icon}</span>
      <span><strong>${data.label}</strong> <span class="privacy-dot">·</span> Sources: ${data.sources} <span class="privacy-dot">·</span> ${data.note}</span>
    </div>`;
  }

  // ---- Tasks/Approvals segmented control ----
  function wireTasksSegmented() {
    const seg = document.getElementById('tasks-segmented');
    if (!seg || seg.dataset.wired) return;
    seg.dataset.wired = '1';
    const listView = document.getElementById('tasks-view-list');
    const apprView = document.getElementById('tasks-view-approvals');
    seg.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const which = btn.dataset.seg;
        if (!listView || !apprView) return;
        if (which === 'approvals') { listView.style.display = 'none'; apprView.style.display = ''; }
        else                         { listView.style.display = '';     apprView.style.display = 'none'; }
      });
    });
  }

  // ---- Long press on AI message in #vendor-management ----
  function wireLongPresses() {
    const msg = document.getElementById('msg-m-v-6');
    if (msg && !msg.dataset.lpWired) {
      msg.dataset.lpWired = '1';
      KAI.attachLongPress(msg, () => showScreen('long-press-menu'));
      if (!msg.hasAttribute('tabindex')) msg.setAttribute('tabindex', '0');
      if (!msg.hasAttribute('role')) msg.setAttribute('role', 'button');
      if (!msg.hasAttribute('aria-label')) {
        msg.setAttribute('aria-label', 'Message from Kara Ops AI. Press Enter for AI actions.');
      }
      msg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showScreen('long-press-menu'); }
      });
    }
  }

  // ---- Theme toggle ----
  function toggleTheme() {
    const body = document.body;
    const current = body.dataset.theme === 'dark' ? 'light' : 'dark';
    body.dataset.theme = current;
    localStorage.setItem('kchat-b2b-theme', current);
    updateThemeButton();
  }
  function updateThemeButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = (document.body.dataset.theme === 'dark' ? '☀️ Light' : '🌙 Dark');
  }

  // ---- Channel list: community strip + rich channel rows ----
  // Mirrors the real KChat UX — horizontal community icons at the top
  // (each = one tenant/workspace), the active community name/member
  // count as the topbar, and "Joined groups (N)" sections built from
  // KDATA.channels filtered by tenantId.

  function channelsForActiveTenant() {
    const all = window.KDATA.channels || [];
    return all.filter(c => c.tenantId === state.tenantId);
  }

  function tenantById(tid) {
    return (window.KDATA.tenants || []).find(t => t.id === tid) || null;
  }

  // Accepts either a pre-formatted string ("09:46", "Yesterday", "Mar 10")
  // or a numeric `ts` (epoch ms). For the static demo data strings are
  // already human-friendly — so we pass them through unchanged. The
  // numeric path exists so a future real data source can be dropped in
  // without touching the renderer.
  function relativeTime(c) {
    if (!c) return '';
    if (typeof c.time === 'string' && c.time) return c.time;
    const ts = typeof c.ts === 'number' ? c.ts : null;
    if (ts == null) return '';
    const now = Date.now();
    const diff = now - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return mins + 'm';
    const hours = Math.floor(mins / 60);
    if (hours < 24) {
      const d = new Date(ts);
      const hh = d.getHours();
      const mm = String(d.getMinutes()).padStart(2, '0');
      const am = hh < 12 ? 'AM' : 'PM';
      const h12 = ((hh + 11) % 12) + 1;
      return h12 + ':' + mm + ' ' + am;
    }
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    if (days < 7) return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(ts).getDay()];
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  }

  // Circular group avatar for a channel — first letter of the name,
  // colored per channel.color. Uses the same `.avatar` tokens already
  // defined for tenant switcher / DM rows so the palette stays in sync.
  function channelAvatarHTML(c) {
    if (c.pinned && c.emoji) {
      return `<span class="channel-avatar avatar ${c.color || 'a5'}" aria-hidden="true">${c.emoji}</span>`;
    }
    const letter = (c.name || '#').replace(/^#/, '').charAt(0).toUpperCase();
    return `<span class="channel-avatar avatar ${c.color || 'a2'}" aria-hidden="true">${letter}</span>`;
  }

  function lastMessagePreview(c) {
    // Static demo data already stores last message as "Sender: text".
    // Fall back to a generic line so the row is never empty.
    return c.last || (c.members ? (c.members + ' members') : 'No messages yet');
  }

  function channelRow(c) {
    const unread = c.unread || 0;
    const badge = unread > 0 ? `<span class="tab-badge" style="position:static;">${unread}</span>` : '';
    const name = c.pinned ? c.name : '#' + c.name;
    return `
      <div class="channel-row channel-row-rich${c.pinned ? ' pinned' : ''}"
           data-action="open-channel" data-channel-id="${c.id}"
           role="button" tabindex="0" aria-label="Open ${c.name}">
        ${channelAvatarHTML(c)}
        <div class="info">
          <div class="row-top">
            <span class="name">${name}</span>
            <span class="time">${relativeTime(c)}</span>
          </div>
          <div class="row-bot">
            <span class="last">${lastMessagePreview(c)}</span>
            ${badge}
          </div>
        </div>
      </div>`;
  }

  function communityStripHTML() {
    const tenants = window.KDATA.tenants || [];
    const tiles = tenants.map(t => {
      const active = t.id === state.tenantId;
      return `
        <button class="community-icon${active ? ' active' : ''}"
                data-action="switch-tenant" data-tenant-id="${t.id}"
                aria-label="Switch to ${t.name}" aria-pressed="${active}">
          <span class="community-icon-inner avatar ${t.color || 'a2'}">${t.avatar || t.short || 'T'}</span>
          <span class="community-icon-label">${t.short || t.name}</span>
        </button>`;
    }).join('');
    // Leading personal-chat bubble is a mode switcher (B2C-style DMs),
    // NOT a peer community — hence no label and a vertical divider
    // separating it from the B2B community icons on the right.
    return `
      <div class="community-strip" role="tablist" aria-label="Communities">
        <button class="community-icon chat active-chat" aria-label="Personal chats" disabled>
          <span class="community-icon-inner avatar a2">💬</span>
        </button>
        <span class="community-strip-divider" role="separator" aria-hidden="true"></span>
        ${tiles}
        <button class="community-icon plus" data-action="join-community" aria-label="Join a community">
          <span class="community-icon-inner">+</span>
          <span class="community-icon-label">Join</span>
        </button>
      </div>`;
  }

  function tenantHeaderHTML(tenant) {
    if (!tenant) return '';
    const members = tenant.members || 0;
    return `
      <div class="tenant-header" data-action="open-tenant" tabindex="0"
           aria-label="Open ${tenant.name} workspace">
        <div class="tenant-header-main">
          <div class="tenant-header-name">
            <span>${tenant.name}</span>
            <span class="tenant-header-caret" aria-hidden="true">›</span>
          </div>
          <div class="tenant-header-sub">
            <span class="tenant-header-sub-icon" aria-hidden="true">🌐</span>
            General · ${members} members
          </div>
        </div>
        <button class="tenant-header-search" data-action="search"
                onclick="event.stopPropagation(); KApp.show('search')"
                aria-label="Search">🔎</button>
      </div>`;
  }

  function renderChannelList(root) {
    const stripHost   = root.querySelector('[data-community-strip]');
    const headerHost  = root.querySelector('[data-tenant-header]');
    const listHost    = root.querySelector('[data-channel-list-body]');
    if (!listHost || !stripHost) return;

    const tenant = tenantById(state.tenantId);
    const channels = channelsForActiveTenant();
    const pinned = channels.filter(c => c.pinned);
    const joined = channels.filter(c => !c.pinned);

    // Group joined channels by domain (keeps the B2B ops/sales/etc.
    // breakdown) but under a single "Joined groups (N)" section header,
    // matching the KChat reference screenshot.
    const byDomain = {};
    const order = [];
    joined.forEach(c => {
      if (!byDomain[c.domain]) { byDomain[c.domain] = []; order.push(c.domain); }
      byDomain[c.domain].push(c);
    });

    const pinnedHTML = pinned.length ? `
      <div class="domain-group pinned-group">
        <div class="domain-header"><span>📌 Announcement</span></div>
        <div class="domain-channels">${pinned.map(channelRow).join('')}</div>
      </div>` : '';

    const joinedHeaderCount = joined.length;
    const joinedHTML = joined.length ? `
      <div class="section-title channel-section-title">
        Joined groups (${joinedHeaderCount})
      </div>
      ${order.map(dom => `
        <div class="domain-group">
          <div class="domain-header"><span>${dom}</span><span class="chevron">▾</span></div>
          <div class="domain-channels">${byDomain[dom].map(channelRow).join('')}</div>
        </div>`).join('')}
    ` : `<div class="text-sm muted-2" style="padding:24px 0;text-align:center;">
      No channels yet in this community.
    </div>`;

    stripHost.innerHTML = communityStripHTML();
    if (headerHost) headerHost.innerHTML = tenantHeaderHTML(tenant);
    listHost.innerHTML = pinnedHTML + joinedHTML;

    // Topbar stays generic ("👥 Community"). The active tenant name +
    // member count render BELOW the strip as a dedicated section
    // header (see tenantHeaderHTML) — putting the tenant name in the
    // topbar above the strip reads as "everything below is inside
    // this tenant", which is the opposite of what the strip means.

    wireChannelList(root);
  }

  function wireChannelList(root) {
    if (root.dataset.clWired) return;
    root.dataset.clWired = '1';
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-action]');
      if (!el || !root.contains(el)) return;
      const action = el.dataset.action;
      if (action === 'switch-tenant') {
        const tid = el.dataset.tenantId;
        switchTenant(tid);
      } else if (action === 'open-channel') {
        showScreen('channel-chat');
      } else if (action === 'open-tenant') {
        showScreen('home');
      } else if (action === 'join-community') {
        toast('Community join flow is not wired in this demo');
      }
    });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('[data-action="open-channel"]');
      if (!el || !root.contains(el)) return;
      e.preventDefault();
      showScreen('channel-chat');
    });
  }

  function switchTenant(tid) {
    if (!tid || tid === state.tenantId) return;
    const t = tenantById(tid);
    if (!t) return;
    state.tenantId = tid;
    localStorage.setItem('kchat-b2b-tenant', tid);
    toast('Switched to ' + t.name);
    const root = document.getElementById('screen-channel-list');
    if (root && currentScreen === 'channel-list') renderChannelList(root);
  }

  // ---- Screen enter hooks (AI simulations + channel list) ----
  const SCREEN_ENTER = {
    'channel-list'(root) {
      renderChannelList(root);
    },

    'ai-processing'(root) {
      // Auto-advance to output review after a brief animation
      const slot = root.querySelector('[data-ai-slot="processing"]');
      if (!slot || slot.dataset.aiState === 'done') return;
      const steps = [
        'Reading #specs thread + research folder…',
        'Synthesizing exec summary and 6 sections…',
        'Citing sources and computing per-section confidence…',
        'Formatting draft for review…',
      ];
      const html = `
        <div class="ai-processing-steps">
          ${steps.map((s, i) => `<div class="ai-step" data-i="${i}"><span class="ai-step-dot"></span>${s}</div>`).join('')}
        </div>
        <div class="privacy-strip"><span class="privacy-icon">🔒</span><span><strong>On-device</strong> <span class="privacy-dot">·</span> Sources stay in workspace</span></div>
      `;
      slot.innerHTML = html;
      slot.dataset.aiState = 'running';
      const stepEls = slot.querySelectorAll('.ai-step');
      let i = 0;
      const tick = () => {
        if (i < stepEls.length) {
          stepEls[i].classList.add('active');
          i++;
          setTimeout(tick, 700);
        } else {
          slot.dataset.aiState = 'done';
          setTimeout(() => {
            if (currentScreen === 'ai-processing') showScreen('ai-output-review');
          }, 600);
        }
      };
      setTimeout(tick, 400);
    },

    'ai-output-review'(root) {
      const slot = root.querySelector('[data-ai-slot="ai-output"]');
      if (!slot || slot.dataset.aiState === 'done') return;
      const art = window.KDATA.artifact;
      const sectionsHTML = art.sections.map((s, i) => `
        <div class="ai-output-section reveal-child">
          <div class="ai-output-head">
            <span class="ai-output-num">${i + 1}</span>
            <strong>${s.h}</strong>
            <span class="confidence">${s.conf}%</span>
          </div>
          <div class="ai-output-body">${s.body}</div>
          <div class="ai-output-foot">
            <span class="source-pin">📎 ${s.citations} citations</span>
            <button class="chip chip-ai" onclick="KApp.toast('Section chat · Kara is listening')"><span class="ai-star">✦</span> Refine</button>
          </div>
        </div>`).join('');
      const finalHTML = `
        <div class="card card-ai">
          <div class="card-header">
            <div class="icon-box">✦</div>
            <div class="title">${art.title}<div class="text-xs muted-2">by ${art.owner} · ${art.kind} · ${art.confidence}% confidence</div></div>
          </div>
          <div class="row gap-4 mt-8"><span class="ai-badge"><span class="ai-star">✦</span> ${art.compute}</span><span class="badge ai">${art.sections.length} sections</span></div>
        </div>
        ${sectionsHTML}
        ${privacyStrip('local')}
      `;
      KAI.processInto(slot, finalHTML, 900, 'Kara is finalizing…');
    },

    'task-detail'(root) {
      const slot = root.querySelector('[data-ai-slot="task-detail"]');
      if (!slot || slot.dataset.aiState === 'done') return;
      const finalHTML = `
        <div class="task-detail-card reveal-child">
          <h3>Review NimbusLogix renewal terms</h3>
          <div class="task-meta"><span>📅 Fri Apr 26 · 5 PM</span><span>💬 #vendor-management</span><span class="ai-chip-label"><span class="ai-star">✦</span> AI-extracted</span></div>
          <div class="mt-12 text-sm">Kara Ops AI flagged 2 clauses in the NimbusLogix renewal that need legal review before Friday:</div>
          <ul class="mt-8 text-sm" style="padding-left:18px;">
            <li>Clause 8.2 — data processing addendum references a superseded DPA version.</li>
            <li>Clause 12.1 — auto-renewal window shortened from 90 to 30 days.</li>
          </ul>
        </div>
        <div class="card reveal-child">
          <div class="card-header"><div class="icon-box" style="background:#DBEAFE;color:#1E40AF;">🔗</div><div class="title">Linked objects</div></div>
          <div class="col gap-8 text-sm">
            <div class="quick-link" onclick="KApp.show('email-detail')">✉ Orbix remediation v3 email<span class="chevron">›</span></div>
            <div class="quick-link" onclick="KApp.show('base-view')">🗂 Vendor Register entry<span class="chevron">›</span></div>
            <div class="quick-link" onclick="KApp.show('thread-detail')">💬 Vendor review thread<span class="chevron">›</span></div>
          </div>
        </div>
        ${privacyStrip('local')}
        <div class="col gap-8 mt-12">
          <button class="btn btn-primary btn-full btn-lg" onclick="KApp.toast('Task marked complete'); KApp.show('task-list', { replace: true });">Mark complete</button>
          <button class="btn btn-outline btn-full" onclick="KApp.toast('Snoozed until Monday')">Snooze to Mon 9 AM</button>
        </div>
      `;
      KAI.processInto(slot, finalHTML, 650, 'Loading task…');
    },

    'approval-review'(root) {
      const slot = root.querySelector('[data-ai-slot="approval-review"]');
      if (!slot || slot.dataset.aiState === 'done') return;
      const a = window.KDATA.approvals[0]; // ap-orbix
      const auditHTML = a.audit.map(e => `
        <div class="audit-row reveal-child">
          <span class="audit-time">${e.t}</span>
          <div class="audit-body"><strong>${e.who}</strong><div class="text-xs muted-2">${e.action}</div></div>
        </div>`).join('');
      const finalHTML = `
        <div class="approval-hero reveal-child">
          <div class="approval-amount">${a.amount}</div>
          <div class="approval-title">${a.title}</div>
          <div class="approval-meta">${a.kind}</div>
          <div class="row gap-4 mt-8" style="justify-content:center;">
            <span class="badge warn">${a.status}</span>
            <span class="badge neutral">SLA ${a.slaDue}</span>
          </div>
        </div>
        <div class="card reveal-child">
          <div class="card-header"><div class="icon-box">👤</div><div class="title">Request<div class="text-xs muted-2">by ${a.requester} · ${a.channel} · ${a.filed}</div></div></div>
          <div class="card-body text-sm">Two Orbix shipments are blocked on a payment hold from the prior remediation dispute. Releasing this hold lets Logistics resume service by Thursday. Kara flagged an on-device risk review — no PII exposure.</div>
        </div>
        <div class="section-title reveal-child">Audit trail</div>
        <div class="audit-trail">${auditHTML}</div>
        ${privacyStrip('confidential')}
        <div class="col gap-8 mt-12">
          <button id="approve-btn" class="btn btn-primary btn-full btn-lg" onclick="KApp.confirmApprove()">Approve ${a.amount}</button>
          <button class="btn btn-outline btn-full" onclick="KApp.toast('Sent back with comments')">Request changes</button>
          <button class="btn btn-ghost btn-full" onclick="KApp.toast('Approval denied'); KApp.show('approval-list', { replace: true });">Deny</button>
        </div>
      `;
      KAI.processInto(slot, finalHTML, 700, 'Loading approval…');
    },

    'ai-employee-detail'(root) {
      const slot = root.querySelector('[data-ai-slot="ai-employee-detail"]');
      if (!slot || slot.dataset.aiState === 'done') return;
      const kara = window.KDATA.aiEmployees[0];
      const pct = Math.round((kara.budget.spent / kara.budget.cap) * 100);
      const queueHTML = kara.queue.map(q => {
        const dot = q.state === 'running' ? 'running' : q.state === 'blocked' ? 'blocked' : q.state === 'done' ? 'done' : 'queued';
        return `<div class="queue-row reveal-child">
          <span class="queue-dot ${dot}"></span>
          <div class="queue-body">
            <div class="text-sm"><strong>${q.title}</strong></div>
            <div class="text-xs muted-2">${q.state}${q.reason ? ' · ' + q.reason : ''} · ${q.ts}</div>
          </div>
        </div>`;
      }).join('');
      const finalHTML = `
        <div class="ai-employee-hero reveal-child">
          <div class="avatar ${kara.color}" style="width:72px;height:72px;font-size:24px;">${kara.avatar}</div>
          <div>
            <div class="ai-employee-name">${kara.name}</div>
            <div class="text-sm muted">${kara.role}</div>
            <div class="row gap-4 mt-8"><span class="ai-badge"><span class="ai-star">✦</span> ${kara.compute}</span><span class="badge success">Ready</span></div>
          </div>
        </div>
        <div class="section-title reveal-child">Monthly AI budget</div>
        <div class="budget-card reveal-child">
          <div class="row" style="justify-content:space-between;"><strong>$${kara.budget.spent.toFixed(2)}</strong><span class="text-xs muted-2">of $${kara.budget.cap.toFixed(0)} · ${pct}%</span></div>
          <div class="budget-bar"><div class="budget-fill" style="width:${pct}%;"></div></div>
          <div class="text-xs muted-2 mt-8">Resets Fri May 1 · Admin can raise the cap in Settings → Billing</div>
        </div>
        <div class="section-title reveal-child">Allowed channels</div>
        <div class="chip-row reveal-child">
          ${kara.channels.map(c => `<span class="chip">#${c}</span>`).join('')}
          <span class="chip" style="border-style:dashed;">+ Add</span>
        </div>
        <div class="section-title reveal-child">Queue</div>
        <div class="queue-list">${queueHTML}</div>
        ${privacyStrip('local')}
        <div class="col gap-8 mt-12">
          <button class="btn btn-primary btn-full" onclick="KApp.show('channel-chat')">Open Kara's channel</button>
          <button class="btn btn-outline btn-full" onclick="KApp.toast('Kara paused until you re-enable her')">Pause Kara</button>
        </div>`;
      KAI.processInto(slot, finalHTML, 800, 'Loading profile…');
    },

    notifications(root) {
      // Nothing to animate — static lists are in the markup.
      root.querySelectorAll('.reveal-child').forEach((el, i) => {
        el.classList.add('reveal');
        el.style.animationDelay = (i * 60) + 'ms';
      });
    },
  };

  // ---- Approval confirm (two-step per mobile UX principles) ----
  let pendingApprove = false;
  function confirmApprove() {
    const btn = document.getElementById('approve-btn');
    if (!btn) return;
    if (!pendingApprove) {
      pendingApprove = true;
      btn.classList.add('btn-danger');
      btn.classList.remove('btn-primary');
      btn.textContent = 'Tap again to confirm · $42,500';
      setTimeout(() => {
        pendingApprove = false;
        if (document.getElementById('approve-btn')) {
          btn.classList.remove('btn-danger');
          btn.classList.add('btn-primary');
          btn.textContent = 'Approve $42,500';
        }
      }, 2500);
      return;
    }
    pendingApprove = false;
    toast('Approved · $42,500 released to Orbix');
    setTimeout(() => showScreen('notifications', { replace: true }), 800);
  }

  // ---- Long-press menu actions ----
  function menuAction(action) {
    switch (action) {
      case 'thread':        showScreen('thread-detail'); break;
      case 'extract-tasks': toast('Kara extracted 5 tasks'); showScreen('task-list'); break;
      case 'summarize':     toast('Thread summary posted inline'); showScreen('channel-chat', { replace: true }); break;
      case 'create-task':   showScreen('task-detail'); break;
      case 'translate':     toast('Translated to English'); showScreen('channel-chat', { replace: true }); break;
      case 'remind':        toast('Reminder set · Fri 4 PM'); showScreen('channel-chat', { replace: true }); break;
    }
  }

  // ---- Action launcher intent handler ----
  function pickIntent(intent) {
    if (intent === 'create' || intent === 'plan') { showScreen('brief-builder'); return; }
    if (intent === 'analyze') { toast('Kara drafting summary of this channel'); showScreen('ai-processing'); return; }
    if (intent === 'approve') { showScreen('approval-form'); return; }
    showScreen('brief-builder');
  }

  // ---- Guided demo runner ----
  const DEMO = {
    path: null,
    idx: 0,
    start(pathId) {
      this.path = pathId;
      this.idx = 0;
      const steps = window.KDATA.demoSteps[pathId];
      if (!steps || !steps.length) return;
      showScreen(steps[0].screen, { replace: true });
      setTimeout(() => this.renderHint(), 300);
    },
    onScreen(screenId) {
      if (!this.path) return;
      const steps = window.KDATA.demoSteps[this.path];
      if (!steps) return;
      for (let i = this.idx; i < steps.length; i++) {
        if (steps[i].screen === screenId) { this.idx = i; break; }
      }
      this.renderHint();
    },
    renderHint() {
      if (!this.path) return;
      const steps = window.KDATA.demoSteps[this.path];
      const step = steps[this.idx];
      if (!step) { this.end(); return; }
      this.clearHint();
      if (step.target) {
        const el = document.querySelector(step.target);
        if (el) el.classList.add('demo-pulse');
      }
      const host = document.getElementById('toast-host');
      host.innerHTML = '';
      const t = document.createElement('div');
      t.className = 'demo-toast';
      const remaining = steps.length - this.idx - 1;
      t.innerHTML = `<div class="demo-dot"></div><div><strong style="color:#A5B4FC;">Demo · step ${this.idx + 1}/${steps.length}</strong><br>${step.hint}</div><button class="btn btn-sm btn-ghost" style="color:white; margin-left:auto;" onclick="KApp.endDemo()">${remaining === 0 ? 'Finish' : 'Skip'}</button>`;
      host.appendChild(t);
    },
    clearHint() {
      document.querySelectorAll('.demo-pulse').forEach(el => el.classList.remove('demo-pulse'));
      const host = document.getElementById('toast-host');
      if (host) host.innerHTML = '';
    },
    end() {
      this.path = null;
      this.idx = 0;
      this.clearHint();
      showScreen('launcher', { replace: true });
    },
  };

  // ---- Public API ----
  window.KApp = {
    show: showScreen,
    back: goBack,
    toast: toast,
    onTabClick,
    menuAction,
    pickIntent,
    confirmApprove,
    toggleTheme,
    privacyStrip,
    wireLongPresses,
    switchTenant,
    state,
    startDemo: (p) => DEMO.start(p),
    endDemo: () => DEMO.end(),
  };

  // ---- Init ----
  function init() {
    const saved = localStorage.getItem('kchat-b2b-theme');
    if (saved) document.body.dataset.theme = saved;
    updateThemeButton();
    updateClock();
    wireLongPresses();
    wireTasksSegmented();

    const hash = window.location.hash.replace(/^#/, '');
    if (hash && document.getElementById('screen-' + hash)) {
      showScreen(hash, { replace: true });
    } else {
      showScreen('launcher', { replace: true });
    }

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace(/^#/, '');
      if (h && document.getElementById('screen-' + h)) showScreen(h, { replace: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
