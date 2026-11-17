import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import type { ReactNode } from 'react';

export interface FieldCardProps {
  readonly name: string;
  readonly value: string;
  readonly codingKey: string;
  readonly job: ReactNode;
  readonly source?: ReactNode;
  readonly 'data-target'?: string;
}

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
