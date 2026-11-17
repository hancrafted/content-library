import type { SlotValues } from '@/shared/components/core-components/try-prompt/prompt-sections.pure';
import { joinPrompt } from '../../shared/components/core-components/try-prompt/prompt-sections.pure.ts';
import { pairHash } from '../../shared/lib/pair-hash.pure.ts';
import { SOURCE_CHARS } from './debug-footer.pure.ts';
import { workflowInMode, workflowOf } from './workflow-file-adapter.pure.ts';
import { loadWorkflow } from './workflow-loader.pure.ts';
import type { StepKind, TaskStep } from './workflow-prompts.pure';
import { roundStep } from './workflow-prompts.pure.ts';
import type { WorkflowFile } from './workflow-schema.types';
// decision: FE-007 §2.8
import type { JobModalView, ViewOptions } from './workflow-view.pure';
import { workflowView } from './workflow-view.pure.ts';

export { LEVEL_OF, parseDebugFooter } from './debug-footer.pure.ts';

export const sourceOf = (english: string, german: string): string => pairHash(english, german).slice(0, SOURCE_CHARS);

export interface Round {
  readonly number: number;
  readonly item: string;
}

export interface RenderRequest {
  readonly job: string;
  readonly step?: StepKind;
  readonly level?: ViewOptions['level'];
  readonly demo?: boolean;
  readonly round?: Round;
  readonly values?: SlotValues;
}

export type RenderResult = { readonly text: string } | { readonly problems: readonly string[] };

function requestedStep(job: JobModalView, request: RenderRequest): TaskStep | undefined {
  const wanted = request.step ?? 'do';
  const step =
    wanted === 'then'
      ? job.task.steps.find((each) => each.id === 'do')?.then
      : job.task.steps.find((each) => each.id === wanted);
  if (step === undefined || request.round === undefined) return step;
  const share = { previous: job.task.previous, output: job.task.output, sameStage: job.task.sameStage };
  return roundStep(step, request.round, share);
}

function jobView(file: WorkflowFile, request: RenderRequest): JobModalView | undefined {
  const demo = request.demo ?? true;
  const view = workflowView(workflowInMode(workflowOf(file), demo), { level: request.level ?? 'simple', demo });
  return view.stages.flatMap((stage) => stage.jobs).find((each) => each.id === request.job);
}

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
