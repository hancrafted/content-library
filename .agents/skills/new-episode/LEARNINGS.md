# Learnings

What `new-episode` runs have taught, distilled from their `run-log.md` entries and `docs/episodes/runs.csv`. Each lesson is a change to the template pipeline, a reference or `SKILL.md`; when one lands, its entry here says where it went. Read this before tailoring a pipeline.

## Lessons

None yet: the first real run fills this section.

## Next steps

Planned, not yet built, in the order they pay off:

1. **A mechanical runner.** The orchestrator is one Claude Code session reading `pipeline.yml` as a todo list. The target is a runner that reads the same file: either a Workflow script that walks the `needs` graph, or tasks the skill writes for agents to pick up from a queue. `pipeline.yml` is already shaped for it (stages as `needs`, agents in order, `retries`, `gate`).
2. **A subagent-stop telemetry hook.** Today the orchestrator writes each runs CSV row by hand from the Agent result. A `SubagentStop` hook (or `turn.complete`) appends the row itself, so no row is skipped or misread. OpenTelemetry (`CLAUDE_CODE_ENABLE_TELEMETRY`) waits until a fleet of sessions needs it.
3. **Agent profiles.** Every agent's `profile:` is `~`. Later it names a profile (model, tools, persona), with no schema change beyond the value.
4. **Revisit Cowork voice.** As of October 2026 Cowork has dictation only, so the voice Brief grill runs in Claude Desktop and ends in a handoff. When Cowork gains two-way voice, check whether it can run the grill and write `brief.md` directly.
5. **Add back the draft gate.** The optional gate after `write-manuscript`, for Han to read the Manuscript before the spec is written, was removed. It comes back as one line, `gate: human`, on the `write-manuscript` job of the template.
