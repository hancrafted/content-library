/*
 * The control registry: one typed definition per control, in code. A Preset's `controls` map holds id -> overrides,
 * merged key by key over the defaults; `'*'` may carry only `show`. Icons are names here (pure, no React); the UI
 * maps a name to its lucide icon.
 */

export type ControlId =
  | 'parts'
  | 'technical'
  | 'download'
  | 'upload'
  | 'zone'
  | 'conversationTechnical'
  | 'windowTechnical'
  | 'categoryTechnical'
  | 'meter'
  | 'window'
  | 'attentionMenu';

export type IconName = 'code' | 'panel-left-close' | 'download' | 'upload' | 'panel-right' | 'ellipsis';
/** The words a control reads from ContextWords; the UI indexes the words with them, so the compiler checks each. */
export type WordKey =
  | 'showParts'
  | 'technical'
  | 'technicalTip'
  | 'download'
  | 'upload'
  | 'zoneToggle'
  | 'zoneTip'
  | 'conversationTechnical'
  | 'conversationTechnicalTip'
  | 'windowTechnical'
  | 'windowTechnicalTip'
  | 'categoryTechnical'
  | 'categoryTechnicalTip'
  | 'windowGroup'
  | 'attentionMenu'
  | 'attentionMenuTip';

/** The state a toggle flips: a shown-state key of the parent. */
export type Flips = 'technical' | 'zone' | 'conversationTechnical' | 'windowTechnical' | 'categoryTechnical';

/** The parts that have a Simple and a Technical view of their own, so a Technical toggle in their head. */
export type ModePart = 'conversation' | 'context-window' | 'category';

interface Base {
  readonly id: ControlId;
  readonly placement: 'toolbar' | 'head';
  /** The part whose head draws a head control. */
  readonly owner?: ModePart | 'attention';
  /** The fields a Preset may override on this control, besides `show`. */
  readonly fields: readonly ('on' | 'reorder')[];
  /** Shown unless the Preset says otherwise. */
  readonly show: boolean;
}
interface Described extends Base {
  readonly icon: IconName;
  readonly label: WordKey;
  readonly tip: WordKey;
}
export type ControlDef =
  | (Described & { readonly type: 'toggle'; readonly flips: Flips })
  | (Base & { readonly type: 'segmented'; readonly label: WordKey })
  | (Described & { readonly type: 'action'; readonly run: 'download' | 'upload' })
  | (Base & { readonly type: 'chips'; readonly label: WordKey })
  /** A button in the Attention head that opens its distribution sliders. */
  | (Described & { readonly type: 'menu' })
  /** Not a button: the head's usage figures (the percent and "used of window"), which a Preset may hide. */
  | (Base & { readonly type: 'readout' });

/** One local Technical toggle per part that has both views; the toolbar's Technical sets every part. */
const modeControl = (owner: ModePart, id: ModeId): ControlDef => ({
  id,
  type: 'toggle',
  flips: id,
  placement: 'head',
  owner,
  fields: [],
  show: true,
  icon: 'code',
  label: id,
  tip: `${id}Tip`,
});

type ModeId = 'conversationTechnical' | 'windowTechnical' | 'categoryTechnical';

const MODE_CONTROLS: readonly ControlDef[] = [
  modeControl('conversation', 'conversationTechnical'),
  modeControl('context-window', 'windowTechnical'),
  modeControl('category', 'categoryTechnical'),
];

/** The control that sets one part's own renderMode. */
export const modeControlOf = (part: ModePart): ControlId =>
  MODE_CONTROLS.find((def) => def.owner === part)?.id ?? 'technical';

