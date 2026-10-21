/* How the cornerstone prints numbers and its light markup, in the locale's conventions. */

/** `16.3k`, `1M`: a token count as the cornerstone prints it, in the locale's decimal mark. */
export function shortTokens(n: number, locale: string): string {
  if (n >= 1e6) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n / 1e6)}M`;
  if (n >= 1000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n / 1000)}k`;
  return String(n);
}

/** `16,300`: a full token count with the locale's grouping. */
export const fullTokens = (n: number, locale: string): string => new Intl.NumberFormat(locale).format(n);

/** A percent as the meter prints it: one decimal below 1, whole above. */
export const percentText = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: n > 0 && n < 1 ? 1 : 0 }).format(n);

/** A share with one decimal, as /context prints it: `8.3`. */
export const oneDecimal = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

/** A signed token delta: `+16,300`, `−84,000`. */
export const deltaText = (n: number, locale: string): string =>
  `${n < 0 ? '−' : '+'}${fullTokens(Math.abs(n), locale)}`;

export interface RichPart {
  readonly kind: 'text' | 'code' | 'bold';
  readonly text: string;
}

const RICH = /(`[^`]+`|\*\*[^*]+\*\*)/;

/** Splits a story text into plain runs, inline `code` and **bold**, the only markup the config uses. */
export function richParts(text: string): readonly RichPart[] {
  return text
    .split(RICH)
    .filter(Boolean)
    .map((run): RichPart => {
      if (run.startsWith('`')) return { kind: 'code', text: run.slice(1, -1) };
      if (run.startsWith('**')) return { kind: 'bold', text: run.slice(2, -2) };
      return { kind: 'text', text: run };
    });
}

/** A story text without its markup, for an accessible name. */
export const plainText = (text: string): string =>
  richParts(text)
    .map((part) => part.text)
    .join('');
