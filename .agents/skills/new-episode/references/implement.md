# implement

Output: the Episode in `src/`, on the integration branch `episode/<slug>`. The heaviest job: every check from the fast suite to rendered pixels.

## Prompt

Both agents run with `session: orchestrator`: `implement-spec` and `code-review` dispatch subagents of their own, which a subagent cannot. Call the Skill tool with `implement-spec` on the spec issue, its implementer and merger subagents on the agent's `model`, with these changes to its steps:

- The integration branch already exists: it is `episode/<slug>`, the worktree from step 1.
- No PR opens and none is marked ready here: `serve-and-pr` opens the one draft PR, and it stays a draft until Promotion.
- Skip its `code-review` step: the job's reviewer runs it, so the verdict, the retry and the metrics stay with the job loop.
- On a retry, the failed lines go to a new implementer subagent, quoted verbatim, as fix work on the integration branch.

## Review

The reviewer calls the Skill tool with `code-review`, the fixed point the merge-base with `main`, its subagents on the agent's `model`. Pass the spec issue to its Spec subagent with the lines under `## Rubric` beside it, so one review judges both the tickets and the Episode. Each finding the Spec or Standards report marks hard is a failed line, quoted verbatim; a judgement call goes into Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). The first failure is the failed attempt.

## Visual check

The `visual-check` check, in both themes. By the `visual-check` skill: serve `out/` with `npm run preview` in the background, then probe every Slide by its anchor in each theme:

   ```sh
   npm run shot -- --url http://localhost:4300/<episode path> --theme light --height 800 \
     --probe '[id="<section>--<slide>"]' …
   ```

   One `--probe` per Slide; repeat with `--theme dark`. Every Slide must have a `count` of 1 and a box no taller than the viewport. Record the numbers per theme in the run-log entry's Checks.

## Rubric

1. Every Manuscript paragraph appears verbatim as a Voice script segment of its Slide.
2. Every Slide uses the master and motion its Dossier Visual names.
3. Every Speaker note in the Dossier appears in its Slide's notes.
4. The visual check ran in both themes, and its numbers show no overflow.
