# Grill 11 (the eval agent), Han's answers verbatim

Opening: an eval agent that runs the simulation and tunes its parameters so that the scenarios Han presents make sense.

Q183: 2, It has two modes, one is headless and one is um using the browser. So ideally if um I'm not sure if this was implemented but the entire simulation should be possible without UI um and the agent is uh basically can perform all the tuning there so that um once it's done I can check it myself. And the browser is basically just there just to as sort of like an end-to-end testing idea. But I would say 80-90% of it should be done like using code and um running the simulation locally without UI.
Q184: 3, Plus, the current session can change code in a new work tree to make it work for the Ava agent.
Q185: The tools would basically be the um visual representation on what the AVAR agent tested or simulated. The use cases is something that we still have to define.
Q186–Q196: skipped: "Let's assume um we keep um in theory and in practice as um uh already two scenarios. And all the other scenarios that currently are existing we sort of like either archive or uh we work from the ground up, but we treat them right now not as something to be in production. And we start by defining a first uh or the first two scenarios which we want to uh play out."

Scenario 1, in Han's words: "The first scenario I think is the one that I'm gonna to use most often, which starts in the in uh from the in theory, so ideal situation. Um the intent here is if we introduce AI to engineers and they produce massive amounts of code, that creates the first bottleneck downstream at quality assurance. And quality assurance tries to cope with that. So we we are seeing increased amount of rework, uh tickets being sent back, but also that quality assurance just like let things pass through without being inspected into detail too much. And then operation allows for shipments of bugs. And that spirals into that every bug causes a um one or multiple request tickets to support. which then lands back to uh engineering and this is the I would say more closest to the bug spiral. So here a preset would be cool, but the eval agent should basically um starting from the ideal situation um um for example like first turn on AI uh for engineering and reducing the effectiveness so they produce more bugs. And then in sh so there we can see the bottleneck moving downstream until we see that quality assurance is overwhelmed. Then we also enable AI for quality assurance in some way, uh which we mimic that we offload review, for example, to AI and tr simply just trusting it, right? We're processing things faster, but um what we're uh allowing AI to decide and this also lets bugs go through because AI cannot review everything. And the pressure moves towards operations. Here it's a bit more difficult because operation under pressure just means that the CI pipeline runs too slowly and the um uh CI starts to stall, something like this. Not sure if a i but enabling ai how we can increase that I actually don't know but um assuming AI fixes things magically uh we're just suddenly shipping faster. I think that is the message."

Q197: 1, is the sim implemented using stochical methods? because this makes testing potentially difficult. the test does not need to be deterministic as the eval agents observes the states over a period of time. but overtime the result, based on parameters, should converge towards an expected range.
Q198: 2
Q199: 1
Q200: 1
Q201: 1
Q202: yes, call it `Bug Spiral with AI Accelaration
Q203: ok
Q204: 1, but beat is visible within 10-15s at 20x, i need to be able to present it
Q205: 1
Q206: 1
Q207: I need a second scenario where 95% clear requirements upstream clears bottlenecks and clogging downstream overtime, as rework and support/change request from customer reduces. The second use case ties into the use one of the use cases or uses usages of this explorable in an episode where I stipulate that good requirements was always important even before AI and especially with AI, bad requirements means shipping bad things faster. So the starting point would be to say that you generally have like the average requirement quality and it causes um rework questioning so ticket so tickets going back from engineering to analysts, um, from quality assurance back to engineers. So there's a high rework rate at the same time we're shipping a lot of um changes um of we're shipping a lot of features which causes change requests from customers to land at uh product managers and support and so this is the preset and ideally if we only increase the quality of let's call it the business analysts and the product managers, so the effectiveness there, um that and that the system dissolves over time and that uh AI um basically also accelerates here.
Q208: ok
Q209: 1
Q210: 1
Q211: 1, What is the relationship between a bad outcome shipped by sorry, like produced by engineering landing at QA? Um that it sends it back as rework. Is it currently defined in the YAML and can we make it so that we can tweak it? Like what is the current controls we have?
Q212: 1
Q213: 1
Q214: 1
(confirmed the settled list with "ok")

## Settled

1. **Eval agent** is a project skill, `skills/ecology-eval/` (Q205). Two modes (Q183): headless does 80–90 % of the tuning through `npm run ecology:sim -- <use-case> <scenario> [--seed n | --seeds n] [--json]` (Q197), printing each beat's readings and verdict; a browser pass through the `data-control` and `data-readout-*` hooks is the end-to-end check. A guided tour is the visual record of what the agent tested (Q185).
2. **What it may change** (Q184): numbers in the use-case YAML, never an `expect` range: a range change is proposed to Han. Model code changes are made by the session in a worktree.
3. **Scenarios** (Q198): In theory (Ideal) and In practice (Realistic) stay; every other existing scenario is deleted from every use-case file (git keeps them). New scenarios are written as plain-words `claim:` per beat by Han; the agent proposes each beat's `expect`, Han approves it once, and it is frozen (Q199).
4. **Judging a stochastic run** (Q197, Q208): the model stays seeded and stochastic. A reading is the mean over a beat's last 2 weeks; a beat passes when at least 8 of 10 seeds pass; `rises`/`falls` compare those means beat to beat.
5. **Beat length** (Q204, Q209): each beat visible in 10–15 s at 20× (6–9 simulated weeks). A beat on screen claims a direction (`rises`, `falls`, a pile moving); a `settles:` range is checked headless only, running the beat's settings 40 weeks more. Done when every beat passes on 8 of 10 seeds within that length.
6. **Model additions** (Q200, Q201, Q210, Q213, Q214): a per-station `catch:` by defect kind (`spec`, `code`), overriding `mechanics.rework`; defect origin carried by each document (first cause only), a spec defect returning from the Customer as a change request to the Product manager and a code defect as a bug to Support; Engineering catches spec defects (back to Analysis), quality assurance catches only code defects; `roles.<id>.aiCatch` multiplies `catch` with AI on; a per-station `stall:` (speed drops as its backlog fills), removed by AI there; today's constants into `mechanics` (`inspect`, `redo`, `keepExtra`, `maxBounces`, `pressure`), defaulting to today's values.
7. **Scenario 1, "Bug Spiral with AI Acceleration"** (Q202, Q203), from In theory: clean line; AI at Engineering at about 70 % effectiveness; quality assurance overwhelmed, passing work unread; AI at quality assurance, trusted; Operations stalls; AI at Operations, output at or above demand with satisfaction under 0.6 and bugs a week rising.
8. **Scenario 2, "Clear Requirements, Then AI"** (Q207, Q211, Q212), from In practice with Analysis and Product manager at 75 %: high rework, change requests and bugs; AI at Engineering and quality assurance ships bad things faster; Analysis and Product manager to 95 %, rework falls, then the piles drain; AI everywhere, output and headroom rise while satisfaction holds.
9. **Reports** in `.scratch/software-ecology/eval/run-NN.md` (Q206).
