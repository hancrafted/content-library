import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { ChevronDown, ChevronRight, CircleCheck, CircleSlash, ShieldCheck, Square, Target } from 'lucide-react';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './stages-of-sale.module.css';

/*
 * three-column's frame and rhythm (title, caption, then the stages pushed
 * down), composed as a Scene so the stages hold checklists, a sample card and
 * a gate, which a prose paragraph cannot. The stages stack by default and form
 * one row from the flow's own 56rem width; the Leads checklists stay stacked
 * at every width. The arrows trace the route once the Slide is active; at
 * rest, off active and under reduced motion the finished route shows.
 */

const MICROSOFT = {
  slug: 'microsoft-qualify-lead',
  url: 'https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales',
};

const RESEARCH = ['company', 'problem', 'source', 'route', 'status', 'update'] as const;
const PROSPECT = ['role', 'problem', 'source', 'route', 'status'] as const;
const CONTACT = ['ready', 'routes', 'question', 'nextStep'] as const;
const STEPS = ['follow-up', 'meetings', 'proposal', 'negotiation'] as const;

const BOX = 'flex min-w-0 flex-1 flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground';
const STAGE_NAME = 'flex items-center gap-2 text-body font-semibold';

/** The drawn arrow into a stage: down while stacked, right in the row; decoration only. */
function Connector({ step }: { step: number }) {
  return (
    <span
      aria-hidden="true"
      data-step={step}
      className={`${styles.connector} flex shrink-0 flex-col items-center text-muted-foreground @4xl:flex-row`}
    >
      <span className={`${styles.rule} h-8 w-0.5 bg-border @4xl:h-0.5 @4xl:w-4`} />
      <ChevronDown aria-hidden="true" className="size-4 @4xl:hidden" />
      <ChevronRight aria-hidden="true" className="hidden size-4 @4xl:block" />
    </span>
  );
}

/** A checklist: a heading line, then unticked boxes, each item still to do. */
function Checklist({ title, items }: { title: ReactNode; items: ReactNode[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-body font-semibold text-pretty">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex min-w-0 items-start gap-2 text-body">
            <Square aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const stagesOfSale = slide({
  slug: 'stages-of-sale',
  messages: { en, de },
  notes: [
    { slug: 'qualification-is-a-separate-transition', target: 'gate', sources: [MICROSOFT] },
    { slug: 'do-not-erase-disqualified-leads', target: 'lost', sources: [MICROSOFT] },
  ],
  segments: [
    { slug: 'choose-who-might-have-the-problem' },
    { slug: 'build-and-maintain-the-list' },
    { slug: 'research-is-not-contact' },
    { slug: 'make-the-first-contact' },
    { slug: 'ask-for-one-next-step' },
    { slug: 'open-an-opportunity-with-evidence' },
    { slug: 'work-opportunities-deliberately' },
  ],
  content: ({ t, ref, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto pt-10 @container">
        <ol
          aria-label={t('flow.label')}
          className="flex flex-col @4xl:grid @4xl:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,1.3fr)_minmax(0,0.85fr)] @4xl:items-stretch"
        >
          <li data-target="leads" className={BOX}>
            <h4 className={STAGE_NAME}>{t('leads.title')}</h4>
            <div className="flex flex-col gap-4">
              <Checklist
                title={t('leads.research.title')}
                items={RESEARCH.map((key) => t(`leads.research.items.${key}`))}
              />
              <div
                data-target="prospect"
                className="flex min-w-0 flex-col rounded-lg border border-dashed border-border bg-muted p-3 text-caption"
              >
                <p className="text-muted-foreground">{t('leads.prospect.label')}</p>
                <p className="font-semibold text-foreground">{t('leads.prospect.company')}</p>
                {PROSPECT.map((key) => (
                  <p key={key} className="text-pretty text-muted-foreground">
                    {t(`leads.prospect.${key}`)}
                  </p>
                ))}
              </div>
              <Checklist
                title={t('leads.contact.title')}
                items={CONTACT.map((key) => t(`leads.contact.items.${key}`))}
              />
            </div>
          </li>
          <li className="flex min-w-0 flex-col items-stretch @4xl:flex-row @4xl:items-center">
            <Connector step={0} />
            <div
              {...target('gate')}
              className="flex min-w-0 flex-1 flex-col gap-2 rounded-xl border-2 border-dashed border-foreground/40 p-4"
            >
              <p className="flex items-center gap-2 text-body font-semibold">
                <ShieldCheck aria-hidden="true" className="size-5 shrink-0" />
                <span>{t.rich('gate.title', { ref: ref('qualification-is-a-separate-transition') })}</span>
              </p>
              <p className="text-body font-medium text-pretty">{t('gate.rule')}</p>
              <p className="text-caption text-pretty text-muted-foreground">{t('gate.notCrossing')}</p>
            </div>
          </li>
          <li className="flex min-w-0 flex-col items-stretch @4xl:flex-row @4xl:items-center">
            <Connector step={1} />
            <div data-target="opportunities" className={`${BOX} self-stretch border-2 border-primary`}>
              <h4 className={STAGE_NAME}>
                <Target aria-hidden="true" className="size-5 shrink-0 text-primary" />
                {t('opportunities.title')}
              </h4>
              <p className="text-body text-pretty">{t('opportunities.entry')}</p>
              <ol className="flex list-inside list-decimal flex-col gap-1.5 text-body font-medium">
                {STEPS.map((step) => (
                  <li key={step}>{t(`opportunities.steps.${step}`)}</li>
                ))}
              </ol>
              <p className="text-body text-pretty text-foreground">{t('opportunities.rule')}</p>
              <p className="text-caption text-pretty text-muted-foreground">{t('opportunities.example')}</p>
            </div>
          </li>
          <li className="flex min-w-0 flex-col items-stretch @4xl:flex-row @4xl:items-center">
            <Connector step={2} />
            <div data-target="closing" className={`${BOX} self-stretch`}>
              <h4 className={STAGE_NAME}>{t('closing.title')}</h4>
              <p data-tone="success" className="flex items-start gap-2 rounded-lg border border-border p-3 text-body">
                <CircleCheck aria-hidden="true" className={`${styles.won} mt-1 size-4 shrink-0`} />
                <span className="min-w-0 text-pretty">{t('closing.won')}</span>
              </p>
              <p {...target('lost')} className="flex items-start gap-2 rounded-lg border border-border p-3 text-body">
                <CircleSlash aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 text-pretty">
                  {t.rich('closing.lost', { ref: ref('do-not-erase-disqualified-leads') })}
                </span>
              </p>
              <p className="border-t border-border pt-3 text-body font-medium text-pretty text-foreground">
                {t('closing.footer')}
              </p>
            </div>
          </li>
        </ol>
      </div>
    </SlideFrame>
  ),
});
