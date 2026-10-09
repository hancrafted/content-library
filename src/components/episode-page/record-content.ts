import type { AnyEpisodeRecord, RuntimeTranslator, Slide } from '@/components/slide-master/episode-record';
import { slideKit } from '@/components/slide-master/slide-kit';
import { placeSections, type PlacedListSlide, type PlacedSlide } from '@/lib/episode.pure';
import type { EpisodeContent, EpisodeSlide, PlacedEpisodeSection } from './episode-page-container.pure';
import { slideContext } from './slide-context.pure';

/*
 * Turns an Episode record into what one locale of its page renders, the same
 * placed `EpisodeContent` the table of contents, the Context drawer and the
 * Slide wrappers read, each Slide under the id its position gives it. The one place a
 * Translation key is built at runtime: each Slide's namespace,
 * `episodes.<ep>.slides.<slide>`, which the record's types already tied to the
 * Translation file.
 */

/** One locale's translator for a namespace, read by runtime key: next-intl in the page, a stand-in in tests. */
export type TranslatorOf = (namespace: string) => Promise<RuntimeTranslator>;

/** One placed Slide, rendered: its Canvas from the kit, its notes and Voice script from its own subtree. */
async function renderedSlide(
  translatorOf: TranslatorOf,
  refLabel: string,
  { id, slide, level }: PlacedListSlide<Slide>,
): Promise<PlacedSlide<EpisodeSlide>> {
  const t = await translatorOf(`episodes.${slide.episode}.slides.${slide.slug}`);
  const notes = slide.notes.map((note) => note.slug);
  const content = slide.content(slideKit({ t, level, notes, refLabel, slideId: id }));
  const { notes: noteItems, voiceScript } = slideContext(t, slide);
  return {
    id,
    slide: {
      slug: slide.slug,
      ...(t.has('title') && { title: t('title') }),
      ...(slide.minutes && { minutes: slide.minutes }),
      content,
      notes: noteItems,
      voiceScript,
    },
  };
}

/** A Section: its first Slide, which names it, holding the rest. */
function sectionOf([head, ...pages]: readonly PlacedSlide<EpisodeSlide>[]): PlacedEpisodeSection {
  const { title } = head.slide;
  if (title === undefined) throw new Error(`Section "${head.slide.slug}" opens with a Slide that has no title.`);
  return { id: head.id, slide: { ...head.slide, title, slides: pages.map(({ slide }) => slide) }, slides: pages };
}

/** One locale of an Episode record, read through `translatorOf`: the Title slide's text and every Section, walked once (`placeSections`). */
export async function recordContent(record: AnyEpisodeRecord, translatorOf: TranslatorOf): Promise<EpisodeContent> {
  const placed = placeSections<Slide>(record.sections);
  const t = await translatorOf('episodes');
  const refLabel = (await translatorOf('contextDrawer'))('refNote');
  const sections = await Promise.all(
    placed.map(async (section) =>
      sectionOf(await Promise.all(section.map((s) => renderedSlide(translatorOf, refLabel, s)))),
    ),
  );
  return { title: t(`${record.slug}.title`), caption: t(`${record.slug}.caption`), sections };
}