export const CONTROLS: readonly ControlDef[] = [
  { id: 'parts', type: 'chips', placement: 'toolbar', fields: ['reorder'], show: true, label: 'showParts' },
  {
    id: 'technical',
    type: 'toggle',
    flips: 'technical',
    placement: 'toolbar',
    fields: [],
    show: true,
    icon: 'code',
    label: 'technical',
    tip: 'technicalTip',
  },
  {
    id: 'download',
    type: 'action',
    run: 'download',
    placement: 'toolbar',
    fields: [],
    show: true,
    icon: 'download',
    label: 'download',
    tip: 'download',
  },
  {
    id: 'upload',
    type: 'action',
    run: 'upload',
    placement: 'toolbar',
    fields: [],
    show: false,
    icon: 'upload',
    label: 'upload',
    tip: 'upload',
  },
  {
    id: 'zone',
    type: 'toggle',
    flips: 'zone',
    placement: 'head',
    owner: 'context-window',
    fields: ['on'],
    show: true,
    icon: 'panel-right',
    label: 'zoneToggle',
    tip: 'zoneTip',
  },
  ...MODE_CONTROLS,
  { id: 'meter', type: 'readout', placement: 'head', fields: [], show: true },
  { id: 'window', type: 'segmented', placement: 'head', fields: [], show: false, label: 'windowGroup' },
  {
    id: 'attentionMenu',
    type: 'menu',
    placement: 'head',
    owner: 'attention',
    fields: [],
    show: true,
    icon: 'ellipsis',
    label: 'attentionMenu',
    tip: 'attentionMenuTip',
  },
];

export const CONTROL_IDS: readonly ControlId[] = CONTROLS.map((def) => def.id);
const BY_ID = new Map<string, ControlDef>(CONTROLS.map((def) => [def.id, def]));

/** What a Preset may say about one control. */
export interface ControlSetting {
  readonly show?: boolean;
  /** The state a toggle starts in, for a toggle whose state the Preset has no other field for. */
  readonly on?: boolean;
  readonly reorder?: boolean;
}
export type ControlMap = Readonly<Partial<Record<ControlId | '*', ControlSetting>>>;
export interface HasControls {
  readonly controls: ControlMap;
}

export type ResolvedControl = ControlDef & {
  readonly show: boolean;
  readonly on?: boolean;
  readonly reorder?: boolean;
};

/** The registry's definition of a control, whatever a Preset says about it. */
export function defOf(id: ControlId): ControlDef {
  const def = BY_ID.get(id);
  if (!def) throw new Error(`context window: unknown control "${id}"`);
  return def;
}

/** A control as the Preset sets it: the registry's default, then `'*'`, then the control's own overrides. */
export function controlOf(preset: HasControls, id: ControlId): ResolvedControl {
  const def = defOf(id);
  const star = def.type === 'readout' ? undefined : preset.controls['*']?.show;
  return { ...def, ...(star === undefined ? {} : { show: star }), ...preset.controls[id] };
}

export const offers = (preset: HasControls, id: ControlId): boolean => controlOf(preset, id).show;

/**
 * The Preset's map over the config defaults, key by key. `'*'` is folded into every control the Preset does not
 * name itself, so an explicit control beats `'*'` and `'*'` beats the defaults. A readout (the head's usage figures)
 * is no button: `'*'` leaves it alone.
 */
export function mergeControls(defaults: ControlMap, own: ControlMap): ControlMap {
  const star = own['*'];
  const merged = Object.fromEntries(
    CONTROL_IDS.map((id) => [
      id,
      { ...defaults[id], ...(star?.show === undefined || isReadout(id) ? {} : star), ...own[id] },
    ]),
  );
  return star ? { ...merged, '*': star } : merged;
}

const isReadout = (id: string): boolean => BY_ID.get(id)?.type === 'readout';
const isFlag = (value: unknown): boolean => typeof value === 'boolean';

function settingProblems(id: string, setting: object, allowed: readonly string[]) {
  return Object.entries(setting).flatMap(([key, value]) => {
    if (key !== 'show' && !allowed.includes(key)) return [`control "${id}" does not take ${key}`];
    return isFlag(value) ? [] : [`control "${id}" ${key} must be true or false`];
  });
}

/** What is wrong with a Preset's `controls` map; `windows` is how many window sizes the Preset has. */
export function controlProblems(controls: ControlMap, windows: number): string[] {
  const problems = Object.entries(controls).flatMap(([id, setting]) => {
    if (id === '*') {
      const extra = Object.keys(setting ?? {}).filter((key) => key !== 'show');
      return extra.length ? [`controls "*" may only set show, not ${extra.join(', ')}`] : [];
    }
    const def = BY_ID.get(id);
    if (!def) return [`unknown control "${id}"`];
    return settingProblems(id, setting ?? {}, def.fields);
  });
  const needsTwo = controls.window?.show === true && windows < 2;
  return [...problems, ...(needsTwo ? ['the window switch needs two window sizes'] : [])];
}
