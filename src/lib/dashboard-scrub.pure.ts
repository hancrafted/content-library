export interface ScrubJob {
  start: number | null;
  end: number | null;
}

/**
 * A point on a replay rail: `at` (a moment in epoch milliseconds, or a stage index fraction as Graph geometry lays
 * them) and the position, 0 to 1, it sits at along the rail.
 */
export interface RailStop {
  at: number;
  position: number;
}

/** The replayed span of a Run, epoch milliseconds from `start` to `end`. */
export interface ReplayRange {
  start: number;
  end: number;
}

export function snapScrubPosition(position: number, stageCount: number): number {
  const gaps = Math.max(1, stageCount - 1);
  const stage = Math.round(position * gaps) / gaps;
  return Math.abs(stage - position) <= Math.min(0.008, 0.08 / gaps) ? stage : position;
}

/** Only observed ends supply partial replay progress; open work never borrows an estimated end. */
export function jobProgress(job: ScrubJob, at: number): number {
  if (job.start === null || job.end === null || at < job.start) return 0;
  const end = job.end;
  return end <= job.start ? 1 : Math.min(1, (at - job.start) / (end - job.start));
}

function stagePosition(stages: readonly (readonly ScrubJob[])[], at: number) {
  return stages.reduce((position, jobs, index) => {
    if (!jobs.some((job) => job.start !== null && job.start <= at)) return position;
    const runningStart = jobs.reduce(
      (furthest, job, jobIndex) =>
        job.start !== null && job.start <= at && job.end === null
          ? Math.max(furthest, jobIndex / jobs.length)
          : furthest,
      0,
    );
    const completed = jobs.reduce((sum, job) => sum + jobProgress(job, at), 0) / jobs.length;
    const progress = Math.max(runningStart, completed);
    return Math.min(1, Math.max(position, (index + progress) / Math.max(1, stages.length)));
  }, 0);
}

export function jobTimings(
  jobs: readonly { id: string; span?: { start_t: string; end_t: string | null } }[],
): ReadonlyMap<string, ScrubJob> {
  return new Map(
    jobs.map((job) => [
      job.id,
      {
        start: job.span ? Date.parse(job.span.start_t) : null,
        end: job.span?.end_t ? Date.parse(job.span.end_t) : null,
      },
    ]),
  );
}

function validateRange(range: ReplayRange) {
  if (!Number.isFinite(range.start) || !Number.isFinite(range.end) || range.end < range.start) {
    throw new RangeError('Replay needs a finite, ordered range.');
  }
}

/** Equal Job shares within each stage gap; parallel Jobs contribute together. No duration is predicted. */
export function scrubTimeline(stages: readonly (readonly ScrubJob[])[], range: ReplayRange): RailStop[] {
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
      position: stagePosition(stages, at),
    }));
}

function interpolate(value: number, a: RailStop, b: RailStop) {
  return b.at === a.at ? b.position : a.position + ((value - a.at) / (b.at - a.at)) * (b.position - a.position);
}

export function scrubPosition(timeline: readonly RailStop[], at: number): number {
  const next = timeline.findIndex((point) => point.at >= at);
  if (next < 0) return timeline.at(-1)?.position ?? 0;
  if (next === 0) return timeline[0].position;
  const a = timeline[next - 1];
  const b = timeline[next];
  return interpolate(at, a, b);
}

/** Plateaus choose their latest observed moment; reaching the observed leading edge means Live. */
export function scrubTime(timeline: readonly RailStop[], position: number): number {
  const last = timeline.at(-1)!;
  if (position >= last.position) return last.at;
  if (position <= 0) return timeline[0].at;
  const next = timeline.findIndex((point) => point.position > position);
  if (next <= 0) return next < 0 ? last.at : timeline[0].at;
  const a = timeline[next - 1];
  const b = timeline[next];
  return interpolate(position, { at: a.position, position: a.at }, { at: b.position, position: b.at });
}
