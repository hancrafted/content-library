# Software ecology factory: prototype handoff

This is the final state of the throwaway prototype for the Play slide of the software-ecology Explorable, after rounds 1 to 7c. It feeds two later stages:

- the Spec's Slide 1 fragment;
- the Build stage, which re-implements the model in the repo.

The prototype is evidence for the design. Do not ship it as code.

Decisions behind it:

- grill answers Q1–Q124: `grill-03.md` to `grill-07.md`;
- feedback: `feedback-01.md` to `feedback-07.md`.

Both sets sit in `.scratch/software-ecology/prototype/` in the worktree.

## Where things are

| Path | What |
|---|---|
| `proto3/` (this folder, in the session scratchpad) | sources, build script, checks, probes |
| `proto3/src/*.js` | page and model sources, concatenated in name order |
| `proto3/src/data/*.yaml` | use-case master data, catalog, and words per locale |
| `proto3/body.html`, `proto3/style.css` | page markup and styles |
| `.scratch/software-ecology/prototype/flow.html` | the built page; served at http://127.0.0.1:4005/flow.html |
| `.scratch/software-ecology/prototype/flow-v1.html` … `flow-v7.html` | frozen snapshots of earlier rounds |
| `proto3/src-r5/`, `src-r6/`, `src-r7/` | frozen source snapshots |
| `proto3/model.mjs` | generated: the pure model as an ES module for Node |

## Build and run checks

```sh
cd proto3
node build.mjs          # writes ../…/prototype/flow.html and proto3/model.mjs
node checks7.mjs        # the suite: 140 checks, about 13 s; exit code 1 on any fail
node yamltest7.mjs      # browser: YAML export → import → export is byte-identical, and refusals (needs the server on :4005)
node perf6.mjs          # browser: frame-work p95 and idle DOM mutations (Ideal)
node perf7pile.mjs      # browser: the same with a 1,000+ job pile-up
node tour7b.mjs bug-spiral 4 shots7/x.png   # browser: drive a tour, print each step's checks, the clock and the speed restore
```

How the build works:

- `build.mjs` concatenates `src/*.js` in name order into one IIFE.
- It inlines the YAML files as `SRC` (replacing `/*SRC*/{}`), plus `style.css`, `body.html` and the Spec's `spec/play.preview/design.css`.
- It writes `model.mjs` from the pure parts only: `00-head`, `05-yaml`, `10-glyph`, `20-data`, `30-model` and `35-scenario`.

`checks7.mjs` is the only suite (Q123); `checks6r7.mjs` was retired. It has three parts:

1. **Scenario rows:** every `expect` of every preset's tour or check, run headless with the fixed seed. They are judged by the model's own `judge()`.
2. **Model checks:**
   - AI in Ideal;
   - sizing (Q93/Q108/Q121);
   - own tickets (Q110);
   - oversized-file refusal (Q115);
   - rushing in the stability check (Q114 B);
   - determinism.
3. **Model invariants carried over from round 6:**
   - fixed handoff time;
   - Ideal over 200 weeks;
   - Realistic below Ideal;
   - congestion drains after Ideal;
   - the follow-up loop stays under 1, and a file whose loop does not is refused;
   - conservation;
   - Clear starts empty;
   - AI upstream floods downstream;
   - the bottleneck shifts;
   - determinism by state hash, and separate random streams;
   - Q121: Realistic stays coping over 300 weeks × 10 seeds.

The scenario rows have the shape of a `*.test.ts`: for each (use case, preset, step, key), `expect(judge(value, test, prev)).toBe(true)`.

## Source map (`src/`)

| File | Pure? | Holds |
|---|---|---|
| `00-head.js` | yes | DOM helpers and every page-wide tunable (the constants table below) |
| `05-yaml.js` | yes | `YAML.parse` and `YAML.stringify` for the subset the exchange file uses |
| `10-glyph.js` | yes | role glyphs and icons (SVG paths) |
| `15-panels.js` | no | tire-swing cartoon panels |
| `20-data.js` | yes | `builtinBundle(id)` (data plus words per locale), `CATALOG`, `validate(doc)` (schema /5), `SCHEMA_ID`, `MECH_RANGE` |
| `30-model.js` | yes | settings `S`, `build`, `dials`, `custOf`, `solve`, `size`, `stability`, the backlog deque, `step` and `warm` (event-time engine), measures (`leadTime`, `signals`, `conservation`, `stateHash`), `presetSettings` |
| `35-scenario.js` | yes | expect vocabulary (`CUST_M`, `NODE_M`), `metric`, `judge`, `applySet`, `stepsOf`, `startSettings`, `stepsTo`, `runScenario`, `validTest`, `validKey` |
| `40-factory.js` | no | factory floor: SVG belts, canvas documents (handoff animation, landings, rack, pile-ups, document in work) |
| `45-card.js` | no | WorkCenterCard in four views (swing, role, station, dashboard), the Customer card, signs, the status line |
| `50-ui.js` | no | views grid, toolbar, Scenarios menu, Model menu, popover, compare, options, presets, frame loop, clock |
| `55-tour.js` | no | guided tour: `startTour`, `tourGo`, `tourArrived`, `tourReplay` (Back), `tourNext`, `endTour`, caption placement |
| `60-io.js` | no | exchange file: `exportDoc`/`exportYaml`, `importText` (validate, then stability for each company, then load), Upload and Download |
| `90-boot.js` | no | boot and theme; `window.__eco` exposes the model and tour for browser probes |

