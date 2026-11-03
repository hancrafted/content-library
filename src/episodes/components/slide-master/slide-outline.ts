import type { PlacedListSlide } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { ownTranslator, slideTextOf, type LocalizedSlide } from './localized-slide';
import type { Slide } from './slide';
import { requireTitle } from './slide-header-text';

/** Navigation metadata only: no Scene or header action is rendered. */
export type LocalizedSlideOutline = Pick<LocalizedSlide, 'id' | 'minutes'> &
  ({ readonly level: 'h2'; readonly title: string } | { readonly level: 'h3'; readonly title?: string });

export function localizeSlideOutline(
  { id, slide, level, standsInFor }: PlacedListSlide<Slide>,
  locale: Locale,
): LocalizedSlideOutline {
  const { title, minutes } = slideTextOf(slide, ownTranslator(slide.messages[locale], locale), locale);
  if (level === 'h3') return { id, level, minutes, ...(title !== undefined && { title }) };
  const namer = standsInFor ?? slide;
  const section = slideTextOf(namer, ownTranslator(namer.messages[locale], locale), locale).title;
  return { id, level, minutes, title: requireTitle(namer.slug, section) };
}
