import type { ToolbarProps } from './part-props.types';
import { offers } from './toolbar-controls.pure';

export const showsCliCallout = ({
  level,
  controls,
  readonly,
}: Pick<ToolbarProps, 'level' | 'controls' | 'readonly'>): boolean =>
  level === 'technical' && offers(controls, 'level', readonly);
