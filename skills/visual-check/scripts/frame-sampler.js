// Frame-time sampler: paste this file into a page (claude-in-chrome's javascript tool, or `frame-sample.ts`), then
// `await sampleFrames({ ... })`. It records requestAnimationFrame deltas while an ambient loop plays, or while it
// scrolls the page through a Slide transition, and returns { frames, slowFrames, slowShare, p95 }. Plain JavaScript
// with no imports, so it runs pasted as is. See ../SKILL.md, "Frame time".

/** A frame slower than this misses 60 fps. */
const FRAME_BUDGET_MS = 16.7;

/**
 * Frame statistics from rAF deltas in milliseconds: how many frames, how many missed the budget, their share
 * (rounded to 0.001) and the 95th-percentile delta (nearest rank, rounded to 0.1 ms).
 * @param {readonly number[]} deltas
 * @param {number} [budget]
 */
function frameStats(deltas, budget = FRAME_BUDGET_MS) {
  if (deltas.length === 0) return { frames: 0, slowFrames: 0, slowShare: 0, p95: 0 };
  const sorted = [...deltas].sort((a, b) => a - b);
  const slowFrames = deltas.filter((delta) => delta > budget).length;
  const rank = Math.ceil(0.95 * sorted.length) - 1;
  return {
    frames: deltas.length,
    slowFrames,
    slowShare: Math.round((slowFrames / deltas.length) * 1000) / 1000,
    p95: Math.round(sorted[rank] * 10) / 10,
  };
}

/**
 * The scroll range that plays a Slide transition: from where the outgoing Slide's bottom enters the viewport to where
 * it has passed the top, so the edge's progress runs 0 to 1 inside it.
 * @param {string} outgoing the outgoing Slide wrapper's id, e.g. `a-thought-experiment--a-skill-hands-the-ai-your-procedure`
 */
function transitionRange(outgoing) {
  const wrapper = document.getElementById(outgoing);
  if (!wrapper) throw new Error(`No Slide wrapper with id ${outgoing}.`);
  const bottom = wrapper.getBoundingClientRect().bottom + window.scrollY;
  return { from: bottom - window.innerHeight * 1.1, to: bottom };
}

/**
 * Samples frames for `ms` milliseconds. With `transition` (an outgoing Slide id) or `scroll` ({ from, to } in page
 * pixels) it scrolls linearly through that range while sampling; without either it only watches, for ambient loops.
 * Bring the tab to the front first: a background tab fires no rAF.
 * @param {{ ms?: number, transition?: string, scroll?: { from: number, to: number }, budget?: number }} [options]
 */
async function sampleFrames({ ms = 3000, transition, scroll, budget } = {}) {
  const range = transition ? transitionRange(transition) : scroll;
  if (range) window.scrollTo(0, range.from);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const deltas = [];
  await new Promise((resolve) => {
    let start;
    let last;
    const tick = (now) => {
      if (start === undefined) start = now;
      else deltas.push(now - last);
      last = now;
      const t = Math.min(1, (now - start) / ms);
      if (range) window.scrollTo(0, range.from + (range.to - range.from) * t);
      if (t < 1) requestAnimationFrame(tick);
      else resolve(undefined);
    };
    requestAnimationFrame(tick);
  });
  return frameStats(deltas, budget);
}

globalThis.frameStats = frameStats;
globalThis.sampleFrames = sampleFrames;
