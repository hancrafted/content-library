import { ContextDrawerSlot } from '@/components/context-drawer/context-drawer-slot';
import type { AnyEpisodeRecord, RuntimeTranslator } from '@/components/slide-master/episode-record';
import { TableOfContents, type TocLabels } from '@/components/table-of-contents/table-of-contents.client';
import { readTranslationStrings } from '@/i18n/translation-strings';
import { slidesInPageOrder, TITLE_ANCHOR } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { episodeRoute, type EpisodeSlug } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { ContentArea } from './content-area';
import { contextDrawerInput } from './context-drawer-input';
import { tocSectionsOf, type PlacedEpisodeSection } from './episode-page-container.pure';
import { recordContent, type TranslatorOf } from './record-content';
import { SlideKeys } from './slide-keys.client';
import { SlideObserver } from './slide-observer.client';
import { SlideWrapper } from './slide-wrapper';
import { SlideZones } from './slide-zones.client';
import { TalkPlayer, type TalkPlayerLabels } from './talk-player.client';
import { TitleSlide } from './title-slide';
import { UrlStateProvider } from './url-state-provider.client';

function SectionSlides({ placed }: { placed: PlacedEpisodeSection }) {
  return (
    <section data-section={placed.slide.slug} className="contents">
      <SlideWrapper id={placed.id}>{placed.slide.content}</SlideWrapper>
      {placed.slides.map(({ id, slide }) => (
        <SlideWrapper key={slide.slug} id={id}>
          {slide.content}
        </SlideWrapper>
      ))}
    </section>
  );
}

function SlideColumn(props: {
  ids: readonly string[];
  title: string;
  caption?: string;
  placed: readonly PlacedEpisodeSection[];
  youtubeId?: string;
  talkLabels?: TalkPlayerLabels;
}) {
  return (
    <SlideZones>
      <SlideObserver ids={props.ids} />
      <SlideKeys ids={props.ids} />
      <ContentArea>
        <TitleSlide
          title={props.title}
          caption={props.caption}
          youtubeId={props.youtubeId}
          talkLabels={props.talkLabels}
        />
        {props.placed.map((section) => (
          <SectionSlides key={section.id} placed={section} />
        ))}
      </ContentArea>
    </SlideZones>
  );
}

function EpisodeToc(props: {
  locale: Locale;
  slug: EpisodeSlug;
  placed: readonly PlacedEpisodeSection[];
  labels: TocLabels;
}) {
  return (
    <aside data-slot="toc" className="md:fixed md:top-24 md:left-4 md:z-40 md:w-[17rem]">
      <TableOfContents
        locale={props.locale}
        route={episodeRoute(props.slug)}
        sections={tocSectionsOf(props.placed)}
        targetAttribute="data-slide"
        topId={TITLE_ANCHOR}
        labels={props.labels}
      />
    </aside>
  );
}

/** next-intl's translator for one locale, read by runtime key: the one cast from typed keys. */
/** The table of contents' labels; `remaining` stays raw, `{count}` unfilled, for the client to fill as the reader scrolls. */
async function tocLabelsOf(locale: Locale): Promise<TocLabels> {
  const t = await getTranslations({ locale, namespace: 'tableOfContents' });
  const strings = await readTranslationStrings(locale, 'tableOfContents', ['remaining']);
  return {
    ...strings,
    remaining: { one: t.raw('remaining.one') as string, other: t.raw('remaining.other') as string },
  };
}

function translatorOf(locale: Locale): TranslatorOf {
  return async (namespace) =>
    (await getTranslations({ locale, namespace: namespace as never })) as unknown as RuntimeTranslator;
}

/*
 * The Foreground's insets (FE-009 §2), the only width mechanism: every Slide wrapper pads itself with these.
 * Below `md` a small even margin. From `md` the left inset clears the fixed table of contents (1rem + 17rem + 3rem)
 * and the right keeps 3rem; from `xl`, while the drawer sits beside and open, the drawer's own `data-drawer-beside`
 * widens the right inset past the card. The chrome floats, so only these variables move the Foreground.
 */
const INSETS = cn(
  'mt-6 [--inset-l:1rem] [--inset-r:1rem] md:[--inset-l:21rem] md:[--inset-r:3rem]',
  'xl:data-[drawer-beside=true]:[--inset-r:calc(var(--drawer-width)+4rem)]',
);

/**
 * The shell every Episode page renders through (FE-002). It alone turns the
 * Episode record into the page: the named slots, the Title slide with the
 * `h1`, each Section's wrapper and anchors, the table of contents and the
 * Context drawer. It walks the Episode once (`placeSections`) and every one of them
 * reads that list, so no id is derived twice and none can drift. It also
 * provides the page's one URL-state service (FE-001 §2).
 */
export async function EpisodePageContainer({ locale, episode }: { locale: Locale; episode: AnyEpisodeRecord }) {
  const { title, caption, sections: placed } = await recordContent(episode, locale, translatorOf(locale));
  const ids = [TITLE_ANCHOR, ...slidesInPageOrder(placed).map(({ id }) => id)];
  const youtubeId = episode.youtube?.[locale];
  const talkLabels = youtubeId ? await readTranslationStrings(locale, 'talkPlayer') : undefined;
  const tocLabels = await tocLabelsOf(locale);
  const drawer = await contextDrawerInput(locale, placed);
  return (
    <UrlStateProvider key={`${locale}/${episode.slug}`}>
      <div data-slot="episode-page" data-episode={episode.slug} className={INSETS}>
        <EpisodeToc locale={locale} slug={episode.slug} placed={placed} labels={tocLabels} />
        <SlideColumn
          ids={ids}
          title={title}
          caption={caption}
          placed={placed}
          youtubeId={youtubeId}
          talkLabels={talkLabels}
        />
        <ContextDrawerSlot input={drawer} />
        {youtubeId && talkLabels && <TalkPlayer youtubeId={youtubeId} labels={talkLabels} />}
      </div>
    </UrlStateProvider>
  );
}
