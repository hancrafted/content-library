---
name: episode-promote
description: Run Promotion on a final Episode — harvest its Staging into lessons, cleanups and tickets, file its Spec's design Options into the Design archive, keep its Brief, and delete Staging. Use when the user says promote or Promotion, wants an Episode's Staging folder closed out, or wants its design Options archived. Publishing an Episode (its status and release date) is `docs/features/episode-publishing.md`, not this.
---

# Episode promote

**Promotion** closes an Episode's making (`GLOSSARY.md`). The Slide folders already own every word, so nothing is copied into the code: Staging is _harvested_, its design Options are _archived_, and then it is deleted. The decisions are in design-ADR `docs/adr/0004-episode-content-is-staged-then-promoted.md`; the research Gate and duplicate merges in `docs/adr/0016-content-data-model.md` (_Pipeline and evidence_, _Promotion_).

Inputs: the Episode's slug and its Staging folder `docs/episodes/<staging>/` (often `<slug>-run-<n>`). Staging is the folder holding `spec/spec.html`.

## Steps

### 1. Confirm the Episode is final

Ask the user to confirm the Episode is final. Read every `feedback/NN/feedback.md` and check each item landed in the Slides; list any that did not. An Episode that is already published or translated qualifies.

Promotion precedes publishing an Episode that cites its own staged research: `npm run verify` refuses a `published` Episode citing a Research question still in Staging. Promote first, then publish (`docs/features/episode-publishing.md`).

_Done when_ the user has confirmed and every feedback item is landed or explicitly dropped by the user.

### 2. Open the Promotion worktree

`npm run wt:new -- episode/<slug>-promote`, then work there. Every step below commits through the `commit` skill, with `Source:` naming this Promotion.

_Done when_ the session works in the new worktree.

### 3. Archive the run logs

`npm run episode:run -- <staging> archive` copies Staging's `events.jsonl` and `pipeline.yml` to `.logs/new-episode/<staging>/`, so the dashboard still opens the Run once Staging is gone, and the Run's `brief.md` and `spec/spec.html` as it left them. Then `npm run episode:runs-csv`. Commit both.

_Done when_ `.logs/new-episode/<staging>/` holds `events.jsonl`, `pipeline.yml`, `brief.md` and `spec/spec.html` and `docs/episodes/runs.csv` is regenerated.

### 4. File the Design archive

`npm run episode:archive -- docs/episodes/<staging>`. It writes `design-archive/<slug>/index.html`: one page in the Spec's frame holding every Slide with every Option as tabs (picked and recommended marked), the Visual idea, the user's feedback, every designer prompt and the cited design references; and it regenerates the dashboard, `design-archive/index.html`. Open it with `npm run design-archive` and have the user click through it. Commit `design-archive/`. A Run older than `events.jsonl` archives without designer prompts.

_Done when_ every Slide of the Spec is on the Episode's page, the user has seen the archive, and it is committed.

### 5. Harvest

Read [`references/harvest.md`](references/harvest.md) and run its six harvesters as parallel subagents. Assemble their cards into `docs/episodes/<staging>/harvest.json` and render the Harvest report with `npm run episode:harvest -- docs/episodes/<staging>`: one card per proposal, before and after drawn side by side. The command adds the research section itself, a card per staged Research question. Nothing is applied yet.

_Done when_ `harvest.html` renders all six harvested sections and a research card per staged question, every card with its before, after and evidence.

### 6. Gate the harvest

The user opens `harvest.html`, keeps or strikes each card, notes any edit, and pastes back the decisions the page copies (`- L1 keep — <note>`). Apply every kept card, with its note, one commit per section: lessons into `skills/new-episode/LEARNINGS.md`, style into `docs/design/design-guide.md`, Slide library moves and cleanups into the code, and each refactor ticket filed with `gh issue create --label needs-triage` (see `docs/agents/issue-tracker.md`). Run `npm run verify` after each code commit.

Research and duplicate cards are the user's evidence decisions:

- A kept research card (`Q`) is the user's confirmation. Write the `confidence` or `informs` the note names, if any, then add `verified: { by: human:han, at: <now, UTC> }` to that `research.md`. A struck card leaves the question unconfirmed, and step 7 refuses to move it until the user confirms it.
- A kept duplicate card (`D`) is applied in step 7; a struck one keeps both questions.

_Done when_ every kept card is applied, filed or queued for step 7, every staged question has a kept research card or the user has decided its fate, and `npm run verify` is green.

### 7. Keep what outlives Staging, and delete Staging

One commit, because `tests/docs/episode-staging.test.ts` fails on a half-moved Staging folder:

- `brief.md` moves to `src/components/episodes/<slug>/brief.md`, its `status: draft` line removed.
- For each kept duplicate card, write the retired question's findings into the kept question's Answer, then `npm run episode:merge-research -- <retired-id> <kept-id>`: it re-points every citation, lists the retired id in the kept question's `supersedes` line (never reused), and deletes the retired folder. It refuses to retire a promoted id.
- `npm run episode:promote-research -- docs/episodes/<staging>` moves every research folder into `docs/llm-wiki/research/<category>/` and lists it in `docs/llm-wiki/index.md`, cited by a Slide or not; replaces the wiki question a `refresh` in `research-plan.md` rewrote; and moves each staged Concept (`<staging>/concepts/<id>/concept.md`) into `docs/llm-wiki/concepts/`. It refuses, before moving anything, a folder with no `research.md`, a question the user has not confirmed, an `informs` that is no Concept, an id the wiki holds that the plan does not list as `refresh`, a staged Concept the user has not accepted (its `verified` entry), or a category `GLOSSARY.md` does not name; fix that and rerun. Add the ids it prints to `RESEARCH_IDS` and `CONCEPT_IDS`.
- `git rm -r docs/episodes/<staging>`; git history keeps it.
- Every comment or doc still naming `docs/episodes/<staging>/` (the Episode file's header comment among them) is rewritten to name the commit before this one.

_Done when_ `grep -r "docs/episodes/<staging>" src docs skills` finds nothing outside `.logs/`, the Brief sits beside the Episode, every kept merge is applied, and every other staged research folder is in `docs/llm-wiki/research/`.

### 8. Verify and open the PR

Run `npm run verify`, `npm run build && npm run test:build`, and `archgate check`. Open the PR through the `pr` skill, listing the filed tickets.

_Done when_ all four are green and the PR is open.

## Reading an Episode afterwards

- Words: `npm run episode:text -- <slug> [--locale de]` prints the Episode as markdown from its Slides. Never commit its output.
- Design: a new Episode reuses an archived Option by naming `<slug>/<slide>#<option>` in its Brief or feedback; the designer reads the Slide at `design-archive/<slug>/index.html#<slide>`.
