import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useId, type ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC_CONTEXT_WINDOWS = {
  slug: 'anthropic-context-windows',
  url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
};
const ANTHROPIC_MEMORY_TOOL = {
  slug: 'anthropic-memory-tool',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool',
};
const KALAI = { slug: 'kalai-why-models-hallucinate', url: 'https://arxiv.org/abs/2509.04664' };
const ZHOU = { slug: 'zhou-least-to-most', url: 'https://arxiv.org/abs/2205.10625' };
const YANG = { slug: 'yang-underspecification', url: 'https://arxiv.org/abs/2505.13360' };
const LIGHTMAN = { slug: 'lightman-verify-step-by-step', url: 'https://arxiv.org/abs/2305.20050' };
const LABAN = { slug: 'laban-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' };
const ANTHROPIC_DEFINE_SUCCESS = {
  slug: 'anthropic-define-success',
  url: 'https://platform.claude.com/docs/en/test-and-evaluate/define-success',
};
const ANTHROPIC_MULTI_AGENT = {
  slug: 'anthropic-multi-agent-research',
  url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
};
const ARMY_MISSION_COMMAND = {
  slug: 'us-army-adp-6-0-mission-command',
  url: 'https://brightspotcdn.byui.edu/e6/50/278fcd0e464796162f3fb9d0ef70/adp-6-0-mission-command.pdf',
};
const LEE_SEE_TRUST = { slug: 'lee-see-trust-in-automation', url: 'https://pubmed.ncbi.nlm.nih.gov/15151155/' };
const ANTHROPIC_BUILDING_EFFECTIVE_AGENTS = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};

interface ColumnCopy {
  slug: 'why' | 'how' | 'what';
  word: string;
  accent: string;
  title: string;
  caption: ReactNode;
}

function Column({ cell, targetProps }: { cell: ColumnCopy; targetProps: TargetProps }) {
  const id = `column-${useId()}`;
  return (
    <article
      {...targetProps}
      data-column={cell.slug}
      aria-labelledby={id}
      className="group relative border-t border-border pt-8 md:pt-10"
    >
      <span
        aria-hidden
        className={`${cell.accent} absolute -top-px left-0 h-1 w-full origin-left scale-x-[0.18] rounded-full transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-x-100 motion-reduce:transition-none`}
      />
      <span
        aria-hidden
        className="block text-heading leading-none font-normal tracking-tighter text-muted-foreground/50 transition-colors duration-500 group-hover:text-foreground motion-reduce:transition-none"
      >
        {cell.word}
      </span>
      <h4 id={id} className="mt-6 text-subheading font-semibold tracking-tight text-balance text-foreground">
        {cell.title}
      </h4>
      <p className="mt-3 max-w-xs text-body text-pretty text-muted-foreground">{cell.caption}</p>
    </article>
  );
}

export const whyHowWhat = slide({
  slug: 'why-how-what',
  messages: { en, de },
  notes: [
    { slug: 'why', target: 'why', sources: [ANTHROPIC_CONTEXT_WINDOWS, ANTHROPIC_MEMORY_TOOL, KALAI] },
    { slug: 'how', target: 'how', sources: [ZHOU, YANG, LIGHTMAN, LABAN] },
    {
      slug: 'what',
      target: 'what',
      sources: [
        ANTHROPIC_DEFINE_SUCCESS,
        ANTHROPIC_MULTI_AGENT,
        ARMY_MISSION_COMMAND,
        LEE_SEE_TRUST,
        ANTHROPIC_BUILDING_EFFECTIVE_AGENTS,
      ],
    },
  ],
  content: ({ t, marker, target }) => {
    const cells: ColumnCopy[] = [
      {
        slug: 'why',
        word: t('words.why'),
        accent: 'bg-primary',
        title: t('columns.why.title'),
        caption: t.rich('columns.why.caption', { marker: marker('why') }),
      },
      {
        slug: 'how',
        word: t('words.how'),
        accent: 'bg-foreground',
        title: t('columns.how.title'),
        caption: t.rich('columns.how.caption', { marker: marker('how') }),
      },
      {
        slug: 'what',
        word: t('words.what'),
        accent: 'bg-primary',
        title: t('columns.what.title'),
        caption: t.rich('columns.what.caption', { marker: marker('what') }),
      },
    ];
    return (
      <SlideFrame>
        <div className="mt-10 grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-10 md:gap-y-0 lg:gap-x-14">
          {cells.map((cell) => (
            <Column key={cell.slug} cell={cell} targetProps={target(cell.slug)} />
          ))}
        </div>
      </SlideFrame>
    );
  },
});
