---
type: design-adr
status: proposed
---

# Pipeline runs are logged as OpenTelemetry-shaped spans in append-only JSONL

Every Run of `/new-episode` writes one append-only `events.jsonl` in the Episode's staging folder, committed on the Episode branch. One JSON object per line: `start-run` and `end-run` for the Run, `start` and `end` for every other Span (Job, Attempt, agent, Gate), and `score` for every verdict. Ids and field names follow OpenTelemetry (32-hex `trace_id`, 16-hex `span_id` and `parent_span_id`, the `gen_ai.*` attributes where one exists), so an export to a tracing tool is a field mapping. Only a command writes lines (`episode:log`): it reads the clock, the git template commit and the next sequence number itself, validates the shape, and appends under a lock file, so no harness types a timestamp and concurrent writers never interleave. Readers fold the lines into spans and scores, sorted by time and then sequence; a start with no end reads as crashed, or as running while the Run is still open. The shape lives in one pure module, `run-log.pure.ts` in the skill's scripts, so a later reader or a Claude Code adapter builds on it without a second definition.

## Considered options

- **SQLite in WAL mode as the stored log**: concurrent writers are safe and queries are native, but the file is binary, so it cannot be committed on the Episode branch, diffed in a draft PR or read with `cat`, and every harness would need a SQLite binding to write. SQL still comes later, but as a derived in-memory view over the lines (`node:sqlite`), never as the source.
- **OTLP as the stored format**: it is the export target, but its nested resource, scope and span batches suit a collector, not an append: a span is one record only after it ends, so a crash would leave nothing to read. Start and end lines are written as they happen and joined on read. Rejected as the source; an exporter maps lines to OTLP later.
- **A hook-only writer** (Claude Code's subagent hooks write every line): hooks see the model, tokens and prompt, but only in Claude Code, and not Runs, Gates or Scores. Other harnesses would have no log. Rejected as the only writer: the command is the port every harness calls, and the hooks become an adapter that calls it to enrich the log.

## Consequences

- A line is never edited. A correction is a new line: a re-judgement a new Score, a later end line for a span the latest one wins.
- Fields a harness cannot measure are written by the orchestrator and marked `source: typed`, so a report never mixes measured and guessed numbers silently.
- The OpenTelemetry GenAI conventions are in Development status; a rename upstream is a change to the exporter's mapping, not to the log.
- Locking is a lock file created exclusively, with a stale lock broken after ten seconds; it serialises writers on one machine, which is the only place a Run writes from.
