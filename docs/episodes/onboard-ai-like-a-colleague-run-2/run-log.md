# Run log

## brief-grill · 2026-10-13T14:12:40Z

### Inputs

- Existing Brief `brief.md`, taken from tag `baseline/onboard-ai-like-a-colleague/run-1` with the `## Style` section added (commit `948e887`).
- Handoff `.scratch/onboard-ai-like-a-colleague-run-2/handoff.md`.

### Output

- `brief.md`, unchanged in its body, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 60 s

### Notes

The handoff stated the Brief was approved with `Gate: approved brief`; the branch held no such commit and the Brief had no `verified` entry. The run stops at this gate until Han runs `approve.ts` on `brief.md` and commits with `Gate: approved brief`.

## categorize-research · 2026-10-13T14:16:30Z

### Inputs

- `brief.md#research-questions`, questions 1–6.
- `GLOSSARY.md` Research categories; `docs/llm-wiki/index.md`.

### Output

- 1 → `AIE-0007__ai-as-onboarding-a-colleague`
- 2 → `AIE-0008__individual-ai-productivity-gap`
- 3 → `AIE-0009__organizational-ai-productivity-gap`
- 4 → `AIE-0010__context-and-brief-improve-ai-output`
- 5 → `AIE-0011__risks-of-unchecked-ai-output`
- 6 → `AIE-0012__ai-delegation-as-management-discipline`
- No new category; `GLOSSARY.md` unchanged.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 25 s · 41244 tokens

### Notes

The implementor observed that `docs/llm-wiki/research/AIE-0001..0006` already answer questions 1–6 one to one; the names above are reserved only if `retrieval` decides `new` or `extend`. The job's intent has no rule for an already-answered question, so it numbers past the wiki.

## customize-pipeline · 2026-10-13T14:19:30Z

### Inputs

- Template `.agents/skills/new-episode/assets/pipeline.yml` at `feat/89-new-episode` `7ac7829`.
- `brief.md`; the six folder names from `categorize-research`.

### Output

- `pipeline.yml`, `status: draft`, `template: 7ac7829`, committed with `Gate: draft pipeline`.

### Checks

- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 180 s

### Notes

Changes from the template:

- `write-research` expanded into six `write-research-<question-slug>` jobs, one per research question, each with its question as `intent` and its folder from `categorize-research`.
- `write-dossier` wants the six research jobs and reads each research file by name, plus `docs/llm-wiki/index.md`, so a reused llm-wiki file is in its reach.
- Removed the references `docs/profile/han/storytelling-guide.md`, `tone-guide.md` and `mental-model-guide.md` from `write-dossier` and `write-voice-script`: none exists yet.
- Retries, gates and models unchanged: the Brief gives no reason to change them.

## retrieval · 2026-10-13T14:24:30Z

### Inputs

- `brief.md#research-questions`, questions 1–6, and its Learning goal, Actionables, Red thread and Analogy, to judge fit.
- `docs/llm-wiki/index.md`: six entries, AIE-0001 to AIE-0006, each read in full.

### Output

- Q1: `reuse docs/llm-wiki/research/AIE-0001__ai-as-onboarding-a-colleague/research.md`
- Q2: `reuse docs/llm-wiki/research/AIE-0002__individual-ai-productivity-gap/research.md`
- Q3: `reuse docs/llm-wiki/research/AIE-0003__organizational-ai-productivity-gap/research.md`
- Q4: `reuse docs/llm-wiki/research/AIE-0004__context-and-brief-improve-ai-output/research.md`
- Q5: `reuse docs/llm-wiki/research/AIE-0005__risks-of-unchecked-ai-output/research.md`
- Q6: `reuse docs/llm-wiki/research/AIE-0006__ai-delegation-as-management-skill/research.md`

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 37 s · 77338 tokens

### Notes

Every file is fresh (`stale_after` 2027-04-13, `generated.at` 2026-10-13 by claude-code/opus-5.5) and its h1 question and Context fit the claim the Brief makes. No file carries a `verified` entry, so no human check is recorded on the corrected research. Caveats the Dossier must carry, per file:

