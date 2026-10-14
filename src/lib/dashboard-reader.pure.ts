import { createLogFold, parseLog, record } from '../../skills/new-episode/scripts/run-log.pure';
import {
  parseDashboardPipeline,
  projectDashboard,
  type DashboardPipeline,
  type DashboardView,
} from './dashboard-projection.pure';
import { createLogStream } from './dashboard-stream.pure';

/** Minimal read-only contracts implemented by browser handles and deterministic stand-ins. */
export interface EpisodeFile {
  size: number;
  lastModified: number;
  text(): Promise<string>;
  slice(start: number): { arrayBuffer(): Promise<ArrayBuffer> };
}

export interface EpisodeFolder {
  name: string;
  getFileHandle(name: string): Promise<{ getFile(): Promise<EpisodeFile> }>;
}

export interface EpisodeRead {
  condition: 'live' | 'waiting' | 'error';
  offset: number;
  lines: number;
  errors: string[];
  pipeline?: DashboardPipeline;
  view?: DashboardView;
}

const messageOf = (error: unknown): string => (error instanceof Error ? error.message : String(error));

class EpisodeReader {
  private stream = createLogStream();
  private log = createLogFold({ live: 'unfinished' });
  private pipeline?: DashboardPipeline;
  private pipelineModified?: number;
  private pipelineError?: string;
  private lineNumber = 0;
  private errors: string[] = [];
  private reading = 'pipeline.yml';

  constructor(private folder: EpisodeFolder) {}

  private result(condition: EpisodeRead['condition'], errors = this.errors): EpisodeRead {
    const folded = this.log.snapshot();
    const orphans = folded.orphans.map((line) => `events.jsonl: ${line.kind} for unknown span ${line.span_id}.`);
    return {
      condition: orphans.length > 0 && condition === 'live' ? 'error' : condition,
      offset: this.stream.offset,
      lines: this.lineNumber,
      errors: [...errors, ...orphans],
      pipeline: this.pipeline,
      view: this.pipeline ? projectDashboard(this.pipeline, folded) : undefined,
    };
  }

  private async readPipeline(): Promise<void> {
    const config = await (await this.folder.getFileHandle('pipeline.yml')).getFile();
    if (this.pipelineModified === config.lastModified) return;
    const text = await config.text();
    this.pipelineModified = config.lastModified;
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
    if (!line) {
      this.errors.push(`${prefix}not a JSON object.`);
      return;
    }
    const { seq, trace_id, span_id, ...event } = line;
    const isStart = event.kind === 'start' || event.kind === 'start-run';
    const checked = record(
      { ...event, ...(!isStart ? { span_id } : {}) },
      {
        t: line.t,
        seq,
        traceId: trace_id,
        spanId: span_id as string,
      },
    );
    if (!checked.ok) this.errors.push(`${prefix}${checked.errors.join('; ')}`);
    else if (!Number.isFinite(Date.parse(line.t))) this.errors.push(`${prefix}invalid timestamp.`);
    else this.log.append([line]);
  }

  private async readEvents(): Promise<EpisodeRead> {
    const file = await (await this.folder.getFileHandle('events.jsonl')).getFile();
    if (file.size < this.stream.offset) {
      this.stream.append(new Uint8Array(), file.size);
      this.log = createLogFold({ live: 'unfinished' });
      this.lineNumber = 0;
      this.errors = [];
    }
    if (file.size > this.stream.offset) {
      const bytes = new Uint8Array(await file.slice(this.stream.offset).arrayBuffer());
      const { lines } = this.stream.append(bytes, file.size);
      lines.forEach((raw) => this.acceptLine(raw));
    }
    return this.result(this.errors.length > 0 ? 'error' : 'live');
  }

  async poll(): Promise<EpisodeRead> {
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

/** Per-selection memory: fresh files each poll, cached YAML, buffered bytes and a shared incremental fold. */
export function createEpisodeReader(folder: EpisodeFolder) {
  return new EpisodeReader(folder);
}
