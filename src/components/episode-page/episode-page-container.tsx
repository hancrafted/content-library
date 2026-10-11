import { ContextDrawerSlot } from '@/components/context-drawer/context-drawer-slot';
import { DevSlideReporter } from '@/components/design-system-token-editor/dev-slide-reporter';
import type { LocalizedSlide } from '@/components/slide-master/localized-slide';
import type { EpisodeRecord } from '@/components/slide-master/slide';
import type { RuntimeTranslator } from '@/components/slide-master/slide-base';
import { TableOfContents, type TocLabels } from '@/components/table-of-contents/table-of-contents.client';
import { readTranslationStrings } from '@/i18n/translation-strings';
import { TITLE_ANCHOR } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { episodeRoute, type EpisodeSlug } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import { ContentArea } from './content-area';
import { contextDrawerInput } from './context-drawer-input';
import { INSET_CLASSES, TOC_RESERVE_CLASS, tocSectionsOf } from './episode-page-container.pure';
import { recordContent, type TranslatorOf } from './record-content';
import { SlideKeys } from './slide-keys.client';
import { SlideObserver } from './slide-observer.client';
import { SlideWrapper } from './slide-wrapper';
import { SlideZones } from './slide-zones.client';
import { TalkPlayer, type TalkPlayerLabels } from './talk-player.client';
import { TitleSlide } from './title-slide';
import { UrlStateProvider } from './url-state-provider.client';

/** The Slides grouped by the Section the walk placed each in, in page order. */
function bySection(slides: readonly LocalizedSlide[]): (readonly LocalizedSlide[])[] {
  const groups: LocalizedSlide[][] = [];
  for (const slide of slides) {
    const last = groups.at(-1);
    if (last?.[0].section === slide.section) last.push(slide);
    else groups.push([slide]);
  }
  return groups;
}

function SectionSlides({ slides }: { slides: readonly LocalizedSlide[] }) {
  return (
    <section data-section={slides[0].section} className="contents">
      {slides.map(({ id, slug, content }) => (
        <SlideWrapper key={slug} id={id}>
          {content}
        </SlideWrapper>
      ))}
    </section>
  );
}

function SlideColumn(props: {
  ids: readonly string[];
  title: string;
  caption?: string;
  slides: readonly LocalizedSlide[];
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
        {bySection(props.slides).map((section) => (
          <SectionSlides key={section[0].id} slides={section} />
        ))}
      </ContentArea>
    </SlideZones>
  );
}

function EpisodeToc(props: {
  locale: Locale;
  slug: EpisodeSlug;
  slides: readonly LocalizedSlide[];
  minutes: number;
  labels: TocLabels;
}) {
  return (
    <aside data-slot="toc" className="md:fixed md:top-24 md:left-4 md:z-40 md:w-[17rem]">
      <TableOfContents
        locale={props.locale}
        route={episodeRoute(props.slug)}
        sections={tocSectionsOf(props.slides)}
        total={props.minutes}
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

/**
 * The shell every Episode page renders through (FE-002). It alone turns the
 * Episode record into the page: the named slots, the Title slide with the
 * `h1`, each Section's wrapper and anchors, the table of contents and the
 * Context drawer. It walks the Episode once (`placeSections`) and every one of them
 * reads that list, so no id is derived twice and none can drift. It also
 * provides the page's one URL-state service (FE-001 §2).
 */
export async function EpisodePageContainer({ locale, episode }: { locale: Locale; episode: EpisodeRecord }) {
  const { title, caption, minutes, slides } = await recordContent(episode, locale, translatorOf(locale));
  const ids = [TITLE_ANCHOR, ...slides.map(({ id }) => id)];
  const youtubeId = episode.youtube?.[locale];
  const talkLabels = youtubeId ? await readTranslationStrings(locale, 'talkPlayer') : undefined;
  const tocLabels = await tocLabelsOf(locale);
  const drawer = await contextDrawerInput(locale, slides);
  return (
    <UrlStateProvider key={`${locale}/${episode.slug}`}>
      <div
        data-slot="episode-page"
        data-episode={episode.slug}
        className={cn('mt-6', INSET_CLASSES, TOC_RESERVE_CLASS)}
      >
        <EpisodeToc locale={locale} slug={episode.slug} slides={slides} minutes={minutes} labels={tocLabels} />
        <SlideColumn
          ids={ids}
          title={title}
          caption={caption}
          slides={slides}
          youtubeId={youtubeId}
          talkLabels={talkLabels}
        />
        <ContextDrawerSlot input={drawer} />
        {youtubeId && talkLabels && <TalkPlayer youtubeId={youtubeId} labels={talkLabels} />}
      </div>
      <DevSlideReporter />
    </UrlStateProvider>
  );
}
