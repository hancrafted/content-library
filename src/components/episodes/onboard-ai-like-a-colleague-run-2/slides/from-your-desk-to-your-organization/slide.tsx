import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import { useId, type CSSProperties } from 'react';
import styles from './from-your-desk-to-your-organization.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface HalfProps {
  kind: string;
  title: string;
  items: { slug: string; text: string }[];
  side: 'start' | 'end';
  tone: 'human' | 'primary';
  'data-target'?: string;
}

const SIDE = {
  start: { facing: 'md:pr-10 md:text-right', kindRow: 'md:flex-row-reverse', later: undefined },
  end: { facing: 'md:pl-10', kindRow: undefined, later: styles.later },
} as const;

// The title's colour is joined, not merged: cn() would let text-foreground drop the text-body size.
const TONE = {
  human: { dot: 'bg-human', title: 'text-foreground' },
  primary: { dot: 'bg-primary', title: 'text-primary' },
} as const;

// One half of the split, copied from the grid-1x2 master without its hover dimming: a kind line with its dot, the
// title, a hairline and a list. Its six rows sit on the grid's subgrid tracks, so each row faces its partner across
// the divider from md up.
function Half({ kind, title, items, side, tone, ...rest }: HalfProps) {
  const id = `from-your-desk-${useId()}`;
  const { facing, kindRow, later } = SIDE[side];
  return (
    <article
      {...rest}
      aria-labelledby={id}
      className={cn('flex flex-col md:row-span-6 md:grid md:grid-rows-subgrid', facing, later)}
    >
      <span className={`text-caption font-medium ${cn('flex items-center gap-3 text-muted-foreground', kindRow)}`}>
        <span aria-hidden className={cn('size-2 rounded-full', TONE[tone].dot)} />
        {kind}
      </span>
      <h4 id={id} className={`mt-2 text-body font-semibold ${TONE[tone].title}`}>
        {title}
      </h4>
      <span aria-hidden className={cn('mt-4 block h-px bg-border', styles.rule)} />
      <ul className="md:row-span-3 md:grid md:grid-rows-subgrid">
        {items.map(({ slug, text }, i) => (
          <li
            key={slug}
            style={{ '--i': i } as CSSProperties}
            className={`border-b border-border py-5 text-body font-medium text-foreground ${styles.row}`}
          >
            {text}
          </li>
        ))}
      </ul>
    </article>
  );
}

/*
 * Skills for you, disciplines for the firm: the grid-1x2 master copied with changes. Each half carries a list, and
 * the rows share subgrid tracks, so briefing faces how work is organized around AI, handing over context faces who
 * writes it down, and checking faces who owns the checks: the same thing at a larger scale, readable at rest.
 */
export const fromYourDeskToYourOrganization = slide({
  slug: 'from-your-desk-to-your-organization',
  messages: { en, de },
  notes: [
    {
      slug: 'adoption-without-impact',
      target: 'organization',
      sources: [{ slug: 'firm-data-on-ai', url: 'https://www.nber.org/papers/w34836' }],
    },
    {
      slug: 'skill-gap',
      target: 'organization',
      sources: [
        {
          slug: 'accountable-acceleration',
          url: 'https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf',
        },
      ],
    },
    {
      slug: 'individuals-move-first',
      target: 'you',
      sources: [
        {
          slug: 'genai-divide',
          url: 'https://static1.squarespace.com/static/6500be7b90b0f770653f355f/t/691cc39e865ddb4ded472c4c/1763492766933/MIT+-+2025+The+GenAI+Divide+-+State+of+AI+in+Business+2025.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'for-yourself' }, { slug: 'for-your-organization' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:grid-rows-[repeat(6,auto)] md:gap-x-0 md:gap-y-0 md:divide-x md:divide-border">
        <Half
          {...target('you')}
          side="start"
          tone="human"
          kind={t('halves.you.kind')}
          title={t('halves.you.title')}
          items={[
            { slug: 'briefing', text: t('halves.you.items.briefing') },
            { slug: 'context', text: t('halves.you.items.context') },
            { slug: 'checking', text: t('halves.you.items.checking') },
          ]}
        />
        <Half
          {...target('organization')}
          side="end"
          tone="primary"
          kind={t('halves.organization.kind')}
          title={t('halves.organization.title')}
          items={[
            { slug: 'workflow', text: t('halves.organization.items.workflow') },
            { slug: 'context', text: t('halves.organization.items.context') },
            { slug: 'checks', text: t('halves.organization.items.checks') },
          ]}
        />
      </div>
    </SlideFrame>
  ),
});
