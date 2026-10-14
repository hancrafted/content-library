# brief-grill

Output: `docs/episodes/<slug>/brief.md`, ending at a human gate. A fresh reviewer judges it against its intents, and Han answers every failed line: he is the implementor's only source of words.

The grill is a dialogue with Han, so the implementor runs in the orchestrator's own session, where Han answers. The `brief-grill` skill is the whole procedure: the phases Frame → Explore → Settle → Self-check, writing the Brief, and the Brief template. Load it, and follow it wherever the `grilling` skill differs.

## Starting points

Han either brings a Brief or brings an idea. Accept the Brief when he has one; grill only when he does not.

- **An existing Brief**, from a voice session (pasted, or written by Cowork to `.scratch/<slug>/handoff.md`) or written elsewhere: save a paste verbatim to `.scratch/<slug>/handoff.md` first; that file stays Han's original. Copy it into the Episode worktree as `docs/episodes/<slug>/brief.md` by the skill's _Writing the Brief_ steps, dropping only the `<!-- save as … -->` line. Run the job's checks (`mh`, then `vitest`) and list every gap: each failed line, and each heading reading `Not settled.`.
- **A one-line idea, or nothing**: run the `brief-grill` skill from Frame.

## Episode Design Reference

When the prompt or Brief names a file (pdf, word) brought in as a model for the Episode (a deck, a sketch, a Miro slides export), copy it to `.scratch/<slug>/<file-slug>.<file-extension>`, the `<file-slug>` its subject in kebab case. Then add the Brief's optional `## Episode Design Reference` with one item per file, `[<title>](reference/<file-slug>/design-reference.md)`: a shape-only fix the run-log entry's Notes name with the file's original path. The `convert-references` job writes that path after the pipeline gate; until then the link has no target.

## Fixing a failed check

The Brief is Han's wording, so a fix changes shape, never words:

- **Shape only**: frontmatter, heading order, a list written as prose or the reverse, where every word stays. Fix it yourself and name each fix in the run-log entry's Notes.
- **Anything that changes a word**, and every `Not settled.` heading: put it to Han as a question, heading by heading as in the skill's Settle phase, and write his answer verbatim. Leave every heading he settled as he wrote it.

## Retry

The reviewer's failed lines go to Han, not to a rewrite: on attempt 2 and later, quote each failed line to him as a question, write down his answer verbatim, then run the checks and a fresh reviewer again.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop), then the reviewer passes. Beyond them:

1. Every heading holds Han's choice. A heading still reading `Not settled.` goes back to Han by name: the orchestrator refuses to start on it.
2. The Brief carries `status: draft`, a `generated: { by, at }` and a `process:markdown-harness` entry in `verified` (written after the checks and the reviewer pass), and is committed through the `commit` skill with `Gate: draft brief` before Han edits it.

Then append the run-log entry (creating `run-log.md` with its `# Run log` h1 if it is new) and its runs CSV rows, then stop: the gate opens when Han runs `node .agents/skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` and commits it with `Gate: approved brief`.

## Rubric

1. The text under every heading except Episode Design Reference is Han's wording: `.scratch/<slug>/handoff.md` when it exists, his answers in this session, or a shape-only fix the run-log entry names.
2. No two sections of the Brief contradict each other, and no section contradicts itself.
3. Every sentence is one a downstream job acts on: a sentence that changes no job's output is noise.
