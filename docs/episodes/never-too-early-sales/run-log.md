# Run log

## brief-grill · 2026-10-13T23:12:35Z

### Inputs

- `.scratch/never-too-early-sales/handoff.md`: Han's pasted Brief, preserved verbatim.
- `.agents/skills/new-episode/references/brief-grill.md` and `.agents/skills/brief-grill/SKILL.md`: accept the supplied wording and ask Han about failed lines.
- `.agents/skills/new-episode/assets/pipeline.yml`: checks, retries and fresh reviewer.
- `.agents/skills/new-episode/assets/sample-episode/brief.md` and `.agents/skills/new-episode/assets/sample-episode/run-log.md`: staging examples.
- `docs/design/design-guide.md`: Editorial is the only named style in this checkout.
- `docs/adr/0004-episode-content-is-staged-then-promoted.md`: staging and human approval.
- `npx mh query` for the Brief and run-log paths: field and heading intents.
- Han's answers in this session: Format, Style, no Threads, Slide 4, Section order, eight research questions and Open ideas.

### Output

- `docs/episodes/never-too-early-sales/brief.md`: draft, machine-verified; awaiting Han's approval.
- Integration branch decision: Han explicitly chose `sales-pipeline-episode-sol` for an isolated Sol test instead of `episode/never-too-early-sales`. Further work must stay in this worktree and must not inspect another worktree.
- Run id: `2026-10-13T22:50:35Z`.

### Checks

- `npm run check:docs`: pass on both attempts.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass on both attempts.
- Fresh reviewer, attempt 2: all seven prior failed lines pass.
- `approve.ts --by process:markdown-harness`: machine entry appended; no human approval recorded.

### Metrics

- implementor · attempt 1 · pass · 292 s
- reviewer · attempt 1 · fail · rubric "Fail if a section holds what belongs in a different one." · 180 s
- implementor · attempt 2 · pass · 805 s
- reviewer · attempt 2 · pass · 42 s

### Notes

- Attempt 1 preserved the pasted body. Shape-only changes dropped the save-as comment and set generated metadata to the current producer and run clock.
- Attempt 1 review found missing duration and style, the unsettled after-sale choice, mixed Section steps, bundled or missing research subjects, and the duplicate Analogy idea and unexplained PDF path.
- Han settled Format verbatim: "Foundations, about 20-30 minutes: presented first to a live startup-coaching cohort, then cut as a standalone YouTube Episode."
- Han settled Style verbatim: "Editorial: sober, self-explanatory Slides for a mixed audience of business and technical founders, using a consistent sticky-note/kanban motif and three-box flows."
- Han explicitly declined Threads: "No Threads".
- Han settled Slide 4: "Keep Slide 4 with its existing wording, removing only the open question".
- Han confirmed the spine: "Keep the existing Sections and order; method, timing and cashflow callbacks intentionally reinforce the same argument".
- Han accepted the eight research questions now in the Brief verbatim. Shape-only reference changes map Slide 2 to questions 4, 5, 6; Slide 7 to 2, 3; Slide 9 to 7; Slide 10 to 8.
- Han removed the duplicate recurring-board suggestion: "Remove it; the recurring board is already settled in Analogy".
- Han defined the PDF as "Reference deck for the existing slide ideas; keep the path in the original handoff only". The PDF has not been read in this job.
- Retry review judged only the previous failed lines and accepted Han's intentionally preserved spine.
- Needs human: reviewer noted uncited claims on Slides 3, 4 and 6; decide whether they are instructional opinion or need additional research.
- Needs human: third-party visual sourcing remains open on Slides 8 and 9.
- Metrics timing is approximate: the first reviewer reported about three minutes, the second reviewer was measured between observed clock readings, and implementor timing includes Han's settlement dialogue. Token counts were not supplied. CSV completion timestamps use the corresponding recorded check/review checkpoints.
- Human gate: Han edits and approves the Brief before research categorization or pipeline tailoring starts.

## categorize-research · 2026-10-13T23:15:54Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: eight questions; Han approved at `2026-10-13T23:14:25Z`, committed in `444ce96`.
- `.agents/skills/new-episode/assets/pipeline.yml#categorize-research`: category, numbering and subject-slug intent.
- `GLOSSARY.md`: existing research categories.
- `.agents/skills/domain-modeling/SKILL.md`: domain vocabulary procedure.
- Research-folder listings under this worktree's `docs/episodes/` and `docs/llm-wiki/`: no existing IDs to reserve.

### Output

- `GLOSSARY.md`: added FIN for startup finance and B2B for business-to-business pipeline sales.
- `.scratch/never-too-early-sales/research-folders.md`: ordered folder mapping, saved for resumption.
- Question 1: `FIN-0001__revenue-lags-costs-early-stage`.
- Question 2: `B2B-0001__b2b-sales-cycle-length`.
- Question 3: `B2B-0002__b2b-stage-conversion-rates`.
- Question 4: `B2B-0003__early-selling-market-insight`.
- Question 5: `B2B-0004__early-selling-customer-trust`.
- Question 6: `B2B-0005__early-selling-internal-insight`.
- Question 7: `B2B-0006__marketing-feeds-pipeline-stages`.
- Question 8: `B2B-0007__sales-pipeline-ramp-up-time`.

