import { ownRouteOf } from '@/content-store/catalogue/record-routes';
import type { Video } from '@/content-store/store';
import type { LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import type { EpisodeComposition, HeaderMode, SlideEntrance } from '@/episodes/components/slide-master/slide';
import type { RuntimeTranslator } from '@/episodes/components/slide-master/slide-base';
import type { EyebrowText } from '@/episodes/components/slide-master/slide-eyebrow';
import type { SlideHeaderProps } from '@/episodes/components/slide-master/slide-header';
import type { ComposedPage } from '@/episodes/lib/registry';
import { DevSlideReporter } from '@/shared/components/design-system-token-editor/dev-slide-reporter';
import { readTranslationStrings } from '@/shared/i18n/translation-strings';
import type { Locale } from '@/shared/lib/locale.pure';
import type { TocSection } from '@/shared/lib/table-of-contents.pure';
import { TITLE_ANCHOR } from '@/shared/lib/title-anchor.pure';
import { cn } from '@/shared/lib/utils';
import { ContextDrawerSlot } from '@/shared/page-chrome/context-drawer/context-drawer-slot';
import { TableOfContents, type TocLabels } from '@/shared/page-chrome/table-of-contents/table-of-contents.client';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ContentArea } from './content-area';
import { contextDrawerInput } from './context-drawer-input';
import {
  eyebrowsOf,
  INSET_CLASSES,
  sourceFolderOf,
  TOC_RESERVE_CLASS,
  tocSectionsOf,
} from './episode-page-container.pure';
import { recordContent, type EpisodeContent, type TranslatorOf } from './record-content';
import { SlideKeys } from './slide-keys.client';
import { SlideObserver } from './slide-observer.client';
import { SlideWrapper } from './slide-wrapper';
import { SlideZones } from './slide-zones.client';
import { TalkPlayer, type RecordingLanguage, type TalkPlayerLabels } from './talk-player.client';
import { isTitleTarget, TitleSlide, type TitleSlideProps } from './title-slide';
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

/** How every Slide's header renders: who renders it, how it enters, and each page Slide's Eyebrow. */
interface PageHeader {
  readonly mode: HeaderMode;
  readonly entrance: SlideEntrance;
  readonly eyebrows: ReadonlyMap<string, EyebrowText>;
}

/** The Slide header the wrapper renders for one Slide, when the Episode is on the shared header and the Slide is titled. */
function headerOf(slide: LocalizedSlide, page: PageHeader): SlideHeaderProps | undefined {
  if (page.mode === 'authored' || slide.header === undefined) return undefined;
  const eyebrow = page.eyebrows.get(slide.id);
  return { seed: slide.id, level: slide.level, ...slide.header, ...(eyebrow && { eyebrow }), entrance: page.entrance };
}

function SectionSlides({ slides, page }: { slides: readonly LocalizedSlide[]; page: PageHeader }) {
  return (
    <section data-section={slides[0].section} className="contents">
      {slides.map((slide) => (
        <SlideWrapper
          key={slide.slug}
          id={slide.id}
          size={slide.level === 'h2' ? 'section' : 'page'}
          mode={page.mode}
          header={headerOf(slide, page)}
        >
          {slide.content}
        </SlideWrapper>
      ))}
    </section>
  );
}

function SlideColumn(props: { titleSlide: TitleSlideProps; slides: readonly LocalizedSlide[]; page: PageHeader }) {
  const ids = [TITLE_ANCHOR, ...props.slides.map(({ id }) => id)];
  return (
    <SlideZones>
      <SlideObserver ids={ids} />
      <SlideKeys ids={ids} />
      <ContentArea>
        <TitleSlide {...props.titleSlide} />
        {bySection(props.slides).map((section) => (
          <SectionSlides key={section[0].id} slides={section} page={props.page} />
        ))}
      </ContentArea>
    </SlideZones>
  );
}

/** The Title slide's props: the Episode's text, its hero Scene and entrance, its recording, and what its notes target. */
function titleSlideOf(
  content: EpisodeContent,
  page: PageHeader,
  talk: Pick<TitleSlideProps, 'youtubeId' | 'talkLabels' | 'recording' | 'position'>,
): TitleSlideProps {
  return {
    title: content.title,
    caption: content.caption,
    mode: page.mode,
    entrance: page.entrance,
    hero: content.hero,
    ...talk,
    targets: content.titleContext.notes.map(({ target }) => target).filter(isTitleTarget),
  };
}

