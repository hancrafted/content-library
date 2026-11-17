import type { Row } from './rows.pure';
import type { Level } from './scene-frames.pure';
import type { SpanEnd, Stops } from './spans.pure';

export interface LevelWords {
  readonly year: string;
  readonly name: string;
  readonly line: string;
  readonly scale: string;
  readonly interface: string;
  readonly interfaceHint: string;
  readonly definition: string;
  readonly sourceLabel: string;
  readonly sourceUrl: string;
  // evidence: docs/llm-wiki/research/LLM/LLM-0019__ai-productivity-ceiling-per-level/research.md
  readonly productivity: string;
  readonly measured: string;
  // evidence: docs/llm-wiki/research/LLM/LLM-0025__ai-adoption-per-capability-level/research.md
  readonly adoption: AdoptionWords;
}

export interface AdoptionWords {
  readonly stat: string;
  readonly what: string;
  readonly population: string;
  readonly source: string;
}

export interface SceneWords {
  readonly prompt: string;
  readonly answer: string;
  readonly agentPrompt: string;
  readonly agentAnswer: string;
  readonly tool1: string;
  readonly tool2: string;
  readonly loop: string;
  readonly loopDone: string;
  readonly agent: string;
  readonly factory: string;
}

export type LayerRow = 'disciplines' | 'oversight';
export type DisciplineId = 'prompt' | 'context' | 'harness' | 'loop' | 'graph';
export type OversightId = 'hitl' | 'hotl' | 'hootl';
export type LayerItemId = DisciplineId | OversightId;

export interface LayerDefinition {
  readonly by: string;
  readonly text: string;
  readonly title: string;
  readonly url: string;
}

export interface LayerItemWords {
  readonly name: string;
  readonly line: string;
  readonly definitions: readonly LayerDefinition[];
}

export interface LayerWords {
  readonly hint: string;
  readonly items: Readonly<Partial<Record<LayerItemId, LayerItemWords>>>;
}

export interface LayerSpan {
  readonly id: LayerItemId;
  readonly tone: 'info' | 'accent' | 'muted';
  readonly from: SpanEnd;
  readonly to: SpanEnd;
  readonly stops?: Stops;
  readonly emerging?: boolean;
}

export interface LlmWords {
  readonly kicker: string;
  readonly name: string;
  readonly before: string;
  readonly token: string;
  readonly after: string;
  readonly tokenGloss: string;
  readonly definition: string;
  readonly sourceLabel: string;
  readonly sourceUrl: string;
  readonly tokens: readonly string[];
}

export interface AiCapabilityWords {
  readonly definition: string;
  readonly flip: string;
  readonly source: string;
  readonly newTab: string;
  readonly playAll: string;
  readonly rows: Readonly<Record<Row, string>> & { readonly label: string };
  readonly hypothesis: string;
  readonly measured: string;
  readonly promise: string;
  readonly emerging: string;
  readonly noData: string;
  readonly expect: string;
  readonly expectation: string;
  readonly expectationSource: string;
  readonly previous: string;
  readonly next: string;
  readonly levels: Readonly<Record<Level, LevelWords>>;
  readonly scenes: SceneWords;
  readonly llm: LlmWords;
  readonly layers: Readonly<Record<LayerRow, LayerWords>>;
}

export interface Productivity {
  readonly claimed: readonly [number, number];
  readonly measured?: readonly [number, number];
}

export interface AiCapabilityPreset {
  readonly autoplay: boolean;
  readonly lit: Level | null;
  readonly turned?: Level | null;
}

export const PRESETS = ['timeline', 'recap', 'agents'] as const;
export type AiCapabilityPresetId = (typeof PRESETS)[number];

export type WordsOverride = {
  readonly [K in keyof AiCapabilityWords]?: AiCapabilityWords[K] extends string
    ? string
    : AiCapabilityWords[K] extends Readonly<Record<Level, LevelWords>>
      ? Partial<Readonly<Record<Level, Partial<LevelWords>>>>
      : Partial<AiCapabilityWords[K]>;
};
