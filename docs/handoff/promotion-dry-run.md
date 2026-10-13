# Promotion dry run on run 1 (onboard-ai-like-a-colleague)

On 2026-10-13, Promotion, German and the harvest were walked by hand on run 1's Episode, on the throwaway branch `experiment/promote-run-1` (tag `baseline/onboard-ai-like-a-colleague/run-1`, `33c2da4`). This file is the spec input for `promote-episode`, `translate-episode` and `harvest-run`. Read **Spec input per skill** first, and the step logs when a line there needs its evidence.

Paths without a commit are on `main`. A path marked `@33c2da4` exists only at the tag, because Promotion deleted it. The throwaway commits are `0deb150` (A1) and `278c510` (A2–A8, B9).

## Step logs

### A1 Approve

- **Did:** set the Dossier `status: checked` → `approved`. The Brief and Manuscript were already `approved` from their gates.
- **Result:** `mh check` passes. The handoff expected a failure, but the shared `staging-status` anchor already lists `approved` (`markdown-harness.config.yaml:77`), and `staging-dossier` reuses it (`:92`). A probe that added `status: approved` to a `research.md` failed the `research` rule (`unknownKeys: forbidden`).
- **Gaps:**
  - The `approved` intent reads "Promotion moved the file next to its Slides" (`:77`), so it is false while the file still sits in staging. Set `approved` after the move.
  - `approved` means two things. For the Brief and the pipeline, Han accepted the draft at its gate. For the Dossier and the promoted files, the file was promoted. The Manuscript was already `approved` in staging, which the #89 contract does not allow ("only Brief and per-run pipeline reach `approved`"). Status alone cannot tell a gate from a promotion.
  - Story 52 ("promoted files set approved") cannot cover research files or `run-log.md`, because neither has a `status` field.

### A2 Move the Brief and Dossier

