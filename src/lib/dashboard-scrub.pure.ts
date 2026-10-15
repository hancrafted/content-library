export interface ScrubJob {
  start: number | null;
  end: number | null;
}

interface Point {
  at: number;
  position: number;
}

function jobProgress(job: ScrubJob, at: number, latest: number): number {
  if (job.start === null || at < job.start) return 0;
  const end = job.end ?? latest;
  return end <= job.start ? 1 : Math.min(1, (at - job.start) / (end - job.start));
}

function stagePosition(stages: readonly (readonly ScrubJob[])[], at: number, latest: number) {
  return stages.slice(0, -1).reduce((position, jobs, index) => {
    if (!jobs.some((job) => job.start !== null && job.start <= at)) return position;
    const progress = jobs.reduce((sum, job) => sum + jobProgress(job, at, latest), 0) / jobs.length;
    return Math.max(position, (index + progress) / Math.max(1, stages.length - 1));
  }, 0);
}

function validateRange(range: { start: number; end: number }) {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end < range.start) {
    throw new RangeError('Replay needs a finite, ordered range.');
  }
}

/** Equal Job shares within each stage gap; parallel Jobs contribute together. No duration is predicted. */
export function scrubTimeline(
  stages: readonly (readonly ScrubJob[])[],
  range: { start: number; end: number },
): Point[] {
  validateRange(range);
  const times = new Set([range.start, range.end]);
  for (const jobs of stages) {
    for (const job of jobs) {
      if (job.start !== null) times.add(Math.max(range.start, Math.min(range.end, job.start)));
      if (job.end !== null) times.add(Math.max(range.start, Math.min(range.end, job.end)));
    }
  }
  return [...times]
    .sort((a, b) => a - b)
    .map((at) => ({
      at,
      position: at === range.end ? 1 : stagePosition(stages, at, range.end),
    }));
}

function interpolate(value: number, a: Point, b: Point) {
  return b.at === a.at ? b.position : a.position + ((value - a.at) / (b.at - a.at)) * (b.position - a.position);
}

export function scrubPosition(timeline: readonly Point[], at: number): number {
  const next = timeline.findIndex((point) => point.at >= at);
  if (next < 0) return 1;
  if (next === 0) return timeline[0].position;
  const a = timeline[next - 1];
  const b = timeline[next];
  return interpolate(at, a, b);
}

/** Plateaus choose their latest observed moment; the terminal point always means Live. */
export function scrubTime(timeline: readonly Point[], position: number): number {
  if (position <= 0) return timeline[0].at;
  const last = timeline.at(-1)!;
  if (position >= 1) return last.at;
  const next = timeline.findIndex((point) => point.position > position);
  if (next <= 0) return next < 0 ? last.at : timeline[0].at;
  const a = timeline[next - 1];
  const b = timeline[next];
  return interpolate(position, { at: a.position, position: a.at }, { at: b.position, position: b.at });
}
