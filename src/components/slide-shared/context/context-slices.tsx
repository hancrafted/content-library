import type { Dispatch } from 'react';
import { Attention as AttentionList } from './attention';
import { ContextPreview } from './context-preview';
import type { ViewEvent, ViewState } from './context-state.pure';
import { renderModeOf } from './context-state.pure';
import type { Attention } from './context-usage.pure';
import type { ContextViewData } from './context-view';
import { ContextWindow } from './context-window';
import styles from './context.module.css';
import type { Frame } from './context.pure';
import type { Category, Chat, Part, WindowSize } from './context.types';
import { Conversation } from './conversation';
import { Details } from './details';
import { Timeline } from './timeline';
import type { useWindowEvents } from './use-window-events';
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

function chatWidth(parts: ViewState['parts'], collapsed: boolean): string {
  if (collapsed) return '3rem';
  return !parts.context && !parts.panel ? 'minmax(16rem, 40rem)' : 'minmax(16rem, 1.15fr)';
}

/** The grid's columns, one per part shown: the layout follows the parts, not the other way round. */
function columns(parts: ViewState['parts'], state: ViewState, height: number) {
  const all: [Part, string, string][] = [
    ['chat', chatWidth(parts, state.chatCollapsed), 'chat'],
    ['timeline', '3.5rem', 'timeline'],
    ['context', renderModeOf(state, 'context-window') === 'technical' ? '18rem' : '26rem', 'ctx'],
    ['panel', parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'panel'],
    ['attention', parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'att'],
  ];
  const shown = all.filter(([part]) => parts[part]);
  const areas = shown.map(([, , area]) => area).join(' ');
  return {
    '--cols': shown.map(([, col]) => col).join(' ') || '1fr',
    '--areas': areas ? `'${areas}'` : 'none',
    '--main-h': `${height}rem`,
  };
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
      collapsed={state.chatCollapsed}
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

function ContextWindowPart({ m, events }: PartProps) {
  const { state, dispatch } = m;
  return (
    <ContextWindow
      {...lightingOf(m)}
      {...speechOf(m)}
      renderMode={renderModeOf(state, 'context-window')}
      frames={m.frames}
      frame={m.frame}
      window={m.window}
      sizes={m.data.preset.windows}
      sizeIndex={state.window}
      switchable={m.data.preset.windowSwitch}
      stepOf={m.stepOf}
      onSize={(value) => dispatch({ type: 'SET_WINDOW', value })}
      onLight={events.onLight}
      onPin={events.onPin}
    >
      <ContextPreview
        {...lightingOf(m)}
        {...speechOf(m)}
        renderMode={renderModeOf(state, 'context-preview')}
        frame={m.frame}
        window={m.window}
        present={m.present}
      />
    </ContextWindow>
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

export function Parts({ m, events, sentence }: PartProps & { readonly sentence: string }) {
  const P = m.state.parts;
  return (
    <div className={styles.main} style={columns(P, m.state, m.data.preset.height) as never}>
      <ConversationPart m={m} events={events} />
      {P.timeline ? <TimelinePart m={m} valueText={sentence} /> : null}
      {P.context ? <ContextWindowPart m={m} events={events} /> : null}
      {P.panel ? <DetailsPart m={m} events={events} /> : null}
      {P.attention ? <AttentionPart m={m} events={events} /> : null}
    </div>
  );
}

export function ToolbarPart({ m, onOpen }: { readonly m: Model; readonly onOpen: (text: string) => void }) {
  const { state, dispatch } = m;
  return (
    <Toolbar
      words={m.data.words}
      preset={m.data.preset}
      chat={m.chat}
      parts={state.parts}
      technical={state.depth === 'technical'}
      chatCollapsed={state.chatCollapsed}
      meterHidden={state.meterHidden}
      onPart={(part) => dispatch({ type: 'TOGGLE_PART', part })}
      onTechnical={(on) => dispatch({ type: 'SET_DEPTH', value: on ? 'technical' : 'simple' })}
      onCollapse={() => dispatch({ type: 'TOGGLE_CHAT' })}
      onMeter={() => dispatch({ type: 'TOGGLE_METER' })}
      onOpen={onOpen}
    />
  );
}
