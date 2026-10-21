import { createLogFold, latestRun, lineErrors, parseLog } from '../../skills/new-episode/scripts/run-log.pure';
import type { RunLogLine, Span } from '../../skills/new-episode/scripts/run-log.schema.pure';
import type { DashboardEvent } from './dashboard-events.pure';
import {
  parseDashboardPipeline,
  projectDashboard,
  type DashboardPipeline,
  type DashboardView,
} from './dashboard-projection.pure';
import { createLogStream } from './dashboard-stream.pure';
import type { EpisodeFolder } from './episode-folder.pure';

export interface EpisodeRead {
  condition: 'live' | 'waiting' | 'error';
  offset: number;
  lines: number;
  errors: string[];
  events: readonly DashboardEvent[];
  pipeline?: DashboardPipeline;
  view?: DashboardView;
  /** The Run started latest, as the fold orders Runs; absent before any Run starts. */
  run?: Span;
}

/** A reading and when it finished, epoch milliseconds: the dashboard's "now" without a render-time clock. */
export interface Polled {
  read: EpisodeRead;
  readAt: number;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

function lineError(line: RunLogLine): string | undefined {
  const errors = lineErrors(line);
  if (errors.length > 0) return errors.join('; ');
  return Number.isFinite(Date.parse(line.t)) ? undefined : 'invalid timestamp.';
}

class EpisodeReader {
  private stream = createLogStream();
  private log = createLogFold({ live: 'unfinished' });
  private pipeline?: DashboardPipeline;
  private pipelineModified?: number;
  private pipelineError?: string;
  private lineNumber = 0;
  private errors: string[] = [];
  private events: DashboardEvent[] = [];
  private eventSnapshot: readonly DashboardEvent[] = [];
  private reading = 'pipeline.yml';

  constructor(
    private folder: EpisodeFolder,
    private now: () => number,
  ) {}

  private result(condition: EpisodeRead['condition'], errors = this.errors): EpisodeRead {
    const folded = this.log.snapshot();
    const orphans = folded.orphans.map((line) => `events.jsonl: ${line.kind} for unknown span ${line.span_id}.`);
    if (this.eventSnapshot.length !== this.events.length) this.eventSnapshot = this.events.slice();
    return {
      condition: orphans.length > 0 && condition === 'live' ? 'error' : condition,
      offset: this.stream.offset,
      lines: this.lineNumber,
      errors: [...errors, ...orphans],
      events: this.eventSnapshot,
      pipeline: this.pipeline,
      view: this.pipeline ? projectDashboard(this.pipeline, folded) : undefined,
      run: latestRun(folded),
    };
  }

  private async readPipeline(): Promise<void> {
    const { lastModified } = await this.folder.stat('pipeline.yml');
    if (this.pipelineModified === lastModified) return;
    const text = await this.folder.readText('pipeline.yml');
    this.pipelineModified = lastModified;
    try {
      this.pipeline = parseDashboardPipeline(text);
      this.pipelineError = undefined;
    } catch (error) {
      this.pipelineError = `pipeline.yml: ${messageOf(error)}`;
    }
  }

  private acceptLine(raw: string): void {
    this.lineNumber += 1;
    if (raw.trim() === '') return;
    const line = parseLog(raw).lines[0];
    const prefix = `events.jsonl line ${this.lineNumber}: `;
    const event: DashboardEvent = { number: this.lineNumber, raw };
    this.events.push(event);
    if (!line) {
      event.error = `${prefix}not a JSON object.`;
      this.errors.push(event.error);
      return;
    }
    const invalid = lineError(line);
    if (invalid) event.error = `${prefix}${invalid}`;
    if (event.error) this.errors.push(event.error);
    else {
      event.line = line;
      this.log.append([line]);
    }
  }

  private async readEvents(): Promise<EpisodeRead> {
    const file = await this.folder.stat('events.jsonl');
    if (file.size < this.stream.offset) {
      this.stream.append(new Uint8Array(), file.size);
      this.log = createLogFold({ live: 'unfinished' });
      this.lineNumber = 0;
      this.errors = [];
      this.events = [];
      this.eventSnapshot = [];
    }
    if (file.size > this.stream.offset) {
      const bytes = await this.folder.readBytes('events.jsonl', this.stream.offset);
      const { lines } = this.stream.append(bytes, file.size);
      lines.forEach((raw) => this.acceptLine(raw));
    }
    return this.result(this.errors.length > 0 ? 'error' : 'live');
  }

  async poll(): Promise<Polled> {
    const read = await this.read();
    return { read, readAt: this.now() };
  }

  private async read(): Promise<EpisodeRead> {
    this.reading = 'pipeline.yml';
    try {
      await this.readPipeline();
      if (this.pipelineError !== undefined) return this.result('error', [...this.errors, this.pipelineError]);
      this.reading = 'events.jsonl';
      return await this.readEvents();
    } catch (error) {
      const missing = error instanceof Error && error.name === 'NotFoundError';
      const waiting = this.reading === 'events.jsonl' && missing;
      const detail = `${this.reading}: ${missing ? 'Waiting for file. ' : ''}${messageOf(error)}`;
      return this.result(waiting ? 'waiting' : 'error', [...this.errors, detail]);
    }
  }
}

/**
 * The poll step, one per chosen folder: fresh stats each poll, YAML re-read only when modified, only appended bytes
 * read, an unfinished last line carried, and a shrunk events.jsonl read as replaced. `now` stamps each reading.
 */
export function createEpisodeReader(folder: EpisodeFolder, now: () => number) {
  return new EpisodeReader(folder, now);
}

/** Opens a chosen folder with its first reading; rejects, naming the problem, when its pipeline.yml can't be read. */
export async function openEpisode(folder: EpisodeFolder, now: () => number) {
  const reader = createEpisodeReader(folder, now);
  const initial = await reader.poll();
  if (initial.read.pipeline === undefined) throw new Error(initial.read.errors.join('\n'));
  return { reader, initial };
}
