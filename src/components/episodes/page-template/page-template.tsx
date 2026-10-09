import { BasicPageSlide } from '@/components/episode/basic-page-slide';
import type {
  Episode,
  EpisodeSection,
  EpisodeSlide,
  PerLocale,
} from '@/components/episode/episode-page-container.pure';
import { SectionSlide } from '@/components/episode/section-slide';
import { slideContext, type ReadString, type SlideContextSpec } from '@/components/episode/slide-context.pure';
import { ThreeColumnSlide } from '@/components/episode/three-column-slide';
import { slideAnchor } from '@/lib/episode.pure';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/*
 * The reference Episode (FE-002): three Sections holding 2, 0 and 2 page
 * Slides. Structure is the typed record; each Slide's content is free JSX,
 * one function per Slide, and every leaf string is a Translation key under
 * `episodes.page-template` (see docs/agents/episode-translation-keys.md).
 */
type SectionsT = Awaited<ReturnType<typeof getTranslations<'episodes.page-template.sections'>>>;

/** The one Slide with notes: shows the pattern and exercises the empty state on the rest. */
const WHY_CONTEXT: SlideContextSpec = {
  notes: [{ slug: 'reference-episode', target: 'prose' }],
  segments: [{ slug: 'one-breath', from: 0, to: 1 }],
};

function whyATemplate(t: SectionsT): EpisodeSlide {
  const title = t('foundations.slides.why-a-template.title');
  const { notes, voiceScript } = slideContext(t as ReadString, 'foundations.slides.why-a-template', WHY_CONTEXT);
  return {
    slug: 'why-a-template',
    title,
    minutes: { en: 3, de: 4 },
    notes,
    voiceScript,
    content: (
      <BasicPageSlide
        anchor={slideAnchor('foundations', 'why-a-template')}
        title={title}
        caption={t('foundations.slides.why-a-template.caption')}
        prose={t('foundations.slides.why-a-template.prose')}
      />
    ),
  };
}

function threeLayers(t: SectionsT): EpisodeSlide {
  const title = t('foundations.slides.three-layers.title');
  const column = (slug: 'master' | 'layouts' | 'catalog') => ({
    slug,
    title: t(`foundations.slides.three-layers.columns.${slug}.title`),
    prose: t(`foundations.slides.three-layers.columns.${slug}.prose`),
  });
  return {
    slug: 'three-layers',
    title,
    minutes: { en: 4, de: 5 },
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('foundations.slides.three-layers.caption')}
        columns={[column('master'), column('layouts'), column('catalog')]}
      />
    ),
  };
}

function buildingBlocks(t: SectionsT): EpisodeSlide {
  const title = t('next-steps.slides.building-blocks.title');
  const column = (slug: 'section' | 'basic' | 'three-column') => ({
    slug,
    title: t(`next-steps.slides.building-blocks.columns.${slug}.title`),
    prose: t(`next-steps.slides.building-blocks.columns.${slug}.prose`),
  });
  return {
    slug: 'building-blocks',
    title,
    minutes: { en: 5, de: 6 },
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('next-steps.slides.building-blocks.caption')}
        columns={[column('section'), column('basic'), column('three-column')]}
      />
    ),
  };
}

function whatComesNext(t: SectionsT): EpisodeSlide {
  const title = t('next-steps.slides.what-comes-next.title');
  return {
    slug: 'what-comes-next',
    title,
    minutes: { en: 2, de: 2 },
    content: (
      <BasicPageSlide
        title={title}
        caption={t('next-steps.slides.what-comes-next.caption')}
        prose={t('next-steps.slides.what-comes-next.prose')}
      />
    ),
  };
}

type SectionSlug = 'foundations' | 'interlude' | 'next-steps';

const SECTION_MINUTES: PerLocale<number> = { en: 1, de: 1 };

function sections(t: SectionsT): EpisodeSection[] {
  const nextSteps = [buildingBlocks(t), whatComesNext(t)];
  const sectionOf = (slug: SectionSlug, caption: string, slides: EpisodeSlide[]): EpisodeSection => {
    const title = t(`${slug}.title`);
    return { slug, title, minutes: SECTION_MINUTES, content: <SectionSlide title={title} caption={caption} />, slides };
  };
  return [
    sectionOf('foundations', t('foundations.caption'), [whyATemplate(t), threeLayers(t)]),
    sectionOf('interlude', t('interlude.caption'), []),
    sectionOf('next-steps', t('next-steps.caption', { count: nextSteps.length }), nextSteps),
  ];
}

export const pageTemplate = {
  slug: 'page-template',
  async content(locale: Locale) {
    const t = await getTranslations({ locale, namespace: 'episodes.page-template' });
    const sectionsT = await getTranslations({ locale, namespace: 'episodes.page-template.sections' });
    return { title: t('title'), caption: t('caption'), sections: sections(sectionsT) };
  },
} satisfies Episode;
