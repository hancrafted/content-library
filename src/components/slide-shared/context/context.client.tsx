'use client';

import { useEffect, useId, useMemo, useReducer, useRef, useState } from 'react';
import { fromClaudeLog } from './claude-log.pure';
import { deltaText, percentText } from './context-format.pure';
import {
  createState,
  ghostOf,
  litKey,
  matcher,
  reduce,
  renderModeOf,
  visibleStep,
  type ViewEvent,
  type ViewState,
} from './context-state.pure';
import { attentionAt, readoutAt } from './context-usage.pure';
import { fill, storyOf, type ContextViewData, type View } from './context-view';
import styles from './context.module.css';
import { categoriesOf, framesOf } from './context.pure';
import type { Chat, Part } from './context.types';
import { Conversation } from './conversation';
import { Timeline } from './timeline';
import { useWindowEvents } from './use-window-events';
import { ContextColumn } from './window-context';
import { Panel } from './window-panel';
import { rove } from './window-rove';
import { Toolbar } from './window-toolbar';

/* The cornerstone's one client leaf: it holds the view state and renders every part from it. */

/** A Claude Code log read in the browser, sized against the chat's own starting instructions. */
function openLog(text: string, chat: Chat): Chat | null {
  const start = chat.steps[0];
  if (!start) return null;
  const memory = chat.steps.find((s) => s.kind === 'memory')?.blocks[0]?.tokens;
  const opened = fromClaudeLog(text, { id: 'opened', start: { id: start.id, blocks: start.blocks }, memory });
  return opened.steps.length > 1 ? opened : null;
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
    ['context', state.depth === 'technical' ? '18rem' : '26rem', 'ctx'],
    ['panel', parts.chat ? 'minmax(15rem, 1fr)' : 'minmax(15rem, 1.6fr)', 'panel'],
  ];
  const shown = all.filter(([part]) => parts[part]);
  const areas = shown.map(([, , area]) => area).join(' ');
  return {
    '--cols': shown.map(([, col]) => col).join(' ') || '1fr',
    '--areas': areas ? `'${areas}'` : 'none',
    '--main-h': `${height}rem`,
  };
}

function sentenceOf(v: View): string {
  const r = readoutAt(v.frames, v.state.step, v.window);
  const step = v.chat.steps[v.state.step - 1];
  const values = {
    step: r.step,
    steps: r.steps,
    event: step ? storyOf(v, step).event : '',
    delta: deltaText(r.delta, v.locale),
    percent: percentText(r.percent, v.locale),
    who: r.crossed?.who ?? '',
  };
  return fill(r.crossed ? v.words.readoutSentenceCrossed : v.words.readoutSentence, values);
}

/** What a chat holds at every step, computed once per chat: the per-step layout the view reads. */
function useChatModel(chat: Chat) {
  const frames = useMemo(() => framesOf(chat), [chat]);
  const present = useMemo(() => categoriesOf(chat), [chat]);
  const stepOf = useMemo(() => new Map(chat.steps.map((s, i) => [s.id, i + 1])), [chat]);
  return { frames, present, stepOf };
}

function windowOf(data: ContextViewData, state: ViewState) {
  const size = data.preset.windows[state.window] ?? data.preset.windows[0];
  if (!size) throw new Error(`context window: Preset "${data.preset.id}" has no window size`);
  return size;
}

function useView(data: ContextViewData, chat: Chat): View {
  const steps = chat.steps.length;
  const reducer = (s: ViewState, e: ViewEvent) => reduce(s, e, { preset: data.preset, steps });
  const [state, dispatch] = useReducer(reducer, data.preset, createState);
  const model = useChatModel(chat);
  const uid = useId();
  const vis = Math.min(visibleStep(state), steps);
  const window = windowOf(data, state);
  const override = chat === data.chat ? data.overrides[String(vis)] : undefined;
  const attention = attentionAt(chat, model.frames, {
    step: vis,
    windowTokens: window.tokens,
    notes: data.notes,
    override,
  });
  const lit = litKey(state);
  const frame = model.frames[vis - 1] ?? { blocks: [], used: 0, byCategory: {}, inWindow: [] };
  const derived = { vis, frame, window, lit, attention, uid, tech: state.depth === 'technical' };
  return { ...data, ...model, ...derived, chat, state, dispatch, match: matcher(lit), ghost: ghostOf(chat, state) };
}

