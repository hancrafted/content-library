import { isMessage, simpleOf } from './context.pure';
import type { Category, Chat, Control, Depth, Mode, Part, Preset } from './context.types';

/* The cornerstone's view state: what is shown, lit and pinned. Transient (FE-001): it lives in memory and a reload
 * returns to the Preset, which is the Slide's own state. */

export const CONTROLS: readonly Control[] = ['show', 'depth', 'mode', 'collapse', 'meter'];
export const PARTS: readonly Part[] = ['chat', 'timeline', 'context', 'panel'];

export interface ViewState {
  readonly step: number;
  readonly previewStep: number | null;
  readonly hover: string | null;
  readonly pinned: string | null;
  readonly mode: Mode;
  readonly depth: Depth;
  readonly parts: Readonly<Record<Part, boolean>>;
  readonly chatCollapsed: boolean;
  readonly meterHidden: boolean;
  /** The window size shown, an index into the Preset's windows. */
  readonly window: number;
  readonly hintSeen: boolean;
}

export type ViewEvent =
  | { readonly type: 'PREVIEW'; readonly step: number }
  | { readonly type: 'PREVIEW_END' }
  | { readonly type: 'COMMIT'; readonly step: number }
  | { readonly type: 'HOVER'; readonly part: string }
  | { readonly type: 'HOVER_END' }
  | { readonly type: 'PIN'; readonly part: string }
  | { readonly type: 'UNPIN' }
  | { readonly type: 'ESC' }
  | { readonly type: 'SET_MODE'; readonly value: Mode }
  | { readonly type: 'SET_DEPTH'; readonly value: Depth }
  | { readonly type: 'SET_WINDOW'; readonly value: number }
  | { readonly type: 'TOGGLE_CHAT' }
  | { readonly type: 'TOGGLE_PART'; readonly part: Part }
  | { readonly type: 'TOGGLE_METER' };

export function createState(preset: Preset): ViewState {
  return {
    step: preset.step,
    previewStep: null,
    hover: null,
    pinned: preset.pinned,
    mode: preset.mode,
    depth: preset.depth,
    parts: { ...preset.show },
    chatCollapsed: false,
    meterHidden: preset.meterHidden,
    window: 0,
    hintSeen: false,
  };
}

const CONTROL_OF: Partial<Record<ViewEvent['type'], Control>> = {
  SET_MODE: 'mode',
  SET_DEPTH: 'depth',
  TOGGLE_CHAT: 'collapse',
  TOGGLE_METER: 'meter',
  TOGGLE_PART: 'show',
};

const isTimeline = (event: ViewEvent) => event.type === 'PREVIEW' || event.type === 'COMMIT';

/** Why an event does nothing under a Preset, or null when it is allowed. Lighting is never locked. */
export function blockedBy(preset: Preset, event: ViewEvent): string | null {
  if (isTimeline(event) && preset.timelineLocked) return 'timeline locked';
  if (event.type === 'SET_WINDOW') return preset.windowSwitch ? null : 'no window switch';
  const control = CONTROL_OF[event.type];
  return control && !offers(preset, control) ? `control "${control}" hidden` : null;
}

/** Whether a Preset's toolbar shows a control. */
export const offers = (preset: Preset, control: Control): boolean =>
  !preset.controlsHidden && preset.controls.includes(control);

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

interface Context {
  readonly preset: Preset;
  /** The chat's length in steps. */
  readonly steps: number;
}

type Handlers = {
  readonly [T in ViewEvent['type']]: (
    state: ViewState,
    event: Extract<ViewEvent, { type: T }>,
    context: Context,
  ) => ViewState;
};

const HANDLERS: Handlers = {
  PREVIEW: (s, e, c) => ({ ...s, hintSeen: true, previewStep: clamp(e.step, 1, c.steps) }),
  PREVIEW_END: (s) => ({ ...s, previewStep: null }),
  COMMIT: (s, e, c) => ({ ...s, hintSeen: true, step: clamp(e.step, 1, c.steps), previewStep: null }),
  HOVER: (s, e) => ({ ...s, hintSeen: true, hover: e.part }),
  HOVER_END: (s) => ({ ...s, hover: null }),
  PIN: (s, e) => ({ ...s, hintSeen: true, pinned: s.pinned === e.part ? null : e.part }),
  UNPIN: (s) => ({ ...s, pinned: null }),
  ESC: (s) => ({ ...s, pinned: null, hover: null, previewStep: null }),
  SET_MODE: (s, e) => ({ ...s, hintSeen: true, mode: e.value }),
  SET_DEPTH: (s, e) => ({ ...s, hintSeen: true, depth: e.value }),
  SET_WINDOW: (s, e, c) => ({ ...s, window: clamp(e.value, 0, c.preset.windows.length - 1) }),
  TOGGLE_CHAT: (s) => ({ ...s, hintSeen: true, chatCollapsed: !s.chatCollapsed }),
  TOGGLE_PART: (s, e) => ({ ...s, hintSeen: true, parts: { ...s.parts, [e.part]: !s.parts[e.part] } }),
  TOGGLE_METER: (s) => ({ ...s, hintSeen: true, meterHidden: !s.meterHidden }),
};

/** The next state after an event; an event the Preset blocks returns the same state. */
export function reduce(state: ViewState, event: ViewEvent, context: Context): ViewState {
  if (blockedBy(context.preset, event)) return state;
  const handler = HANDLERS[event.type] as (s: ViewState, e: ViewEvent, c: Context) => ViewState;
  return handler(state, event, context);
}

export const visibleStep = (state: ViewState): number => state.previewStep ?? state.step;
export const litKey = (state: ViewState): string | null => state.hover ?? state.pinned;

/** Whether a block lights for a lit key: a step id, a block (`id@cat`), a category (`cat:`, `scat:`) or the group. */
export function matcher(key: string | null): (id: string, cat: Category) => boolean {
  if (!key) return () => false;
  if (key.startsWith('cat:')) return (_id, cat) => cat === key.slice(4);
  if (key.startsWith('scat:')) return (_id, cat) => simpleOf(cat) === key.slice(5);
  if (key === 'group:messages') return (_id, cat) => isMessage(cat);
  const [stepId, blockCat] = key.split('@');
  if (blockCat) return (id, cat) => id === stepId && cat === blockCat;
  return (id) => id === key;
}

/** The step id a key names, or null for a category key. */
export const stepOfKey = (key: string | null): string | null =>
  key && !key.includes(':') ? (key.split('@')[0] ?? null) : null;

/** A pinned step not yet in the window at the visible step: drawn as a dashed empty outline. */
export function ghostOf(chat: Chat, state: ViewState): string | null {
  const id = stepOfKey(state.pinned);
  if (!id) return null;
  const index = chat.steps.findIndex((step) => step.id === id);
  return index >= visibleStep(state) ? id : null;
}

/**
 * A new key replays the detail card's entrance. Explain replays when what it explains changes; Attention only when
 * the mode or depth does, so hovering a row restyles it and never remounts the list.
 */
export const panelKey = (view: {
  readonly mode: Mode;
  readonly depth: Depth;
  readonly lit: string | null;
  readonly ghost: string | null;
}): string =>
  (view.mode === 'attention' ? [view.mode, view.depth] : [view.mode, view.depth, view.lit, view.ghost]).join('|');
