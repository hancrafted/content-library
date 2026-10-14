import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import { CountFunnel } from './count-funnel';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './pipeline-by-the-numbers.module.css';
import { TimeRail } from './time-rail';

/*
 * basic-page's frame composed as a Scene: a count funnel and, under a
 * divider, a time rail, which basic-page's prose paragraph cannot hold. The
 * counts and the time never share an axis or a scale; every number is a
 * written label. Only lines trace in when the Slide becomes active.
 */

const BANDS = ['leads', 'opportunities', 'won'] as const;
const RATIOS = ['leads-to-opportunities', 'opportunities-to-deals'] as const;
const RAIL = ['lead-work', 'opportunity-work', 'closing'] as const;

export const pipelineByTheNumbers = slide({
  slug: 'pipeline-by-the-numbers',
  messages: { en, de },
  notes: [
    {
      slug: 'real-reports-may-skip-gates',
      target: 'condition',
      sources: [
        {
          slug: 'hubspot-custom-funnel',
          url: 'https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports',
        },
        {
          slug: 'pipedrive-deal-conversion',
          url: 'https://support.pipedrive.com/en/article/insights-reports-deal-conversion',
        },
      ],
    },
    {
      slug: 'buying-groups-vary-without-a-measured-clock',
      target: 'opportunity-work',
      sources: [{ slug: 'johnston-bonoma-buying-center', url: 'https://doi.org/10.1177/002224298104500312' }],
    },
    {
      slug: 'public-procurement-is-a-bounded-special-case',
      target: 'rail-label',
      sources: [
        {
          slug: 'eu-directive-2014-24',
          url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32014L0024',
        },
      ],
    },
  ],
  segments: [
    { slug: 'read-the-example-as-inputs' },
    { slug: 'three-leads-for-one-opportunity' },
    { slug: 'nine-opportunities-for-one-win' },
    { slug: 'multiply-only-this-consistent-path' },
    { slug: 'add-the-time-on-a-different-rail' },
    { slug: 'the-buyer-has-work-too' },
    { slug: 'the-bank-deadline-comes-later-in-the-chain' },
  ],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className={cn(styles.scene, 'mt-auto flex flex-col gap-6 pt-10')}>
        <p
          data-disclaimer
          className="self-start rounded-md border border-border px-3 py-1 text-caption text-muted-foreground"
        >
          {t('disclaimer')}
        </p>
        <CountFunnel
          label={t('funnel.label')}
          bands={BANDS.map((band) => ({ slug: band, count: t(`funnel.bands.${band}`) }))}
          ratios={RATIOS.map((ratio) => t(`funnel.ratios.${ratio}`))}
          overall={t('funnel.overall')}
          condition={t('funnel.condition')}
        />
        <hr className="border-border" />
        <TimeRail
          stages={RAIL.map((stage) => ({ slug: stage, label: t(`rail.stages.${stage}`) }))}
          total={t('rail.total')}
          label={t('rail.label')}
          cashNote={t('rail.cashNote')}
        />
      </div>
    </SlideFrame>
  ),
});
