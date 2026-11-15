import type { Mode, StageDef, WorkflowFile } from './workflow-schema.types';

/*
 * Stages by mode. A stage may carry `only: demo` or `only: full`, the vocabulary of a prompt section: absent, it takes
 * part in both modes. A file as one mode runs is the file without the stages of the other mode, so every check and
 * every view of a run reads one coherent chain.
 */

/** The mode a flag stands for. */
export const modeOf = (demo: boolean): Mode => (demo ? 'demo' : 'full');

/** Whether a stage takes part in the mode. */
export const inMode = (stage: Pick<StageDef, 'only'>, mode: Mode): boolean =>
  stage.only === undefined || stage.only === mode;

/** The file as one mode runs it: the stages of the other mode are left out. */
export const fileInMode = (file: WorkflowFile, mode: Mode): WorkflowFile =>
  file.stages.every((stage) => inMode(stage, mode))
    ? file
    : { ...file, stages: file.stages.filter((stage) => inMode(stage, mode)) };
