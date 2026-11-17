import type { ForeachDef, MoveLetter, TaskDef, WorkflowFile } from './workflow-schema.types';

export type Move = MoveLetter;

export interface Job {
  readonly id: string;
  readonly title: string;
  readonly detail?: string;
  readonly dependsOn: readonly string[];
  readonly needs: readonly string[];
  readonly inputs: readonly string[];
  readonly outputs: readonly { readonly id: string }[];
  readonly reviewed: boolean;
  readonly optional: boolean;
  readonly parked?: readonly string[];
  readonly task: TaskDef;
}

export interface StageMove {
  readonly letter: Move;
  readonly why: string;
}

export interface GateCard {
  readonly label: string;
  readonly lines: readonly string[];
  readonly status: string;
}

export interface Stage {
  readonly id: string;
  readonly name: string;
  readonly goal: string;
  readonly summary?: string;
  readonly moves: readonly StageMove[];
  readonly card?: GateCard;
  readonly gate?: number;
  readonly foreach?: ForeachDef;
  readonly optional: boolean;
  readonly jobs: readonly Job[];
}

export interface Workflow {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly scenario: string;
  readonly focalJobId?: string;
  readonly stages: readonly Stage[];
  readonly file: WorkflowFile;
}
