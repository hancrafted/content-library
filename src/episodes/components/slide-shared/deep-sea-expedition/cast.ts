import type { Preset } from '../character/preset';

/**
 * The crew of the deep-sea expedition, as `Character` presets (design-ADR 0025, "Scene figures are deep modules"):
 * appearance only, so either takes any pose, motion and mood. Developed from the Spec's low-poly figures, `woman.py`
 * (the captain) and `parts.py` `pilot_seated` / `pilot_standing` (the pilot).
 */

/** You, the captain: shoulder-long hair under a white-crowned captain's cap, a double-breasted officer's jacket. */
export const captain: Preset = {
  kind: 'human',
  build: 'slim',
  skin: 'light',
  hair: 'long',
  hairTone: 'brown',
  headwear: 'captain-cap',
  outfit: 'officer',
};

/**
 * Your pilot of ten years, the best you know, at the console: a cap, a flight jacket, short hair. He is the AI of the
 * analogy, but he is drawn as the person the Spec drew, with no `ai` tag: the robot is the AI on this Episode's
 * Slides, and the pilot's condition is revealed by the story, not by his clothes.
 */
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
