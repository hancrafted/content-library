import type { paperOverflow } from '@/lib/paper-overflow.pure';
import { PAPER_PILE_ORIGIN } from '@/lib/paper-pile.pure';
import gsap from 'gsap';

type Overflow = ReturnType<typeof paperOverflow>;

function departingPaper(paper: SVGGElement, index: number) {
  const wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  const sheet = paper.cloneNode(true);
  if (!(sheet instanceof SVGGElement)) throw new Error('A departing task must be an SVG group.');
  const { x, y, step } = PAPER_PILE_ORIGIN;
  wrapper.setAttribute('transform', `translate(${x + (index % 3) - 1} ${y - index * step})`);
  sheet.removeAttribute('data-task-paper');
  sheet.removeAttribute('transform');
  sheet.setAttribute('opacity', '1');
  wrapper.append(sheet);
  return { wrapper, sheet };
}

function checkedExit(timeline: gsap.core.Timeline, sheet: SVGGElement) {
  const check = sheet.querySelector('[data-paper-check]');
  gsap.set(check, { opacity: 1, strokeDasharray: 130, strokeDashoffset: 130 });
  timeline.to(check, { strokeDashoffset: 0, duration: 0.16 });
  timeline.to(sheet, { x: 1750, y: 45, rotation: 8, duration: 0.9, ease: 'power2.in' }, 0.18);
}

function overflowExit(timeline: gsap.core.Timeline, sheet: SVGGElement, flight: Overflow) {
  timeline.to(sheet, {
    keyframes: [
      { x: flight.drift * 0.2 + 80, y: 65, rotation: 14, scaleY: 0.55 },
      { x: flight.drift * 0.45 - 65, y: 230, rotation: -19, scaleY: 0.95 },
      { x: flight.drift * 0.7 + 95, y: 410, rotation: 21, scaleY: 0.4 },
      { x: flight.drift, y: 790, rotation: -10, scaleY: 0.8 },
    ],
    duration: flight.duration,
    ease: 'none',
    defaults: { ease: 'sine.inOut' },
    transformOrigin: '50% 50%',
  });
}

function flightLayers(root: HTMLElement) {
  const completed = root.querySelector('[data-completed-papers]');
  const overflow = root.querySelector('[data-overflow-papers]');
  if (!completed || !overflow) throw new Error('The desk requires completed and overflow paper layers.');
  return { completed, overflow };
}

export function createPaperFlights(root: HTMLElement) {
  const { completed, overflow } = flightLayers(root);
  const flights = new Map<gsap.core.Timeline, SVGGElement>();
  const launch = (paper: SVGGElement, index: number, drift?: Overflow) => {
    const { wrapper, sheet } = departingPaper(paper, index);
    if (drift) overflow.append(wrapper);
    else completed.prepend(wrapper);
    const timeline = gsap.timeline({
      onComplete: () => {
        wrapper.remove();
        flights.delete(timeline);
      },
    });
    flights.set(timeline, wrapper);
    if (drift) overflowExit(timeline, sheet, drift);
    else checkedExit(timeline, sheet);
  };
  return {
    launch,
    suspend: (paused: boolean) => flights.forEach((_sheet, flight) => flight.paused(paused)),
    stop: () => {
      flights.forEach((sheet, flight) => {
        flight.kill();
        sheet.remove();
      });
      flights.clear();
    },
  };
}
