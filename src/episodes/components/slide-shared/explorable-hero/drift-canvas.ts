import { momentOf, paintBeat, paintField } from './drift-paint';
import { areaOf, type Area, type Box, type Story } from './drift.pure';

/** The drawing's pixel ratio is capped: the art is faint hairlines and blur, so a retina canvas would cost four times the fill for no visible gain. */
const MAX_RATIO = 1;

/** The safe top of the art: under the floating header band and the pause button. */
const ART_TOP = 96;

/** What the canvas needs from one measurement of the hero. */
interface Frame {
  readonly width: number;
  readonly height: number;
  readonly area: Area;
  readonly ink: string;
  readonly accent: string;
}

/** A mounted drift: draw it at a time, and take it down. */
export interface Drift {
  readonly draw: () => void;
  readonly dispose: () => void;
}

function boxOf(element: Element, origin: DOMRect): Box {
  const box = element.getBoundingClientRect();
  return { x: box.x - origin.x, y: box.y - origin.y, width: box.width, height: box.height };
}

/** Sizes both surfaces to the hero at the current pixel ratio and reads the headline, lede and tokens once. */
function measure(surfaces: readonly HTMLCanvasElement[], hero: HTMLElement): Frame {
  const bounds = hero.getBoundingClientRect();
  // The canvas covers the hero's first screen only (the art never reaches further), so each frame repaints a
  // viewport, not the whole tall Slide.
  const own = surfaces[0].getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_RATIO);
  for (const surface of surfaces) {
    surface.width = Math.round(own.width * ratio);
    surface.height = Math.round(own.height * ratio);
    surface.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  const text = [...hero.querySelectorAll('h1, [data-target="caption"]')].map((element) => boxOf(element, bounds));
  const button = hero.querySelector('[data-hero-motion-button]');
  const right = button ? boxOf(button, bounds).x : bounds.width - 60;
  const style = getComputedStyle(surfaces[0]);
  return {
    width: own.width,
    height: own.height,
    area: areaOf({
      width: bounds.width,
      height: own.height,
      text,
      top: ART_TOP,
      right,
    }),
    ink: style.getPropertyValue('--foreground').trim(),
    accent: style.getPropertyValue('--brand-accent').trim(),
  };
}

/** Draws the ambient field on its canvas (faded to `FIELD_INK` by CSS) and the accent beat on the other: no offscreen copy. */
function drawFrame(
  contexts: { field: CanvasRenderingContext2D; soft: CanvasRenderingContext2D; beat: CanvasRenderingContext2D },
  frame: Frame,
  scene: { story: Story; seconds: number; staticFrame: boolean },
) {
  const { width, height, area } = frame;
  const moment = momentOf(scene.seconds, scene.staticFrame);
  for (const pen of Object.values(contexts)) {
    pen.clearRect(0, 0, width, height);
    pen.save();
    pen.fillStyle = pen.strokeStyle = pen === contexts.beat ? frame.accent : frame.ink;
    pen.lineCap = pen.lineJoin = 'round';
  }
  paintBeat(contexts.beat, { story: scene.story, area, progress: moment.progress, strength: moment.strength });
  paintField(contexts.field, { story: scene.story, area, width, height, t: moment.t, soft: contexts.soft });
  for (const pen of Object.values(contexts)) pen.restore();
}

/** Re-measures on a pixel-ratio change, which a resize observer does not see; returns its teardown. */
function watchPixelRatio(onChange: () => void): () => void {
  let query: MediaQueryList | undefined;
  const changed = () => {
    onChange();
    watch();
  };
  const watch = () => {
    query?.removeEventListener('change', changed);
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener('change', changed);
  };
  watch();
  return () => query?.removeEventListener('change', changed);
}

function readyPens(contexts: Record<'beat' | 'field' | 'soft', CanvasRenderingContext2D | null>) {
  const { beat, field, soft } = contexts;
  return beat && field && soft ? { beat, field, soft } : undefined;
}

/** Watches the hero's own size, the canvas's, and its Foreground's (which an open drawer narrows without resizing the hero). */
function watchSizes(resize: ResizeObserver, hero: HTMLElement, canvas: HTMLCanvasElement) {
  for (const watched of [hero, canvas, hero.querySelector('[data-hero-motion-button]')?.parentElement]) {
    if (watched) resize.observe(watched);
  }
}

/** What one drift is drawn from: the story, whether it is the static end state, and the loop's timeline. */
export interface DriftScene {
  readonly story: Story;
  readonly staticFrame: boolean;
  readonly seconds: () => number;
}

/**
 * Mounts Message drift on `canvas`, sized to the `hero` Slide wrapper that holds it: the canvas stays out of layout,
 * scales with the device pixel ratio and re-measures on resize.
 */
export function mountDrift(
  canvases: { beat: HTMLCanvasElement; field: HTMLCanvasElement; soft: HTMLCanvasElement },
  hero: HTMLElement,
  scene: DriftScene,
): Drift | undefined {
  const { beat, field, soft } = canvases;
  const contexts = { beat: beat.getContext('2d'), field: field.getContext('2d'), soft: soft.getContext('2d') };
  const pens = readyPens(contexts);
  if (!pens) return undefined;
  const surfaces = [beat, field, soft];
  let frame = measure(surfaces, hero);
  const draw = () => {
    drawFrame(pens, frame, { story: scene.story, seconds: scene.seconds(), staticFrame: scene.staticFrame });
  };
  const remeasure = () => {
    frame = measure(surfaces, hero);
    draw();
  };
  const resize = new ResizeObserver(remeasure);
  watchSizes(resize, hero, beat);
  const stopWatching = watchPixelRatio(remeasure);
  draw();
  const dispose = () => {
    resize.disconnect();
    stopWatching();
  };
  return { draw, dispose };
}
