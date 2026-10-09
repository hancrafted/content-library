import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import type { TargetProps } from '@/lib/context-link.pure';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function Phase1Card(): ReactElement {
  return (
    <div className="card border-t-4 border-primary/50 bg-base-200 p-5 shadow-xs">
      <span className="badge badge-primary badge-sm font-mono">Phase 1</span>
      <h4 className="mt-2 font-display text-lg font-bold">Ideation &amp; Refinement</h4>
      <p className="mt-1 font-mono text-xs text-base-content/50">Web chat · flat-rate</p>
      <ul className="mt-4 space-y-2 text-sm text-base-content/80">
        <li>· Simple research &rarr; Gemini Flash</li>
        <li>· Brainstorms &rarr; Gemini Flash / Pro</li>
        <li>· Voice notes &rarr; DeepSeek V4 Pro</li>
      </ul>
    </div>
  );
}

function Phase2Card(): ReactElement {
  return (
    <div className="card border-t-4 border-primary/50 bg-base-200 p-5 shadow-xs">
      <span className="badge badge-primary badge-sm font-mono">Phase 2</span>
      <h4 className="mt-2 font-display text-lg font-bold">Specs &amp; Planning</h4>
      <p className="mt-1 font-mono text-xs text-base-content/50">Claude Code CLI · Desktop</p>
      <ul className="mt-4 space-y-2 text-sm text-base-content/80">
        <li>· PRD &amp; Architecture &rarr; Opus 4.8</li>
        <li>· Deep research &rarr; Sonnet 5 &rarr; Opus</li>
        <li>· Type checks &rarr; Sonnet 5</li>
      </ul>
    </div>
  );
}

function Phase3Card(): ReactElement {
  return (
    <div className="card border-t-4 border-primary/50 bg-base-200 p-5 shadow-xs">
      <span className="badge badge-primary badge-sm font-mono">Phase 3</span>
      <h4 className="mt-2 font-display text-lg font-bold">Execution</h4>
      <p className="mt-1 font-mono text-xs text-base-content/50">All CLI</p>
      <ul className="mt-4 space-y-2 text-sm text-base-content/80">
        <li>· Commits &rarr; Gemini Flash</li>
        <li>· Implementation &rarr; Sonnet 5</li>
        <li>· Exploration &rarr; Haiku 4.5</li>
      </ul>
    </div>
  );
}

function RoutingFlow(target: TargetProps): ReactElement {
  return (
    <div {...target} className="mt-8 grid gap-4 lg:grid-cols-3">
      <Phase1Card />
      <Phase2Card />
      <Phase3Card />
    </div>
  );
}

export const modelTiers = slide({
  slug: 'model-tiers',
  minutes: { en: 2, de: 2 },
  notes: [
    { slug: 'tiered-stack-architecture', target: 'title' },
    { slug: 'zero-marginal-thinking', target: 'routing-flow' },
  ],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <RoutingFlow {...target('routing-flow')} />
    </SectionSlide>
  ),
});
