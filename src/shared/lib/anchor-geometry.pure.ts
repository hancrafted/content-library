function pixels(value: string) {
  const text = value.trim();
  if (text === '0') return 0;
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?px$/i.test(text)) return 0;
  const number = Number(text.slice(0, -2));
  return Number.isFinite(number) ? number : 0;
}

/** Computed margins are pixels; root padding is pixels or scrollport-height percentages. Auto/invalid values are zero. */
export function anchorOffset({ margin, padding, viewport }: { margin: string; padding: string; viewport: number }) {
  const text = padding.trim();
  const percentage = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?%$/i.test(text);
  const value = percentage ? (Number(text.slice(0, -1)) / 100) * viewport : pixels(text);
  return pixels(margin) + (Number.isFinite(value) ? value : 0);
}

/** A document-coordinate landing within measured scroll limits; non-finite offsets contribute zero. */
export function anchorLanding({ top, offset = 0, maximum }: { top: number; offset?: number; maximum: number }) {
  return Math.max(0, Math.min(top - (Number.isFinite(offset) ? offset : 0), maximum));
}
