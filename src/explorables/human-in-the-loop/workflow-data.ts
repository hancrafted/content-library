import { pairHash } from '@/shared/lib/pair-hash.pure';
import { parse } from 'yaml';
import uiDe from './human-in-the-loop.config.de.yml';
import uiEn from './human-in-the-loop.config.yml';
import type { UiWords } from './human-in-the-loop.types';
import projectPlanDe from './project-plan.de.yml';
import projectPlanEn from './project-plan.en.yml';
import sourceToQuizDe from './source-to-quiz.de.yml';
import sourceToQuizEn from './source-to-quiz.en.yml';
import summerPartyDe from './summer-party.de.yml';
import summerPartyEn from './summer-party.en.yml';
import vacationDe from './vacation.de.yml';
import vacationEn from './vacation.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import { loadWorkflow } from './workflow-loader.pure';
import type { Workflow } from './workflow.types';

// decision: FE-012 §1
export type WorkflowLocale = 'en' | 'de';

const SOURCES = {
  'project-plan': { en: projectPlanEn, de: projectPlanDe },
  vacation: { en: vacationEn, de: vacationDe },
  'summer-party': { en: summerPartyEn, de: summerPartyDe },
  'source-to-quiz': { en: sourceToQuizEn, de: sourceToQuizDe },
} as const satisfies Record<string, Record<WorkflowLocale, string>>;

export type WorkflowId = keyof typeof SOURCES;

export const WORKFLOW_IDS = Object.keys(SOURCES) as WorkflowId[];

const CHROME_SOURCES = { en: uiEn, de: uiDe } as const;

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

export const workflowFor = memoized(
  (id: WorkflowId, locale: WorkflowLocale) => `${id}:${locale}`,
  (id, locale): Workflow => {
    const result = loadWorkflow(SOURCES[id][locale]);
    if ('problems' in result) throw new Error(`Workflow "${id}" (${locale}):\n${result.problems.join('\n')}`);
    return workflowOf(result.file);
  },
);

export const hashFor = (id: WorkflowId): string => pairHash(SOURCES[id].en, SOURCES[id].de);

const chromeWordsOf = memoized(
  (locale: WorkflowLocale) => locale,
  (locale) => parse(CHROME_SOURCES[locale]) as { ui: UiWords },
);

export const uiWords = (locale: WorkflowLocale): UiWords => chromeWordsOf(locale).ui;
