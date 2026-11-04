import {
  clampInk,
  easeInk,
  floodedInk,
  inkContact,
  inkDistance,
  inkPath,
  inkShapes,
  inkVertices,
  interpolateInk,
  separatedInk,
  smoothInk,
} from './magnetic-ink-geometry.pure';
import type { InkHost, InkInput, InkPoint, InkRect, InkShape, InkState, InkView } from './magnetic-ink.types';

const CARD_TRAVEL_MS = 650 / 1.5;

export function newInkState(host: InkHost): InkState {
  return {
    host,
    contact: { x: host.surface.x, y: host.surface.y, nx: 0, ny: -1, distance: 0 },
    inside: false,
    flight: 0,
    primaryFill: 0,
    primaryShapes: [],
    secondaryShapes: [],
  };
}

function travelInk(state: InkState) {
  const end = state.host.primary!;
  const start = state.contact;
  const p = smoothInk(state.flight);
  const x = start.x + (end.x + end.width / 2 - start.x) * p;
  const y = start.y + (end.y + end.height / 2 - start.y) * p;
  const fade = 1 - smoothInk((state.flight - 0.8) / 0.2);
  return inkShapes({ x, y, nx: start.nx, ny: start.ny, distance: Math.sin(p * Math.PI) * 36 }, 1, 34).map((shape) => ({
    ...shape,
    rx: shape.rx * fade,
    ry: shape.ry * fade,
  }));
}

function primaryGoals(state: InkState, pointer: InkPoint | null) {
  if (!pointer) return [];
  const { surface, primary, reach = 200 } = state.host;
  if (state.inside && primary) return travelInk(state);
  if (state.inside) return floodedInk(surface, pointer);
  const strength = clampInk(1 - state.contact.distance / reach);
  return inkShapes(state.contact, strength, primary ? 52 : surface.height);
}

function secondaryGoals(state: InkState, pointer: InkPoint | null) {
  const rect = state.host.secondary;
  if (!state.inside || !rect || !pointer) return [];
  if (inkDistance(rect, pointer) <= 0) return floodedInk(rect, pointer);
  if (state.host.primary && inkDistance(state.host.primary, pointer) <= 0) return [];
  const contact = inkContact(rect, pointer);
  return inkShapes(contact, clampInk(1 - contact.distance / 240), rect.height);
}

const overInk = (rect: InkRect | undefined, pointer: InkPoint | null) =>
  Boolean(rect && pointer && inkDistance(rect, pointer) <= 0);
const isTravelling = (state: InkState) => state.inside && state.host.primary !== undefined && state.flight < 1;

function advanceEntry(state: InkState, input: InkInput) {
  const inside = overInk(state.host.surface, input.pointer);
  if (!input.pointer) {
    state.inside = false;
    return false;
  }
  if (!inside) state.contact = inkContact(state.host.surface, input.pointer);
  if (inside && !state.inside) {
    state.flight = 0;
    if (!state.primaryShapes.length) state.contact = inkContact(state.host.surface, input.pointer);
  }
  state.inside = inside;
  if (inside) state.flight = Math.min(1, state.flight + input.delta / CARD_TRAVEL_MS);
  return isTravelling(state);
}

function drawPaths(shapes: InkShape[], surface: InkRect, neighbours: InkRect[]) {
  return shapes.map((shape, index) => {
    if (shape.rx < 0.1 || shape.ry < 0.1) return '';
    const vertices = inkVertices(shape).map((point) => (index ? separatedInk(point, surface, neighbours) : point));
    return inkPath(vertices.map((point) => ({ x: point.x - surface.x, y: point.y - surface.y })));
  });
}

function activeStrength(state: InkState) {
  return state.inside ? 1 : clampInk(1 - state.contact.distance / (state.host.reach ?? 200));
}

function primaryOrigin(state: InkState) {
  const rect = state.host.primary ?? state.host.surface;
  const contact = inkContact(rect, state.contact);
  return { x: contact.x - rect.x, y: contact.y - rect.y };
}

function actionStage(state: InkState, secondary: boolean): InkView['stage'] {
  if (!state.inside) return 'outside';
  if (secondary) return 'secondary';
  return state.host.primary && state.flight < 1 ? 'travelling' : 'primary';
}

export function inkFrame(state: InkState, input: InkInput, neighbours: InkHost[]): InkView {
  const entryMoving = advanceEntry(state, input);
  const pointer = input.pointer;
  const primary = interpolateInk(state.primaryShapes, primaryGoals(state, pointer), input.delta);
  const secondary = interpolateInk(state.secondaryShapes, secondaryGoals(state, pointer), input.delta);
  state.primaryShapes = primary.shapes;
  state.secondaryShapes = secondary.shapes;
  return actionFrame({ state, pointer, primary, secondary, entryMoving, input, neighbours });
}

interface DrawInput {
  state: InkState;
  pointer: InkPoint | null;
  primary: ReturnType<typeof interpolateInk>;
  secondary: ReturnType<typeof interpolateInk>;
  entryMoving: boolean;
  input: InkInput;
  neighbours: InkHost[];
}

function fillGoal(state: InkState, secondaryInside: boolean) {
  if (!state.host.primary) return Number(state.inside);
  return state.inside && !secondaryInside ? smoothInk((state.flight - 0.8) / 0.2) : 0;
}
function actionFrame(draw: DrawInput): InkView {
  const { state, pointer, primary, secondary, input } = draw;
  const secondaryInside = state.inside && overInk(state.host.secondary, pointer);
  const fill = fillGoal(state, secondaryInside);
  state.primaryFill = easeInk(state.primaryFill, fill, input.delta);
  const neighbourRects = state.inside ? [] : draw.neighbours.map((host) => host.surface);
  return {
    paths: drawPaths(primary.shapes, state.host.surface, neighbourRects),
    secondaryPaths: state.host.secondary ? drawPaths(secondary.shapes, state.host.secondary, []) : [],
    primaryFill: state.primaryFill,
    secondaryFill: Number(secondaryInside),
    strength: pointer ? activeStrength(state) : 0,
    stage: actionStage(state, secondaryInside),
    primaryHovered: state.inside && overInk(state.host.primary, pointer),
    origin: primaryOrigin(state),
    moving: [draw.entryMoving, primary.moving, secondary.moving, state.primaryFill !== fill].some(Boolean),
  };
}
