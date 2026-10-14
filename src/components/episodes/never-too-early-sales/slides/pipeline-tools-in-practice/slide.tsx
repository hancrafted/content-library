import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { DealBoard } from './deal-board';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './pipeline-tools-in-practice.module.css';

/*
 * basic-page's frame composed as a Scene: a fictional kanban board, which
 * basic-page's prose paragraph cannot hold, then Birch's dated record and a
 * review checklist. Cards settle into their own columns when the Slide
 * becomes active; every record reads at rest.
 */

const COLUMNS = [
  { slug: 'leads', cards: ['alder'] },
  { slug: 'opportunities', cards: ['birch'] },
  { slug: 'closing', cards: ['cedar'] },
  { slug: 'won', outcome: 'won', cards: ['delta'] },
  { slug: 'lost', outcome: 'lost', cards: ['elm'] },
] as const;
const CURRENT = 'birch';
const DATES = ['first-contact', 'opportunity-entered', 'last-contact', 'next-step', 'receipt-date'] as const;
const CHECKLIST = ['update-after-contact', 'review-weekly', 'keep-separate'] as const;

export const pipelineToolsInPractice = slide({
  slug: 'pipeline-tools-in-practice',
  messages: { en, de },
  notes: [
    {
      slug: 'stage-evidence-can-be-made-explicit',
      target: 'board',
      sources: [
        {
          slug: 'hubspot-pipelines',
          url: 'https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines',
        },
      ],
    },
    {
      slug: 'qualification-can-leave-an-audit-trail',
      target: 'lost',
      sources: [
        {
          slug: 'dynamics-qualify-lead',
          url: 'https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales',
        },
      ],
    },
  ],
  segments: [
    { slug: 'start-with-a-board-or-spreadsheet' },
    { slug: 'give-each-card-a-next-action' },
    { slug: 'keep-dates-for-measurement' },
    { slug: 'review-stuck-work' },
    { slug: 'measure-without-hiding-open-deals' },
    { slug: 'maintain-the-source-list-too' },
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
        <DealBoard
          label={t('disclaimer')}
          columns={COLUMNS.map((column) => ({
            slug: column.slug,
            title: t(`columns.${column.slug}`),
            outcome: 'outcome' in column ? column.outcome : undefined,
            cards: column.cards.map((card) => ({
              slug: card,
              name: t(`cards.${card}.name`),
              status: t(`cards.${card}.status`),
              current: card === CURRENT,
            })),
          }))}
        />
        <dl data-target="birch-dates" className={cn(styles.dates, 'flex flex-wrap gap-x-2 gap-y-1 text-caption')}>
          <dt className="font-semibold text-foreground">{t(`cards.${CURRENT}.name`)}</dt>
          {DATES.map((item) => (
            <dd
              key={item}
              className={cn(styles.date, item === 'receipt-date' ? 'text-muted-foreground' : 'text-foreground')}
            >
              {t(`detail.items.${item}`)}
            </dd>
          ))}
        </dl>
        <ul data-target="checklist" className="flex flex-wrap gap-x-6 gap-y-2">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2 text-caption text-foreground">
              <Check aria-hidden="true" className="size-4 text-muted-foreground" />
              {t(`checklist.${item}`)}
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  ),
});
