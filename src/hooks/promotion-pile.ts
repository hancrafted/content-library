import { createPaperFlights } from '@/hooks/promotion-paper-flights';
import { paperOverflow } from '@/lib/paper-overflow.pure';
import { advancePaperPile, PAPER_CAPACITY, type PaperDrain } from '@/lib/paper-pile.pure';
import gsap from 'gsap';

function drawPile(papers: SVGGElement[], before: number, after: number) {
  const start = Math.max(0, Math.floor(Math.min(before, after)) - 1);
  const end = Math.min(papers.length, Math.ceil(Math.max(before, after)) + 1);
  papers.slice(start, end).forEach((paper, offset) => {
    const progress = Math.max(0, Math.min(1, after - start - offset));
    paper.setAttribute('opacity', String(progress));
    paper.setAttribute('transform', `translate(${(1 - progress) * -16} ${(1 - progress) * -110})`);
  });
}

function pileState() {
  return {
    count: 0,
    draining: 'none' as PaperDrain,
    ready: false,
    stopped: false,
    wait: 0,
    overflow: paperOverflow(Math.random()),
  };
}

type PileState = ReturnType<typeof pileState>;

function spillTop(state: PileState, papers: SVGGElement[], flights: ReturnType<typeof createPaperFlights>) {
  if (state.wait < state.overflow.delay) return;
  flights.launch(papers[PAPER_CAPACITY - 1], PAPER_CAPACITY - 1, state.overflow);
  drawPile(papers, state.count, state.count - 1);
  state.count -= 1;
  state.wait = 0;
  state.overflow = paperOverflow(Math.random());
}

function pileTicker(state: PileState, papers: SVGGElement[], flights: ReturnType<typeof createPaperFlights>) {
  return (_time: number, delta: number) => {
    const elapsed = Math.min(delta / 1000, 0.05);
    const drain = state.ready ? state.draining : 'none';
    const next = advancePaperPile(state.count, elapsed, drain);
    for (let index = Math.ceil(state.count) - 1; index >= Math.ceil(next); index--) {
      flights.launch(papers[index], index);
    }
    if (next !== state.count) drawPile(papers, state.count, next);
    state.count = next;
    if (drain !== 'none') state.wait = 0;
    if (next >= PAPER_CAPACITY - 1) state.wait += elapsed;
    if (next === PAPER_CAPACITY) spillTop(state, papers, flights);
  };
}

export function createPaperPile(root: HTMLElement) {
  const papers = Array.from(root.querySelectorAll<SVGGElement>('[data-task-paper]'));
  const state = pileState();
  const flights = createPaperFlights(root);
  const tick = pileTicker(state, papers, flights);
  gsap.ticker.add(tick);
  return {
    enable: () => {
      state.ready = true;
    },
    setDraining: (draining: PaperDrain) => {
      state.draining = draining;
    },
    suspend: (suspended: boolean) => {
      gsap.ticker.remove(tick);
      flights.suspend(suspended);
      if (!suspended && !state.stopped) gsap.ticker.add(tick);
    },
    stop: () => {
      state.stopped = true;
      gsap.ticker.remove(tick);
      flights.stop();
      drawPile(papers, state.count, 0);
      state.count = 0;
    },
  };
}
