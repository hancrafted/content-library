import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PipelineVsFunnel } from './pipeline-vs-funnel';
import styles from './what-is-a-sales-pipeline.module.css';

/*
 * The three-column family composed as a Scene: the kit's title and caption,
 * three question notes in the three-column rhythm, then the pipeline beside
 * the funnel and a definitions footer, which the three-column layout has no
 * slot for. The notes settle in when the Slide becomes active.
 */

const QUESTIONS = ['volume', 'offering', 'efficiency'] as const;
const STAGES = ['leads', 'opportunities', 'won'] as const;

export const whatIsASalesPipeline = slide({
  slug: 'what-is-a-sales-pipeline',
  messages: { en, de },
  notes: [
    {
      slug: 'default-report-populations-differ',
      target: 'definitions',
      sources: [
        {
          slug: 'pipedrive-deal-conversion',
          url: 'https://support.pipedrive.com/en/article/insights-reports-deal-conversion',
        },
        {
          slug: 'hubspot-custom-funnel',
          url: 'https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports',
        },
      ],
    },
    {
      slug: 'forecast-weights-are-settings',
      target: 'offering',
      sources: [
        {
          slug: 'hubspot-pipelines',
          url: 'https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines',
        },
      ],
    },
  ],
  segments: [
    { slug: 'records-not-a-wish-list' },
    { slug: 'count-the-flow' },
    { slug: 'measure-conversion-with-a-denominator' },
    { slug: 'conversion-raises-questions-about-the-offer' },
    { slug: 'measure-the-sales-cycle-explicitly' },
    { slug: 'efficiency-is-not-speed-at-any-cost' },
  ],
  content: ({ t, ref, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className={cn(styles.scene, 'mt-auto flex flex-col gap-8 pt-10')}>
        <ul className={cn(styles.notes, 'grid gap-8')}>
          {QUESTIONS.map((question) => (
            <li
              key={question}
              {...(question === 'offering' ? target('offering') : { 'data-target': question })}
              className={cn(styles.note, 'flex flex-col gap-1 rounded-md border border-border bg-card p-4')}
            >
              <span className="text-body font-semibold text-foreground">
                {t.rich(`questions.${question}.label`, { ref: ref('forecast-weights-are-settings') })}
              </span>
              <span className="text-caption text-muted-foreground">{t(`questions.${question}.question`)}</span>
            </li>
          ))}
        </ul>
        <PipelineVsFunnel
          pipelineLabel={t('pipeline.label')}
          funnelLabel={t('funnel.label')}
          stages={STAGES.map((stage) => ({ slug: stage, label: t(`stages.${stage}`) }))}
        />
        <p {...target('definitions')} className="border-l-2 border-primary pl-3 text-body text-foreground">
          {t.rich('definitions', { ref: ref('default-report-populations-differ') })}
        </p>
      </div>
    </SlideFrame>
  ),
});
