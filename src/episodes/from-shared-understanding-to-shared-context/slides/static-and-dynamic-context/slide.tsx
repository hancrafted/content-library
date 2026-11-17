import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BikeBench } from '@/episodes/components/slide-shared/bike-bench/bike-bench';
import type { ReactNode } from 'react';
import { BenchLegend } from './bench-legend';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};

function Half(props: {
  time: string;
  label: string;
  kind: ReactNode;
  bench: ReactNode;
  rows: readonly { thing: string; name: string }[];
  target?: { 'data-target': string };
}) {
  return (
    <div
      {...props.target}
      className="card-hover card-hover--raise flex flex-col gap-3 rounded-xl bg-muted p-5 shadow-md"
    >
      <p className="flex items-baseline justify-between gap-3">
        <span className="text-body font-semibold">
          {props.time} · {props.label}
        </span>
        <span className="inline-flex items-center gap-1 text-caption text-muted-foreground uppercase">
          {props.kind}
        </span>
      </p>
      <div className="rounded-lg bg-card p-2">{props.bench}</div>
      <BenchLegend rows={props.rows} />
    </div>
  );
}

export const staticAndDynamicContext = slide({
  slug: 'static-and-dynamic-context',
  messages: { en, de },
  notes: [{ slug: 'dynamic-means-loaded-at-run-time', target: 'during', sources: [ANTHROPIC] }],
  segments: [{ slug: 'before-the-shift' }, { slug: 'during-the-shift' }, { slug: 'why-it-matters' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="grid gap-6 @3xl:grid-cols-2">
        <Half
          time={t('before.time')}
          label={t('before.label')}
          kind={t('before.kind')}
          bench={<BikeBench label={t('before.drawing')} />}
          rows={(['memory', 'system', 'initial'] as const).map((row) => ({
            thing: t(`rows.before.${row}.thing`),
            name: t(`rows.before.${row}.name`),
          }))}
        />
        <Half
          target={target('during')}
          time={t('during.time')}
          label={t('during.label')}
          kind={
            <>
              {t('during.kind')}
              <Marker note="dynamic-means-loaded-at-run-time" placement="beside" />
            </>
          }
          bench={<BikeBench label={t('during.drawing')} arrivals />}
          rows={(['retrieval', 'web', 'folder'] as const).map((row) => ({
            thing: t(`rows.during.${row}.thing`),
            name: t(`rows.during.${row}.name`),
          }))}
        />
      </div>
    </SlideFrame>
  ),
});
