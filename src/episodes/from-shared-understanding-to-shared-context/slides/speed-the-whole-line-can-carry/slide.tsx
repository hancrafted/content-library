import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BikeBench } from '@/episodes/components/slide-shared/bike-bench/bike-bench';
import { FactoryLine, type StationId } from '@/episodes/components/slide-shared/factory-line/factory-line';
import { FlowMotion } from '@/episodes/components/slide-shared/factory-line/flow-motion.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PaceBars } from './pace-bars';

const DORA_2025 = { slug: 'dora-2025-overview', url: 'https://dora.dev/research/2025/dora-report/' };
const FROM_THE_SYSTEM = 'returns-come-from-the-system';

const STATIONS: readonly StationId[] = ['sales', 'design', 'build', 'review', 'delivery'];
/** Every station's pace in documents a day: 10 before AI, 20 with it, the same all along the line. */
const PACE = { before: 10, after: 20 } as const;
/** The documents wait for the bars to grow before they ride in. */
const BARS_GROW_MS = 700;

/**
 * Speed the whole line can carry (Spec Option 3b): balance drawn as a chart, five equal bars at the new pace under
 * one line speed, each over the outline of its old pace, above the line running at that pace, every queue holding
 * one document, the customer's request in and the tire swing they wanted out. On the Slide's entrance, and on every
 * hover or focus of the board, the bars grow from the old level to the new one together, then the belts run until
 * each queue holds one. Last, one station up close: the shared bike bench, so the Episode's station is set up before
 * Slide 6 needs it.
 */
export const speedTheWholeLineCanCarry = slide({
  slug: 'speed-the-whole-line-can-carry',
  messages: { en, de },
  notes: [{ slug: FROM_THE_SYSTEM, target: 'takeaway', sources: [DORA_2025] }],
  segments: [{ slug: 'one-fast-station-is-not-the-goal' }, { slug: 'bridge' }],
  content: ({ t, target, marker }) => (
    <SlideFrame className="mt-10">
      <div className="flex flex-col gap-6 @container">
        <FlowMotion label={t('chart.label')} delay={BARS_GROW_MS}>
          <div className="flex flex-col gap-6 rounded-xl bg-muted p-5 @2xl:p-8">
            <PaceBars
              paces={STATIONS.map((id) => ({ id, label: t(`stations.${id}`), ...PACE }))}
              axis={t('chart.axis')}
              before={t('chart.before')}
              after={t('chart.after')}
              unit={t('pace')}
              label={t('chart.stations')}
            />
            <FactoryLine
              label={t('line')}
              stations={STATIONS.map((id) => ({ id, label: t(`stations.${id}`), queue: 1, state: 'ok', ai: true }))}
              beltDocs={2}
              customer={{ request: t('request'), result: t('result'), label: t('customer') }}
              aiLabel={t('ai')}
            />
          </div>
        </FlowMotion>
        <p {...target('takeaway')} className="text-body">
          <span className="font-semibold">{t('takeaway.lead')}</span>{' '}
          <span className="text-muted-foreground">{t.rich('takeaway.text', { marker: marker(FROM_THE_SYSTEM) })}</span>
        </p>
        {/* The last step: one station up close, the bike bench Slides 9 to 14 return to (Han's feedback). */}
        <figure
          data-bench-zoom
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 @2xl:max-w-2xl"
        >
          <figcaption className="text-body font-semibold">{t('bench.caption')}</figcaption>
          <BikeBench label={t('bench.label')} className="w-full" />
        </figure>
      </div>
    </SlideFrame>
  ),
});
