import type { Locale } from '@/shared/lib/locale.pure';

/** One lane of the count board: how many notes sit in it, its ratio to the next stage and its share of the cycle. */
export interface PipelineStage {
  readonly id: 'lead' | 'opportunity' | 'deal';
  /** Notes on the board in this stage. */
  readonly notes: number;
  /** How many in this stage become one in the next; absent on the last stage. */
  readonly ratioToNext?: number;
  /** Months this stage takes in the worked example; two weeks is half a month. */
  readonly months: number;
}

/** The worked example of the source deck: 3:1 and 9:1, two weeks, six months and three months. */
export const PIPELINE = [
  { id: 'lead', notes: 27, ratioToNext: 3, months: 0.5 },
  { id: 'opportunity', notes: 9, ratioToNext: 9, months: 6 },
  { id: 'deal', notes: 1, months: 3 },
] as const satisfies readonly PipelineStage[];

/** Leads needed for one deal: the stage ratios multiplied. */
export function totalConversion(stages: readonly PipelineStage[]): number {
  return stages.reduce((total, stage) => total * (stage.ratioToNext ?? 1), 1);
}

/** The cycle bar in months: each stage's span from the first lead, and one tick per whole month. */
export function cycleBar(stages: readonly PipelineStage[]) {
  const segments: { id: PipelineStage['id']; start: number; end: number }[] = [];
  let start = 0;
  for (const stage of stages) {
    segments.push({ id: stage.id, start, end: start + stage.months });
    start += stage.months;
  }
  const ticks = Array.from({ length: Math.floor(start) + 1 }, (_, month) => month);
  return { months: start, segments, ticks };
}

/** An amount in whole euros, written the page locale's way. */
export function formatEuro(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}