- AIE-0001: the workshop consultant is testimony with no source; Findings 8–10 and the Anthropic, Nygard, GitHub, agents.md and memory quotes are carried over unfetched, Finding 11's quote is unverified; "amnesiac" is the Brief's word, not a source's.
- AIE-0002: the METR slowdown is disputed and marked out of date by its authors, so no "AI slows people down"; the relocation reading is inference; the BCG study used GPT-4.
- AIE-0003: "95% of pilots fail" is disputed and self-graded, its NANDA copy unverified against the MIT original; the Wharton ROI figure is self-reported; the link to complementary investment is inference.
- AIE-0004: fits only conditionally (relevant, specific, non-discoverable context, not volume); the measured studies disagree and several are preprints.
- Research gap: write-research-context-and-brief-improve-ai-output — no measured evidence for a human-written brief in non-coding knowledge work; judged a caveat, not an `extend`, because the file answers why context measurably helps.
- AIE-0005: the code-security evidence is disputed and uses 2021–22 models; the surgical checklist is not AI evidence; "definition of done" is the file's reading.
- AIE-0006: the central claim (the task, not rank, demands the discipline) is inference; the BCG 43%/17% figures are absent from the published version; the novice boost is disputed. Its h1 drops the Brief's "staff-level", cosmetic.

## write-research-ai-as-onboarding-a-colleague · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 1: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0001__ai-as-onboarding-a-colleague/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-individual-ai-productivity-gap · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 2: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0002__individual-ai-productivity-gap/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-organizational-ai-productivity-gap · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 3: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0003__organizational-ai-productivity-gap/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-context-and-brief-improve-ai-output · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 4: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0004__context-and-brief-improve-ai-output/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-risks-of-unchecked-ai-output · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 5: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0005__risks-of-unchecked-ai-output/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-research-ai-delegation-as-management-discipline · 2026-10-13T14:25:00Z

### Inputs

- `retrieval` entry of 2026-10-13T14:24:30Z, question 6: `reuse`.

### Output

- No file written; the Dossier cites `docs/llm-wiki/research/AIE-0006__ai-delegation-as-management-skill/research.md`.

### Checks

- None run: no output.

### Metrics

- orchestrator · attempt 1 · pass · 0 s

### Notes

Marked done on retrieval's `reuse`; no agent ran, so the runs CSV has no row for this job. The Metrics line exists only because the status script reads a job as done from a passing Metrics item; the template defines no other way to mark a reused question's job done.

## write-dossier · 2026-10-13T14:29:51Z

### Inputs

- `brief.md`; the six reused files `docs/llm-wiki/research/AIE-0001..0006/research.md` and the `retrieval` entry's caveats; `docs/design/` and the Slide library.
- Attempt 2: the three failed reviewer lines of attempt 1, quoted verbatim.

### Output

- `dossier.md`, `status: draft`, with a `process:markdown-harness` `verified` entry: six Sections, twelve Slides, a slugless `## Material left out`.

### Checks

- `mh check`: pass (both attempts).
- `vitest` staging test: pass (both attempts).
- Reviewer: fail on attempt 1, pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 189 s · 93909 tokens
- reviewer · attempt 1 · fail · rubric "Fail if … the file specifies styling or code." · 113 s · 96535 tokens
- implementor · attempt 2 · pass · 16 s · 96769 tokens
- reviewer · attempt 2 · pass · 39 s · 55196 tokens

### Notes

Attempt 1 failed three lines: the `#twenty-times-on-paper` Visual named "the primary colour"; the Section scripts of `#the-promise-and-the-gap` and `#you-managed-it-you-did-not-do-it` repeated their Slide's beats ("Fail if … material here serves only one of its Slides"); and `#four-disciplines-one-line-each` mapped day one onto the four disciplines, against the Brief's "Resolution: no 1:1 mapping" (rubric 2). Attempt 2 fixed all three; its reviewer judged only those lines.