### Checks

- `npx mh query GLOSSARY.md`: read before editing.
- `npm run check:docs`: pass, zero violations.

### Metrics

- implementor · attempt 1 · pass · 30 s

### Notes

- FIN is new because no existing category covers cashflow, cost and revenue timing in startups.
- B2B is new because SALES governs buyers choosing a coach or consultant, not companies building their sales pipelines.
- No library match: `docs/llm-wiki/index.md` does not exist in this checkout. Retrieval must explicitly mark every question new.
- The agent reported approximately 30 seconds of tool time, not a complete wall-clock duration; token counts were not supplied.
- No research content was written. The pipeline approval gate remains ahead.

## categorize-research · 2026-10-13T23:18:53Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: approved research questions, unchanged.
- `GLOSSARY.md` and `.scratch/never-too-early-sales/research-folders.md`: initial category IDs.
- `docs/episodes/never-too-early-sales/pipeline.yml`: candidate outputs expose the reserved folder names to the staging check.
- `tests/docs/episode-staging.test.ts` and `src/lib/research-folder.pure.ts`: folder-name check and uppercase-letter category grammar.
- Failed check: each of the seven `B2B-...` paths "is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>."

### Output

- `GLOSSARY.md`: corrected B2B's category ID to BIZ without changing its meaning; FIN unchanged.
- `.scratch/never-too-early-sales/research-folders.md`: questions 2-8 now use `BIZ-0001` through `BIZ-0007` with unchanged subject slugs.
- Naming decision: pipeline research outputs and Dossier references use the corrected BIZ IDs.

### Checks

- `npm run check:docs`: pass.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass after correcting category IDs.

### Metrics

- implementor · attempt 1 · fail · rubric "B2B-0001__b2b-sales-cycle-length is no research folder name: <category>-<####>__<question-slug, 20-40 chars kebab-case>." · 0 s
- implementor · attempt 2 · pass · 67 s

### Notes

- The initial categorization passed its prescribed markdown check, but the pipeline's staging check found its invalid category IDs. This entry records that later failure against the originating categorization attempt rather than overwriting its earlier entry.
- The first failure's duration is zero because no additional implementor run occurred; attempt 2 covers the observed correction/check interval.
- Category IDs permit uppercase letters only. Correcting the names avoids changing shared code to accommodate this Episode.
- The corrected names remain reserved in the pipeline; no research content has started.

## customize-pipeline · 2026-10-13T23:19:42Z

### Inputs

- `docs/episodes/never-too-early-sales/brief.md`: approved 20-30-minute Foundations Episode, Editorial, no Threads, eleven Slides and eight research questions.
- `.scratch/never-too-early-sales/research-folders.md`: corrected FIN/BIZ mapping from categorize-research.
- `.agents/skills/new-episode/assets/pipeline.yml` and `references/customize-pipeline.md` in that skill: template and tailoring procedure.
- Template ancestor `7ac7829`: merge-base of this integration branch and the template branch; no other worktree was inspected.
- `.agents/skills/new-episode/references/retrieval.md`: explicit handling when the library index is absent.
- `.agents/skills/new-episode/references/write-design-spec.md`: visual-language and ticket-design approval gate.
- Checked optional inputs: `docs/llm-wiki/index.md` and `docs/profile/han/{storytelling-guide,tone-guide,mental-model-guide}.md` are absent.

### Output

- `docs/episodes/never-too-early-sales/pipeline.yml`: draft; awaiting Han's pipeline approval.
- Pipeline decision: eight isolated research jobs; Dossier wants all eight so blocked research leaves an explicit gap instead of stopping the Episode.
- Pipeline decision: keep the Dossier/Voice script and design-ticket human gates before implementation.

### Checks

- `npm run check:docs`: pass.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass.
- Reviewer: not configured for this gate; Han approves the per-run pipeline.

### Metrics

- implementor · attempt 1 · pass · 175 s

### Notes

- Replaced every Episode placeholder and added `template: 7ac7829` to pin the inherited template.
- Expanded research foreach into eight named jobs, with each question quoted in its intent and every output/reference named explicitly; no glob outputs remain.
- Research agents share a YAML anchor to preserve identical template settings across the eight jobs.
- Removed missing library-index references from categorization and retrieval. Retrieval explicitly records all questions new instead of silently substituting a successful lookup.
- Removed missing storytelling, tone and mental-model guides from Dossier and Voice script references. Needs human: these guides are absent, so the approved Brief and Dossier gate must carry the voice judgement.
- Added Dossier intent for the approved duration, no Threads, unchanged spine and recurring cashflow board; worked numbers must stay illustrative unless supported as measured claims, with arithmetic checked.
- Added design intent to resolve the third-party visual questions before reproduction, favoring original fictional board/funnel Scenes; kept Han's design-ticket gate.
- Retained all template retries, human gates and models: inherit for the orchestrator/writing jobs, sonnet for research implementors and open-pr, opus for categorization, reviewers, design and implementation.
- Retained isolated research worktrees, with a header documenting Han's explicit integration-branch exception: use `sales-pipeline-episode-sol` as their base and never inspect another run's worktree.
- The candidate pipeline check exposed categorize-research's invalid B2B IDs. That upstream job used its correction attempt, recorded in the preceding append-only entry; this pipeline uses the corrected BIZ names.
- Human gate: Han edits the pipeline and approves it with top-level `status: approved`, committed with `Gate: approved pipeline`. No research jobs have started.

