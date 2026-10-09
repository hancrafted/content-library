import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

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

export const costOfAgenticAi = slide({
  slug: 'cost-of-agentic-ai',
  notes: [{ slug: 'agentic-compounding', target: 'title' }],
  content: ({ t, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <CompoundingTable />
    </SectionSlide>
  ),
});
