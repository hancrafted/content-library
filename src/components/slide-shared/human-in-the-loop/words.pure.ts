import type { TryPromptWords } from '../core-components/try-prompt/try-prompt.types';
import type { UiWords } from './human-in-the-loop.types';

/** The title of a stage's modal, and the accessible name of its Try it button: the word's `{stage}` filled in. */
export const tryTitle = (words: Pick<UiWords, 'tryTitle'>, stageName: string): string =>
  words.tryTitle.replace('{stage}', stageName);

/** The words a TryPrompt shows, from the visual's: the slot buttons have their own words, apart from the toolbar's upload. */
export const tryWords = (words: UiWords): TryPromptWords => ({
  ...words,
  upload: words.slotUpload,
  addEntry: words.slotAdd,
});
