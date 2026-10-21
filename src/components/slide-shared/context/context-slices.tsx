import type { Dispatch, ReactNode } from 'react';
import { Attention as AttentionList } from './attention';
import { columns } from './context-columns.pure';
import { CONTROLS, offers, type Flips } from './context-controls.pure';
import type { Flip, HeadToggle } from './context-parts.types';
import { ContextPreview } from './context-preview';
import type { ViewEvent, ViewState } from './context-state.pure';
import { renderModeOf } from './context-state.pure';
import type { Attention } from './context-usage.pure';
import type { ContextViewData } from './context-view';
import { ContextWindow } from './context-window';
import styles from './context.module.css';
import type { Frame } from './context.pure';
import type { Category, Chat, Part, PartId, WindowSize } from './context.types';
import { Conversation } from './conversation';
import { Details } from './details';
import { Timeline } from './timeline';
import type { useWindowEvents } from './use-window-events';
import { vars } from './window-bits';
import { Toolbar } from './window-toolbar';

/* The parent's side of the parts: each one is handed its own slice of the Model and the callbacks that send events up. */

/** What the parent derives from its state and the chat: each part is handed its slice of this, never all of it. */
export interface Model {
  readonly data: ContextViewData;
  readonly chat: Chat;
  readonly state: ViewState;
  readonly dispatch: Dispatch<ViewEvent>;
  readonly frames: readonly Frame[];
  readonly present: ReadonlySet<Category>;
  readonly stepOf: ReadonlyMap<string, number>;
  /** The step on screen: the preview while scrubbing, else the committed one. */
  readonly vis: number;
  readonly frame: Frame;
  readonly window: WindowSize;
  readonly attention: readonly Attention[];
  readonly lit: string | null;
  readonly ghost: string | null;
}

/** What every part reads of the lit key, and the callbacks it reports lighting through. */
function lightingOf(m: Model) {
  return { lit: m.lit, ghost: m.ghost, pinned: m.state.pinned };
}

function speechOf(m: Model) {
  return { words: m.data.words, locale: m.data.locale, story: m.data.story };
}

interface PartProps {
  readonly m: Model;
  readonly events: ReturnType<typeof useWindowEvents>;
}

function ConversationPart({ m, events }: PartProps) {
  const { state, data } = m;
  if (!state.parts.chat) return null;
  return (
    <Conversation
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'conversation')}
      chat={m.chat}
      frames={m.frames}
      vis={m.vis}
      attention={m.attention}
      notes={data.notes}
      hint={!data.preset.timelineLocked && state.parts.timeline}
      hintSeen={state.hintSeen}
      onLight={events.onLight}
      onPin={events.onPin}
    />
  );
}

function TimelinePart({ m, valueText }: { readonly m: Model; readonly valueText: string }) {
  const { state, dispatch } = m;
  return (
    <Timeline
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'timeline')}
      chat={m.chat}
      notes={m.data.notes}
      step={state.step}
      previewStep={state.previewStep}
      locked={m.data.preset.timelineLocked}
      valueText={valueText}
      onPreview={(step) => dispatch({ type: 'PREVIEW', step })}
      onPreviewEnd={() => dispatch({ type: 'PREVIEW_END' })}
      onCommit={(step) => dispatch({ type: 'COMMIT', step })}
    />
  );
}

/** What each toggle shows and flips: the one place that decides, read by the toolbar and the head alike. */
function flipOf(m: Model, flips: Flips): Flip {
  const { state, dispatch } = m;
  const part = (id: Part): Flip => ({
    pressed: state.parts[id],
    onToggle: () => dispatch({ type: 'TOGGLE_PART', part: id }),
  });
  const mode = (id: PartId | null): Flip => {
    const on = id === null ? state.depth === 'technical' : renderModeOf(state, id) === 'technical';
    const value = on ? 'simple' : 'technical';
    return {
      pressed: on,
      onToggle: () => dispatch(id === null ? { type: 'SET_DEPTH', value } : { type: 'SET_PART_MODE', part: id, value }),
    };
  };
  const by: Record<Flips, () => Flip> = {
    technical: () => mode(null),
    windowTechnical: () => mode('context-window'),
    preview: () => part('preview'),
    zone: () => ({ pressed: state.zone, onToggle: () => dispatch({ type: 'TOGGLE_ZONE' }) }),
  };
  return by[flips]();
}