## retrieval · 2026-10-13T23:26:08.789Z

### Inputs

- `.agents/skills/new-episode/references/retrieval.md` and `.agents/skills/new-episode/SKILL.md`: retrieval outcomes and logging procedure.
- `docs/episodes/never-too-early-sales/pipeline.yml`: Han approved in `7f96400`; all start conditions pass.
- `docs/episodes/never-too-early-sales/brief.md`: eight questions and current human approval.
- `docs/llm-wiki/index.md`: checked in this run's worktree; absent.
- `docs/episodes/never-too-early-sales/run-log.md`: governance queried before returning the entry.

### Output

- Question 1, revenue lagging early-stage costs: `new`.
- Question 2, B2B sales-cycle length: `new`.
- Question 3, stage conversion rates: `new`.
- Question 4, early selling yielding market insight: `new`.
- Question 5, early selling building customer trust: `new`.
- Question 6, early selling yielding internal insight: `new`.
- Question 7, marketing feeding pipeline stages: `new`.
- Question 8, sales-pipeline ramp-up time: `new`.

### Checks

- `npx mh query docs/episodes/never-too-early-sales/run-log.md`: intents read.
- `npm run check:docs`: pass, zero violations.
- Reviewer: not configured.

### Metrics

- implementor · attempt 1 · pass · 16.976 s

### Notes

- No library match: questions 1-8 are new because the library index is absent; no indexed candidate could be assessed for freshness or fit.
- No reuse or extend outcomes; all eight research jobs must run.
- The agent inspected only this run's worktree, wrote no files and returned this entry for the orchestrator to append.
- Token count was not reported.

## write-research-revenue-lags-costs-early-stage · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 1, and the approved `pipeline.yml` job intent.
- `run-log.md#retrieval`: new research required.
- `.agents/skills/new-episode/references/write-research.md`, its sample research file and `.agents/skills/research/SKILL.md`.
- Research draft and its linked primary sources, checked by fresh reviewers.

### Output

- `research/FIN-0001__revenue-lags-costs-early-stage/research.md`: research, no lifecycle status; committed as `7133cdc` and fast-forwarded into this integration branch.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- `npx vitest run tests/docs/episode-staging.test.ts`: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: all prior failed lines pass.

### Metrics

- implementor · attempt 1 · pass · 72 s
- reviewer · attempt 1 · fail · rubric "One sentence stating the Answer…" · 50 s
- implementor · attempt 2 · pass · 18 s
- reviewer · attempt 2 · pass · 10 s

### Notes

- Attempt 1 confused the description's revenue/cash timing, assumed supplier outflows as costs arose, compared cash balances with booked revenue and left those assumptions uncaveated. Attempt 2 separates recognition and receipts and makes timing assumptions explicit.
- Findings use IFRS, IRS and EU payment rules, not a measured startup lag. Jurisdiction and prepayment exceptions remain explicit.
- Needs human: the description omits the prepayment exception; the cashflow-cover conclusion is part of the conceptual inference.
- Han authorized all subsequent gates in this session: "i approve all subsequent gates, run until episode is implemented". Record human approval when later gate artifacts are ready; checks and fresh reviews remain required.
- Agent timings are observed tool intervals; token counts were not reported.

## write-research-b2b-sales-cycle-length · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 2, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft and its linked survey, academic and procurement sources.

### Output

- `research/BIZ-0001__b2b-sales-cycle-length/research.md`: research, no lifecycle status; committed as `3422fdb`, merged in `1aa0236`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 138 s
- reviewer · attempt 1 · fail · rubric "Fail if a finding cites no source, or gives an opinion instead of what a source shows." · 27 s
- implementor · attempt 2 · pass · 30 s
- reviewer · attempt 2 · pass · 15 s

### Notes

- Attempt 1 incorrectly made the prior-information-notice route the only EU shortening exception. Attempt 2 adds urgency and electronic submission exceptions and corrects FAR notice-versus-solicitation reference events.
- The illustrative 9.5 months is not an industry benchmark. Buyer-group evidence, public-sector rules and private-company inference remain distinct.
- Needs human: the qualifying prior-notice route has additional source conditions not reproduced in the short Finding.

## write-research-b2b-stage-conversion-rates · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 3, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft and its primary CRM documentation sources.

### Output

