/**
 * The actor contract every figure that shows feeling implements: a person drawn by `Character`, and the `Robot`
 * (design-ADR 0025, "Scene figures are deep modules"). A figure places its emote and speech bubble at its own head
 * anchor, so a Slide never guesses where a head is.
 */

/** The closed set of moods. `blank` is the AI's amnesia: it shows no memory of yesterday. */
export const MOODS = ['confused', 'surprised', 'happy', 'thinking', 'blank'] as const;
export type Mood = (typeof MOODS)[number];

export interface ActorProps {
  /** The feeling the figure shows; its emote pops in once after the figure's own motion. */
  readonly mood?: Mood;
  /** Spoken words, always from the Slide's i18n, never from a preset. */
  readonly says?: string;
}

/** Where a figure's emote and speech bubble attach, in the figure's own SVG user units. */
export interface HeadAnchor {
  readonly x: number;
  readonly y: number;
}

/**
 * Where a Scene wants the speech bubble, in figure units: `width` the words wrap inside (220 when left out), `lift` how
 * far above its usual place by the head it rises, its tail stretched to meet the head. Two speakers facing each other
 * stack their bubbles with a lift; a Slide's layout test measures both with `saysBox` (`says.pure.ts`).
 */
export interface BubblePlace {
  readonly width?: number;
  readonly lift?: number;
}

/** The props `Emote` takes: the actor's feeling and words, placed at its head anchor. */
export interface EmoteProps extends ActorProps {
  readonly at: HeadAnchor;
  readonly bubble?: BubblePlace;
  /** The side the figure faces, where its speech bubble and thought rise; `right` when left out. */
  readonly facing?: 'right' | 'left';
}
