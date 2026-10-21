import { contextData, type ContextLocale, type ContextPresetId, type MiniPresetId } from './context-data';
import type { ContextViewData } from './context-view';
import type { ContextWords } from './context-words.types';
import { ContextClient } from './context.client';
import { MiniBars } from './window-mini';

/*
 * The context window cornerstone, a Shared visual. A Slide places it by Preset id and locale; the Preset, the chat and
 * the words come from context-preset.config.yml (or its German twin, picked by the locale) at build time, and a Slide
 * may override any word. The interactive part is the one client leaf; the mini bars are static.
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
  return <ContextClient {...contextViewData(props)} />;
}

/** A row of static mini bars: chats side by side on one window size. */
export function ContextMiniBars({ preset: id, locale, words }: Props<MiniPresetId>) {
  const data = contextData(localeOf(locale));
  const mini = data.minis[id];
  if (!mini) throw new Error(`context window: unknown mini Preset "${id}"`);
  return <MiniBars mini={mini} chats={data.chats} words={{ ...data.words, ...words }} locale={localeOf(locale)} />;
}
