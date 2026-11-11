---
type: dossier
title: Where AI pushes the pressure in your team
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-10T17:15:56Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-10T17:09:00Z
  - by: process:markdown-harness
    at: 2026-11-10T17:15:56Z
---

# Where AI pushes the pressure in your team {#software-ecology}

## Play {#play}

#### Voice script

1. **You know this cartoon** — You all know this cartoon. Ten panels, and in every one a different role hears something different, so the swing that comes out is nothing like the one the customer wanted. Nobody in it is a bad actor: it is a game of telephone, where an intent nobody voiced well gets translated at every handoff, which means the fault sits in the system. With AI, the wrong swing gets built ten times faster.
2. **The factory runs live** — This one runs live, so nothing here rests on my word. It starts on the swing, steps through Roles into the factory, and then AI goes on. Every document on the belts is a task, the requests come from the Customer on the left, and the releases go back to the Customer. Watch what the Customer gets.

### Play {#explorable}

#### Visual

master: basic-page · motion: none

The whole software ecology Explorable fills the Slide with every option on. The viewer meets it as the toolbar, the stage and the work center dashboard. The design lives in the design-ADR `docs/adr/0024-software-ecology-flow-model-and-use-case-files.md` and the feature guide `docs/features/explorables/software-ecology.md`; the Spec designers mock it from there.

The toolbar holds Swing, Roles, Ideal and Realistic, a Scenarios menu with a guided tour per scenario, the use case picker, speed, Clear, the day clock and a Model popover.

The stage opens on the Swing view of the tire swing use case: the cartoon panels, each at its work center's place. Roles adds the role glyphs and artefacts, and the factory fades the belts in: the Customer on the left, seven work centers in a grid, conveyor belts carrying document icons, every handoff the same short time. Each work center holds its waiting work in a rack; past six, work piles up at the end of its belt. In Realistic, efficiency and effectiveness drop, bad work comes back as rework, and inspections pass bad work unread under pressure. AI speeds a work center up, and at one work center alone it floods the next.

A click on a work center opens its dashboard: a traffic light, trend charts of output, outcome and backlog, the AI toggle, Settings sliders showing set and effective values, and a "How it flows" section in plain words.

The Customer card shows what came back: the last twelve releases good or bad, the satisfaction rate, output against ideal, lead time and how much more demand the factory could serve.

#### Speaker notes

1. **Pressure travels along the connections** — a change at one work center, such as faster code writing, reaches its neighbours: more code to review, build, test and release. The talk offers this as a scenario, not a measurement [1] (SWE-0001).
   - sources: [1] Adam Bender, Software Engineering at the Tipping Point (conference talk, transcript) — https://www.youtube.com/watch?v=2n41YjR5QfU
   - target: the belts in the Speed up one team and AI unbalanced scenarios
2. **Review is where the load lands** — on teams with high AI adoption, pull requests merged rose 98% while review time rose 91% and pull request size 154%, with no significant company-level gain. Vendor telemetry and an association, not a trial [2] (AIE-0018).
   - sources: [2] Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025) — https://www.faros.ai/blog/ai-software-engineering
   - target: quality assurance's rack filling and its pile-up
3. **Review can be skipped** — in a writing experiment 68% of professionals given a chatbot submitted its first output unedited. It was a short online task, so it may not hold for work someone is accountable for [3] (AIE-0019).
   - sources: [3] Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence — https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
   - target: an inspection passing bad work unread under pressure
4. **Product managers keep the accountability** — they hesitate to delegate specifications and say they are still accountable for AI-written output, so their effort moves to checking it. One company, self-reported [4] (AIE-0019).
   - sources: [4] Ulloa et al., Product Manager Practices for Delegating Work to Generative AI: "Accountability must not be delegated to non-human actors" — https://arxiv.org/abs/2510.02504
   - target: the product manager and analyst work centers
5. **Muddy instructions cost accuracy** — instructions that arrive incomplete over several turns lowered accuracy by 39% on average across tested models. That a clear requirement lowers this is an inference; no source tests it as an intervention [5] (LLM-0022).
   - sources: [5] Laban et al., LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120
   - target: the effectiveness dial and the Fix the orders first scenario
6. **Sales and billing cards are inference** — reps spend 30% of a week selling, from a vendor survey, which says nothing about review work growing. No source measures AI's effect on billing; the sales and billing card text is the general pattern applied, not evidence [6] (AIE-0019, AIE-0020).
   - sources: [6] Salesforce, State of Sales, 6th Edition — https://assets.ctfassets.net/f43wltp2j5se/2gHMpCURXzpMW7PJ3SlWZJ/3cad8d7e8496abbd3c0f99d5c7f16ef4/salesforce-state-of-sales-report-6-ed.pdf
   - target: the sales work center's dashboard and the Billing panel

