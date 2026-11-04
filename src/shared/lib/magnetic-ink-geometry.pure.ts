import { inkAtContact } from './ink-magnet.pure';
import type { InkContact, InkPoint, InkRect, InkShape } from './magnetic-ink.types';

export const clampInk = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const smoothInk = (n: number) => {
  const p = clampInk(n);
  return p * p * (3 - 2 * p);
};
export const easeInk = (current: number, goal: number, delta: number) =>
  Math.abs(current - goal) < 0.001 ? goal : current + (goal - current) * (1 - Math.exp((-14 * delta) / 1000));

export function inkDistance(rect: InkRect, point: InkPoint) {
  const dx = Math.abs(point.x - rect.x - rect.width / 2) - rect.width / 2 + rect.radius;
  const dy = Math.abs(point.y - rect.y - rect.height / 2) - rect.height / 2 + rect.radius;
  return Math.hypot(Math.max(0, dx), Math.max(0, dy)) + Math.min(Math.max(dx, dy), 0) - rect.radius;
}

function straightContact(rect: InkRect, point: InkPoint) {
  const x = point.x - rect.x,
    y = point.y - rect.y;
  const sides = [
    { x: rect.x, y: point.y, nx: -1, ny: 0, distance: Math.abs(x) },
    { x: rect.x + rect.width, y: point.y, nx: 1, ny: 0, distance: Math.abs(rect.width - x) },
    { x: point.x, y: rect.y, nx: 0, ny: -1, distance: Math.abs(y) },
    { x: point.x, y: rect.y + rect.height, nx: 0, ny: 1, distance: Math.abs(rect.height - y) },
  ];
  return sides.reduce((best, next) => (next.distance < best.distance ? next : best));
}

export function inkContact(rect: InkRect, point: InkPoint): InkContact {
  const x = clampInk(point.x, rect.x + rect.radius, rect.x + rect.width - rect.radius);
  const y = clampInk(point.y, rect.y + rect.radius, rect.y + rect.height - rect.radius);
  const dx = point.x - x,
    dy = point.y - y;
  const distance = Math.hypot(dx, dy);
  if (!distance) return straightContact(rect, point);
  const nx = dx / distance,
    ny = dy / distance;
  return { x: x + nx * rect.radius, y: y + ny * rect.radius, nx, ny, distance: Math.abs(distance - rect.radius) };
}

export function validateInkHost(rect: InkRect, reach: number) {
  const finite = [rect.x, rect.y, rect.width, rect.height, rect.radius, reach].every(Number.isFinite);
  if (!finite || rect.width <= 0 || rect.height <= 0 || rect.radius < 0 || reach <= 0) {
    throw new RangeError('Ink surfaces need finite positive dimensions and reach.');
  }
}

/** Hero geometry, with elongated beads rather than unmodified circles. */
export function inkShapes(contact: InkContact, strength: number, height: number): InkShape[] {
  const activation = smoothInk(strength / 0.16);
  const pull = Math.min(1, contact.distance / 96);
  const field = inkAtContact({ ...contact, gap: contact.distance }, strength, height);
  const fill = field.fill.r * activation;
  const shapes: InkShape[] = [{ x: contact.x, y: contact.y, rx: fill, ry: fill, angle: 0 }];
  for (const drop of field.droplets) {
    const radius = drop.r * activation;
    shapes.push({
      x: drop.x,
      y: drop.y,
      rx: radius * (1.1 + pull * 0.65),
      ry: radius * (0.92 - pull * 0.16),
      angle: Math.atan2(contact.ny, contact.nx),
    });
  }
  return shapes;
}

export function floodedInk(rect: InkRect, point: InkPoint): InkShape[] {
  const radius =
    Math.hypot(
      Math.max(point.x - rect.x, rect.x + rect.width - point.x),
      Math.max(point.y - rect.y, rect.y + rect.height - point.y),
    ) + 18;
  return [{ ...point, rx: radius, ry: radius, angle: 0 }];
}

export function interpolateInk(current: InkShape[], goals: InkShape[], delta: number) {
  const count = Math.max(current.length, goals.length);
  const shapes = Array.from({ length: count }, (_, i) => mixShape(current[i], goals[i], delta));
  const moving = shapes.some((shape, i) => shapeDifference(shape, goals[i]));
  return { shapes, moving };
}

function mixShape(current: InkShape | undefined, goal: InkShape | undefined, delta: number): InkShape {
  const start = current ?? { ...goal!, rx: 0, ry: 0 };
  const end = goal ?? { ...start, rx: 0, ry: 0 };
  return {
    x: easeInk(start.x, end.x, delta),
    y: easeInk(start.y, end.y, delta),
    rx: easeInk(start.rx, end.rx, delta),
    ry: easeInk(start.ry, end.ry, delta),
    angle: end.angle,
  };
}

function shapeDifference(shape: InkShape, goal?: InkShape) {
  const end = goal ?? { ...shape, rx: 0, ry: 0 };
  return ['x', 'y', 'rx', 'ry'].some(
    (key) => Math.abs(shape[key as keyof InkShape] - end[key as keyof InkShape]) > 0.01,
  );
}

export function inkVertices(shape: InkShape): InkPoint[] {
  return Array.from({ length: 20 }, (_, index) => {
    const angle = (index * Math.PI) / 10;
    const wobble = 1 + 0.055 * Math.sin(angle * 3 + shape.x * 0.035 + shape.y * 0.025);
    const x = Math.cos(angle) * shape.rx * wobble,
      y = Math.sin(angle) * shape.ry * wobble;
    return {
      x: shape.x + x * Math.cos(shape.angle) - y * Math.sin(shape.angle),
      y: shape.y + x * Math.sin(shape.angle) + y * Math.cos(shape.angle),
    };
  });
}

export function inkPath(points: InkPoint[]) {
  const n = points.length;
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const a = points[(i + n - 1) % n],
      b = points[i],
      c = points[(i + 1) % n],
      d = points[(i + 2) % n];
    path += ` C ${(b.x + (c.x - a.x) / 6).toFixed(2)} ${(b.y + (c.y - a.y) / 6).toFixed(2)}, ${(c.x - (d.x - b.x) / 6).toFixed(2)} ${(c.y - (d.y - b.y) / 6).toFixed(2)}, ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  return `${path} Z`;
}

export function separatedInk(point: InkPoint, surface: InkRect, neighbours: InkRect[]) {
  const depth = inkDistance(surface, point);
  if (depth <= 0 || neighbours.length === 0) return point;
  const contact = inkContact(surface, point);
  let low = 0,
    high = Math.max(128, depth * 2);
  for (let i = 0; i < 10; i++) {
    const h = (low + high) / 2;
    const test = { x: contact.x + contact.nx * h, y: contact.y + contact.ny * h };
    if (neighbours.every((rect) => inkDistance(rect, test) >= h + 18)) low = h;
    else high = h;
  }
  if (low >= 127) return point;
  const limit = low > 0 ? depth / Math.pow(1 + Math.pow(depth / low, 4), 0.25) : 0;
  return { x: contact.x + contact.nx * limit, y: contact.y + contact.ny * limit };
}
