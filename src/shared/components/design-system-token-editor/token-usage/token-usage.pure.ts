import type { TokenKind } from '@/shared/lib/token-discovery.pure';

export const USAGE_PROPERTIES: readonly string[] = [
  'color',
  'background-color',
  'background-image',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'text-decoration-color',
  'column-rule-color',
  'caret-color',
  'accent-color',
  'fill',
  'stroke',
  'box-shadow',
  'text-shadow',
  'filter',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'row-gap',
  'column-gap',
];

const INHERITED = new Set([
  'color',
  'caret-color',
  'accent-color',
  'fill',
  'stroke',
  'text-shadow',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
]);

const COLOUR_SENTINEL = 'color(srgb 1 0 1)';
const SIZE_SENTINEL = '71.7px';

export function sentinelsFor(kind: TokenKind): string[] {
  switch (kind) {
    case 'colour':
      return [COLOUR_SENTINEL];
    case 'size':
      return [SIZE_SENTINEL];
    case 'weight':
      return ['123'];
    case 'font':
      return ['"Token Usage Sentinel", fantasy'];
    default:
      return [COLOUR_SENTINEL, SIZE_SENTINEL];
  }
}

export interface StyleSample {
  id: number;
  parent: number | null;
  pseudo?: '::before' | '::after';
  styles: Record<string, string>;
}

export interface UsageDiff {
  id: number;
  pseudo?: '::before' | '::after';
  properties: string[];
}

const sampleKey = (sample: StyleSample) => `${sample.id}${sample.pseudo ?? ''}`;

export function diffUsage(before: readonly StyleSample[], after: readonly StyleSample[]): UsageDiff[] {
  const beforeByKey = new Map(before.map((sample) => [sampleKey(sample), sample]));
  const moved = after
    .map((sample) => {
      const was = beforeByKey.get(sampleKey(sample));
      const properties = was ? Object.keys(sample.styles).filter((p) => was.styles[p] !== sample.styles[p]) : [];
      return { sample, properties };
    })
    .filter(({ properties }) => properties.length > 0);
  const movedElements = new Map(moved.filter(({ sample }) => !sample.pseudo).map((m) => [m.sample.id, m]));
  return moved.flatMap(({ sample, properties }) => {
    const parent = sample.parent === null ? undefined : movedElements.get(sample.parent);
    const own = properties.filter(
      (p) => !(INHERITED.has(p) && parent?.properties.includes(p) && parent.sample.styles[p] === sample.styles[p]),
    );
    return own.length === 0
      ? []
      : [{ id: sample.id, ...(sample.pseudo ? { pseudo: sample.pseudo } : {}), properties: own }];
  });
}

export interface Markers {
  tag: string;
  slot?: string;
  slide?: string;
  section?: string;
  testid?: string;
}

const markerOf = (m: Markers) => m.slot ?? m.slide ?? m.section ?? m.testid;

export function usageLabel(chain: readonly Markers[]): string {
  const found = chain.flatMap((m) => markerOf(m) ?? []).slice(0, 2);
  return found.length > 0 ? found.reverse().join(' › ') : (chain[0]?.tag ?? '');
}
