---
type: dossier
title: Where AI pushes the pressure in your team
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-10T17:09:00Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-10T17:09:00Z
---

# Where AI pushes the pressure in your team {#software-ecology}

## Play {#play}

#### Voice script

1. **You know this cartoon** — You all know this cartoon. Ten panels, and in every one a different role hears something different, so the swing that comes out is nothing like the one the customer wanted. Nobody in it is a bad actor: it is a game of telephone, where an intent nobody voiced well gets translated at every handoff, which means the fault sits in the system. With AI, the wrong swing gets built ten times faster.
2. **Now you run it** — Don't take my word for it, run it yourself. Start on the swing, step through Roles and Pipeline, then switch AI on and watch where the water goes.

### Play {#explorable}

#### Visual

master: basic-page · motion: none

The whole software ecology Explorable fills the Slide with every option on. The viewer meets it as the toolbar, the stage and the node card. The design lives in the design-ADR `docs/adr/0024-software-ecology-flow-model-and-use-case-files.md` and the feature guide `docs/features/explorables/software-ecology.md`; the Spec designers mock it from there.

The toolbar holds the step control Swing, Roles, Pipeline, AI, the use case picker and the two global dials, pump speed and water clarity.

The stage opens on the Swing step of the tire swing use case, with the ten cartoon panels. Roles morphs them into role glyphs, Pipeline into the left-to-right graph with the customer's intake on the left and the tap on the right, every role an omega pipe, every edge a handoff. AI switches the pump on: the pipes fill, the narrow review valve backs up, drops leak and fade, and sludge sticks to the walls when the water clarity is low.

A click on a node opens its card: the 2x3 grid of human and technical against specify, execute and review, the node's own AI and context-rot dials with a live readout, and the node's own enlarged omega.

At the tap, the right-hand customer shows what came out and how many: the tire swing with clear water, a wrong swing with sludge.

#### Speaker notes

1. **Pressure travels along the connections** — a change at one node, such as faster code writing, reaches its neighbours: more code to review, build, test and release. The talk offers this as a scenario, not a measurement [1] (SWE-0001).
   - sources: [1] Adam Bender, Software Engineering at the Tipping Point (conference talk, transcript) — https://www.youtube.com/watch?v=2n41YjR5QfU
   - target: the pump and the edges in the Pipeline and AI steps
2. **Review is where the load lands** — on teams with high AI adoption, pull requests merged rose 98% while review time rose 91% and pull request size 154%, with no significant company-level gain. Vendor telemetry and an association, not a trial [2] (AIE-0018).
   - sources: [2] Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025) — https://www.faros.ai/blog/ai-software-engineering
   - target: the narrow review valve backing up
3. **Review can be skipped** — in a writing experiment 68% of professionals given a chatbot submitted its first output unedited. It was a short online task, so it may not hold for work someone is accountable for [3] (AIE-0019).
   - sources: [3] Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence — https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
   - target: the leaking drops past the valve
4. **Product managers keep the accountability** — they hesitate to delegate specifications and say they are still accountable for AI-written output, so their effort moves to checking it. One company, self-reported [4] (AIE-0019).
   - sources: [4] Ulloa et al., Product Manager Practices for Delegating Work to Generative AI: "Accountability must not be delegated to non-human actors" — https://arxiv.org/abs/2510.02504
   - target: the product-side nodes
5. **Muddy instructions cost accuracy** — instructions that arrive incomplete over several turns lowered accuracy by 39% on average across tested models. That a clear requirement lowers this is an inference; no source tests it as an intervention [5] (LLM-0022).
   - sources: [5] Laban et al., LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120
   - target: the water clarity dial and the sediment on the walls
6. **Sales and billing cards are inference** — reps spend 30% of a week selling, from a vendor survey, which says nothing about review work growing. No source measures AI's effect on billing; the sales and billing card text is the general pattern applied, not evidence [6] (AIE-0019, AIE-0020).
   - sources: [6] Salesforce, State of Sales, 6th Edition — https://assets.ctfassets.net/f43wltp2j5se/2gHMpCURXzpMW7PJ3SlWZJ/3cad8d7e8496abbd3c0f99d5c7f16ef4/salesforce-state-of-sales-report-6-ed.pdf
   - target: the sales and billing node cards

