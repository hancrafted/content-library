import {
  TableOfContents,
  type TocLabels,
  type TocSection,
} from '@/components/table-of-contents/table-of-contents.client';
import { episodeAnchors, sectionAnchor, slideAnchor, type EpisodeOutline } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactNode } from 'react';

export interface TowerSlide {
  slug: string;
  /** Plain text for the table of contents; the slide renders its own heading. */
  title: string;
  /** Reading time, in minutes. */
  minutes: number;
  content: ReactNode;
}

export interface TowerSection extends TowerSlide {
  /** Page slides after the Section's own slide; may be empty. */
  slides: readonly TowerSlide[];
}

function outlineOf(sections: readonly TowerSection[]): EpisodeOutline {
  return sections.map(({ slug, slides }) => ({ slug, slides: slides.map((slide) => slide.slug) }));
}

/** The tower's own outline, as the page-agnostic table of contents reads it. */
function tocSections(sections: readonly TowerSection[]): TocSection[] {
  return sections.map((section) => ({
    id: sectionAnchor(section.slug),
    title: section.title,
    minutes: section.minutes,
    items: section.slides.map((slide) => ({
      id: slideAnchor(section.slug, slide.slug),
      title: slide.title,
      minutes: slide.minutes,
    })),
  }));
}

function SlideAnchor({ anchor, children }: { anchor: string; children: ReactNode }) {
  return (
    <div id={anchor} data-slide={anchor} className="scroll-mt-24 border-b border-border/60">
      {children}
    </div>
  );
}

function SectionSlides({ section }: { section: TowerSection }) {
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

/**
 * The Episode tower page: sticky table of contents left, slides stacked right. Every
 * Section renders uniformly — its own slide, then its page slides — so a
 * Section without page slides needs no special case.
 */
export function EpisodeTower(props: {
  locale: Locale;
  route: string;
  title: string;
  labels: TocLabels;
  sections: readonly TowerSection[];
}) {
  episodeAnchors(outlineOf(props.sections));
  return (
    <div className="mx-4 mt-6 md:grid md:grid-cols-[17rem_minmax(0,1fr)] md:gap-12">
      <aside>
        <TableOfContents
          locale={props.locale}
          route={props.route}
          sections={tocSections(props.sections)}
          targetAttribute="data-slide"
          labels={props.labels}
        />
      </aside>
      <main data-testid="episode-page" className="flex min-w-0 flex-col pb-24">
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
