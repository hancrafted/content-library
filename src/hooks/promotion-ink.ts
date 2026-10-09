import { INK_DROPLETS, inkMagnet, type InkField } from '@/lib/ink-magnet.pure';
import gsap from 'gsap';

// How far from Explore why the ink starts to notice the pointer, in CSS pixels; its strength drives the pile.
const INK_REACH = 240;
// How quickly the drawn ink catches up with the pointer, per second.
const SETTLE = 14;

interface Point {
  x: number;
  y: number;
}

interface InkParts {
  button: HTMLElement;
  edge: SVGRectElement;
  fill: SVGCircleElement;
  drops: SVGCircleElement[];
}

/** strength, fill x y r, then x y r per droplet: one flat list so easing is one loop. */
function flatten(field: InkField, previous: number[]) {
  const values = [field.strength, field.fill.x, field.fill.y, field.fill.r];
  for (let index = 0; index < INK_DROPLETS; index++) {
    const drop = field.droplets[index];
    // A vanishing droplet shrinks where it is instead of sliding back to the edge.
    values.push(
      ...(drop
        ? [drop.x, drop.y, drop.r]
        : [previous[4 + index * 3] ?? field.fill.x, previous[5 + index * 3] ?? field.fill.y, 0]),
    );
  }
  return values;
}

function render({ button, fill, drops }: InkParts, values: number[]) {
  const [strength, x, y, r] = values;
  button.style.setProperty('--ink-strength', strength.toFixed(3));
  fill.setAttribute('cx', x.toFixed(1));
  fill.setAttribute('cy', y.toFixed(1));
  fill.setAttribute('r', r.toFixed(1));
  drops.forEach((drop, index) => {
    drop.setAttribute('cx', values[4 + index * 3].toFixed(1));
    drop.setAttribute('cy', values[5 + index * 3].toFixed(1));
    drop.setAttribute('r', values[6 + index * 3].toFixed(1));
  });
}

function inkParts(root: HTMLElement): InkParts | null {
  const button = root.querySelector<HTMLElement>('[data-hero-primary]');
  const edge = root.querySelector<SVGRectElement>('[data-ink-edge]');
  const fill = root.querySelector<SVGCircleElement>('[data-ink-fill]');
  const drops = Array.from(root.querySelectorAll<SVGCircleElement>('[data-ink-drop]'));
  return button && edge && fill ? { button, edge, fill, drops } : null;
}

function measure({ button, edge }: InkParts) {
  const size = { width: button.offsetWidth, height: button.offsetHeight };
  edge.setAttribute('width', String(size.width));
  edge.setAttribute('height', String(size.height));
  edge.setAttribute('rx', String(size.height / 2));
  return size;
}

function aim(parts: InkParts, point: Point | null) {
  // Measured on every move: a late web font or locale label can still change the button's width.
  const size = measure(parts);
  const bounds = parts.button.getBoundingClientRect();
  // No pointer: aim beyond reach below the button, so the ink drains back the way it came.
  const local = point
    ? { x: point.x - bounds.left, y: point.y - bounds.top }
    : { x: size.width / 2, y: size.height + INK_REACH * 2 };
  return inkMagnet(size, local, INK_REACH);
}

/**
 * Explore why behaves like a magnet for ink: as the pointer nears it, droplets stretch out of its
 * nearest edge toward the pointer, then ink flows in from that side, flooding it once the pointer is
 * over it. `follow` returns the pointer's proximity to the button, which also drains the pile.
 */
export function createInkMagnet(root: HTMLElement) {
  const parts = inkParts(root);
  if (!parts) return { follow: () => 0, stop: () => undefined };
  let target = flatten(aim(parts, null), []);
  const current = [...target];
  const tick = (_time: number, delta: number) => {
    const blend = 1 - Math.exp((-SETTLE * Math.min(delta, 50)) / 1000);
    current.forEach((value, index) => (current[index] = value + (target[index] - value) * blend));
    render(parts, current);
    if (current.every((value, index) => Math.abs(target[index] - value) < 0.05)) gsap.ticker.remove(tick);
  };
  render(parts, current);
  return {
    follow: (point: Point | null) => {
      const field = aim(parts, point);
      target = flatten(field, target);
      gsap.ticker.add(tick);
      return field.strength;
    },
    stop: () => gsap.ticker.remove(tick),
  };
}
