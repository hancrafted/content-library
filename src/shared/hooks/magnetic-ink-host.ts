import type { InkHost, InkView } from '@/shared/lib/magnetic-ink';
import type { InkBrowser, InkOptions } from './magnetic-ink-browser';
import {
  inkDrawing,
  inkPrimary,
  inkRect,
  paintDrawing,
  paintPrimary,
  removeDrawing,
  sizeDrawing,
  type InkDrawing,
} from './magnetic-ink-dom';

interface HostParts {
  element: HTMLElement;
  primary: HTMLElement | null;
  secondary: HTMLElement | null;
  field: InkDrawing;
  secondaryField: InkDrawing | null;
  primaryDrawing: ReturnType<typeof inkPrimary> | null;
  geometry: InkHost;
  options: () => InkOptions;
  ready?: boolean;
}

export function bindInkHost(page: InkBrowser, element: HTMLElement, options: () => InkOptions) {
  const primary = element.querySelector<HTMLElement>('[data-ink-primary]');
  const secondary = element.querySelector<HTMLElement>('[data-ink-secondary]');
  const id = `ink-${++sequence}`;
  const parts: HostParts = {
    element,
    primary,
    secondary,
    options,
    field: inkDrawing(element, id, options().kind === 'button'),
    secondaryField: secondary ? inkDrawing(secondary, `${id}-secondary`) : null,
    primaryDrawing: primary ? inkPrimary(primary) : null,
    geometry: { surface: inkRect(element) },
  };
  const dispose = page.register(element, { read: () => readHost(parts), paint: (view) => paintHost(parts, view) });
  return () => {
    dispose();
    clearHost(parts);
  };
}
let sequence = 0;

function visibleHost(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
}

function readHost(parts: HostParts): InkHost {
  const { element, primary, secondary } = parts;
  const options = parts.options();
  const enabled = visibleHost(element) && (options.enabled?.() ?? true);
  parts.ready =
    enabled &&
    window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches;
  const geometry = {
    surface: inkRect(element),
    primary: primary ? inkRect(primary) : undefined,
    secondary: secondary ? inkRect(secondary) : undefined,
    enabled,
    reach: options.reach,
  };
  parts.geometry = geometry;
  return geometry;
}

function paintHost(parts: HostParts, view: InkView) {
  const { element, geometry } = parts;
  element.dataset.inkReady = String(parts.ready);
  sizeDrawing(parts.field, geometry.surface);
  if (parts.secondaryField && geometry.secondary) sizeDrawing(parts.secondaryField, geometry.secondary);
  paintDrawing(parts.field, view.paths);
  if (parts.secondaryField) paintDrawing(parts.secondaryField, view.secondaryPaths);
  if (parts.primaryDrawing && geometry.primary) paintPrimary(parts.primaryDrawing, view, geometry.primary);
  markHost(parts, view);
}
function markHost(parts: HostParts, view: InkView) {
  const { element } = parts;
  element.dataset.inkStage = view.stage;
  element.dataset.inkOpenHover = String(view.primaryHovered);
  element.dataset.motion = view.moving ? 'running' : 'settled';
  parts.field.svg.dataset.motion = element.dataset.motion;
  parts.options().onProximity?.(view.strength);
}

function clearHost(parts: HostParts) {
  removeDrawing(parts.field);
  if (parts.secondaryField) removeDrawing(parts.secondaryField);
  if (parts.primaryDrawing) removeDrawing(parts.primaryDrawing);
  ['inkReady', 'inkStage', 'inkOpenHover', 'motion'].forEach((key) => delete parts.element.dataset[key]);
}