- `research/BIZ-0002__b2b-stage-conversion-rates/research.md`: research, no lifecycle status; committed as `592294d`, merged in `022f5b0`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 122 s
- reviewer · attempt 1 · fail · rubric "The Answer answers the h1 question." · 50 s
- implementor · attempt 2 · pass · 24 s
- reviewer · attempt 2 · pass · 27 s

### Notes

- Attempt 1's mechanism was circular and leaned on configured probabilities; its conditional-rate product ignored skipped stages. Attempt 2 adds qualification evidence and explicit same-cohort, mandatory-stage assumptions.
- No measured 27:1 benchmark is claimed. Lead qualification, deal-stage conversion and configured closing probabilities are separate quantities.
- Needs human: lead-versus-deal scope in the Answer, optional stages versus default behavior, and cumulative-reached-count conventions need careful treatment in the Dossier.
- Needs human: vendor documentation establishes stage models, not measured loss causes or universal B2B benchmarks.

## write-research-early-selling-market-insight · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 4, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft, founder essay and academic abstracts cited by its Findings.

### Output

- `research/BIZ-0003__early-selling-market-insight/research.md`: research, no lifecycle status; committed as `e5324bd`, merged in `0ae897d`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 231 s
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 87 s
- implementor · attempt 2 · pass · 103 s
- reviewer · attempt 2 · pass · 11 s

### Notes

- Attempt 1 conflated hypothetical willingness-to-pay overstatement with the direction of purchase-intention prediction errors. Attempt 2 separates the two and updates the description and actual-clock metadata.
- Consumer-study scope, practitioner testimony and small/self-selected early samples remain caveated; no numeric correction factor is applied to a prospect.
- Needs human: "the studies" should not blur the two different results, and the new-product comparison does not establish a universal superlative.

## write-research-early-selling-customer-trust · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 5, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft and linked original academic abstracts, including the continuity counter-study.

### Output

- `research/BIZ-0004__early-selling-customer-trust/research.md`: research, no lifecycle status; committed as `23147b7`, merged in `907a0ce`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 94 s
- reviewer · attempt 1 · fail · rubric "A claim the Answer takes from a disputed study names the dispute and the strongest counter-evidence." · 62 s
- implementor · attempt 2 · pass · 35 s
- reviewer · attempt 2 · pass · 16 s

### Notes

- Attempt 1 omitted the prior-history dispute and conflated trust with commitment and relationship marketing. Attempt 2 adds Poppo, Zhou and Ryu's continuity counter-evidence and narrows the Answer.
- Source access is abstracts only; association, startup extrapolation and indirect salesperson-to-firm trust effects remain explicit.
- The author removed a duplicated Caveats heading before final checks passed.
- Needs human: anticipated future interaction is not identical to purchase intention; interpretation in the Findings and asset-specific commitment wording must not become stronger spoken claims.

## write-research-early-selling-internal-insight · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 6, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft, founder essay and the original randomized-trial paper.

### Output

- `research/BIZ-0005__early-selling-internal-insight/research.md`: research, no lifecycle status; committed as `8170877`, merged in `5256f7e`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.
- Commit hooks: pass on unchanged retry after one staging-schema test timed out under concurrent hooks.

### Metrics

- implementor · attempt 1 · pass · 101 s
- reviewer · attempt 1 · fail · rubric "Fail if it hedges without saying what is known, or states something no Finding supports and the Caveats do not flag as inference." · 147 s
- implementor · attempt 2 · pass · 30 s
- reviewer · attempt 2 · pass · 29 s

### Notes

- Attempt 1 misdescribed the trial contrast, put an unsupported capacity inference in Findings and omitted unpaid-user versus paying-buyer extrapolation. Attempt 2 corrects the trial and moves inference into the Caveats.
- Overlong descriptions were shortened before final shape checks passed.
- The commit-hook timeout was environmental: the same draft and content passed after the concurrent hook batch completed, without changing test timeouts or bypassing a hook.
- Needs human: the description's plural founder wording summarizes one adviser's testimony; do not treat it as multiple measured accounts.

## write-research-marketing-feeds-pipeline-stages · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 7, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft and linked primary HubSpot/Microsoft documentation.

### Output

- `research/BIZ-0006__marketing-feeds-pipeline-stages/research.md`: research, no lifecycle status; committed as `6b4ae2b`, merged in `7b82aaf`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 54 s
- reviewer · attempt 1 · fail · rubric "One sentence stating the Answer…" · 32 s
- implementor · attempt 2 · pass · 12 s
- reviewer · attempt 2 · pass · 2 s

### Notes

- Attempt 1's description implied more leads do not yield more deals. Attempt 2 narrows it to more volume not guaranteeing closed deals.
- Vendor documents show definitions and handoffs, not measured marketing causal effects. Filtering and volume implications remain identified as inference.
- Needs human: the short description omits the Answer's dropout nuance; stage-time features may require specific vendor plans.

## write-research-sales-pipeline-ramp-up-time · 2026-10-13T23:43:25Z

### Inputs

