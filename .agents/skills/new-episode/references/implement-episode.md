# implement-episode

Output: the Episode in `src/`, on the integration branch `episode/<slug>`. The heaviest job: every check from the fast suite to rendered pixels.

## Prompt

Both agents run with `session: orchestrator`. The implementor invokes the vendored `implement-spec` skill (`skills-lock.json`) with the Skill tool on the spec issue. Its implementer subagents take the implementor's `ticket` agent type and skills, and its implementer and merger subagents run on the agent's `model`, with these changes to its steps:

- The integration branch already exists: it is `episode/<slug>`, the worktree from step 1.
- No PR opens and none is marked ready here: `open-pr` opens the one draft PR, and it stays a draft until Promotion.
- Skip its step 7 `code-review`: the job's reviewer runs it on the whole Episode, so the verdict, the retry and the metrics stay with the job loop.
- After each ticket implementer returns and before its merge, invoke the `code-review` skill on the ticket branch (base `episode/<slug>`), have its findings fixed, then merge. Each review follows the report-path convention in [the job loop](../SKILL.md#the-job-loop): a report in `.scratch/<slug>/reviews/implement-episode-<n>.md`, and only `pass` or `fail` plus the path comes back.
- Ticket implementers (`archgate:developer`) skip `archgate:reviewer` and `archgate:lessons-learned`: the per-ticket `code-review` covers review, and the orchestrator writes `LEARNINGS.md`. `archgate check` still runs.
- Apply [`skill-overrides.md`](skill-overrides.md) to every skill the job lists: ticket implementers get it by path, beside `ticket.skills`.
- On a retry, the failed lines go to a new implementer subagent, quoted verbatim, as fix work on the integration branch.

## Design answers

Every ticket was approved at the `write-design-spec` gate: it carries `ready-for-agent` and a design answer for each of its Slides. Build each Slide to its design answer, its wireframe and its named parts, tokens, props and i18n keys; the answer's `master:` and `motion:` (already rewritten into the Dossier) are the ones to use. Refuse to start while any ticket of the Episode is still `needs-triage`, and tell Han which. Build no layout the answer does not give, and ask no design question: a gap in the answer is a `Needs human:` line.

## Metadata

The Episode is a draft: it has no video and no Promotion. This overrides the metadata line in step 3 of [episode-migration](../../../../docs/features/episode-migration.md).

- Write `episode-metadata.ts` with `status: 'upcoming'` (the existing non-published value, `UpcomingEpisodeMetadata`) and no `publishedOn`; the type refuses one. Publishing flips both and is Han's separate step ([episode-publishing](../../../../docs/features/episode-publishing.md)), never this job's or Promotion's.
- Topic, extra Topics and Tags come from the Brief. `topic`, `format` and `tags` are required in `SharedMetadata` (`src/lib/episode-metadata.pure.ts`), so a required field the Brief does not name gets a `Needs human:` line in the run-log entry plus the closest honest value (the nearest existing Topic or Format, an empty `tags` list), never an invented one. `extraTopics` is optional: when the Brief names none, leave it out.
- Register the metadata in the `REGISTERED` map in `episode-repository.ts`: it holds every registered slug whatever its `status`, so an upcoming Episode with a page type-checks. The page is built `noindex` and its card stays unlinked until publishing ([episode-publishing](../../../../docs/features/episode-publishing.md)); write no `published-anchors.json` here.

## Review

The reviewer calls the Skill tool with `code-review`, the fixed point the last commit before this job started (the merge-base with `main` would pull in everything the Episode branch carries from earlier jobs), its subagents on the agent's `model`. Pass the spec issue to its Spec subagent with the lines under `## Rubric` beside it, so one review judges both the tickets and the Episode. After the merge it makes one interactive Chrome pass (Context drawer, scroll, motion), the Episode's tab in front. With no connected browser it never blocks: it writes `Needs human: interactive pass skipped, no browser` and goes on. Each finding the Spec or Standards report marks hard is a failed line, quoted verbatim; a judgement call goes into Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). The first failure is the failed attempt.

## Visual check

The `visual-check` check, in both themes, by FE-009's browser check. By the `visual-check` skill: serve `out/` with `npm run preview` in the background, then probe every Slide by its own `#<section>--<slide>` URL (an Episode mounts a Slide's content only near the viewport, so one page load measures every off-screen Slide as an empty box). Cover three widths, 375, 1100 and 1440 px, each with the Context drawer beside, over and closed, in light and dark:

   ```sh
   npm run inspect-page -- --url http://localhost:4300/<episode path>#<section>--<slide> --theme light --width <w> --height 800 \
     --probe '[id="<section>--<slide>"]' …
   ```

   Every Slide must have a `count` of 1, a wrapper box at least the viewport tall (the wrapper's "at least viewport height" is FE-009's only height rule, so a taller Slide is fine), no horizontal overflow, and a Foreground clear of the chrome; also probe its mounted descendants (`[id="<section>--<slide>"] *`) and require a `count` above 0. Record the numbers per Slide, width, drawer state and theme in the run-log entry's Checks.

## Rubric

1. Every Dossier Voice script item's paragraph appears verbatim as a Voice script segment of its Slide.
2. Every Slide uses the master and motion its Dossier Visual names (`none` is no motion), shows the Visual's `title:` when it has one and the Dossier h3 otherwise, and the table of contents shows the h3. Where the Visual's `title:` goes: the h3 is the Slide's `title` key in `i18n/<locale>.json` (the table of contents reads it), and the Visual's `title:` is a separate `heading` key in the same file, which the kit's `Title` renders in place of its children; a Slide without a `title:` has no `heading` key. The Title slide and section slides use the kit's title and section layouts with no motion.
3. Every Speaker note in the Dossier appears in its Slide's notes.
4. Every Slide follows its ticket's design answer, with no layout, component or motion the answer does not give.
5. The visual check ran at 375, 1100 and 1440 px, drawer beside, over and closed, in both themes, and its numbers show no overflow, wrappers at least viewport height and Foreground clear of the chrome.
