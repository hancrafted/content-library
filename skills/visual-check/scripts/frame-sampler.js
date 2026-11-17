/** A frame slower than this was dropped: at 60 fps it took two vsyncs or more. Jitter around 16.7 ms is not. */
const DROPPED_MILLISECONDS = 25;

function frameStats(deltas, threshold = DROPPED_MILLISECONDS) {
  if (deltas.length === 0) return { frames: 0, droppedFrames: 0, droppedShare: 0, p95: 0 };
  const sorted = [...deltas].sort((a, b) => a - b);
  const droppedFrames = deltas.filter((delta) => delta > threshold).length;
  const rank = Math.ceil(0.95 * sorted.length) - 1;
  return {
    frames: deltas.length,
    droppedFrames,
    droppedShare: Math.round((droppedFrames / deltas.length) * 1000) / 1000,
    p95: Math.round(sorted[rank] * 10) / 10,
  };
}

function transitionRange(outgoing) {
  const wrapper = document.getElementById(outgoing);
  if (!wrapper) throw new Error(`No Slide wrapper with id ${outgoing}.`);
  const bottom = wrapper.getBoundingClientRect().bottom + window.scrollY;
  return { from: bottom - window.innerHeight * 1.1, to: bottom };
}

async function sampleFrames({ ms = 3000, transition, scroll, threshold } = {}) {
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
  return frameStats(deltas, threshold);
}

globalThis.frameStats = frameStats;
globalThis.sampleFrames = sampleFrames;
