import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useId, type ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const STRONGDM_SOFTWARE_FACTORY = { slug: 'strongdm-software-factory', url: 'https://factory.strongdm.ai/' };
const GRANT_DARK_FACTORIES = { slug: 'grant-dark-factories', url: 'https://chadgrant.github.io/dark-factories/' };
const OPENAI_PROMPT_ENGINEERING = {
  slug: 'openai-prompt-engineering',
  url: 'https://developers.openai.com/api/docs/guides/prompt-engineering',
};
const ANTHROPIC_BUILDING_EFFECTIVE_AGENTS = {
  slug: 'anthropic-building-effective-agents',
  url: 'https://www.anthropic.com/engineering/building-effective-agents',
};
const WILLISON_AGENT_DEFINITION = {
  slug: 'willison-agent-definition',
  url: 'https://simonwillison.net/2025/Sep/18/agents/',
};
const OPENAI_INTRODUCING_CHATGPT = { slug: 'openai-introducing-chatgpt', url: 'https://openai.com/index/chatgpt/' };

interface ColumnCopy {
  slug: 'why' | 'how' | 'what';
  word: string;
  accent: string;
  title: string;
  caption: ReactNode;
}

/** One column of the Grids Master slide `grid-1x3`, copied: its accent stub on the hairline, the word, then claim and caption. */
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

/**
 * The page's one text Slide, Why, How and What in three columns from the Grids Master slide `grid-1x3` (a copy, vision
 * rule 4). The columns stack Why first on a phone. Each column's claim carries a Speaker note that cites research.
 */
export const whyHowWhat = slide({
  slug: 'why-how-what',
  messages: { en, de },
  notes: [
    { slug: 'why', target: 'why', sources: [STRONGDM_SOFTWARE_FACTORY, GRANT_DARK_FACTORIES] },
    {
      slug: 'how',
      target: 'how',
      sources: [OPENAI_PROMPT_ENGINEERING, ANTHROPIC_BUILDING_EFFECTIVE_AGENTS, WILLISON_AGENT_DEFINITION],
    },
    {
      slug: 'what',
      target: 'what',
      sources: [OPENAI_INTRODUCING_CHATGPT, ANTHROPIC_BUILDING_EFFECTIVE_AGENTS, STRONGDM_SOFTWARE_FACTORY],
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
