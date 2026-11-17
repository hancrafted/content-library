import type { Preset } from './preset';

// decision: docs/adr/0025-scene-figures-are-deep-modules.md
export const aiAgent: Preset = {
  kind: 'ai',
  build: 'average',
  skin: 'medium',
  hair: 'short',
  hairTone: 'dark',
  outfit: 'freelancer',
  prop: 'laptop',
};
