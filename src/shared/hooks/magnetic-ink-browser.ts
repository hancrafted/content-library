import { createInkPage, type InkAttachment } from './magnetic-ink-page';

const makePage = (elements: Map<HTMLElement, string>) =>
  createInkPage({
    request: (draw) => window.requestAnimationFrame(draw),
    cancel: (id) => window.cancelAnimationFrame(id),
    ownerAt: (point) => ownerOf(document.elementFromPoint(point.x, point.y), elements),
  });
interface BrowserState {
  page: ReturnType<typeof createInkPage>;
  elements: Map<HTMLElement, string>;
  attachments: Map<HTMLElement, { attachment: InkAttachment; dispose: () => void }>;
  observer: ResizeObserver | null;
  mountedBefore: boolean;
  sequence: number;
}
/** Created per mounted page, never a process-wide singleton. */
export function createInkBrowser() {
  const elements = new Map<HTMLElement, string>();
  const state: BrowserState = {
    page: makePage(elements),
    elements,
    attachments: new Map(),
    observer: null,
    mountedBefore: false,
    sequence: 0,
  };
  return {
    register: (element: HTMLElement, attachment: InkAttachment) => registerHost(state, element, attachment),
    refresh: () => state.page.refresh(),
    mount: () => mountPage(state),
  };
}

function registerHost(state: BrowserState, element: HTMLElement, attachment: InkAttachment) {
  const id = `host-${++state.sequence}`;
  state.elements.set(element, id);
  const entry = { attachment, dispose: state.page.attach(id, attachment) };
  state.attachments.set(element, entry);
  state.observer?.observe(element);
  return () => {
    state.elements.delete(element);
    state.attachments.delete(element);
    entry.dispose();
    state.observer?.unobserve(element);
  };
}
function mountPage(state: BrowserState) {
  if (state.mountedBefore) {
    state.page = makePage(state.elements);
    state.attachments.forEach((entry, element) => {
      entry.dispose = state.page.attach(state.elements.get(element)!, entry.attachment);
    });
  }
  state.mountedBefore = true;
  state.observer = new ResizeObserver(state.page.refresh);
  state.elements.forEach((_, element) => state.observer!.observe(element));
  const stop = listenToPage(state.page, state.elements);
  return () => {
    stop();
    state.observer?.disconnect();
    state.page.dispose();
  };
}

function listenToPage(page: ReturnType<typeof createInkPage>, elements: Map<HTMLElement, string>) {
  const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const update = () => page.enable(media.matches && !document.hidden && document.hasFocus());
  const pointer = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    page.follow({ x: event.clientX, y: event.clientY }, ownerOf(event.target, elements));
  };
  const leave = () => page.follow(null);
  const cleanup = bindEvents({ pointer, leave, update, refresh: page.refresh });
  media.addEventListener('change', update);
  update();
  return () => {
    cleanup();
    media.removeEventListener('change', update);
  };
}

function ownerOf(target: EventTarget | null, elements: Map<HTMLElement, string>) {
  if (!(target instanceof Node)) return null;
  return [...elements].find(([element]) => element.contains(target))?.[1] ?? null;
}

interface Events {
  pointer: (event: PointerEvent) => void;
  leave: () => void;
  update: () => void;
  refresh: () => void;
}
function bindEvents(events: Events) {
  document.addEventListener('pointermove', events.pointer, { passive: true });
  document.documentElement.addEventListener('pointerleave', events.leave);
  document.addEventListener('visibilitychange', events.update);
  window.addEventListener('blur', events.update);
  window.addEventListener('focus', events.update);
  window.addEventListener('scroll', events.refresh, { passive: true });
  window.addEventListener('resize', events.refresh);
  return () => {
    document.removeEventListener('pointermove', events.pointer);
    document.documentElement.removeEventListener('pointerleave', events.leave);
    document.removeEventListener('visibilitychange', events.update);
    window.removeEventListener('blur', events.update);
    window.removeEventListener('focus', events.update);
    window.removeEventListener('scroll', events.refresh);
    window.removeEventListener('resize', events.refresh);
  };
}

export interface InkOptions {
  kind: 'button' | 'card';
  reach?: number;
  enabled?: () => boolean;
  onProximity?: (strength: number) => void;
}
export type InkBrowser = ReturnType<typeof createInkBrowser>;
