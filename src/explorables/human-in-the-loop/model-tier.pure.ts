import { fillTemplate } from '@/shared/lib/template.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { ModelTier } from './workflow-schema.types';

export interface ModelText {
  readonly label: string;
  readonly tip: string;
}

export type ModelWords = Pick<
  UiWords,
  | 'model'
  | 'modelInfo'
  | 'modelReviewTip'
  | 'modelHigh'
  | 'modelHighTip'
  | 'modelMedium'
  | 'modelMediumTip'
  | 'modelLow'
  | 'modelLowTip'
>;

export function modelNote(words: ModelWords, tier: ModelTier, review = false): ModelText {
  const byTier = {
    high: [words.modelHigh, words.modelHighTip],
    medium: [words.modelMedium, words.modelMediumTip],
    low: [words.modelLow, words.modelLowTip],
  } as const;
  const [name, tip] = byTier[tier];
  return { label: fillTemplate(words.model, { tier: name }), tip: review ? words.modelReviewTip : tip };
}

export function noteFor(panel: string, recommended: ModelTier | undefined) {
  if (!recommended) return undefined;
  if (panel.startsWith('review')) return { tier: 'low', review: true } as const;
  return { tier: recommended, review: false } as const;
}
