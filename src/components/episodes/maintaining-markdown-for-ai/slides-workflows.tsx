import type { EpisodeSection, EpisodeSlide } from '@/components/episode-page/episode-page-container.pure';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/slide-master/slide-master';
import { contextOf, type SectionsT } from './context';
import { EffortCorpusChart, EffortDecayChart } from './effort-charts';
import { EffortVenn } from './effort-venn';
import { MarkdownRoles } from './markdown-roles';
import { AiRecommendationCard, HumanJudgmentCard, MachineCheckCard } from './workflow-passes';

export function markdownInAiWorkflows(t: SectionsT): EpisodeSection {
  const title = t('markdown-in-ai-workflows.title');
  const caption = t('markdown-in-ai-workflows.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'markdown-in-ai-workflows');

  return {
    slug: 'markdown-in-ai-workflows',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('markdown-in-ai-workflows.prose')}</SlideProse>
        <MarkdownRoles knowledgeId={elementId(anchor, 'knowledge')} />
      </SectionSlide>
    ),
    slides: [],
  };
}

function VolumeCharts({ anchor }: { anchor: string }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
      <figure className="min-w-0">
        <figcaption className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          One document decays
        </figcaption>
        <EffortDecayChart />
      </figure>
      <figure className="min-w-0">
        <figcaption className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          The corpus compounds
        </figcaption>
        <EffortCorpusChart id={elementId(anchor, 'corpus-chart')} />
      </figure>
    </div>
  );
}

export function volumeOutrunsReview(t: SectionsT): EpisodeSection {
  const title = t('volume-outruns-review.title');
  const caption = t('volume-outruns-review.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'volume-outruns-review');

  return {
    slug: 'volume-outruns-review',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('volume-outruns-review.prose')}</SlideProse>
        <VolumeCharts anchor={anchor} />
      </SectionSlide>
    ),
    slides: [],
  };
}

function whatTheMachineVerifies(t: SectionsT): EpisodeSlide {
  const title = t('where-the-effort-goes.slides.what-the-machine-verifies.title');
  const caption = t('where-the-effort-goes.slides.what-the-machine-verifies.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'what-the-machine-verifies');

  return {
    slug: 'what-the-machine-verifies',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SlideFrame>
        <SlideTitle as="h3" id={elementId(anchor, 'title')}>
          {title}
        </SlideTitle>
        <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
        <MachineCheckCard id={elementId(anchor, 'check-result')} />
      </SlideFrame>
    ),
  };
}

function whatAiAccelerates(t: SectionsT): EpisodeSlide {
  const title = t('where-the-effort-goes.slides.what-ai-accelerates.title');
  const caption = t('where-the-effort-goes.slides.what-ai-accelerates.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'what-ai-accelerates');

  return {
    slug: 'what-ai-accelerates',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SlideFrame>
        <SlideTitle as="h3" id={elementId(anchor, 'title')}>
          {title}
        </SlideTitle>
        <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
        <AiRecommendationCard id={elementId(anchor, 'discrepancy-card')} />
      </SlideFrame>
    ),
  };
}

function whatRemainsHuman(t: SectionsT): EpisodeSlide {
  const title = t('where-the-effort-goes.slides.what-remains-human.title');
  const caption = t('where-the-effort-goes.slides.what-remains-human.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'what-remains-human');

  return {
    slug: 'what-remains-human',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SlideFrame>
        <SlideTitle as="h3" id={elementId(anchor, 'title')}>
          {title}
        </SlideTitle>
        <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
        <HumanJudgmentCard id={elementId(anchor, 'judgment-card')} />
      </SlideFrame>
    ),
  };
}

export function whereTheEffortGoes(t: SectionsT): EpisodeSection {
  const title = t('where-the-effort-goes.title');
  const caption = t('where-the-effort-goes.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'where-the-effort-goes');

  return {
    slug: 'where-the-effort-goes',
    title,
    minutes: { en: 1, de: 1 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('where-the-effort-goes.prose')}</SlideProse>
        <EffortVenn id={elementId(anchor, 'venn')} emphasis="establish" className="mt-4" />
      </SectionSlide>
    ),
    slides: [whatTheMachineVerifies(t), whatAiAccelerates(t), whatRemainsHuman(t)],
  };
}
