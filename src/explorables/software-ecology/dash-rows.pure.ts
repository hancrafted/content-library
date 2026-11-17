// decision: docs/decision-records/0024-software-ecology-flow-model-and-use-case-files.md
import { fillTemplate } from '@/shared/lib/template.pure';
import { effToPos } from './dashboard-readouts.pure.ts';
import type { Dials } from './software-ecology.types';

export type DialKey = 'eff' | 'effv' | 'fan' | 'aiSpeed' | 'aiExtra';

export interface DialRow {
  readonly key: DialKey;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly pos: number;
  readonly text: string;
  readonly ai: boolean;
}

export const num = (x: number): string => (x >= 10 ? Math.round(x).toString() : x.toFixed(1));
export const pct = (x: number): string => `${Math.round(x * 100)} %`;

const withAi = (d: Dials, x: { set: number; eff: number; unit: string; tpl: string }): string =>
  d.ai && x.eff !== x.set
    ? fillTemplate(x.tpl, { set: `${x.set}${x.unit}`, eff: `${x.eff}${x.unit}` })
    : `${x.set}${x.unit}`;

export const rowTexts = (d: Dials, tpl: string): Readonly<Record<DialKey, string>> => ({
  eff: withAi(d, { set: d.eff, eff: d.effEff, unit: ' %', tpl }),
  effv: withAi(d, { set: d.base, eff: d.effv, unit: ' %', tpl }),
  fan: withAi(d, { set: d.fan, eff: d.fanEff, unit: '×', tpl }),
  aiSpeed: `${d.aiSpeed}×`,
  aiExtra: `${d.aiExtra}×`,
});

export const dialRowsOf = (d: Dials, tpl: string): DialRow[] => {
  const t = rowTexts(d, tpl),
    on = (k: string) => d.en.includes(k);
  const rows: (DialRow | false)[] = [
    on('efficiency') && { key: 'eff', min: 0, max: 200, step: 1, pos: effToPos(d.eff), text: t.eff, ai: false },
    on('effectiveness') && { key: 'effv', min: 5, max: 100, step: 1, pos: d.base, text: t.effv, ai: false },
    on('fanout') && { key: 'fan', min: 1, max: 5, step: 0.5, pos: d.fan, text: t.fan, ai: false },
    on('ai') && { key: 'aiSpeed', min: 1, max: 5, step: 0.5, pos: d.aiSpeed, text: t.aiSpeed, ai: true },
    on('ai') && { key: 'aiExtra', min: 1, max: 5, step: 0.5, pos: d.aiExtra, text: t.aiExtra, ai: true },
  ];
  return rows.filter((r): r is DialRow => r !== false);
};
