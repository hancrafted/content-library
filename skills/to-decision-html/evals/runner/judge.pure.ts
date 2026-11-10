// The checklist judge's pure parts: the checklist a page is judged on (the confidence bar for the case's mode, then
// the case's own items) and how the judge's answers become grading.json expectations. Unknown counts as fail.
import bar from '../judge/confidence-bar.json' with { type: 'json' };
import type { Expectation } from './grading.pure.ts';

/** Where in a frozen case input an item or answer key comes from: the file and a verbatim quote of it. */
export interface Source {
  readonly file: string;
  readonly quote: string;
}

/** One yes/no question of a case's checklist.json. */
export interface CaseItem {
  readonly id: string;
  readonly question: string;
  readonly source: Source;
}

/** One question the judge answers; the id says whether it comes from the bar or the case. */
export interface ChecklistItem {
  readonly id: string;
  readonly question: string;
}

export function checklistFor(mode: string, caseItems: readonly CaseItem[]): ChecklistItem[] {
  return [
    ...bar.items.filter(({ modes }) => modes.includes(mode)).map(({ id, question }) => ({ id: `bar ${id}`, question })),
    ...caseItems.map(({ id, question }) => ({ id: `case ${id}`, question })),
  ];
}

/** A judge's answer to one checklist item, with a verbatim quote from the page as evidence. */
export interface JudgeAnswer {
  readonly id: string;
  readonly answer: string;
  readonly evidence: string;
}

const squash = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * The quote as evidence, flagged when the page text does not hold it: it may come from a screenshot (SVG or
 * canvas text), or be invented. The flag informs; it never changes a verdict.
 */
export function quoted(quote: string, pageText: string): string {
  if (quote.trim() === '') return '';
  const found = squash(pageText).includes(squash(quote));
  return `"${quote}"${found ? '' : ' (not in the page text; seen in a screenshot or invented)'}`;
}

export function judgeExpectations(
  items: readonly ChecklistItem[],
  answers: readonly JudgeAnswer[],
  pageText: string,
): Expectation[] {
  return items.map(({ id, question }) => {
    const text = `judge ${id}: ${question}`;
    const given = answers.find((answer) => answer.id === id);
    if (given === undefined) return { text, passed: false, evidence: 'the judge gave no answer' };
    if (given.answer === 'unknown') return { text, passed: false, evidence: 'unknown, which counts as fail' };
    const quote = quoted(given.evidence, pageText);
    return {
      text,
      passed: given.answer === 'yes',
      evidence: quote === '' ? given.answer : `${given.answer}: ${quote}`,
    };
  });
}

/** What the judge and the reader see of a page: three screenshots and its text, named as they are in their folder. */
export const VIEW_FILES = {
  load: { file: '1-load.png', about: 'the page as it opens, at 1440 × 900' },
  pick: { file: '2-pick.png', about: 'the page after a pick in its first item with choices' },
  detail: { file: '3-detail.png', about: 'the detailed view: depth toggles and disclosures opened' },
  text: { file: 'page.txt', about: "the page's visible text, with its detail opened" },
} as const;

const aboutFile = (file: string) =>
  Object.values(VIEW_FILES).find((view) => view.file === file)?.about ?? 'part of the page';

/** Fills a prompt template's `{{name}}` slots, `{{files}}` with the file list; an unfilled slot throws. */
export function fillPrompt(
  template: string,
  files: readonly string[],
  slots: Readonly<Record<string, string>>,
): string {
  const values: Record<string, string> = {
    files: files.map((file) => `- \`${file}\`: ${aboutFile(file)}`).join('\n'),
    ...slots,
  };
  return template.replace(/\{\{(\w+)\}\}/g, (slot, name: string) => {
    if (!(name in values)) throw new Error(`the prompt template has no value for ${slot}`);
    return values[name];
  });
}

export function judgePrompt(template: string, items: readonly ChecklistItem[], files: readonly string[]): string {
  const checklist = items.map(({ id, question }) => `- \`${id}\`: ${question}`).join('\n');
  return fillPrompt(template, files, { checklist });
}

/** The JSON schema the judge's reply must match: one answer per item id. */
export function judgeSchema(items: readonly ChecklistItem[]): object {
  return {
    type: 'object',
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { enum: items.map(({ id }) => id) },
            answer: { enum: ['yes', 'no', 'unknown'] },
            evidence: { type: 'string' },
          },
          required: ['id', 'answer', 'evidence'],
          additionalProperties: false,
        },
      },
    },
    required: ['answers'],
    additionalProperties: false,
  };
}

/** Every item failed for one reason, such as a judge that never answered; `kind` is `judge` or `probe`. */
export function failAll(
  kind: 'judge' | 'probe',
  items: readonly { id: string; question: string }[],
  reason: string,
): Expectation[] {
  return items.map(({ id, question }) => ({ text: `${kind} ${id}: ${question}`, passed: false, evidence: reason }));
}
