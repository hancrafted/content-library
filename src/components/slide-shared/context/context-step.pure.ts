import { ghostOf, litKey, visibleStep, type ViewState } from './context-state.pure';
import { attentionAt, readoutAt, type Attention, type AttentionInput, type Readout } from './context-usage.pure';
import type { ContextViewData } from './context-view';
import { categoriesOf, framesOf, goneAt, type Frame } from './context.pure';
import type { Category, Chat, WindowSize } from './context.types';

/*
 * The step view: what more than one part reads at the step on screen, derived from the Preset, the chat and the view
 * state. A derivation only one part uses stays in that part; view transitions stay in context-state.pure.ts.
 */

/** The slice of the view data the step view reads. */
export type StepSource = Pick<ContextViewData, 'preset' | 'chat' | 'notes' | 'overrides'>;

/** What a chat holds at every step, the same objects for as long as the chat is the same one. */
interface ChatModel {
  /** The window after each step, index 0 for step 1. */
  readonly frames: readonly Frame[];
  /** The categories the chat ever holds, so rows stay fixed while it steps. */
  readonly present: ReadonlySet<Category>;
  /** The 1-based step of each step id. */
  readonly stepOf: ReadonlyMap<string, number>;
}

export interface StepView extends ChatModel {
  /** The step on screen: the preview while scrubbing, else the committed one. */
  readonly vis: number;
  /** The committed step: what the timeline and the status line announce, never a preview. */
  readonly committed: number;
  /** The window after the step on screen. */
  readonly frame: Frame;
  /** The window size the reader switched to, the Preset's first at rest. */
  readonly window: WindowSize;
  /** The readout of the step on screen: its fill, its growth and the highest line it crossed. */
  readonly readout: Readout;
  /** The units of attention over the steps in the window: the Preset's own split where it names this step, else the curve. */
  readonly attention: readonly Attention[];
  /** The Preset's own split is in force, so the curve's sliders would change nothing. */
  readonly overridden: boolean;
  /** The key every part lights: the hovered one, else the pinned one. */
  readonly lit: string | null;
  /** A pinned step the screen has not reached yet, drawn as a ghost. */
  readonly ghost: string | null;
  /** The 0-based indices of the steps a compaction or clearing removed from the window by the step on screen. */
  readonly gone: ReadonlySet<number>;
}

const EMPTY_FRAME: Frame = { blocks: [], used: 0, byCategory: {}, inWindow: [] };

// Memoised items take a frame's blocks as props: rebuilding them on every hover would redraw every item.
const chatModels = new WeakMap<Chat, ChatModel>();

function chatModelOf(chat: Chat): ChatModel {
  const known = chatModels.get(chat);
  if (known) return known;
  const model = {
    frames: framesOf(chat),
    present: categoriesOf(chat),
    stepOf: new Map(chat.steps.map((step, i) => [step.id, i + 1])),
  };
  chatModels.set(chat, model);
  return model;
}

// The compressed Attention list refits its heights on a new array, so a hover must hand back the one it had.
const lastAttention = new WeakMap<Chat, { readonly input: AttentionInput; readonly attention: readonly Attention[] }>();

const sameInput = (a: AttentionInput, b: AttentionInput) =>
  (Object.keys(a) as (keyof AttentionInput)[]).every((key) => a[key] === b[key]);

function attentionOf(chat: Chat, frames: readonly Frame[], input: AttentionInput): readonly Attention[] {
  const last = lastAttention.get(chat);
  if (last && sameInput(last.input, input)) return last.attention;
  const attention = attentionAt(chat, frames, input);
  lastAttention.set(chat, { input, attention });
  return attention;
}

function windowOf(data: StepSource, state: ViewState): WindowSize {
  const size = data.preset.windows[state.window] ?? data.preset.windows[0];
  if (!size) throw new Error(`context window: Preset "${data.preset.id}" has no window size`);
  return size;
}

export function stepView(data: StepSource, chat: Chat, state: ViewState): StepView {
  const model = chatModelOf(chat);
  const { frames } = model;
  const vis = Math.min(visibleStep(state), chat.steps.length);
  const window = windowOf(data, state);
  // A log the reader opened has steps of its own, so the Preset's split never applies to it.
  const override = chat === data.chat ? data.overrides[String(vis)] : undefined;
  const { falloff } = data.preset.attention;
  const attention = attentionOf(chat, frames, {
    step: vis,
    windowTokens: window.tokens,
    notes: data.notes,
    override,
    curve: state.curve,
    falloff,
  });
  return {
    ...model,
    vis,
    committed: state.step,
    frame: frames[vis - 1] ?? EMPTY_FRAME,
    window,
    readout: readoutAt(frames, vis, window),
    attention,
    overridden: override !== undefined,
    lit: litKey(state),
    ghost: ghostOf(chat, state),
    gone: new Set(chat.steps.flatMap((_, index) => (goneAt(chat, frames, { index, step: vis }) ? [index] : []))),
  };
}
