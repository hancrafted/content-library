# Handoff: Slide decisions for "What lies below the waterline of sustainable AI skills"

Companion to the revised Brief (`docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/brief.md`, generated 2026-11-12T14:40:48Z). The Brief holds the goals and spine; this file holds the per-Slide decisions from the voice grill, with the reasons, so the Dossier and Spec stages don't reopen them. Every decision below was confirmed by Han unless tagged _agent-decided_.

## Episode-wide design

### Style: Iceberg, research-ship control room, low poly

- **Zones**, one per Section group, light fading from white sky to full dark:
  | Zone     | Sections                               | Slides |
  | -------- | -------------------------------------- | ------ |
  | Surface  | A thought experiment · What a skill is | 1–7    |
  | Sunlit   | When to write one · The label          | 8–13   |
  | Twilight | What goes inside · What stays beside   | 14–19  |
  | Midnight | Sharing it                             | 20–22  |
  | Abyss    | Keeping it alive                       | 23–26  |
- **Zone colours** are tokens behind CSS variables in a reusable Iceberg token set; each Slide only names its zone. Han wants to tune them after seeing them render.
- **Depth ruler**: one tile per Section, plain label with the ocean term beneath. Section slides show the whole ruler and sink with a rising-bubbles transition while the Section's tile lights up. Page Slides carry a slim rail on the left edge with that tile lit.
- **Depth marker**: the unmanned diving robot on its cable marks the depth on the ruler. Why: one world, so the frame and the analogy don't compete.
- **Artwork: low poly** for everything (ship, robot, captain, pilot, iceberg). Flat 2D side view, solid fills, no shadows; depth shows only through background light. Write into this Brief's Style; promote to the design guide only after Han sees it rendered.
- **No detailed faces or hands.** Objects carry the motion: cards slide on their own, highlights land on lines. Why: faces and hands are hard to draw well, which is also why low poly was chosen.
- **Motion**: one emphasis motion per Slide, nothing loops at rest; under reduced motion everything shows in its final state.
- **Colour**: `primary` marks the one thing to look at. Meaning colours only for their meaning. _agent-decided:_ pilot `ai`, captain `human`, robot and ship machinery `machine`.
- **At rest**: every Slide states its claim without the voice; the caption is the claim.

### Analogy rules

- You are the captain; the AI is your pilot of ten years, with a settled condition: no new memories overnight, all piloting skill kept.
  - Why settled, not an injury: avoids "why isn't he in the infirmary?"; ten years adds warmth.
- The pilot sits beside you in the control room and steers the robot by cable. Why: present to teach and manage, and the screen still limits what he sees.
- Pilot schools as AI providers appear only on Slide 24. Why: revealed early, it dehumanises the opener.
- Humour sits in the situation, never at the pilot's expense.
- Rejected worlds: packing station with an agency temp (the previous Brief), crewed submarine (Titan echo), pleasure cruise, military vessel, galley and cook, a storm injury.

### Two views

- Default: chat-app words (personal instructions, project instructions, connector, skill).
- Coding-agent view, switched per Slide: Slides 3, 6, 7, 10, 11, 16, 17 (`~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md`, `references/`, `assets/`, `scripts/`, slash commands, MCP, `CONTEXT.md`).

### Grounding line

- "What works for people also works for AI" sits on the Sunlit section slide, where the borrowed principles from engineering, UX and information architecture begin.
- Voice script: a strong rule of thumb, because models learnt from human writing, not a law. Research question 6.

### Callouts

- Principles from established sources appear as small callouts, never as the Slide's main claim. Where the link to skills has no citation, the callout only names the parallel ("Did you know? …"). Why: draws the similarity without building on an unsourced claim.

## Slides

### Surface · A thought experiment

**1. A pilot who forgets every morning**

- Caption: "Every conversation with AI starts from zero on how you work."
- Content: carries the Hook. Your best pilot forgets overnight, so you explain the sediment sample every day. What would you do? The Hook line, "You've explained this to the AI a hundred times. It has heard it once.", lands here in the Voice script.
- Design: a comic strip.
  - Panel 1: a framed photo on the control-room wall, the two of you across ten years of expeditions.
  - Panels 2–4: three mornings. Each day his speech bubble says "Nice to meet you"; you explain the sediment sample again; the robot sits idle on deck.
  - End: "What would you do?" beside an empty procedure card.
