# Grill 07 (round 6 → 7), answers verbatim after each recommendation

Q92 bad release not fulfilled — ok. Q93 Support sized for Realistic load (A) — a. Q94 (A, superseded by Q100) — a. Q95 keep AI unbalanced ~0.5× — ok. Q96 readable stations — ok. Q97 fixed 0.6 s handoff on screen — "ok, i noticed the visual effect of no document getting "stuck" a bit less "dramtic' espeically on ai, unbalanced. how about we animate a "pile up" based on the queue of a station?" Q98 vertical rack — ok. Q99 QA sits out Swing — "ok, can we arrange the cards bewteen cartoon and roles so that there are less movement?"

Finding on feedback 1 (headless, tire, seed 7, 60 weeks): Ideal ships 9.58/wk; Ideal + AI all ships 4.32/wk (0.45×), eng L 236, qa L 1680. Solve ρ: eng 1.25, qa 2.51, ops 2.51. Cause: AI fan-out compounds (sales ×2, ba ×2, eng ×2, aiSize 1.2), only 2.5× speed; output is capped by demand (8/wk).
Acknowledged contradiction: Q94 A (no AI fan-out from Engineer on) vs Q95 (AI unbalanced crowding from Engineer's extra PRs); resolved by Q100.

Q100 AI = speed-up (1–5×, 2.5 default) + extra tasks per task (1× default), per work center, set by presets — "ok, what if we allow product manager, engineer and sales to allow create tickets? (makes sense that a product organization is able to determine it's roadmap internally as well, that would be a distinction worth to toggle between a pure service provider or a product company)"
Q101 Customer card: headroom "could serve n× the demand" + lead time — ok
Q102 Settings show set → effective, sliders, AI settings visible when AI on — ok
Q103 rename "Tasks handed on per task", slider 1–5 step 0.5 — ok
Q104 pile-up at the incoming belt end (A) — "ok, implement a few animation options for me to see. ideally it doesn't look identical at every station"
Q105 Swing/Roles keep factory positions, panels fill empty cells — ok
Q106 Bug spiral preset — ok
Q107 toolbar Swing, Roles, Ideal, Realistic + Scenarios ▾ with 8 scenarios, each with a check — "yes, this is the first explorable with quite some depth, as it is a simulation. hence a guide tour/tutorial on some use cases might be cool, not only for the user but also as testing scenario. ideally the tests can be performed on the simulation logic so we can skip checking it via the rendering"

Q108 Service provider / Product company toggle (PM 2/wk roadmap → ba, Sales 1/wk leads → pm, Eng 1/wk tech debt → qa; tire defaults Product company) — ok
Q109 Customer card counts customer requests and own roadmap separately, shared FIFO backlogs — ok
Q110 internal tickets scale with the role's AI extra tasks — ok
Q111 guided tour per scenario, 3–5 steps (set dials, run to week, pause, caption pointing at a card), Next/Back, Tour button — ok
Q112 each tour step carries `expect:` in the use-case YAML; headless check runs every step on the model with a fixed seed; later a *.test.ts in npm run verify — ok
Q113 tire gets all 8 scenarios with tours; gate and teams get Ideal, Realistic, Speed up one team, AI unbalanced with checks, no tours — ok

## Round 7 report → grill (Q114–Q120), all answered "ok"

Q114 Bug spiral: bug tickets jump the engineer's queue (A) and an engineer with > 1 week waiting rushes, losing up to 15 points effectiveness (B); designer checks output slides after week 20, else the tour teaches "lead time explodes" — ok
Q115 refuse a file when a center needs > 1.5× its Ideal capacity to cope with Realistic — ok
Q116 Fix the orders first teaches via rework, headroom, lead time; no demand raise — ok
Q117 default pile-up: tumbling heap — ok
Q118 tours run at 10× between steps; clock "Week n · Day d" from tour start; fix Support status overflow — ok
Q119 accept designer deviations 1–5 (no overload refusal under Q93 sizing → superseded by Q115; rack twice as wide, "+n" dropped; Fix orders output flat; Speed up one team output flat; own-roadmap releases trigger follow-ups) — ok
Q120 gate/teams tours after Tire tours are accepted — ok

## Round 7b report → grill (Q121–Q125), "yes to all"

Q121 size teams Support (and any center that tips) to cope while rushing; keep rush curve 1→3 weeks, −15 — yes
Q122 rushing warning only on Upload, not for built-in files — yes
Q123 retire checks6r7 in favour of checks7 — yes
Q124 Fix the orders first keeps rework/headroom/lead time story — yes
Q125 prototype converged: fold into Spec as Slide 1 Options, update Title/Slide 2 Options, visual-language.html, Dossier words, close draft spec-2, Gate draft spec-3; cartoon redraw stays separate — yes

## Architecture grill (Q126–Q135, /codebase-design), all "ok"

Q126 model = createFactory(useCase, settings, seed) → { step(weeks), set(settings), read(): Snapshot } — ok
Q127 solve, sizing, stability inside the model; out as Snapshot.headroom and load refusals — ok
Q128 geometry out of the model into factory-layout.pure.ts — ok
Q129 drop the FlowRenderer seam; PileStyle is the real seam (heap, lean, drift); renderer owns screen time — ok
Q130 one useFactory hook bridges model and React; canvas drawn per frame outside React; readouts at 4 Hz — ok
Q131 factory-scenario.pure.ts runs scenarios and judges expects; tour part and *.test.ts both use it — ok
Q132 use-case-file.ts is the only YAML reader; returns UseCase or refusals — ok
Q133 model stays in src/explorables/software-ecology/ until a second user — ok
Q134 no design-it-twice — ok
Q135 Q115's 1.5× measured on the file's needs (90 % sizing), before the Q121 margin — ok

Han's point of view, verbatim:
1. the node is a indidvual component with different rendering states (used as card, as station in the graph, as popover)
2. the entire simulation is build as an engine that can be tested. each scenario can be tested against the engine based on a yml. so simulation of the data model is decoupled with rendering
3. a rendering engine renders the everything
4. 60fps
Q136 one stage component, two layers (HTML/SVG cards+belts, one canvas for documents and piles) — ok
Q137 tour card shows each expect in plain words through an i18n label per metric; the YAML keeps the code form — yes