- No library match: you-managed-it-you-did-not-do-it--confident-is-not-correct — a one-page plan whose claims get checked off one by one, one claim flagged unverified that sounded just as sure; nearest basic-page; a check-mark motion wanted.
- No library match: the-effort-moves-it-does-not-vanish--the-work-relocates — one effort bar drawn twice at the same total width, the "typing" segment shrinking while briefing, context, tools and checking grow; nearest basic-page; a segment-reallocation motion wanted.
- No library match: four-disciplines-one-line-each--four-ways-to-onboard-ai — four concentric rings around "the task" (prompt, context, harness, graph), the graph ring dashed and tagged newest; nearest basic-page; a rings-draw-outward motion wanted.
- Research gap: write-research-ai-delegation-as-management-discipline — the claim that the task, not rank, demands the discipline is inference in AIE-0006; the Speaker notes mark it so.
- Research gap: no research covers graph engineering; `#four-ways-to-onboard-ai` states only the Brief's own description.
- Needs human: the ending's order. The Brief lands the resolution light, "Then a teaser naming the disciplines"; the Dossier puts four research-heavy Slides between them (`#prompting-like-a-tool`, `#confident-is-not-correct`, `#the-work-relocates`, `#from-your-desk-to-your-organization`).
- Needs human: the Hook's "Open on the hype" beat and `#twenty-times-on-paper`'s "The number" beat both state the 20x promise.
- Needs human: "Bridge to the room" closing `#the-promise-and-the-gap` and "Switch to the room" opening `#day-one-with-a-capable-stranger` say the same thing back to back.
- Needs human: `#four-ways-to-onboard-ai`'s beat "Prompt and context" covers two disciplines in one item, against the Brief's "one line each"; the Visual does give one line per ring.
- Every agent ran with the inherited model; the implementor's `generated.by` reads `claude-code/sonnet-5.5`, not the session's opus, so the general-purpose subagent default may not be the orchestrator's model.
- The timestamps of the entries categorize-research, customize-pipeline, retrieval and the six write-research jobs were estimated by the orchestrator, not read from the clock, and run 1–4 minutes late; their commits' times are the truth (7bba1da 14:15:39Z, 021ae02 14:20:33Z). From this entry on, every timestamp is read with `date -u`.

## write-voice-script · 2026-10-13T14:34:48Z

### Inputs

- `dossier.md` as `write-dossier` committed it in `b7d08ca`; `brief.md`.
- Attempt 2: the three failed reviewer lines of attempt 1, quoted verbatim.

### Output

- `dossier.md`, `status: draft`, its 37 Voice script items written as spoken paragraphs (about 1,330 words, about 10 minutes), with a new `process:markdown-harness` `verified` entry; committed with `Gate: draft dossier` for Han.

### Checks

- `mh check`: pass (both attempts).
- `vitest` staging test: pass (both attempts); only Voice script items and `generated.at` changed against `b7d08ca`.
- Reviewer: fail on attempt 1, pass on attempt 2.

### Metrics

- implementor · attempt 1 · pass · 44 s · 55639 tokens
- reviewer · attempt 1 · fail · rubric "Fail if … material here serves only one of its Slides" · 141 s · 76789 tokens
- implementor · attempt 2 · pass · 12 s · 57385 tokens
- reviewer · attempt 2 · pass · 30 s · 54072 tokens

### Notes

