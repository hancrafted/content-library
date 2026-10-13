import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import type { TargetProps } from '@/lib/context-link.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './you-managed-the-task.module.css';

interface StatementProps extends Partial<TargetProps> {
  statement: string;
  from: string;
  to: string;
}

// The one cell of the grid-1x1 master as a plain statement on the neutral page: the claim, then a line from "doing"
// to "managing" that draws once. The end labels are real text, so the claim reads without the line.
function Statement({ statement, from, to, ...rest }: StatementProps) {
  return (
    <figure {...rest} className="mt-auto max-w-3xl pt-10">
      <h4 className="text-heading font-semibold tracking-tight text-balance text-foreground">{statement}</h4>
      <div aria-hidden className="mt-8 flex items-center">
        <span className="size-2 rounded-full bg-muted-foreground" />
        <span className={`h-px flex-1 bg-primary ${styles.track}`} />
        <span className={`size-2 rounded-full bg-primary ${styles.toEnd}`} />
      </div>
      <div className="mt-3 flex justify-between">
        <span className="text-caption text-muted-foreground">{from}</span>
        <span className={`text-caption font-medium text-primary ${styles.toEnd}`}>{to}</span>
      </div>
    </figure>
  );
}

/*
 * Doing became managing: the grid-1x1 master, copied with changes. No counter, no gradient surface, no hover: the one
 * cell is a plain statement set low on the page, over a line that draws once from "doing" to "managing" when the
 * Slide becomes active. CSS only, so no client widget.
 */
export const youManagedTheTask = slide({
  slug: 'you-managed-the-task',
  messages: { en, de },
  notes: [
    {
      slug: 'a-management-reading',
      target: 'statement',
      sources: [
        {
          slug: 'onboarding-plan-for-ai-agents',
          url: 'https://hbr.org/2026/03/create-an-onboarding-plan-for-ai-agents',
        },
      ],
    },
    {
      slug: 'the-task-not-the-rank',
      target: 'statement',
      sources: [
        { slug: 'generative-ai-at-work', url: 'https://www.nber.org/papers/w31161' },
        {
          slug: 'jagged-technological-frontier',
          url: 'https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf',
        },
      ],
    },
    {
      slug: 'experience-with-the-tool',
      target: 'statement',
      sources: [
        { slug: 'learning-curves', url: 'https://www.anthropic.com/research/economic-index-march-2026-report' },
      ],
    },
    {
      slug: 'where-the-analogy-stops',
      target: 'caption',
      sources: [
        {
          slug: 'long-running-agents',
          url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',
        },
      ],
    },
  ],
  segments: [{ slug: 'you-did-not-plan-the-party' }, { slug: 'doing-became-managing' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption {...target('caption')}>{t('caption')}</SlideCaption>
      <Statement {...target('statement')} statement={t('statement')} from={t('line.from')} to={t('line.to')} />
    </SlideFrame>
  ),
});
