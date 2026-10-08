import { ContextDrawerSlot } from '@/components/context-drawer/context-drawer-slot';
import { TableOfContents, type TocLabels } from '@/components/table-of-contents/table-of-contents.client';
import { episodeAnchors, sectionAnchor, slideAnchor, titleAnchor } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { getTranslations } from 'next-intl/server';
import { ContentArea } from './content-area';
import { contextDrawerInput } from './context-drawer-input';
import { tocSectionsOf, type Episode, type EpisodeSection } from './episode-page-container.pure';
import { SlideObserver } from './slide-observer.client';
import { SlideWrapper } from './slide-wrapper';
import { SlideZones } from './slide-zones.client';
import { TitleSlide } from './title-slide';
import { UrlStateProvider } from './url-state-provider.client';

function SectionSlides({ section }: { section: EpisodeSection }) {
  return (
    <section data-section={section.slug} className="contents">
      <SlideWrapper id={sectionAnchor(section.slug)}>{section.content}</SlideWrapper>
      {section.slides.map((slide) => (
        <SlideWrapper key={slide.slug} id={slideAnchor(section.slug, slide.slug)}>
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
  sections: readonly EpisodeSection[];
}) {
  return (
    <SlideZones>
      <SlideObserver ids={props.ids} />
      <ContentArea>
        <TitleSlide title={props.title} caption={props.caption} />
        {props.sections.map((section) => (
          <SectionSlides key={section.slug} section={section} />
        ))}
      </ContentArea>
    </SlideZones>
  );
}

async function tocLabels(locale: Locale): Promise<TocLabels> {
  const toc = await getTranslations({ locale, namespace: 'tableOfContents' });
  return {
    title: toc('title'),
    progress: toc('progress'),
    remaining: { one: toc('remaining.one'), other: toc('remaining.other') },
    toggle: toc('toggle'),
    open: toc('open'),
    close: toc('close'),
    loading: toc('loading'),
  };
}

/**
 * The shell every Episode page renders through (FE-002). It alone turns the
 * Episode record into the page: the named slots, the Title slide with the
 * `h1`, each Section's wrapper and anchors, and the table of contents, which
 * reads the same anchors so the two cannot drift. It also provides the page's
 * one URL-state service (FE-001 §2).
 */
export async function EpisodePageContainer({ locale, episode }: { locale: Locale; episode: Episode }) {
  const { title, caption, sections } = await episode.content(locale);
  const toc = tocSectionsOf(sections, locale);
  const ids = [
    titleAnchor(),
    ...episodeAnchors(sections.map(({ slug, slides }) => ({ slug, slides: slides.map((slide) => slide.slug) }))),
  ];
  return (
    <UrlStateProvider key={`${locale}/${episode.slug}`}>
      <div data-slot="episode-page" className="mx-4 mt-6 md:grid md:grid-cols-[17rem_minmax(0,1fr)_auto]">
        <aside data-slot="toc">
          <TableOfContents
            locale={locale}
            route={episodeRoute(episode.slug)}
            sections={toc}
            targetAttribute="data-slide"
            topId={titleAnchor()}
            labels={await tocLabels(locale)}
          />
        </aside>
        <SlideColumn ids={ids} title={title} caption={caption} sections={sections} />
        <ContextDrawerSlot input={await contextDrawerInput(locale, sections)} />
      </div>
    </UrlStateProvider>
  );
}
