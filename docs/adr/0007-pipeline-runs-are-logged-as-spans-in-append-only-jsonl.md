---
type: design-adr
status: proposed
---

# Pipeline runs are logged as OpenTelemetry-shaped spans in append-only JSONL

Every Run of `/new-episode` appends start, end and score lines to one `events.jsonl` in the Episode's staging folder, written by one writer (run-log-writer.ts) so no harness types a timestamp, with OpenTelemetry ids and field names so a later export to a tracing tool is a field mapping. Plain text in the Episode branch can be diffed in a draft PR and read with `cat`, and every harness can call the same writer.

## Considered options

- **SQLite in WAL mode**: safe for concurrent writers, but binary, so it cannot be committed or diffed. SQL stays as an in-memory view over the lines.
- **OTLP as the stored format**: a span is one record only after it ends, so a crash leaves nothing to read. It is an export target, not the source.
- **A hook-only writer**: hooks exist only in Claude Code and see no Runs, Gates or Scores. The hooks enrich the log through the command instead.

## Consequences

- **Identity may arrive on the end line.** Claude Code fires SubagentStart before it writes the subagent's `meta.json`, so the start line of an agent can only carry a provisional identity (usually role `skill-spawned`, parent the Job). At SubagentStop the adapter reads `meta.json` and, when the start was provisional and the description now parses, puts `job`, `attempt`, `role`, `ticket`, `parent_span_id`, `name` and `description` on the end line, plus `gen_ai.request.model` when the start lacked one. The fold applies an end line's attributes over the start's, so the span reads with the final identity. Lines are never rewritten; a start that already parsed keeps its identity and the end carries none.
- **Done-ness is per Run.** `episode:status` reads only the current Run's trace (the live marker's, else the latest Run), so a Job an earlier Run finished is not done again for free. `reuse <job>` carries it over: a Job span in the current Run with status `reused` and an OpenTelemetry-style link to the earlier Run's `ok` Job span (`link_trace_id`, `link_span_id` on its start line). The command is idempotent and refuses without an earlier `ok` span. Lines stay append-only; nothing is rewritten.
- **A Score may name a ticket.** A `score` line takes an optional positive-integer `ticket`, so per-ticket verdicts are queryable without reading `body`.
- **A Job in the orchestrator's session carries its own usage.** It has no agent spans, so `end-job` of a Job whose `pipeline.yml` entry says `session: orchestrator` appends a second `end` line that repeats the first one's status and summary and adds the orchestrator transcripts' usage between the Job's start and end, measured as `end-run` measures the Run total. The latest end line wins when folded.
