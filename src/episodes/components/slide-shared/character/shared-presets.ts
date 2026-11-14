import type { Preset } from './preset';

/**
 * Presets no setting owns. `aiAgent` is the AI drawn as a person (design-ADR 0025, grill Q17 and Q20–Q22): the amnesiac
 * freelancer, a colleague with a laptop who brings everything he ever learnt but nothing from yesterday. One tag in
 * the `ai` meaning colour marks him, nothing else; he is not a robot. The cast gallery shows him; this Episode's Slides
 * do not.
 */
export const aiAgent: Preset = {
  kind: 'ai',
  build: 'average',
  skin: 'medium',
  hair: 'short',
  hairTone: 'dark',
  outfit: 'freelancer',
  prop: 'laptop',
};
