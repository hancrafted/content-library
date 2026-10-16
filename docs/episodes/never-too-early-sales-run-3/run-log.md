# Run log

## brief-grill · 2026-10-15T11:46:50Z

### Inputs

- `.scratch/never-too-early-sales-run-3/handoff.md`: Han's approved Brief from never-too-early-sales-run-2, accepted unchanged as the starting point for this run.
- `.scratch/never-too-early-sales-run-3/source-deck.pdf`: the source deck the Brief's Episode Design Reference names.
- `docs/design/design-guide.md`: the named styles the Style line must pick from.
- Han's answers in this session to the attempt 1 reviewer lines.

### Output

- `brief.md`, `status: draft`, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.
- `docs/design/design-guide.md`: the `### Board` named style, copied verbatim from the never-too-early-sales-run-2 branch at Han's word.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Reviewer: pass on attempt 2.

### Notes

Han chose to reuse the run-2 Brief unchanged, so this run compares with run 2. Shape-only fix: `generated` was reset to this run, and run 2's `verified` entries were dropped, so no earlier approval counts.

Attempt 1 failed on one line, the Style intent: the Brief names `Board`, but `main`'s design guide listed only Editorial. The run-2 Board entry never reached `main`. Han chose to re-add it word for word instead of switching to Editorial.

Attempt 1 also marked one line as needs-human: Audience, Format and a Constraint each say "live coaching first, then YouTube". Han keeps all three as written.

- `convert-references` writes `reference/source-deck/design-reference.md` after the pipeline gate. Until then the Brief's Episode Design Reference link has no target.
- Run 2's Brief-level Needs human items stand unchanged, because Han kept the Brief: Slides 4–5 use the pipeline before Slide 7 defines it, and Q5 covers two causes.

## scaffold-pipeline · 2026-10-15T12:14:31Z

### Inputs

- `skills/new-episode/assets/pipeline.yml`: the template, at `main`'s `dc8e88f`, the commit last merged into this branch.
- `brief.md`: its Episode Design Reference names one file, `reference/source-deck/design-reference.md`.

### Output

- `pipeline.yml`, `status: draft`, `template: dc8e88f`, with every job of the template; `write-research` and `implement-section` stay unexpanded `foreach` jobs.
- Every `reference/*/design-reference.md` glob is replaced by `docs/episodes/never-too-early-sales-run-3/reference/source-deck/design-reference.md`.
- `tests/docs/episode-staging.test.ts` (commit `5b5647a`): `researchFolders()` skips a glob output. The test had read the draft's `research/*/research.md` as a folder name and refused it.

### Checks

- `vitest` staging test: fail on attempt 1, pass on attempt 2.

### Notes

Removed because the files do not exist yet: `docs/profile/han/storytelling-guide.md`, `docs/profile/han/tone-guide.md` and `docs/profile/han/mental-model-guide.md`, from the agents of `write-dossier` and `write-voice-script`.

Attempt 1 failed on the staging test, which the scaffold-pipeline reference contradicts: "docs/episodes/never-too-early-sales-run-3/research/* is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>." The job has 0 retries. Han chose to fix the test on this branch, before the pipeline gate freezes the template, and to retry the job. The `han-reply` Gate also carries a rubric `pass` Score on `scaffold-pipeline#1` from `human:han`. It was logged by mistake: it records his choice to fix the test, not a judgement of the output.

## categorize-research · 2026-10-15T12:16:32Z

### Inputs

- `brief.md`: the seven questions under `## Research questions`.
- `GLOSSARY.md`: the Research categories.
- `docs/llm-wiki/index.md` and the research folders under `docs/llm-wiki/research/`.
- Branch `episode/never-too-early-sales-run-2`: it holds the same llm-wiki folders, and none under `docs/episodes/*/research/`.

### Output

