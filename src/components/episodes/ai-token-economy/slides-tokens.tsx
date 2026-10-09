import type { EpisodeSection, EpisodeSlide } from '@/components/episode-page/episode-page-container.pure';
import { ClaudeContextTerminalClient } from '@/components/episodes/ai-token-economy/client/claude-context-terminal.client';
import { TokenizerPlaygroundClient } from '@/components/episodes/ai-token-economy/client/tokenizer-playground.client';
import { SectionSlide } from '@/components/slide-master/legacy/section-slide';
import { elementId, SlideCaption, SlideFrame, SlideProse, SlideTitle } from '@/components/slide-master/slide-master';
import Image from 'next/image';
import type { ReactElement } from 'react';
import { contextOf, type SectionsT } from './context';

const DIMENSIONS = [
  { label: 'input', desc: 'every word you send — and re-send on every turn', color: 'text-primary' },
  { label: 'output', desc: 'every word generated in return and reasoning traces', color: 'text-accent' },
  { label: 'cache write', desc: 'storing recurring context blocks for reuse', color: 'text-info' },
  { label: 'cache read', desc: 'reusing cached blocks — ~10% of base input rate', color: 'text-success' },
] as const;

function BillingDimensions(): ReactElement {
  return (
    <div className="rounded-box border border-base-300 bg-base-200/50 p-5">
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-base-content/50">
        Every token is billed 4 ways
      </p>
      <ul className="mt-3 grid gap-2 text-sm text-base-content/70">
        {DIMENSIONS.map((d) => (
          <li key={d.label} className="flex items-baseline gap-2">
            <span className={`font-mono text-xs font-semibold ${d.color}`}>{d.label}</span>
            <span>{d.desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function whatIsAToken(t: SectionsT, slides: EpisodeSlide[]): EpisodeSection {
  const title = t('what-is-a-token.title');
  const caption = t('what-is-a-token.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'what-is-a-token');

  return {
    slug: 'what-is-a-token',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    slides,
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('what-is-a-token.prose')}</SlideProse>
        <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <TokenizerPlaygroundClient />
          <BillingDimensions />
        </div>
      </SectionSlide>
    ),
  };
}

export function liveContextBreakdown(t: SectionsT): EpisodeSlide {
  const title = t('what-is-a-token.slides.live-context-breakdown.title');
  const caption = t('what-is-a-token.slides.live-context-breakdown.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'live-context-breakdown');

  return {
    slug: 'live-context-breakdown',
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
          {t('what-is-a-token.slides.live-context-breakdown.prose')}
        </SlideProse>
        <div className="mt-8">
          <ClaudeContextTerminalClient />
        </div>
      </SlideFrame>
    ),
  };
}

function ObscurityCards(): ReactElement {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card border border-base-content/10 bg-base-200 p-5 shadow-xs">
        <h4 className="font-display text-lg font-bold">
          <span className="font-mono text-sm text-success">01</span> The initiation
        </h4>
        <p className="mt-2 text-sm text-base-content/70">
          Unlimited on the house. The intelligence feels like magic and the bill is invisible — so you build the habit.
        </p>
      </div>
      <div className="card border border-error/30 bg-error/5 p-5 shadow-xs">
        <h4 className="font-display text-lg font-bold">
          <span className="font-mono text-sm text-error">02</span> The hook
        </h4>
        <p className="mt-2 text-sm text-base-content/70">
          Now you are fluent — and the meter is gone. Out of credits? Just top up. The real rate never shows.
        </p>
      </div>
    </div>
  );
}

function ObscurityFigure(): ReactElement {
  return (
    <figure className="mx-auto max-w-3xl overflow-hidden rounded-box border border-base-300 shadow-lg">
      <Image
        src="/images/episodes/ai-token-economy/token-addiction.webp"
        alt="Two-panel illustration: The Initiation vs The Hook"
        width={800}
        height={450}
        className="w-full h-auto object-cover"
      />
    </figure>
  );
}

export function cliVsWebToolObscurity(t: SectionsT): EpisodeSlide {
  const title = t('what-is-a-token.slides.cli-vs-web-tool-obscurity.title');
  const caption = t('what-is-a-token.slides.cli-vs-web-tool-obscurity.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'cli-vs-web-tool-obscurity');

  return {
    slug: 'cli-vs-web-tool-obscurity',
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
          {t('what-is-a-token.slides.cli-vs-web-tool-obscurity.prose')}
        </SlideProse>
        <div className="mt-8 space-y-6">
          <ObscurityFigure />
          <ObscurityCards />
        </div>
      </SlideFrame>
    ),
  };
}
