import { SpeechBubble } from '@/explorables/context-window/speech-bubble/speech-bubble';
import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import type { ReactNode } from 'react';
import { ContextBars, type BarsLayout } from './context-bars-view';
import { contextData, type ContextLocale, type ContextPresetId, type MiniPresetId } from './context-data';
import type { ContextViewData } from './context-view';
import type { ContextWords } from './context-words.types';
import { ContextClient } from './context.client';
import { SessionBarView } from './session-bar-view';

const localeOf = (locale: string): ContextLocale => (locale === 'de' ? 'de' : 'en');

interface Props<Id> {
  readonly preset: Id;
  readonly locale: string;
  readonly words?: Partial<ContextWords>;
}

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

export function Context(props: Props<ContextPresetId>) {
  return (
    <>
      <ContextClient {...contextViewData(props)} />
      <ExploreItLink slug="context-window" />
    </>
  );
}

export function ContextBarsPreset({ preset: id, locale, words, ...layout }: Props<MiniPresetId> & BarsLayout) {
  const data = contextData(localeOf(locale));
  const mini = data.minis[id];
  if (!mini) throw new Error(`context bars: unknown Preset "${id}"`);
  return (
    <ContextBars
      mini={mini}
      chats={data.chats}
      words={{ ...data.words, ...words }}
      locale={localeOf(locale)}
      {...layout}
    />
  );
}

export function SessionBarPreset({ at, locale, words }: Omit<Props<never>, 'preset'> & { readonly at: string | null }) {
  const data = contextData(localeOf(locale));
  return <SessionBarView plan={data.session} words={{ ...data.words, ...words }} at={at} />;
}

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
