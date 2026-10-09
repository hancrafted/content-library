import { ContextGaugeSliderClient } from '@/components/episode/context-gauge-slider.client';
import type { EpisodeSection, EpisodeSlide } from '@/components/episode/episode-page-container.pure';
import { SectionSlide } from '@/components/episode/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/episode/slide-master';
import type { ReactElement } from 'react';
import { contextOf, type SectionsT } from './context';

function ChatLane(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Plain chat</span>
        <span className="font-mono text-success font-bold">25% · fresh</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-box border border-base-content/10 bg-base-300">
        <div className="flex w-1/4 items-center justify-center bg-neutral text-neutral-content font-mono text-[0.65rem]">
          Boot-up
        </div>
        <div className="w-[15%] bg-primary" />
        <div className="w-[10%] bg-accent" />
      </div>
    </div>
  );
}

function AgentLane(): ReactElement {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">Agentic coding</span>
        <span className="font-mono text-error font-bold">85% · full</span>
      </div>
      <div className="flex h-10 w-full overflow-hidden rounded-box border border-base-content/10 bg-base-300">
        <div className="flex w-1/4 items-center justify-center bg-neutral text-neutral-content font-mono text-[0.65rem]">
          Boot-up
        </div>
        <div className="w-[15%] bg-primary" />
        <div className="w-[25%] bg-warning" />
        <div className="w-[20%] bg-warning/80" />
      </div>
    </div>
  );
}

function AttentionLanes(): ReactElement {
  return (
    <div className="mt-8 space-y-6">
      <ChatLane />
      <AgentLane />
      <div className="flex justify-between font-mono text-xs text-base-content/60">
        <span>9 AM · fresh</span>
        <span>12 PM</span>
        <span>3 PM</span>
        <span>5 PM · running on fumes</span>
      </div>
    </div>
  );
}

export function managingContext(t: SectionsT, slides: EpisodeSlide[]): EpisodeSection {
  const title = t('managing-context.title');
  const caption = t('managing-context.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'managing-context');

  return {
    slug: 'managing-context',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('managing-context.prose')}</SlideProse>
        <AttentionLanes />
      </SectionSlide>
    ),
    slides,
  };
}

function LostMiddleDiagram(): ReactElement {
  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-stretch gap-2 font-mono text-xs">
        <div className="flex-1 rounded border-l-4 border-primary bg-base-200 p-3">
          <span className="block font-bold text-primary">System prompt (Primacy)</span>
          &ldquo;You are an expert coder&hellip;&rdquo;
        </div>
        <div className="flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">[msg 12: read utils.js]</div>
        <div className="hidden md:block flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">
          [msg 13: modify api.js]
        </div>
        <div className="flex-1 rounded bg-base-200 p-3 opacity-40 blur-[1px]">[msg 14: read config.json]</div>
        <div className="flex-1 rounded border-l-4 border-accent bg-base-200 p-3">
          <span className="block font-bold text-accent">Latest request (Recency)</span>
          &ldquo;Why is the build failing?&rdquo;
        </div>
      </div>

      <div className="rounded-box border border-base-content/10 bg-base-200 p-4 text-sm">
        <span className="font-semibold text-primary">Serial-position effect:</span> Models recall the first and last
        exchanges sharply, while the middle blurs into an attention valley.
      </div>
    </div>
  );
}

export function theLostMiddle(t: SectionsT): EpisodeSlide {
  const title = t('managing-context.slides.the-lost-middle.title');
  const caption = t('managing-context.slides.the-lost-middle.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-lost-middle');

  return {
    slug: 'the-lost-middle',
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
        <SlideProse id={elementId(anchor, 'prose')}>{t('managing-context.slides.the-lost-middle.prose')}</SlideProse>
        <LostMiddleDiagram />
      </SlideFrame>
    ),
  };
}

export function theFullnessGaugeAndLevers(t: SectionsT): EpisodeSlide {
  const title = t('managing-context.slides.the-fullness-gauge-and-levers.title');
  const caption = t('managing-context.slides.the-fullness-gauge-and-levers.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-fullness-gauge-and-levers');

  return {
    slug: 'the-fullness-gauge-and-levers',
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
        <SlideProse id={elementId(anchor, 'prose')}>
          {t('managing-context.slides.the-fullness-gauge-and-levers.prose')}
        </SlideProse>
        <div className="mt-8">
          <ContextGaugeSliderClient />
        </div>
      </SlideFrame>
    ),
  };
}
