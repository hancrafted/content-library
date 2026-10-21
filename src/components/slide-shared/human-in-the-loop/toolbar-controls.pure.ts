import type { Mode } from './workflow-state.pure';

/*
 * The control registry (FE-012 §4.4): one typed definition per toolbar control, in code. A Slide's Preset `controls`
 * map holds id -> overrides, laid over the definition key by key, as the context window's `context-controls.pure.ts`
 * does. A control also names the modes it shows in: in Watch the toolbar is only the Watch / Try switch.
 */

export type ControlId = 'mode' | 'level' | 'setup' | 'picker' | 'download' | 'upload';

export interface ControlDef {
  readonly id: ControlId;
  readonly type: 'segmented' | 'block' | 'select' | 'action';
  /** The key of the visual's label the control reads (a `UiWords` key). */
  readonly label: 'modeWatch' | 'levelSimple' | 'setup' | 'workflow' | 'download' | 'upload';
  /** The modes the control shows in. */
  readonly modes: readonly Mode[];
  /** Shown unless the Preset says otherwise. */
  readonly show: boolean;
}

const BOTH: readonly Mode[] = ['watch', 'try'];
const TRY: readonly Mode[] = ['try'];

export const CONTROLS: readonly ControlDef[] = [
  { id: 'mode', type: 'segmented', label: 'modeWatch', modes: BOTH, show: true },
  { id: 'level', type: 'segmented', label: 'levelSimple', modes: TRY, show: true },
  { id: 'setup', type: 'block', label: 'setup', modes: TRY, show: true },
  { id: 'picker', type: 'select', label: 'workflow', modes: TRY, show: true },
  { id: 'download', type: 'action', label: 'download', modes: TRY, show: true },
  { id: 'upload', type: 'action', label: 'upload', modes: TRY, show: true },
];

/** What a Preset may say about one control. */
export interface ControlSetting {
  readonly show?: boolean;
}
export type ControlMap = Readonly<Partial<Record<ControlId, ControlSetting>>>;

const BY_ID = new Map<ControlId, ControlDef>(CONTROLS.map((def) => [def.id, def]));

/** The registry's definition of a control, whatever a Preset says about it. */
export function defOf(id: ControlId): ControlDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`human in the loop: unknown control "${id}"`);
  return def;
}

/** A control as the Preset sets it: the registry's definition, then the Preset's own overrides. */
export const controlOf = (controls: ControlMap, id: ControlId): ControlDef => ({ ...defOf(id), ...controls[id] });

/** Whether the toolbar draws a control in a mode: the Preset has not hidden it and the mode is one it shows in. */
export function offers(controls: ControlMap, id: ControlId, mode: Mode): boolean {
  const def = controlOf(controls, id);
  return def.show && def.modes.includes(mode);
}
