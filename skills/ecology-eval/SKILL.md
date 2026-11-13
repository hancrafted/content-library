---
name: ecology-eval
description: Tune a software-ecology scenario's YAML numbers until each beat's claim holds on 8 of 10 seeds, headless with `npm run ecology:sim` and then in the browser, and report the run in .scratch/software-ecology/eval/run-NN.md. Use when ecology:sim fails a beat, a scenario in a use-case file is new or changed, or Han asks for an eval run or a run report.
---

# Ecology eval

A scenario is a tour of beats in a use-case file (`src/explorables/software-ecology/<use-case>.yml`). Each beat carries Han's **claim** (a words key under `scenarios.<id>.claims` in `<use-case>.words.yml`) and the `expect:` and `settles:` ranges that make it checkable. The eval makes every claim hold by tuning the file's numbers. The rules are design-ADR 0024 §20. The use-case file holds the ranges and the words file the claims: these two are the source, and run reports stay in `.scratch/software-ecology/eval/`.

## The contract

- **Numbers only.** Change numeric values in the use-case YAML: dials, `realistic`, `catch`, `stall`, `aiCatch` under `roles:`, `mechanics`, customer chances, `backlog`, a beat's `run` week. Leave code, the role catalog, the words and every key's shape alone.
- **Han's numbers are fixed.** A number Han names in a claim or in a settled grill item (`docs/episodes/software-ecology/prototype/grill-*.md`) stays as he named it, e.g. Clear Requirements' 75 % rising to 95 % (grill 11 Q230). Tune the numbers around it; when it blocks a beat, propose a change to it in the report, with the readings that show why.
- **Ranges are Han's claim.** An `expect:` or `settles:` range stays as written, approved or still proposed: tuning makes the model meet the range, never the range meet the model. A range that cannot hold becomes a proposal in the report, with the readings that show why.
- **Model changes escalate.** When no numbers make a beat hold, the report names the mechanic that is missing or wrong and what it would take; the model stays as it is.
- **Done** is every beat passing on 8 of 10 seeds, each beat with a claim running 6 to 9 weeks.

## 1. Read the scenario

Read the scenario's tour and its ranges in the YAML, and its claims in the English words file. For each beat, write down what the claim needs the model to show and which readings carry it.
_Done when_ every beat has its claim, its checks and the readings that move them.

## 2. Tune headless

`npm run ecology:sim -- <use-case> <scenario> --seeds 10 --json` judges every beat on ten seeds; the text form (no `--json`) is easier to scan. Per check it prints each seed's 2-week mean and, for `rises` and `falls`, the same seed's mean in the beat before.

Loop: run, find the first failing beat, change the one or two numbers that move its failing reading, run again. Fix beats in order: a later beat's `rises` reads against the beat before it, so a change upstream moves every check after it. `--seed n` replays one seed when a single outlier needs explaining. Record every change you keep, since the report carries the diff (`git diff -- <use-case>.yml`). After each kept change, run `--seeds 10` on In theory (`ideal`) and In practice (`realistic`) too: they must keep passing.

Stop when every beat passes, or when you can show that one cannot: the readings across the numbers you tried, and the model or range change it would need.
Then run `npm run test:slow -- src/explorables/software-ecology`: it plays every shipped tour frame by frame against the headless runner, which no commit check does.
_Done when_ the sim prints `PASS: every beat holds` and `test:slow` passes, or each failing beat has its evidence.

## 3. Play it in the browser

Start `npm run dev -- -p 4010` in the background and open `http://localhost:4010/explorables/software-ecology/` with the `playwright-cli` skill (`-s=eval`). Open the scenario with `toolbar.scenarios`, then `toolbar.scenario.<id>`, and step the tour with `tour.next`. At each beat's pause read the cards' `data-readout-*` attributes (`[data-readout-output]` on the Customer card, `[data-readout-weeks-waiting]` on a station) and compare them with the beat's claim. The page plays one seed, so it agrees in direction with the headless means, not to the decimal. Close the session and stop the server.
_Done when_ every beat was played and its readings noted, or the blocker is written down.

## 4. Report

Write `.scratch/software-ecology/eval/run-NN.md`, NN one past the highest run there:

1. The YAML diff.
2. Per scenario and beat: the claim, each check with its per-seed means and how many seeds held, the beat's length, and PASS or FAIL.
3. The browser result per beat.
4. Every range proposed for change: the range, the proposed one, and the readings behind it.
5. Every model change needed: the beat, the mechanic, and why numbers cannot do it.

Then stop: Han approves ranges and decides model changes.
_Done when_ the report holds all five parts for every scenario run.
