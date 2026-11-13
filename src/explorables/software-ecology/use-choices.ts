/*
 * The words and choices the client parent hands its parts: the use case's words, the run's warm-up words, the state
 * row's states, the Scenarios menu's entries with their "what to watch" lines and tour lengths, and the use cases.
 */
import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo } from 'react';
import { stepsOf } from './factory-beats.pure.ts';
import type { Choice } from './factory-toolbar.client';
import type { ScenarioChoice } from './scenario-menu';
import type { Words } from './software-ecology-words.types';
import type { Bundle, CatalogWords, Locale } from './software-ecology.types';
import { presetName, scenarioWords, titlesOf, useCaseName, type WordsIn } from './use-case-words.pure.ts';
import type { FactoryWords } from './use-factory.ts';

/** The states on the toolbar's row; the Scenarios menu holds the rest. */
const BUILT_IN = 'built in';

export const MAIN_STATES = ['roles', 'ideal', 'realistic'];

export interface ChoicesIn {
  readonly bundles: readonly Bundle[];
  readonly locale: Locale;
  readonly words: Words;
  readonly catalog: CatalogWords;
}

function useStates(B: Bundle, w: WordsIn) {
  const states = useMemo<Choice[]>(
    () =>
      B.data.presets.filter((x) => MAIN_STATES.includes(x.id)).map((x) => ({ id: x.id, name: presetName(w, x.id) })),
    [B, w],
  );
  const scenarios = useMemo<ScenarioChoice[]>(
    () =>
      B.data.presets
        .filter((x) => !MAIN_STATES.includes(x.id) && x.menu !== false)
        .map((x) => ({
          id: x.id,
          name: presetName(w, x.id),
          watch: scenarioWords(w, x.id).watch ?? '',
          steps: x.tour ? stepsOf(x).length : 0,
        })),
    [B, w],
  );
  return { states, scenarios };
}

export function useChoices(p: ChoicesIn, B: Bundle) {
  const w = useMemo<WordsIn>(() => ({ B, locale: p.locale, catalog: p.catalog }), [B, p.locale, p.catalog]);
  const fw = useMemo<FactoryWords>(
    () => ({ warming: (day, of) => fillTemplate(p.words.stage.warming, { day, of }), blocked: p.words.stage.blocked }),
    [p.words.stage],
  );
  const useCases = useMemo<Choice[]>(
    () =>
      p.bundles.map((b) => ({
        id: b.data.id,
        // an uploaded use case says so, as the reference build's picker does
        name: useCaseName({ ...w, B: b }) + (b.source === BUILT_IN ? '' : ` ${p.words.toolbar.fromFile}`),
      })),
    [p.bundles, w, p.words.toolbar.fromFile],
  );
  return { w, fw, ...useStates(B, w), useCases, titles: useMemo(() => titlesOf(w), [w]) };
}

export type Choices = ReturnType<typeof useChoices>;
