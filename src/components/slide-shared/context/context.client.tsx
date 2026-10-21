'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { fromClaudeLog } from './claude-log.pure';
import { deltaText, percentText } from './context-format.pure';
import { Parts, ToolbarPart, type Model } from './context-slices';
import {
  createState,
  ghostOf,
  litKey,
  reduce,
  visibleStep,
  type ViewEvent,
  type ViewState,
} from './context-state.pure';
import { attentionAt, readoutAt } from './context-usage.pure';
import { fill, storyOf, type ContextViewData } from './context-view';
import styles from './context.module.css';
import { categoriesOf, framesOf } from './context.pure';
import type { Chat } from './context.types';
import { useWindowEvents } from './use-window-events';

/* The cornerstone's one client leaf: it holds the view state and renders every part from it. */

/** A Claude Code log read in the browser, sized against the chat's own starting instructions. */
function openLog(text: string, chat: Chat): Chat | null {
  const start = chat.steps[0];
  if (!start) return null;
  const memory = chat.steps.find((s) => s.kind === 'memory')?.blocks[0]?.tokens;
  const opened = fromClaudeLog(text, { id: 'opened', start: { id: start.id, blocks: start.blocks }, memory });
  return opened.steps.length > 1 ? opened : null;
}

function sentenceOf(m: Model): string {
  const { words, locale } = m.data;
  const r = readoutAt(m.frames, m.state.step, m.window);
  const step = m.chat.steps[m.state.step - 1];
  const values = {
    step: r.step,
    steps: r.steps,
    event: step ? storyOf(m.data, step).event : '',
    delta: deltaText(r.delta, locale),
    percent: percentText(r.percent, locale),
    who: r.crossed?.who ?? '',
  };
  return fill(r.crossed ? words.readoutSentenceCrossed : words.readoutSentence, values);
}

/** What a chat holds at every step, computed once per chat: the per-step layout the parts read. */
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

function useModel(data: ContextViewData, chat: Chat): Model {
  const steps = chat.steps.length;
  const reducer = (s: ViewState, e: ViewEvent) => reduce(s, e, { preset: data.preset, steps });
  const [state, dispatch] = useReducer(reducer, data.preset, createState);
  const model = useChatModel(chat);
  const vis = Math.min(visibleStep(state), steps);
  const window = windowOf(data, state);
  const override = chat === data.chat ? data.overrides[String(vis)] : undefined;
  const attention = attentionAt(chat, model.frames, {
    step: vis,
    windowTokens: window.tokens,
    notes: data.notes,
    override,
  });
  const frame = model.frames[vis - 1] ?? { blocks: [], used: 0, byCategory: {}, inWindow: [] };
  const lit = litKey(state);
  return { ...model, data, chat, state, dispatch, vis, frame, window, attention, lit, ghost: ghostOf(chat, state) };
}

/** The root's data attributes, which the stylesheet reads for every part. */
function rootAttrs(m: Model) {
  return {
    'data-cornerstone': m.data.preset.id,
    'data-motion': m.data.preset.motion,
    'data-mode': m.state.mode,
    'data-chat': m.state.chatCollapsed ? 'collapsed' : 'open',
    'data-meter': m.state.meterHidden ? 'hidden' : 'shown',
    'data-lit': m.lit || m.ghost ? '' : undefined,
  };
}

/** Opening a log swaps the chat and steps to its end; a file that holds no chat says so. */
function useUpload(data: ContextViewData) {
  const [chat, setChat] = useState(data.chat);
  const [note, setNote] = useState('');
  const m = useModel(data, chat);
  const onOpen = (text: string) => {
    const opened = openLog(text, chat);
    if (opened) setChat(opened);
    if (opened) m.dispatch({ type: 'COMMIT', step: opened.steps.length });
    setNote(opened ? '' : data.words.uploadFailed);
  };
  return { m, note, onOpen };
}

export function ContextClient(data: ContextViewData) {
  const { m, note, onOpen } = useUpload(data);
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const events = useWindowEvents({ hover: m.state.hover, pinned: m.state.pinned, dispatch: m.dispatch, root });
  const sentence = sentenceOf(m);
  const status = note || (m.state.previewStep === null ? sentence : '');
  return (
    <div
      ref={root}
      className={`${styles.root}${ready ? ` ${styles.ready}` : ''} text-caption`}
      {...rootAttrs(m)}
      onKeyDown={events.onKeyDown}
    >
      <ToolbarPart m={m} onOpen={onOpen} />
      <Parts m={m} events={events} sentence={sentence} />
      <p className={styles.sr} role="status" aria-atomic="true">
        {status}
      </p>
    </div>
  );
}
