import { offers, type ControlMap } from './toolbar-controls.pure';
import type { Level } from './workflow-state.pure';

interface CliCalloutBar {
  readonly level: Level;
  readonly controls: ControlMap;
  readonly readonly: boolean;
}

export const showsCliCallout = ({ level, controls, readonly }: CliCalloutBar): boolean =>
  level === 'technical' && offers(controls, 'level', readonly);
