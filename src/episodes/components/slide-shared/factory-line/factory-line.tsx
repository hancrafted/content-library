import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import styles from './factory-line.module.css';
import { AiIcon, DocumentIcon, PersonIcon, StationIcon, type DocumentTone, type StationId } from './icons';

export type { DocumentTone, StationId } from './icons';

export interface Station {
  readonly id: StationId;
  readonly label: string;
  readonly queue: number;
  readonly state: 'ok' | 'jam';
  readonly ai?: boolean;
}

export interface LineCustomer {
  readonly request: string;
  readonly result: string;
  readonly label: string;
}

export interface FactoryLineProps {
  readonly label: string;
  readonly stations: readonly Station[];
  readonly beltDocs: number;
  readonly outputDocs?: number;
  readonly docTone?: Exclude<DocumentTone, 'queued'>;
  readonly customer?: LineCustomer;
  readonly aiLabel?: string;
}

const nth = (i: number) => ({ '--i': i }) as CSSProperties;

export function Rail({
  rollers = 3,
  surface = 'muted',
  className,
}: {
  rollers?: number;
  surface?: 'muted' | 'card';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-full border border-border',
        surface === 'muted' ? 'bg-muted px-1' : 'bg-card px-2',
        className,
      )}
    >
      {Array.from({ length: rollers }, (_, i) => (
        <span key={i} className="size-1.5 rounded-full bg-muted-foreground/40" />
      ))}
    </div>
  );
}

function stacked(i: number, size: 'sm' | 'lg'): string {
  if (size === 'lg') return i > 0 ? '-mt-3' : '';
  return cn(i > 0 && '-mb-3', i % 2 === 0 ? '-rotate-2' : 'rotate-3');
}

export function QueuePile({
  count,
  tone = 'queued',
  size = 'sm',
}: {
  count: number;
  tone?: DocumentTone;
  size?: 'sm' | 'lg';
}) {
  return (
    <div className={cn('flex items-center', size === 'sm' ? 'flex-col-reverse' : 'flex-col')}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} data-queued="" data-tone={tone} style={nth(i)} className={cn(styles.pileDoc, stacked(i, size))}>
          <DocumentIcon tone={tone} className={size === 'sm' ? 'h-6 w-5' : 'h-9 w-8'} />
        </div>
      ))}
    </div>
  );
}

function Belt({
  docs,
  docTone,
  queue,
}: {
  docs: number;
  docTone: DocumentTone;
  queue?: { for: StationId; count: number; tone: DocumentTone };
}) {
  return (
    <li data-belt="" aria-hidden="true" className={styles.belt}>
      <div className={styles.track}>
        <div className={styles.docs}>
          {Array.from({ length: docs }, (_, i) => (
            <span key={i} data-belt-doc="" style={nth(i)} className={styles.beltDoc}>
              <DocumentIcon tone={docTone} className="h-4 w-3" />
            </span>
          ))}
        </div>
        <Rail className={styles.rail} />
      </div>
      {queue !== undefined && queue.count > 0 && (
        <div data-queue-for={queue.for} className={styles.queue}>
          <QueuePile count={queue.count} tone={queue.tone} />
        </div>
      )}
    </li>
  );
}

function StationCard({ station, aiLabel }: { station: Station; aiLabel?: string }) {
  const ai = station.ai === true;
  return (
    <li
      data-station={station.id}
      data-state={station.state}
      className={cn(
        'focus-group__item card-hover card-hover--raise relative rounded-xl bg-card shadow-md',
        styles.station,
        station.state === 'jam' ? 'border-2 border-(--warning)' : ai ? 'border border-ai/60' : 'border border-border',
      )}
    >
      {ai && aiLabel !== undefined && (
        <span
          data-ai-chip=""
          aria-hidden="true"
          className="absolute -top-3 right-2 inline-flex items-center gap-1 rounded-full bg-card px-2 text-caption font-semibold text-ai shadow-sm"
        >
          <AiIcon />
          {aiLabel}
        </span>
      )}
      <StationIcon id={station.id} ai={ai} />
      <span className="text-caption font-semibold text-foreground">{station.label}</span>
    </li>
  );
}

function CustomerEnd({ side, text, label }: { side: 'in' | 'out'; text: string; label: string }) {
  return (
    <li data-customer={side} className={styles.end}>
      <span
        data-bubble=""
        className={cn(
          'rounded-xl px-3 py-2 text-caption',
          side === 'in'
            ? 'rounded-bl-none bg-human/15 text-foreground'
            : 'rounded-br-none bg-primary font-semibold text-primary-foreground',
        )}
      >
        {text}
      </span>
      <PersonIcon />
      <span className="text-caption text-muted-foreground">{label}</span>
    </li>
  );
}

function Leg({
  station,
  beltDocs,
  docTone,
  aiLabel,
}: {
  station: Station;
  beltDocs: number;
  docTone: DocumentTone;
  aiLabel?: string;
}) {
  const queueTone = station.state === 'jam' ? 'queued' : docTone;
  return (
    <>
      <Belt docs={beltDocs} docTone={docTone} queue={{ for: station.id, count: station.queue, tone: queueTone }} />
      <StationCard station={station} aiLabel={aiLabel} />
    </>
  );
}

export function FactoryLine(props: FactoryLineProps) {
  const { label, stations, beltDocs, outputDocs, docTone = 'crisp', customer, aiLabel } = props;
  return (
    <div className={styles.frame}>
      <ol
        aria-label={label}
        className={cn('focus-group focus-group--dim-others', customer === undefined ? styles.compact : styles.wide)}
      >
        {customer !== undefined && <CustomerEnd side="in" text={customer.request} label={customer.label} />}
        {stations.map((station) => (
          <Leg key={station.id} station={station} beltDocs={beltDocs} docTone={docTone} aiLabel={aiLabel} />
        ))}
        <Belt docs={outputDocs ?? beltDocs} docTone={docTone} />
        {customer !== undefined && <CustomerEnd side="out" text={customer.result} label={customer.label} />}
      </ol>
    </div>
  );
}
