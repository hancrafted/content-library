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

/** What the pointer draws out of the button: `strength` 0 far to 1 over it. */
export interface InkField {
  strength: number;
  fill: InkCircle;
  droplets: InkCircle[];
}

// Within this gap the ink stops reaching out and starts flowing into the button instead.
const FILL_REACH = 96;
const MAX_STRETCH = 80;
// Droplets along the stretch, from the anchored bead to a tip that pulls free once the stretch is long.
const BEADS = [
  { along: 0, size: 1 },
  { along: 0.42, size: 0.7 },
  { along: 0.72, size: 0.52 },
  { along: 1.1, size: 0.42 },
];

/** How many droplets the field draws; the markup renders this many. */
export const INK_DROPLETS = BEADS.length;

const round = (value: number) => Math.round(value * 100) / 100;

/** The nearest point on the pill's edge, the outward direction toward the pointer and the gap to it. */
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

/**
 * The ink the pointer pulls on, in the button's own pixels (origin top-left). From `reach` away a
 * bead swells on the nearest edge and stretches toward the pointer; within FILL_REACH the ink flows
 * in from that edge; over the button it floods outward from the pointer.
 */
export function inkMagnet(size: Size, point: Point, reach: number): InkField {
  if (!(reach > 0)) throw new RangeError('Reach must be a positive distance.');
  if (!(size.width > 0 && size.height > 0)) throw new RangeError('Button must have a positive width and height.');
  const contact = pillContact(size, point);
  const strength = Math.max(0, 1 - contact.gap / reach);
  const at = { x: round(contact.x), y: round(contact.y) };
  if (contact.inside) return { strength, fill: { ...at, r: round(farthestCorner(size, point)) }, droplets: [] };
  const fill = { ...at, r: round(size.height * Math.max(0, 1 - contact.gap / FILL_REACH)) };
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
