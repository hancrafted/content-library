import type { Row } from './rows.pure';
import type { Level } from './scene-frames.pure';
import type { SpanEnd, Stops } from './spans.pure';

/** One level's words: its card, its scale, its interface and its definition with the source behind it. */
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
  /** The Productivity increase row: the claimed range as printed, and what studies measured (research LLM-0019). */
  readonly productivity: string;
  readonly measured: string;
  /** The Adoption row: one number and the population it was measured in (research LLM-0025); an empty stat has none. */
  readonly adoption: AdoptionWords;
}

/** One Level's Adoption cell: the share, what it counts, among whom, and the source. */
export interface AdoptionWords {
  readonly stat: string;
  readonly what: string;
  readonly population: string;
  readonly source: string;
}

/** The lines the scenes show, keyed as the frames name them. */
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
  /** What the factory scene shows, said to assistive tech. */
  readonly factory: string;
}

/** The two layer rows: one item each per span the config lists. */
export type LayerRow = 'disciplines' | 'oversight';
export type DisciplineId = 'prompt' | 'context' | 'harness' | 'loop' | 'graph';
export type OversightId = 'hitl' | 'hotl' | 'hootl';
export type LayerItemId = DisciplineId | OversightId;

/** One definition of a layer item: who gives it, what it says and the page it comes from. */
export interface LayerDefinition {
  readonly by: string;
  readonly text: string;
  readonly title: string;
  readonly url: string;
}

/** A layer item's words: its name, a one-line meaning on its card, and the definitions shown when it is opened. */
export interface LayerItemWords {
  readonly name: string;
  readonly line: string;
  readonly definitions: readonly LayerDefinition[];
}

/** A layer row's words: the hint under it and its items. */
export interface LayerWords {
  readonly hint: string;
  readonly items: Readonly<Partial<Record<LayerItemId, LayerItemWords>>>;
}

/** Where a layer item sits: its span between two Level edges, its tone and, for a fading one, its strength stops. */
export interface LayerSpan {
  readonly id: LayerItemId;
  readonly tone: 'info' | 'accent' | 'muted';
  readonly from: SpanEnd;
  readonly to: SpanEnd;
  readonly stops?: Stops;
  readonly emerging?: boolean;
}

/** The model band: its sentence, split around the glossed word "token", and its definition. */
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
  /** The word pieces the band types out, one at a time. */
  readonly tokens: readonly string[];
}

/** Every default word of the timeline; the config pair holds it, and a Slide's `words` override it key by key. */
export interface AiCapabilityWords {
  readonly definition: string;
  readonly flip: string;
  readonly source: string;
  readonly newTab: string;
  readonly playAll: string;
  /** The toolbar: its label and one chip per added row. */
  readonly rows: Readonly<Record<Row, string>> & { readonly label: string };
  readonly hypothesis: string;
  readonly measured: string;
  readonly promise: string;
  readonly emerging: string;
  /** The Adoption row: a Level no survey measures, and the leaders' expectation marked on the Factory. */
  readonly noData: string;
  readonly expect: string;
  readonly expectation: string;
  readonly expectationSource: string;
  /** The carousel's arrow buttons, in a narrow container. */
  readonly previous: string;
  readonly next: string;
  readonly levels: Readonly<Record<Level, LevelWords>>;
  readonly scenes: SceneWords;
  readonly llm: LlmWords;
  readonly layers: Readonly<Record<LayerRow, LayerWords>>;
}

/** A Level's productivity range on the track: the claimed range, and the measured one where a study exists. */
export interface Productivity {
  readonly claimed: readonly [number, number];
  readonly measured?: readonly [number, number];
}

/** How a Slide shows the timeline: whether the scenes play once on arrival, and which level is lit. */
export interface AiCapabilityPreset {
  readonly autoplay: boolean;
  readonly lit: Level | null;
}

export const PRESETS = ['timeline', 'recap'] as const;
export type AiCapabilityPresetId = (typeof PRESETS)[number];

/** A Slide's override of the words: any key, at any depth. */
export type WordsOverride = {
  readonly [K in keyof AiCapabilityWords]?: AiCapabilityWords[K] extends string
    ? string
    : AiCapabilityWords[K] extends Readonly<Record<Level, LevelWords>>
      ? Partial<Readonly<Record<Level, Partial<LevelWords>>>>
      : Partial<AiCapabilityWords[K]>;
};
