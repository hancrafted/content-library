import type { TryPromptWords } from '@/shared/components/core-components/try-prompt/try-prompt.types';
import { withDebug } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';

/** The title of a stage's modal, and the accessible name of its Try it button: the word's `{stage}` filled in. */
export const tryTitle = (words: Pick<UiWords, 'tryTitle'>, stageName: string): string =>
  words.tryTitle.replace('{stage}', stageName);

/** A fan-out chat's name: the word's `{n}` filled in. */
export const chatName = (words: Pick<UiWords, 'chatN'>, chat: number): string =>
  words.chatN.replace('{n}', String(chat));

/** The words a TryPrompt shows, from the visual's: the slot buttons have their own words, apart from the toolbar's upload. */
export const tryWords = (words: UiWords): TryPromptWords => ({
  promptLabel: words.promptLabel,
  commandLabel: words.commandLabel,
  copyPrompt: words.copyPrompt,
  copyCommand: words.copyCommand,
  openChatgpt: words.openChatgpt,
  newTab: words.newTab,
  upload: words.slotUpload,
  addEntry: words.slotAdd,
  whatToDo: words.whatToDo,
  preview: words.preview,
  showFull: words.showFull,
  collapse: words.collapse,
  tierBasic: words.tierBasic,
  tierAdvanced: words.tierAdvanced,
  sampleHint: words.sampleHint,
  sampleHintOne: words.sampleHintOne,
  copied: words.copied,
});

/** The prompt wrapped in the request that has an AI explain it, so the viewer learns why it works and how to adjust it. */
export const explanationPrompt = (words: UiWords, prompt: string): string =>
  words.explainWrapper.replace('{prompt}', () => prompt);

/** The text a copy button copies: with the debug instruction after it while debug mode is on (a footer), else as it is. */
export const debuggedPrompt = (words: Pick<UiWords, 'debugInstruction'>, text: string, footer: string | null): string =>
  withDebug(text, words.debugInstruction, footer);

/** "Step 2: Check the result". */
export const stepTitle = (words: UiWords, n: number, title: string): string =>
  words.stepN.replace('{n}', String(n)).replace('{title}', title);