- One folder name per question, in the Brief's order. Each one reuses an existing llm-wiki folder whose `research.md` title matches the question word for word: 1 `START-0001__revenue-lags-costs-in-startups`, 2 `SALES-0001__b2b-sales-cycle-length`, 3 `SALES-0002__b2b-pipeline-conversion-rates`, 4 `SALES-0003__early-selling-market-insight`, 5 `SALES-0004__early-sales-results-build-trust`, 6 `SALES-0005__early-selling-repeatable-process`, 7 `SALES-0006__sales-pipeline-ramp-up-time`.
- No category was added. No file changed, so the job branch merged with no commit.

### Checks

- `mh check`: pass.

### Notes

Other branches still carry folders under retired categories (`BIZ-*`, `GTM-*`, `FIN-*`) for the same questions. `GLOSSARY.md` no longer lists those categories, so they were not reused. Retrieval decides whether each reused folder needs a refresh.

## convert-references · 2026-10-15T12:18:18Z

### Inputs

- `brief.md`: one Episode Design Reference, `reference/source-deck/design-reference.md`.
- `.scratch/never-too-early-sales-run-3/source-deck.pdf`: the source deck brief-grill copied, 16 pages.

### Output

- `reference/source-deck/design-reference.md`: 16 pages, each with a `## Page <n>` and its page image in `pages/`.
- `crops/`: 5 of marker's 27 cut-outs kept, from pages 2, 8, 12, 14 and 16.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.
- Page 8 (the cashflow board) checked against its image: the text holds every note's words and amounts.

### Notes

Pages 1, 5 and 9 hold only their title, which matches the title and section-divider pages.

Needs human: page 16's text came back empty. Its board, Q1–Q4 with "Start when?", came through only as the cut-out `crops/page-16-diagram-3.jpg` and its page image, so no note's words or amounts are in the text. Page 13 is a third-party Pipedrive screenshot; its OCR text is UI noise. The Brief says to draw our own deal board instead.

## retrieval · 2026-10-15T12:18:21Z

### Inputs

- `skills/new-episode/references/retrieval.md`: the job's reference.
- `docs/episodes/never-too-early-sales-run-3/brief.md`: the seven Research questions and the Slides that cite them.
- `docs/llm-wiki/index.md`: the research descriptions searched per question.
- The seven research files the `categorize-research` folders name, each read in full under `docs/llm-wiki/research/`.
- `docs/episodes/never-too-early-sales-run-3/run-log.md`: the `categorize-research` entry with the folder names.

### Output

- Question 1: reuse `docs/llm-wiki/research/START/START-0001__revenue-lags-costs-in-startups/research.md`.
- Question 2: reuse `docs/llm-wiki/research/SALES/SALES-0001__b2b-sales-cycle-length/research.md`.
- Question 3: reuse `docs/llm-wiki/research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md`.
- Question 4: reuse `docs/llm-wiki/research/SALES/SALES-0003__early-selling-market-insight/research.md`.
- Question 5: reuse `docs/llm-wiki/research/SALES/SALES-0004__early-sales-results-build-trust/research.md`.
- Question 6: reuse `docs/llm-wiki/research/SALES/SALES-0005__early-selling-repeatable-process/research.md`.
- Question 7: reuse `docs/llm-wiki/research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md`.

### Research jobs

- none: every question reused.

### Checks

- mh check: pass.

### Notes

Every file is fresh: the earliest `stale_after` is 2027-10-13, after today (2026-10-15).

- Question 1 (START-0001): its Context supports the claim that cash position is decided by timing, which is what slides 1, 3, 6 and 10 use the cashflow board for.
- Question 2 (SALES-0001): its Context claims a B2B deal needs months from first contact to signature because the buyer group decides slowly, which is slide 8's ~9.5-month cycle.
- Question 3 (SALES-0002): its Context claims a pipeline needs many more leads than deals and says it checks a worked example of such ratios, which is slide 8's ~27:1.
- Question 4 (SALES-0003): its Context is scoped to what direct contact with buyers teaches, the market insight claim of slide 2.
- Question 5 (SALES-0004): its Context claims early sales earn investor and customer trust, slide 2's claim. Its description says no study measures letters of intent or pipelines directly; write-dossier should not claim more.
- Question 6 (SALES-0005): its Context claims early selling yields a process, slide 2's repeatable-process box.
- Question 7 (SALES-0006): its Context claims a pipeline cannot be switched on when money is needed, slide 9's ramp-up.

