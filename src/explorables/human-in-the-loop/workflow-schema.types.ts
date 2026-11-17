import type { ChatButtonDef } from '@/shared/components/core-components/chat-buttons/chat-buttons';

export type { ChatButtonDef };

export type MoveLetter = 'B' | 'R' | 'I' | 'E' | 'F';

export interface MoveDef {
  readonly letter: MoveLetter;
  readonly why: string;
}

export const PURPOSES = ['role', 'context', 'task', 'steps', 'template', 'scope'] as const;
export type Purpose = (typeof PURPOSES)[number];

export const TIERS = ['basic', 'advanced'] as const;
export type Tier = (typeof TIERS)[number];

export const MODEL_TIERS = ['high', 'medium', 'low'] as const;
export type ModelTier = (typeof MODEL_TIERS)[number];

export interface TechniqueDef {
  readonly id: string;
  readonly tier: Tier;
  readonly title: string;
  readonly explain: string;
}

export const RUNTIMES = ['simple', 'technical'] as const;
export type Runtime = (typeof RUNTIMES)[number];

export type SlotMode = 'single' | 'multiple';

export const BUILT_IN_MARKERS = ['item', 'template'] as const;
export const REVIEWER_MARKERS = ['checks', 'inputs'] as const;

export const MODES = ['demo', 'full'] as const;
export type Mode = (typeof MODES)[number];

export interface SectionDef {
  readonly heading: string;
  readonly only?: Mode;
  readonly purpose?: Purpose;
  readonly explain?: string;
  readonly techniques?: readonly string[];
  readonly text: string;
}

export interface SlotDef {
  readonly id: string;
  readonly mode: SlotMode;
  readonly label: string;
  readonly sample?: string | readonly string[];
  readonly free?: boolean;
  readonly blank?: boolean;
}

export interface ReviewDef {
  readonly slots: readonly SlotDef[];
  readonly checks: readonly string[];
  readonly instructions?: string;
}

export interface DetailsDef {
  readonly why: string;
  readonly example?: string | readonly string[];
  readonly goodLooksLike: readonly string[];
  readonly techniques?: readonly string[];
}

export interface LimitDef {
  readonly full: number;
  readonly demo: number;
}

export interface ThenDef {
  readonly skills: readonly string[];
  readonly sections: readonly SectionDef[];
}

export interface TaskDef {
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  readonly goal: { readonly do: string; readonly review?: string };
  readonly needs?: readonly string[];
  readonly output?: string;
  readonly doneLabel?: string;
  readonly template?: string;
  readonly slots: readonly SlotDef[];
  readonly instructions?: string;
  readonly do: Readonly<Record<Runtime, readonly SectionDef[]>>;
  readonly skills?: readonly string[];
  readonly then?: ThenDef;
  readonly review?: ReviewDef;
  readonly limits?: Readonly<Record<string, LimitDef>>;
  readonly openAIButtons?: readonly ChatButtonDef[];
  readonly details: DetailsDef;
  readonly recommendedModel?: ModelTier;
  readonly optional?: boolean;
}

export interface CardDef {
  readonly label: string;
  readonly lines: readonly string[];
  readonly status: string;
}

export interface ForeachDef {
  readonly over: string;
  readonly demo: number;
  readonly technical?: 'rounds';
  readonly item?: string;
}

export interface StageDef {
  readonly id: string;
  readonly title: string;
  readonly learningGoal: string;
  readonly summary?: string;
  readonly only?: Mode;
  readonly foreach?: ForeachDef;
  readonly moves?: readonly MoveDef[];
  readonly gate?: number;
  readonly card?: CardDef;
  readonly optional?: boolean;
  readonly jobs: readonly TaskDef[];
}

export interface ScenarioDef {
  readonly summary: string;
  readonly facts: readonly string[];
}

export interface WorkflowFile {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly scenario: ScenarioDef;
  readonly purposes: Readonly<Record<Purpose, string>>;
  readonly techniques: readonly TechniqueDef[];
  readonly reviewer: { readonly sections: readonly SectionDef[] };
  readonly templates: Readonly<Record<string, string>>;
  readonly stages: readonly StageDef[];
}
