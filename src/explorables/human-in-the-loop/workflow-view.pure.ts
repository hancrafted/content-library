import { producersFor } from './workflow-outputs.pure.ts';
import { stepsOf, type TaskStep } from './workflow-prompts.pure.ts';
import type { ChatButtonDef, ModelTier, Runtime, TaskDef, TechniqueDef } from './workflow-schema.types';
import type { Level } from './workflow-state.pure';
import type { Job, Stage, Workflow } from './workflow.types';

export interface ViewOptions {
  readonly level: Level;
  readonly demo?: boolean;
  readonly rounds?: Readonly<Record<string, number>>;
}

export interface TaskModalView {
  readonly id: string;
  readonly steps: readonly TaskStep[];
  readonly output?: string;
  readonly doneLabel?: string;
  readonly previous: readonly string[];
  readonly sameStage: readonly string[];
  readonly why: string;
  readonly examples: readonly string[];
  readonly goodLooksLike: readonly string[];
  readonly techniques: readonly TechniqueDef[];
  readonly openAIButtons?: readonly ChatButtonDef[];
  readonly recommendedModel?: ModelTier;
}

export interface JobModalView {
  readonly id: string;
  readonly title: string;
  readonly goal: TaskDef['goal'];
  readonly optional: boolean;
  readonly task: TaskModalView;
}

export interface StageView {
  readonly id: string;
  readonly name: string;
  readonly goal?: string;
  readonly repeats: boolean;
  readonly jobs: readonly JobModalView[];
}

export interface WorkflowView {
  readonly title: string;
  readonly stages: readonly StageView[];
}

function widthsOf(task: TaskDef, workflow: Workflow, at: { stage: number; rounds?: ViewOptions['rounds'] }) {
  const names = producersFor(workflow.file, at.stage, task);
  return new Map(
    task.slots.flatMap((slot): [string, number][] => {
      const producer = slot.mode === 'multiple' ? names.get(slot.id) : undefined;
      if (!producer?.stage.foreach) return [];
      return [[slot.id, Math.max(producer.stage.foreach.demo, at.rounds?.[producer.stage.id] ?? 0)]];
    }),
  );
}

const examplesOf = (example: TaskDef['details']['example']): readonly string[] =>
  example === undefined ? [] : typeof example === 'string' ? [example] : example;

type TaskAt = { level: Level; stage: number } & Pick<ViewOptions, 'demo' | 'rounds'>;

function taskView({ task }: Job, workflow: Workflow, at: TaskAt): TaskModalView {
  const { level, stage: stageAt } = at;
  const sameStage = (task.needs ?? []).flatMap(
    (id) => workflow.stages[stageAt]?.jobs.find((job) => job.id === id)?.task.output ?? [],
  );
  const options = { demo: at.demo, widths: widthsOf(task, workflow, at) };
  const runtime: Runtime = level === 'technical' ? 'technical' : 'simple';
  const { example } = task.details;
  return {
    id: task.id,
    steps: stepsOf(workflow.file, task, { runtime, ...options }),
    output: task.output,
    doneLabel: task.doneLabel,
    sameStage,
    previous: [...producersFor(workflow.file, stageAt, task).keys()],
    why: task.details.why,
    examples: examplesOf(example),
    goodLooksLike: task.details.goodLooksLike,
    techniques: (task.details.techniques ?? []).flatMap((id) =>
      workflow.file.techniques.filter((each) => each.id === id),
    ),
    ...(task.openAIButtons && { openAIButtons: task.openAIButtons }),
    ...(task.recommendedModel && { recommendedModel: task.recommendedModel }),
  };
}

const repeatsAt = (stage: Stage, level: Level, demo: boolean | undefined): boolean => {
  if (stage.foreach === undefined) return false;
  return level === 'simple' || (stage.foreach.technical === 'rounds' && demo === false);
};

export function workflowView(workflow: Workflow, { level, demo, rounds }: ViewOptions): WorkflowView {
  return {
    title: workflow.title,
    stages: workflow.stages.map((stage, stageAt) => ({
      id: stage.id,
      name: stage.name,
      goal: stage.goal,
      repeats: repeatsAt(stage, level, demo),
      jobs: stage.jobs.map((job) => ({
        id: job.id,
        title: job.title,
        goal: job.task.goal,
        optional: job.optional,
        task: taskView(job, workflow, { level, stage: stageAt, demo, rounds }),
      })),
    })),
  };
}
