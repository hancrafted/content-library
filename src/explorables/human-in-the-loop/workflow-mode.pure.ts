import type { Mode, StageDef, WorkflowFile } from './workflow-schema.types';

export const modeOf = (demo: boolean): Mode => (demo ? 'demo' : 'full');

export const inMode = (stage: Pick<StageDef, 'only'>, mode: Mode): boolean =>
  stage.only === undefined || stage.only === mode;

export const fileInMode = (file: WorkflowFile, mode: Mode): WorkflowFile =>
  file.stages.every((stage) => inMode(stage, mode))
    ? file
    : { ...file, stages: file.stages.filter((stage) => inMode(stage, mode)) };