#### Voice script

1. **Map your team** — Look at the factory as if it were your own team, where every work center is a role and every belt is a handoff. Find the slowest review step, the inspection, because that is where the work will pile up first.
2. **Check the inspection before the turbo** — Now switch AI on at one work center. It got faster, but the inspection after it did not, so ask whether that review step can handle more. Watch the neighbours as well as the work center. My picture is that the pressure does not stay where you put the AI.
3. **Fix the orders first** — Now drop the analyst's effectiveness. Unclear requirements turn into bad work, and AI carries that bad work to every work center after it, faster than before, until it comes back as rework and complaints. So write the requirement clearly enough that someone new could act on it. This is my hypothesis: that is the step that lowers the pressure instead of moving it.
4. **What the Customer got** — The Customer card is where the releases come back: what they got, and how satisfied they are. In most teams one work center looks like that inspection. To recap: map the team, check the inspection before the turbo, write the requirement clearly. It is a way of looking and still early, not a measurement of your team. The Explorable is here whenever you want to run it again.

## Why, how and what {#about}

#### Voice script

1. **Why you may leave it** — If you played it, you already have the picture, so this is the short version. One slide covers why it matters, how to use it and what it shows.

### Why, how and what {#why-how-what}

#### Visual

master: grid-1x3 · motion: none

Three columns, stacked Why-first on a phone, each with a still from the Explorable. Why: AI at the engineer only, quality assurance's work piling up while the Customer gets less. How: the toolbar with Ideal, Realistic, the Scenarios menu and the guided tour. What: one work center's dashboard, efficiency as output and effectiveness as outcome, with what AI does there.

#### Speaker notes

1. **AI amplifies what is there** — AI's primary role is as an amplifier of an organization's existing strengths and weaknesses, and the greatest returns come from the underlying organizational system rather than the tools [1] (AIE-0018).
   - sources: [1] DORA, State of AI-assisted Software Development 2025 (overview page) — https://dora.dev/research/2025/dora-report/
   - target: Why column, AI at one work center
2. **Incomplete requirements are the most named pain** — 48% of 228 companies named incomplete or hidden requirements their most frequent requirements problem, with rework after implementation among the reported effects. Self-reported survey; frequency is not cost [2] (SWE-0002).
   - sources: [2] Méndez Fernández et al., Naming the Pain in Requirements Engineering: Contemporary Problems, Causes, and Effects in Practice — https://arxiv.org/abs/1611.10288
   - target: Why column, rework flowing back
3. **Specifying is the hard part (inference)** — deciding precisely what to build is the hardest single part of building software. That AI moves the saved effort into specifying is an inference from this and the review findings; no source measures specification effort rising [3] (AIE-0018, AIE-0020).
   - sources: [3] Brooks, No Silver Bullet: Essence and Accident in Software Engineering — https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf
   - target: What column, the analyst's effectiveness
4. **A work center is people and technology** — a socio-technical system is a system made of people and technology, and an organization's structure shapes what it builds. The definitions are the speaker's paraphrase [4] (SWE-0001).
   - sources: [4] Adam Bender, Software Engineering at the Tipping Point (conference talk, transcript) — https://www.youtube.com/watch?v=2n41YjR5QfU
   - target: What column, the work center's people and tools

#### Voice script

1. **Why: the problem is the system** — Unclear requirements were always expensive, and nobody in the chain was to blame for that. AI speeds execution up, so the work piles up at review, and my picture is that it spreads to the neighbours. This next part is my hypothesis: the effort moves into specifying too, because that was always the hard part, and nobody has measured it yet.
2. **Clear orders lower it** — Clear requirements are good orders for the factory. AI moves whatever you feed it, faster, so feed it something worth moving.
3. **How: play it** — It starts in Ideal, then Realistic, and every scenario has a guided tour that sets the dials and runs to the week that matters; a click on any work center opens its dashboard.
4. **What: two dials everywhere** — Every work center has efficiency, how much it puts out, and effectiveness, how much of it is good. AI raises the first and leaves the second alone. Review stays as fast as it was, so that is where the pressure builds.
5. **Take it back to Monday** — Map your team, check the review step before you speed anything up, and write the requirement for someone new. Whoever owns that process knows where the pressure lands first.

## Material left out

The Boehm and Basili figures for avoidable rework and the late-fix cost multiplier (SWE-0002 Findings 4 to 6) are contested, so no Slide rests on them. The Conway's law use case and the Startup and later use cases belong to the Explorable's design, not to a Slide. The Brief's research question 4 evidence for documentation, operations and support is partial and feeds the card cells, not the spoken argument.
