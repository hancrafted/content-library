# Harvest

Promotion's harvest: the last moment Staging and the built Episode sit side by side. Six harvesters read both and propose; none applies a change. Dispatch them as parallel subagents, each with the slug, the Staging path, its section below, and [the card shape](#the-card) to return its proposals in. Assemble the six returns into `docs/episodes/<staging>/harvest.json`, one section per harvester, then render the gate page with `npm run episode:harvest -- docs/episodes/<staging>`.

Shared inputs: `brief.md`, `spec/spec.html`, `feedback/*/feedback.md`, `pipeline.yml`, `events.jsonl` (query it with `npm run episode:query`), the gate commits on the Episode's branch, and the code under `src/components/episodes/<slug>/`.

## Lessons

What the Run teaches the pipeline. Pair the gate commits with `git log --grep='Gate:'` and diff each draft against the user's approval; a status-only diff is acceptance, not a correction. An unmarked commit is the user's (`agentOf` in `skills/new-episode/scripts/marks.pure.ts`). Then: a correction made twice is a proposed rubric line. Count failing rubric Scores across Runs (`npm run episode:query -- "SELECT rubric, count(*) AS n FROM scores WHERE name = 'rubric' AND value = 'fail' GROUP BY rubric ORDER BY n DESC"`). Read the run log's prefixed findings (`No library match:` and the like), grouped by job. Each proposal is a `LEARNINGS.md` lesson in that file's shape: what happened, its evidence, the proposed fix and the file it changes. Skip a lesson `LEARNINGS.md` already holds; cite it instead. The user's hand fixes have their own section, which the command writes ([Hand fixes](#hand-fixes)): read them for patterns, and propose a lesson only when several fixes point at one cause.

## Style

What the user's picks say about taste. For each Slide, the picked Option against the others and the feedback that chose it ("simple visual language, more like this"). Propose additions or corrections to `docs/design/design-guide.md`, each quoting the user's words. A pick with no comment is weak evidence; say so.

## Slide library

Parts or Slides worth sharing. A part drawn on several Slides of this Episode, or close to one in another Episode, is a candidate for `src/components/slide-shared/`; a Slide shape that would serve other Episodes, for the Slide master (`docs/design/slide-library.md`). Each proposal names the files, what moves, and the import rule it keeps (design-ADR `0001-the-slide-is-a-self-contained-folder.md`).

## Cleanups

Small fixes to apply in this PR: dead code, unused i18n keys, leftover TODOs, a part duplicated inside the Episode, comments pointing at Staging paths that Promotion deletes. Each is small enough to land in one commit with `npm run verify` green.

## Refactor tickets

Changes too large for this PR: a shared abstraction several Episodes need, a test the Run kept missing, a contract that drifted. Each proposal is a ticket: a title, the problem with its evidence, and the outcome, ready for `gh issue create --label needs-triage`.

## Duplicates

Research questions that answer one question twice (design-ADR `docs/adr/0016-content-data-model.md`, _Pipeline and evidence_ rule 10). Compare each staged question with the wiki's and every other Staging's: `npm run episode:research -- list <concept-id>` for each Concept it informs. Two questions are duplicates when their h1s ask the same thing and their Answers state the same claim; a narrower or differently scoped claim is not one. Each proposal is one card to merge the newer question into the older: `title` says which question survives, `changes` is the older question's `research.md`, `evidence` names both ids and every file citing the newer one. A promoted question never retires, since its page is public, so the newer one is always staged. The user keeps the card to merge, or strikes it to keep both.

## Research questions

`npm run episode:harvest` writes this section itself, one card per staged question (`scripts/research-cards.pure.ts`): the `confidence` and `informs` its writer proposed, with the writer's one-line reason. No harvester writes it.

## Hand fixes

`npm run episode:harvest` writes this section itself, one card per hand fix of the Run (`scripts/hand-fixes.ts`, design-ADR `docs/adr/0016-content-data-model.md`, _A fix by hand feeds back_): every `fix(...)` commit that touched a content path (`.husky/feeds-paths`, the commit gate's list) since the Run's last `Gate:` commit, except one that touched only another Episode's folder. Each card shows where the commit's `Feeds:` trailer sends the lesson:

- a file: the card proposes the lesson for that skill, template or guide;
- an issue URL: the card shows the issue that holds the lesson;
- `none: <reason>`: the card lists the fix and its reason, so the user can contest it;
- no trailer, which only a skipped commit gate lets through: the card asks where the lesson goes.

The command refuses a Staging folder that no `Gate:` commit's `Source:` names, since it cannot tell where the Run's fixes start. No harvester writes this section.

## The card

The user decides each proposal on one card of the Harvest report, so a proposal is a card, as JSON. The shapes are typed in [`scripts/harvest-report.pure.ts`](../scripts/harvest-report.pure.ts); `episode:harvest` refuses a duplicate id, an overlap naming no card, and a visual kind the page cannot draw.

```json
{
  "id": "L1",
  "title": "Tell designers to name text keys after what they show",
  "weight": "strong",
  "changes": "skills/new-episode/references/write-spec.md",
  "happened": "On three Slides, the builder had to rename the text keys the designer chose, because those names are kept for Speaker notes.",
  "change": "The Spec tells designers to name a Slide's text keys after what they show: the board, the cards, the lanes.",
  "gain": "Slides build as drawn, the first time.",
  "before": {
    "kind": "flow",
    "nodes": [{ "label": "designer names it notes" }, { "label": "builder renames", "tone": "bad" }]
  },
  "after": {
    "kind": "flow",
    "nodes": [{ "label": "designer names it board" }, { "label": "built as drawn", "tone": "good" }]
  },
  "evidence": "run log ~425, 489, 523; Score fail FE-010 §3.1",
  "overlaps": ["T3"]
}
```

- **id**: the section's letter and a number: `L` Lessons, `S` Style, `B` Slide library, `C` Cleanups, `T` Refactor tickets, `D` Duplicates; `Q` is the research section's and `F` the hand-fix section's.
- **title**: the decision, as one plain sentence the user can say yes or no to.
- **happened**, **change**, **gain**: one or two short sentences each, in [plain language](#plain-language).
- **evidence**: the only field for ids, rule numbers, job names, line numbers and commit hashes. It stays folded on the card.
- **weight**: `strong`, `worth`, or `weak`, the last for evidence like an uncommented pick.
- **before** and **after**: the picture carries the card. Pick the kind that shows the change at a glance:
  - `flow` for a process: the steps a Run took against the steps it would take.
  - `stack` for files: the duplicated copies against the one shared module.
  - `quote` for a rule: the guide's line today against the proposed line.
  - `count` for a number: 46 Needs human items against 5.
- **overlaps**: the ids of cards proposing the same change from another side, with `overlapNote` saying how they differ; the user keeps one.

## Plain language

The user decides the harvest hours or days after the Run, without the run log, the Spec or the code open, and quickly. So the words on a card carry their own context:

- Write in ASD-STE100 Simplified Technical English: short sentences, active voice, common words, one idea per sentence.
- Use the words of `GLOSSARY.md` (Slide, Section, Spec, Run, Speaker note, Context marker), and name a Slide by its title, not its slug.
- Say what happened in the Run in a way the user recognises: "On the cashflow Slide, you asked for…", "Three Slides…".
- Name a rule by what it says, not by its number: "the rule that keeps `notes` for Speaker notes", not "FE-010". `episode:harvest` refuses rule ids and `§` in `title`, `happened`, `change` and `gain`.
- Name an Option by what it shows and keep its id in brackets: "the simple board (1c)".
- Picture labels are words too: a few plain words per node, no file paths unless the card moves files.
