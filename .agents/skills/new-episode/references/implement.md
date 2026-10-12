# implement

Output: the Episode in `src/`, on the integration branch `episode/<slug>`. The heaviest job: every check from the fast suite to rendered pixels.

## Prompt

The implementor is this session: `implement-spec` dispatches subagents of its own, which a subagent cannot. Call the Skill tool with `implement-spec` on the spec issue, with these changes to its steps:

- The integration branch already exists: it is `episode/<slug>`, the worktree from step 1.
- No PR opens and none is marked ready here: `serve-and-pr` opens the one draft PR, and it stays a draft until Promotion.
- On a retry, the failed lines go to a new implementer subagent, quoted verbatim, as fix work on the integration branch.

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
