# Harvest

Promotion's harvest: the last moment Staging and the built Episode sit side by side. Five harvesters read both and propose; none applies a change. Dispatch them as parallel subagents, each with the slug, the Staging path, its section below, and the instruction to return its section of `harvest.md`. Assemble the five returns into `docs/episodes/<staging>/harvest.md`, one `##` per harvester, each proposal a `- [ ]` line ending in its evidence (a feedback item, an event, a file and line).

Shared inputs: `brief.md`, `spec/spec.html`, `feedback/*/feedback.md`, `pipeline.yml`, `events.jsonl` (query it with `npm run episode:query`), the gate commits on the Episode's branch, and the code under `src/components/episodes/<slug>/`.

## Lessons

What the Run teaches the pipeline. Pair the gate commits with `git log --grep='Gate:'` and diff each draft against the user's approval; a status-only diff is acceptance, not a correction. An unmarked commit is the user's (`agentOf` in `skills/new-episode/scripts/marks.pure.ts`). Then: a correction made twice is a proposed rubric line. Count failing rubric Scores across Runs (`npm run episode:query -- "SELECT rubric, count(*) AS n FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric ORDER BY n DESC"`). Read the run log's prefixed findings (`No library match:` and the like), grouped by job. Each proposal is a `LEARNINGS.md` lesson in that file's shape: what happened, its evidence, the proposed fix and the file it changes. Skip a lesson `LEARNINGS.md` already holds; cite it instead.

## Style

What the user's picks say about taste. For each Slide, the picked Option against the others and the feedback that chose it ("simple visual language, more like this"). Propose additions or corrections to `docs/design/design-guide.md`, each quoting the user's words. A pick with no comment is weak evidence; say so.

## Slide library

Parts or Slides worth sharing. A part drawn on several Slides of this Episode, or close to one in another Episode, is a candidate for `src/components/slide-shared/`; a Slide shape that would serve other Episodes, for the Slide master (`docs/design/slide-library.md`). Each proposal names the files, what moves, and the import rule it keeps (design-ADR `0001-the-slide-is-a-self-contained-folder.md`).

## Cleanups

Small fixes to apply in this PR: dead code, unused i18n keys, leftover TODOs, a part duplicated inside the Episode, comments pointing at Staging paths that Promotion deletes. Each is small enough to land in one commit with `npm run verify` green.

## Refactor tickets

Changes too large for this PR: a shared abstraction several Episodes need, a test the Run kept missing, a contract that drifted. Each proposal is a ticket: a title, the problem with its evidence, and the outcome, ready for `gh issue create --label needs-triage`.
