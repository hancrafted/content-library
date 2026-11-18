'use client';

import { useEffect, useRef, useState, type Dispatch, type RefObject } from 'react';
import type { ExplorableEvent, Level } from './explorable-state.pure';
import { prefersReducedMotion } from './reduced-motion';
import { LETTERS, type Letter, type PlainScenario } from './scenario.types';
import { MAX_STEP, anchorOf, type Point } from './workflow-annotations.pure';

export interface FlightChip {
  readonly letter: string;
  readonly rect: DOMRect;
}

interface Flight {
  readonly chip: FlightChip;
  readonly to: Point;
}

const CHIP_SELECTOR = '[data-mirror="brace"] [data-trait-initial]';
const FLIGHT_MILLISECONDS = 900;
const FIRST_DELAY_MILLISECONDS = 200;
const STAGGER_MILLISECONDS = 420;
const EASING = 'cubic-bezier(.5,0,.2,1)';
const FLYER = 'pointer-events-none fixed z-50 flex items-center justify-center text-heading font-semibold text-ai';

const landsAtMilliseconds = (index: number): number =>
  FIRST_DELAY_MILLISECONDS + index * STAGGER_MILLISECONDS + FLIGHT_MILLISECONDS;

const chipsIn = (container: HTMLElement): FlightChip[] =>
  [...container.querySelectorAll<HTMLElement>(CHIP_SELECTOR)].map((chip) => ({
    letter: chip.textContent?.trim() ?? '',
    rect: chip.getBoundingClientRect(),
  }));

const visibleWorkflow = (container: HTMLElement): SVGSVGElement | undefined =>
  [...container.querySelectorAll<SVGSVGElement>('svg[data-workflow]')].find((svg) => svg.getClientRects().length > 0);

function flightsOf(container: HTMLElement, chips: readonly FlightChip[], scenario: PlainScenario): Flight[] {
  const svg = visibleWorkflow(container);
  const matrix = svg?.getScreenCTM();
  if (!svg || !matrix) return [];
  const layout = scenario.layouts[svg.getAttribute('data-orient') === 'vertical' ? 'vertical' : 'horizontal'];
  return chips.map((chip, index) => {
    const letter = (LETTERS.includes(chip.letter as Letter) ? chip.letter : LETTERS[index]) as Letter;
    const anchor = anchorOf(scenario, layout, letter) ?? { x: layout.w / 2, y: layout.h / 2 };
    return { chip, to: { x: matrix.a * anchor.x + matrix.e, y: matrix.d * anchor.y + matrix.f } };
  });
}

function flyerAt({ letter, rect }: FlightChip): HTMLElement {
  const flyer = document.createElement('div');
  flyer.className = FLYER;
  flyer.setAttribute('aria-hidden', 'true');
  flyer.textContent = letter;
  const box = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  Object.entries(box).forEach(([side, pixels]) => flyer.style.setProperty(side, `${pixels}px`));
  document.body.append(flyer);
  return flyer;
}

function fly({ chip, to }: Flight, index: number): HTMLElement {
  const flyer = flyerAt(chip);
  const dx = to.x - (chip.rect.left + chip.rect.width / 2);
  const dy = to.y - (chip.rect.top + chip.rect.height / 2);
  const landed = `translate(${dx}px, ${dy}px)`;
  const keyframes = [
    { transform: 'none', opacity: 1 },
    { transform: `${landed} scale(.55)`, opacity: 1, offset: 0.85 },
    { transform: `${landed} scale(.3)`, opacity: 0 },
  ];
  const delay = FIRST_DELAY_MILLISECONDS + index * STAGGER_MILLISECONDS;
  flyer.animate(keyframes, { duration: FLIGHT_MILLISECONDS, delay, easing: EASING, fill: 'backwards' });
  return flyer;
}

function startFlights(flights: readonly Flight[], dispatch: Dispatch<ExplorableEvent>, onDone: () => void) {
  const flyers = flights.map(fly);
  const timers = flights.map((_, index) =>
    window.setTimeout(() => {
      dispatch({ type: 'braceStep', step: index + 1 });
      if (index === flights.length - 1) onDone();
    }, landsAtMilliseconds(index)),
  );
  return () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    flyers.forEach((flyer) => flyer.remove());
  };
}

export interface BraceFlightProps {
  readonly container: RefObject<HTMLElement | null>;
  readonly scenario: PlainScenario;
  readonly level: Level;
  readonly dispatch: Dispatch<ExplorableEvent>;
}

export function useBraceFlight({ container, scenario, level, dispatch }: BraceFlightProps) {
  const pending = useRef<readonly FlightChip[] | null>(null);
  const [departure, setDeparture] = useState(0);
  useEffect(() => {
    const root = container.current;
    if (level !== 'workflow') pending.current = null;
    const chips = pending.current;
    const flights = root && chips ? flightsOf(root, chips, scenario) : [];
    if (chips && flights.length === 0) {
      pending.current = null;
      dispatch({ type: 'braceStep', step: MAX_STEP });
    }
    return startFlights(flights, dispatch, () => {
      pending.current = null;
    });
  }, [departure, level, scenario, container, dispatch]);
  return (): void => {
    dispatch({ type: 'zoom', level: 'workflow' });
    const root = container.current;
    if (root === null || prefersReducedMotion()) return dispatch({ type: 'braceStep', step: MAX_STEP });
    pending.current = chipsIn(root);
    setDeparture((count) => count + 1);
    if (pending.current.length === 0) dispatch({ type: 'braceStep', step: 1 });
  };
}
