import type {
  Episode,
  EpisodeSection,
  EpisodeSlide,
  PerLocale,
} from '@/components/episode-page/episode-page-container.pure';
import type { ReadString } from '@/components/episode-page/slide-context.pure';
import { SessionLoop } from '@/components/episodes/amnesiac-freelancer/client/session-loop.client';
import { contextRefOf, type ContextRefOf } from '@/components/slide-master/context-ref';
import { BasicPageSlide } from '@/components/slide-master/legacy/basic-page-slide';
import { SectionSlide } from '@/components/slide-master/legacy/section-slide';
import { ThreeColumnSlide } from '@/components/slide-master/legacy/three-column-slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';
import { contextFor, type SlideSlug } from './context';

/*
 * The dogfood Episode: "Treat AI like an amnesiac freelancer you have to
 * onboard". Three Sections holding 2, 3 and 2 page Slides, modelled on the
 * reference Episode (page-template). Every claim traces to
 * docs/research/ai-amnesia-mechanics.md and ai-onboarding-freelancer.md;
 * "amnesiac" is our metaphor, not a vendor term. Keys live under
 * `episodes.amnesiac-freelancer` (docs/agents/episode-translation-keys.md).
 */
type SectionsT = Awaited<ReturnType<typeof getTranslations<'episodes.amnesiac-freelancer.sections'>>>;

/** The one place the typed translator is read as a plain key reader (FE-010 §6). */
const contextOf = (t: SectionsT, slug: SlideSlug) => contextFor(t as ReadString, slug);

function blankEveryTime(t: SectionsT, ref: ContextRefOf): EpisodeSlide {
  const title = t('blank-slate.slides.blank-every-time.title');
  const context = contextOf(t, 'blank-every-time');
  const { anchor, notes, voiceScript } = context;
  return {
    slug: 'blank-every-time',
    title,
    minutes: { en: 3, de: 4 },
    notes,
    voiceScript,
    content: (
      <>
        <BasicPageSlide
          anchor={anchor}
          title={title}
          caption={t('blank-slate.slides.blank-every-time.caption')}
          prose={t.rich('blank-slate.slides.blank-every-time.prose', { ref: ref(context, 'stateless-by-design') })}
        />
        <SessionLoop caption={t('blank-slate.slides.blank-every-time.demo.caption')} />
      </>
    ),
  };
}

function whereKnowledgeLives(t: SectionsT): EpisodeSlide {
  const title = t('blank-slate.slides.where-knowledge-lives.title');
  const { anchor, notes, voiceScript } = contextOf(t, 'where-knowledge-lives');
  const column = (slug: 'training' | 'session' | 'files') => ({
    slug,
    title: t(`blank-slate.slides.where-knowledge-lives.columns.${slug}.title`),
    prose: t(`blank-slate.slides.where-knowledge-lives.columns.${slug}.prose`),
  });
  return {
    slug: 'where-knowledge-lives',
    title,
    minutes: { en: 4, de: 5 },
    notes,
    voiceScript,
    content: (
      <ThreeColumnSlide
        anchor={anchor}
        title={title}
        caption={t('blank-slate.slides.where-knowledge-lives.caption')}
        columns={[column('training'), column('session'), column('files')]}
      />
    ),
  };
}

function briefAndRules(t: SectionsT): EpisodeSlide {
  const title = t('onboarding.slides.brief-and-rules.title');
  const { anchor, notes, voiceScript } = contextOf(t, 'brief-and-rules');
  const column = (slug: 'brief' | 'house-rules' | 'definition-of-done') => ({
    slug,
    title: t(`onboarding.slides.brief-and-rules.columns.${slug}.title`),
    prose: t(`onboarding.slides.brief-and-rules.columns.${slug}.prose`),
  });
  return {
    slug: 'brief-and-rules',
    title,
    minutes: { en: 4, de: 5 },
    notes,
    voiceScript,
    content: (
      <ThreeColumnSlide
        anchor={anchor}
        title={title}
        caption={t('onboarding.slides.brief-and-rules.caption')}
        columns={[column('brief'), column('house-rules'), column('definition-of-done')]}
      />
    ),
  };
}

function keepItShort(t: SectionsT, ref: ContextRefOf): EpisodeSlide {
  const title = t('onboarding.slides.keep-it-short.title');
  const context = contextOf(t, 'keep-it-short');
  const { anchor, notes, voiceScript } = context;
  return {
    slug: 'keep-it-short',
    title,
    minutes: { en: 3, de: 3 },
    notes,
    voiceScript,
    content: (
      <BasicPageSlide
        anchor={anchor}
        title={title}
        caption={t('onboarding.slides.keep-it-short.caption')}
        prose={t.rich('onboarding.slides.keep-it-short.prose', { ref: ref(context, 'bloat-gets-ignored') })}
      />
    ),
  };
}

