import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { QueuePile, Rail } from '@/episodes/components/slide-shared/factory-line/factory-line';
import { FlowMotion } from '@/episodes/components/slide-shared/factory-line/flow-motion.client';
import {
  AiIcon,
  DocumentIcon,
  PersonIcon,
  type StationId,
} from '@/episodes/components/slide-shared/factory-line/icons';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const FAROS = { slug: 'faros-ai-productivity-paradox-2025', url: 'https://www.faros.ai/blog/ai-software-engineering' };
const DORA_TENSIONS = { slug: 'dora-balancing-ai-tensions', url: 'https://dora.dev/insights/balancing-ai-tensions/' };

const MEASURED = 'measured-the-load-moves-to-review';
const ENGINEERS = 'engineers-say-the-same';
const INFERRED = 'what-is-measured-and-what-is-inferred';

const STATIONS: readonly StationId[] = ['sales', 'design', 'build', 'review', 'delivery'];
/** The station the board zooms in on. */
const ZOOMED: StationId = 'review';
/** The pile in front of Review, stack by stack: 28 documents in all. */
const PILE = [2, 3, 4, 6, 6, 4, 3] as const;
/** How long each stack waits after the one before it as the documents slide in. */
const STACK_STAGGER_MS = 220;

/** The strip at the top that locates the zoomed station on the line: AI chips, the zoomed one ringed in `primary`. */
function Locator({
  title,
  label,
  stations,
}: {
  title: string;
  label: string;
  stations: { id: StationId; label: string }[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-card px-5 py-3 shadow-sm">
      <span className="text-caption text-muted-foreground uppercase">{title}</span>
      <ol aria-label={label} className="flex flex-1 flex-wrap items-center gap-2">
        {stations.map(({ id, label: name }, i) => {
          const zoomed = id === ZOOMED;
          return (
            <li key={id} className="flex items-center gap-2 @2xl:flex-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption font-semibold',
                  zoomed ? 'border-2 border-primary text-primary' : 'border border-ai/60 bg-card text-ai',
                )}
              >
                {!zoomed && <AiIcon />}
                {name}
              </span>
              {i < stations.length - 1 && (
                <span aria-hidden="true" className="hidden h-0.5 flex-1 bg-border @2xl:block" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** A figure over what it counts. */
function Stat({ figure, label }: { figure: string; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-subheading font-semibold">{figure}</span>
      <span className="text-caption text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * What happens with AI (Spec Option 2c): the line zoomed in on one station. A strip locates Review among the AI
 * stations; the board below is the bottleneck itself, documents arriving faster and bigger from the AI stations,
 * piling up in front of the human reviewer, and nothing more coming out. On the Slide's entrance, and on every hover
 * or focus of the pile, the documents slide in from the left and stack until the pile stands at 28.
 */
export const whatHappensWithAi = slide({
  slug: 'what-happens-with-ai',
  messages: { en, de },
  notes: [
    { slug: MEASURED, target: 'review-queue', sources: [FAROS] },
    { slug: ENGINEERS, target: 'scope', sources: [DORA_TENSIONS] },
    { slug: INFERRED, target: 'scope', sources: [FAROS] },
  ],
  segments: [{ slug: 'every-station-faster' }, { slug: 'moving-bottleneck' }],
  content: ({ t, target, marker }) => (
    <SlideFrame className="mt-10">
      <div className="flex flex-col gap-6 @container">
        <Locator
          title={t('locator.title')}
          label={t('locator.label')}
          stations={STATIONS.map((id) => ({ id, label: t(`stations.${id}`) }))}
        />
        <div className="flex flex-col gap-6 rounded-xl bg-muted p-5 @2xl:p-8">
          <div className="grid items-end gap-6 @3xl:grid-cols-12">
            <div className="flex flex-col gap-3 pb-2 @3xl:col-span-3">
              <span className="text-caption text-muted-foreground uppercase">{t('arriving.title')}</span>
              <div className="flex flex-wrap gap-x-6 gap-y-3 @3xl:flex-col">
                <Stat figure={t('arriving.tasks')} label={t('arriving.tasksLabel')} />
                <Stat figure={t('arriving.size')} label={t('arriving.sizeLabel')} />
              </div>
              <div className="flex items-end gap-1" aria-hidden="true">
                <DocumentIcon tone="crisp" className="h-9 w-8" />
                <DocumentIcon tone="crisp" className="h-12 w-10" />
                <svg viewBox="0 0 40 16" className="h-4 w-10">
                  <path
                    d="M2 8h32M28 3l6 5-6 5"
                    className="fill-none stroke-foreground"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div {...target('review-queue')} className="@3xl:col-span-5">
              <FlowMotion label={t('pile')}>
                <div className="flex items-end justify-center gap-1">
                  {PILE.map((count, stack) => (
                    <div key={stack} style={{ '--flow-delay': `${stack * STACK_STAGGER_MS}ms` } as CSSProperties}>
                      <QueuePile count={count} size="lg" />
                    </div>
                  ))}
                </div>
              </FlowMotion>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-(--warning) bg-card p-5 text-center shadow-md @3xl:col-span-4">
              <PersonIcon />
              <span className="text-body font-semibold">{t('review.title')}</span>
              <span className="text-subheading font-semibold text-(--warning)">{t('review.figure')}</span>
              <span className="text-caption text-muted-foreground">
                {t.rich('review.label', { marker: marker(MEASURED) })}
              </span>
              <span className="rounded-full bg-(--warning) px-2 text-caption font-semibold whitespace-nowrap text-warning-foreground">
                {t('review.waiting')}
              </span>
            </div>
          </div>
          <div className="grid items-center gap-6 @3xl:grid-cols-12">
            <Rail rollers={12} surface="card" className="h-3 @3xl:col-span-8" />
            <div className="flex items-center gap-2 @3xl:col-span-4">
              <span className="h-3 flex-1 rounded-full border border-border bg-card" />
              <span className="text-caption text-muted-foreground">{t('out')}</span>
            </div>
          </div>
        </div>
        <p {...target('scope')} className="text-caption text-muted-foreground">
          {t.rich('scope', { spent: marker(ENGINEERS), inferred: marker(INFERRED) })}
        </p>
      </div>
    </SlideFrame>
  ),
});
