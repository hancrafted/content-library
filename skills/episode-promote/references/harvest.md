# Harvest

Promotion's harvest: the last moment Staging and the built Episode sit side by side. Five harvesters read both and propose; none applies a change. Dispatch them as parallel subagents, each with the slug, the Staging path, its section below, and [the card shape](#the-card) to return its proposals in. Assemble the five returns into `docs/episodes/<staging>/harvest.json`, one section per harvester, then render the gate page with `npm run episode:harvest -- docs/episodes/<staging>`.

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

## The card

The user decides each proposal on one card of the Harvest report, so a proposal is a card, as JSON. The shapes are typed in [`scripts/harvest-report.pure.ts`](../scripts/harvest-report.pure.ts); `episode:harvest` refuses a duplicate id, an overlap naming no card, and a visual kind the page cannot draw.

```json
{
  "id": "L1",
  "title": "Scene text keys never use notes.*",
  "weight": "strong",
  "changes": "skills/new-episode/references/write-spec.md",
  "problem": "Build notes keyed Scene text under `notes.*`; three implementors renamed it.",
  "change": "The build-notes line keys Scene text `board.*`; the rubric checks it.",
  "before": { "kind": "flow", "nodes": [{ "label": "Spec: notes.*" }, { "label": "renamed", "tone": "bad" }] },
  "after": { "kind": "flow", "nodes": [{ "label": "Spec: board.*" }, { "label": "built as drawn", "tone": "good" }] },
  "evidence": "run log ~425, 489; Score fail FE-010 §3.1",
  "overlaps": ["T3"]
}
```

- **id**: the section's letter and a number: `L` Lessons, `S` Style, `B` Slide library, `C` Cleanups, `T` Refactor tickets.
- **problem** and **change**: one sentence each; `code` in backticks.
- **weight**: `strong`, `worth`, or `weak`, the last for evidence like an uncommented pick.
- **before** and **after**: the picture carries the card. Pick the kind that shows the change at a glance:
  - `flow` for a process: the steps a Run took against the steps it would take.
  - `stack` for files: the duplicated copies against the one shared module.
  - `quote` for a rule: the guide's line today against the proposed line.
  - `count` for a number: 46 Needs human items against 5.
- **overlaps**: the ids of cards proposing the same change from another side, with `overlapNote` saying how they differ; the user keeps one.
