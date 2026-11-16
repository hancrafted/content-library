import { fillTemplate } from '@/shared/lib/template.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { ModelTier } from './workflow-schema.types';

/** What a step shows for its job's recommended model tier: the note ("Model: High · deep thinking") and the tooltip of the `?`. */
export interface ModelText {
  readonly label: string;
  readonly tip: string;
}

/** The words the model note reads: the note's frame, and each tier's label and tooltip. */
export type ModelWords = Pick<
  UiWords,
  'model' | 'modelInfo' | 'modelHigh' | 'modelHighTip' | 'modelMedium' | 'modelMediumTip' | 'modelLow' | 'modelLowTip'
>;

/** The text of a tier from the visual's words, which hold each tier's label and tooltip once for every Workflow. */
export function modelNote(words: ModelWords, tier: ModelTier): ModelText {
  const byTier = {
    high: [words.modelHigh, words.modelHighTip],
    medium: [words.modelMedium, words.modelMediumTip],
    low: [words.modelLow, words.modelLowTip],
  } as const;
  const [name, tip] = byTier[tier];
  return { label: fillTemplate(words.model, { tier: name }), tip };
}
