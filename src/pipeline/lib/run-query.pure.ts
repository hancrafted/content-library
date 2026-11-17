import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import type { Folded } from './run-log.schema.pure.ts';

export interface RunSource {
  episode: string;
  folded: Folded;
}

export type QueryResult =
  | { ok: true; columns: string[]; rows: Record<string, unknown>[] }
  | { ok: false; error: string };

const SPAN_COLUMNS = [
  'episode',
  'trace_id',
  'span_id',
  'parent_span_id',
  'type',
  'name',
  'status',
  'start_t',
  'end_t',
  'duration_ms',
  'summary',
  'seq',
  'job',
  'attempt',
  'role',
  'ticket',
  'retry_of',
  'link_trace_id',
  'link_span_id',
  'harness',
  'source',
  'description',
  'transcript_path',
  'request_shape',
  'run_id',
  'template_sha',
  'branch',
  'gen_ai.operation.name',
  'gen_ai.agent.name',
  'gen_ai.request.model',
  'gen_ai.response.model',
  'gen_ai.input.messages',
  'gen_ai.usage.input_tokens',
  'gen_ai.usage.output_tokens',
  'gen_ai.usage.cache_read.input_tokens',
  'skills_invoked',
] as const;

const SCORE_COLUMNS = [
  'episode',
  'trace_id',
  'span_id',
  't',
  'seq',
  'name',
  'value',
  'source',
  'rubric',
  'body',
  'via',
  'comment',
  'ticket',
] as const;

const NOTE_COLUMNS = ['episode', 'trace_id', 'span_id', 'job', 'type', 'text', 't', 'seq'] as const;

const sqlName = (column: string): string => column.replaceAll('.', '_');

function createTable(db: DatabaseSync, table: string, columns: readonly string[]): void {
  db.exec(`CREATE TABLE ${table} (${columns.map(sqlName).join(', ')})`);
}

function insertAll(
  db: DatabaseSync,
  table: { name: string; columns: readonly string[] },
  rows: Iterable<Record<string, unknown>>,
): void {
  const { name, columns } = table;
  const insert = db.prepare(`INSERT INTO ${name} VALUES (${columns.map(() => '?').join(', ')})`);
  for (const row of rows) insert.run(...columns.map((column) => (row[column] ?? null) as SQLInputValue));
}

function noteRows(episode: string, folded: Folded): Record<string, unknown>[] {
  return folded.spans.flatMap((span) =>
    (span.events ?? []).flatMap((event) =>
      event.name === 'note'
        ? [
            {
              episode,
              trace_id: span.trace_id,
              span_id: span.span_id,
              job: span.job ?? span.name,
              type: event.attributes['note.type'],
              text: event.attributes['note.text'],
              t: event.t,
              seq: event.seq,
            },
          ]
        : [],
    ),
  );
}

function load(sources: readonly RunSource[]): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  createTable(db, 'spans', SPAN_COLUMNS);
  createTable(db, 'scores', SCORE_COLUMNS);
  createTable(db, 'notes', NOTE_COLUMNS);
  for (const { episode, folded } of sources) {
    insertAll(
      db,
      { name: 'spans', columns: SPAN_COLUMNS },
      folded.spans.map((span) => ({ ...span, episode, skills_invoked: span.skills_invoked?.join(',') })),
    );
    insertAll(
      db,
      { name: 'scores', columns: SCORE_COLUMNS },
      folded.scores.map((score) => ({ ...score, episode })),
    );
    insertAll(db, { name: 'notes', columns: NOTE_COLUMNS }, noteRows(episode, folded));
  }
  return db;
}

const stripComments = (sql: string): string => sql.replace(/--[^\n]*/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ');

const isRead = (sql: string): boolean => /^\s*(select|with)\b/i.test(stripComments(sql));

export function queryRuns(sources: readonly RunSource[], sql: string): QueryResult {
  if (!isRead(sql)) return { ok: false, error: 'only SELECT or WITH queries are allowed' };
  const db = load(sources);
  try {
    const statement = db.prepare(sql);
    const columns = statement.columns().map((column) => column.name);
    const rows = statement.all().map((row) => ({ ...row }));
    return { ok: true, columns, rows };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  } finally {
    db.close();
  }
}

export const RUNS_CSV_COLUMNS = [
  'run',
  'episode',
  'job',
  'agent',
  'attempt',
  'result',
  'failed_rubric',
  'duration_s',
  'tokens',
  'cache_read_tokens',
  'at',
] as const;

const RUNS_SQL = `
  SELECT r.run_id AS run, s.episode AS episode, s.job AS job, CASE WHEN s.type = 'job' THEN 'orchestrator' ELSE s.role END AS agent, s.attempt AS attempt,
    CASE WHEN failed.lines IS NOT NULL THEN 'fail' WHEN s.status = 'ok' THEN 'pass' ELSE s.status END AS result,
    failed.lines AS failed_rubric,
    CASE WHEN s.duration_ms IS NULL THEN NULL ELSE CAST(round(s.duration_ms / 1000.0) AS INTEGER) END AS duration_s,
    CASE WHEN s.gen_ai_usage_input_tokens IS NULL AND s.gen_ai_usage_output_tokens IS NULL THEN NULL
      ELSE coalesce(s.gen_ai_usage_input_tokens, 0) + coalesce(s.gen_ai_usage_output_tokens, 0) END AS tokens,
    s.gen_ai_usage_cache_read_input_tokens AS cache_read_tokens,
    s.end_t AS at
  FROM spans s
  JOIN spans r ON r.trace_id = s.trace_id AND r.type = 'run' AND r.episode = s.episode
  LEFT JOIN (
    SELECT episode, span_id, group_concat(rubric, '; ') AS lines FROM scores
    WHERE name = 'rubric' AND value = 'fail' GROUP BY episode, span_id
  ) failed ON failed.episode = s.episode AND (failed.span_id = s.span_id OR (s.role LIKE '%implementor' AND failed.span_id = s.parent_span_id))
  WHERE s.type = 'agent' OR (s.type = 'job' AND (s.gen_ai_usage_input_tokens IS NOT NULL OR s.gen_ai_usage_output_tokens IS NOT NULL))
  ORDER BY r.start_t, s.episode, coalesce(s.end_t, s.start_t), s.seq`;

const csvField = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

type Row = Record<string, unknown>;

function csvRecords(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  for (const [, field, end] of text.matchAll(/("(?:[^"]|"")*"|[^,\n"]*)(,|\n|$)/g)) {
    record.push(field.startsWith('"') ? field.slice(1, -1).replaceAll('""', '"') : field);
    if (end === ',') continue;
    records.push(record);
    record = [];
  }
  return records.filter((fields) => fields.length > 1);
}

const runKey = (run: unknown): string => String(run ?? '').replaceAll(':', '-');

export function runsCsv(sources: readonly RunSource[], existing = ''): string {
  const result = queryRuns(sources, RUNS_SQL);
  const generated: Row[] = result.ok ? result.rows : [];
  const held = new Set(generated.map((row) => runKey(row.run)));
  const [headerOfExistingFile = [], ...records] = csvRecords(existing);
  const kept: Row[] = records
    .filter((fields) => !held.has(runKey(fields[0])))
    .map((fields) => Object.fromEntries(headerOfExistingFile.map((column, at) => [column, fields[at]])));
  const rows = [...kept, ...generated].sort((a, b) => runKey(a.run).localeCompare(runKey(b.run)));
  const body = rows.map((row) => RUNS_CSV_COLUMNS.map((column) => csvField(row[column])).join(','));
  return `${[RUNS_CSV_COLUMNS.join(','), ...body].join('\n')}\n`;
}
