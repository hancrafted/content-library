import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { FactoryDial } from '@/episodes/components/slide-shared/factory-line/factory-dial';
import {
  FactoryLine,
  type Station,
  type StationId,
} from '@/episodes/components/slide-shared/factory-line/factory-line';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { TireSwingCartoon } from './tire-swing-cartoon';

const DORA_2025 = { slug: 'dora-2025-overview', url: 'https://dora.dev/research/2025/dora-report/' };
const OUT_OF_BALANCE = 'why-the-line-gets-out-of-balance';

const STATIONS: readonly StationId[] = ['sales', 'design', 'build', 'review', 'delivery'];
/** Where the cranked line jams, and how many documents wait there. */
const JAMS: Partial<Record<StationId, number>> = { design: 4, review: 5 };
/** The dials cranked up, from 0 to 1, as the mock sets them. */
const DIALS = [
  { slug: 'efficiency', value: 0.88 },
  { slug: 'effectiveness', value: 0.8 },
  { slug: 'multiplication', value: 0.92 },
] as const;

/** A card on the right of the poster: its title and rate pill over a line. */
function LineCard({
  title,
  rate,
  tone,
  children,
  ...target
}: {
  title: ReactNode;
  rate: string;
  tone: 'balanced' | 'reality';
  children: ReactNode;
  'data-target'?: string;
}) {
  const reality = tone === 'reality';
  return (
    <div
      {...target}
      className={`flex flex-col gap-3 rounded-xl bg-card p-5 shadow-md ${reality ? 'border-2 border-(--warning)' : 'border border-border'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-body font-semibold">{title}</span>
        <span
          className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-caption font-semibold text-foreground ${reality ? 'bg-(--warning)/20' : 'bg-(--success)/15'}`}
        >
          {rate}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * What the customer really wanted (Spec Option 1c): the tire swing cartoon as the Hook's poster on the left, answered
 * on the right by the factory line in balance and the same line with its dials cranked up, where documents queue in
 * front of Design and Review. Option 1c overrules the motion to none: the two lines sit side by side at rest.
 */
export const whatTheCustomerReallyWanted = slide({
  slug: 'what-the-customer-really-wanted',
  messages: { en, de },
  notes: [{ slug: OUT_OF_BALANCE, target: 'reality', sources: [DORA_2025] }],
  segments: [{ slug: 'the-hook' }, { slug: 'cartoon-to-balanced-line' }, { slug: 'reality' }],
  content: ({ t, target, marker }) => {
    const stations = (jams: boolean): Station[] =>
      STATIONS.map((id) => {
        const queue = jams ? (JAMS[id] ?? 0) : 0;
        return { id, label: t(`stations.${id}`), queue, state: queue > 0 ? 'jam' : 'ok' };
      });
    return (
      <SlideFrame className="mt-10">
        <div className="@container">
          <div className="grid gap-8 @5xl:grid-cols-12">
            <div className="@5xl:col-span-4">
              <TireSwingCartoon
                heading={t('cartoonLabel')}
                label={t('cartoon.label')}
                captions={{
                  explained: t('cartoon.explained'),
                  understood: t('cartoon.understood'),
                  built: t('cartoon.built'),
                  wanted: t('cartoon.wanted'),
                }}
              />
            </div>
            <div className="flex flex-col justify-between gap-6 @5xl:col-span-8">
              <LineCard title={t('balanced.title')} rate={t('balanced.rate')} tone="balanced">
                <FactoryLine label={t('balanced.line')} stations={stations(false)} beltDocs={1} />
              </LineCard>
              <LineCard
                {...target('reality')}
                title={t.rich('reality.title', { marker: marker(OUT_OF_BALANCE) })}
                rate={t('reality.rate')}
                tone="reality"
              >
                <FactoryLine label={t('reality.line')} stations={stations(true)} beltDocs={1} outputDocs={0} />
                <div className="flex flex-wrap justify-end gap-4">
                  {DIALS.map(({ slug, value }) => (
                    <FactoryDial key={slug} label={t(`dials.${slug}`)} value={value} tone="warning" />
                  ))}
                </div>
              </LineCard>
            </div>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