function EpisodeToc(props: {
  locale: Locale;
  route: string;
  sections: readonly TocSection[];
  minutes: number;
  labels: TocLabels;
}) {
  return (
    <aside
      data-slot="toc"
      className="motion-reduce:transition-none md:fixed md:top-24 md:left-4 md:z-40 md:w-[17rem] md:transition-[width] md:duration-300 md:ease-out md:data-[toc-collapsed=true]:w-[3.5rem]"
    >
      <TableOfContents
        locale={props.locale}
        route={props.route}
        sections={props.sections}
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

/** Each page Slide's Eyebrow on the shared header, its counter read "Page n of N" in the page's language. */
async function eyebrowsFor(locale: Locale, mode: HeaderMode, sections: readonly TocSection[]) {
  if (mode !== 'shared') return new Map<string, EyebrowText>();
  const t = await getTranslations({ locale, namespace: 'slideHeader' });
  return eyebrowsOf(sections, (position, count) => t('pageOf', { position, count }));
}

/** What an Event adds around an Episode it presents: its header above the Title slide, its Playlist walk after the last Slide. */
export interface EpisodeFrame {
  /** The logical path the page is served at under the Event; the contents and Slide links point there. */
  readonly route: string;
  readonly header: ReactNode;
  readonly footer: ReactNode;
  /** The Episode's place in the Playlist, "Episode 2 of 3", under the title. */
  readonly position: string;
}

/** How the page's Slide headers render: the Episode's header mode and entrance, and each page Slide's Eyebrow. */
async function pageHeaderOf(
  content: EpisodeContent,
  locale: Locale,
  sections: readonly TocSection[],
): Promise<PageHeader> {
  return {
    mode: content.header,
    entrance: content.entrance,
    eyebrows: await eyebrowsFor(locale, content.header, sections),
  };
}

/** The talk player's labels and, for an Event recording, its language named in the page's language; none without a Video. */
async function talkOf(
  locale: Locale,
  video: Video | undefined,
): Promise<{ talkLabels?: TalkPlayerLabels; recording?: RecordingLanguage }> {
  if (video === undefined) return {};
  const talkLabels = await readTranslationStrings(locale, 'talkPlayer', ['recordedIn']);
  if (video.recordedIn === undefined) return { talkLabels };
  const t = await getTranslations({ locale, namespace: 'talkPlayer' });
  return { talkLabels, recording: { language: video.recordedIn, label: t(`recordedIn.${video.recordedIn}`) } };
}

/** The Episode at its own URL: no Event frame around it. */
const OWN_PAGE: Partial<EpisodeFrame> = {};

interface EpisodePageContainerProps {
  locale: Locale;
  /**
   * The Episode the page presents, as the store served its ref, or the Template it is: its id is what
   * `data-episode` names, and its folder the source folder the token editor names.
   */
  page: ComposedPage;
  episode: EpisodeComposition;
  /** The Episode's Video in this locale, from the content store; none for a Template or before upload. */
  video?: Video;
  /** Present when an Event presents the Episode at its own URL; absent on `/episodes/<slug>/`. */
  frame?: Partial<EpisodeFrame>;
}

/**
 * The shell every Episode page renders through (FE-002). It alone turns the
 * Episode record into the page: the named slots, the Title slide with the
 * `h1`, each Section's wrapper and anchors, the table of contents and the
 * Context drawer. It walks the Episode once (`placeSections`) and every one of them
 * reads that list, so no id is derived twice and none can drift. It also
 * provides the page's one URL-state service (FE-001 §2). Under an Event, the
 * frame's header and Playlist walk sit around the Content area, and the
 * contents and Slide links point at the Event's URL for the Episode.
 */
export async function EpisodePageContainer(props: EpisodePageContainerProps) {
  const { locale, page, episode, video, frame = OWN_PAGE } = props;
  const { id } = page;
  const youtubeId = video?.id;
  const route = frame.route ?? ownRouteOf(id);
  const content = await recordContent(episode, locale, { translatorOf: translatorOf(locale), id, route });
  const { minutes, slides, titleContext } = content;
  const sections = tocSectionsOf(slides);
  const header = await pageHeaderOf(content, locale, sections);
  const { talkLabels, recording } = await talkOf(locale, video);
  const titleSlide = titleSlideOf(content, header, { youtubeId, talkLabels, recording, position: frame.position });
  const tocLabels = await tocLabelsOf(locale);
  const drawer = await contextDrawerInput(locale, slides, titleContext);
  return (
    <UrlStateProvider key={`${locale}/${id}`}>
      <div data-slot="episode-page" data-episode={id} className={cn('mt-6', INSET_CLASSES, TOC_RESERVE_CLASS)}>
        <EpisodeToc locale={locale} route={route} sections={sections} minutes={minutes} labels={tocLabels} />
        {frame.header}
        <SlideColumn titleSlide={titleSlide} slides={slides} page={header} />
        {frame.footer}
        <ContextDrawerSlot input={drawer} />
        {youtubeId && talkLabels && <TalkPlayer youtubeId={youtubeId} title={content.title} labels={talkLabels} />}
      </div>
      <DevSlideReporter folder={sourceFolderOf(page)} />
    </UrlStateProvider>
  );
}
