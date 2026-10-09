import { TokenizerPlaygroundClient } from '@/components/episodes/ai-token-economy/client/tokenizer-playground.client';
import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

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

export const whatIsAToken = slide({
  slug: 'what-is-a-token',
  minutes: { en: 2, de: 2 },
  notes: [{ slug: 'probabilistic-units', target: 'title' }],
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <TokenizerPlaygroundClient />
        <BillingDimensions />
      </div>
    </SectionSlide>
  ),
});