function decisionsInWriting(t: SectionsT, ref: ContextRefOf): EpisodeSlide {
  const title = t('onboarding.slides.decisions-in-writing.title');
  const context = contextOf(t, 'decisions-in-writing');
  const { anchor, notes, voiceScript } = context;
  return {
    slug: 'decisions-in-writing',
    title,
    minutes: { en: 3, de: 4 },
    notes,
    voiceScript,
    content: (
      <BasicPageSlide
        anchor={anchor}
        title={title}
        caption={t('onboarding.slides.decisions-in-writing.caption')}
        prose={t.rich('onboarding.slides.decisions-in-writing.prose', { ref: ref(context, 'superseded-not-deleted') })}
      />
    ),
  };
}

function metaphorBreaks(t: SectionsT): EpisodeSlide {
  const title = t('where-it-breaks.slides.metaphor-breaks.title');
  const { anchor, notes, voiceScript } = contextOf(t, 'metaphor-breaks');
  const column = (slug: 'no-learning' | 'not-enforced' | 'reading-costs') => ({
    slug,
    title: t(`where-it-breaks.slides.metaphor-breaks.columns.${slug}.title`),
    prose: t(`where-it-breaks.slides.metaphor-breaks.columns.${slug}.prose`),
  });
  return {
    slug: 'metaphor-breaks',
    title,
    minutes: { en: 4, de: 5 },
    notes,
    voiceScript,
    content: (
      <ThreeColumnSlide
        anchor={anchor}
        title={title}
        caption={t('where-it-breaks.slides.metaphor-breaks.caption')}
        columns={[column('no-learning'), column('not-enforced'), column('reading-costs')]}
      />
    ),
  };
}

/**
 * The untitled Slide (FE-002 §2): a purely visual closing beat. It declares no
 * `title`, so it renders but has no table-of-contents entry; its minutes still
 * count toward the reading time.
 */
function oneLine(t: SectionsT): EpisodeSlide {
  return {
    slug: 'one-line',
    minutes: { en: 1, de: 1 },
    content: (
      <SlideFrame className="justify-center">
        <p className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
          {t('where-it-breaks.slides.one-line.statement')}
        </p>
      </SlideFrame>
    ),
  };
}

function enforceAndVerify(t: SectionsT): EpisodeSlide {
  const title = t('where-it-breaks.slides.enforce-and-verify.title');
  const { anchor, notes, voiceScript } = contextOf(t, 'enforce-and-verify');
  return {
    slug: 'enforce-and-verify',
    title,
    minutes: { en: 3, de: 4 },
    notes,
    voiceScript,
    content: (
      <BasicPageSlide
        anchor={anchor}
        title={title}
        caption={t('where-it-breaks.slides.enforce-and-verify.caption')}
        prose={t('where-it-breaks.slides.enforce-and-verify.prose')}
      />
    ),
  };
}

type SectionSlug = 'blank-slate' | 'onboarding' | 'where-it-breaks';

const SECTION_MINUTES: PerLocale<number> = { en: 1, de: 1 };

function sections(t: SectionsT, ref: ContextRefOf): EpisodeSection[] {
  const onboarding = [briefAndRules(t), keepItShort(t, ref), decisionsInWriting(t, ref)];
  const sectionOf = (slug: SectionSlug, caption: string, slides: EpisodeSlide[]): EpisodeSection => {
    const title = t(`${slug}.title`);
    return { slug, title, minutes: SECTION_MINUTES, content: <SectionSlide title={title} caption={caption} />, slides };
  };
  return [
    sectionOf('blank-slate', t('blank-slate.caption'), [blankEveryTime(t, ref), whereKnowledgeLives(t)]),
    sectionOf('onboarding', t('onboarding.caption', { count: onboarding.length }), onboarding),
    sectionOf('where-it-breaks', t('where-it-breaks.caption'), [metaphorBreaks(t), enforceAndVerify(t), oneLine(t)]),
  ];
}

export const amnesiacFreelancer = {
  slug: 'amnesiac-freelancer',
  async content(locale: Locale) {
    const t = await getTranslations({ locale, namespace: 'episodes.amnesiac-freelancer' });
    const sectionsT = await getTranslations({ locale, namespace: 'episodes.amnesiac-freelancer.sections' });
    const chrome = await getTranslations({ locale, namespace: 'contextDrawer' });
    const ref = contextRefOf(chrome('refNote'));
    return { title: t('title'), caption: t('caption'), sections: sections(sectionsT, ref) };
  },
} satisfies Episode;
