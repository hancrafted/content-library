'use client';

import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import type { SlideZone } from '@/lib/slide-zone.pure';
import { cn } from '@/lib/utils';
import { useEffect, useRef, type KeyboardEvent } from 'react';
import {
  ARC_DRAW_MS,
  CYCLE_ITEMS,
  drawDelayMs,
  HAND_TURN_S,
  phaseArc,
  polarPoint,
  POP_DISTANCE,
  popOffset,
  RING,
  tickMarks,
  type CycleItem,
} from './radial-cycle.pure';

/** One tick per month: the face is a year. */
const MONTHS = 12;

/** Rotations in CSS turn around the face's centre, not the element's own box. */
const ABOUT_CENTRE = '[transform-box:view-box] origin-center';

export interface PhaseCopy {
  date: string;
  title: string;
  caption: string;
}

/** What a phase does when a pointer or the keyboard reaches it. */
export interface PhaseHandlers {
  onSelect: (item: CycleItem) => void;
  onPreview: (item: CycleItem | null) => void;
}

/** The faint month ticks outside the ring and the track the phases sit on. */
function Dial() {
  return (
    <g aria-hidden="true">
      <circle
        cx={RING.centre}
        cy={RING.centre}
        r={RING.radius}
        fill="none"
        strokeWidth={RING.stroke}
        className="stroke-muted"
      />
      {tickMarks(MONTHS).map((tick, index) => (
        <line key={index} {...tick} strokeWidth={index % 3 === 0 ? 2 : 1} className="stroke-muted-foreground/50" />
      ))}
    </g>
  );
}

interface PhaseProps {
  item: CycleItem;
  index: number;
  copy: PhaseCopy;
  shown: boolean;
  drawn: boolean;
  handlers: PhaseHandlers;
}

/** Focus or a click selects the phase, Enter or Space too; a hover only previews it. */
function phaseEvents(item: CycleItem, { onSelect, onPreview }: PhaseHandlers) {
  return {
    onFocus: () => onSelect(item),
    onClick: () => onSelect(item),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onSelect(item);
    },
    onMouseEnter: () => onPreview(item),
    onMouseLeave: () => onPreview(null),
  };
}

/** One phase: a focusable arc that pops outward while shown, its date laid along it. */
function Phase({ item, index, copy, shown, drawn, handlers }: PhaseProps) {
  const arc = phaseArc(index, CYCLE_ITEMS.length);
  const pop = popOffset(index, CYCLE_ITEMS.length, POP_DISTANCE);
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={shown}
      aria-label={`${copy.date}, ${copy.title}`}
      data-phase={item}
      {...phaseEvents(item, handlers)}
      style={{ transform: shown ? `translate(${pop.x}px, ${pop.y}px)` : undefined }}
      className="group cursor-pointer outline-none transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"
    >
      <PhaseArc path={arc.path} length={arc.length} index={index} shown={shown} drawn={drawn} />
      <PhaseLabel at={arc.labelAt} turnDeg={arc.labelTurnDeg} index={index} shown={shown} drawn={drawn}>
        {copy.date}
      </PhaseLabel>
    </g>
  );
}

interface PhaseLabelProps {
  at: { x: number; y: number };
  turnDeg: number;
  index: number;
  shown: boolean;
  drawn: boolean;
  children: string;
}

/** The phase's date, turned to follow the ring; it fades in once its arc has drawn. */
function PhaseLabel({ at, turnDeg, index, shown, drawn, children }: PhaseLabelProps) {
  return (
    <text
      x={at.x}
      y={at.y}
      dy="0.35em"
      textAnchor="middle"
      transform={`rotate(${turnDeg} ${at.x} ${at.y})`}
      style={{ transitionDelay: drawn ? `${drawDelayMs(index, CYCLE_ITEMS.length) + 200}ms` : undefined }}
      className={cn(
        'pointer-events-none font-mono text-body font-semibold tracking-[0.12em] uppercase transition-[fill,opacity] duration-500',
        shown ? 'fill-foreground dark:fill-background' : 'fill-foreground',
        !drawn && 'opacity-0',
        'motion-reduce:opacity-100! print:opacity-100!',
      )}
    >
      {children}
    </text>
  );
}

