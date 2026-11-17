import type { Preset } from '../character/preset';

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export const captain: Preset = {
  kind: 'human',
  build: 'slim',
  skin: 'light',
  hair: 'long',
  hairTone: 'brown',
  headwear: 'captain-cap',
  outfit: 'officer',
};

export const pilot: Preset = {
  kind: 'human',
  build: 'average',
  skin: 'medium',
  hair: 'short',
  hairTone: 'dark',
  headwear: 'cap',
  outfit: 'pilot-jacket',
  prop: 'mug',
};