## customize-pipeline · 2026-10-15T12:20:19Z

### Inputs

- `pipeline.yml`: the draft scaffold-pipeline wrote from template `dc8e88f`.
- `brief.md`: five Section h3s under `## Slides`.
- `run-log.md`: retrieval's `### Research jobs` reads `- none: every question reused.`

### Output

- `pipeline.yml`, `status: draft`: no `foreach` and no glob output left; committed with `Gate: draft pipeline` for Han to approve.

### Checks

- `vitest` staging test: pass, also with `status: approved` set for a trial run and then reverted.

### Notes

Changes from the template, each with its reason:

- `write-research` removed, along with `write-dossier`'s `wants: [write-research]`: retrieval reused every question, so the Research stage stays empty.
- `write-dossier` references the seven reused llm-wiki files in place of the `research/*/research.md` glob: START-0001 and SALES-0001 to SALES-0006 under `docs/llm-wiki/research/`.
- `implement-section` is expanded into one job per Section, in the Brief's order, each with an `intent` naming the Section and its position: `implement-section-why-watching-cashflow-is-mission-critical`, `-why-sales-is-more-than-just-selling`, `-how-to-start-doing-sales`, `-why-building-an-effective-sales-pipeline-takes-time` and `-start-before-you-need-the-money`. `open-pr` needs all five.
- Ports: `implement-episode-init` 4000, then the Sections 4001 to 4005 in order. All six were free.
- The comments on `retrieval` and `write-dossier` now describe this run, since the ones from the template named the dropped foreach.
- Retries, gates, skills and models are unchanged: the Brief gives no reason to change them.

## customize-pipeline · 2026-10-15T12:37:30Z

### Inputs

- Han's change at the pipeline gate: "i've added some steering files for voice script in docs/profile add in the pipeline".
- `docs/profile/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md`, which reached this branch through `main`'s `f211581`.

### Output

- `pipeline.yml`, still `status: draft`, with the three guides added back where the template lists them. It is committed again with `Gate: draft pipeline`.

### Checks

- `vitest` staging test: pass.

### Notes

- `write-dossier` implementor and `write-voice-script` implementor: all three guides. `write-voice-script` reviewer: storytelling and tone. These are the same paths and places as the template at `main`.
- `template:` moves from `dc8e88f` to `f211581`, the `main` commit this branch now sits on. The template changed between the two only in these guide paths.
- These guides replace the three `docs/profile/han/*` files that scaffold-pipeline removed because they did not exist.

## write-dossier · 2026-10-15T12:52:11Z

### Inputs

- `skills/new-episode/references/write-dossier.md`, `brief.md` and this run log: retrieval reused all seven questions, and no job blocked.
- The seven reused research files: START-0001 for question 1, and SALES-0001 to SALES-0006 for questions 2 to 7, under `docs/llm-wiki/research/`.
- `reference/source-deck/design-reference.md` and its page images. Pages 8, 11 and 16 were checked against their images, and page 16 was written from its image because its text was empty.
- `docs/profile/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md`.
- `skills/new-episode/assets/sample-episode/dossier.md`, `docs/design/slide-library.md` and the Master slides in `src/components/episodes/slide-master/slides/`.

### Output

- `dossier.md`, `status: draft`, with a `process:markdown-harness` `verified` entry: one h1, five h2 Sections and ten h3 Slides, the Brief's spine one for one.
- Masters: `grid-1x3` for Slides 2, 7 and 9, `three-column` for Slide 3, and `basic-page` for Slides 1, 4, 5, 6, 8 and 10. Every Visual names its source-deck page.
- Actionable 1 is on `watch-your-cashflow`, `watch-your-cashflow-revenue-pulled-in` and `watch-your-cashflow-start-when`. Actionables 2 and 3 are on `stages-of-sale`. Actionable 4 is on `pipeline-tools-in-practice`, `what-is-a-sales-pipeline`, `pipeline-by-the-numbers`, `why-it-takes-time-to-ramp-up` and `watch-your-cashflow-start-when`.
- Voice scripts hold beats with keywords, ready for `write-voice-script`.

