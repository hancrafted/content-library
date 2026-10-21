import { ContextBars } from './context-bars-view';
import { barModel } from './context-bars.pure';
import { contextData, type ContextLocale, type ContextPresetId, type MiniPresetId } from './context-data';
import type { ContextViewData } from './context-view';
import type { ContextWords } from './context-words.types';
import { ContextClient } from './context.client';

/*
 * The context window cornerstone, a Shared visual. A Slide places it by Preset id and locale; the Preset, the chat and
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
  return <ContextClient {...contextViewData(props)} />;
}

/** The window's size and buffer a bars Preset is drawn on, and what its first bar's blocks hold, for a Slide's legend. */
export function contextBarFigures({ preset: id, locale }: Props<MiniPresetId>) {
  const data = contextData(localeOf(locale));
  const mini = data.minis[id];
  const bar = mini?.mini[0];
  if (!mini || !bar) throw new Error(`context bars: unknown Preset "${id}"`);
  const model = barModel(bar, bar.chat ? data.chats[bar.chat] : undefined, mini.window);
  return {
    windowTokens: mini.window.tokens,
    bufferTokens: mini.window.bufferTokens,
    usedTokens: model.used,
    byKey: model.byKey,
    bySimple: model.bySimple,
  };
}

/** Static bars drawn horizontally: chats or generic segments one under the other on one window size. */
export function ContextBarsPreset({ preset: id, locale, words }: Props<MiniPresetId>) {
  const data = contextData(localeOf(locale));
  const mini = data.minis[id];
  if (!mini) throw new Error(`context bars: unknown Preset "${id}"`);
  return <ContextBars mini={mini} chats={data.chats} words={{ ...data.words, ...words }} locale={localeOf(locale)} />;
}
