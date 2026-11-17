interface Size {
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface InkCircle {
  x: number;
  y: number;
  r: number;
}

export interface InkField {
  strength: number;
  fill: InkCircle;
  droplets: InkCircle[];
}

const FILL_REACH = 96;
const MAX_STRETCH = 80;
const BEADS = [
  { along: 0, size: 1 },
  { along: 0.42, size: 0.7 },
  { along: 0.72, size: 0.52 },
  { along: 1.1, size: 0.42 },
];

export const INK_DROPLETS = BEADS.length;

const round = (value: number) => Math.round(value * 100) / 100;

function pillContact({ width, height }: Size, point: Point) {
  const radius = height / 2;
  const spine = { x: Math.max(radius, Math.min(width - radius, point.x)), y: radius };
  const dx = point.x - spine.x;
  const dy = point.y - spine.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= radius) return { x: point.x, y: point.y, nx: 0, ny: 0, gap: 0, inside: true };
  const nx = dx / distance;
  const ny = dy / distance;
  return { x: spine.x + nx * radius, y: spine.y + ny * radius, nx, ny, gap: distance - radius, inside: false };
}

function farthestCorner({ width, height }: Size, point: Point) {
  return Math.hypot(Math.max(point.x, width - point.x), Math.max(point.y, height - point.y));
}

export function inkMagnet(size: Size, point: Point, reach: number): InkField {
  if (!(reach > 0)) throw new RangeError('Reach must be a positive distance.');
  if (!(size.width > 0 && size.height > 0)) throw new RangeError('Button must have a positive width and height.');
  const contact = pillContact(size, point);
  const strength = Math.max(0, 1 - contact.gap / reach);
  const at = { x: round(contact.x), y: round(contact.y) };
  if (contact.inside) return { strength, fill: { ...at, r: round(farthestCorner(size, point)) }, droplets: [] };
  return inkAtContact(contact, strength, size.height);
}

export function inkAtContact(
  contact: { x: number; y: number; nx: number; ny: number; gap: number },
  strength: number,
  height: number,
): InkField {
  const at = { x: round(contact.x), y: round(contact.y) };
  const fill = { ...at, r: round(height * Math.max(0, 1 - contact.gap / FILL_REACH)) };
  if (strength === 0) return { strength, fill, droplets: [] };
  const stretch = MAX_STRETCH * strength * Math.min(1, contact.gap / FILL_REACH);
  const bead = 6 + 12 * strength;
  const droplets = BEADS.map(({ along, size: scale }) => ({
    x: round(contact.x + contact.nx * stretch * along),
    y: round(contact.y + contact.ny * stretch * along),
    r: round(bead * scale),
  }));
  return { strength, fill, droplets };
}