/** The head's icon buttons the Preset offers, each with the state its registry entry flips. */
function headToggles(m: Model): HeadToggle[] {
  return CONTROLS.flatMap((def) =>
    def.type === 'toggle' && def.placement === 'head' && offers(m.data.preset, def.id)
      ? [{ id: def.id, ...flipOf(m, def.flips) }]
      : [],
  );
}

function ContextPreviewPart({ m, events }: PartProps) {
  return (
    <ContextPreview
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(m.state, 'context-preview')}
      frame={m.frame}
      window={m.window}
      present={m.present}
      onLight={events.onLight}
      onPin={events.onPin}
    />
  );
}

function ContextWindowPart({ m, events }: PartProps) {
  const { state, dispatch } = m;
  const sizes = m.data.preset.windows;
  return (
    <ContextWindow
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'context-window')}
      frames={m.frames}
      frame={m.frame}
      window={m.window}
      sizes={sizes}
      sizeIndex={state.window}
      switchable={sizes.length > 1 && offers(m.data.preset, 'window')}
      meter={offers(m.data.preset, 'meter')}
      zone={state.zone}
      toggles={headToggles(m)}
      stepOf={m.stepOf}
      onSize={(value) => dispatch({ type: 'SET_WINDOW', value })}
      onLight={events.onLight}
      onPin={events.onPin}
    />
  );
}

function DetailsPart({ m, events }: PartProps) {
  const { state } = m;
  return (
    <Details
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'details')}
      chat={m.chat}
      frames={m.frames}
      vis={m.vis}
      frame={m.frame}
      window={m.window}
      stepOf={m.stepOf}
      onLight={events.onLight}
      onPin={events.onPin}
    />
  );
}

function AttentionPart({ m, events }: PartProps) {
  const { state, data } = m;
  return (
    <AttentionList
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'attention')}
      chat={m.chat}
      frames={m.frames}
      vis={m.vis}
      attention={m.attention}
      window={m.window}
      stepOf={m.stepOf}
      layout={data.preset.attention.layout}
      onLight={events.onLight}
      onPin={events.onPin}
      onReveal={events.onReveal}
    />
  );
}

/** The grid's children by part. Each carries its part id as its key, so a reorder moves the DOM nodes, never remounts. */
const PIECES: Readonly<Partial<Record<Part, (p: PartProps & { readonly sentence: string }) => ReactNode>>> = {
  chat: (p) => <ConversationPart key="chat" m={p.m} events={p.events} />,
  timeline: (p) => (p.m.state.parts.timeline ? <TimelinePart key="timeline" m={p.m} valueText={p.sentence} /> : null),
  context: (p) => (p.m.state.parts.context ? <ContextWindowPart key="context" m={p.m} events={p.events} /> : null),
  preview: (p) => (p.m.state.parts.preview ? <ContextPreviewPart key="preview" m={p.m} events={p.events} /> : null),
  panel: (p) => (p.m.state.parts.panel ? <DetailsPart key="panel" m={p.m} events={p.events} /> : null),
  attention: (p) => (p.m.state.parts.attention ? <AttentionPart key="attention" m={p.m} events={p.events} /> : null),
};

/** The grid: every shown part in its own slot, in the order the reader gave. */
export function Parts({ m, events, sentence }: PartProps & { readonly sentence: string }) {
  return (
    <div className={styles.main} style={vars(columns(m.state.parts, m.state, m.data.preset.height))}>
      {m.state.order.map((part) => PIECES[part]?.({ m, events, sentence }))}
    </div>
  );
}

interface ToolbarPartProps {
  readonly m: Model;
  readonly onOpen: (text: string) => void;
  readonly onReorder: (part: Part, before: Part) => void;
}

export function ToolbarPart({ m, onOpen, onReorder }: ToolbarPartProps) {
  const { state, dispatch } = m;
  return (
    <Toolbar
      words={m.data.words}
      preset={m.data.preset}
      chat={m.chat}
      parts={state.parts}
      order={state.order}
      flip={(flips) => flipOf(m, flips)}
      onPart={(part) => dispatch({ type: 'TOGGLE_PART', part })}
      onReorder={onReorder}
      onOpen={onOpen}
    />
  );
}