/** The root's data attributes, which the stylesheet reads for every view. */
function rootAttrs(v: View) {
  return {
    'data-cornerstone': v.preset.id,
    'data-motion': v.preset.motion,
    'data-view': v.tech ? 'grid' : 'bar',
    'data-mode': v.state.mode,
    'data-chat': v.state.chatCollapsed ? 'collapsed' : 'open',
    'data-meter': v.state.meterHidden ? 'hidden' : 'shown',
    'data-lit': v.lit || v.ghost ? '' : undefined,
  };
}

function ChatPart({ v }: { readonly v: View }) {
  if (!v.state.parts.chat) return null;
  return (
    <Conversation
      chat={v.chat}
      frames={v.frames}
      vis={v.vis}
      attention={v.attention}
      lit={v.lit}
      ghost={v.ghost}
      pinned={v.state.pinned}
      words={v.words}
      locale={v.locale}
      story={v.story}
      notes={v.notes}
      renderMode={renderModeOf(v.state, 'conversation')}
      collapsed={v.state.chatCollapsed}
      hint={!v.preset.timelineLocked && v.state.parts.timeline}
      hintSeen={v.state.hintSeen}
    />
  );
}

function TimelinePart({ v, valueText }: { readonly v: View; readonly valueText: string }) {
  const { dispatch } = v;
  return (
    <Timeline
      chat={v.chat}
      notes={v.notes}
      words={v.words}
      locale={v.locale}
      story={v.story}
      renderMode={renderModeOf(v.state, 'timeline')}
      step={v.state.step}
      previewStep={v.state.previewStep}
      locked={v.preset.timelineLocked}
      valueText={valueText}
      onPreview={(step) => dispatch({ type: 'PREVIEW', step })}
      onPreviewEnd={() => dispatch({ type: 'PREVIEW_END' })}
      onCommit={(step) => dispatch({ type: 'COMMIT', step })}
    />
  );
}

function Parts({ v, sentence }: { readonly v: View; readonly sentence: string }) {
  const P = v.state.parts;
  return (
    <div className={styles.main} style={columns(P, v.state, v.preset.height) as never}>
      <ChatPart v={v} />
      {P.timeline ? <TimelinePart v={v} valueText={sentence} /> : null}
      {P.context ? <ContextColumn v={v} onRove={rove} /> : null}
      {P.panel ? <Panel v={v} /> : null}
    </div>
  );
}

/** Opening a log swaps the chat and steps to its end; a file that holds no chat says so. */
function useUpload(data: ContextViewData) {
  const [chat, setChat] = useState(data.chat);
  const [note, setNote] = useState('');
  const v = useView(data, chat);
  const onOpen = (text: string) => {
    const opened = openLog(text, chat);
    if (opened) setChat(opened);
    if (opened) v.dispatch({ type: 'COMMIT', step: opened.steps.length });
    setNote(opened ? '' : v.words.uploadFailed);
  };
  return { v, note, onOpen };
}

export function ContextClient(data: ContextViewData) {
  const { v, note, onOpen } = useUpload(data);
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const events = useWindowEvents(v, root);
  const sentence = sentenceOf(v);
  const status = note || (v.state.previewStep === null ? sentence : '');
  return (
    <div
      ref={root}
      className={`${styles.root}${ready ? ` ${styles.ready}` : ''} text-caption`}
      {...rootAttrs(v)}
      {...events}
    >
      <Toolbar v={v} onOpen={onOpen} />
      <Parts v={v} sentence={sentence} />
      <p className={styles.sr} role="status" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}
