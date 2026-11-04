import { inkFrame, newInkState } from './magnetic-ink-frame.pure';
import { inkDistance, validateInkHost } from './magnetic-ink-geometry.pure';
import type { InkHost, InkInput, InkState, InkView } from './magnetic-ink.types';

export type { InkHost, InkInput, InkPoint, InkRect, InkView } from './magnetic-ink.types';

function validate(host: InkHost) {
  const reach = host.reach ?? 200;
  [host.surface, host.primary, host.secondary].forEach((rect) => {
    if (rect) validateInkHost(rect, reach);
  });
}

const emptyView = (): InkView => ({
  paths: [],
  secondaryPaths: [],
  primaryFill: 0,
  secondaryFill: 0,
  strength: 0,
  stage: 'outside',
  primaryHovered: false,
  origin: { x: 0, y: 0 },
  moving: false,
});
const disabledHost = (state: InkState, input: InkInput, suppressed: boolean) =>
  !input.enabled || state.host.enabled === false || suppressed || coveredHost(state, input);
const coveredHost = (state: InkState, input: InkInput) =>
  input.owner === null && input.pointer !== null && inkDistance(state.host.surface, input.pointer) <= 0;

function pointerOwner(live: [string, InkState][], input: InkInput) {
  if (input.owner !== undefined) return input.owner;
  return live.find(([, state]) => input.pointer && inkDistance(state.host.surface, input.pointer) <= 0)?.[0];
}

function frameHosts(states: Map<string, InkState>, input: InkInput) {
  const live = [...states].filter(([, state]) => state.host.enabled !== false);
  const owner = pointerOwner(live, input);
  const result = new Map<string, InkView>();
  for (const [id, state] of states) {
    const disabled = disabledHost(state, input, Boolean(owner && owner !== id));
    if (disabled) {
      Object.assign(state, newInkState(state.host));
      result.set(id, emptyView());
      continue;
    }
    const neighbours = live.filter(([other]) => other !== id).map(([, next]) => next.host);
    result.set(id, inkFrame(state, input, neighbours));
  }
  return { hosts: result, moving: [...result.values()].some((view) => view.moving) };
}

/** One page's transient registrations. It owns no browser, navigation or persisted state. */
export function createMagneticInk() {
  const hosts = new Map<string, InkState>();
  return {
    register(id: string, host: InkHost) {
      if (hosts.has(id)) throw new Error('Ink host is already registered.');
      validate(host);
      const state = newInkState(host);
      hosts.set(id, state);
      return {
        update: (next: InkHost) => {
          validate(next);
          if (hosts.get(id) === state) state.host = next;
        },
        dispose: () => {
          if (hosts.get(id) === state) hosts.delete(id);
        },
      };
    },
    frame: (input: InkInput) => frameHosts(hosts, { ...input, delta: Math.max(0, Math.min(32, input.delta)) }),
    dispose: () => hosts.clear(),
  };
}
