'use client';

import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { cn } from '@/lib/utils';
import { type RefObject, useEffect, useId, useRef, useState } from 'react';
import { readTrack, stepDelta, type TrackGeometry, type TrackReading } from './horizontal-scroll-snap.pure';

interface TrackCard {
  date: string;
  title: string;
  caption: string;
}

const AT_REST: TrackReading = { progress: 0, active: 0, atStart: true, atEnd: false };

const TRACK = cn(
  'relative -mr-(--inset-r) snap-x snap-mandatory overflow-x-auto overscroll-x-contain py-8',
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
);

const CARD = cn(
  'relative flex h-[24rem] w-[78vw] max-w-[22rem] shrink-0 origin-left snap-start flex-col overflow-hidden rounded-xl border p-6',
  'md:h-[28rem] md:w-[24rem] md:max-w-none',
  'bg-background shadow-sm motion-safe:transition-[scale,translate,box-shadow,border-color] motion-safe:duration-500 motion-safe:ease-out',
  'hover:shadow-xl motion-safe:hover:-translate-y-2',
);

const NUMERAL = cn(
  'mt-6 text-heading leading-[0.85] font-semibold tracking-tighter select-none',
  '[-webkit-text-stroke:3px_var(--color-foreground)] [paint-order:stroke_fill] motion-safe:transition-colors motion-safe:duration-500',
);

const STEP_BUTTON = cn(
  'grid size-11 place-items-center rounded-full border border-border text-foreground',
  'hover:border-foreground hover:bg-foreground hover:text-background motion-safe:transition-colors',
  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-35',
);

const pad = (n: number) => String(n).padStart(2, '0');

function measure(track: HTMLElement): TrackGeometry {
  const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-track-card]'));
  return {
    scrollLeft: track.scrollLeft,
    maxScroll: track.scrollWidth - track.clientWidth,
    offsets: cards.map((card) => card.offsetLeft - (cards[0]?.offsetLeft ?? 0)),
  };
}

/** Follows the track's native scroll (an external system), once per frame. */
function useTrackReading(trackRef: RefObject<HTMLDivElement | null>): TrackReading {
  const [reading, setReading] = useState<TrackReading>(AT_REST);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = requestAnimationFrame(() => setReading(readTrack(measure(track))));
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setReading(readTrack(measure(track))));
    };
    track.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [trackRef]);
  return reading;
}

/** Scrolls the track by one card; smooth only without reduced motion. */
function stepperFor(trackRef: RefObject<HTMLDivElement | null>) {
  return (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: stepDelta(measure(track), direction),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };
}

interface HorizontalScrollSnapProps {
  label: string;
  cards: TrackCard[];
  controls: { previous: string; next: string };
}

/**
 * A row of tall cards wider than the Slide that snaps card by card under native scroll and swipe. The progress bar
 * and the active card follow the scroll position; previous and next scroll by one card.
 */
export function HorizontalScrollSnap({ label, cards, controls }: HorizontalScrollSnapProps) {
  const trackId = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const reading = useTrackReading(trackRef);
  const step = stepperFor(trackRef);
  return (
    <div data-slot="horizontal-scroll-snap" data-active={reading.active}>
      <div ref={trackRef} id={trackId} role="region" aria-label={label} tabIndex={0} className={TRACK}>
        <ol className="flex w-max gap-4 pr-(--inset-r) md:gap-6">
          {cards.map((card, index) => (
            <TrackCardItem key={card.title} card={card} index={index} count={cards.length} active={reading.active} />
          ))}
        </ol>
      </div>
      <TrackControls reading={reading} count={cards.length} trackId={trackId} labels={controls} onStep={step} />
    </div>
  );
}

function TrackCardItem({
  card,
  index,
  count,
  active,
}: {
  card: TrackCard;
  index: number;
  count: number;
  active: number;
}) {
  const isActive = index === active;
  return (
    <li
      data-track-card
      aria-current={isActive ? 'step' : undefined}
      className={cn(CARD, isActive ? 'scale-100 border-foreground/30' : 'scale-[0.94] border-border')}
    >
      <CardCounter index={index} count={count} />
      <p className={cn(NUMERAL, isActive ? 'text-brand-accent' : 'text-background')}>{card.date}</p>
      <div className="mt-auto">
        <h4 className="text-subheading font-semibold tracking-tight">{card.title}</h4>
        <p className="mt-2 text-body text-muted-foreground">{card.caption}</p>
      </div>
    </li>
  );
}

function CardCounter({ index, count }: { index: number; count: number }) {
  return (
    <div className="flex items-center font-mono text-body tracking-widest text-muted-foreground">
      <span>{pad(index + 1)}</span>
      <span aria-hidden="true" className="mx-3 h-px flex-1 bg-border" />
      <span>{pad(count)}</span>
    </div>
  );
}

interface TrackControlsProps {
  reading: TrackReading;
  count: number;
  trackId: string;
  labels: { previous: string; next: string };
  onStep: (direction: -1 | 1) => void;
}

function TrackControls({ reading, count, trackId, labels, onStep }: TrackControlsProps) {
  return (
    <div className="mt-4 flex items-center gap-4 md:gap-6">
      <span aria-hidden="true" className="font-mono text-body text-muted-foreground tabular-nums">
        <span className="text-foreground">{pad(reading.active + 1)}</span> / {pad(count)}
      </span>
      <div aria-hidden="true" className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border">
        <div
          className="absolute inset-0 origin-left bg-foreground"
          style={{ transform: `scaleX(${reading.progress})` }}
        />
      </div>
      <div className="flex gap-2">
        <StepButton direction={-1} label={labels.previous} trackId={trackId} reading={reading} onStep={onStep} />
        <StepButton direction={1} label={labels.next} trackId={trackId} reading={reading} onStep={onStep} />
      </div>
    </div>
  );
}

function StepButton(props: {
  direction: -1 | 1;
  label: string;
  trackId: string;
  reading: TrackReading;
  onStep: (direction: -1 | 1) => void;
}) {
  const { direction, label, trackId, reading, onStep } = props;
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={trackId}
      disabled={direction < 0 ? reading.atStart : reading.atEnd}
      onClick={() => onStep(direction)}
      className={STEP_BUTTON}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={cn('size-5', direction > 0 && 'rotate-180')}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
