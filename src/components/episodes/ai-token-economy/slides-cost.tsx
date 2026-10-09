import type { EpisodeSection, EpisodeSlide } from '@/components/episode-page/episode-page-container.pure';
import { FixesSliderClient } from '@/components/episodes/ai-token-economy/client/fixes-slider.client';
import { MODEL_PRICINGS } from '@/components/episodes/ai-token-economy/client/token-economy-data.pure';
import { SectionSlide } from '@/components/slide-master/legacy/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import { contextOf, type SectionsT } from './context';

const COST_STEPS = [
  { title: 'System prompt', sub: 'rules, tools, memory', cost: '+35,000', cum: '35,000' },
  { title: 'User query', sub: 'the bug report', cost: '+1,000', cum: '36,000' },
  { title: 'Thought #1 & Tool call', sub: 'read file #1', cost: '+4,200', cum: '40,200' },
  { title: 'File #1 contents', sub: 'entire 400-line file', cost: '+12,000', cum: '52,200' },
  { title: 'Thought #2 & Tool call', sub: 'read helper module', cost: '+4,200', cum: '56,400' },
  { title: 'File #2 contents', sub: 'second full file', cost: '+9,000', cum: '65,400' },
  { title: 'Thought #3 & Patch apply', sub: 'write and verify patch', cost: '+8,050', cum: '73,450' },
] as const;

function CompoundingTable(): ReactElement {
  return (
    <div className="mt-8 space-y-3">
      {COST_STEPS.map((step) => (
        <div
          key={step.title}
          className="flex items-center justify-between rounded-lg border border-base-200 bg-base-100 p-3 shadow-xs"
        >
          <div>
            <span className="font-semibold text-sm">{step.title}</span>
            <span className="ml-2 text-xs text-base-content/50">· {step.sub}</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-sm">
            <span className="text-error font-semibold">{step.cost}</span>
            <span className="text-info font-bold">{step.cum}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-box border border-info/50 bg-info/10 p-4">
        <span className="font-display font-bold">Total context hauler</span>
        <span className="font-mono text-2xl font-bold text-info">~73,450 tokens</span>
      </div>
    </div>
  );
}

export function costOfAgenticAi(t: SectionsT, slides: EpisodeSlide[]): EpisodeSection {
  const title = t('cost-of-agentic-ai.title');
  const caption = t('cost-of-agentic-ai.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'cost-of-agentic-ai');

  return {
    slug: 'cost-of-agentic-ai',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('cost-of-agentic-ai.prose')}</SlideProse>
        <CompoundingTable />
      </SectionSlide>
    ),
    slides,
  };
}

function PricingBars(): ReactElement {
  return (
    <div className="space-y-3">
      {MODEL_PRICINGS.map((m) => (
        <div key={m.name} className="rounded-box border border-base-300 bg-base-100 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{m.name}</span>
            <span className="font-mono text-lg font-bold">${m.costPerFix.toFixed(2)}</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-base-200">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, (m.costPerFix / 1.54) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function theCompoundingCostCurve(t: SectionsT): EpisodeSlide {
  const title = t('cost-of-agentic-ai.slides.the-compounding-cost-curve.title');
  const caption = t('cost-of-agentic-ai.slides.the-compounding-cost-curve.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-compounding-cost-curve');

  return {
    slug: 'the-compounding-cost-curve',
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
          {t('cost-of-agentic-ai.slides.the-compounding-cost-curve.prose')}
        </SlideProse>
        <div className="mt-8 space-y-6">
          <PricingBars />
          <FixesSliderClient />
        </div>
      </SlideFrame>
    ),
  };
}
