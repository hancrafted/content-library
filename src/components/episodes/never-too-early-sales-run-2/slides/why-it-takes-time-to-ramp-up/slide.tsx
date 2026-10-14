import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board } from '@/components/slide-shared/board/board';
import { StickyNote } from '@/components/slide-shared/board/sticky-note';
import type { CSSProperties } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { TimeRail } from './time-rail';
import styles from './why-it-takes-time-to-ramp-up.module.css';

const GROUPS = ['before', 'during', 'deal'] as const;
const QUESTIONS = ['customer', 'price', 'problem'] as const;
const METRICS = ['conversionRate', 'salesCycle'] as const;

/*
 * Three things that take months, as three notes on the board in Voice script order: preparation, the unknown market
 * and the unknown metrics, with one primary rail under all three. A Scene in place of the Dossier's basic page (the
 * ticket's overrule of grid-1x3): the notes sit on a board, and the long sentences live in the Voice script.
 */
export const whyItTakesTimeToRampUp = slide({
  slug: 'why-it-takes-time-to-ramp-up',
  messages: { en, de },
  notes: [
    {
      slug: 'you-search-before-you-execute',
      target: 'unknown-market',
      sources: [
        {
          slug: 'customer-development-manifesto',
          url: 'https://steveblank.com/category/customer-development-manifesto/',
        },
      ],
    },
    {
      slug: 'metrics-lag-by-the-cycle',
      target: 'unknown-metrics',
      sources: [
        {
          slug: 'science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
    {
      slug: 'codify-after-you-learn',
      target: 'preparation',
      sources: [
        {
          slug: 'science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
  ],
  segments: [{ slug: 'preparation' }, { slug: 'unknown-market' }, { slug: 'unknown-metrics' }, { slug: 'no-shortcut' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <Board aria-label={t('title')} className="mt-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-start md:gap-6">
          <StickyNote
            tone="neutral"
            fill
            label={t('board.preparation.label')}
            target={target('preparation')}
            className={styles.note}
            style={{ '--i': 0 } as CSSProperties}
          >
            <dl className="flex flex-col gap-2">
              {GROUPS.map((group) => (
                <div key={group}>
                  <dt className="text-caption font-medium">{t(`board.preparation.groups.${group}.label`)}</dt>
                  <dd className="text-caption">{t(`board.preparation.groups.${group}.items`)}</dd>
                </div>
              ))}
            </dl>
          </StickyNote>
          <StickyNote
            tone="neutral"
            fill
            label={t('board.market.label')}
            target={target('unknown-market')}
            className={styles.note}
            style={{ '--i': 1 } as CSSProperties}
          >
            <ul className="flex flex-col gap-1">
              {QUESTIONS.map((question) => (
                <li key={question}>{t(`board.market.questions.${question}`)}</li>
              ))}
            </ul>
          </StickyNote>
          <StickyNote
            tone="neutral"
            fill
            label={t('board.metrics.label')}
            target={target('unknown-metrics')}
            className={styles.note}
            style={{ '--i': 2 } as CSSProperties}
          >
            <ul className="flex flex-col gap-1">
              {METRICS.map((metric) => (
                <li key={metric}>{t(`board.metrics.items.${metric}`)}</li>
              ))}
            </ul>
            <p className="mt-2">{t('board.metrics.why')}</p>
          </StickyNote>
        </div>
        <TimeRail label={t('rail')} className={styles.rail} />
      </Board>
    </SlideFrame>
  ),
});
