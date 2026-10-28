import { SpeechBubble } from '@/explorables/context-window/speech-bubble/speech-bubble';
import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { ReactNode } from 'react';
import { ContextBars } from './context-bars-view';
import { contextData, type ContextLocale, type ContextPresetId, type MiniPresetId } from './context-data';
import type { ContextViewData } from './context-view';
import type { ContextWords } from './context-words.types';
import { ContextClient } from './context.client';
import { SessionBarView } from './session-bar-view';

/*
 * The context window cornerstone, an Explorable. A Slide places it by Preset id and locale; the Preset, the chat and
 * the words come from context-preset.config.yml (or its German twin, picked by the locale) at build time, and a Slide
 * may override any word. The interactive part is the one client leaf; the bars are static.
 */

const localeOf = (locale: string): ContextLocale => (locale === 'de' ? 'de' : 'en');

interface Props<Id> {
  readonly preset: Id;
  /** The URL locale; the German config and log for `de`, the English ones otherwise. */
  readonly locale: string;
  /** Words a Slide says differently from the part's own. */
  readonly words?: Partial<ContextWords>;
}

/** The data the client leaf renders a Preset from: plain and serializable. */
export function contextViewData({ preset: id, locale, words }: Props<ContextPresetId>): ContextViewData {
  const data = contextData(localeOf(locale));
  const preset = data.presets[id];
  const chat = preset ? data.chats[preset.chat] : undefined;
  if (!preset || !chat) throw new Error(`context window: unknown Preset "${id}"`);
  return {
    preset,
    chat,
    story: data.story,
    notes: data.notes,
    overrides: data.attention[preset.chat] ?? {},
    words: { ...data.words, ...words },
    locale: localeOf(locale),
  };
}

/** The interactive cornerstone in one Preset's state. */
export function Context(props: Props<ContextPresetId>) {
  return (
    <>
      <ContextClient {...contextViewData(props)} />
      <ExploreItLink slug="context-window" />
    </>
  );
}

/** Static bars drawn horizontally: chats one under the other on one window size. */
export function ContextBarsPreset({ preset: id, locale, words }: Props<MiniPresetId>) {
  const data = contextData(localeOf(locale));
  const mini = data.minis[id];
  if (!mini) throw new Error(`context bars: unknown Preset "${id}"`);
  return <ContextBars mini={mini} chats={data.chats} words={{ ...data.words, ...words }} locale={localeOf(locale)} />;
}

/** The session bar: the audience's attention over the session, filled up to and including the Section `at` (null: fresh). */
export function SessionBarPreset({ at, locale, words }: Omit<Props<never>, 'preset'> & { readonly at: string | null }) {
  const data = contextData(localeOf(locale));
  return <SessionBarView plan={data.session} words={{ ...data.words, ...words }} at={at} />;
}

/**
 * The "Your attention span" card as the AI's speech bubble: its punchline, on an opener a poll line with the three faces, and
 * the session bar filled up to the Section `at` (null: fresh). `children` sit under the bar.
 */
export function AttentionBubblePreset({
  at,
  locale,
  words,
  punchline,
  poll,
  children,
}: Omit<Props<never>, 'preset'> & {
  readonly at: string | null;
  readonly punchline: string;
  /** The Section's poll line; none on the Title slide. */
  readonly poll?: string;
  readonly children?: ReactNode;
}) {
  const data = contextData(localeOf(locale));
  const merged = { ...data.words, ...words };
  return (
    <SpeechBubble
      punchline={punchline}
      poll={poll === undefined ? undefined : { line: poll, labels: merged.session.faces }}
    >
      <SessionBarView plan={data.session} words={merged} at={at} />
      {children}
    </SpeechBubble>
  );
}