### Checks

- `mh check`: pass on all three attempts.
- `vitest` staging test: pass on all three attempts.
- Reviewer: fail on attempts 1 and 2, pass on attempt 3, with all 5 rubric lines and 16 intents passing.

### Notes

- Attempt 1 failed "5. No Voice script item repeats a claim a Speaker note on the same Slide makes." and the Speaker notes intent. Voice items repeated notes on `why-it-takes-time-to-ramp-up`, `pipeline-by-the-numbers` and `sales-is-more-than-selling`. Attempt 2 cut the repeated clauses from the notes.
- Attempt 2 failed the same two lines, because the `pipeline-by-the-numbers` note header "No single typical cycle length" still restated voice item 4. It also failed the `generated.at` intent, which still held Attempt 1's time. Attempt 3 removed that note, trimmed `sales-is-more-than-selling` note 6 to premature scaling burning cash, and reset `generated.at`.
- No Spine change and no Research gap.
- Q5's limit is carried into Slide 2's notes: no study measures letters of intent or pipelines directly, so applying signaling theory to them is stated as an inference. Slide 8's 3:1, 9:1, 27:1 over 9.5 months is spoken as Han's worked example, not a benchmark.
- No library match: why-watching-cashflow-is-mission-critical--watch-your-cashflow — a four-month board of cash, cost and revenue notes filling month by month, ending on a "Bankrupt" stamp.
- No library match: how-to-start-doing-sales--pipeline-tools-in-practice — our own illustrated deal board with five stage columns, stage totals and deal cards sliding in.
- No library match: how-to-start-doing-sales--how-marketing-feeds-the-pipeline — a funnel from a wide marketing mouth into one named pipeline stage, dots flowing in.
- No library match: how-to-start-doing-sales--watch-your-cashflow-revenue-pulled-in — the same board with April's revenue note dragged by an arrow into March.
- No library match: why-building-an-effective-sales-pipeline-takes-time--pipeline-by-the-numbers — a three-segment funnel with 3:1, 9:1 and 27:1 brackets over a 2-week, 6-month and 3-month cycle bar.
- No library match: start-before-you-need-the-money--watch-your-cashflow-start-when — the quarterly board with a "Start when?" arrow from Q3 revenue back to Q1.
- Page 13, the third-party Pipedrive screenshot, is unused. Slide 4 draws its own deal board, per the Brief.
- Needs human: `stages-of-sale` note 2 says "the sources show each delay separately: finding customers, closing, invoicing, payment terms" but cites only EU Directive 2011/7/EU, which covers payment terms and acceptance, not finding customers or closing.
- Needs human: Slides 4 and 5 use the pipeline before Slide 7 defines it. This is carried over from the Brief, which Han kept.

## write-voice-script · 2026-10-15T12:55:42Z

### Inputs

- `skills/new-episode/references/write-voice-script.md`, `brief.md`, and `dossier.md` as write-dossier committed it in `76a123e`.
- `docs/profile/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md`.
- `npx mh query` on this Dossier and on the sample Dossier.

### Output

- `dossier.md`: all 49 Voice script items across the 5 Sections and 10 Slides now hold a spoken paragraph. Each keeps its number and bold beat. Only the item lines and `generated.at` changed, and a new `process:markdown-harness` `verified` entry was added.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass. Only Voice script lines changed against write-dossier's commit.
- Reviewer: pass on all rubric lines and intents.

### Notes

- Every beat became a paragraph. The Brief has no Threads, so there is no alternation to check.
- Where each actionable is spoken:
  - 1: `watch-your-cashflow`, `watch-your-cashflow-revenue-pulled-in` and `watch-your-cashflow-start-when`.
  - 2 and 3: `stages-of-sale` and the closing "Four steps" beat.
  - 4: `pipeline-tools-in-practice`, `what-is-a-sales-pipeline`, `pipeline-by-the-numbers` and "Four steps".
- The cashflow board returns three times as a callback.
- The 27:1 over 9.5 months is spoken as the worked example. A line of calibrated candour says it is not a law. No ramp-up month count is invented, because no source gives one.

