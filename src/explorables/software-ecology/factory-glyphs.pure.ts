/*
 * The factory's glyphs and icons (design-ADR 0024 §15), as the reference build draws them: SVG markup in a 24-unit box,
 * stroked in the current colour. Glyphs name a role; icons a sign or a toolbar action. Static, trusted strings.
 */

export const GLYPH: Readonly<Record<string, string>> = {
  customer: '<circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />',
  sales: '<path d="M3 12l9-9h8v8l-9 9z" /><circle cx="16" cy="8" r="1.5" />',
  pm: '<path d="M5 21V4" /><path d="M5 4h12l-2.5 4 2.5 4H5" />',
  ba: '<path d="M12 4L5 21" /><path d="M12 4l7 17" /><path d="M7.5 15h9" /><circle cx="12" cy="4" r="1.6" />',
  doc: '<path d="M6 3h9l4 4v14H6z" /><path d="M9 11h7M9 15h7M9 7h4" />',
  eng: '<path d="M8 7l-5 5 5 5" /><path d="M16 7l5 5-5 5" /><path d="M14 4l-4 16" />',
  ops: '<rect x="4" y="4" width="16" height="6" rx="1.5" /><rect x="4" y="14" width="16" height="6" rx="1.5" /><path d="M8 7h.01M8 17h.01" />',
  billing: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" />',
  support:
    '<path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" />',
  lead: '<circle cx="12" cy="9" r="3.6" /><path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" /><path d="M8.5 3.6L12 1.8l3.5 1.8" />',
  qa: '<path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" />',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h2M12 11h2M8 15h2M12 15h2M8 18h2M12 18h4" />',
  bid: '<path d="M6 3h9l4 4v7" /><path d="M6 3v18h7" /><path d="M14 21l6-6 1.5 1.5-6 6H14z" />',
  plan: '<rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 5v15M14 5v15" />',
  hat: '<path d="M6 16v-3a6 6 0 0 1 12 0v3" /><path d="M12 7v4" /><path d="M3 16h18v3H3z" />',
  wrench: '<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z" />',
  stamp: '<path d="M9 3h6l-1 7h-4z" /><path d="M5 14h14v3H5z" /><path d="M4 20h16" />',
  dock: '<path d="M3 21V9l9-5 9 5v12" /><path d="M7 21v-8h10v8" /><path d="M7 16h10" />',
  orders: '<rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M8 11h8M8 15h5" />',
};

export const ICON: Readonly<Record<string, string>> = {
  rework: '<path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" />',
  extra: '<circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2" /><path d="M9 2h6" />',
  escape: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z" /><path d="M12 11v4M12 18v.5" />',
  stamp: '<path d="M9 3h6l-1 7h-4z" /><path d="M5 14h14v3H5z" /><path d="M4 20h16" />',
  complaint: '<path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" />',
  compare:
    '<rect x="3" y="4" width="5" height="16" rx="1" /><rect x="10" y="4" width="5" height="16" rx="1" /><rect x="17" y="4" width="4" height="16" rx="1" />',
  pause: '<path d="M8 5v14M16 5v14" />',
  play: '<path d="M7 4l13 8-13 8z" />',
  fast: '<path d="M3 5l8 7-8 7zM12 5l8 7-8 7z" />',
  download: '<path d="M12 3v12M7 10l5 5 5-5" /><path d="M4 20h16" />',
  upload: '<path d="M12 15V3M7 8l5-5 5 5" /><path d="M4 20h16" />',
  model:
    '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />',
  help: '<circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7v.5M12 17v.5" />',
  close: '<path d="M6 6l12 12M18 6L6 18" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  moon: '<path d="M20 14a8 8 0 1 1-10-10 6.5 6.5 0 0 0 10 10z" />',
  follow: '<circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" />',
  churn:
    '<path d="M4 12h5" /><path d="M9 12l9-7M9 12h11M9 12l9 7" /><path d="M16 3.5l2 1.5-1 2.3M18 10l2 2-2 2M16 20.5l2-1.5-1-2.3" />',
  unread:
    '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" /><circle cx="12" cy="12" r="2.5" /><path d="M4 4l16 16" />',
  complaints: '<path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" />',
  ok: '<circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.7 2.7L16 10" />',
  dot: '<circle cx="12" cy="12" r="5" />',
  clear: '<path d="M4 4v6h6" /><path d="M4.5 15a8 8 0 1 0 1.9-8.3L4 10" />',
  kebab: '<circle cx="12" cy="5" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="12" cy="19" r="1.4" />',
};
