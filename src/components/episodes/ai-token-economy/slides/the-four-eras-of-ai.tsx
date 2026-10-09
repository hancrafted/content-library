import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

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

export const theFourErasOfAi = slide({
  slug: 'the-four-eras-of-ai',
  minutes: { en: 2, de: 2 },
  notes: [{ slug: 'emerging-disciplines', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <ErasGrid />
    </SlideFrame>
  ),
});