- Motion: _agent-decided:_ panels appear one after another.
- Workshop: the Voice script asks the audience to answer in the chat; the Slide keeps only the question and the card, so it works on YouTube.
- Decisions:
  - No longer a copy of the onboarding pool Slide, no role switch. Why: removes the freelancer echo, so it stands alone.
  - The photo panel replaces a storm panel. Why: the condition is settled, and the photo carries warmth.
  - Speech bubble replaces a handshake. Why: no hands.

**2. The dive manual**

- Caption: "A skill hands the AI your proven procedure on demand."
- Content: the answer to "What would you do?": write it down. Sets the three things the Episode returns to.
- Design: one wide view of the control room: pilot at the console, manual open at its index, expedition brief on the wall, robot on its cable through the window. Callouts name only index entry, procedure card, expedition brief.
- Motion: one card slides out of the manual on its own.
- Decision: Han expects a new kind of visual here; the Spec should offer Options (comic, cutaway illustration).

### Surface · What a skill is

**3. A skill is a procedure card**

- Caption: "A skill is a written procedure with a name and a note on when to use it."
- Design: one card in a clear sleeve; front holds the title and "use when" line, back the numbered steps; tucked in: a species guide, a sample label, an arm preset.
- Coding-agent view: the card beside its folder, each part linked to `SKILL.md`, `references/`, `assets/`, `scripts/`.
- Research: 2.

**4. Three levels of loading**

- Caption: "The AI reads only the index until a task needs more."
- Design: the manual in three steps, each with a plain factual label:
  1. Always loaded: every skill's name and description.
  2. Loaded when the skill is used: its main instructions.
  3. Loaded only if needed: references, templates, scripts. A script can run without its code entering the conversation.
- Motion: a soft light moves across the three steps in loading order.
- Decision: plain labels beside the metaphor. Why: Han wants mechanics stated as they are, even deep in the analogy. Invocation is not a level; it's Slide 7.
- Research: 2.

**5. Skills are dynamic context**

- Caption: "What's always loaded is static; a skill loads on demand, so it is dynamic."
- Design: the context window Explorable with a Preset in scene words.
  - Static: standing orders, expedition brief, the manual's index.
  - Dynamic, filling during the dive: the pulled card, camera frames, sonar readings, sample logs.
  - Plain labels: personal instructions, project instructions, skill index, skill body, tool results.
- Motion: the dynamic part filling as the dive goes on.
- Decision: a skill is dynamic whether called at the start or picked mid-task.
  - Basis: Google, "The New SDLC With Vibe Coding" (May 2026): static is always loaded (system instructions, rule files, global memory, persona); dynamic is loaded on demand (skill instructions, tool results, retrieved documents, session history); skills are "the most powerful pattern for managing dynamic context". The Agent Skills paper: skill metadata loads at startup. A skill called by slash command arrives in a message, so it's dynamic.
  - Follow-up: the previous Episode's Slide 9 lists the first prompt as static and must be aligned (Open ideas).
- Merged from the old "Why this is context management" Slide.
- Research: 2.

**6. Instructions, skills and connectors**

- Caption: "Instructions are always loaded, skills load on demand, and connectors reach into other systems."
- Design: four things in the control room, each with a plain label and a static or dynamic tag linking to Slide 5:
  - standing orders in your notebook (personal instructions, travel to any ship)
  - expedition brief on the wall (project instructions)
  - the manual at the console (skills)
  - the cable to the sonar and the lab database (connector)
- Coding-agent view: `~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md`, an MCP server.
- Decision: the connector stays so Han can judge it rendered. Why it's there: chat apps show connectors beside skills, and the Agent Skills paper separates know-how (skill) from reach (connector). Fallback: drop to three.
- Research: 2.

**7. Two ways to call a skill**

