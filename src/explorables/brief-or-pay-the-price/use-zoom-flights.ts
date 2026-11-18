import { useCallback, useLayoutEffect, useMemo, useRef, type Dispatch, type RefObject } from 'react';
import { useBraceFlight } from './brace-flight.client';
import type { ExplorableEvent, ExplorableState, Level } from './explorable-state.pure';
import { yieldingToViewer } from './flight-schedule.pure';
import type { Layout, PlainScenario } from './scenario.types';
import { assembleFrom, enterNodes, growFrom, shrinkInto, visibleWorkflow, type Source } from './zoom-flights';
import { entriesOf, isNarrow, originOf } from './zoom-geometry.pure';

type Job =
  | { readonly kind: 'assemble'; readonly source: Source; readonly chips: readonly DOMRect[] }
  | { readonly kind: 'grow'; readonly node: string }
  | { readonly kind: 'enter'; readonly node: string | null };

export interface ZoomFlightsInput {
  readonly container: RefObject<HTMLElement | null>;
  readonly state: ExplorableState;
  readonly scenario: PlainScenario;
  readonly dispatch: Dispatch<ExplorableEvent>;
}

const ZOOM_ROOT = '[data-zoom-root]';

const sourceOf = (view: ExplorableState['view']): Source => (view === 'price' || view === 'brief' ? view : null);

const chipsOf = (container: HTMLElement, source: Source): DOMRect[] =>
  source === null
    ? []
    : [...container.querySelectorAll(`[data-mirror="${source}"] [data-trait-initial]`)].map((chip) =>
        chip.getBoundingClientRect(),
      );

function zoomJob(level: Level, current: ExplorableState, root: HTMLElement | null): Job | null {
  if (level === 'workflow' && current.level === 'agent') return { kind: 'enter', node: current.node };
  if (level !== 'agent' || current.level !== 'define' || root === null) return null;
  const source = sourceOf(current.view);
  return { kind: 'assemble', source, chips: chipsOf(root, source) };
}

function jobFor(event: ExplorableEvent, current: ExplorableState, root: HTMLElement | null): Job | null {
  if (event.type === 'zoom') return zoomJob(event.level, current, root);
  const entering = event.type === 'node' && (current.level !== 'agent' || current.node !== event.node);
  return entering ? { kind: 'grow', node: event.node } : null;
}

const isBraceDeparture = (event: ExplorableEvent, current: ExplorableState): boolean =>
  event.type === 'zoom' && event.level === 'workflow' && current.level === 'define' && current.view === 'brace';

interface Landing {
  readonly root: HTMLElement;
  readonly zoomRoot: HTMLElement | null;
  readonly scenario: PlainScenario;
  readonly layout: Layout;
}

function landAssembly(todo: Extract<Job, { kind: 'assemble' }>, { root }: Landing): void {
  const matrix = root.querySelector<HTMLElement>('[data-matrix]');
  if (matrix) assembleFrom(matrix, todo.source, todo.chips);
}

function landGrowth(todo: Extract<Job, { kind: 'grow' }>, { root, zoomRoot, layout }: Landing): void {
  if (zoomRoot) growFrom(zoomRoot, originOf(layout, todo.node));
  root.querySelector<HTMLElement>('[data-agent-back]')?.focus();
}

function landEntry(todo: Extract<Job, { kind: 'enter' }>, { root, scenario }: Landing): void {
  const svg = visibleWorkflow(root);
  if (svg === undefined) return;
  const vertical = svg.getAttribute('data-orient') === 'vertical';
  enterNodes(svg, entriesOf(scenario.layouts[vertical ? 'vertical' : 'horizontal'], scenario.nodes), vertical);
  if (todo.node !== null) svg.querySelector<SVGElement>(`[data-node="${todo.node}"]`)?.focus();
}

function land(todo: Job, landing: Landing): void {
  if (todo.kind === 'assemble') landAssembly(todo, landing);
  else if (todo.kind === 'grow') landGrowth(todo, landing);
  else landEntry(todo, landing);
}

function useLayoutInUse(container: RefObject<HTMLElement | null>, scenario: PlainScenario): () => Layout {
  return useCallback(() => {
    const width = container.current?.clientWidth ?? Infinity;
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return scenario.layouts[isNarrow(width, rem) ? 'vertical' : 'horizontal'];
  }, [container, scenario]);
}

function useLanding(input: ZoomFlightsInput, job: RefObject<Job | null>, layoutInUse: () => Layout): void {
  const { container, state, scenario } = input;
  useLayoutEffect(() => {
    const todo = job.current;
    const root = container.current;
    job.current = null;
    if (todo === null || root === null) return;
    const zoomRoot = root.querySelector<HTMLElement>(ZOOM_ROOT);
    zoomRoot?.getAnimations().forEach((animation) => animation.cancel());
    land(todo, { root, zoomRoot, scenario, layout: layoutInUse() });
  }, [state.level, state.node, container, scenario, layoutInUse, job]);
}

export function useZoomFlights(input: ZoomFlightsInput): Dispatch<ExplorableEvent> {
  const { container, state, scenario, dispatch } = input;
  const brace = useBraceFlight({ container, scenario, level: state.level, dispatch });
  const viewerDispatch = useMemo(() => yieldingToViewer(dispatch, brace.cancel), [dispatch, brace.cancel]);
  const job = useRef<Job | null>(null);
  const latest = useRef(state);
  const layoutInUse = useLayoutInUse(container, scenario);
  useLayoutEffect(() => {
    latest.current = state;
  });
  useLanding(input, job, layoutInUse);
  return useCallback(
    (event: ExplorableEvent) => {
      const current = latest.current;
      if (isBraceDeparture(event, current)) return brace.depart();
      const next = jobFor(event, current, container.current);
      job.current = next ?? job.current;
      const zoomRoot = container.current?.querySelector<HTMLElement>(ZOOM_ROOT);
      if (next?.kind !== 'enter' || !zoomRoot) return viewerDispatch(event);
      return void shrinkInto(zoomRoot, originOf(layoutInUse(), 'goal')).then(() => viewerDispatch(event));
    },
    [brace, container, layoutInUse, viewerDispatch],
  );
}
