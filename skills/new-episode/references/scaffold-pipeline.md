# scaffold-pipeline

Output: `docs/episodes/<slug>/pipeline.yml`, the template copied as a draft, so the run's jobs show on the dashboard from the start of Setup. No reviewer and no gate: `customize-pipeline` finalizes this file at the end of Setup, and Han approves that.

## Prompt

Copy [`assets/pipeline.yml`](../assets/pipeline.yml) to `docs/episodes/<slug>/pipeline.yml`, and change only this:

1. Keep `status: draft`, and add `template: <sha>` under it, the `git rev-parse --short HEAD` of `main` (the template's branch) last merged into the Episode branch.
2. Replace every `<slug>` with this Episode's slug.
3. **Episode Design Reference.** `convert-references` runs before `customize-pipeline`, so name its outputs now: one per item under the Brief's `## Episode Design Reference`, `docs/episodes/<slug>/reference/<file-slug>/design-reference.md`, in its order, and replace the `reference/*/design-reference.md` glob in every agent's `references` with those paths. With no Episode Design Reference, drop the job, its `wants` edge from `customize-pipeline` and every glob. The staging test checks the outputs against the Brief.
4. Remove each reference to a file that does not exist yet (a human-profile guide, the llm-wiki index): a per-run pipeline tolerates no missing file. Name each one in the run-log entry's Notes.

Keep everything else as the template has it: every stage and job, and the `foreach` jobs `write-research` and `implement-section` unexpanded, with their glob outputs. A draft per-run pipeline may keep them; `customize-pipeline` expands them before Han approves.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them, `npm run episode:status -- <slug>` lists the Episode's jobs from the new file, and the file is committed through the `commit` skill with `Agent: scaffold-pipeline`.
