// Inline SVG icon library. Keeps everything self-contained so index.html can
// be opened from the filesystem with no server.

const ICONS = {
  search: `<path d="M21 21l-4.3-4.3M17 10.5A6.5 6.5 0 1 1 4 10.5a6.5 6.5 0 0 1 13 0Z"/>`,
  home: `<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5Z"/>`,
  tasks: `<path d="M9 6h12M9 12h12M9 18h12"/><path d="m3 6 2 2 3-3M3 12l2 2 3-3M3 18l2 2 3-3"/>`,
  approve: `<path d="M5 13l4 4L19 7"/><rect x="3" y="3" width="18" height="18" rx="3"/>`,
  doc: `<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.37.27.8.41 1.25.41H21a2 2 0 1 1 0 4h-.09c-.45 0-.88.14-1.25.41Z"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  send: `<path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/>`,
  attach: `<path d="m21 12-8.5 8.5a5 5 0 0 1-7.1-7.1l9-9a3.5 3.5 0 0 1 4.9 4.9l-9 9a2 2 0 0 1-2.8-2.8l8.5-8.5"/>`,
  thread: `<path d="M3 12a9 9 0 1 0 3.5-7.1L3 8M3 3v5h5"/>`,
  reply: `<path d="M9 14 4 9l5-5M4 9h12a4 4 0 0 1 4 4v6"/>`,
  more: `<circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/>`,
  ai: `<path d="M12 2 14 7l5 2-5 2-2 5-2-5-5-2 5-2 2-5ZM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>`,
  back: `<path d="M15 18l-6-6 6-6"/>`,
  close: `<path d="M6 6l12 12M6 18 18 6"/>`,
  check: `<path d="m5 12 5 5L20 7"/>`,
  download: `<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/>`,
  filter: `<path d="M3 5h18M6 12h12M10 19h4"/>`,
  sort: `<path d="M3 7h18M6 12h12M9 17h6"/>`,
  lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/>`,
  shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>`,
  link: `<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>`,
  inbox: `<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z"/>`,
  bell: `<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`,
  expand: `<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>`,
  collapse: `<path d="M4 14h6v6"/><path d="M20 10h-6V4"/><path d="M14 10l7-7"/><path d="M3 21l7-7"/>`,
  emoji: `<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`,
  pin: `<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z"/>`,
  sparkle: `<path d="M12 2 14 7l5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/>`,
  briefcase: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  folder: `<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>`,
};

export function iconSvg(name, size = 16, color = "currentColor") {
  const body = ICONS[name] || "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}
