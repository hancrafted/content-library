import { parse } from 'yaml';
import uiDe from './human-in-the-loop.config.de.yml';
import uiEn from './human-in-the-loop.config.yml';
import type { UiWords } from './human-in-the-loop.types';
import summerPartyDe from './summer-party.de.yml';
import summerPartyEn from './summer-party.en.yml';
import vacationDe from './vacation.de.yml';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import type { Workflow } from './workflow.types';

/*
 * The visual's data at build time: the Workflows and the chrome words of one locale, picked by the path locale
 * through static imports (FE-012 §1). Runs on the server only; the build throws every problem of a shipped file.
 */

export type WorkflowLocale = 'en' | 'de';

/** The authored Workflow ids, in picker order. A test holds this to the files. */
export const WORKFLOW_IDS = ['summer-party', 'vacation'] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

/** Each Workflow's file in each locale: one language per file, rendered as written. */
export const FILES: Readonly<Record<WorkflowId, Readonly<Record<WorkflowLocale, string>>>> = {
  'summer-party': { en: summerPartyEn, de: summerPartyDe },
  vacation: { en: vacationEn, de: vacationDe },
};

export const UI_FILES = { en: uiEn, de: uiDe } as const;

const cache = new Map<string, Workflow>();

/** One authored Workflow in one locale; the build throws every problem of a shipped file. */
export function workflowFor(id: WorkflowId, locale: WorkflowLocale): Workflow {
  const key = `${id}:${locale}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const result = loadWorkflow(FILES[id][locale]);
  if ('problems' in result) throw new Error(`Workflow "${id}" (${locale}):\n${result.problems.join('\n')}`);
  const workflow = workflowOf(result.file);
  cache.set(key, workflow);
  return workflow;
}

const chrome = new Map<WorkflowLocale, { readonly ui: UiWords }>();

/** The visual's own file of one locale, parsed once. */
function chromeOf(locale: WorkflowLocale) {
  const hit = chrome.get(locale);
  if (hit) return hit;
  const doc = parse(UI_FILES[locale]) as { ui: UiWords };
  chrome.set(locale, doc);
  return doc;
}

/** The chrome words of one locale. */
export const uiWords = (locale: WorkflowLocale): UiWords => chromeOf(locale).ui;
