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

/** The props `Emote` takes: the actor's feeling and words, placed at its head anchor. */
export interface EmoteProps extends ActorProps {
  readonly at: HeadAnchor;
  /** The side the figure faces, where its speech bubble and thought rise; `right` when left out. */
  readonly facing?: 'right' | 'left';
}
