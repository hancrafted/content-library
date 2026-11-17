import { withDebug } from './debug-footer.pure';
import type { UiWords } from './human-in-the-loop.types';

export const tryTitle = (words: Pick<UiWords, 'tryTitle'>, stageName: string): string =>
  words.tryTitle.replace('{stage}', stageName);

export const chatName = (words: Pick<UiWords, 'chatN'>, chat: number): string =>
  words.chatN.replace('{n}', String(chat));

export const explanationPrompt = (words: UiWords, prompt: string): string =>
  words.explainWrapper.replace('{prompt}', () => prompt);

export const debuggedPrompt = (words: Pick<UiWords, 'debugInstruction'>, text: string, footer: string | null): string =>
  withDebug(text, words.debugInstruction, footer);

export const stepTitle = (words: UiWords, n: number, title: string): string =>
  words.stepN.replace('{n}', String(n)).replace('{title}', title);
