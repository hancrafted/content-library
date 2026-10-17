import { cn } from '@/lib/utils';

/**
 * page-template's Hero motif: the Episode's Sections as stops on one track.
 * The Title slide shows every stop open, foreshadowing the way ahead; each
 * section slide echoes it with the stops up to its own filled, so the reader
 * sees how far the Episode has come. Decorative: the Slide header says the
 * words. A Slide folder imports only its own files, so each Slide drawing the
 * motif carries this part; another Episode authors its own motif.
 */
export function SectionTrack({
  sections,
  reached = 0,
  className,
}: {
  /** How many Sections the Episode has: one stop each. */
  sections: number;
  /** The Section the Slide opens, 1-based; 0 on the Title slide, where nothing is reached yet. */
  reached?: number;
  className?: string;
}) {
  const stops = Array.from({ length: sections }, (_, index) => index + 1);
  return (
    <div aria-hidden="true" data-slot="section-track" className={cn('flex w-full max-w-xl items-center', className)}>
      {stops.map((stop) => (
        <div key={stop} className="flex flex-1 items-center last:flex-none">
          <span
            className={cn(
              'size-4 shrink-0 rounded-full border-2',
              stop <= reached ? 'border-primary bg-primary' : 'border-border bg-background',
              stop === reached && 'ring-4 ring-primary/20',
            )}
          />
          {stop < sections && <span className={cn('h-0.5 flex-1', stop < reached ? 'bg-primary' : 'bg-border')} />}
        </div>
      ))}
    </div>
  );
}
