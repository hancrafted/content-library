import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import { EntryFlow } from './entry-flow';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './marketing-feeds-the-pipeline.module.css';

/*
 * basic-page's frame composed as a Scene: an original attention-to-opportunity
 * flow, which basic-page's prose paragraph cannot hold, then Birch's handoff
 * card and a footer. Only the feed lines trace in when the Slide becomes
 * active; the gate, branch and handoff always show.
 */

const ROUTES = ['article', 'event', 'introduction'] as const;

export const marketingFeedsThePipeline = slide({
  slug: 'marketing-feeds-the-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'marketing-and-sales-qualification-are-distinct-definitions',
      target: 'gate',
      sources: [
        { slug: 'hubspot-lifecycle-stages', url: 'https://knowledge.hubspot.com/records/use-lifecycle-stages' },
      ],
    },
    {
      slug: 'entry-routes-are-broader-than-one-funnel',
      target: 'routes',
      sources: [
        {
          slug: 'dynamics-sales-process',
          url: 'https://learn.microsoft.com/en-us/dynamics365/sales/nurture-sales-from-lead-order-sales',
        },
      ],
    },
  ],
  segments: [
    { slug: 'attention-needs-an-entry-route' },
    { slug: 'choose-where-marketing-hands-over' },
    { slug: 'feed-the-list-then-qualify' },
    { slug: 'more-volume-is-not-a-guarantee' },
    { slug: 'close-the-feedback-loop' },
  ],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className={cn(styles.scene, 'mt-auto flex flex-col gap-6 pt-10')}>
        <EntryFlow
          attention={t('flow.attention')}
          viewers={t('viewers')}
          pipeline={t('pipeline')}
          lead={t('flow.lead')}
          opportunity={t('flow.opportunity')}
          gate={t('gate')}
          branch={t('branch')}
          routes={ROUTES.map((route) => ({ slug: route, label: t(`routes.${route}`) }))}
        />
        <p
          data-target="handoff"
          className="rounded-md border border-l-2 border-border border-l-primary bg-card p-4 text-body text-foreground"
        >
          {t('handoff')}
        </p>
        <p data-target="footer" className="text-body text-foreground">
          {t('footer')}
        </p>
      </div>
    </SlideFrame>
  ),
});
