// decision: docs/decision-records/0025-scene-figures-are-deep-modules.md
export const MOODS = ['confused', 'surprised', 'happy', 'thinking', 'blank'] as const;
export type Mood = (typeof MOODS)[number];

export interface ActorProps {
  readonly mood?: Mood;
  readonly says?: string;
}

export interface HeadAnchor {
  readonly x: number;
  readonly y: number;
}

export interface BubblePlace {
  readonly width?: number;
  readonly lift?: number;
}

export interface EmoteProps extends ActorProps {
  readonly at: HeadAnchor;
  readonly bubble?: BubblePlace;
  readonly facing?: 'right' | 'left';
}
