import { episodeAnchors, sectionAnchor, slideAnchor, type EpisodeOutline } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactNode } from 'react';
import { EpisodeSitenav } from './episode-sitenav';

export interface TowerSlide {
  slug: string;
  /** Plain text for the sitenav; the slide renders its own heading. */
  title: string;
  content: ReactNode;
}

export interface TowerSection extends TowerSlide {
  /** Page slides after the Section's own slide; may be empty. */
  slides: readonly TowerSlide[];
}

function outlineOf(sections: readonly TowerSection[]): EpisodeOutline {
  return sections.map(({ slug, slides }) => ({ slug, slides: slides.map((slide) => slide.slug) }));
}

function SlideAnchor({ anchor, children }: { anchor: string; children: ReactNode }) {
  return (
    <div id={anchor} data-slide={anchor} className="scroll-mt-24">
      {children}
    </div>
  );
}

function SectionSlides({ section }: { section: TowerSection }) {
  return (
    <section data-section={section.slug} className="flex flex-col gap-6">
      <SlideAnchor anchor={sectionAnchor(section.slug)}>{section.content}</SlideAnchor>
      {section.slides.map((slide) => (
        <SlideAnchor key={slide.slug} anchor={slideAnchor(section.slug, slide.slug)}>
          {slide.content}
        </SlideAnchor>
      ))}
    </section>
  );
}

/**
 * The Episode tower page: sticky sitenav left, slides stacked right. Every
 * Section renders uniformly — its own slide, then its page slides — so a
 * Section without page slides needs no special case.
 */
export function EpisodeTower(props: {
  locale: Locale;
  route: string;
  title: string;
  navLabel: string;
  sections: readonly TowerSection[];
}) {
  episodeAnchors(outlineOf(props.sections));
  return (
    <div className="mx-4 mt-6 grid gap-8 md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden md:block">
        <div className="sticky top-24 max-h-[calc(100svh-7rem)] overflow-y-auto">
          <EpisodeSitenav {...props} />
        </div>
      </aside>
      <main data-testid="episode-page" className="flex min-w-0 flex-col gap-6 pb-24">
        <h1 data-testid="page-title" className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {props.title}
        </h1>
        {props.sections.map((section) => (
          <SectionSlides key={section.slug} section={section} />
        ))}
      </main>
    </div>
  );
}