- `brief.md`, question 8, and approved `pipeline.yml` intent.
- `run-log.md#retrieval`: new.
- `.agents/skills/new-episode/references/write-research.md`, its sample and `.agents/skills/research/SKILL.md`.
- Research draft and linked original papers, abstracts and authors' summary.

### Output

- `research/BIZ-0007__sales-pipeline-ramp-up-time/research.md`: research, no lifecycle status; committed as `07af572`, merged in `46bb110`.

### Checks

- `npm run check:docs`: pass in the job and after integration.
- Staging vitest: 15 tests pass in both trees.
- Fresh reviewer, attempt 2: pass.

### Metrics

- implementor · attempt 1 · pass · 141 s
- reviewer · attempt 1 · fail · rubric "Limits of the Findings: what the Sources do not show, and any inference the Answer makes beyond them." · 77 s
- implementor · attempt 2 · pass · 16 s
- reviewer · attempt 2 · pass · 9 s

### Notes

- Attempt 1 treated respondent tenure as a measured ramp period and asserted overlapping lags without evidence. Attempt 2 separates sample tenure, authors' framing and conceptual inference.
- There is no measured pipeline-from-zero duration. Buyer pacing, seller learning and pipeline construction are distinct mechanisms, not durations to sum.
- Needs human: the paywalled abstract could not be checked in the retry; the description has a minor grammatical omission that must not be carried into spoken prose.
- All eight research jobs passed and were integrated; no research branch blocked.

## write-dossier · 2026-10-13T23:54:26Z

### Inputs

- `brief.md` and approved `pipeline.yml`: goals, eleven-Slide spine, Editorial style, 20-30 minutes, no Threads.
- All eight `research/*/research.md` files named by the pipeline and this run's preceding research entries.
- `.agents/skills/new-episode/references/write-dossier.md` and its sample Dossier.
- `docs/design/slide-library.md`: valid masters and motions.
- Local session artifact `reference-deck-summary.md`: paraphrase of Han's supplied image-only reference deck, composition reference only.
- Fresh reviewer read the Dossier and research caveats; no human-profile guides exist in this checkout.

### Output

- `dossier.md`: draft, machine-verified, four Sections, eleven page Slides and 71 keyword beats; the Voice script job expands those beats next.
- Actionable 1: `watch-your-cashflow`, `cashflow-start-when`.
- Actionables 2 and 3: `stages-of-sale`, with prospect-list practice also on `pipeline-tools-in-practice`.
- Actionable 4: `what-is-a-sales-pipeline`, `pipeline-tools-in-practice`.
- Spine decision: every approved Section and Slide title remains verbatim and in order; no spine changes.

### Checks

- `npm run check:docs`: pass, zero violations.
- Staging vitest: 15 tests pass.
- `git diff --check`: pass.
- Source titles and URLs: all 23 citations match research frontmatter.
- Fresh reviewer: every governing intent and all four rubric lines pass.
- `approve.ts --by process:markdown-harness`: machine verification appended.

### Metrics

- implementor · attempt 1 · pass · 218 s
- reviewer · attempt 1 · pass · 139 s

### Notes

- The fictional board has $100k starting cash and $50k monthly costs: February closes at zero, March is unfunded, April's receipt is too late. A separately labeled funded continuation and an earlier-receipt case preserve the arithmetic.
- 27:1 and about 9.5 months are explicitly illustrative, not measured benchmarks.
- Original fictional board/funnel visuals replace third-party screenshots; meaning remains visible at rest.
- No library match: why-cashflow-matters--watch-your-cashflow — monthly cashflow board; nearest basic-page.
- No library match: sales-beyond-selling--sales-is-more-than-selling — qualified converging benefit notes; nearest three-column.
- No library match: how-to-start-sales--stages-of-sale — connected sales flow with prospect/contact checklists; nearest three-column.
- No library match: how-to-start-sales--stages-of-after-sale — after-sale flow with conditional return; nearest three-column.
- No library match: how-to-start-sales--cashflow-receipt-pulled-in — recurring receipt-shift board; nearest basic-page.
- No library match: why-pipeline-takes-time--what-is-a-sales-pipeline — metrics boxes plus pipeline/funnel distinction; nearest three-column.
- No library match: why-pipeline-takes-time--pipeline-by-the-numbers — fictional funnel and separate time rail; nearest basic-page.
- No library match: why-pipeline-takes-time--pipeline-tools-in-practice — fictional kanban; nearest basic-page.
- No library match: why-pipeline-takes-time--marketing-feeds-the-pipeline — original qualification/handoff flow; nearest basic-page.
- No library match: why-pipeline-takes-time--why-ramp-up-takes-time — preparation boxes with mechanism band; nearest three-column.
- No library match: why-pipeline-takes-time--cashflow-start-when — recurring board and backwards planning arrow; nearest basic-page.
- Needs human: the Slide 10 note's abstract-access wording merits checking against source-specific access, not a blanket statement about every ramp-up source.
- Needs human: vendor default-setting notes can date; keep them as sourced examples rather than timeless spoken benchmarks.
- Needs human: the opportunities portion of Slide 3 must carry its "real work" emphasis even though several beats cover lead generation.
- Needs human: repeat revenue on Slide 4 remains conditional, not a promise.
- Needs human: the Voice script writer must introduce the fictional Alder and Birch cards before referring to them, so the audio stands alone.
- All remaining gates are pre-approved by Han; independent reviews and checks continue.

