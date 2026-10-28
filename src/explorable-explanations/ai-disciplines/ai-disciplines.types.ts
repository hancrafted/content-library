import type { Discipline } from './scene-frames.pure';

/** One discipline's words: its card, its scale, its interface and its definition with the source behind it. */
export interface DisciplineWords {
  readonly year: string;
  readonly name: string;
  readonly line: string;
  readonly scale: string;
  readonly interface: string;
  readonly interfaceHint: string;
  readonly definition: string;
  readonly sourceLabel: string;
  readonly sourceUrl: string;
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
export interface AiDisciplinesWords {
  readonly comparable: string;
  readonly definition: string;
  readonly flip: string;
  readonly source: string;
  readonly newTab: string;
  readonly playAll: string;
  readonly disciplines: Readonly<Record<Discipline, DisciplineWords>>;
  readonly scenes: SceneWords;
  readonly llm: LlmWords;
}

/** How a Slide shows the timeline: whether the scenes play once on arrival, and which discipline is lit. */
export interface AiDisciplinesPreset {
  readonly autoplay: boolean;
  readonly lit: Discipline | null;
}

export const PRESETS = ['timeline', 'recap'] as const;
export type AiDisciplinesPresetId = (typeof PRESETS)[number];

/** A Slide's override of the words: any key, at any depth. */
export type WordsOverride = {
  readonly [K in keyof AiDisciplinesWords]?: AiDisciplinesWords[K] extends string
    ? string
    : AiDisciplinesWords[K] extends Readonly<Record<Discipline, DisciplineWords>>
      ? Partial<Readonly<Record<Discipline, Partial<DisciplineWords>>>>
      : Partial<AiDisciplinesWords[K]>;
};