## Model API surface

All of these are in `model.mjs` as `ECO.*`, and in the page under `window.__eco`. `S` is the one mutable settings object; most functions default `s = S`.

| Function | Contract |
|---|---|
| `builtinBundle(id)` | `{ data, roles, words, source }` for `tire`, `gate` or `teams`, already validated. |
| `build(B, seed = 20261111)` | Builds a model `m` from a bundle: nodes, edges (spawn rules), seeded streams per node, then `size(m)`. It starts empty at t = 0. |
| `step(m)` | Advances one slice, `DTW` = 1/480 week. Jobs finish at their exact event time inside the slice. |
| `warm(m, weeks)` | Advances `weeks` worth of steps. |
| `solve(m, s, { worst, rush })` | Expected flows at settings `s`: a fixed point over 36 flow kinds per belt (quality × failure demand × times sent back × what it carries). Returns `{ F, load, jobs, rho, persons, out, own, relG, relB, fu, req, gain, converged, headroom, sat }`. `headroom = 1 / max ρ` over centers and persons. `rush` puts every center at −`RUSH_MAX` effectiveness; `worst` also lets every inspection pass bad work unread. |
| `size(m, s)` | Sets each center's capacity (Q93 plus the Q121 margin). Writes `n.muIdeal`, `n.muQ93` and `n.mu`. A person gets the sum of its centers. |
| `stability(m, s = realistic)` | Returns `{ refuse[], warn[], nominal, rush, worst }`. `refuse`: Q115 (`n.muQ93 / n.muIdeal > SIZE_MAX`), any ρ ≥ 1 at nominal Realistic, or a follow-up gain ≥ 1. `warn` (shown on Upload only, Q122): the rushing pass and the worst-case pass. |
| `metric(m, "subject.measure")` | One expect value. Subjects are `customer` or a center id; measures are listed under Scenarios below. |
| `judge(v, test, prev)` | Tests are `>x`, `<x`, `>=x`, `<=x`, a range `a–b` (en dash or hyphen), `rises` or `falls` (against `prev`). Anything else throws. |
| `runScenario(B, presetId, { seed })` | Applies the preset's settings, warms 60 weeks unless `start: clear`, then for each step: `applySet(step.set)`, step to `t0 + run` weeks, read every key, judge. Returns `[{ i, week, checks: [{ key, test, v, prev, ok }] }]`. The page tour stops on the same model step. |
| `startSettings(B, p)`, `presetSettings(B, p)`, `applySet(set, m)` | Load the settings `S` from a preset and apply a tour step's `set`. |
| `validate(doc)` | Schema /5 errors as `path: what is allowed` strings; an empty array means valid. |
| `rushOf(n)`, `dials(n, s)`, `speedOf(n, d)`, `custOf(m, s)` | Per-center rush points, effective dials, jobs a week, and the Customer at `s`. |
| `conservation(m)`, `stateHash(m)` | Invariant checks: created = consumed + waiting + on belts + in work; a deterministic hash of the state. |

### Model in one paragraph

**The network.** One Customer sends requests to role work centers. Each finished job spawns documents downstream by the file's spawn rules; the first spawn carries the request. Documents are good or bad, and a center's effectiveness is the chance its output is good.

**Rework, churn and complaints:**

- A center sends bad input back with chance `rework`; an inspection catches it 2.4× as often. Bad input that is kept takes 30 % longer (`EXTRA`).
- Under churn, kept bad input hands on `churn` times the documents.
- A bad release can bring a complaint, which is failure demand to Support. Its fix jumps the engineer's queue (Q114 A).

**Rushing.** A center with more than `RUSH_FROM` weeks of work waiting loses up to `RUSH_MAX` effectiveness points (Q114 B).

