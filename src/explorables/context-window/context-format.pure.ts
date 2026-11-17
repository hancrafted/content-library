export function shortTokens(n: number, locale: string): string {
  if (n >= 1e6) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n / 1e6)}M`;
  if (n >= 1000) return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(n / 1000)}k`;
  return String(n);
}

export const fullTokens = (n: number, locale: string): string => new Intl.NumberFormat(locale).format(n);

export const percentText = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: n > 0 && n < 1 ? 1 : 0 }).format(n);

export const oneDecimal = (n: number, locale: string): string =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n);

export const deltaText = (n: number, locale: string): string =>
  `${n < 0 ? '−' : '+'}${fullTokens(Math.abs(n), locale)}`;

export interface RichPart {
  readonly kind: 'text' | 'code' | 'bold';
  readonly text: string;
}

const RICH = /(`[^`]+`|\*\*[^*]+\*\*)/;

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

export const plainText = (text: string): string =>
  richParts(text)
    .map((part) => part.text)
    .join('');
