import { joinPrompt } from '../core-components/try-prompt/prompt-sections.pure';
import { HANDOFF_KINDS } from './handoff.pure';
import { sourcesOf } from './workflow-outputs.pure';
import { doPrompt, reviewPrompt } from './workflow-prompts.pure';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';
import type { Job, Stage, Workflow } from './workflow.types';

/*
 * A new-schema file as the Workflow the diagram draws. Edges come from the slots: a task depends on the tasks whose
 * outputs its slots name. `run` and `check` carry the finished simple prompt and reviewer as pasted, with samples.
 */

const kindOf = (template: string): Job['outputs'][number]['kind'] =>
  HANDOFF_KINDS.find((kind) => kind === template) ?? 'text';

const asPasted = (view: ReturnType<typeof doPrompt>): string =>
  joinPrompt({ sections: view.sections ?? [], slots: view.slots ?? [] }, {});

function jobOf(file: WorkflowFile, task: TaskDef, stageIndex: number): Job {
  const review = task.review;
  return {
    id: task.id,
    title: task.title,
    description: task.details.why,
    chat: 'new',
    dependsOn: sourcesOf(file, stageIndex, task),
    inputs: task.slots.map((slot) => slot.id),
    outputs: [{ id: task.output, kind: kindOf(task.template) }],
    fanOut: task.fanOut,
    skills: [],
    run: { todo: task.title, prompt: asPasted(doPrompt(file, task, { runtime: 'simple', chat: 1 })) },
    check: review && { todo: task.title, criteria: review.checks, prompt: asPasted(reviewPrompt(file, task)) },
    task,
  };
}

function stageOf(file: WorkflowFile, stage: StageDef, index: number): Stage {
  return {
    id: stage.id,
    name: stage.title,
    moves: stage.move ? [{ letter: stage.move, why: stage.learningGoal }] : [],
    card: stage.card,
    gate: stage.gate,
    jobs: stage.tasks.map((task) => jobOf(file, task, index)),
  };
}

/** The Workflow of a loaded file; the stage with a sign-off card holds the focal job. */
export function workflowOf(file: WorkflowFile): Workflow {
  const focal = file.stages.find((stage) => stage.card)?.tasks[0];
  return {
    id: file.id,
    title: file.title,
    scenario: file.scenario.summary,
    focalJobId: focal?.id,
    stages: file.stages.map((stage, index) => stageOf(file, stage, index)),
    file,
  };
}
