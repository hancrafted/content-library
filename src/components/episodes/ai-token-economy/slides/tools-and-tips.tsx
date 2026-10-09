import { slidesFor } from '@/components/slide-master/episode-record';
import { SectionSlide } from '@/components/slide-master/section-slide';
import { SlideProse } from '@/components/slide-master/slide-master';
import type { TargetProps } from '@/lib/context-link.pure';
import { externalHref } from '@/lib/external-link.pure';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

interface AutomatedTool {
  readonly name: string;
  readonly href: string;
  readonly desc: string;
}

const AUTOMATED_TOOLS: readonly AutomatedTool[] = [
  {
    name: 'Headroom',
    href: 'https://github.com/headroomlabs-ai/headroom',
    desc: 'Compresses agent transcripts before they hit the LLM.',
  },
  { name: 'rtk', href: 'https://github.com/rtk-ai/rtk', desc: 'Compresses CLI command outputs with low overhead.' },
  {
    name: 'Model Routers',
    href: 'https://openrouter.ai',
    desc: 'Route dynamically to the most economical capable tier.',
  },
  {
    name: 'caveman',
    href: 'https://github.com/juliusbrussee/caveman',
    desc: 'Enforces concise output saving up to 75% on generation.',
  },
];

function AutomatedCard(): ReactElement {
  return (
    <div className="card border border-base-300 bg-base-100 p-5 shadow-xs">
      <h4 className="font-display text-lg font-bold text-primary">Automated</h4>
      <ul className="mt-4 space-y-3 text-sm text-base-content/80">
        {AUTOMATED_TOOLS.map((tool) => (
          <li key={tool.name}>
            <a
              href={externalHref(tool.href)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline"
            >
              {tool.name}
            </a>
            : {tool.desc}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SteeringCard(): ReactElement {
  return (
    <div className="card border border-base-300 bg-base-100 p-5 shadow-xs">
      <h4 className="font-display text-lg font-bold text-accent">Agent Steering</h4>
      <ul className="mt-4 space-y-3 text-sm text-base-content/80">
        <li>
          <span className="font-mono font-semibold">Memory Files</span>: Persist durable rules via AGENTS.md, CLAUDE.md,
          and profiles.
        </li>
        <li>
          <span className="font-mono font-semibold">Specialized Skills</span>: Separate operational workflow guides from
          base instructions.
        </li>
      </ul>
    </div>
  );
}

function HabitsCard(): ReactElement {
  return (
    <div className="card border border-base-300 bg-base-100 p-5 shadow-xs">
      <h4 className="font-display text-lg font-bold text-secondary">Team Habits</h4>
      <ul className="mt-4 space-y-3 text-sm text-base-content/80">
        <li>
          <span className="font-semibold">Edit, Don&rsquo;t Append</span>: Fix prompt mistakes at the root rather than
          stacking corrective turns.
        </li>
        <li>
          <span className="font-semibold">Session Hygiene</span>: Clear finished context rather than paying stale cache
          re-reads.
        </li>
      </ul>
    </div>
  );
}

function ToolsGrid(target: TargetProps): ReactElement {
  return (
    <div {...target} className="mt-8 grid gap-6 lg:grid-cols-3">
      <AutomatedCard />
      <SteeringCard />
      <HabitsCard />
    </div>
  );
}

export const toolsAndTips = slide({
  slug: 'tools-and-tips',
  notes: [
    { slug: 'tooling-and-steering', target: 'title' },
    { slug: 'operational-habits', target: 'tools-grid' },
  ],
  content: ({ t, target, Title }) => (
    <SectionSlide title={<Title>{t('title')}</Title>} caption={t('caption')}>
      <SlideProse>{t('prose')}</SlideProse>
      <ToolsGrid {...target('tools-grid')} />
    </SectionSlide>
  ),
});
