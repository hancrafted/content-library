import type { UiWords } from './human-in-the-loop.types';

/** The title of a stage's modal, and the accessible name of its Try it button: the word's `{stage}` filled in. */
export const tryTitle = (words: Pick<UiWords, 'tryTitle'>, stageName: string): string =>
  words.tryTitle.replace('{stage}', stageName);