## write-voice-script · 2026-10-14T00:02:57Z

### Inputs

- `brief.md`, approved `pipeline.yml` and reviewed `dossier.md`.
- Baseline commit `bc8488d`, the write-dossier output with 71 keyword beats.
- `.agents/skills/new-episode/references/write-voice-script.md`, its sample and Dossier governance intents.
- `run-log.md#write-dossier`: scope, source caveats and audio-only clarity concerns.

### Output

- `dossier.md`: draft, machine-verified, 71 fixed beats expanded into 3,911 spoken words; committed at `Gate: draft dossier` before recording Han's pre-authorized approval.
- Duration decision: 27.94 minutes at the site's English speaking rate, within the approved 20-30-minute range.
- Spine decision: no changes.

### Checks

- `npm run check:docs`: pass, zero violations.
- Staging vitest: 15 tests pass.
- Strict comparison to `bc8488d`: only the 71 paragraph lines and generated timestamp changed before verification; all headings, Visuals, notes, beat names and counts unchanged.
- `git diff --check`: pass.
- Fresh reviewer: every governing intent and all six rubric lines pass.
- Same-Slide note-claim duplication: reviewer passes application-versus-source distinctions.
- `approve.ts --by process:markdown-harness`: new machine entry appended.

### Metrics

- implementor · attempt 1 · pass · 217 s
- reviewer · attempt 1 · pass · 102 s

### Notes

- All four actionables are explicit in the audio. Alder and Birch are introduced before their names are used; opportunities carry the "real work" emphasis.
- The three cashflow callbacks and fictional funnel arithmetic agree with the Visuals. No vendor or academic dated claims are spoken.
- Needs human: the ramp-up advice on balancing new leads with current work is close to its note's prospecting trade-off; reviewer passes it as application, not repeated research.
- Needs human: the instruction not to add three standard ramp durations is close to the source-limit note; reviewer passes it as listener guidance.
- Needs human: the instruction to multiply the example's consistent path is close to the same-cohort note; the note's extra fact about real reports skipping stages is not spoken.
- Han has already approved this gate in advance. Keep the draft and approved commits separate so provenance remains explicit.

## write-spec · 2026-10-14T00:11:33Z

### Inputs

- `brief.md`, approved `dossier.md`, `pipeline.yml` and `run-log.md`.
- Dossier approval commit `18901b1`: the issues pin their content references to this baseline.
- `.agents/skills/new-episode/references/write-spec.md`, `.agents/skills/to-spec/SKILL.md` and `.agents/skills/to-tickets/SKILL.md`.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, FE-004 and applicable Episode ADRs.
- `docs/features/episode-migration.md`: upcoming registration and post-build capture procedure.

### Output

- Spec https://github.com/hancrafted/content-library/issues/153, scoped by `episode:never-too-early-sales` and `run:sales-pipeline-episode-sol`.
- Section ticket https://github.com/hancrafted/content-library/issues/154: Title, first Section/page Slide, shared Episode wiring and build captures.
- Section ticket https://github.com/hancrafted/content-library/issues/155: sales beyond selling.
- Section ticket https://github.com/hancrafted/content-library/issues/156: how to start doing sales.
- Section ticket https://github.com/hancrafted/content-library/issues/157: why the pipeline takes time.
- Native graph decision: #154 blocks #155, #156 and #157; all four are native children of #153 and remain `needs-triage`.
- Edited #153 · 2026-10-14T00:09:18Z
- Edited #153 · 2026-10-14T00:09:35Z
- Edited #154 · 2026-10-14T00:09:20Z
- Edited #155 · 2026-10-14T00:09:24Z
- Edited #156 · 2026-10-14T00:09:28Z
- Edited #157 · 2026-10-14T00:09:31Z

### Checks

- Native parent and blocker links: persisted and independently checked.
- Coverage: all eleven h3s exactly once, 71 Voice script items and 27 note keys referenced by heading/item, not pasted.
- Masters and motions: match the Dossier; Title/Section layouts have no Visual and motion none.
- Footer: every own issue body ends `Edited-by: write-spec`.
- Fresh reviewer: all five rubric lines and other applicable duties pass.

### Metrics

- implementor · attempt 1 · pass · 226.816938 s
- reviewer · attempt 1 · pass · 65 s

### Notes

