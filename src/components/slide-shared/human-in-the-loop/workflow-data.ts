import { parse } from 'yaml';
import uiDe from './human-in-the-loop.config.de.yml';
import uiEn from './human-in-the-loop.config.yml';
import type { UiWords } from './human-in-the-loop.types';
import type { OutputWords } from './outputs/output-words';
import summerPartyDe from './summer-party.config.de.yml';
import summerPartyEn from './summer-party.config.yml';
import vacationDe from './vacation.config.de.yml';
import vacationEn from './vacation.config.yml';
import { loadWorkflow } from './workflow.pure';
import type { Workflow } from './workflow.types';

/*
 * The visual's data at build time: the Workflow pairs and the chrome words of one locale, picked by the path locale
 * through static imports (FE-012 §1). Runs on the server only; the build throws every problem of a shipped pair.
 */

export type WorkflowLocale = 'en' | 'de';

/** The authored Workflow ids, in picker order. A test holds this to the files. */
export const WORKFLOW_IDS = ['summer-party', 'vacation'] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

/** Each Workflow's config (data and English words) and its German words. */
export const PAIRS: Readonly<Record<WorkflowId, { readonly config: string; readonly de: string }>> = {
  'summer-party': { config: summerPartyEn, de: summerPartyDe },
  vacation: { config: vacationEn, de: vacationDe },
};

export const UI_FILES = { en: uiEn, de: uiDe } as const;

const cache = new Map<string, Workflow>();

/** One authored Workflow in one locale; `override` is a Slide's words (not cached). */
export function workflowFor(id: WorkflowId, locale: WorkflowLocale, override?: unknown): Workflow {
  const key = `${id}:${locale}`;
  const hit = override === undefined ? cache.get(key) : undefined;
  if (hit) return hit;
  const pair = PAIRS[id];
  const result = loadWorkflow(pair.config, locale === 'de' ? pair.de : pair.config, override);
  if ('problems' in result) throw new Error(`Workflow "${id}" (${locale}):\n${result.problems.join('\n')}`);
  if (override === undefined) cache.set(key, result.workflow);
  return result.workflow;
}

const chrome = new Map<WorkflowLocale, { readonly ui: UiWords; readonly output: OutputWords }>();

/** The visual's own file of one locale, parsed once. */
function chromeOf(locale: WorkflowLocale) {
  const hit = chrome.get(locale);
  if (hit) return hit;
  const doc = parse(UI_FILES[locale]) as { ui: UiWords; output: OutputWords };
  chrome.set(locale, doc);
  return doc;
}

/** The chrome words of one locale. */
export const uiWords = (locale: WorkflowLocale): UiWords => chromeOf(locale).ui;

/** The words of the output renderers in one locale. */
export const outputWords = (locale: WorkflowLocale): OutputWords => chromeOf(locale).output;
