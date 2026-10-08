import { BasicPageSlide } from '@/components/episode/basic-page-slide';
import { EpisodeTower, type TowerSection, type TowerSlide } from '@/components/episode/episode-tower';
import { SectionSlide } from '@/components/episode/section-slide';
import { ThreeColumnSlide } from '@/components/episode/three-column-slide';
import type { Locale } from '@/lib/locale.pure';
import { ROUTES } from '@/lib/routes';
import { getTranslations } from 'next-intl/server';

/*
 * The reference Episode: three Sections holding 2, 0 and 2 page slides. Markup
 * is free JSX, one function per slide; every leaf string is a catalog key under
 * `episodes.page-template.sections` (see docs/agents/episode-catalog-keys.md).
 */
type SectionsT = Awaited<ReturnType<typeof getTranslations<'episodes.page-template.sections'>>>;

function whyATemplate(t: SectionsT): TowerSlide {
  const title = t('foundations.slides.why-a-template.title');
  return {
    slug: 'why-a-template',
    title,
    content: (
      <BasicPageSlide
        title={title}
        caption={t('foundations.slides.why-a-template.caption')}
        prose={t('foundations.slides.why-a-template.prose')}
      />
    ),
  };
}

function threeLayers(t: SectionsT): TowerSlide {
  const title = t('foundations.slides.three-layers.title');
  const column = (slug: 'master' | 'variants' | 'catalog') => ({
    slug,
    title: t(`foundations.slides.three-layers.columns.${slug}.title`),
    prose: t(`foundations.slides.three-layers.columns.${slug}.prose`),
  });
  return {
    slug: 'three-layers',
    title,
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('foundations.slides.three-layers.caption')}
        columns={[column('master'), column('variants'), column('catalog')]}
      />
    ),
  };
}

function buildingBlocks(t: SectionsT): TowerSlide {
  const title = t('next-steps.slides.building-blocks.title');
  const column = (slug: 'section' | 'basic' | 'three-column') => ({
    slug,
    title: t(`next-steps.slides.building-blocks.columns.${slug}.title`),
    prose: t(`next-steps.slides.building-blocks.columns.${slug}.prose`),
  });
  return {
    slug: 'building-blocks',
    title,
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('next-steps.slides.building-blocks.caption')}
        columns={[column('section'), column('basic'), column('three-column')]}
      />
    ),
  };
}

function whatComesNext(t: SectionsT): TowerSlide {
  const title = t('next-steps.slides.what-comes-next.title');
  return {
    slug: 'what-comes-next',
    title,
    content: (
      <BasicPageSlide
        title={title}
        caption={t('next-steps.slides.what-comes-next.caption')}
        prose={t('next-steps.slides.what-comes-next.prose')}
      />
    ),
  };
}

function sections(t: SectionsT): TowerSection[] {
  const nextSteps = [buildingBlocks(t), whatComesNext(t)];
  const sectionOf = (slug: 'foundations' | 'interlude' | 'next-steps', caption: string, slides: TowerSlide[]) => {
    const title = t(`${slug}.title`);
    return { slug, title, content: <SectionSlide title={title} caption={caption} />, slides };
  };
  return [
    sectionOf('foundations', t('foundations.caption'), [whyATemplate(t), threeLayers(t)]),
    sectionOf('interlude', t('interlude.caption'), []),
    sectionOf('next-steps', t('next-steps.caption', { count: nextSteps.length }), nextSteps),
  ];
}

export async function EpisodeTemplatePage({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'episodes.page-template' });
  const nav = await getTranslations({ locale, namespace: 'episodeNav' });
  const sectionsT = await getTranslations({ locale, namespace: 'episodes.page-template.sections' });
  return (
    <EpisodeTower
      locale={locale}
      route={ROUTES.episodeTemplate}
      title={t('title')}
      labels={{
        sitenav: { nav: nav('label'), progress: nav('progress'), open: nav('open'), close: nav('close') },
        preview: { label: nav('preview.label'), rail: nav('preview.rail'), index: nav('preview.index') },
      }}
      sections={sections(sectionsT)}
    />
  );
}
