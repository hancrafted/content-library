interface InkPoint {
  x: number;
  y: number;
  width: number;
  height: number;
  round: boolean;
}

const TARGET = '[data-header-ink-target]';
const BRAND = '[data-testid="brand"]';

function dotPoints(header: HTMLElement): InkPoint[] {
  const origin = header.getBoundingClientRect();
  return Array.from(header.querySelectorAll('[data-brand-dot]')).map((dot) => {
    const rect = dot.getBoundingClientRect();
    return { x: rect.x - origin.x, y: rect.y - origin.y, width: rect.width, height: rect.height, round: true };
  });
}

function linePoints(header: HTMLElement, target: HTMLElement): InkPoint[] {
  const origin = header.getBoundingClientRect();
  const rect = target.getBoundingClientRect();
  return [0, 1].map((half) => ({
    x: rect.x - origin.x + (half * rect.width) / 2,
    y: rect.bottom - origin.y - 2,
    width: rect.width / 2,
    height: 2,
    round: false,
  }));
}

function restingTarget(header: HTMLElement): HTMLElement | null {
  const targets = Array.from(header.querySelectorAll<HTMLElement>(TARGET));
  return (
    targets.find((item) => item.dataset.state === 'open') ??
    targets.find((item) => item.dataset.active === 'true' || item.querySelector('[aria-current="page"]')) ??
    null
  );
}

function inkTarget(node: EventTarget | null, header: HTMLElement): HTMLElement | null {
  if (!(node instanceof Element)) return null;
  const target = node.closest<HTMLElement>(`${TARGET}, ${BRAND}`);
  return target && header.contains(target) ? target : null;
}

function inkTransform(point: InkPoint) {
  return `translate(${point.x}px, ${point.y}px) scale(${point.width / 4}, ${point.height / 4})`;
}

function arcFrames(previous: CSSStyleDeclaration, point: InkPoint): Keyframe[] {
  const from = new DOMMatrixReadOnly(previous.transform);
  const radius = Number.parseFloat(previous.borderRadius);
  const bend = point.round || radius > 0 ? Math.min(12, Math.hypot(point.x - from.e, point.y - from.f) * 0.08) : 0;
  return Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    return {
      transform: inkTransform({
        ...point,
        x: from.e + (point.x - from.e) * t,
        y: from.f + (point.y - from.f) * t + 4 * bend * t * (1 - t),
        width: 4 * from.a + (point.width - 4 * from.a) * t,
        height: 4 * from.d + (point.height - 4 * from.d) * t,
      }),
      borderRadius: `${radius + ((point.round ? 50 : 0) - radius) * t}%`,
    };
  });
}

function paintPart(part: HTMLElement, point: InkPoint, animate: boolean): Animation | undefined {
  const frames = animate ? arcFrames(getComputedStyle(part), point) : [];
  part.getAnimations().forEach((animation) => animation.cancel());
  const finish = {
    transform: inkTransform(point),
    borderRadius: point.round ? '50%' : '0',
  };
  Object.assign(part.style, finish);
  if (animate) {
    return part.animate(frames, { duration: 280, easing: 'ease-in-out' });
  }
}

function createPainter(layer: HTMLElement, header: HTMLElement) {
  const parts = Array.from(layer.children) as HTMLElement[];
  let generation = 0;
  return (target: HTMLElement | null, animate: boolean) => {
    const points = target && !target.matches(BRAND) ? linePoints(header, target) : dotPoints(header);
    const current = ++generation;
    const animations = parts.map((part, index) => paintPart(part, points[index], animate)).filter(Boolean);
    layer.dataset.destination = target?.dataset.headerInkTarget ?? 'brand';
    layer.dataset.motion = animations.length ? 'moving' : 'settled';
    Promise.all(animations.map((animation) => animation!.finished)).then(
      () => {
        if (current === generation) layer.dataset.motion = 'settled';
      },
      () => undefined,
    );
  };
}

function createSelection(header: HTMLElement) {
  let hovered: HTMLElement | null = null;
  let focused: HTMLElement | null = null;
  return {
    current: () => hovered ?? focused ?? restingTarget(header),
    hover: (target: EventTarget | null) => {
      hovered = inkTarget(target, header);
    },
    focus: (target: EventTarget | null) => {
      focused = inkTarget(target, header);
    },
  };
}

function trackSelection(header: HTMLElement, draw: () => void, selection: ReturnType<typeof createSelection>) {
  const over = (event: PointerEvent) => {
    selection.hover(event.target);
    draw();
  };
  const leave = () => {
    selection.hover(null);
    draw();
  };
  const focus = (event: FocusEvent) => {
    selection.focus(event.target);
    draw();
  };
  const blur = (event: FocusEvent) => {
    selection.focus(event.relatedTarget);
    draw();
  };
  header.addEventListener('pointerover', over);
  header.addEventListener('pointerleave', leave);
  header.addEventListener('focusin', focus);
  header.addEventListener('focusout', blur);
  return () => {
    header.removeEventListener('pointerover', over);
    header.removeEventListener('pointerleave', leave);
    header.removeEventListener('focusin', focus);
    header.removeEventListener('focusout', blur);
  };
}

function observeLayout(header: HTMLElement, layout: () => void, changed: () => void) {
  const resize = new ResizeObserver(layout);
  resize.observe(header);
  header.querySelectorAll(`${BRAND}, ${TARGET}`).forEach((item) => resize.observe(item));
  const navigation = header.querySelector('[data-testid="site-nav"]');
  const state = new MutationObserver(changed);
  if (navigation)
    state.observe(navigation, {
      attributes: true,
      subtree: true,
      attributeFilter: ['data-state', 'data-active', 'aria-current'],
    });
  return () => {
    resize.disconnect();
    state.disconnect();
  };
}

function createDrawing(header: HTMLElement, layer: HTMLElement) {
  const selection = createSelection(header);
  const paint = createPainter(layer, header);
  const desktop = window.matchMedia('(min-width: 64rem)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previous: HTMLElement | null | undefined;
  const draw = (animate: boolean, force: boolean) => {
    if (!desktop.matches) {
      delete header.dataset.inkReady;
      return;
    }
    const target = selection.current();
    if (!force && previous === target) return;
    paint(target, animate && !reduced.matches && previous !== undefined);
    previous = target;
    header.dataset.inkReady = 'true';
  };
  return { selection, desktop, reduced, draw: () => draw(true, false), reset: () => draw(false, true) };
}

export function mountHeaderInk(layer: HTMLElement) {
  const header = layer.closest('header')!;
  const { selection, desktop, reduced, draw, reset } = createDrawing(header, layer);
  const stopTracking = trackSelection(header, draw, selection);
  const stopObserving = observeLayout(header, reset, draw);
  desktop.addEventListener('change', reset);
  reduced.addEventListener('change', reset);
  reset();
  return () => {
    stopTracking();
    stopObserving();
    desktop.removeEventListener('change', reset);
    reduced.removeEventListener('change', reset);
    layer.querySelectorAll('span').forEach((part) => part.getAnimations().forEach((animation) => animation.cancel()));
    delete header.dataset.inkReady;
  };
}