**Product company.** Roles also write their own tickets (`sources`). Their rate scales with the role's AI extra tasks.

**AI per center.** AI speeds a center up (`aiSpeed`, 1–5) and adds extra tasks per task (`aiExtra`). An AI-made document takes `aiSize` times longer to read.

**What the Customer card shows:**

- output: fulfilled requests a week relative to Ideal, decayed over `TAU_OUT`;
- satisfaction;
- lead time by Little's law;
- headroom, from the solve.

## YAML schema `software-ecology-factory/5`

There is one file per use case (`tire.yaml`, `gate.yaml`, `teams.yaml`) with words beside it (`<id>.en.yaml`, `<id>.de.yaml`). Roles come from `catalog.yaml`. The exported exchange file is one YAML holding the data keys plus `state` and `i18n`.

| Key | Shape |
|---|---|
| `schema` | `software-ecology-factory/5`; any other version is refused |
| `id`, `panels`, `layout` | `{ width, height, top }` in layout units |
| `mechanics` | strengths: `rework` 0–1 (default 0.4), `churn` 1–4 (default 1.2); `complaints` is a toggle in `state.mechanics` |
| `customer` | `{ at, rate, arrivals: steady/random, mix: {center: weight}, good: {center: p}, bad: {center: p}, releases: [center] }`; the chances in `good` must add up to less than 1 |
| `company` | `service` or `product` |
| `sources` | product company only: `[{ id, at: center, rate }]`, own tickets a week |
| `bottleneck` | the center sized to `RHO_BN` at Realistic |
| `centers[]` | `{ id, role, at: [x, y], realistic: [efficiency, effectiveness], spawns, inspection?, stampUnderPressure?, person?, service: exponential?, buffer?, dials? }`; `spawns` is `{ to, n }`, `{ to, p }` or `{ choose: [{ to, w }] }`; `dials` holds `efficiency`, `effectiveness`, `fanout`, `ai`, `aiSpeed`, `aiExtra` |
| `routes` | `"from-to": { out, in, via, xm, over }` belt geometry |
| `presets[]` | `{ id, view: swing/roles/factory, reality 0–100, ai: all/off/[ids], dials, customer, start: clear/warm, speed: 1/2/5/10, compare, tour \| check }` |
| `tour` | 1–6 steps, each `{ set?: { dials, customer, ai, reality }, run: weeks from start (increasing), card: customer \| center, expect: { "subject.measure": test } }`; a `check` is one such step |
| `state` (exchange file only) | `preset, view, reality, ai, company, aiQuality, speed, beltMotion, mechanics, customer, compare, centers` (dial overrides), `overlays` |
| `i18n` (exchange file only) | per locale: `name`, `sub`, `centers`, `belts`, `customer`, `presets`, `scenarios: { id: { watch, steps[] } }`, `roles` |

**Import** goes in this order:

1. `validate`;
2. `stability` for each company type the file supports, both when it has `sources`;
3. load.

Refusals name the path and the center. **Expect keys:**

- customer: `output`, `sat`, `headroom`, `leadDays`, `bugsPerWeek`, `own`, `backlog`;
- a center: `weeksWaiting`, `busy`, `bugShare`, `backlog`, `done`, `rework`, `rush`.

## Tuned constants

All values are illustrative, not measured.