## write-spec · 2026-10-15T13:15:14Z

### Inputs

- `skills/new-episode/references/write-spec.md`, `brief.md` (Style: Board), and `dossier.md` with its Voice script.
- `docs/design/design-guide.md` (the Board named style), `slide-library.md`, `design-system.md`, and the ADRs FE-002, FE-007, FE-009 and FE-011.
- `reference/source-deck/design-reference.md` and its page images, and the write-dossier entry's `No library match:` lines.
- One designer per Section, five in parallel, each given the Visual language and its Section's Slides.

### Output

- `spec/spec.html`, `status: draft`, with a `process:markdown-harness` `verified` entry. Its Style is the Brief's line. Its Visual language is board lanes under dark pills, content on sticky notes, cash, cost and revenue tints, `primary` for the one thing to look at, and calm one-shot motion. Its Episode page section, the five Sections and the ten Slides carry the Dossier's words word for word.
- 29 Options. Recommended: 1a, 2a, 3a, 4a, 5a, 6a, 7b, 8b, 9b and 10a. Slide 6 has two Options, every other Slide three.
- One shared `CashflowBoard` part in `src/components/slide-shared/cashflow-board/`, whose single interface the Visual language fixes, for Slides 1, 6 and 10.
- Committed with `Gate: draft spec-1` for Han's first review round.

### Checks

- `vitest` staging test: fail on attempt 1, pass on attempts 2 and 3.
- Reviewer: fail on attempt 2, pass on attempt 3 on all 9 rubric lines.

### Notes

- Attempt 1 failed the Spec contract with 33 arbitrary Tailwind values (`grid-cols-[...]`, `w-[16%]`, `border-y-[10px]` and others) in the mocks of Slides 2, 3, 4, 5, 6, 8 and 10. Each Section's designer rewrote them with standard utilities.
- Attempt 2 failed two lines:
  - "Every Option follows the Spec's Visual language, inside the Brief's Style." The 10a–c overlay pushed the board aside, the notes were solid colours instead of tints, and 3b coloured a cash note as revenue.
  - "Every Option's figcaption gives a one-line reason and its build cost, and its build notes name parts, tokens, props and i18n keys." The Options for Slides 7–9 gave no props, and `CashflowBoard` had three interfaces and two paths. The orchestrator fixed one interface in the Visual language, and the designers aligned to it.
- No Spine change: the Dossier kept the Brief's spine.
- Every recommended Option is a Scene or a Master slide copy. `basic-page`, `three-column` and `grid-1x3` are overruled where their slots cannot hold a board, and each Option's build notes give the reason.
- Needs human: on the Spec page each mock renders at about 326px wide in a 16:9 box that clips overflow, so the board mocks show little more than their titles. The reviewer judged them from a desktop-width copy.
- Needs human: the three Section jobs that draw `CashflowBoard` (Sections 1, 3 and 5) run in parallel, so the part's first author is whichever merges first.
- Needs human: `stages-of-sale` note 2 cites only EU Directive 2011/7/EU for delays the Directive does not cover. This is carried over from write-dossier.

## write-spec · 2026-10-15T14:04:02Z

### Inputs

- Han's round-1 verdict on the Spec: it showed text, not Slides; aim for the richness of `maintaining-markdown-for-ai`; show one Option at a time, as tabs or stacked; every mock visualizes the Slide.
- The new `skills/new-episode/assets/spec-frame.html`, `references/spec-designer.md` and rubric line 10 (fidelity at 1440px).
- The Visual language, updated with the `CashflowBoard` props `annotations?` and per-column `footer?`, and with one way every mock draws the board, taken from Option 1a.

### Output

- `spec/spec.html` in the new frame: an outline, one Slide per screen, its Options as tabs on a full-width stage, and the words and build notes under each Slide. It has a fresh `process:markdown-harness` `verified` entry.
- All 10 Slides redesigned at full fidelity: real notes, names, amounts and SVG arrows, brackets and curves on the Board style's paper material. Still 29 Options, with the same recommended set: 1a, 2a, 3a, 4a, 5a, 6a, 7b, 8b, 9b and 10a.
- Committed with `Gate: draft spec-2` for Han's second review round.