Attempt 1 failed three lines: `#four-disciplines-one-line-each` item 1 introduced only its first Slide ("Fail if … material here serves only one of its Slides"); and the Hook announced the thought experiment before leaving the why hanging ("The Hook opens the Episode", and rubric 4 against the Brief's "Leave the 'why' hanging in the room, then switch into the thought experiment"). Attempt 2 reworded both paragraphs; its reviewer judged only those lines. Rubric lines 2 and 3 were judged n/a: `docs/profile/han/tone-guide.md` and `storytelling-guide.md` do not exist.

- Needs human: the why is asked twice, pulling against itself: `#the-promise-and-the-gap` item 2 "So why? Today I want to look at exactly that." then `#twenty-times-on-paper` "Why does it exist?" and "I am going to leave that question hanging".
- Needs human: `#the-work-relocates` says "The total does not shrink. It moves somewhere else." That is more absolute than the Learning goal's "relocates rather than removes" and sits against the measured gain on `#twenty-times-on-paper`.
- Needs human: the register uses almost no contractions ("Let us take that at face value", "I am going to", "It is not"). Is that your spoken voice?
- Needs human: the disciplines teaser promises "one line each", but harness gets three sentences and graph five ("So hold it loosely.").

## write-spec · 2026-10-13T15:05:34Z

### Inputs

- `dossier.md`, approved by Han (`5a594a1`); `brief.md`; `.archgate/adrs/FE-004-slide-architecture.md` for the seams.

### Output

- Spec issue https://github.com/hancrafted/content-library/issues/137, label `episode:onboard-ai-like-a-colleague-run-2`.
- Sub-issues #138–#143, one per Section, each `needs-triage`; #139–#143 blocked by #138 (Title slide, wiring, post-build step 8).
- Edited #137 · 2026-10-13T15:03:19Z
- Edited #138 · 2026-10-13T15:03:06Z
- Edited #139 · 2026-10-13T15:03:06Z
- Edited #140 · 2026-10-13T15:03:06Z
- Edited #141 · 2026-10-13T15:03:06Z
- Edited #142 · 2026-10-13T15:03:06Z
- Edited #143 · 2026-10-13T15:03:06Z

### Checks

- None in the pipeline.
- Reviewer: pass.

### Metrics

- implementor · attempt 1 · pass · 158 s · 75663 tokens
- reviewer · attempt 1 · pass · 99 s · 72606 tokens

### Notes

Han was away for `to-spec`'s seam confirmation; the spec records that the FE-004 Episode seams were used. The sub-issue edit times are the `date -u` read just before they were created.

- Needs human: every `dossier.md#…` link in #137–#143 404s until `episode/onboard-ai-like-a-colleague-run-2` is pushed, and GitHub does not render the Dossier's `{#id}` anchors, so a link opens the file without jumping to its heading.
- Needs human: spec issue #137 carries `ready-for-agent`, which `to-spec` applies; an agent picking issues by that label could take the parent before the designs are approved.

## write-design-spec · 2026-10-13T15:24:00Z

### Inputs

- Spec issue #137 and tickets #138–#143 from `write-spec`; `brief.md` `## Style` (Editorial); `dossier.md`; `docs/design/`; FE-002, FE-007, FE-009, FE-011; run-1 tickets #100–#103 as "not this".
- Attempt 2: the reviewer's failed lines, each sent only to its ticket's designer (#138–#142). Attempt 3: one failed line, to #142's designer.

### Output

- `## Visual language` in https://github.com/hancrafted/content-library/issues/137: Editorial; the day-one note as recurring object; one CSS entrance per Slide; `primary` once, meaning colours only for their meanings.
- A design answer for every Slide in #138–#143; every ticket still `needs-triage` for Han.
- Edited #137 · 2026-10-13T15:05:57Z
- Edited #138 · 2026-10-13T15:20:35Z
- Edited #139 · 2026-10-13T15:21:07Z
- Edited #140 · 2026-10-13T15:20:46Z
- Edited #141 · 2026-10-13T15:20:50Z
- Edited #142 · 2026-10-13T15:22:59Z
- Edited #143 · 2026-10-13T15:13:23Z

### Checks

- None in the pipeline.
- Reviewer: fail on attempts 1 and 2, pass on attempt 3.

### Metrics

- implementor · attempt 1 · pass · 120 s
- implementor · attempt 1 · pass · 179 s · 98479 tokens
- implementor · attempt 1 · pass · 504 s · 127198 tokens
- implementor · attempt 1 · pass · 262 s · 103041 tokens
- implementor · attempt 1 · pass · 396 s · 103103 tokens
- implementor · attempt 1 · pass · 237 s · 103677 tokens
- implementor · attempt 1 · pass · 263 s · 115921 tokens
- reviewer · attempt 1 · fail · rubric "The design follows the spec issue's visual language." · 311 s · 132109 tokens
- implementor · attempt 2 · pass · 17 s · 101398 tokens
- implementor · attempt 2 · pass · 59 s · 137881 tokens
- implementor · attempt 2 · pass · 27 s · 106604 tokens
- implementor · attempt 2 · pass · 30 s · 107399 tokens
- implementor · attempt 2 · pass · 47 s · 114557 tokens
- reviewer · attempt 2 · fail · rubric "every domain concept named by its GLOSSARY.md term, never an _Avoid_ word" · 77 s · 78013 tokens
- implementor · attempt 3 · pass · 16 s · 115886 tokens
- reviewer · attempt 3 · pass · 13 s · 46044 tokens

### Notes

The first implementor line is the orchestrator writing `## Visual language`; the six attempt-1 implementor lines are the designers of #138, #139, #140, #141, #142 and #143 in that order (#143 started late: the session allows five subagents at once). Attempt 2's lines are #138, #139, #140, #141, #142; attempt 3's is #142. The `#<issue> · approved as drafted|edited` lines follow once Han has relabelled the tickets.

Attempt 1 failed #139 and #142 on rubric 3: designed in parallel, they drew the day-one note themselves instead of using #140's shared `src/components/slide-shared/day-one-note.tsx`; and #138, #140, #141, #142 named Speaker note items "note", an _Avoid_ word. Attempt 2 fixed all but #142, whose "Speaker note 1" came from the orchestrator's own retry wording; attempt 3 wrote "Speaker note item".

- Needs human: German form of address is mixed: #138 uses Sie ("Ihr eigenes Ergebnis"), #140–#143 use du; #140 and #142 write "Kollegin".
- Needs human: #142 needs `DayOneNote` to gain an optional `children` slot ("Requires #140"); #139 needs it built once by whichever ticket lands first.
- Needs human: #139 draws the Sommerfest task as a poster tile, not as the day-one note, though the Visual language lists "the brief" among the note's forms.
- Needs human: #143 sets no `heading` key; its on-screen title comes from rich `statement` children, an exception to `implement-episode.md`'s separate `heading` key.
- Needs human: #143's section slide and "The twist" both read "AI can help you onboard AI", one scroll apart; keep both or retitle the h2 (which changes its anchor).
- Needs human: #141 changes "The work relocates" to scroll-driven motion and asks for the Dossier's "on entry … once" prose to be updated; its one `primary` is on "The total does not shrink", the line flagged at the Dossier gate.
- Needs human: Open for Han copy, each with a draft in its ticket: captions on #138 "Twenty times on paper", #140 three Slides, #142 two Slides; #140's day-one note and plan rows; #142's four step texts; #143's grill-me pointer line.
- Needs human: #137's Visual language says the day-one note "returns in the thought experiment"; after attempt 2 it appears in #139 "A colleague who knows the written world", #140 and #142.

## write-design-spec · 2026-10-13T16:21:59Z

### Inputs

- Han's answers in a grill at the design gate, on the open points of the previous `write-design-spec` entry.

### Output

- Decision: German addresses the viewer as "Du", capitalised, in every ticket; "Kollegen" for the colleague.
- Decision: the day-one note keeps its role as the recurring object, but is not shared up front: #139 builds it locally in "A colleague who knows the written world", `implement-episode` stops after #138 and #139 for Han's look, then #140 moves it to `slide-shared/` and #142 adds an optional `children` slot.
- Decision: the last Section's h2 becomes "It feels like a lot" `{#it-feels-like-a-lot}`, so the twist lands on "The twist"; written into `dossier.md` in `4ed43af`, with "The twist"'s overruled master (`grid-1x1` to `basic-page`).
- Decision: "The twist" uses a plain `heading` key and one entrance, no per-word motion and no `ai` colour on the heading.
- Decision: #141's one `primary` moves to "The work moves"; #139's Sommerfest task stays a poster tile; Open-for-Han draft copy stays as drafted until Han edits it.
- Edited #138 · 2026-10-13T16:15:19Z
- Edited #139 · 2026-10-13T16:15:22Z
- Edited #140 · 2026-10-13T16:15:26Z
- Edited #141 · 2026-10-13T16:15:28Z
- Edited #142 · 2026-10-13T16:15:30Z
- Edited #143 · 2026-10-13T16:16:11Z

### Checks

- `mh check` and `vitest` staging test: pass after the Dossier rewrite.

### Metrics

- implementor · attempt 3 · pass · 198 s · 106223 tokens

### Notes

The edits apply Han's gate decisions, not a reviewer failure, so they count under the job's last attempt and no reviewer ran on them. Every ticket still carries `needs-triage`: Han relabels it to approve. "Confident is not correct" and "Four ways to onboard AI" keep `master: basic-page` in the Dossier: their Scenes are built from SlideFrame and basic-page is still the nearest frame component. The Dossier's Visual prose for "The twist" (the second "AI" sliding in) and for "The work relocates" ("on entry … once") is not rewritten; the design answers govern the build.

## write-design-spec · 2026-10-13T16:27:48Z

### Inputs

- Han's approval in the orchestrator session ("i approve, remove label yourself").

### Output

- #138–#143 relabelled from `needs-triage` to `ready-for-agent` at 2026-10-13T16:27:33Z.

### Checks

- None in the pipeline.

### Metrics

- orchestrator · attempt 3 · pass · 5 s
- #138 · approved as drafted
- #139 · approved as drafted
- #140 · approved as drafted
- #141 · approved as drafted
- #142 · approved as drafted
- #143 · approved as drafted

### Notes

Han approved every design without editing a ticket body, so each ticket's last edit is marked `Edited-by: write-design-spec`. His design decisions came in the gate grill instead, and the previous entry lists them; the orchestrator applied them as agent edits. So "approved as drafted" here does not mean the drafts went through unchanged. The relabel was made by the orchestrator on Han's word, so the label history names the agent's account, not Han's action.
