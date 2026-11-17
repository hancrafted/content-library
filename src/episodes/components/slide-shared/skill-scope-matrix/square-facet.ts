export type SquareTone =
  | 'binder'
  | 'binder-lit'
  | 'binder-shade'
  | 'cloud-lit'
  | 'cloud-shade'
  | 'desk'
  | 'desk-lit'
  | 'desk-shade'
  | 'drop'
  | 'gilt'
  | 'glow'
  | 'glow-soft'
  | 'lead'
  | 'manual'
  | 'manual-lit'
  | 'manual-shade'
  | 'own'
  | 'own-lit'
  | 'own-shade'
  | 'paper'
  | 'paper-lit'
  | 'paper-rule'
  | 'paper-shade'
  | 'pencil'
  | 'pencil-lit'
  | 'pencil-tip'
  | 'pin'
  | 'room'
  | 'room-lit'
  | 'room-shade'
  | 'scribble'
  | 'sea-surface'
  | 'sea-surface-lit'
  | 'sky-1'
  | 'sky-2'
  | 'sky-3'
  | 'sky-4'
  | 'spine'
  | 'tab-a'
  | 'tab-b'
  | 'tab-c';

export interface SquareFacet {
  readonly tone: SquareTone;
  readonly d: string;
}

export interface SquareFacets {
  readonly back: readonly SquareFacet[];
  readonly front: readonly SquareFacet[];
}
