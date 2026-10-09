import { paperExit } from '@/lib/paper-exit.pure';
import { paperOverflow } from '@/lib/paper-overflow.pure';
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

/** A checked sheet lifts clear of the tray walls, then is thrown off the desk to the right. */
function checkedExit(timeline: gsap.core.Timeline, sheet: SVGGElement, index: number) {
  const exit = paperExit(index, Math.random);
  const check = sheet.querySelector('[data-paper-check]');
  const thrownAt = 0.12 + exit.hang;
  gsap.set(check, { opacity: 1, strokeDasharray: 130, strokeDashoffset: 130 });
  timeline.to(check, { strokeDashoffset: 0, duration: 0.16 });
  timeline.to(sheet, { y: -exit.lift, x: exit.sideways, rotation: -3, duration: exit.hang, ease: 'power2.out' }, 0.12);
  timeline.to(sheet, { x: 1750, duration: exit.throwTime, ease: 'power2.in' }, thrownAt);
  timeline.to(sheet, { y: exit.drop, rotation: exit.spin, duration: exit.throwTime, ease: 'power1.in' }, thrownAt);
}

/** Falling paper accelerates while gliding side to side; each glide tilts and flattens the sheet. */
function overflowExit(timeline: gsap.core.Timeline, sheet: SVGGElement, flight: Overflow) {
  const glides = Array.from({ length: flight.swings + 1 }, (_, swing) => (swing === 0 ? 0 : swing % 2 ? 1 : -1));
  timeline.to(sheet, { y: 790, duration: flight.duration, ease: 'power1.in' }, 0);
  timeline.to(
    sheet,
    {
      keyframes: {
        x: glides.map((glide) => glide * flight.sway),
        rotation: glides.map((glide) => glide * flight.tilt),
        scaleY: glides.map((glide, swing) => (swing === 0 ? 1 : 0.45 + (swing % 3) * 0.2)),
        easeEach: 'sine.inOut',
      },
      duration: flight.duration,
      ease: 'none',
      transformOrigin: '50% 50%',
    },
    0,
  );
  timeline.to(sheet.parentElement, { x: `+=${flight.drift}`, duration: flight.duration, ease: 'sine.in' }, 0);
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
    else checkedExit(timeline, sheet, index);
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
