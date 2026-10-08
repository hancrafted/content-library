import type { SitenavLabels, SitenavSection, SitenavVariant } from '@/components/sitenav/sitenav';
import { episodeAnchors, sectionAnchor, slideAnchor, type EpisodeOutline } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import type { ReactNode } from 'react';
import { SitenavPreview } from './sitenav-preview';

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

/** The tower's own outline, as the page-agnostic sitenav reads it. */
function sitenavSections(sections: readonly TowerSection[]): SitenavSection[] {
  return sections.map((section) => ({
    id: sectionAnchor(section.slug),
    title: section.title,
    items: section.slides.map((slide) => ({ id: slideAnchor(section.slug, slide.slug), title: slide.title })),
  }));
}

export interface TowerLabels {
  sitenav: SitenavLabels;
  /** TEMPORARY: the Rail/Index design switch. */
  preview: Record<'label' | SitenavVariant, string>;
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
 * The Episode tower page: sticky sitenav left, slides stacked right. Every
 * Section renders uniformly — its own slide, then its page slides — so a
 * Section without page slides needs no special case.
 */
export function EpisodeTower(props: {
  locale: Locale;
  route: string;
  title: string;
  labels: TowerLabels;
  sections: readonly TowerSection[];
}) {
  episodeAnchors(outlineOf(props.sections));
  const { locale, route } = props;
  const sitenav = { locale, route, targetAttribute: 'data-slide', labels: props.labels.sitenav };
  return (
    <div className="mx-4 mt-6 md:grid md:grid-cols-[17rem_minmax(0,1fr)] md:gap-12">
      <aside>
        <SitenavPreview
          sitenav={{ ...sitenav, sections: sitenavSections(props.sections) }}
          labels={props.labels.preview}
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
