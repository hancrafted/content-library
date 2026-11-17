/*
 * The maths of the Explorable hero's Message drift: a field of faint bubbles and, every few seconds, one subject beat in
 * the accent colour. Pure, so the timeline, the end state and the layout test without a canvas.
 */

export type Story = 'context-window' | 'human-in-the-loop' | 'ai-capability';

/** One ambient cycle, the gap between subject beats and a beat's length, in seconds. */
export const LOOP_SECONDS = 18;
export const BEAT_EVERY_SECONDS = 6;
export const BEAT_SECONDS = 1.5;
export const FIELD_INK = 0.12;
export const END_PROGRESS = 1;
export const STATIC_SECONDS = LOOP_SECONDS * 0.28;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const ease = (value: number) => {
  const p = clamp(value);
  return p * p * (3 - 2 * p);
};
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

/** Where the loop's subject beat is at `seconds`: how far it has run (0 to 1) and how strongly it shows. */
export function beatOf(seconds: number): { progress: number; strength: number } {
  const beatTime = (seconds + BEAT_EVERY_SECONDS - 2) % BEAT_EVERY_SECONDS;
  return {
    progress: clamp(beatTime / BEAT_SECONDS),
    strength: ease(beatTime / 0.2) * (1 - ease((beatTime - 1.2) / 0.3)),
  };
}

export function bubbleCountOf(width: number, height: number): number {
  return Math.max(5, Math.min(12, Math.round((width * height) / 100000)));
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Area {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly compact: boolean;
}

export function areaOf(hero: {
  width: number;
  height: number;
  text: readonly Box[];
  top: number;
  right: number;
}): Area {
  const { height, text, top, right } = hero;
  const textRight = Math.max(...text.map((box) => box.x + box.width));
  const copyTop = Math.min(...text.map((box) => box.y));
  const room = right - 12 - textRight;
  if (room >= 220)
    return { x: textRight + 24, y: top + 4, w: room, h: Math.max(180, height - top - 270), compact: false };
  return { x: 24, y: top, w: right - 12 - 24, h: Math.max(24, copyTop - top - 20), compact: true };
}

export function fieldAreaOf(area: Area): Area {
  const x = Math.max(0, area.x - area.w * 0.5);
  return { ...area, x, w: area.x + area.w - x };
}

export type Motion = 'running' | 'reduced' | 'paused' | 'hidden' | 'offscreen';

export function motionOf(state: { reduced: boolean; paused: boolean; hidden: boolean; active: boolean }): Motion {
  if (state.reduced) return 'reduced';
  if (state.paused) return 'paused';
  if (state.hidden) return 'hidden';
  return state.active ? 'running' : 'offscreen';
}

export function createClock(): { tick: (now: number) => number; stop: () => void } {
  let elapsed = 0;
  let last: number | null = null;
  return {
    tick(now) {
      if (last !== null) elapsed += (now - last) / 1000;
      last = now;
      return elapsed;
    },
    stop() {
      last = null;
    },
  };
}

export interface Pose {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly alpha: number;
  readonly check: number;
  readonly chips: number;
  /** Blur in pixels. */
  readonly blur: number;
}

const CHECKPOINT = 0.49;

export const checkpointOf = (area: Area) => area.y + area.h * CHECKPOINT;

export interface Scene {
  readonly story: Story;
  readonly progress: number;
  readonly area: Area;
  readonly size: number;
}

type Placed = Omit<Pose, 'x' | 'width'>;

const NONE = { check: 0, chips: 0, blur: 0 } as const;

function contextBeat({ progress, area }: Scene): Placed {
  const middle = ease(progress);
  return {
    ...NONE,
    y: mix(area.y + area.h * 0.86, area.y + area.h * 0.48, middle),
    alpha: (1 - middle) * 0.75,
    blur: middle * (area.compact ? 1.2 : 4),
  };
}

function humanBeat({ progress, area }: Scene): Placed {
  const checkpoint = checkpointOf(area);
  let y = mix(checkpoint, area.y + area.h * 0.14, ease((progress - 0.66) / 0.34));
  if (progress < 0.66) y = checkpoint;
  if (progress < 0.3) y = mix(area.y + area.h * 0.85, checkpoint, ease(progress / 0.3));
  return { ...NONE, y, alpha: 0.6, check: ease((progress - 0.38) / 0.22) };
}

function capabilityBeat({ progress, area }: Scene): Placed {
  const step = Math.min(3, Math.floor(progress * 4));
  const local = ease(Math.min(1, (progress * 4 - step) / 0.65));
  const previousTier = step === 0 ? 0.98 : 0.85 - (step - 1) * 0.24;
  return {
    ...NONE,
    y: area.y + area.h * mix(previousTier, 0.85 - step * 0.24, local),
    alpha: 0.8,
    chips: Math.min(4, step + ease((local - 0.65) / 0.35)),
  };
}

const BEATS = { 'context-window': contextBeat, 'human-in-the-loop': humanBeat, 'ai-capability': capabilityBeat };

export function beatPoseOf(scene: Scene): Pose {
  const placed = BEATS[scene.story](scene);
  const grown = scene.story === 'ai-capability' ? placed.chips * scene.size * 0.12 : 0;
  return { ...placed, x: scene.area.x + scene.area.w * 0.53, width: scene.size * 2.6 + grown };
}
