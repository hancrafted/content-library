---
name: episode-promote
description: Run Promotion on a final Episode — harvest its Staging into lessons, cleanups and tickets, file its Spec's design Options into the Design archive, keep its Brief, and delete Staging. Use when the user says promote or Promotion, wants an Episode's Staging folder closed out, or wants its design Options archived. Publishing an Episode (its status and release date) is `docs/features/episode-publishing.md`, not this.
---

# Episode promote

**Promotion** closes an Episode's making (`GLOSSARY.md`). The Slide folders already own every word, so nothing is copied into the code: Staging is _harvested_, its design Options are _archived_, and then it is deleted. The decisions are in design-ADR `docs/adr/0004-episode-content-is-staged-then-promoted.md`.

Inputs: the Episode's slug and its Staging folder `docs/episodes/<staging>/` (often `<slug>-run-<n>`). Staging is the folder holding `spec/spec.html`.

## Steps

### 1. Confirm the Episode is final

Ask the user to confirm the Episode is final. Read every `feedback/NN/feedback.md` and check each item landed in the Slides; list any that did not. An Episode that is already published or translated qualifies.

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

Read [`references/harvest.md`](references/harvest.md) and run its five harvesters as parallel subagents. Assemble their cards into `docs/episodes/<staging>/harvest.json` and render the Harvest report with `npm run episode:harvest -- docs/episodes/<staging>`: one card per proposal, before and after drawn side by side. Nothing is applied yet.

_Done when_ `harvest.html` renders all five sections, every card with its before, after and evidence.

### 6. Gate the harvest

The user opens `harvest.html`, keeps or strikes each card, notes any edit, and pastes back the decisions the page copies (`- L1 keep — <note>`). Apply every kept card, with its note, one commit per section: lessons into `skills/new-episode/LEARNINGS.md`, style into `docs/design/design-guide.md`, Slide library moves and cleanups into the code, and each refactor ticket filed with `gh issue create --label needs-triage` (see `docs/agents/issue-tracker.md`). Run `npm run verify` after each code commit.

_Done when_ every kept card is applied or filed, and `npm run verify` is green.

### 7. Keep what outlives Staging, and delete Staging

One commit, because `tests/docs/episode-staging.test.ts` fails on a half-moved Staging folder:

- `brief.md` moves to `src/episodes/<slug>/brief.md` (a Guide's to `src/episodes/guides/<slug>/brief.md`), its `status: draft` line removed.
- `npm run episode:promote-research -- docs/episodes/<staging>` moves every research folder into `docs/llm-wiki/research/<category>/` and lists it in `docs/llm-wiki/index.md`, cited by a Slide or not. It refuses, before moving anything, a folder with no `research.md`, a research ID the wiki already holds, or a category `GLOSSARY.md` does not name; fix that and rerun.
- `git rm -r docs/episodes/<staging>`; git history keeps it.
- Every comment or doc still naming `docs/episodes/<staging>/` (the Episode file's header comment among them) is rewritten to name the commit before this one.

_Done when_ `grep -r "docs/episodes/<staging>" src docs skills` finds nothing outside `.logs/`, the Brief sits beside the Episode, and every staged research folder is in `docs/llm-wiki/research/`.

### 8. Verify and open the PR

Run `npm run verify`, `npm run build && npm run test:build`, and `archgate check`. Open the PR through the `pr` skill, listing the filed tickets.

_Done when_ all four are green and the PR is open.

## Reading an Episode afterwards

- Words: `npm run episode:text -- <slug> [--locale de]` prints the Episode as markdown from its Slides. Never commit its output.
- Design: a new Episode reuses an archived Option by naming `<slug>/<slide>#<option>` in its Brief or feedback; the designer reads the Slide at `design-archive/<slug>/index.html#<slide>`.
