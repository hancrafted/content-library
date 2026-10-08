import { advancePaperPile } from '@/lib/paper-pile.pure';
import gsap from 'gsap';

function drawPile(papers: SVGGElement[], before: number, after: number) {
  const start = Math.max(0, Math.floor(Math.min(before, after)) - 1);
  const end = Math.min(papers.length, Math.ceil(Math.max(before, after)) + 1);
  papers.slice(start, end).forEach((paper, offset) => {
    const progress = Math.max(0, Math.min(1, after - start - offset));
    const moving = 1 - progress;
    const x = after < before ? moving * 130 : moving * -16;
    const y = after < before ? moving * -20 : moving * -110;
    paper.setAttribute('opacity', String(progress));
    paper.setAttribute('transform', `translate(${x} ${y})`);
  });
}

export function createPaperPile(root: HTMLElement) {
  const papers = Array.from(root.querySelectorAll<SVGGElement>('[data-task-paper]'));
  const state = { count: 0, draining: false, ready: false, stopped: false };
  const tick = (_time: number, delta: number) => {
    const next = advancePaperPile(state.count, Math.min(delta / 1000, 0.05), state.ready && state.draining);
    if (next !== state.count) drawPile(papers, state.count, next);
    state.count = next;
  };
  gsap.ticker.add(tick);
  return {
    enable: () => {
      state.ready = true;
    },
    setDraining: (draining: boolean) => {
      state.draining = draining;
    },
    suspend: (suspended: boolean) => {
      gsap.ticker.remove(tick);
      if (!suspended && !state.stopped) gsap.ticker.add(tick);
    },
    stop: () => {
      state.stopped = true;
      gsap.ticker.remove(tick);
      drawPile(papers, state.count, 0);
      state.count = 0;
    },
  };
}
