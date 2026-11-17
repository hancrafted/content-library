import { ghostOf, litKey, visibleStep, type ViewState } from './context-state.pure';
import { attentionAt, readoutAt, type Attention, type AttentionInput, type Readout } from './context-usage.pure';
import type { ContextViewData } from './context-view';
import { categoriesOf, framesOf, goneAt, type Frame } from './context.pure';
import type { Category, Chat, WindowSize } from './context.types';

export type StepSource = Pick<ContextViewData, 'preset' | 'chat' | 'notes' | 'overrides'>;

interface ChatModel {
  readonly frames: readonly Frame[];
  readonly present: ReadonlySet<Category>;
  readonly stepOf: ReadonlyMap<string, number>;
}

export interface StepView extends ChatModel {
  readonly vis: number;
  readonly committed: number;
  readonly frame: Frame;
  readonly window: WindowSize;
  readonly readout: Readout;
  readonly attention: readonly Attention[];
  readonly overridden: boolean;
  readonly lit: string | null;
  readonly ghost: string | null;
  readonly gone: ReadonlySet<number>;
}

const EMPTY_FRAME: Frame = { blocks: [], used: 0, byCategory: {}, inWindow: [] };

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