- **Did:** `git mv` both files to `src/components/episodes/onboard-ai-like-a-colleague/`.
- **Result:** `check:docs`, `archgate check` (12/12), `npm run lint` (eslint and depcruise) and prettier all pass. `mh query` on the new paths returns `staging-brief(-body)` and `staging-dossier(-body)`, because rules select files by name. No rule objects to markdown in an Episode folder. FE-002 lists what a Slide folder holds (`.archgate/adrs/FE-002-episode-page.md:68`) but checks none of it, and it never lists what the Episode folder holds (#87).
- **Commit rejected** by pre-commit `verify:commit`: `tests/docs/episode-staging.test.ts:254` fails with `ENOENT .../docs/episodes/onboard-ai-like-a-colleague/brief.md`. The test reads `brief.md` beside every staging `pipeline.yml`.
- **Gaps:**
  - A half-promoted staging folder cannot be committed, so Promotion must be one atomic commit.
  - ADR 0004 decision 2 (`docs/adr/0004-...:21`) does not say what happens to `pipeline.yml`, `run-log.md` or `feedback/`.
  - Promoted files still carry rule ids and intents that say "staging".
  - Nothing checks that the Dossier's `brief: ./brief.md` resolves.
- **Dry-run handling:** A2–A8 and B9 landed as one commit, `278c510`. `--no-verify` was never used.

### A3 Rewrite Visuals from the built Slide

- **Did:** read each `slides/<slug>/slide.tsx`: its imports and its header comment.

| Slide                                                                                                          | Built from                                         | `master:`                                                   | `motion:`                    |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| twenty-x-versus-your-screen, what-you-would-say-first, four-oclock-the-plan-comes-back, write-the-day-one-note | `SlideFrame` + `SlideCaption` + a local Scene part | basic-page (nearest name; `BasicPageSlide` is not imported) | liquid-ink-transition → none |
| you-managed-it, ai-can-help-you-onboard-ai                                                                     | `BasicPageSlide`                                   | basic-page                                                  | → none                       |
| sommerfest-due-by-five, same-wall-one-level-up                                                                 | `ThreeColumnSlide`                                 | three-column                                                | → none                       |
| four-disciplines                                                                                               | local copy of `grid-2x2`                           | grid-2x2                                                    | → none                       |

- **Result:**
  - All 9 motions changed. Han decided "build without motion" (`run-log.md:635`, `:666` @33c2da4). The decision reached the `slide.tsx` comments and #99, but never the Dossier, which breaks ADR 0004 decision 1.
  - The cross-file checker rejects `motion: none` 9 times ("names motion \"none\", which is no motion effect", `src/lib/episode-staging.pure.ts:57`). The spine check passes.
- **Copied Master slide trace:** only one hand-written comment, `four-disciplines/slide.tsx:55` @33c2da4 ("A local copy of the catalog grid-2x2"). There is no import or metadata. A `diff` against `src/components/episodes/slide-master/slides/grid-2x2/slide.tsx` confirms the copy.
- **Gaps:**
  - The `motion:` vocabulary has no "none".
  - The `master:` vocabulary has no name for "own Scene on the master's parts".
  - Nothing records which Master slide a Slide was copied from.
  - The Visual prose still says "No catalog match: the wanted layout is…" for Scenes that are now built. four-oclock built the budget variant, but the prose still offers venue or budget. Decision 21 rewrites only the two values.
  - After the move, no cross-file check covers the promoted Dossier (`tests/docs/episode-staging.test.ts:82` walks only `docs/episodes/*` and the sample).

### A4 Split the Manuscript

- **Did:** wrote 13 `slides/<slug>/slide.md` files: frontmatter `type: slide`, `locale: en`, then `# <Manuscript title> {#slug}` and `## Story`. Page Slides also get `## Visual`, `## Speaker notes` and `## Segments`, copied verbatim from the Dossier h4 blocks.
- **Result:** prettier passes. `mh query …/slide.md` returns `"governance": "invisible"`: no rule governs `slide.md`.
- **Guesses the contract leaves open:**
  - **Subsection level.** I chose h2 under the h1. The contract says only "then Story, Visual, Speaker notes, Segments".
  - **Title slide (h1).** It has no Slide folder; the Episode title lives in `<ep>/i18n/en.json`. Its paragraph was already voiced as segment `hold-it-up` of `the-gap` (`d5643eb`; main `LEARNINGS.md` lesson 7), so it became paragraph 1 of `the-gap/slide.md`. That file now holds a paragraph written under a different heading.
  - **Section slides (4 h2s).** They get Story only. The Dossier allows h4s only under h3s, so no Visual, notes or segments exist for them. Their `caption` lives only in `en.json`.
  - **The promoted Dossier.** It still holds every Visual, Speaker notes and Segments block, so each block now has two owners. Decision 2 does not say what the Dossier keeps.
- **Gap:** `slide.md` never holds the on-screen text nobody speaks: the title "Day one, before you type", captions, the prompt/answer exchange, the note lines. Decision 3 says "`slide.md` owns a Slide's text", but these strings stay owned by `en.json` alone.

### A5 Parity by hand

These mismatches are the parity tests' first failing cases.

- **Story vs Voice script:** passes on all 13 Slides. Paragraph _n_ is byte-equal to segment _n_'s `.script`, and the counts are equal.
- **Title (`# <title>` vs `en.json` `title`):** 6 mismatches. The kit's `Title` renders `t('title')`, so the table of contents shows the `en.json` title. That breaks the `staging-manuscript-body` intent "titles copied verbatim into the Episode".
  - twenty-x-versus-your-screen: "20x on the poster, not on your screen" vs "“Become 20x more productive with AI”"
  - write-the-day-one-note: "Write the day-one note first" vs "Day one, before you type"
  - you-managed-it: "You managed it, you did not do it" vs "You did not do the task."
  - four-disciplines: "Four disciplines, one line each" vs "Four disciplines"
  - four-oclock: `'` vs `’`
  - ai-can-help: a trailing "." in `en.json`
- **Segments:** 3 mismatches, where the implementation rewrote keywords and the Dossier was not updated: ai-can-help #3, what-you-would-say-first #1 and #5.
- **Speaker notes:** counts are equal. Text differs in ways a test must normalise before it compares:
  - straight vs curly quotes
  - first letter after `—` lowercase in the markdown, capitalised in the JSON
  - citation numbers per Slide in the markdown (`[4]`), per note in the JSON (`[1]`)
  - `[n]` before the full stop in the markdown, after it in the JSON
  - one reworded clause (ai-can-help note 1)
  - URLs live in `slide.tsx` (`sources: [{ slug, url }]`) and titles in `en.json`, so one note spans three files.
- **Dossier spine vs `onboard-ai-like-a-colleague.ts`:** passes. The h2/h3 order equals the `sections` arrays, the h1 slug equals the Episode slug, and the Manuscript h1 title equals the Episode `en.json` title. A test must read slugs from the `episode()` record, because the file holds only camelCase identifiers.

### A6 Move research

- **Which files are "still cited":**
  - The Dossier cites primary-source URLs, never research files. Matching by URL overlap found 5–6 shared URLs per file, so all 6 files count as cited and none were deleted.
  - Guess: a file counts as "cited" when it shares one URL with the Dossier.
- **Did:**
  - `git mv` each `research/AIE-000n__*/` to `docs/llm-wiki/research/`.
  - Created `docs/llm-wiki/index.md` in the format `src/lib/episode-staging.pure.ts:186` (`INDEX_ENTRY`) and #86 imply.
- **Index guesses:**
  - `<title>` is the file's h1.
  - The path is `research/<folder>/research.md`; #86 still shows the flat `research/<file>.md`.
  - The file opens with an h1 and one intro sentence, and has no frontmatter. It is ungoverned (`mh query` returns invisible).
  - Lines are ordered by research ID.
  - The YAML description is unescaped (`''` → `'`) before the byte-for-byte copy.
- **Result:** the index-vs-files test passes, and the moved files keep `research` and `research-body`. vitest fails:
  - `tests/docs/episode-staging.test.ts:353`: `expected [ 'docs/llm-wiki/index.md' ] to deeply equal []`. This tripwire makes the change that creates the index also delete it from `PENDING` (`:41-42`).
  - `:287`: "The research ID AIE-0001 names 2 folders" ×6. The leftover `pipeline.yml` still plans the old paths (`researchFolders()`, `:106`).
- **Gap:** `stale_after` is not re-assessed at the move, though `mh assess` exists for it.

### A7 Delete the staging folder

- **Did:** deleted the folder after C10–C12 had read it. `docs/episodes/runs.csv` stays.
- **Lost (kept only in git history):**
  - `pipeline.yml`.
  - `run-log.md`, with its 48 `Needs human:` lines.
  - `manuscript.md`. Decision 3 promises a reading copy "generated on demand", but no generator exists.
- **Stale references left:**
  - `src/components/episodes/onboard-ai-like-a-colleague/onboard-ai-like-a-colleague.ts:22`, a comment.
  - `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.ts:20`, a comment.
  - The bodies of tickets #99–#103, which link `blob/episode/onboard-ai-like-a-colleague/docs/episodes/…/dossier.md#<slug>`. Those links 404 once the Episode branch carries Promotion.

### A8 Verify

- **`npm run verify`: fails.**
  - Run 1: eslint linted a probe script in `.scratch/`. `.scratch/` is gitignored but not eslint-ignored.
  - Run 2: archgate:full (32/32), lint, prettier and typecheck pass. vitest has one failure, the `PENDING` tripwire `:353`; the A2 and A6 failures are gone with the staging folder.
  - knip and `check:docs` pass when run separately.
- **`npm run build`:** passes.
- **`npm run test:build`:** fails, 543/544: `episode-text.build.test.ts > /de/episode/onboard-ai-like-a-colleague > shows the reader the same text it showed before the move`. The capture `tests/post-build/episode-text/onboard-ai-like-a-colleague.de.json` holds the pre-B9 German.
- **`archgate check`:** 12/12 pass.
- **To commit:** removed `docs/llm-wiki/index.md` from `PENDING`.
- **Gap:** once the staging folder is gone, no cross-file check covers the promoted Episode. `tests/docs/episode-staging.test.ts:271` (an approved Brief keeps no Not-settled section) still passes, but only through the sample Episode.

### B9 German for write-the-day-one-note

- **Did:** wrote `slide.de.md` with `type: slide`, `locale: de`, and Story, Speaker notes and Segments, leaving out the language-independent Visual. Then made `de.json` follow it.
- **Diff against the existing `de.json`:** P2–P4, all three notes and all four segments are equal. Two places differ:
  - **P1:** the old text, "Das ist also dein Zug … halt an", echoes the section title "Dein Zug" (`your-move/i18n/de.json`). My "Jetzt bist du dran … Stopp" reads better alone but drops that echo. A reviewer needs the Section in view, not just the Slide.
  - **Title:** "Erst die Notiz für Tag eins" (from the Manuscript h3) vs "Tag eins, bevor du tippst" (from the `en.json` title). This is the A5 title split, now in German too.
- **Checks:**
  - `slide.de.md` is ungoverned.
  - No test compares `de.json` with `slide.de.md`.
  - `test:build` fails until the German capture is redone (A8).
- **What a reviewer needs and does not have:**
  - **A German tone guide.** #88 plans English profile guides only. Nothing settles _du_ or _Sie_ for "German businesses for coaching and consulting" (`AGENTS.md`, Audiences). `de.json` uses _du_.
  - **Text localization rules.** FE-003-localization covers URLs, hrefs and `fillTemplate`, not register, gendering, number format or source titles. The run's own choices:
    - "eine neue Kollegin" stands for the generic colleague.
    - The on-screen line says "die sie brauchen" (plural); the script says "die sie braucht" (singular).
    - Numbers are written "1,5 %".
    - Source titles stay in English.
  - **The reading-time effect.** German word count sets reading time (FE-002 2.3), so a longer translation changes segment times without anyone noticing.
- **Ownership as tried:** `slide.de.md` owns the spoken German. `de.json` alone owns the on-screen German nobody speaks.

### C10 Gate pairs

- **Commits:** `git log --grep='Gate:'` finds 12:
  - Brief: `fd90fcf` → `69ac628`.
  - Pipeline: 7 drafts, not 8 (`051b47f`, `aa09079`, `7e09e13`, `2484bbf`, `66004b6`, `9b960e5`, `fa38e0e`), then `156f846`.
  - Manuscript: `a8ab6df` → `522d24f`.
- **Diffs:** each final pair changes only `status:`. This confirms `.agents/skills/new-episode/LEARNINGS.md:22`; the tag's copy of that file still reads "None yet". Pipeline drafts 2–7 are template merges by agents. There are no gates for the Dossier, research, spec or tickets.
- **Authors:** every commit's author is "Han Che". Only the `Gate:` trailer and the subject tell an agent commit from Han's.
- **What a harvester can learn:** an acceptance signal per artifact.
- **What it cannot learn:** Han's style. His edits happen before the draft commit (the grill co-writes the Brief, and `fd90fcf` adds all 55 lines of it) or as session answers recorded only in run-log Notes (`run-log.md:15`, `:24`, `:635` @33c2da4). No `feedback/` round ran.

### C11 Ticket edit history

- **Data:** `gh api graphql` `issue.userContentEdits` shows two entries per ticket for #100–#103: the creation (2026-10-12T22:16Z) and one edit (2026-10-13T05:43:44Z–05:45:00Z). Every `editor.login` is `hancrafted`.
- **Who made the edits:** the four edits fall within 76 s of each other. They are the per-ticket `ui-ux-pro-max:slides` design subagents (`run-log.md:635` @33c2da4), writing with Han's token.
- **Result:** the edit history cannot separate Han's edits from agent edits. A harvester would learn the subagents' design answers as Han's taste.

### C12 Run-log findings and runs.csv

- **Notes by prefix:**

| Prefix              | Count               |
| ------------------- | ------------------- |
| `Needs human:`      | 48                  |
| `No catalog match:` | 5 (`write-dossier`) |
| `Blocked:`          | 0                   |
| `Research gap:`     | 0                   |

- **`Needs human:` by job:** write-research 20 (across the 6 jobs), implement-episode 9, write-dossier 6, write-manuscript 6, write-spec 4, retire-prior-research 2, open-pr 1. The open-pr line is itself a call to triage the other 47 (`run-log.md:708` @33c2da4).
- **Prefix rename pending:** `docs/handoff/write-design-spec-decisions.md:32,37` renames the prefix to `No library match:`. A harvester must accept both spellings until run 1's log is gone.
- **Unrecorded answers:** no file says which `Needs human:` items Han settled.
- **runs.csv** (49 rows, one run id):

| Job                   | Rows | Fails                       | Max attempt | Seconds | Tokens               |
| --------------------- | ---- | --------------------------- | ----------- | ------- | -------------------- |
| brief-grill           | 1    | 0                           | 1           | 1,043   | —                    |
| pipeline-tailor       | 3    | 0                           | 1           | 139     | —                    |
| customize-pipeline    | 5    | 0                           | 1           | 0       | —                    |
| categorize-research   | 1    | 0                           | 1           | 9       | 38,318               |
| retrieval             | 1    | 0                           | 1           | 29      | 55,931               |
| write-research ×6     | 22   | 5 (all reviewer, attempt 1) | 2           | 1,318   | 1,213,957            |
| retire-prior-research | 1    | 0                           | 1           | 50      | 62,924               |
| write-dossier         | 4    | 1                           | 2           | 276     | 278,754              |
| write-manuscript      | 4    | 1                           | 2           | 153     | 202,102              |
| write-spec            | 2    | 0                           | 1           | 170     | 139,023              |
| implement-episode     | 4    | 2                           | 2           | 27,488  | 85,358 (1 of 4 rows) |
| open-pr               | 1    | 0                           | 1           | 49      | 58,068               |

- **Totals:** 2,134,435 tokens; research takes 57% of them.
- **Reporting gaps:**
  - Orchestrator-session jobs report no tokens and 0 s.
  - implement-episode's 27,160 s first attempt is wall time across Han's overnight answers, not work time.

### C13 Proposed entries (not applied)

Each entry rests on one run, so none meets the "correction made twice" bar in `SKILL.md`, _After the run_. Han approves or drops each one (story 58).

- **Storytelling guide:**
  - Run a thought experiment as a lived scene, with no labelled buckets inside it. Resolve it lightly afterwards, with no one-to-one mapping. Source: the Brief's Analogy, in Han's handoff wording (`run-log.md:24` @33c2da4).
  - Let the hook leave the "why" open, and answer it only after the experiment. Source: the Brief's Hook, carried out in `#twenty-x-versus-your-screen` → `#you-managed-it`.
  - End on a standalone line, not a cliffhanger, and tease a list one line per item. Source: the Brief's Analogy, "Closing bridge".
- **Tone guide:** no Han edit exists. The only evidence is acceptance: the Manuscript passed its gate unchanged, with short declaratives, second person, present tense and no spoken statistics (`run-log.md:590` @33c2da4). Log it as observed, not as a rule.
- **Mental-model guide:**
  - AI is a capable colleague with no memory, whom you onboard rather than prompt. "Colleague", not "intern". Source: the Brief's Format and Red thread; Speaker note 3 of `#sommerfest-due-by-five`.
  - Delegation is a discipline the task demands, not a matter of seniority. Source: Brief research question 6.
- **Design guide** (`docs/design/design-guide.md`): no design-gate edit by Han exists; the subagents wrote the design answers (C11). One scoped candidate: build without motion when the only motion is a full-viewport overlay a Slide cannot import (`run-log.md:666` @33c2da4). It is already lesson 3 in `LEARNINGS.md`, so propose it there, not as taste.
- **LEARNINGS.md**, new lessons only (main already has lessons 1–12):
  1. **Session decisions never reach the Dossier.** "No motion" landed in code and on #99 only. Proposed fix: the job that takes Han's answer edits the Dossier or Manuscript first (ADR 0004 decision 1).
  2. **The implementation retitles Slides without telling the Manuscript.** 6 of 9 titles differ (A5). Proposed fix: write-spec names the on-screen title separately from the h3, or the parity test fails the build.
  3. **Research costs 57% of tokens, and 5 of 6 first attempts fail review** on Answer and Findings citation lines. Proposed fix: tighten the research reference against those rubric lines.
  4. **48 `Needs human:` lines with no record of their answers.** Proposed fix: open-pr's checklist is the place Han's answers get recorded, and the harvest reads it.
  5. **Agent writes look like Han's.** Commits and ticket edits share his identity. Proposed fix: a trailer such as `Agent: <job>` on agent commits, and an `Edited-by: <job>` footer on agent ticket edits.
  6. **Orchestrator-session jobs log 0 s and no tokens; implementor duration includes waiting on Han.** Proposed fix: record `waited_s`, or end a row at each question.

## Decisions for Han

1. **What does the promoted Dossier keep?** Either full blocks, which duplicate `slide.md`, or only the spine and unslugged material. _Recommend:_ only the spine and the extras, so `slide.md` alone owns Visual, notes and segments, and the Dossier-vs-`<ep>.ts` test still has headings to read.
2. **Where does the Title slide's and section slides' text live?** _Recommend:_
   - The Title-slide paragraph lives in the Episode folder's own `episode.md` (`# <title> {#<ep>}`, Story), matching `<ep>/i18n/en.json`.
   - The `hold-it-up` segment moves to a kit slot when one exists (main LEARNINGS lesson 7).
   - Section slides get a `slide.md` with Story only, which the slide.md rule should allow.
3. **Which title is canonical: the Manuscript h3 or the on-screen title?** _Recommend:_ two fields. The h3 title is the table-of-contents entry and anchor. A Visual-named `title:` is the on-screen text. The kit reads the TOC title from the first. Otherwise parity fails on 6 of 9 Slides.
4. **Who owns text nobody speaks** (captions, Scene copy)? _Recommend:_ `i18n/*.json`, with decision 3 narrowed to "`slide.md` owns the spoken text and the Slide's spec".
5. **Who owns German?** _Recommend:_ `slide.de.md` owns the spoken German, `de.json` follows it and is tested against it, and `de.json` alone owns on-screen German.
6. **_du_ or _Sie_ for the German business audience,** and who writes the German tone guide? _Recommend:_ add it to #88 before the first `translate-episode` run.
7. **Do Promotion's status semantics need two values?** _Recommend:_ keep `approved` for Han's gates. Mark promotion by the file's location and a promoted-file rule, not by a status value, and drop `approved` from the staging Dossier and Manuscript values.
8. **What counts as "the Dossier still cites a research file"?** _Recommend:_ the Dossier names research files explicitly (`research: AIE-0004` per note), so promotion moves files mechanically.
9. **Which motion value means "no motion"?** _Recommend:_ `motion: none`, accepted by `src/lib/episode-staging.pure.ts:57`.
10. **Which master name fits a Scene built on the master's parts?** _Recommend:_ `master: basic-page` plus a required Visual prose line naming the Scene part.

## Spec input per skill

### promote-episode

1. **Approve last.** Set `status: approved` after the move, or retire it (Decision 7).
2. **Plan atomically.** Promotion is one commit. A half-promoted tree fails the staging test (`tests/docs/episode-staging.test.ts:254`, `:287`).
3. **Move the Brief and Dossier** to `src/components/episodes/<ep>/`, and trim the Dossier per Decision 1.
4. **Rewrite each Visual** from the built `slide.tsx`: the imported frame or the copy comment, then `motion: none` where none is imported. Flag Visual prose that still reads "No catalog match" or offers alternatives. A reviewer checks the rewrite (decision 21).
5. **Split the Manuscript** into `slides/<slug>/slide.md` for all h2s and h3s, and place the h1 text per Decision 2.
6. **Run the parity checks** with a normaliser for quotes, capitalisation after `—` and citation renumbering. Fix the Dossier or Manuscript where the implementation is right (titles, segments).
7. **Move research:**
   - Move cited folders to `docs/llm-wiki/research/` and write one index line each: `- [<h1>](research/<folder>/research.md) — <description>`.
   - Delete the rest.
   - Drop the index from `PENDING` the first time.
   - Run `mh assess` on each moved file.
8. **Hand off to `harvest-run`, then delete** `docs/episodes/<slug>/`, keeping `runs.csv`.
9. **Fix stale references:** `<ep>.ts` and any other comment naming the staging path. Ticket links should point at a commit SHA, not the branch.
10. **Verify:** run `npm run verify`, `build`, `test:build` and `archgate check`.

**Checks it needs:**

- an mh rule for `slide.md` and for promoted Brief and Dossier files
- the cross-file module run over `src/components/episodes/*/` once promoted
- a `slide.md` vs `en.json` parity test
- a Dossier vs `<ep>.ts` order test

**Depends on:**

- #86, the index (this run created it on the throwaway branch only)
- #87, amend FE-002 to admit `brief.md`, `dossier.md` and `slide*.md`

### translate-episode

1. **Write German per Slide.** For each Slide, write `slide.de.md` from `slide.md` with Story, Speaker notes and Segments. The reviewer gets the whole Section in view (B9's echo of "Dein Zug").
2. **Update `de.json` from `slide.de.md`**, plus the on-screen strings `de.json` alone owns.
3. **Recapture** `tests/post-build/episode-text/<ep>.de.json` and review the diff.
4. **Check reading time:** compare each German segment's time with the English one.

**Checks it needs:**

- an mh rule for `slide.de.md` (`locale: de`)
- a `slide.de.md` vs `de.json` parity test

**Depends on:**

- #88, profile guides, plus a German tone guide (Decision 6)
- Decision 5

### harvest-run

1. **Read the staging folder before Promotion deletes it:** `run-log.md`, `feedback/*`, `pipeline.yml`.
2. **Pair the gate commits** with `git log --grep='Gate:'`, then diff each final draft→approved pair. A status-only diff is an acceptance signal, not a style entry.
3. **Read the ticket edit history** (`userContentEdits`), but attribute an edit to Han only when it is marked (C11). Unmarked edits are unattributable.
4. **Collect Notes by prefix,** accepting both `No catalog match:` and `No library match:`. Group them by job. Then aggregate `runs.csv` by job: rows, fails with their rubric lines, attempts, seconds, tokens. Flag rows with no tokens and wall-time outliers.
5. **Propose, never apply.** Write profile-guide entries, each with its source line, and `LEARNINGS.md` lessons that are not already listed. Han approves each one (story 58).

**Checks it needs:** none automated. Its output is proposals.

**Depends on:**

- #88, the guides it writes to
- an attribution marker for agent commits and edits (LEARNINGS proposal 5); without it, steps 2–3 have almost no signal.
