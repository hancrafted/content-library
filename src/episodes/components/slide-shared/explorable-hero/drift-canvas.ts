import { momentOf, paintBeat, paintField } from './drift-paint';
import { areaOf, FIELD_INK, type Area, type Box, type Story } from './drift.pure';

/** The safe top of the art: under the pause button. */
const ART_TOP = 64;

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
function measure(canvas: HTMLCanvasElement, layer: HTMLCanvasElement, hero: HTMLElement): Frame {
  const bounds = hero.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  for (const surface of [canvas, layer]) {
    surface.width = Math.round(bounds.width * ratio);
    surface.height = Math.round(bounds.height * ratio);
    surface.getContext('2d')?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  const text = [...hero.querySelectorAll('h1, [data-target="caption"]')].map((element) => boxOf(element, bounds));
  const style = getComputedStyle(canvas);
  return {
    width: bounds.width,
    height: bounds.height,
    area: areaOf({ width: bounds.width, height: bounds.height, text, top: ART_TOP }),
    ink: style.getPropertyValue('--primary-foreground').trim(),
    accent: style.getPropertyValue('--brand-accent').trim(),
  };
}

/** Draws the ambient field at `FIELD_INK` and then the accent beat on top, each through the offscreen layer. */
function drawFrame(
  surfaces: { context: CanvasRenderingContext2D; layer: HTMLCanvasElement; pen: CanvasRenderingContext2D },
  frame: Frame,
  scene: { story: Story; seconds: number; staticFrame: boolean },
) {
  const { context, layer, pen } = surfaces;
  const { width, height, area } = frame;
  const moment = momentOf(scene.seconds, scene.staticFrame);
  context.clearRect(0, 0, width, height);
  for (const beat of [false, true]) {
    pen.clearRect(0, 0, width, height);
    pen.save();
    pen.fillStyle = pen.strokeStyle = beat ? frame.accent : frame.ink;
    pen.lineCap = pen.lineJoin = 'round';
    if (beat) paintBeat(pen, { story: scene.story, area, progress: moment.progress, strength: moment.strength });
    else paintField(pen, { story: scene.story, area, width, height, t: moment.t });
    pen.restore();
    context.globalAlpha = beat ? 1 : FIELD_INK;
    context.drawImage(layer, 0, 0, width, height);
  }
  context.globalAlpha = 1;
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
export function mountDrift(canvas: HTMLCanvasElement, hero: HTMLElement, scene: DriftScene): Drift | undefined {
  const context = canvas.getContext('2d');
  const layer = document.createElement('canvas');
  const pen = layer.getContext('2d');
  if (!context || !pen) return undefined;
  let frame = measure(canvas, layer, hero);
  const draw = () => {
    const now = { story: scene.story, seconds: scene.seconds(), staticFrame: scene.staticFrame };
    drawFrame({ context, layer, pen }, frame, now);
  };
  const remeasure = () => {
    frame = measure(canvas, layer, hero);
    draw();
  };
  const resize = new ResizeObserver(remeasure);
  resize.observe(hero);
  const stopWatching = watchPixelRatio(remeasure);
  draw();
  const dispose = () => {
    resize.disconnect();
    stopWatching();
  };
  return { draw, dispose };
}
