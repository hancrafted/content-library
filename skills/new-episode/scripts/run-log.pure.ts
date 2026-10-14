// The run event log: one append-only JSONL line per event, shaped like OpenTelemetry spans (design-ADR 0007).
// `record` builds and validates one line from an event and an explicit stamp; `fold` turns lines into spans
// and scores; `renderTree` prints them. Pure: no disk, no clock, no ids of its own. The CLIs (`log.ts`,
// `trace.ts`) read the clock and git and hand the results in, and a later reader (query, status, the
// Claude Code adapter) builds on this one import without changing it.

export { createLogFold, currentRun, fold, parseLog } from './run-log-fold.pure.ts';
export { record } from './run-log-record.pure.ts';
export { formatDuration, renderTree } from './run-log-tree.pure.ts';
export * from './run-log.schema.pure.ts';
