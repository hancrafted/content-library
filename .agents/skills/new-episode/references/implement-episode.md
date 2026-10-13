# implement-episode

Output: the Episode in `src/`, on the integration branch `episode/<slug>`. The heaviest job: every check from the fast suite to rendered pixels.

## Prompt

Both agents run with `session: orchestrator`. Call the Skill tool with `implement-spec` on the spec issue, its implementer and merger subagents on the agent's `model`, with these changes to its steps:

- The integration branch already exists: it is `episode/<slug>`, the worktree from step 1.
- No PR opens and none is marked ready here: `open-pr` opens the one draft PR, and it stays a draft until Promotion.
- Skip its `code-review` step: the job's reviewer runs it, so the verdict, the retry and the metrics stay with the job loop.
- On a retry, the failed lines go to a new implementer subagent, quoted verbatim, as fix work on the integration branch.

## Metadata

The Episode is a draft: it has no video and no Promotion. This overrides the metadata line in step 3 of [episode-migration](../../../../docs/features/episode-migration.md).

- Write `episode-metadata.ts` with `status: 'upcoming'` (the existing non-published value, `UpcomingEpisodeMetadata`) and no `publishedOn`; the type refuses one. Publishing flips both, and it is Promotion's or Han's step, never this job's.
- Topic, extra Topics and Tags come from the Brief. What the Brief does not name is not invented: leave the field out where the type allows it, and list it as a `Needs human:` line in the run-log entry.
- If `tsc` refuses the registration because the `PUBLISHED` map in `episode-repository.ts` types every registered slug as published, do not set `published` to satisfy it: list that as a `Needs human:` line.

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

1. Every Dossier Voice script item's paragraph appears verbatim as a Voice script segment of its Slide.
2. Every Slide uses the master and motion its Dossier Visual names.
3. Every Speaker note in the Dossier appears in its Slide's notes.
4. The visual check ran in both themes, and its numbers show no overflow.
