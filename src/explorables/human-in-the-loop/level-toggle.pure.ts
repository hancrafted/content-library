import type { Level } from './workflow-state.pure';

// tech-debt: https://github.com/hancrafted/content-library/issues/375
export const toggledLevel = (level: Level): Level => (level === 'simple' ? 'technical' : 'simple');
