---
type: design-adr
status: proposed
---

# Skill invocations are logged as point records

The dashboard shows, per Job, a chip for every skill and check `pipeline.yml` names. Checks already reach the log as `score` lines with `source: check:<name>`; skills reached it only as `skills_invoked` on an agent's end line, known once the agent stopped. So a running agent's skills could not be watched, and an orchestrator-session Job's only once `end-job` measured its window. Every Skill tool call is now logged as it happens, one line each, extending the vocabulary of design-ADR-0007. Issue #186.

## Decisions

1. **A `skill` line is a point record, like a `score`.** `{ kind: "skill", t, seq, trace_id, span_id, name, source: "measured" }`: `span_id` is the span that made the call, `name` the skill the Skill tool call names: its input's `skill`, else the older `command`, trimmed, `plugin:skill` for a plugin's, a blank one written as nothing. `skillName()` in `transcript.pure.ts` is that one normalisation, and `skills_invoked` is read through it too, so both paths name a skill alike. It carries no other field; `t` is the writer's clock when the hook ran. The writer refuses one whose `span_id` no start line opened, as it does an end, attrs or score line.
2. **The fold attaches invocations to their span.** A folded span gains `skills: { name, t, seq }[]`, oldest first, one entry per line, absent while it has none. Batch and appended folds agree. A `skill` line whose span has not started is kept among the orphans until that start arrives, the rule end and attrs lines already follow.
3. **`skills_invoked` keeps its meaning.** It stays the transcript's word at SubagentStop (or an orchestrator Job's `attrs` line): absent means unknown, `[]` means none. `skill` lines never fill it in, so a running agent never reads as having invoked nothing, and `episode:status` keeps judging only spans that recorded it.
4. **Claude Code emits them from `PostToolUse` on the Skill tool.** `.claude/settings.json` runs `claude-adapter.ts skill` with matcher `Skill`. The hook input carries `session_id`, `transcript_path` (the main session's), `tool_name` and `tool_input`; inside a subagent it also carries `agent_id` and `agent_type` ([hooks reference](https://code.claude.com/docs/en/hooks), Common input fields and PostToolUse input).
5. **Attribution never guesses.** The Run is found as SubagentStart finds it: the worktree whose `.scratch/active-run` lists the session. With `agent_id`, the span is the agent span whose start line names the subagent's transcript, `<session>/subagents/agent-<agent_id>.jsonl`, the key SubagentStop already uses. Without it, the call is the orchestrator's and the span is the Job the marker's `job_span_id` names, while that Job is open in the marker's Run. Anything else (no marker, another session, a subagent whose start is not logged, the orchestrator between Jobs) writes nothing.
6. **The hook never blocks the tool.** It waits at most 2 s for the log's lock (a subagent hook waits 15 s) and exits 0 on every failure, a lock timeout included (that one still prints a line on stderr): the call it follows has already run.

## Consequences

- **The dashboard's skill chips follow the log live.** Per listed agent, a skill is green on a `skill` line or a `skills_invoked` naming it on a span answering to that agent (an agent span by role, the Job span only for an orchestrator-session agent) in the Job's current Run and latest Attempt, and red once each such span ended with `skills_invoked` known and without it. On the Job span only `skill` lines from the latest Attempt's start count, and its `skills_invoked` only while the Run has one Attempt, since it covers the whole Job window. The Job box aggregates: green once every listing agent ran it, red if any skipped it. A replay cutoff hides lines after it, so chips replay too.
- **Readers that do not know the kind ignore it.** `episode:status`, `episode:query` and `episode:runs-csv` read folded spans; the `spans` table has no `skills` column, so neither changes.
- **Older logs have no `skill` lines.** Their chips go green only from `skills_invoked`, after an agent ends.
- **A slash command typed by Han bypasses the Skill tool**, so it fires no `PostToolUse` and logs nothing; it is not a pipeline agent's invocation either.
