---
type: design-adr
status: proposed
---

# Run log lines are a typed union on `kind`, with point facts as span events

The dashboard and the writer shared `events.jsonl` through one flat interface where every key was optional, so nothing told a reader which keys a line of a kind holds, and each new fact (a skill call, a file read, an ADR load) would have grown that bag or a new kind. A line is now a discriminated union on `kind`: a shared envelope, the typed keys of its kind, and an optional `payload` of harness extras; every point fact is one `event` kind with a closed set of names, OpenTelemetry span events in shape. It extends design-ADR-0007 and supersedes the record shape of design-ADR-0009. Issue [#191](https://github.com/hancrafted/content-library/issues/191).

**Status: proposed.** Han was unavailable for the grilling ([handoff Part 5](https://github.com/hancrafted/content-library/issues/191)); every recommended option and every "decided without asking" line was taken as is. Each question below keeps its alternatives so any one can be overturned. No dashboard consumer is built on the contract until Han accepts it; only the skill chips were adapted.

## Decisions

The shape, as `run-log-line.schema.pure.ts` declares it (key lists there are the single source of truth; the types derive from them and `record` validates against them):

```ts
type RunLogLine = StartRunLine | StartLine | EndRunLine | EndLine | AttrsLine | ScoreLine | EventLine;
// every line: { kind, t, seq, trace_id, span_id, payload?, payload_truncated? } & the keys of its kind
type EventLine =
  | { kind: 'event'; name: 'skill.invoke'; source; attributes: { 'skill.name': string } }
  | { kind: 'event'; name: 'file.read'; source; attributes: { 'file.path': string } }
  | {
      kind: 'event';
      name: 'instructions.load';
      source;
      attributes: { 'file.path': string; load_reason: string; 'trigger_file.path'?: string; adr?: string };
    };
```

1. **Q1, the line's TypeScript shape: a discriminated union on `kind`.** A shared envelope, typed well-known keys per kind, `payload` for the rest. A key another kind takes is typed `?: never` on this one, so a writer cannot put it there and a reader reads any key off an unnarrowed line as `T | undefined`. Every existing kind keeps its keys, and every existing log stays valid: the dogfood Run's log (`tests/fixtures/run-log/dogfood-events.jsonl`) validates line by line and folds as before. _Alternatives:_ a flat interface of optional keys plus `payload` (today's shape, which types nothing per kind); an OpenTelemetry-native envelope with one `attributes` map (renames every key every reader uses, for an export that is still only a field mapping).
2. **Q2, point facts: one `kind: "event"` with a closed `name` set and typed attributes per name.** `skill.invoke` (`skill.name`), `file.read` (`file.path`), `instructions.load` (`file.path`, `load_reason`, optional `trigger_file.path`, optional `adr`). Each carries `span_id` (the span that made it) and `source` (`measured` from a hook). The unmerged `kind: "skill"` line of design-ADR-0009 becomes `skill.invoke`. The fold attaches events to their span generically: `span.events: { name, t, seq, attributes }[]`, oldest first, absent while none; an event whose span has not started waits among the orphans, and batch and appended folds agree. `span.skills` is gone; `skillUses(span)` reads the skills off the events, and the dashboard's skill chips read through it. _Alternative:_ one kind per fact (`skill`, `file-read`, `instructions-load`), which grows the kind list and the fold with every new fact.
3. **Q3, `payload`: harness extras, namespaced by harness.** `payload.claude_code.*` (snake_case harness keys, each an object); readers may display it and never derive state from it, so the fold never lays it onto a span. Capped at 2 KB of JSON per line (decided without asking): a larger one is dropped whole and the writer sets `payload_truncated: true`. _Alternative:_ a free-form payload.
4. **Q4, which reads are logged: every Read tool call.** `PostToolUse` with matcher `Read` writes a `file.read` with the path relative to the checkout the hook ran in (the nearest folder up from its `cwd` holding `.git`), never the content; a path outside that checkout writes nothing. Repeats are logged; the dashboard dedupes. _Alternative:_ only the first read per span, the writer deduping, which costs a log scan per Read.
5. **Q5, how an ADR read is recognised: `InstructionsLoaded`.** It fires for `.claude/rules/*.md` and CLAUDE.md files with `file_path`, `memory_type`, `load_reason`, `globs`, `trigger_file_path` ([hooks reference](https://code.claude.com/docs/en/hooks)). The hook writes `instructions.load`; when the file's real path (a rule's symlink followed, GEN-002) is `.archgate/adrs/<ID>-<slug>.md`, `adr` is `<ID>-<slug>`. `memory_type` and `globs` go to `payload.claude_code`. A plain Read of `.archgate/adrs/*` stays a `file.read`, which the dashboard may label as an ADR. _Alternative:_ log rule loads only.
6. **Q6, where the contract lives: `skills/new-episode/scripts/`.** The lines in `run-log-line.schema.pure.ts`, re-exported by `run-log.schema.pure.ts` beside the folded Span and Score. The skill stays self-contained and the dashboard already imports from there. _Alternative:_ `src/lib`, which would make the skill's scripts import from the site.
7. **Q7, how it evolves: additively, no version field.** A new key or event name is added to the key lists; the writer refuses any top-level key its kind does not declare, so extras go in `payload`. _Alternative:_ a schema version on `start-run`.
8. **Names follow OpenTelemetry semantic conventions where one exists** (`file.path`), decided without asking; the `gen_ai.*` keys are unchanged.
9. **Attribution is the skill hook's, for every point fact** (decided without asking): inside a subagent, the agent span whose start names `<session>/subagents/agent-<agent_id>.jsonl`; in the orchestrator, the Job the marker names while it is open; otherwise nothing. A hook waits at most 2 s for the lock and exits 0 on every failure. `InstructionsLoaded` runs `async`.

## Consequences

- **Readers narrow on `kind`, or read any key as optional.** Test fixtures that held partial lines are cast; production readers needed no change beyond the chips and the dashboard reader, which now validates a stored line with `lineErrors()` instead of re-recording it.
- **The Read hook runs on every Read, synchronously.** It spawns node and scans `git worktree list`; it writes nothing outside a Run. If that latency shows, it can run `async` like `InstructionsLoaded`, at the cost of nothing the log needs.
- **`AGENTS.md` read directly fires no `InstructionsLoaded`** (Claude Code's Project instructions setting); only an import or a CLAUDE.md symlink to it does.
- **Older logs have no events.** Their chips go green only from `skills_invoked`, after an agent ends, as design-ADR-0009 already said.
