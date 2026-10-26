import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

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
          <div key={e.title} className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <span className="font-mono text-xs tabular-nums text-muted-foreground">{e.era}</span>
            <p className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-primary">{e.kind}</p>
            <h4 className="mt-1 text-base font-bold">{e.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
        <span className="font-mono text-[0.65rem] uppercase tracking-widest text-primary">Foundation</span>
        <p className="text-base font-bold text-foreground">Token Economy — the currency of every era</p>
      </div>
    </>
  );
}

export const theFourErasOfAi = slide({
  slug: 'the-four-eras-of-ai',
  messages: { en, de },
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
