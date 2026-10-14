import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RampRow, ROW_TEMPLATE } from './ramp-row';
import { RampStamp } from './ramp-stamp';

const ROWS = ['preparation', 'unknown-market', 'unknown-metrics'] as const;

// A Scene on `@container`: every layout switch reads the Foreground width, never the viewport.
export const whyItTakesTimeToRampUp = slide({
  slug: 'why-it-takes-time-to-ramp-up',
  messages: { en, de },
  notes: [
    {
      slug: 'metrics-lag-by-one-cycle',
      target: 'unknown-metrics',
      sources: [
        {
          slug: 'roberge-science-of-scaling',
          url: 'https://f.hubspotusercontent10.net/hubfs/6575667/Stage%202s%20Science%20of%20Scaling.pdf',
        },
      ],
    },
    {
      slug: 'scaling-too-early-burns-cash',
      target: 'preparation',
      sources: [
        {
          slug: 'blank-marketing-problem',
          url: 'https://steveblank.com/2010/02/11/it-must-be-a-marketing-problem/',
        },
      ],
    },
    {
      slug: 'customers-do-not-come-to-you',
      target: 'unknown-market',
      sources: [{ slug: 'graham-do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' }],
    },
  ],
  segments: [
    { slug: 'preparation' },
    { slug: 'unknown-market' },
    { slug: 'unknown-metrics' },
    { slug: 'so-start-early' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame className="@container">
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div
        aria-hidden="true"
        className={cn('mt-10 hidden pb-3 text-caption font-medium text-muted-foreground @md:grid', ROW_TEMPLATE)}
      >
        <span className="hidden @3xl:block" />
        <span>{t('headers.lack')}</span>
        <span />
        <span>{t('headers.unlock')}</span>
      </div>
      <ol className="mt-10 divide-y divide-border border-y border-border @md:mt-0">
        {ROWS.map((row, index) => (
          <RampRow
            key={row}
            {...target(row)}
            index={index + 1}
            title={t(`rows.${row}.title`)}
            lack={t(`rows.${row}.lack`)}
            unlock={t(`rows.${row}.unlock`)}
            lackHeader={t('headers.lack')}
            unlockHeader={t('headers.unlock')}
          />
        ))}
      </ol>
      <RampStamp>{t('stamp')}</RampStamp>
    </SlideFrame>
  ),
});
