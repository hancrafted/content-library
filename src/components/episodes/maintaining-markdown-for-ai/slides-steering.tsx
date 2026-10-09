import type { EpisodeSection, EpisodeSlide } from '@/components/episode-page/episode-page-container.pure';
import { SectionSlide } from '@/components/slide-master/legacy/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/slide-master/slide-master';
import { contextOf, type SectionsT } from './context';
import { EffortVenn } from './effort-venn';
import { HarnessFlow } from './harness-flow';
import { LiveDemoCard } from './live-demo-card';
import { OkfSchema } from './okf-schema';
import { RoadmapTable } from './roadmap-table';

export function googleOkf(t: SectionsT): EpisodeSection {
  const title = t('google-okf.title');
  const caption = t('google-okf.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'google-okf');

  return {
    slug: 'google-okf',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('google-okf.prose')}</SlideProse>
        <OkfSchema id={elementId(anchor, 'schema-card')} />
      </SectionSlide>
    ),
    slides: [],
  };
}

function deterministicCore(t: SectionsT): EpisodeSlide {
  const title = t('steering-the-ai.slides.deterministic-core.title');
  const caption = t('steering-the-ai.slides.deterministic-core.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'deterministic-core');

  return {
    slug: 'deterministic-core',
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
        <HarnessFlow id={elementId(anchor, 'flow-diagram')} />
      </SlideFrame>
    ),
  };
}

function liveDemo(t: SectionsT): EpisodeSlide {
  const title = t('steering-the-ai.slides.live-demo.title');
  const caption = t('steering-the-ai.slides.live-demo.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'live-demo');

  return {
    slug: 'live-demo',
    title,
    minutes: { en: 3, de: 4 },
    notes,
    voiceScript,
    content: (
      <SlideFrame>
        <SlideTitle as="h3" id={elementId(anchor, 'title')}>
          {title}
        </SlideTitle>
        <SlideCaption id={elementId(anchor, 'caption')}>{caption}</SlideCaption>
        <LiveDemoCard id={elementId(anchor, 'terminal-panel')} />
      </SlideFrame>
    ),
  };
}

function featureRoadmap(t: SectionsT): EpisodeSlide {
  const title = t('steering-the-ai.slides.feature-roadmap.title');
  const caption = t('steering-the-ai.slides.feature-roadmap.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'feature-roadmap');

  return {
    slug: 'feature-roadmap',
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
        <RoadmapTable shippedId={elementId(anchor, 'shipped-col')} plannedId={elementId(anchor, 'planned-col')} />
      </SlideFrame>
    ),
  };
}

export function steeringTheAi(t: SectionsT): EpisodeSection {
  const title = t('steering-the-ai.title');
  const caption = t('steering-the-ai.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'steering-the-ai');

  return {
    slug: 'steering-the-ai',
    title,
    minutes: { en: 1, de: 1 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('steering-the-ai.prose')}</SlideProse>
        <EffortVenn id={elementId(anchor, 'venn')} emphasis="machine" className="mt-4" />
      </SectionSlide>
    ),
    slides: [deterministicCore(t), liveDemo(t), featureRoadmap(t)],
  };
}

export function theVerifyingHalfIsYours(t: SectionsT): EpisodeSection {
  const title = t('the-verifying-half-is-yours.title');
  const caption = t('the-verifying-half-is-yours.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-verifying-half-is-yours');

  return {
    slug: 'the-verifying-half-is-yours',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('the-verifying-half-is-yours.prose')}</SlideProse>
        <EffortVenn emphasis="human" className="mt-4" />
        <div id={elementId(anchor, 'conclusion-card')} className="mt-6 flex flex-col items-center justify-center gap-2">
          <p className="font-mono text-base font-semibold text-accent">
            the AI region is my hypothesis — still unsettled
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            markdown-harness · github.com/hancrafted/markdown-harness
          </p>
        </div>
      </SectionSlide>
    ),
    slides: [],
  };
}
