import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AiIcon, DocumentIcon, PersonIcon } from '@/episodes/components/slide-shared/factory-line/icons';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

const BROOKS = { slug: 'brooks-no-silver-bullet', url: 'https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html' };
const REWORK = {
  slug: 'unclear-requirements-cause-rework',
  url: 'https://github.com/hancrafted/content-library/blob/main/docs/llm-wiki/research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md',
};

/** The interview on the defining half: the AI asks twice, the rider answers once. */
const EXCHANGE = [
  { slug: 'q1', who: 'ai' },
  { slug: 'q2', who: 'ai' },
  { slug: 'a1', who: 'human' },
] as const;

/** The AI stations of the building half and how many documents each has turned out. */
const STATIONS = [
  { slug: 'frame', load: 6 },
  { slug: 'assemble', load: 7 },
  { slug: 'test', load: 6 },
] as const;

/** One half of the split: its mono index, its name in big type, what it aims at, then its picture. */
function Half({
  index,
  dot,
  name,
  aim,
  className,
  children,
}: {
  index: string;
  dot: string;
  name: string;
  aim: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-6 py-8 @3xl:py-10', className)}>
      <span className="flex items-center gap-3 font-mono text-caption text-muted-foreground uppercase">
        <span aria-hidden="true" className={cn('size-2 rounded-full', dot)} />
        {index}
      </span>
      <p className="text-heading leading-tight font-semibold">{name}</p>
      <p className="text-body text-muted-foreground">{aim}</p>
      {children}
    </div>
  );
}

/**
 * "Defining and building" (Spec Option 5b): a copy of the `grid-1x2` Master slide's facing halves, hairline and mono
 * index, each half a big-type name over a picture. Defining is an AI asking the rider questions, foreshadowing meta
 * prompting; building is three AI stations with full document queues. Two fact chips under the split carry the
 * evidence. Keeps `motion: none`.
 */
export const definingAndBuilding = slide({
  slug: 'defining-and-building',
  messages: { en, de },
  notes: [
    { slug: 'clients-cannot-state-it-up-front', target: 'upfront', sources: [BROOKS] },
    { slug: 'practitioners-name-it-too', target: 'survey', sources: [REWORK] },
  ],
  segments: [{ slug: 'two-halves' }, { slug: 'foreshadow' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="grid grid-cols-1 divide-y divide-border border-y border-border @3xl:grid-cols-2 @3xl:divide-x @3xl:divide-y-0">
        <Half index="01" dot="bg-primary" name={t('defining.name')} aim={t('defining.aim')} className="@3xl:pr-12">
          <ol className="flex flex-col gap-3">
            {EXCHANGE.map(({ slug, who }) =>
              who === 'ai' ? (
                <li key={slug} data-exchange="ai" className="flex items-center gap-3">
                  <AiIcon className="size-8 text-foreground" />
                  <p className="rounded-2xl bg-ai/15 px-4 py-2 text-body">{t(`defining.exchange.${slug}`)}</p>
                </li>
              ) : (
                <li key={slug} data-exchange="human" className="flex items-center justify-end gap-3">
                  <p className="rounded-2xl border-2 border-human bg-card px-4 py-2 text-body">
                    {t(`defining.exchange.${slug}`)}
                  </p>
                  <PersonIcon className="size-8" />
                </li>
              ),
            )}
          </ol>
          <p className="-rotate-1 self-start rounded-2xl border-2 border-primary bg-card px-5 py-3 text-body font-medium shadow-md">
            {t('defining.bubble')}
          </p>
        </Half>
        <Half index="02" dot="bg-ai" name={t('building.name')} aim={t('building.aim')} className="@3xl:pl-12">
          <div className="flex flex-col gap-3 rounded-xl bg-muted p-4 @3xl:p-5">
            {STATIONS.map(({ slug, load }) => (
              <div key={slug} data-ai-station className="flex items-center gap-3">
                <p className="w-20 shrink-0 text-caption font-medium @3xl:w-24">{t(`building.stations.${slug}`)}</p>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 @3xl:gap-2">
                  {Array.from({ length: load }, (_, document) => (
                    <span key={document} data-queued-document className="contents">
                      <DocumentIcon tone="ai" className="size-5 @3xl:size-6" />
                    </span>
                  ))}
                </span>
                <AiIcon className="size-6 text-foreground" />
              </div>
            ))}
            <p className="text-caption text-muted-foreground">{t('building.footnote')}</p>
          </div>
        </Half>
      </div>
      <p data-station-mapping className="text-caption text-muted-foreground">
        {t('building.mapping')}
      </p>
      <div className="grid gap-4 @3xl:grid-cols-2">
        {(['upfront', 'survey'] as const).map((fact) => (
          <p
            key={fact}
            data-fact
            {...target(fact)}
            className="rounded-xl border border-border bg-card p-4 text-caption"
          >
            <span className="text-body font-semibold">{t(`facts.${fact}.lead`)}</span> {t(`facts.${fact}.text`)}
            {' '}
            <Marker
              note={fact === 'upfront' ? 'clients-cannot-state-it-up-front' : 'practitioners-name-it-too'}
              placement="beside"
              className="inline-grid align-middle"
            />
          </p>
        ))}
      </div>
    </SlideFrame>
  ),
});
