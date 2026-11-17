// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export const BUILDS = ['slim', 'average', 'broad'] as const;
export const SKINS = ['light', 'medium', 'deep'] as const;
export const HAIRS = ['long', 'short', 'bun', 'none'] as const;
export const HAIR_TONES = ['dark', 'brown', 'blonde', 'grey'] as const;
export const HEADWEAR = ['captain-cap', 'cap'] as const;
export const OUTFITS = ['officer', 'pilot-jacket', 'freelancer'] as const;
export const PROPS = ['mug', 'clipboard', 'laptop'] as const;

export interface Preset {
  readonly kind: 'human' | 'ai';
  readonly build: (typeof BUILDS)[number];
  readonly skin: (typeof SKINS)[number];
  readonly hair: (typeof HAIRS)[number];
  readonly hairTone?: (typeof HAIR_TONES)[number];
  readonly headwear?: (typeof HEADWEAR)[number];
  readonly outfit: (typeof OUTFITS)[number];
  readonly prop?: (typeof PROPS)[number];
}
