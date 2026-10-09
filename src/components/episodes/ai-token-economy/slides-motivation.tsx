import type { EpisodeSection, EpisodeSlide } from '@/components/episode/episode-page-container.pure';
import { OutcomePerEuroClient } from '@/components/episode/outcome-per-euro.client';
import { SectionSlide } from '@/components/episode/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/episode/slide-master';
import type { ReactElement } from 'react';
import { contextOf, type SectionsT } from './context';
import { FreelancerCards } from './freelancer-cards';
import { InvoiceComparison } from './invoice-comparison';

export function motivation(t: SectionsT, slides: EpisodeSlide[]): EpisodeSection {
  const title = t('motivation.title');
  const caption = t('motivation.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'motivation');

  return {
    slug: 'motivation',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('motivation.prose')}</SlideProse>
        <FreelancerCards id={elementId(anchor, 'freelancer-cards')} />
      </SectionSlide>
    ),
    slides,
  };
}

function DoorCards(): ReactElement {
  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="card border border-base-300 bg-base-200/60 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-base-content/40">
          door 1 · the individual
        </p>
        <h4 className="mt-1 font-display text-xl font-bold">Human with AI</h4>
        <p className="mt-2 text-sm text-base-content/70">5–20× individual throughput by directing synthetic labor.</p>
      </div>
      <div className="card border border-primary/40 bg-primary/5 p-5 shadow-xs">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-primary/70">door 2 · the organization</p>
        <h4 className="mt-1 font-display text-xl font-bold">Leader of humans with AI</h4>
        <p className="mt-2 text-sm text-base-content/70">
          Upskilling whole teams into fluent directors of automated systems.
        </p>
      </div>
    </div>
  );
}

export function leadOneUpskillMany(t: SectionsT): EpisodeSlide {
  const title = t('motivation.slides.lead-one-upskill-many.title');
  const caption = t('motivation.slides.lead-one-upskill-many.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'lead-one-upskill-many');

  return {
    slug: 'lead-one-upskill-many',
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
        <SlideProse id={elementId(anchor, 'prose')}>{t('motivation.slides.lead-one-upskill-many.prose')}</SlideProse>
        <div className="mt-6 border-l-2 border-primary/50 pl-5 font-display text-lg font-semibold text-base-content">
          You can opt out of managing it. The people who don&rsquo;t will simply out-produce you.
        </div>
        <DoorCards />
      </SlideFrame>
    ),
  };
}

const ERAS = [
  {
    era: '2022–23',
    kind: 'chat workflow',
    title: 'Prompt Engineering',
    desc: 'Phrasing, few-shot examples, and asking clearly.',
  },
  {
    era: '2024–25',
    kind: 'agentic workflow',
    title: 'Context Engineering',
    desc: 'AGENTS.md, skills, and compact structured memory.',
  },
  {
    era: '2025–26',
    kind: 'autonomous workflow',
    title: 'Harness Engineering',
    desc: 'Tools, deterministic tests, and guardrail verification.',
  },
  { era: '2026 →', kind: 'emerging', title: 'Loop Engineering?', desc: 'Self-improving autonomous feedback cycles.' },
] as const;

function ErasGrid(): ReactElement {
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ERAS.map((e) => (
          <div key={e.title} className="rounded-box border border-base-300 bg-base-100 p-4 shadow-xs">
            <span className="font-mono text-xs tabular-nums text-base-content/50">{e.era}</span>
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-primary">{e.kind}</p>
            <h4 className="mt-1 font-display text-base font-bold">{e.title}</h4>
            <p className="mt-1 text-xs text-base-content/70">{e.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-box border border-primary/30 bg-primary/5 p-4 text-center">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-primary">Foundation</span>
        <p className="font-display text-base font-bold text-base-content">Token Economy — the currency of every era</p>
      </div>
    </>
  );
}

export function theFourErasOfAi(t: SectionsT): EpisodeSlide {
  const title = t('motivation.slides.the-four-eras-of-ai.title');
  const caption = t('motivation.slides.the-four-eras-of-ai.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-four-eras-of-ai');

  return {
    slug: 'the-four-eras-of-ai',
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
        <SlideProse id={elementId(anchor, 'prose')}>{t('motivation.slides.the-four-eras-of-ai.prose')}</SlideProse>
        <ErasGrid />
      </SlideFrame>
    ),
  };
}

export function theInvisibleInvoice(t: SectionsT): EpisodeSlide {
  const title = t('motivation.slides.the-invisible-invoice.title');
  const caption = t('motivation.slides.the-invisible-invoice.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'the-invisible-invoice');

  return {
    slug: 'the-invisible-invoice',
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
        <SlideProse id={elementId(anchor, 'prose')}>{t('motivation.slides.the-invisible-invoice.prose')}</SlideProse>
        <InvoiceComparison />
      </SlideFrame>
    ),
  };
}

function SubsidyCallout(): ReactElement {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-box border border-base-300 bg-base-200/50 p-4">
      <span className="shrink-0 rounded-md bg-primary/15 px-2 py-1 font-mono text-sm font-semibold text-primary">
        2–10×
      </span>
      <p className="text-sm text-base-content/70">
        Today&rsquo;s prices are subsidized — vendors sell intelligence below cost to build adoption. When subsidies
        expire, outcome per euro decides who survives.
      </p>
    </div>
  );
}

export function outcomePerEuro(t: SectionsT): EpisodeSlide {
  const title = t('motivation.slides.outcome-per-euro.title');
  const caption = t('motivation.slides.outcome-per-euro.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'outcome-per-euro');

  return {
    slug: 'outcome-per-euro',
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
        <SlideProse id={elementId(anchor, 'prose')}>{t('motivation.slides.outcome-per-euro.prose')}</SlideProse>
        <OutcomePerEuroClient />
        <SubsidyCallout />
      </SlideFrame>
    ),
  };
}
