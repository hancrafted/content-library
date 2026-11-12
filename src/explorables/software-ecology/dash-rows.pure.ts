/*
 * A dashboard's Settings rows (design-ADR 0024 §3): each enabled dial as a slider showing what is set and, while AI
 * changes it, what is in effect ("100 % → 250 % with AI"). Ported from the reference build's `cardDashboard` rows and
 * `syncDashboard` values.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import { effToPos } from './dashboard-readouts.pure.ts';
import type { Dials } from './software-ecology.types';

export type DialKey = 'eff' | 'effv' | 'fan' | 'aiSpeed' | 'aiExtra';

export interface DialRow {
  readonly key: DialKey;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  /** The slider's position: efficiency on its log scale, the rest as set. */
  readonly pos: number;
  readonly text: string;
  /** An AI row: shown only while AI is on. */
  readonly ai: boolean;
}

/** One number as the dashboards print it: whole from 10, one decimal below. */
export const num = (x: number): string => (x >= 10 ? Math.round(x).toString() : x.toFixed(1));
export const pct = (x: number): string => `${Math.round(x * 100)} %`;

/** "set" or, while AI changes it, "set → effective with AI". */
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

/** The enabled dials as rows, in the reference build's order. */
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