- Caption: "You call a skill by name, or the AI picks it from its description."
- Design: the control room split in two. Left: you name the card, "Sediment sample, please." Right: the pilot scans the index and pulls the card when the dive needs it. Under the right half: Vercel's tests left skills unused 56% of the time.
- Coding-agent view: a typed slash command left, a description match right.
- Motion: a highlight lands on one index line (replaces a finger: no hands).
- Research: 2, 3.

### Sunlit · When to write one

Section slide carries "What works for people also works for AI".

**8. The third time is the signal**

- Caption: "The third time, and you know what a good result looks like, is the signal."
- Content: the first time teaches you what's needed, the second refines it, by the third you know what a good result looks like.
- Design: callback to Slide 1's comic in three panels: explain, refine, write the card. Small closing callout: "Did you know? This matches the rule of three from Fowler's Refactoring", a software engineering rule against generalising too early.
- Motion: Slide 1's empty card filling with steps.
- Decisions:
  - Han's three-step wording leads; Fowler only as a light callout. Why: practitioner guides use the third-time rule, but none cites refactoring.
  - The rule of three guards against premature abstraction, not premature optimisation (that's Knuth, Slide 9).
  - Basis: Hermes docs, TRAE, OpenHands, Zentor; repetition alone isn't enough, you also need to know how to check the result.
- Research: 1.

**9. Not every repeat deserves a card**

- Caption: "A card written too early locks in a procedure nobody has proven."
- Design: a manual stuffed with thin cards, several stamped "never tested". Beside it, a three-question check: does it repeat, does it have rules, does a mistake cost something? Callout: YAGNI and Knuth on premature optimisation.
- Motion: the index growing line by line until it runs off the page, the one entry you need buried in the middle.
- Decision: motion changed from a finger slowing down. Why: no hands.
- Research: 1.

**10. Write it from a good run**

- Caption: "Turn a run that worked into a skill: from your own notes, or by asking the AI to write it up."
- Design: two paths into one card.
  - Left: your logbook pages from earlier dives.
  - Right: today's dive went well, so before evening the pilot interviews you about it (why that depth, why that order, what would have counted as failure), then writes the card while he still knows.
  - Callout: "The AI interview from the last Episode works here too."
- Coding-agent view: asking the agent to turn this conversation into a skill.
- Motion: both sources folding into one card.
- Decision: the interview captures intent, not only steps; phrased so it stands alone without the previous Episode.
- Research: 2.

### Sunlit · The label

**11. The index is all the AI sees**

- Caption: "At the start the AI sees only each skill's name and description, so the label must promise what's inside."
- Design: the manual from the pilot's view, index readable, cards behind it closed and greyed. Two entries: vague "Samples", clear "Take a sediment sample at a new site". Callout: information scent from Xerox PARC.
- Coding-agent view: the name and description lines of a `SKILL.md`.
- Motion: the clear entry lights up as the dive's task appears.
- Research: 1.

**12. Name the moment, not the content**

- Caption: "Describe when to use a skill, in the words someone would actually say."
- Design: two index lines for the same card.
  - Content label: "Sediment sampling procedure, steps 1 to 9".
  - Moment label in two halves: "Use when we reach a new site and need a sample from the seabed. Not for water samples or filming."
  - Above them, your request on the day: "Grab some mud here before we move on." Only the moment label matches.
- Motion: a line drawn from your request to the moment label.
- Decision: "not for" is a recommendation, not an anti-pattern. Basis: the Agent Skills paper says the description should "explicitly state what it is not for"; its cheat sheet adds "include when NOT to use to prevent over-triggering"; evals use three positive and three negative trigger tests.
- Research: 2.

**13. More cards, harder choice**

- Caption: "The more skills look alike, the less often the right one gets picked."
- Design: an index crowded with near-twins ("Sample", "Take sample", "Seabed sample v2"), a question mark over the console. The expedition brief on the wall carries a short list: "On this expedition, use these three cards."
- Callout: Hick's law, said honestly as a finding about people, beside Vercel's test where a short index in `AGENTS.md` beat skills left to be found.
- Motion: the twins fade back; one line on the wall list lights up.
- Research: 1, 3.

### Twilight · What goes inside

**14. What goes where is information architecture**

- Caption: "Where you put each piece of knowledge decides how well, how widely and how cheaply a skill works."
- Content: every piece of knowledge needs a home; choosing it is information architecture, the craft of organising information so it can be found.
- Design: one piece of knowledge, today's site depth, with two homes and their plain costs: inside the card, "always there, fits one site"; on the expedition brief, "fits every site, has to be looked up".
- Motion: _agent-decided:_ the depth note moving from the card to the wall.
- Decision: simplified. The three gauges (performance, reusability, token cost) are dropped from the picture and said in the Voice script. Why: Han found the first version too much.
- Research: 1.

**15. One card, one job**

- Caption: "A good skill does one job and isn't tied to any one project."
- Design: two halves.
  - Left: an overstuffed card, "Sample, film, log and clean up".
  - Right: a sampling card with "descend to 40 m" scribbled in for site 4; at the next site the seabed lies at 120 m and the robot hangs uselessly at 40.
  - Callout: cohesion and coupling, plus the Agent Skills paper's test: if you can't describe a skill in one sentence, it's two skills.
- Motion: the robot stopping short, far above the seabed.
- Decision: orchestration is off-topic here (this Section is about context); it moved to Slide 19.
- Research: 1, 2.

**16. Inside the card**

- Caption: "Domain knowledge can live inside a skill, kept apart from the steps until a step needs it."
- Design: the card in its sleeve, each extra tied to the step that uses it:
  - step 3, "lower the arm" → arm preset (runs a fixed motion)
  - step 4, "identify what you collected" → species guide, opening on its own contents page
  - step 6, "label the sample" → label template
  - Notes: when the steps get long, the next paragraph belongs in the sleeve; long extras start with a contents list, because the AI may only skim the start.
- Coding-agent view: `SKILL.md` linking one level deep into `references/`, `assets/`, `scripts/`.
- Motion: step 4 lights up and the species guide slides out.
- Decision: no hard 100-line read limit. Basis: Anthropic's skill authoring best practices: reference files over 100 lines get a table of contents at the top, because Claude may preview with partial reads; references stay one level deep from `SKILL.md`.
- Research: 2.

### Twilight · What stays beside

**17. Beside the card**

- Caption: "Project details stay beside the skill, in files it reads when it runs."
- Design: Slide 15's mistake fixed. The card says "descend to the depth in today's dive plan"; a line runs to the expedition brief: "Site 4: 40 m. Site 7: 120 m."
- Coding-agent view: the step pointing to a project file such as `CONTEXT.md`.
- Motion: this time the robot reaches the seabed at 120 m.

**18. Who uses it, and where**

- Caption: "Who uses a skill, and where, decides what goes inside it and how much care it needs."
- Design: a simple 2×2, readable at rest, labelled "rule of thumb". Axes in organisational words: personal or shared; general use or project-specific. Small expedition pictures in each square.
  - Personal, project-specific: details written straight in, no upkeep.
  - Personal, general: details kept beside, your own toolkit.
  - Shared, project-specific: details can live in its extras, owned by the project team.
  - Shared, general: details beside, with an owner, a version and evals.
- Motion: one card moving from your notebook to the fleet manual, losing its scribbled details and gaining an owner tag.
- Decisions:
  - Axes generalised from "one expedition or many". Why: applicable as a decision matrix in any organisation.
  - Kept simple on purpose; it foreshadows Slide 21.
  - Labelled rule of thumb. Basis: tools split personal and project scope (`~/.claude/skills/` vs `.claude/skills/`) and guides recommend personal, team and organisation tiers with rising oversight, but tying each square to where context lives is Han's own synthesis.
- Research: 5.

**19. How grill-me and grill-with-docs work**

- Caption: "The interview stays the same; what it learns about your project is written beside it for the next run."
- Design: real files, three parts left to right: grill-me's `SKILL.md` with the interview steps highlighted as the procedure; grill-with-docs, which uses grill-me and adds domain modelling; the files it writes beside itself, `GLOSSARY.md` and decision records, with an arrow back to the next run reading them. Small key in the corner: card and expedition brief.
- Closing line: a skill can also run other skills, with no settled name for it yet. Mentioned only here, never expanded.
- Motion: `GLOSSARY.md` gaining a new term after a session.
- Decision: the only Slide outside the control room. Why: a showcase, not woven through, so every other Slide stands alone.

### Midnight · Sharing it

**20. Shared skills are knowledge articles**

- Caption: "A shared skill needs what any company knowledge article needs: an owner, a version and a review date."
- Design: two copies of the same card. Left: your notebook card, no header. Right: the same card in the institute's fleet manual, with a control block: owner, version 1.3, next review in March. Note: personal skills skip this until you share them.
- Motion: the control block stamped on as the card moves into the fleet manual.
- Research: 1, 4.

**21. Who owns the fleet manual**

- Caption: "Shared, general skills need rules for who adds, checks and removes them, and most organisations are still working those out."
- Design: Slide 18's matrix returns; the view zooms into the shared, general square. The fleet manual's front page lists what a card needs beyond Slide 20's control block: who may add one, its tier (fleet, ship or expedition), its token cost, which robots it works with, a retirement date. One corner stays dark and unlabelled, for questions nobody has settled.
- Motion: the zoom into that square.
- Decision: callback, not a new chart. Why: Slide 18 was designed to be expanded here.
- Research: 4, 5.

**22. Does the card make things better?**

- Caption: "Test a skill by running the same task with and without it, because a bad skill can do worse than none."
- Design: two test dives side by side in shallow water, same task: without the card on the left, with it on the right, each with a scorecard. Below, a label check: three requests that should pull the card, three that shouldn't. Callout: Vercel's result, a skill scoring below no skill.
- Motion: the two scores filling in, one after the other.
- Research: 3.

### Abyss · Keeping it alive

**23. Every skill is a loan**

- Caption: "Writing a skill is quick; keeping it right costs you something every month."
- Design: one card with a running tag, like a loan statement; each entry a small cost: the site list changed, a new robot arm arrived, an index line now overlaps another card. Callout: Ward Cunningham's technical debt.
- Motion: the tag growing one line at a time.
- Research: 1.

**24. The pilot changes, the card doesn't**

- Caption: "A model update changes who reads your skill, so a card that worked yesterday can behave differently today."
- Design: a reveal panel: every pilot has this condition, and pilot schools train them, one school per AI provider. Two panels follow:
  - Update: your pilot returns from his school's new course; same name, same card, but "descend slowly" now gives a different dive (e.g. Opus 5 to 5.5).
  - Switch: a pilot from another school reads the same card in their own way.
  - Callout: Lehman's laws, that software in use has to keep changing or it gets worse; here the world around the card moves.
- Motion: the same card going into two dives that end at different depths.
- Decisions:
  - The schools appear only here. Why: keeps the opener warm and human.
  - Sending the pilot back to school was rejected as the update picture; an update is a school's new course, not a personal refresher.
  - A new environment (new robot arm) is not drawn here; it appears on Slide 23's loan tag.
  - Research note: people with this kind of amnesia can still learn new movements without remembering the lessons (patient H.M.); check before citing.
- Research: 1, 6.

**25. Retire cards**

- Caption: "Remove skills nobody uses, so the right one stays easy to find."
- Design: the fleet manual's index next to the season's dive log. Cards the log never mentions are greyed out and go into an archive box marked with their retirement date. The index left behind is short again, the needed entry easy to spot: a callback to Slide 9.
- Motion: unused cards sliding into the archive box, the index closing up.

**26. The whole iceberg**

- Caption: "Write a skill the third time, label it by the moment, and decide where the project details live before you share it."
- Content: peak-end close. The Voice script recaps the three Actionables, then the honest caveat: the deep end is still unsettled for most organisations.
- Design: the full depth ruler from Surface to Abyss, each Section's takeaway at its depth. The robot rises on its cable from the seabed to the ship; on deck the manual lies open with a short index.
- Motion: the robot rising, each takeaway lighting up as it passes.
- Decision: the caption is the three Actionables in one line.

## Next action

The next session runs `brief-grill`'s Self-check on the revised Brief and commits it with `Gate: draft brief`, then starts `/new-episode`. The Dossier and Spec stages read this file for per-Slide design and motion, and should not reopen the decisions above without asking Han.
