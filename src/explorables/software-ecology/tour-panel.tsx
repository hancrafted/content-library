import { fillTemplate } from '@/shared/lib/template.pure';
import type { RefObject } from 'react';
import type { FactoryRun } from './factory-run.pure.ts';
import { tourCard, tourChecks, tourClock, tourLength, tourWeekOf, tourWeeks, type Tour } from './factory-tour.pure.ts';
import type { Words } from './software-ecology-words.types';
import type { Locale } from './software-ecology.types';
import { TourBox } from './tour-box.client';
import { checkText } from './tour-checks.pure.ts';
import { presetName, scenarioWords, type WordsIn } from './use-case-words.pure.ts';
import type { TourActions } from './use-tour.ts';

/* The tour's words for its caption box and the clock, from the tour on show and its run. */

export interface TourPanelProps {
  readonly tour: TourActions;
  readonly words: Words;
  readonly w: WordsIn;
  readonly titles: Readonly<Record<string, string>>;
  readonly locale: Locale;
  readonly floor: RefObject<HTMLDivElement | null>;
  readonly wrap: RefObject<HTMLElement | null>;
  /** The compare stream's columns, while it is shown. */
  readonly stream?: string;
}

const runningText = (run: FactoryRun, t: Tour, words: Words): string | null => {
  if (t.phase === 'show') return null;
  if (t.phase === 'warm') return words.tour.settling;
  return fillTemplate(words.tour.running, { w: tourWeekOf(t), n: Math.floor(tourWeeks(run, t)) });
};

/** The clock while a tour runs: "Week 8 · Day 1"; undefined while the line warms or no tour runs. */
export const tourClockText = (tour: TourActions, words: Words): string | undefined => {
  const c = tourClockAt(tour);
  return c ? fillTemplate(words.toolbar.week, { w: c.week, d: c.day }) : undefined;
};

/** The tour's clock as numbers, for the eval read-outs `data-readout-week` and `-day`. */
export const tourClockAt = (tour: TourActions): { week: number; day: number } | undefined => {
  const c = tour.tour && tour.run ? tourClock(tour.run, tour.tour) : null;
  return c ?? undefined;
};

export function TourPanel(p: TourPanelProps) {
  const { tour: t, run } = p.tour;
  if (!t || !run) return null;
  const n = tourLength(t),
    checks = { words: p.words.tour.checks, titles: p.titles, locale: p.locale };
  return (
    <TourBox
      words={p.words.tour}
      name={presetName(p.w, t.preset.id)}
      head={fillTemplate(p.words.tour.step, { i: t.i + 1, n, w: tourWeekOf(t) })}
      running={runningText(run, t, p.words)}
      caption={scenarioWords(p.w, t.preset.id).steps?.[t.i] ?? ''}
      checks={tourChecks(t).map((c) => ({ text: checkText(c, checks), ok: c.ok }))}
      card={tourCard(t)}
      floor={p.floor}
      wrap={p.wrap}
      stream={p.stream}
      canBack={t.i > 0}
      last={t.i >= n - 1}
      onClose={p.tour.end}
      onBack={p.tour.back}
      onNext={p.tour.next}
    />
  );
}