| Constant | Value | Where | Meaning, and the decision behind it |
|---|---|---|---|
| `DTW` | 1/480 week | `00-head.js` | model step |
| `DAYS` | 5 | `00-head.js` | working days a week |
| `HANDOFF` | 0.25 day | `00-head.js` | every handoff, whatever the belt length |
| `HANDOFF_SECS` | 0.6 s | `00-head.js` | on-screen handoff at any speed |
| `SPEED_1X`, `SPEEDS` | 1/16 week per second; 0, 1, 2, 5, 10 | `00-head.js` | play speeds |
| `TOUR_SPEED` | 10 | `55-tour.js` | speed between tour steps; Close restores the user's speed (Q118) |
| `WARM_WEEKS` | 60 | `00-head.js` | warm start for presets |
| `RHO_IDEAL` | 0.7 | `00-head.js` | Ideal: centers at most 70 % busy |
| `RHO_REAL` | 0.9 | `30-model.js` | Q93 sizing at Realistic; Q115 judges a file on it |
| `RHO_BN` | 0.85 | `30-model.js` | Q121: bottleneck (or its person) at Realistic |
| `RHO_OTHER` | 0.7 | `30-model.js` | Q121: every other center at Realistic |
| `SIZE_MAX` | 1.5 | `30-model.js` | Q115: refuse when Q93 sizing exceeds 1.5× Ideal capacity |
| `RUSH_MAX`, `RUSH_FROM`, `RUSH_TO` | 15, 1, 3 | `30-model.js` | Q114 B: linear rush, 0 points at 1 week waiting to −15 at 3 weeks; effectiveness never below 5 |
| `AI_SPEED` | 2.5 | `00-head.js` | default AI speed-up (dial 1–5) |
| `aiExtra` default | 1 | `30-model.js` `dials()` | extra tasks per task with AI |
| `aiSize` | 1.2 (1 for customer, doc, billing) | `catalog.yaml` | reading time of an AI-made document |
| `CV` | 0.3 | `00-head.js` | service-time variation (normal) |
| `EXTRA` | 0.3 | `00-head.js` | kept bad input takes 30 % longer |
| `INSPECT` | 2.4 | `00-head.js` | inspection catch multiplier (rework 0.4 gives 0.96, capped at 0.95) |
| `stampUnderPressure` | 0.8 | per center in YAML | an inspection stamps more as its queue grows |
| `MECH_RANGE` | rework 0–1 (0.4), churn 1–4 (1.2) | `20-data.js` | mechanic strengths |
| `TAU`, `TAU_OUT` | 2, 6 weeks | `00-head.js` | rate decay; Customer output and satisfaction decay |
| `AMBER`, `RED` | 1, 2 weeks | `00-head.js` | weeks-waiting colours |
| `RET_SHOW`, `RET_HIDE` | 0.3, 0.1 a week | `00-head.js` | rework lane hysteresis |
| `SIGN_HOLD` | 1.5 weeks | `45-card.js` | how long a sign stays |
| `HALF`, `TOP`, `BOT`, `WX` | 110, 48, 44, 36 | `00-head.js` | station card geometry (layout units) |
| `RACK`, `RACK_W`, `RACK_PAD` | 6, 44, 5 | `00-head.js` | the rack |
| `WORK_S`, `RACK_S` | 2.8, 1.15 | `40-factory.js` | document scales in work and in the rack |
| `PILE_MAX`, `PILES` | 12; heap (default, Q117), stack, drift | `40-factory.js` | pile-up beside the rack |
| `CUST_W`, `CUST_TOP`, `CUST_BOT` | 82, 128, 128 | `00-head.js` | Customer card |
| `GAP`, `MIN_RUN`, `R`, `RET` | 13, 40, 14, −20 | `00-head.js`, `30-model.js` | belt drawing |
| `MAX_STEPS`, `MAX_TOKENS`, `MAX_SPRITES` | 40, 4000, 600 | `00-head.js` | performance caps |

Tuned values in the use-case YAML:

**Realistic dials** `[efficiency, effectiveness]`:

| Use case | Center | Value | Note |
|---|---|---|---|
| tire | Support | [90, 95] | raised from 88 so the product company passes Q115 at 1.47× |
| tire | other centers | [88, 9x] | |
| gate | lspec, lrev | [76, …] | |
| gate | e1–e3 | [94, …] | |
| teams | engB | [105, 85] | |
| teams | engA | [97, 91] | |
| teams | plat | [79, …] | |

**Preset dials:**

| Preset | Settings |
|---|---|
| bug-spiral | engineer effectiveness 65, clear start, steps at weeks 8/20/40/80 |
| fix-orders | rate 9, Support efficiency 130, analyst effectiveness 75 → 98, clear start, steps at weeks 6/20/36 |
| move-bottleneck | rate 11, Support efficiency 130 |
| ai-balanced | aiSpeed 3 at Support, engineer and QA |

## Known limits

- **The solve is a mean-flow fixed point.** It misses state-dependent feedback, such as churn growing with waiting. In simulation, Support runs 5–10 % busier than the solve says. This is why the Q121 margin exists: `RHO_BN` 0.85 and `RHO_OTHER` 0.7 were found by simulation, not derived.
- **Q115 judges the file's needs, not the line's capacity.** It uses Q93 sizing at 90 %, and the built-ins are at 1.47× or less. With the Q121 margin, the line itself has up to 1.9× Ideal capacity at Support. Han has not ruled on which ratio Q115 should bound; the 7c report raises it.
- **Ideal is no longer 70 % busy everywhere.** Centers sized up for Realistic run below 70 % in Ideal; the bottleneck runs at about 0.65–0.7.
- **The rushing warning is pessimistic.** It puts every center at full rush at once, which is why it is a warning and not a refusal.
- **The bug spiral does not collapse.** Output settles at about 70 % of Ideal and does not recover, while the lead time explodes. The tour teaches the lead time.
