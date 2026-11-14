import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { ReactNode } from 'react';

export interface FieldCardProps {
  readonly name: string;
  readonly value: string;
  /** The field's `metadata` key, shown in the Coding agent view in place of its value; code, not translated. */
  readonly codingKey: string;
  /** What the field is for. */
  readonly job: ReactNode;
  /** Where the field comes from, with its Context marker. */
  readonly source?: ReactNode;
  /** A note's target, when one names the card. */
  readonly 'data-target'?: string;
}

/**
 * One field of the control block with its job: the name, its value as a pill (its `metadata` key in the Coding agent
 * view), what it is for, and where it comes from. Hover raises the card and dims its neighbours.
 */
export function FieldCard({ name, value, codingKey, job, source, ...rest }: FieldCardProps) {
  return (
    <li {...rest} className="focus-group__item card-hover card-hover--raise">
      <ZoneCard className="flex h-full flex-col gap-2 rounded-xl p-4 shadow-md">
        <p className="flex items-center justify-between gap-2">
          <span className="text-body font-semibold">{name}</span>
          <InView view="chat" className="rounded-full bg-foreground px-3 py-0.5 text-caption font-semibold text-card">
            {value}
          </InView>
          <InView view="coding" className="rounded-full bg-foreground px-3 py-0.5 font-mono text-caption text-card">
            {codingKey}
          </InView>
        </p>
        <p className="text-body">{job}</p>
        {source === undefined ? null : <p className="text-caption text-muted-foreground">{source}</p>}
      </ZoneCard>
    </li>
  );
}
