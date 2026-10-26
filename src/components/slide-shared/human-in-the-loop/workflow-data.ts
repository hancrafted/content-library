import { pairHash } from '@/lib/pair-hash.pure';
import { parse } from 'yaml';
import uiDe from './human-in-the-loop.config.de.yml';
import uiEn from './human-in-the-loop.config.yml';
import type { UiWords } from './human-in-the-loop.types';
import projectPlanDe from './project-plan.de.yml';
import projectPlanEn from './project-plan.en.yml';
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

/** Each authored Workflow's source text in each locale: one language per file, rendered as written. Key order is picker order. */
const SOURCES = {
  'project-plan': { en: projectPlanEn, de: projectPlanDe },
  vacation: { en: vacationEn, de: vacationDe },
} as const satisfies Record<string, Record<WorkflowLocale, string>>;

export type WorkflowId = keyof typeof SOURCES;

/** The authored Workflow ids, in picker order. */
export const WORKFLOW_IDS = Object.keys(SOURCES) as WorkflowId[];

const CHROME_SOURCES = { en: uiEn, de: uiDe } as const;

/** Builds a value once per key and hands the same one back after. */
function memoized<Args extends unknown[], Value>(keyOf: (...args: Args) => string, build: (...args: Args) => Value) {
  const built = new Map<string, Value>();
  return (...args: Args): Value => {
    const key = keyOf(...args);
    const hit = built.get(key);
    if (hit) return hit;
    const made = build(...args);
    built.set(key, made);
    return made;
  };
}

/** One authored Workflow in one locale; the build throws every problem of a shipped file. */
export const workflowFor = memoized(
  (id: WorkflowId, locale: WorkflowLocale) => `${id}:${locale}`,
  (id, locale): Workflow => {
    const result = loadWorkflow(SOURCES[id][locale]);
    if ('problems' in result) throw new Error(`Workflow "${id}" (${locale}):\n${result.problems.join('\n')}`);
    return workflowOf(result.file);
  },
);

/** The hash of one authored Workflow's English and German files together: a saved run resumes only under the same one. */
export const hashFor = (id: WorkflowId): string => pairHash(SOURCES[id].en, SOURCES[id].de);

/** The visual's own file of one locale, parsed once. */
const chromeWordsOf = memoized(
  (locale: WorkflowLocale) => locale,
  (locale) => parse(CHROME_SOURCES[locale]) as { ui: UiWords },
);

/** The chrome words of one locale. */
export const uiWords = (locale: WorkflowLocale): UiWords => chromeWordsOf(locale).ui;
