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
- **An `attrs` line repairs a log that predates that.** A log written before identity-at-stop has skill-spawned agents that ended with no identity, and a second `end` line cannot carry it: the fold would overwrite the span's status, end time and summary. The one-off `episode:backfill-identity` command therefore appends a line of kind `attrs`: a `span_id` plus the identity fields an end line may carry (`job`, `attempt`, `role`, `ticket`, `parent_span_id`, `name`, `description`, `gen_ai.request.model`), which the fold lays over the span and which never changes how it ended. The command computes identity with the adapter's own function over the log as it stood at the agent's end line, is dry-run unless `--write`, and appends nothing for a span already repaired. It files lines through the writer, which stamps the newest Run, so a span of an older Run is reported and left alone.
