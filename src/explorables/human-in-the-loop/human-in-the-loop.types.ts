import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';
import type { NodeCopy } from './node-popover.client';
import type { ControlMap } from './toolbar-controls.pure';
import type { Run } from './workflow-run.pure';
import type { ChatButtonDef } from './workflow-schema.types';
import type { Level, View } from './workflow-state.pure';
import type { Workflow } from './workflow.types';

// decision: FE-012 §4
// decision: FE-006 §4
export interface UiWords {
  readonly workflow: string;
  readonly view: string;
  readonly viewTip: string;
  readonly viewStages: string;
  readonly viewStagesTip: string;
  readonly viewJobs: string;
  readonly viewJobsTip: string;
  readonly checked: string;
  readonly optional: string;
  readonly repeats: string;
  readonly round: string;
  readonly tryJob: string;
  readonly cli: string;
  readonly cliTip: string;
  readonly cliCallout: string;
  readonly cliCalloutSkills: string;
  readonly cliCalloutDownload: string;
  readonly context: string;
  readonly contextTip: string;
  readonly intro: string;
  readonly stepN: string;
  readonly stepContext: string;
  readonly stepContextInfo: string;
  readonly stepDo: string;
  readonly stepDoInfo: string;
  readonly thenCopy: string;
  readonly stepCheck: string;
  readonly stepCheckInfo: string;
  readonly copyExplanation: string;
  readonly copyExplanationTip: string;
  readonly typeFirst: string;
  readonly editPrompt: string;
  readonly editedTip: string;
  readonly editReset: string;
  readonly explainWrapper: string;
  readonly previousResults: string;
  readonly insertedAt: string;
  readonly resultHeading: string;
  readonly resultPlaceholder: string;
  readonly markDone: string;
  readonly markChecked: string;
  readonly download: string;
  readonly noteStale: string;
  readonly noteUnsaved: string;
  readonly downloadProgress: string;
  readonly downloadOldProgress: string;
  readonly demo: string;
  readonly demoTip: string;
  readonly demoLocked: string;
  readonly debug: string;
  readonly debugTip: string;
  readonly debugInstruction: string;
  readonly reset: string;
  readonly resetTip: string;
  readonly resetConfirm: string;
  readonly resetDownload: string;
  readonly resetNow: string;
  readonly resetCancel: string;
  readonly discardProgress: string;
  readonly upload: string;
  readonly progressSave: string;
  readonly progressLoad: string;
  readonly refuseUnreadable: string;
  readonly refuseOtherWorkflow: string;
  readonly refuseChanged: string;
  readonly gate: string;
  readonly toolbar: string;
  readonly close: string;
  readonly copied: string;
  readonly tryIt: string;
  readonly tryTitle: string;
  readonly tryFor: string;
  readonly moveLabel: string;
  readonly promptLabel: string;
  readonly commandLabel: string;
  readonly copyPrompt: string;
  readonly copyCommand: string;
  readonly sectionAbout: string;
  readonly sectionCriteria: string;
  readonly sectionExample: string;
  readonly doIt: string;
  readonly reviewIt: string;
  readonly chatN: string;
  readonly sectionWhy: string;
  readonly sectionTechniques: string;
  readonly tierBasic: string;
  readonly tierAdvanced: string;
  readonly whatToDo: string;
  readonly preview: string;
  readonly showFull: string;
  readonly collapse: string;
  readonly sampleHint: string;
  readonly sampleHintOne: string;
  readonly slotUpload: string;
  readonly slotAdd: string;
  readonly newTab: string;
  readonly openAIChats: string;
  readonly openAIChatTip: string;
  readonly openAIButtons: readonly ChatButtonDef[];
  readonly model: string;
  readonly modelInfo: string;
  readonly modelHigh: string;
  readonly modelHighTip: string;
  readonly modelMedium: string;
  readonly modelMediumTip: string;
  readonly modelLow: string;
  readonly modelLowTip: string;
  readonly modelReviewTip: string;
  readonly stateOpen: string;
  readonly stateDone: string;
}

export interface WorkflowSlideWords {
  readonly ui?: Partial<UiWords>;
}

export type PopoverCopy = Omit<NodeCopy, 'title'>;

export interface StageSlot {
  readonly popover?: PopoverCopy;
  readonly aside?: ReactNode;
  readonly marker?: ReactNode;
  readonly after?: ReactNode;
  readonly target?: TargetProps;
  readonly jobsLabel?: string;
  readonly gateLabel?: string;
}

export interface JobSlot {
  readonly popover?: PopoverCopy;
  readonly detail?: ReactNode;
  readonly marker?: ReactNode;
  readonly after?: ReactNode;
}

export interface DiagramSlots {
  readonly label?: string;
  readonly jobsLabel?: string;
  readonly checked?: string;
  readonly initials?: boolean;
  readonly stages?: Readonly<Record<string, StageSlot>>;
  readonly jobs?: Readonly<Record<string, JobSlot>>;
}

export interface DiagramProps {
  readonly workflow: Workflow;
  readonly slots?: DiagramSlots;
  readonly words: UiWords;
  readonly readonly: boolean;
  readonly onOpenStage: (stageId: string, jobId?: string, round?: number) => void;
  readonly view: View;
  readonly rounds: Readonly<Record<string, number>>;
  readonly run?: Run;
}

export interface HumanInTheLoopData {
  readonly workflows: readonly Workflow[];
  readonly workflowId: string;
  readonly hashes: Readonly<Record<string, string>>;
  readonly locale: 'en' | 'de';
  readonly words: UiWords;
  readonly controls: ControlMap;
  readonly level: Level;
  readonly view: View;
  readonly readonly: boolean;
  readonly diagram?: DiagramSlots;
}
