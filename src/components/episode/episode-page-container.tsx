import { ContextDrawer } from '@/components/context-drawer/context-drawer.client';
import { contextEntries } from '@/components/context-drawer/context-entries';
import { contextLabels, type ContextLabels } from '@/components/context-drawer/context-labels';
import { TableOfContents, type TocLabels } from '@/components/table-of-contents/table-of-contents.client';
import { sectionAnchor, slideAnchor } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { episodeRoute } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { contextSlidesOf, tocSectionsOf, type Episode, type EpisodeSection } from './episode-page-container.pure';
import { SLIDE_DIVIDER } from './slide-master';
import { TitleSlide } from './title-slide';

function SlideAnchor({ anchor, children }: { anchor: string; children: ReactNode }) {
  return (
    <div id={anchor} data-slide={anchor} className={cn('scroll-mt-24', SLIDE_DIVIDER)}>
      {children}
    </div>
  );
}

function SectionSlides({ section }: { section: EpisodeSection }) {
  return (
    <section data-section={section.slug} className="flex flex-col">
      <SlideAnchor anchor={sectionAnchor(section.slug)}>{section.content}</SlideAnchor>
      {section.slides.map((slide) => (
        <SlideAnchor key={slide.slug} anchor={slideAnchor(section.slug, slide.slug)}>
          {slide.content}
        </SlideAnchor>
      ))}
    </section>
  );
}

/** Only what the client drawer reads, so nothing unserializable (`labels.sources` is a function) crosses the boundary. */
function drawerLabels(labels: ContextLabels) {
  const { title, open, close, shortcut, slide, tabs, menu } = labels;
  return { title, open, close, shortcut, slide, tabs, menu };
}

/** The Context drawer's slot: every Slide's notes and script, pre-rendered (FE-010). */
function ContextSlot({ labels, sections }: { labels: ContextLabels; sections: readonly EpisodeSection[] }) {
  return (
    <aside data-slot="context" aria-label={labels.title}>
      <ContextDrawer
        labels={drawerLabels(labels)}
        entries={contextEntries(contextSlidesOf(sections), labels)}
        targetAttribute="data-slide"
      />
    </aside>
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
 * reads the same anchors so the two cannot drift.
 */
export async function EpisodePageContainer({ locale, episode }: { locale: Locale; episode: Episode }) {
  const { title, caption, sections } = await episode.content(locale);
  const toc = tocSectionsOf(sections, locale);
  const labels = await contextLabels(locale);
  return (
    <div data-slot="episode-page" className="mx-4 mt-6 md:grid md:grid-cols-[17rem_minmax(0,1fr)_auto]">
      <aside data-slot="toc">
        <TableOfContents
          locale={locale}
          route={episodeRoute(episode.slug)}
          sections={toc}
          targetAttribute="data-slide"
          labels={await tocLabels(locale)}
        />
      </aside>
      <main data-slot="slides" data-testid="episode-page" className="flex min-w-0 flex-col pb-24 md:ml-12">
        <TitleSlide title={title} caption={caption} />
        {sections.map((section) => (
          <SectionSlides key={section.slug} section={section} />
        ))}
      </main>
      <ContextSlot labels={labels} sections={sections} />
    </div>
  );
}
