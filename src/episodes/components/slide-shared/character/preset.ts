/**
 * What a `Character` preset may vary: appearance only (design-ADR 0025, "Scene figures are deep modules"). Poses,
 * motions and moods belong to `Character`, so any preset takes any of them; a setting adds presets in its own
 * `cast.ts` without touching `Character`.
 */

export const BUILDS = ['slim', 'average', 'broad'] as const;
export const SKINS = ['light', 'medium', 'deep'] as const;
export const HAIRS = ['long', 'short', 'bun', 'none'] as const;
export const HAIR_TONES = ['dark', 'brown', 'blonde', 'grey'] as const;
export const HEADWEAR = ['captain-cap', 'cap'] as const;
export const OUTFITS = ['officer', 'pilot-jacket', 'freelancer'] as const;
export const PROPS = ['mug', 'clipboard', 'laptop'] as const;

export interface Preset {
  /** `ai` pins one tag in the `ai` meaning colour to the chest: an AI agent drawn as a colleague, nothing else. */
  readonly kind: 'human' | 'ai';
  readonly build: (typeof BUILDS)[number];
  readonly skin: (typeof SKINS)[number];
  readonly hair: (typeof HAIRS)[number];
  /** Brown when left out. */
  readonly hairTone?: (typeof HAIR_TONES)[number];
  readonly headwear?: (typeof HEADWEAR)[number];
  readonly outfit: (typeof OUTFITS)[number];
  /** The one thing the figure carries: at its side when it stands, forward when it holds. */
  readonly prop?: (typeof PROPS)[number];
}
