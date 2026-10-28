import {
  beatOf,
  beatPoseOf,
  bubbleCountOf,
  checkpointOf,
  ease,
  LOOP_SECONDS,
  mix,
  STATIC_SECONDS,
  type Area,
  type Pose,
  type Story,
} from './drift.pure';

/** The slice of a 2D canvas context the drawing uses, so a test can hand in a recording stand-in. */
export interface Pen {
  globalAlpha: number;
  lineWidth: number;
  filter: string;
  beginPath(): void;
  roundRect(x: number, y: number, w: number, h: number, radius: number): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  fill(): void;
}

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type Point = readonly [number, number];

function line(g: Pen, stroke: { from: Point; to: Point; alpha: number; thickness?: number }) {
  g.globalAlpha = clamp(stroke.alpha);
  g.lineWidth = stroke.thickness ?? 1;
  g.beginPath();
  g.moveTo(...stroke.from);
  g.lineTo(...stroke.to);
  g.stroke();
}

/** A rounded bubble with two skeleton lines and, along its foot, `chips` small squares. */
function bubble(g: Pen, at: { x: number; y: number; w: number; h: number; alpha: number; chips?: number }) {
  const { x, y, w, h, alpha, chips = 0 } = at;
  g.globalAlpha = clamp(alpha);
  g.lineWidth = 1;
  g.beginPath();
  g.roundRect(x - w / 2, y - h / 2, w, h, Math.min(9, h / 3));
  g.stroke();
  line(g, { from: [x - w * 0.32, y - h * 0.13], to: [x + w * 0.28, y - h * 0.13], alpha: alpha * 0.55 });
  line(g, { from: [x - w * 0.32, y + h * 0.15], to: [x + w * 0.1, y + h * 0.15], alpha: alpha * 0.35 });
  for (let i = 0; i < Math.ceil(chips); i++) {
    g.globalAlpha = clamp(alpha) * ease(chips - i);
    g.beginPath();
    const size = Math.max(3, h * 0.22);
    g.roundRect(x - w * 0.3 + i * (size + 2), y + h / 2 - size / 2, size, size, 1.5);
    g.fill();
  }
}

/** An orange check at `at`, drawn on as `p` runs from 0 to 1. */
function check(g: Pen, mark: { at: Point; size: number; p: number; alpha: number }) {
  const [x, y] = mark.at;
  const { size } = mark;
  const points: Point[] = [
    [x - size * 0.5, y],
    [x - size * 0.12, y + size * 0.34],
    [x + size * 0.55, y - size * 0.4],
  ];
  for (let i = 0; i < 2; i++) {
    const progress = ease(mark.p * 2 - i);
    if (progress <= 0) continue;
    const [a, b] = [points[i], points[i + 1]];
    line(g, { from: a, to: [mix(a[0], b[0], progress), mix(a[1], b[1], progress)], alpha: mark.alpha, thickness: 1.8 });
  }
}

function sizeOf(area: Area) {
  return area.compact ? Math.max(7, Math.min(18, area.h * 0.21)) : Math.min(48, area.h * 0.13);
}

/** The ambient field: faint bubbles in ink, shaped by the story, plus the Human checkpoint line. */
export function paintField(g: Pen, scene: { story: Story; area: Area; width: number; height: number; t: number }) {
  const { story, area: a, t } = scene;
  const size = sizeOf(a);
  const count = bubbleCountOf(scene.width, scene.height);
  if (story === 'human-in-the-loop')
    line(g, { from: [a.x, checkpointOf(a)], to: [a.x + a.w, checkpointOf(a)], alpha: 0.65 });
  for (let i = 0; i < count; i++) {
    const phase = (i / count + t / LOOP_SECONDS) % 1;
    let x = a.x + a.w * (0.5 + Math.sin(i * 2.8) * (story === 'context-window' ? 0.08 : 0.27));
    let y = a.y + a.h * (1 - phase);
    let alpha = ease(phase * 7) * ease((1 - phase) * 6) * 0.8;
    if (story === 'context-window') {
      const middle = Math.exp(-Math.pow((phase - 0.5) / 0.2, 2));
      alpha *= 1 - middle * 0.8;
      g.filter = `blur(${middle * (a.compact ? 0.8 : 2.5)}px)`;
    }
    if (story === 'ai-disciplines') {
      const turn = (t / LOOP_SECONDS) * Math.PI * 2 + i;
      y = a.y + a.h * (0.13 + (i % 4) * 0.24) + Math.sin(turn) * size * 0.14;
      x = a.x + a.w * (0.27 + (Math.floor(i / 4) % 3) * 0.23);
      alpha = 0.45 + 0.2 * Math.sin(turn);
    }
    bubble(g, { x, y, w: size * 2.6 * (0.8 + (i % 3) * 0.12), h: size, alpha });
    g.filter = 'none';
  }
}

/** The subject beat, in the accent colour: the pose at `progress`, shown at `strength`. */
export function paintBeat(g: Pen, scene: { story: Story; area: Area; progress: number; strength: number }) {
  const { story, area, progress, strength } = scene;
  if (!strength) return;
  const size = sizeOf(area);
  const pose: Pose = beatPoseOf({ story, progress, area, size });
  if (pose.alpha === 0) return;
  g.filter = pose.blur > 0 ? `blur(${pose.blur}px)` : 'none';
  bubble(g, { x: pose.x, y: pose.y, w: pose.width, h: size, alpha: strength * pose.alpha, chips: pose.chips });
  g.filter = 'none';
  if (pose.check > 0) {
    check(g, { at: [pose.x + pose.width * 0.69, pose.y], size: size * 0.52, p: pose.check, alpha: strength * 0.9 });
  }
}

/** The moment drawn: a point on the loop's timeline, or under reduced motion the composed end state. */
export function momentOf(seconds: number, staticFrame: boolean) {
  if (staticFrame) return { t: STATIC_SECONDS, progress: 1, strength: 0.55 };
  return { t: seconds, ...beatOf(seconds) };
}
