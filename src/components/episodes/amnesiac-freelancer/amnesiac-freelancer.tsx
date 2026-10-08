import { BasicPageSlide } from '@/components/episode/basic-page-slide';
import type {
  Episode,
  EpisodeSection,
  EpisodeSlide,
  PerLocale,
} from '@/components/episode/episode-page-container.pure';
import { SectionSlide } from '@/components/episode/section-slide';
import { ThreeColumnSlide } from '@/components/episode/three-column-slide';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

/*
 * The dogfood Episode: "Treat AI like an amnesiac freelancer you have to
 * onboard". Three Sections holding 2, 3 and 2 page Slides, modelled on the
 * reference Episode (page-template). Every claim traces to
 * docs/research/ai-amnesia-mechanics.md and ai-onboarding-freelancer.md;
 * "amnesiac" is our metaphor, not a vendor term. Keys live under
 * `episodes.amnesiac-freelancer` (docs/agents/episode-catalog-keys.md).
 */
type SectionsT = Awaited<ReturnType<typeof getTranslations<'episodes.amnesiac-freelancer.sections'>>>;

function blankEveryTime(t: SectionsT): EpisodeSlide {
  const title = t('blank-slate.slides.blank-every-time.title');
  return {
    slug: 'blank-every-time',
    title,
    minutes: { en: 3, de: 4 },
    content: (
      <BasicPageSlide
        title={title}
        caption={t('blank-slate.slides.blank-every-time.caption')}
        prose={t('blank-slate.slides.blank-every-time.prose')}
      />
    ),
  };
}

function whereKnowledgeLives(t: SectionsT): EpisodeSlide {
  const title = t('blank-slate.slides.where-knowledge-lives.title');
  const column = (slug: 'training' | 'session' | 'files') => ({
    slug,
    title: t(`blank-slate.slides.where-knowledge-lives.columns.${slug}.title`),
    prose: t(`blank-slate.slides.where-knowledge-lives.columns.${slug}.prose`),
  });
  return {
    slug: 'where-knowledge-lives',
    title,
    minutes: { en: 4, de: 5 },
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('blank-slate.slides.where-knowledge-lives.caption')}
        columns={[column('training'), column('session'), column('files')]}
      />
    ),
  };
}

function briefAndRules(t: SectionsT): EpisodeSlide {
  const title = t('onboarding.slides.brief-and-rules.title');
  const column = (slug: 'brief' | 'house-rules' | 'definition-of-done') => ({
    slug,
    title: t(`onboarding.slides.brief-and-rules.columns.${slug}.title`),
    prose: t(`onboarding.slides.brief-and-rules.columns.${slug}.prose`),
  });
  return {
    slug: 'brief-and-rules',
    title,
    minutes: { en: 4, de: 5 },
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('onboarding.slides.brief-and-rules.caption')}
        columns={[column('brief'), column('house-rules'), column('definition-of-done')]}
      />
    ),
  };
}

function keepItShort(t: SectionsT): EpisodeSlide {
  const title = t('onboarding.slides.keep-it-short.title');
  return {
    slug: 'keep-it-short',
    title,
    minutes: { en: 3, de: 3 },
    content: (
      <BasicPageSlide
        title={title}
        caption={t('onboarding.slides.keep-it-short.caption')}
        prose={t('onboarding.slides.keep-it-short.prose')}
      />
    ),
  };
}

function decisionsInWriting(t: SectionsT): EpisodeSlide {
  const title = t('onboarding.slides.decisions-in-writing.title');
  return {
    slug: 'decisions-in-writing',
    title,
    minutes: { en: 3, de: 4 },
    content: (
      <BasicPageSlide
        title={title}
        caption={t('onboarding.slides.decisions-in-writing.caption')}
        prose={t('onboarding.slides.decisions-in-writing.prose')}
      />
    ),
  };
}

function metaphorBreaks(t: SectionsT): EpisodeSlide {
  const title = t('where-it-breaks.slides.metaphor-breaks.title');
  const column = (slug: 'no-learning' | 'not-enforced' | 'reading-costs') => ({
    slug,
    title: t(`where-it-breaks.slides.metaphor-breaks.columns.${slug}.title`),
    prose: t(`where-it-breaks.slides.metaphor-breaks.columns.${slug}.prose`),
  });
  return {
    slug: 'metaphor-breaks',
    title,
    minutes: { en: 4, de: 5 },
    content: (
      <ThreeColumnSlide
        title={title}
        caption={t('where-it-breaks.slides.metaphor-breaks.caption')}
        columns={[column('no-learning'), column('not-enforced'), column('reading-costs')]}
      />
    ),
  };
}

function enforceAndVerify(t: SectionsT): EpisodeSlide {
  const title = t('where-it-breaks.slides.enforce-and-verify.title');
  return {
    slug: 'enforce-and-verify',
    title,
    minutes: { en: 3, de: 4 },
    content: (
      <BasicPageSlide
        title={title}
        caption={t('where-it-breaks.slides.enforce-and-verify.caption')}
        prose={t('where-it-breaks.slides.enforce-and-verify.prose')}
      />
    ),
  };
}

type SectionSlug = 'blank-slate' | 'onboarding' | 'where-it-breaks';

const SECTION_MINUTES: PerLocale<number> = { en: 1, de: 1 };

function sections(t: SectionsT): EpisodeSection[] {
  const onboarding = [briefAndRules(t), keepItShort(t), decisionsInWriting(t)];
  const sectionOf = (slug: SectionSlug, caption: string, slides: EpisodeSlide[]): EpisodeSection => {
    const title = t(`${slug}.title`);
    return { slug, title, minutes: SECTION_MINUTES, content: <SectionSlide title={title} caption={caption} />, slides };
  };
  return [
    sectionOf('blank-slate', t('blank-slate.caption'), [blankEveryTime(t), whereKnowledgeLives(t)]),
    sectionOf('onboarding', t('onboarding.caption', { count: onboarding.length }), onboarding),
    sectionOf('where-it-breaks', t('where-it-breaks.caption'), [metaphorBreaks(t), enforceAndVerify(t)]),
  ];
}

export const amnesiacFreelancer = {
  slug: 'amnesiac-freelancer',
  async content(locale: Locale) {
    const t = await getTranslations({ locale, namespace: 'episodes.amnesiac-freelancer' });
    const sectionsT = await getTranslations({ locale, namespace: 'episodes.amnesiac-freelancer.sections' });
    return { title: t('title'), caption: t('caption'), sections: sections(sectionsT) };
  },
} satisfies Episode;
