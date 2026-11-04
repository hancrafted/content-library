import { createMagneticInk, type InkHost, type InkPoint, type InkView } from '@/shared/lib/magnetic-ink';

interface Clock {
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
  ownerAt?: (point: InkPoint) => string | null;
}
export interface InkAttachment {
  read: () => InkHost;
  paint: (view: InkView) => void;
}
interface Registration {
  attachment: InkAttachment;
  host: ReturnType<ReturnType<typeof createMagneticInk>['register']>;
}
interface PageState {
  ink: ReturnType<typeof createMagneticInk>;
  registrations: Map<string, Registration>;
  clock: Clock;
  frame: number;
  last: number;
  enabled: boolean;
  disposed: boolean;
  pointer: InkPoint | null;
  owner?: string | null;
}

/** One page's scheduler. Browser listeners and native elements are supplied by the local adapters. */
export function createInkPage(clock: Clock) {
  const state: PageState = {
    ink: createMagneticInk(),
    registrations: new Map(),
    clock,
    frame: 0,
    last: 0,
    enabled: true,
    disposed: false,
    pointer: null,
  };
  return {
    attach: (id: string, attachment: InkAttachment) => attachHost(state, id, attachment),
    follow: (pointer: InkPoint | null, owner?: string | null) => {
      state.pointer = pointer;
      state.owner = owner;
      refresh(state);
    },
    refresh: () => refresh(state),
    enable: (enabled: boolean) => enable(state, enabled),
    dispose: () => {
      enable(state, false);
      state.disposed = true;
      state.ink.dispose();
      state.registrations.clear();
    },
  };
}

function paint(state: PageState, delta: number) {
  const result = state.ink.frame({ pointer: state.pointer, owner: state.owner, enabled: state.enabled, delta });
  result.hosts.forEach((view, id) => state.registrations.get(id)?.attachment.paint(view));
  return result.moving;
}

function draw(state: PageState, time: number) {
  state.frame = 0;
  const delta = state.last ? time - state.last : 16;
  state.last = time;
  if (paint(state, delta)) wake(state);
  else state.last = 0;
}

function wake(state: PageState) {
  if (!state.frame && !state.disposed) state.frame = state.clock.request((time) => draw(state, time));
}

function refresh(state: PageState) {
  if (state.disposed) return;
  state.registrations.forEach(({ host, attachment }) => host.update(attachment.read()));
  if (state.pointer && state.clock.ownerAt) state.owner = state.clock.ownerAt(state.pointer);
  wake(state);
}

function enable(state: PageState, enabled: boolean) {
  state.enabled = enabled;
  if (enabled) {
    refresh(state);
    return;
  }
  state.clock.cancel(state.frame);
  state.frame = 0;
  state.last = 0;
  state.registrations.forEach(({ host, attachment }) => host.update(attachment.read()));
  paint(state, 0);
}

function attachHost(state: PageState, id: string, attachment: InkAttachment) {
  const host = state.ink.register(id, attachment.read());
  const entry = { host, attachment };
  state.registrations.set(id, entry);
  wake(state);
  return () => {
    if (state.registrations.get(id) !== entry) return;
    host.dispose();
    state.registrations.delete(id);
    refresh(state);
  };
}