interface PhaseArcProps {
  path: string;
  length: number;
  index: number;
  shown: boolean;
  drawn: boolean;
}

/** The arc's stroke, drawn in by its dash offset once the Slide is first read. */
function PhaseArc({ path, length, index, shown, drawn }: PhaseArcProps) {
  const timing = drawn
    ? {
        transitionDelay: `${drawDelayMs(index, CYCLE_ITEMS.length)}ms`,
        transitionDuration: `${ARC_DRAW_MS / CYCLE_ITEMS.length}ms`,
      }
    : {};
  return (
    <>
      <FocusHalo path={path} />
      <path
        d={path}
        fill="none"
        strokeWidth={RING.stroke}
        strokeDasharray={length}
        style={{ strokeDashoffset: drawn ? 0 : length, ...timing }}
        className={cn(
          'transition-[stroke-dashoffset] ease-out',
          shown ? 'stroke-brand-accent' : 'stroke-foreground/15 group-hover:stroke-foreground/30',
          'motion-reduce:[stroke-dashoffset:0]! print:[stroke-dashoffset:0]!',
        )}
      />
    </>
  );
}

/** A wider band behind the arc, shown only while the keyboard focuses it. */
function FocusHalo({ path }: { path: string }) {
  return (
    <path
      d={path}
      fill="none"
      aria-hidden="true"
      strokeWidth={RING.stroke + 10}
      className="stroke-ring opacity-0 group-focus-visible:opacity-100"
    />
  );
}

/** The phases in order around the face. */
export function PhaseRing({
  items,
  shown,
  drawn,
  handlers,
}: {
  items: Record<CycleItem, PhaseCopy>;
  shown: CycleItem;
  drawn: boolean;
  handlers: PhaseHandlers;
}) {
  return (
    <>
      <Dial />
      {CYCLE_ITEMS.map((item, index) => (
        <Phase
          key={item}
          item={item}
          index={index}
          copy={items[item]}
          shown={shown === item}
          drawn={drawn}
          handlers={handlers}
        />
      ))}
    </>
  );
}

/** Turns the hand once every `HAND_TURN_S`, only while the Slide is `active` and motion is welcome (FE-009 §6). */
function useTurning(zone: SlideZone) {
  const hand = useRef<SVGGElement>(null);
  const turn = useRef<Animation | null>(null);
  useEffect(() => {
    const element = hand.current;
    if (element === null || prefersReducedMotion()) return;
    turn.current ??= element.animate([{ rotate: '0deg' }, { rotate: '360deg' }], {
      duration: HAND_TURN_S * 1000,
      iterations: Number.POSITIVE_INFINITY,
    });
    if (zone === 'active') turn.current.play();
    else turn.current.pause();
  }, [zone]);
  return hand;
}

/** A slow "now" hand sweeping the face; it rests at 12 o'clock under reduced motion. */
export function NowHand({ zone }: { zone: SlideZone }) {
  const hand = useTurning(zone);
  const tip = polarPoint(0, RING.radius + RING.stroke / 2 + 18);
  const base = polarPoint(0, RING.radius - RING.stroke / 2 - 4);
  return (
    <g ref={hand} aria-hidden="true" data-slot="now-hand" className={cn('pointer-events-none', ABOUT_CENTRE)}>
      <line x1={base.x} y1={base.y} x2={tip.x} y2={tip.y} strokeWidth={2} className="stroke-foreground" />
      <circle cx={tip.x} cy={tip.y} r={4} className="fill-brand-accent stroke-background" strokeWidth={2} />
    </g>
  );
}