### Checks

- `vitest` staging test and `mh`: pass on attempts 4, 5 and 6.
- Reviewer:
  - fail on attempt 4 on lines 2, 3, 5 and 10;
  - fail on attempt 5 on line 10;
  - pass on attempt 6 on all 10 rubric lines.

### Notes

- Attempt 4 failed four lines:
  - "Every Option follows the Spec's Visual language" (line 2): 1a drew the board differently from 6a–b and 10a–c. The orchestrator added the one drawing to the Visual language, and the designers of Sections 1, 3 and 5 redrew to it.
  - Line 3: the figcaptions of 7a–9c gave no reason.
  - Line 5: 7a and 9a set numerals at `text-hero`, which FE-011 §3.2 reserves for `HeroTitle`.
  - Line 10: text ran past its note in 3c, 7b and 8b.
- Attempt 5 failed line 10 on 3c. The designer's preview rendered columns about 40px wider than the Spec page, so the measure has to be taken in the real page. 3c now splits its columns 3 / 5 / 4.
- In 8b, two Lead names were shortened to fit: "Hofmann" to "Hahn" and "Lindqvist" to "Lind".
- On Slide 10, the "Start when?" arrow now runs under the notes it crosses, so the Q2 cost note stays readable. Design reference page 16 covers it.
- Needs human: `--primary` is near-black, so each Slide's focal point reads by weight, size and rings, not by colour.
- Needs human: Sections 1, 3 and 5 all build on `CashflowBoard` in parallel jobs. Carried over from round 1.
- Needs human: `stages-of-sale` note 2 cites only EU Directive 2011/7/EU. Carried over from round 1.
- Needs human: Slides 4 and 5 use the pipeline before Slide 7 defines it.

## write-spec · 2026-10-16T14:07:26Z

### Inputs

- Han's round-2 feedback, `feedback/01/feedback.md`: one pick per Slide (1c, 2c, 3a, 4a, 5a, 6a, 7b, 8b, 9b, 10a), with notes on Slides 1, 2 and 10.

### Output

- `spec/spec.html` with every Slide locked: the picked Option carries `data-picked` and a checked box, and it has a fresh `process:markdown-harness` `verified` entry.
- 1c, 6a and 10a carry signed costs (`−€50,000`) and a `Cash left` footer per column; the 10a arrow reads "Start early!". 2c keeps its layout with 2a's card content.
- Euros throughout: the mocks, the Visual language and the Voice script ("A million euros"); the Dossier draft was edited to match.
- The Visual language binds the built boards to 1c's drawing; the unpicked Options stay as the round-2 record and are never built.
- Committed with `Gate: draft spec-3` for Han's third review round.

### Checks

- `vitest` staging test and `mh`: pass on attempts 7, 8 and 9.
- Reviewer:
  - fail on attempt 7 on line 2;
  - fail on attempt 8 on line 2;
  - pass on attempt 9 on 9 rubric lines, with line 9 `needs-human`.

### Notes

- Attempt 7 failed line 2 on four slips:
  - a `Cash 0$` in 1a's build notes;
  - the Visual language naming 1a, not 1c, as the board's reference;
  - footers listed as optional;
  - build notes citing the gitignored `.scratch` Visual language.
- Attempt 8 failed line 2 because the Visual language bound the unpicked Options to 1c's drawing. It is now scoped to the built boards.
- Han's "use €" note was given on Slide 1 and applied Episode-wide, the Voice script included, so the words match the boards.
- Needs human: 1c's April footer reads €950,000 beside the Bankrupt stamp. The sum is right, but it may soften "the company is gone".
- Needs human: 2a keeps `data-recommended` and its caption still argues for 2a over the pick 2c. 1a keeps `data-recommended` while 1c is picked.
- Needs human: `CashflowBoard` is shared by Sections 1, 3 and 5, whose jobs build in parallel. Carried over.
- Needs human: `stages-of-sale` note 2 cites only EU Directive 2011/7/EU. Carried over.
