import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Tally } from './tally';
import styles from './twenty-times-on-paper.module.css';

interface HalfProps {
  side: 'start' | 'end';
  label: ReactNode;
  figure: ReactNode;
  tally: ReactNode;
  'data-target'?: string;
  className?: string;
}

const SIDE = {
  start: { index: '01', dot: 'bg-foreground', facing: 'md:items-end md:text-right md:pr-10' },
  end: { index: '02', dot: 'bg-human', facing: 'md:items-start md:text-left md:pl-10' },
} as const;

// One half of the split, copied from the grid-1x2 master without its hover dimming: an index dot, a label, a figure
// and a tally, facing the other half across the hairline from md up. CSS only, so no client widget.
function Half({ side, label, figure, tally, className, ...rest }: HalfProps) {
  const { index, dot, facing } = SIDE[side];
  return (
    <article
      {...rest}
      className={cn('flex min-h-56 flex-col justify-between gap-10 py-8 md:min-h-80 md:py-4', facing, className)}
    >
      <span aria-hidden className="flex items-center gap-3 font-mono text-body tracking-[0.3em] text-muted-foreground">
        <span className={cn('size-2 rounded-full', dot)} />
        {index}
      </span>
      <div className="flex flex-col gap-4">
        {label}
        {figure}
      </div>
      {tally}
    </article>
  );
}

/*
 * Promised against delivered: the grid-1x2 master, copied with changes. The left half is the promise, a "20x" over
 * twenty solid marks; the right half is your last real attempt, one mark in your colour and nineteen empty ones, with
 * a question mark where the answer would be. The gap is something you see at rest; the entrance only orders it.
 */
export const twentyTimesOnPaper = slide({
  slug: 'twenty-times-on-paper',
  messages: { en, de },
  notes: [
    {
      slug: 'measured-gains',
      target: 'delivered',
      sources: [
        { slug: 'three-field-experiments', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566' },
      ],
    },
    {
      slug: 'misjudged-gain',
      target: 'delivered',
      sources: [
        { slug: 'early-2025-study', url: 'https://arxiv.org/abs/2507.09089' },
        { slug: 'metr-announcement', url: 'https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/' },
      ],
    },
    {
      slug: 'population-effects',
      target: 'delivered',
      sources: [{ slug: 'small-labor-market-effects', url: 'https://www.nber.org/papers/w33777' }],
    },
  ],
  segments: [{ slug: 'the-number' }, { slug: 'your-number' }, { slug: 'why-left-open' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div className="mt-10 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <Half
          side="start"
          label={<p className="text-caption text-muted-foreground">{t('promise.label')}</p>}
          figure={
            <h4 className={`text-heading font-semibold tracking-tight text-foreground ${styles.rise}`}>
              {t('promise.figure')}
            </h4>
          }
          tally={<Tally filled={20} total={20} tone="foreground" filling />}
        />
        <Half
          {...target('delivered')}
          side="end"
          className={styles.later}
          label={<h4 className="text-body font-semibold text-foreground">{t('delivered.label')}</h4>}
          figure={<p className="text-heading font-semibold text-primary">{t('delivered.figure')}</p>}
          tally={<Tally filled={1} total={20} tone="human" />}
        />
      </div>
    </SlideFrame>
  ),
});
