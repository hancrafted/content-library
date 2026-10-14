import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { ArrowRight, Banknote, ChevronDown, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './stages-of-after-sale.module.css';

/*
 * three-column's frame and rhythm (title, caption, then the stages pushed
 * down), composed as a Scene so a conditional return path and a payment-terms
 * marker can sit under the three stages. The stages stack by default and form
 * one row from the flow's own 48rem width; the return path and the payment
 * marker always span the full width beneath them. The arrows draw once the
 * Slide is active; at rest, off active and under reduced motion the finished
 * flow shows.
 */

/** The drawn arrow into a stage: down while stacked, right in the row; decoration only. */
function Connector({ step }: { step: number }) {
  return (
    <span
      aria-hidden="true"
      data-step={step}
      className={`${styles.connector} flex shrink-0 flex-col items-center text-muted-foreground @3xl:flex-row`}
    >
      <span className={`${styles.rule} h-8 w-0.5 bg-border @3xl:h-0.5 @3xl:w-2`} />
      <ChevronDown aria-hidden="true" className="size-4 @3xl:hidden" />
      <ChevronRight aria-hidden="true" className="hidden size-4 @3xl:block" />
    </span>
  );
}

/** One stage: its name, its sticky note and the fictional Birch line. */
function Stage(props: { name: ReactNode; note: ReactNode; example: ReactNode; target: string }) {
  return (
    <div
      data-target={props.target}
      className="flex min-w-0 flex-1 flex-col gap-3 self-stretch rounded-xl border border-border bg-card p-5 text-card-foreground"
    >
      <h4 className="text-body font-semibold text-pretty">{props.name}</h4>
      <p className="rounded-lg bg-muted p-3 text-body font-medium text-pretty text-foreground">{props.note}</p>
      <p className="text-caption text-pretty text-muted-foreground">{props.example}</p>
    </div>
  );
}

const LINKED = 'flex min-w-0 flex-col items-stretch @3xl:flex-row @3xl:items-center';

export const stagesOfAfterSale = slide({
  slug: 'stages-of-after-sale',
  messages: { en, de },
  notes: [
    {
      slug: 'relationship-performance-is-broader-than-trust',
      target: 'customer-success',
      sources: [{ slug: 'palmatier-relationship-marketing', url: 'https://doi.org/10.1509/jmkg.70.4.136' }],
    },
    {
      slug: 'doing-work-by-hand-can-reveal-process-details',
      target: 'production',
      sources: [{ slug: 'graham-do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' }],
    },
  ],
  segments: [
    { slug: 'a-win-starts-another-responsibility' },
    { slug: 'delivery-must-reach-the-buyer' },
    { slug: 'ask-whether-the-outcome-happened' },
    { slug: 'recurring-is-conditional' },
  ],
  content: ({ t, ref, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto flex flex-col gap-6 pt-10 @container">
        <ol aria-label={t('flow.label')} className="flex flex-col @3xl:grid @3xl:grid-cols-3">
          <li className="flex min-w-0">
            <Stage
              target="production"
              name={t('production.title')}
              note={t.rich('production.note', { ref: ref('doing-work-by-hand-can-reveal-process-details') })}
              example={t('production.example')}
            />
          </li>
          <li className={LINKED}>
            <Connector step={0} />
            <Stage
              target="delivery"
              name={t('delivery.title')}
              note={t('delivery.note')}
              example={t('delivery.example')}
            />
          </li>
          <li className={LINKED}>
            <Connector step={1} />
            <Stage
              target="customer-success"
              name={t('success.title')}
              note={t.rich('success.note', { ref: ref('relationship-performance-is-broader-than-trust') })}
              example={t('success.example')}
            />
          </li>
        </ol>
        <div
          data-target="return"
          className="flex min-w-0 flex-col gap-2 rounded-xl border border-dashed border-border p-4"
        >
          <div className="flex min-w-0 flex-col gap-2 @3xl:flex-row-reverse @3xl:items-center @3xl:gap-3">
            <p className="min-w-0 text-body font-medium text-pretty">{t('return.label')}</p>
            <span aria-hidden="true" className="hidden min-w-8 flex-1 items-center text-muted-foreground @3xl:flex">
              <ChevronLeft aria-hidden="true" className="size-4 shrink-0" />
              <span className="flex-1 border-t border-dashed border-border" />
            </span>
            <p className="flex shrink-0 items-center gap-2 text-body font-semibold">
              <Undo2 aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground @3xl:hidden" />
              <span>{t('return.target')}</span>
            </p>
          </div>
          <p className="text-caption text-pretty text-muted-foreground">{t('return.condition')}</p>
        </div>
        <div
          data-target="payment"
          className="flex min-w-0 flex-col gap-3 rounded-xl border-2 border-primary bg-card p-4"
        >
          <p className="flex items-start gap-2 text-body font-semibold text-pretty">
            <Banknote aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
            <span className="min-w-0">{t('payment.label')}</span>
          </p>
          <div className="flex flex-col gap-1">
            <div aria-hidden="true" className="relative flex h-3 items-center justify-between">
              <span className="absolute inset-x-1.5 top-1/2 h-0.5 -translate-y-1/2 bg-primary" />
              <span className="relative size-3 rounded-full bg-primary" />
              <span className="relative size-3 rounded-full bg-primary" />
              <span className="relative size-3 rounded-full bg-primary" />
            </div>
            <ul className="grid grid-cols-3 gap-2 text-caption text-foreground">
              <li className="min-w-0 text-pretty">{t('payment.before')}</li>
              <li className="min-w-0 text-center text-pretty">{t('payment.during')}</li>
              <li className="min-w-0 text-right text-pretty">{t('payment.after')}</li>
            </ul>
          </div>
        </div>
      </div>
    </SlideFrame>
  ),
});