- Existing Episode seams were used without a new interface: the route list, record registry, metadata registry and one container.
- The first ticket owns post-build en/de captures and `npm run test:build`; the upcoming slug is not added to the published list.
- Concurrent experiment #147 shares the Episode label and was untouched. This run uses the extra run label and explicit spec #153; no other worktree was inspected.
- Needs human: the Brief names no curated Topic or Tags, so the required metadata uses the closest existing Topic, economics, and an empty tag list; extra Topics are omitted.
- German translation remains after Promotion. The draft German route must visibly identify its provisional English content rather than hide a fallback.
- Han's blanket approval covers future gates, but the design answers must still be written and independently reviewed before labels change.

## write-design-spec · 2026-10-14T05:35:35Z

### Inputs

- Approved `brief.md`, `dossier.md`, `pipeline.yml` and preceding `run-log.md` entries.
- Own spec #153 and Section tickets #154-157, scoped by this run's label and explicit IDs.
- `.agents/skills/new-episode/references/write-design-spec.md`, GLOSSARY, FE-002, FE-007, FE-009 and FE-011.
- `docs/design/slide-library.md`, `design-guide.md`, `design-system.md` and actual frame APIs.
- Historical #100-103 design-answer excerpts: explicit reference examples of the old catalog-gap anti-pattern, not the concurrent experiment #147.
- Available `ui-ux-pro-max` guidance, including responsive card layouts and server-component defaults.

### Output

- #153: Editorial visual language, shared board identity, token palette, CSS motion and responsive Scene rules.
- #154: three design answers, including the reusable plain-props CashflowBoard/Month/Paper/Stamp parts.
- #155: two design answers for the section and qualified sales-benefits diagram.
- #156: four design answers for the section, sales/after-sale flows and earlier-receipt callback.
- #157: seven design answers for the section and pipeline, funnel, kanban, marketing, ramp-up and closing callback.
- Edited #153 · 2026-10-14T00:17:44Z
- Edited #154 · 2026-10-14T00:23:41Z
- Edited #154 · 2026-10-14T05:29:47Z
- Edited #155 · 2026-10-14T00:22:34Z
- Edited #156 · 2026-10-14T00:28:01Z
- Edited #156 · 2026-10-14T05:29:37Z
- Edited #157 · 2026-10-14T00:26:25Z
- Edited #157 · 2026-10-14T05:30:33Z
- Approval decision: Han's pre-authorization recorded by relabelling all four children `ready-for-agent` at 2026-10-14T05:35:34-35Z.

### Checks

- Initial fresh review: all six rubric lines pass on all four tickets, covering all sixteen rendered Slides.
- Targeted fresh recheck: all three concrete layout/contract inconsistencies corrected.
- Every issue body ends `Edited-by: write-design-spec`; own native parent/blocker graph retained.
- No Dossier master/motion overruled; no Visual rewrite is needed.
- Title/section layouts use motion none; page Scenes retain their nearest-frame designation and local CSS motion.

### Metrics

- implementor · attempt 1 · pass · 629 s
- reviewer · attempt 1 · pass · 276 s
- implementor · attempt 2 · pass · 74 s
- reviewer · attempt 2 · pass · 40 s
- #154 · approved as drafted
- #155 · approved as drafted
- #156 · approved as drafted
- #157 · approved as drafted

### Notes

- Initial review passed the rubric but identified concrete defects before approval: #154's column matrix contradicted its container threshold, #156 nested two checklists inside a narrow Leads column, and #157 referenced undefined month IDs/quarter bands.
- The corrective round fixes those only: 375px one column, 1100px two-by-two, 1440px beside two-by-two and closed/over four columns; stacked Leads checklists; existing board `above` slot with a local four-column quarter bracket or narrow-layout legend.
- Needs human: #157's written rendered-check list omits the 1440px over state. Implementation validation still covers it as the pipeline requires.
- Nearest basic-page/three-column designations describe allowed custom Scenes composed from SlideFrame, Title and SlideCaption. Their prose APIs contain paragraphs and must not receive block graphics; no shared master API change is needed.
- The named `ui-ux-pro-max:slides` add-on is unavailable in this CLI. Designers explicitly used the available base skill plus the repository's Episode procedure; the actual design rubric was independently checked.
- Individual first-round designer intervals were #154 227s, #155 166s, #156 497s and #157 393s, overlapping in parallel. Metrics record the orchestrator's active output window, not their sum; idle time between rounds is excluded. Token counts were unavailable.
- Approval is as drafted because Han made no unmarked body edits; the agent's own corrections remain marked and are not attributed to Han.
- Han explicitly entered `/implement-spec #153`. Its CLI registration is unavailable, but the checked-in procedure was read; the required human invocation is satisfied and that procedure governs implementation.

## implement-episode · 2026-10-14T06:54:30Z

### Inputs

- Approved `brief.md`, `dossier.md`, `pipeline.yml`, spec #153 and the latest design answers in #154-157.
- `.agents/skills/new-episode/references/implement-episode.md`, the checked-in implement-spec procedure, TDD and code-review skills.
- `AGENTS.md`, `CODING_STANDARDS.md`, GLOSSARY, applicable Archgate ADRs and Episode feature/design guides.
- Fixed review baseline `99b9e18`, the final commit before implementation.
- Existing page template, Slide kit, registries, shared parts and build-test contracts.

