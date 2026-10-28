import { producerIdsOf } from './workflow-outputs.pure.ts';
import type { StageDef, TaskDef, WorkflowFile } from './workflow-schema.types';
import type { Job, Stage, Workflow } from './workflow.types';

/*
 * A loaded file as the Workflow the diagram draws. Edges come from the slots: a task depends on the tasks whose
 * outputs its slots name.
 */

function jobOf(file: WorkflowFile, task: TaskDef, stageIndex: number): Job {
  return {
    id: task.id,
    title: task.title,
    detail: task.summary,
    dependsOn: producerIdsOf(file, stageIndex, task),
    needs: task.needs ?? [],
    inputs: task.slots.map((slot) => slot.id),
    outputs: task.output === undefined ? [] : [{ id: task.output }],
    reviewed: task.review !== undefined,
    task,
  };
}

function stageOf(file: WorkflowFile, stage: StageDef, index: number): Stage {
  return {
    id: stage.id,
    name: stage.title,
    goal: stage.learningGoal,
    summary: stage.summary,
    moves: stage.move ? [{ letter: stage.move, why: stage.learningGoal }] : [],
    card: stage.card,
    gate: stage.gate,
    foreach: stage.foreach,
    jobs: stage.jobs.map((task) => jobOf(file, task, index)),
  };
}

/** The Workflow of a loaded file; the stage with a sign-off card holds the focal job. */
export function workflowOf(file: WorkflowFile): Workflow {
  const focal = file.stages.find((stage) => stage.card)?.jobs[0];
  return {
    id: file.id,
    title: file.title,
    description: file.description,
    scenario: file.scenario.summary,
    focalJobId: focal?.id,
    stages: file.stages.map((stage, index) => stageOf(file, stage, index)),
    file,
  };
}
