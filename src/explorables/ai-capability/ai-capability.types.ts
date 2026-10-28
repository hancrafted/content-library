import type { Row } from './rows.pure';
import type { Level } from './scene-frames.pure';

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
  /** The Ceiling row: the claimed range as printed, and what studies measured (research LLM-0019). */
  readonly ceiling: string;
  readonly measured: string;
  /** The Mismatch row: the evidence this Level carries on the gap band, and where it comes from (research LLM-0020). */
  readonly gap: string;
  readonly gapSource: string;
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
  readonly comparable: string;
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
  /** The Mismatch row's two markers: where most people are, and what leaders expect. */
  readonly here: string;
  readonly expect: string;
  /** The carousel's arrow buttons, in a narrow container. */
  readonly previous: string;
  readonly next: string;
  readonly levels: Readonly<Record<Level, LevelWords>>;
  readonly scenes: SceneWords;
  readonly llm: LlmWords;
}

/** A Level's ceiling on the track: the claimed range, and the measured one where a study exists. */
export interface Ceiling {
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