### Output

- `src/components/episodes/never-too-early-sales/`: complete upcoming Episode, four Sections with 1/1/3/6 page Slides, sixteen rendered Slides including Title and section slides.
- `src/components/slide-shared/cashflow-board.tsx` and its styles/tests: shared plain-props board, month, paper and stamp parts reused by the three cashflow callbacks.
- Route/record/metadata registration, honest upcoming metadata, English and explicitly provisional English German-route messages.
- Reviewed `tests/post-build/episode-text/never-too-early-sales.{en,de}.json` captures of the complete Episode.
- `visual-check.csv`: all 640 per-Slide, locale, theme, width, requested/effective drawer-state and reduced-motion observations.
- Implementation commits: foundation `994c9c2`/`7c4eb61`, benefits `625e93e`, method `df6437a` with integration merges, timing `1a1492b`/`caa4893`, and the marked integration/correction commits leading to `455fdf2`.
- Code-review decision: Standards passes after the independent anchor-contract correction; Spec has no hard failures.

### Checks

- TDD: new registry/record/rendered-Scene/shared-board contracts went red then green; no mocks, skipped tests or snapshot matchers.
- `npm run verify`: pass; 120 fast test files, 1,404 tests, 32/32 full Archgate checks, lint/boundaries, format, typecheck, knip and docs.
- `npm run build`: complete static export succeeds for both locale routes.
- `npm run test:build`: 9 files and 546 tests pass; missing/stale capture failures were observed before the reviewed refresh, never bypassed.
- Source fidelity: all 71 Voice paragraphs and 27 Speaker notes match the Dossier, with source titles/URLs preserved and citation indices normalized per note.
- Full browser matrix: `visual-check.csv`, 640 actual observations, all sixteen Slides, en/de, light/dark, 375/1100/1440px, closed/beside/over requests and 64 reduced-motion cases; zero failures.
- DOM numbers: every wrapper count is 1, every Slide has mounted descendants, minimum wrapper height is 800px, maximum Slide horizontal overflow is 0, configured insets clear, no visible Foreground escape and no loop-pause violation.
- Below xl, a requested beside layout is correctly an effective overlay; the CSV records both rather than claiming an impossible layout.
- Initial Standards review: one hard ARCH-003 finding on production-derived Upcoming anchor expectations.
- Corrective test `455fdf2`: reviewed capture IDs replace production-derived expectations; a mutated capture ID passed the old case and failed the corrected case, then original bytes were restored.
- Fresh targeted Standards recheck: zero hard issues. Published-anchor, noindex and missing-capture gates remain intact.
- Spec review: all five rubric lines pass, no missing requirement or scope creep; all 71 paragraphs, 27 notes and 31 source-title occurrences checked.
- Final code change after the 640-case probe is test-only; `src`, Next config and package manifest are unchanged from the probed `4ee251c`.

### Metrics

- implementor · attempt 1 · pass · 3582 s
- reviewer · attempt 1 · fail · rubric "DON'T assert an expected value the code under test computed." · 139 s
- implementor · attempt 2 · pass · 74 s
- reviewer · attempt 2 · pass · 13 s

### Notes

- Independent ticket worktrees delivered the tested foundation before the three sibling Sections. Native #154 stayed open for final coordination/capture ownership; the tested code prerequisite, not premature issue closure, opened the coding frontier.
- Real browser checks caught two foundation defects that equivalent-width checks missed: inherited Title glows still running while near, and a rotated mobile stamp escaping the inset. Both were fixed and passed the real 200-case intermediate matrix before final integration.
- Title glows retain their active behavior and now pause off-active; the fix is internal to the Episode Title layout, not a Landing animation or master API change.
- New German fallback tests initially compared two production renders. They now use independently written Dossier/design expectations; prior art was not treated as an ADR exception.
- One worker accidentally created unmarked merge `50a3a1f`. It was never integrated: marked fixes and capture patches were integrated through marked replacement commits, without rewriting existing history. The original worker branch remains as an unmerged audit branch.
- Citation indices restart at 1 within each note, as the renderer requires; the source and words are unchanged. Empty keyword arrays reflect the approved Dossier's lack of separate keyword text, not invented content.
- Required metadata uses economics, foundations and empty tags as documented. No video, publication date, publication anchor contract, Featured insertion or published overview link was added; both routes are noindex.
- Needs human: the German route deliberately remains a labelled English draft; authentic German content follows Promotion.
- Needs human: the fixed Context trigger and mobile navigation pill can cross tall content while scrolling, as in the existing framework. Overlay drawers intentionally cover content; no such overlay was misreported as a beside layout.
- The full matrix's app source commit is `4ee251c`; the subsequent anchor-contract fix changes only a test and preserves that app tree.
- Individual worker/merger intervals are recorded in the session ledger; Metrics use the orchestrator's observed implementation/review windows and exclude idle gaps. Token counts were unavailable.
- No spine changes, blocked implementation branch, new dependency, route/container, shared Slide schema or publication occurred.
