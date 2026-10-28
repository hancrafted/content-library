import type { SlotValues } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { joinPrompt } from '../../shared/components/core-components/try-prompt/prompt-sections.pure.ts';
import { workflowOf } from './workflow-file-adapter.pure.ts';
import { loadWorkflow } from './workflow-loader.pure.ts';
import type { TaskStep } from './workflow-prompts.pure';
import { roundStep } from './workflow-prompts.pure.ts';
import type { WorkflowFile } from './workflow-schema.types';
import type { JobModalView, ViewOptions } from './workflow-view.pure';
import { workflowView } from './workflow-view.pure.ts';

/*
 * The node entry of the human-in-the-loop explanation: the one module of it that skills and tools may import
 * (FE-007 §2.8). It runs under plain node, no DOM, and renders a prompt the way the stepper builds it, through the
 * same view and round steps. The debug footer the page may add on copy is left out.
 */

import { pairHash } from '../../shared/lib/pair-hash.pure.ts';
import { SOURCE_CHARS } from './debug-footer.pure.ts';

export { LEVEL_OF, parseDebugFooter } from './debug-footer.pure.ts';

/** The `source` a debug footer carries for a Workflow pair: the start of its pair hash, as the page cuts it. */
export const sourceOf = (english: string, german: string): string => pairHash(english, german).slice(0, SOURCE_CHARS);

/** One round of a repeated stage: its number and its item, the H3 block from the requirements. */
export interface Round {
  readonly number: number;
  readonly item: string;
}

/** Which prompt to render: a job, its do or review step, the level, demo mode, a round and the pasted values. */
export interface RenderRequest {
  readonly job: string;
  readonly step?: TaskStep['id'];
  readonly level?: ViewOptions['level'];
  /** Demo mode picks each limit's demo value and the demo-only sections; default on. */
  readonly demo?: boolean;
  readonly round?: Round;
  /** Pasted values by marker name (`idea`, `note_1`, `verdict_result#2`); an empty one falls back to the sample. */
  readonly values?: SlotValues;
}

export type RenderResult = { readonly text: string } | { readonly problems: readonly string[] };

/** The requested step of a job as the stepper shows it: in a round, with the share the stepper passes. */
function requestedStep(job: JobModalView, request: RenderRequest): TaskStep | undefined {
  const step = job.task.steps.find((each) => each.id === (request.step ?? 'do'));
  if (step === undefined || request.round === undefined) return step;
  const share = { previous: job.task.previous, output: job.task.output, sameStage: job.task.sameStage };
  return roundStep(step, request.round, share);
}

/** The job as the stepper shows it, at the requested level and mode. */
function jobView(file: WorkflowFile, request: RenderRequest): JobModalView | undefined {
  const view = workflowView(workflowOf(file), { level: request.level ?? 'simple', demo: request.demo ?? true });
  return view.stages.flatMap((stage) => stage.jobs).find((each) => each.id === request.job);
}

/** One prompt of a Workflow file's YAML text, as copied, or every problem that stops it. */
export function renderPrompt(source: string, request: RenderRequest): RenderResult {
  const loaded = loadWorkflow(source);
  if ('problems' in loaded) return loaded;
  const job = jobView(loaded.file, request);
  if (job === undefined) return { problems: [`The file has no job "${request.job}".`] };
  const step = requestedStep(job, request);
  if (step === undefined) return { problems: [`Job "${request.job}" has no ${request.step} step.`] };
  const { sections = [], slots = [] } = step.prompt;
  return { text: joinPrompt({ sections, slots }, request.values ?? {}) };
}
