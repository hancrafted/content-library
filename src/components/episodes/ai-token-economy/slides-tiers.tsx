import type { EpisodeSection } from '@/components/episode-page/episode-page-container.pure';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { elementId, SlideProse } from '@/components/slide-master/slide-master';
import type { ReactElement } from 'react';
import { contextOf, type SectionsT } from './context';

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

function RoutingFlow({ id }: { id?: string }): ReactElement {
  return (
    <div id={id} className="mt-8 grid gap-4 lg:grid-cols-3">
      <Phase1Card />
      <Phase2Card />
      <Phase3Card />
    </div>
  );
}

export function modelTiers(t: SectionsT): EpisodeSection {
  const title = t('model-tiers.title');
  const caption = t('model-tiers.caption');
  const { anchor, notes, voiceScript } = contextOf(t, 'model-tiers');

  return {
    slug: 'model-tiers',
    title,
    minutes: { en: 2, de: 2 },
    notes,
    voiceScript,
    slides: [],
    content: (
      <SectionSlide anchor={anchor} title={title} caption={caption}>
        <SlideProse id={elementId(anchor, 'prose')}>{t('model-tiers.prose')}</SlideProse>
        <RoutingFlow id={elementId(anchor, 'routing-flow')} />
      </SectionSlide>
    ),
  };
}
