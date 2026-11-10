// An explain page's controls: settled decisions rendered without pick controls, with open reflection prompts and a
// "Questions?" comment field.
import { load, type CheerioAPI } from 'cheerio';
import type { Check } from '../grader/check.ts';

/** What lets a reader pick: choice inputs, and the decide page's Option and Next action hooks. */
const PICK_CONTROLS = [
  'input[type="radio"]',
  'input[type="checkbox"]',
  'select',
  '[data-option]',
  '[data-next-action]',
] as const;

function pickProblems($: CheerioAPI): string[] {
  const found = PICK_CONTROLS.map((selector) => [selector, $(selector).length] as const)
    .filter(([, count]) => count > 0)
    .map(([selector, count]) => `${count} ${selector}`);
  return found.length === 0
    ? []
    : [`the page offers pick controls (${found.join(', ')}); an explain page renders settled decisions without picks`];
}

function exactlyOne($: CheerioAPI, selector: string): string[] {
  const count = $(selector).length;
  return count === 1 ? [] : [`the page has ${count} ${selector}; expected exactly one`];
}

function reflectionProblems($: CheerioAPI): string[] {
  const reflection = $('[data-reflection]');
  if (reflection.length !== 1) return exactlyOne($, '[data-reflection]');
  const asks = reflection
    .find('*')
    .addBack()
    .toArray()
    .some((node) => $(node).text().trim().endsWith('?'));
  return asks ? [] : ['[data-reflection] asks no open question; expected prompts ending in "?"'];
}

function questionsProblems($: CheerioAPI): string[] {
  const questions = $('[data-questions]');
  if (questions.length !== 1) return exactlyOne($, '[data-questions]');
  const editable = questions.find('textarea:not([readonly]):not([disabled])').length;
  return editable > 0 ? [] : ["[data-questions] holds no editable <textarea> for the reader's questions"];
}

export const check: Check<string> = {
  id: 'explain-controls',
  summary: 'The page offers no pick controls and has one reflection block of open questions and one Questions field.',
  modes: ['explain'],
  observe: (loaded) => loaded.html,
  judge(html) {
    const $ = load(html);
    return [...pickProblems($), ...reflectionProblems($), ...questionsProblems($)];
  },
};