#### Voice script

1. **Map your team** — Look at the graph as if it were your own team, where every node is a role and every pipe is a handoff. Find the narrowest review step, the valve, because that is where the pressure will gather first.
2. **Check the valve before the pump** — Now switch AI on at one node. The pump got stronger, but the valve after it did not, so ask whether that review step can handle more. Watch the neighbours as well as the node, because the pressure does not stay where you put the pump.
3. **Clean water first** — Now drop the water clarity. Muddy requirements leave sediment, and the pump carries that sediment to every node after it, faster than before. So write the requirement clearly enough that someone new could act on it, which is the one step that lowers the pressure instead of moving it.
4. **Hand over the verdict** — Look at the tap. Which swing came out, the one the customer wanted or a wrong one? And in your own team, which node looks like that valve?

## Why, how and what {#about}

#### Voice script

1. **Why you may leave it** — If you played it, you already have the picture, so this is the short version. One slide covers why it matters, how to use it and what it shows.

### Why, how and what {#why-how-what}

#### Visual

master: grid-1x3 · motion: none

Three columns, stacked Why-first on a phone, each with a still from the Explorable. Why: the pump pushing sludge into a swollen review valve. How: the toolbar with steps, use case picker and the two dials. What: one node's enlarged omega, specify, execute and review, with its human and technical side.

#### Speaker notes

1. **AI amplifies what is there** — AI's primary role is as an amplifier of an organization's existing strengths and weaknesses, and the greatest returns come from the underlying organizational system rather than the tools [1] (AIE-0018).
   - sources: [1] DORA, State of AI-assisted Software Development 2025 (overview page) — https://dora.dev/research/2025/dora-report/
   - target: Why column, the pump
2. **Incomplete requirements are the most named pain** — 48% of 228 companies named incomplete or hidden requirements their most frequent requirements problem, with rework after implementation among the reported effects. Self-reported survey; frequency is not cost [2] (SWE-0002).
   - sources: [2] Méndez Fernández et al., Naming the Pain in Requirements Engineering: Contemporary Problems, Causes, and Effects in Practice — https://arxiv.org/abs/1611.10288
   - target: Why column, clean water
3. **Specifying is the hard part (inference)** — deciding precisely what to build is the hardest single part of building software. That AI moves the saved effort into specifying is an inference from this and the review findings; no source measures specification effort rising [3] (AIE-0018, AIE-0020).
   - sources: [3] Brooks, No Silver Bullet: Essence and Accident in Software Engineering — https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf
   - target: What column, the specify part of the omega
4. **A node is people and technology** — a socio-technical system is a system made of people and technology, and an organization's structure shapes what it builds. The definitions are the speaker's paraphrase [4] (SWE-0001).
   - sources: [4] Adam Bender, Software Engineering at the Tipping Point (conference talk, transcript) — https://www.youtube.com/watch?v=2n41YjR5QfU
   - target: What column, human and technical side

#### Voice script

1. **Why: the problem is the system** — Unclear requirements were always expensive, and nobody in the chain was to blame for that. AI pumps execution faster, so the pressure lands in review and spreads to the neighbours. This next part is my hypothesis: the effort moves into specifying too, because that was always the hard part, and nobody has measured it yet.
2. **Clean water lowers it** — Clear requirements are the clean water. The pump moves whatever you feed it, so feed it something worth moving.
3. **How: play it** — Four steps, a few use cases and two dials, and a click on any node opens its card. Play with the dials until the valve backs up.
4. **What: one shape everywhere** — Every node specifies, executes and reviews, each on a human side and a technical side. AI speeds up the execution. Review stays narrow, so that is where the pressure builds.
5. **Take it back to Monday** — Map your team, check the review step before you speed anything up, and write the requirement for someone new. If you own that process, where will the pressure land first?

## Material left out

The Boehm and Basili figures for avoidable rework and the late-fix cost multiplier (SWE-0002 Findings 4 to 6) are contested, so no Slide rests on them. The Conway's law use case and the Startup and later use cases belong to the Explorable's design, not to a Slide. The Brief's research question 4 evidence for documentation, operations and support is partial and feeds the card cells, not the spoken argument.
