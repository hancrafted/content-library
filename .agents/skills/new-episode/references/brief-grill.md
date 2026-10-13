# brief-grill

Output: `docs/episodes/<slug>/brief.md`, ending at a human gate. No reviewer: Han is the reviewer.

The grill is a dialogue with Han, so it runs in the orchestrator's session, never in a subagent. The `brief-grill` skill is the whole procedure: the time-box, the phases Frame → Explore → Settle, writing the Brief, and the Brief template. Load it, and follow it wherever the `grilling` skill differs.

## Starting points

Han either brings a Brief or brings an idea. Accept the Brief when he has one; grill only when he does not.

- **An existing Brief**, already at `docs/episodes/<slug>/brief.md` or pasted (a voice handoff, or a Brief written elsewhere): save a paste verbatim to `.scratch/<slug>/handoff.md` first, then write it to `brief.md` by the skill's _Writing the Brief_ steps. Validate it with the job's checks (`mh`, then `vitest`) and list every gap: each failed line, each heading reading `Not settled.`, each open question from the handoff. Grill Han on those gaps only, heading by heading as in the skill's Settle phase, and leave every settled heading as Han wrote it. A Brief with no gaps gets the machine `verified` entry and goes straight to the draft commit.
- **A one-line idea, or nothing**: run the `brief-grill` skill from Frame.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them:

1. Every heading holds Han's choice. A heading still reading `Not settled.` goes back to Han by name: the orchestrator refuses to start on it.
2. The Brief carries `status: draft`, a `generated: { by, at }` and a `process:markdown-harness` entry in `verified` (written after the checks pass), and is committed through the `commit` skill with `Gate: draft brief` before Han edits it.

Then append the run-log entry (creating `run-log.md` with its `# Run log` h1 if it is new) and its runs CSV row, then stop: the gate opens when Han runs `node .agents/skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` and commits it with `Gate: approved brief`.
