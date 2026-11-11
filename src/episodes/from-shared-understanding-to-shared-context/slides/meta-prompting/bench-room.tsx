import { BikeBench } from '@/episodes/components/slide-shared/bike-bench/bike-bench';
import type { ReactNode } from 'react';
import { AiSpark } from './figures';

export interface BenchRoomProps {
  readonly label: string;
  readonly drawing: string;
  readonly worker: string;
  /** The work order that crossed from the office. */
  readonly children: ReactNode;
}

/**
 * The line's room: the bike bench with only its work order lit, the one page that crossed, and the AI worker who
 * starts from it.
 */
export function BenchRoom({ label, drawing, worker, children }: BenchRoomProps) {
  return (
    <section data-room="bench" className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
      <span className="self-start rounded-full bg-foreground px-3 py-1 text-caption font-medium text-background">
        {label}
      </span>
      {children}
      <BikeBench label={drawing} highlight={['bench', 'work-order']} className="mt-auto" />
      <div className="flex items-center gap-3">
        <AiSpark className="size-8" />
        <p className="text-caption text-muted-foreground">{worker}</p>
      </div>
    </section>
  );
}
