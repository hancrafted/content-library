import styles from '@/shared/components/animations/magnetic-ink.module.css';
import { INK_DROPLETS } from '@/shared/lib/ink-magnet.pure';
import type { InkRect, InkView } from '@/shared/lib/magnetic-ink';

const SVG_NS = 'http://www.w3.org/2000/svg';
export interface InkDrawing {
  svg: SVGSVGElement;
  paths: SVGPathElement[];
  clip: SVGRectElement;
  inverse: HTMLElement | null;
  fill: HTMLElement | null;
}

function svgMarkup(id: string) {
  return `<defs>
    <filter id="${id}-goo" x="-128" y="-128" width="2000" height="2000" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="4"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7"/>
    </filter>
    <filter id="${id}-rough" x="-128" y="-128" width="2000" height="2000" filterUnits="userSpaceOnUse">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <clipPath id="${id}-edge"><rect/></clipPath>
    </defs>
    <g filter="url(#${id}-goo)">
      <g clip-path="url(#${id}-edge)"><path filter="url(#${id}-rough)"/></g>
      <g filter="url(#${id}-rough)">${'<path/>'.repeat(INK_DROPLETS)}</g>
    </g>`;
}

function inverseLabel(element: HTMLElement) {
  const label = element.querySelector<HTMLElement>('[data-ink-label]');
  if (!label) return null;
  const inverse = document.createElement('span');
  inverse.className = styles.inverse;
  inverse.setAttribute('aria-hidden', 'true');
  const clone = label.cloneNode(true) as HTMLElement;
  clone.removeAttribute('data-ink-label');
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));
  inverse.append(clone);
  element.append(inverse);
  return inverse;
}

export function inkDrawing(element: HTMLElement, id: string, withLabel = true): InkDrawing {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.classList.add(styles.field);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.innerHTML = svgMarkup(id.replace(/[^a-zA-Z0-9-]/g, ''));
  element.append(svg);
  return {
    svg,
    paths: [...svg.querySelectorAll('path')],
    clip: svg.querySelector('clipPath rect')!,
    inverse: withLabel ? inverseLabel(element) : null,
    fill: null,
  };
}

export function inkPrimary(element: HTMLElement) {
  const fill = document.createElement('span');
  fill.className = styles.fill;
  fill.setAttribute('aria-hidden', 'true');
  element.prepend(fill);
  return { fill, inverse: inverseLabel(element) };
}

export function inkRect(element: HTMLElement): InkRect {
  const bounds = element.getBoundingClientRect();
  const width = Math.max(1, bounds.width),
    height = Math.max(1, bounds.height);
  return {
    x: bounds.x,
    y: bounds.y,
    width,
    height,
    radius: Math.min(width / 2, height / 2, parseFloat(getComputedStyle(element).borderRadius) || 0),
  };
}

export function sizeDrawing(drawing: InkDrawing, rect: InkRect) {
  drawing.clip.setAttribute('width', String(rect.width));
  drawing.clip.setAttribute('height', String(rect.height));
  drawing.clip.setAttribute('rx', String(rect.radius));
  drawing.svg.querySelectorAll('filter').forEach((filter) => {
    filter.setAttribute('width', String(rect.width + 256));
    filter.setAttribute('height', String(rect.height + 256));
  });
}

export function paintDrawing(drawing: InkDrawing, paths: string[]) {
  drawing.paths.forEach((path, index) => path.setAttribute('d', paths[index] ?? ''));
  const visible = paths.some(Boolean);
  drawing.svg.dataset.motion = visible ? 'running' : 'settled';
  if (drawing.inverse) drawing.inverse.style.clipPath = visible ? `path("${paths.join(' ')}")` : 'inset(0 100% 0 0)';
}

export function paintPrimary(drawing: Pick<InkDrawing, 'fill' | 'inverse'>, view: InkView, rect: InkRect) {
  const radius = Math.hypot(rect.width, rect.height) * view.primaryFill;
  const clip = `circle(${radius.toFixed(2)}px at ${view.origin.x.toFixed(2)}px ${view.origin.y.toFixed(2)}px)`;
  drawing.fill?.style.setProperty('clip-path', clip);
  drawing.inverse?.style.setProperty('clip-path', clip);
}

export function removeDrawing(drawing: Pick<InkDrawing, 'fill' | 'inverse'> & { svg?: SVGSVGElement }) {
  drawing.svg?.remove();
  drawing.fill?.remove();
  drawing.inverse?.remove();
}
