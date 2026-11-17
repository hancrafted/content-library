import type { Locale } from '@/shared/lib/locale.pure';

export interface PipelineStage {
  readonly id: 'lead' | 'opportunity' | 'deal';
  readonly notes: number;
  readonly ratioToNext?: number;
  readonly months: number;
}

export const PIPELINE = [
  { id: 'lead', notes: 27, ratioToNext: 3, months: 0.5 },
  { id: 'opportunity', notes: 9, ratioToNext: 9, months: 6 },
  { id: 'deal', notes: 1, months: 3 },
] as const satisfies readonly PipelineStage[];

export function totalConversion(stages: readonly PipelineStage[]): number {
  return stages.reduce((total, stage) => total * (stage.ratioToNext ?? 1), 1);
}

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

export function formatEuro(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}
