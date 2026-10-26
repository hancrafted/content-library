/*
 * The control registry (FE-012 §4.4): one typed definition per toolbar control, in code. A Slide's Preset `controls`
 * map holds id -> overrides, laid over the definition key by key, as the context window's `context-controls.pure.ts`
 * does. The pill toolbar draws them in registry order: the Workflow pills, a separator, then the icon buttons.
 */

export type ControlId = 'picker' | 'level' | 'teaching' | 'reset' | 'download' | 'upload';

export interface ControlDef {
  readonly id: ControlId;
  /** `pills` is the Workflow picker, `segmented` the two-way Chat · CLI control, `switch` the teaching mode, `action` an icon button that does one thing. */
  readonly type: 'pills' | 'segmented' | 'switch' | 'action';
  /** The keys of the visual's labels the control reads: its accessible name and its tooltip (`UiWords` keys). */
  readonly label: 'workflow' | 'level' | 'teaching' | 'reset' | 'download' | 'upload';
  readonly tip: 'workflow' | 'levelTip' | 'teachingTip' | 'resetTip' | 'download' | 'upload';
  /** Shown unless the Preset says otherwise. */
  readonly show: boolean;
}

export const CONTROLS: readonly ControlDef[] = [
  { id: 'picker', type: 'pills', label: 'workflow', tip: 'workflow', show: true },
  { id: 'level', type: 'segmented', label: 'level', tip: 'levelTip', show: true },
  { id: 'teaching', type: 'switch', label: 'teaching', tip: 'teachingTip', show: true },
  { id: 'reset', type: 'action', label: 'reset', tip: 'resetTip', show: true },
  { id: 'download', type: 'action', label: 'download', tip: 'download', show: true },
  { id: 'upload', type: 'action', label: 'upload', tip: 'upload', show: true },
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

const PRACTICE = new Set<ControlId>(['level', 'teaching', 'reset']);

/** Whether the toolbar draws a control: the Preset has not hidden it, and `readonly` hides what only a practising viewer uses: the Chat · CLI control, teaching and reset. */
export function offers(controls: ControlMap, id: ControlId, readonly = false): boolean {
  return controlOf(controls, id).show && !(readonly && PRACTICE.has(id));
}
