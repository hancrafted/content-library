// decision: FE-012 §4.4
export type ControlId =
  | 'picker'
  | 'view'
  | 'level'
  | 'demo'
  | 'debug'
  | 'progressDownload'
  | 'progressUpload'
  | 'download'
  | 'upload'
  | 'reset';

export interface ControlDef {
  readonly id: ControlId;
  readonly type: 'pills' | 'segmented' | 'switch' | 'action';
  readonly label:
    | 'workflow'
    | 'view'
    | 'cli'
    | 'demo'
    | 'reset'
    | 'debug'
    | 'progressSave'
    | 'progressLoad'
    | 'download'
    | 'upload';
  readonly tip:
    | 'workflow'
    | 'viewTip'
    | 'cliTip'
    | 'demoTip'
    | 'resetTip'
    | 'debugTip'
    | 'progressSave'
    | 'progressLoad'
    | 'download'
    | 'upload';
  readonly show: boolean;
}

export const CONTROLS: readonly ControlDef[] = [
  { id: 'picker', type: 'pills', label: 'workflow', tip: 'workflow', show: true },
  { id: 'view', type: 'segmented', label: 'view', tip: 'viewTip', show: true },
  { id: 'level', type: 'switch', label: 'cli', tip: 'cliTip', show: true },
  { id: 'demo', type: 'switch', label: 'demo', tip: 'demoTip', show: true },
  { id: 'debug', type: 'switch', label: 'debug', tip: 'debugTip', show: true },
  { id: 'progressDownload', type: 'action', label: 'progressSave', tip: 'progressSave', show: true },
  { id: 'progressUpload', type: 'action', label: 'progressLoad', tip: 'progressLoad', show: true },
  { id: 'download', type: 'action', label: 'download', tip: 'download', show: true },
  { id: 'upload', type: 'action', label: 'upload', tip: 'upload', show: true },
  { id: 'reset', type: 'action', label: 'reset', tip: 'resetTip', show: true },
];

export interface ControlSetting {
  readonly show?: boolean;
}
export type ControlMap = Readonly<Partial<Record<ControlId, ControlSetting>>>;

const BY_ID = new Map<ControlId, ControlDef>(CONTROLS.map((def) => [def.id, def]));

export function defOf(id: ControlId): ControlDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`human in the loop: unknown control "${id}"`);
  return def;
}

export const controlOf = (controls: ControlMap, id: ControlId): ControlDef => ({ ...defOf(id), ...controls[id] });

const PRACTICE = new Set<ControlId>(['level', 'demo', 'reset', 'debug', 'progressDownload', 'progressUpload']);

export function offers(controls: ControlMap, id: ControlId, readonly = false): boolean {
  return controlOf(controls, id).show && !(readonly && PRACTICE.has(id));
}
