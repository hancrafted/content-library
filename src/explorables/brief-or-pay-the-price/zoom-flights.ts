import { prefersReducedMotion } from './reduced-motion';
import { flipFrom, orientationOf, originCss, type Entry, type Orientation, type Origin } from './zoom-geometry.pure';

export const visibleWorkflow = (container: HTMLElement): SVGSVGElement | undefined =>
  [...container.querySelectorAll<SVGSVGElement>('svg[data-workflow]')].find((svg) => svg.getClientRects().length > 0);

export const orientationIn = (container: HTMLElement | null): Orientation =>
  orientationOf(
    container?.clientWidth ?? Infinity,
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16,
  );

const EASING = 'cubic-bezier(0.3, 0, 0.2, 1)';
export const FLIGHT_EASING = 'cubic-bezier(0.5, 0, 0.2, 1)';
const SHRINK_MILLISECONDS = 620;
const GROW_MILLISECONDS = 560;
const LETTER_MILLISECONDS = 620;
const COLUMN_STAGGER = 70;
const ROW_DELAY = 380;
const REST_DELAY = 700;
const DOT_DELAY = 1100;
const DOT_STAGGER = 45;
const NODE_MILLISECONDS = 420;
const NODE_STAGGER = 150;
const BADGE_MILLISECONDS = 700;
const GOAL_MILLISECONDS = 360;
const FRAMES_GRACE = 150;

const canAnimate = (element: Element): boolean => typeof element.animate === 'function' && !prefersReducedMotion();

function settled(animation: Animation, milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, milliseconds + FRAMES_GRACE);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    animation.finished.then(done, done);
  });
}

const BACKWARDS = { fill: 'backwards', easing: EASING } as const;

const scaleFrom = (origin: Origin): Keyframe => ({ transformOrigin: originCss(origin) });

export function growFrom(root: HTMLElement, origin: Origin | null): void {
  if (!canAnimate(root)) return;
  const at = scaleFrom(origin ?? { x: 50, y: 50 });
  root.animate(
    [
      { ...at, transform: 'scale(0.1)', opacity: 0.1 },
      { ...at, transform: 'none', opacity: 1 },
    ],
    { duration: GROW_MILLISECONDS, easing: EASING },
  );
}

export function shrinkInto(root: HTMLElement, origin: Origin | null): Promise<void> {
  if (!canAnimate(root)) return Promise.resolve();
  const at = scaleFrom(origin ?? { x: 50, y: 50 });
  const animation = root.animate(
    [
      { ...at, transform: 'none', opacity: 1 },
      { ...at, transform: 'scale(0.06)', opacity: 0.15 },
    ],
    { duration: SHRINK_MILLISECONDS, easing: FLIGHT_EASING, fill: 'forwards' },
  );
  return settled(animation, SHRINK_MILLISECONDS);
}

const all = <T extends Element>(root: ParentNode, selector: string): T[] => [...root.querySelectorAll<T>(selector)];

interface Letter {
  readonly element: HTMLElement;
  readonly from: DOMRect | undefined;
  readonly fallback: string;
  readonly delay: number;
}

function flipIn({ element, from, fallback, delay }: Letter): void {
  const last = element.getBoundingClientRect();
  const start = from
    ? (({ dx, dy, scale }) => `translate(${dx}px, ${dy}px) scale(${scale})`)(flipFrom(from, last))
    : fallback;
  const origin = { transformOrigin: '0 0' };
  element.animate(
    [
      { ...origin, transform: start, opacity: from ? 1 : 0 },
      { ...origin, transform: 'none', opacity: 1 },
    ],
    { ...BACKWARDS, duration: LETTER_MILLISECONDS, delay },
  );
}

const fadeIn = (element: HTMLElement, delay: number): Animation =>
  element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, easing: 'ease-out', fill: 'backwards' });

export type Source = 'price' | 'brief' | null;

function flipHeads(matrix: HTMLElement, source: Source, chips: readonly DOMRect[]): void {
  const heads = [
    { kind: 'column', from: 'price', fallback: 'translateY(-1.5rem)', delay: 0 },
    { kind: 'row', from: 'brief', fallback: 'translateX(-3rem)', delay: ROW_DELAY },
  ] as const;
  heads.forEach(({ kind, from, fallback, delay }) =>
    all<HTMLElement>(matrix, `[data-head-letter="${kind}"]`).forEach((element, index) =>
      flipIn({
        element,
        from: source === from ? chips[index] : undefined,
        fallback,
        delay: delay + index * COLUMN_STAGGER,
      }),
    ),
  );
}

function popDots(matrix: HTMLElement): void {
  all<HTMLElement>(matrix, '[data-dot]').forEach((dot) => {
    const row = dot.closest('tr')?.rowIndex ?? 0;
    const column = dot.closest('td')?.cellIndex ?? 0;
    dot.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      {
        duration: 300,
        delay: DOT_DELAY + (row + column) * DOT_STAGGER,
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1.3)',
        fill: 'backwards',
      },
    );
  });
}

export function assembleFrom(matrix: HTMLElement, source: Source, chips: readonly DOMRect[]): void {
  if (!canAnimate(matrix)) return;
  flipHeads(matrix, source, chips);
  all<HTMLElement>(matrix, '[data-head-rest]').forEach((rest) => fadeIn(rest, REST_DELAY));
  popDots(matrix);
}

const GROUPS = '[data-edges], [data-annotations], [data-bands], [data-band-labels]';

function enterGoal(svg: SVGSVGElement): void {
  const at = { transformBox: 'fill-box', transformOrigin: 'center' };
  svg.querySelector('[data-goal]')?.animate(
    [
      { ...at, transform: 'scale(1.6)', opacity: 0 },
      { ...at, transform: 'none', opacity: 1 },
    ],
    { duration: GOAL_MILLISECONDS, easing: 'ease-out', fill: 'backwards' },
  );
}

interface Place {
  readonly index: number;
  readonly vertical: boolean;
}

function enterNode(svg: SVGSVGElement, { id, toGoal }: Entry, { index, vertical }: Place): void {
  const delay = GOAL_MILLISECONDS + index * NODE_STAGGER;
  const from = vertical ? 'translateY(40px)' : 'translateX(50px)';
  svg.querySelector(`[data-node="${id}"]`)?.animate(
    [
      { opacity: 0, transform: from },
      { opacity: 1, transform: 'none' },
    ],
    { duration: NODE_MILLISECONDS, delay, easing: 'ease-out', fill: 'backwards' },
  );
  const at = { transformOrigin: '0 0' };
  svg.querySelector(`[data-badge="${id}"] [data-badge-copy]`)?.animate(
    [
      { ...at, transform: `translate(${toGoal.dx}px, ${toGoal.dy}px) scale(2.6)` },
      { ...at, transform: 'none' },
    ],
    { duration: BADGE_MILLISECONDS, delay, easing: EASING, fill: 'backwards' },
  );
}

export function enterNodes(svg: SVGSVGElement, entries: readonly Entry[], vertical: boolean): void {
  if (!canAnimate(svg)) return;
  enterGoal(svg);
  entries.forEach((entry, index) => enterNode(svg, entry, { index, vertical }));
  const delay = GOAL_MILLISECONDS + NODE_STAGGER * entries.length + NODE_MILLISECONDS;
  all<SVGElement>(svg, GROUPS).forEach((group) => {
    group.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, easing: 'ease-out', fill: 'backwards' });
  });
}
