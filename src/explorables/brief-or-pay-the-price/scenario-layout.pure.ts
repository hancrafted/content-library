import { layoutVertical } from './scenario-layout-narrow.pure';
import { layoutHorizontal } from './scenario-layout-wide.pure';
import type { Layout, ScenarioFile } from './scenario.types';

export const layoutScenario = (file: ScenarioFile, orient: Layout['orient']): Layout =>
  orient === 'vertical' ? layoutVertical(file) : layoutHorizontal(file);
