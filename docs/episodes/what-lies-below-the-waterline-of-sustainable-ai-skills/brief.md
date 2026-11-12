---
type: brief
title: What lies below the waterline of sustainable AI skills
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-12T15:08:35Z
verified:
  - by: process:markdown-harness
    at: 2026-11-12T15:08:35Z
---

# What lies below the waterline of sustainable AI skills

## Format

Foundations, about 30 minutes.

## Audience

Standalone for people who already use ChatGPT, Copilot or Claude at work, mostly tech-adjacent or non-technical, with no engineering background. They know prompting and chat, and want to stop re-explaining how they work and to know when a skill is worth writing. First shown right after participants used grill-me and to-spec; repeated and updated across workshops. Developers using coding agents (Claude Code, Codex) get the coding-agent view.

## Style

Iceberg, with the control room of a research ship as the scene, drawn in low poly: its zones carry the title's waterline from what everyone sees down to what few look at, and a non-technical audience follows an expedition without any jargon.

## Learning goal

Spot when a repeated task should become a skill, and tell what goes into the skill and what stays in project context.

## Actionables

1. Pick one task you've explained three times, and turn a good run of it into a skill.
2. Write its description as the moment you'd need it.
3. Before sharing a skill, decide where the project details live, and give it an owner.

## Hook

"You've explained this to the AI a hundred times. It has heard it once."

## Red thread

Every conversation with AI starts from zero on how you work; once you've explained a task three times, a skill hands the AI your proven procedure on demand, and where you put the project details, inside the skill or beside it, decides how reusable it is.

## Analogy

You are the captain of a coastal research expedition. The AI is your pilot of ten years, the best you know, with one settled condition: he forms no new memories overnight, but keeps everything he ever learnt as a pilot. He steers an unmanned diving robot by cable from the control room on deck, and that robot is also the depth marker on the Iceberg ruler.

- The expedition is the project context; one dive is one task.
- A skill is a procedure card in the dive manual; its title and its "use when" and "not for" lines in the manual's index are the description.
- Your standing orders in your own notebook are personal instructions; the expedition brief on the control-room wall is project instructions; the cable to the sonar and the lab database is a connector.
- Shared skills go into the institute's fleet manual.
- Revealed only on Slide 24: every pilot has the condition, pilot schools are the AI providers, a school's new course is a model update, and a pilot from another school is a different model.

The iceberg is the Episode's style, not a second analogy: each Section sits at its zone's depth.

## Constraints

- Two layers: the default view shows skills in a chat app, in its words (personal instructions, project instructions, connectors); an optional coding-agent view (Claude Code, Codex) has copy-pastable commands and the technical detail (`~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md`, slash commands, MCP), switched per Slide to suit the workshop, like the views of the context window Explorable.
- Not a law: keeping procedure apart from project context is shown as a design decision with trade-offs (performance, reusability, token cost), never as a rule.
- Timeless roots: every principle in Sections 3 to 8 is cited from established engineering, information architecture or UX sources, not tool trends, and grounded once by "What works for people also works for AI", said as a strong rule of thumb, not a law.
- Zones: A thought experiment and What a skill is at the Surface; When to write one and The label in the Sunlit zone; What goes inside and What stays beside in the Twilight zone; Sharing it at Midnight; Keeping it alive in the Abyss.
- One scene: every Slide's picture is the ship's control room and its dives, except Slide 19, which shows the real grill-me files with the card only as a small key; Slide 5 sets the context window Explorable in the scene's words, and Slides 18 and 21 draw a matrix with small expedition pictures.
- Low-poly figures with no detailed faces or hands; objects carry the motion.
- The humour sits in the situation, never at the pilot's expense.

## Slides

### A thought experiment

1. **A pilot who forgets every morning** — carries the Hook as a thought experiment, standing alone with no role switch: your best pilot of ten years forgets overnight, so you explain the same procedure every day; what would you do? Caption: "Every conversation with AI starts from zero on how you work." _Visual:_ a comic strip. First panel: a framed photo on the control-room wall, you and the pilot across ten years of expeditions. Then three mornings: each day he greets you with a speech bubble, "Nice to meet you", you explain the sediment sample again, and the robot sits idle on deck. It ends on "What would you do?" beside an empty procedure card. In live workshops the Voice script asks the audience to answer in the chat; the Slide keeps only the question and the empty card.
2. **The dive manual** — sets the picture the Episode returns to: index entry, procedure card, expedition brief. Caption: "A skill hands the AI your proven procedure on demand." _Visual:_ one wide view of the control room: the pilot at the console, the manual open at its index, the expedition brief on the wall, and the robot on its cable through the window. Callouts name only index entry, procedure card and expedition brief. Motion: one card slides out of the manual on its own.

### What a skill is

3. **A skill is a procedure card** — defines a skill: a written procedure with a name, a description and optional files. Caption: "A skill is a written procedure with a name and a note on when to use it." _Visual:_ one card in a clear sleeve: the front holds the title and "use when" line, the back the numbered steps; tucked into the sleeve are a species guide, a sample label and an arm preset. Coding-agent view: the same card beside its folder, each part linked to `SKILL.md`, `references/`, `assets/` and `scripts/`. _Research:_ 3
4. **Three levels of loading** — progressive disclosure, stated as the mechanics are. Caption: "The AI reads only the index until a task needs more." _Visual:_ the manual in three steps, each with a plain factual label: always loaded, every skill's name and description; loaded when the skill is used, its main instructions; loaded only if needed, references, templates and scripts, where a script can run without its code entering the conversation. Motion: a soft light moves across the three steps in loading order. _Research:_ 3
5. **Skills are dynamic context** — callback to the context window: what's always loaded is static, and a skill arrives on demand, whether you call it at the start or the AI picks it mid-task. Caption: "What's always loaded is static; a skill loads on demand, so it is dynamic." _Visual:_ the context window Explorable with a Preset in the scene's words. Static: your standing orders, the expedition brief and the manual's index. Dynamic, filling during the dive: the pulled card, camera frames, sonar readings and sample logs. Plain labels beside each: personal instructions, project instructions, skill index, skill body, tool results. Motion: the dynamic part filling up as the dive goes on. _Research:_ 3
6. **Instructions, skills and connectors** — tells apart rules that follow you everywhere, rules for one project, know-how on demand, and reach into other systems. Caption: "Instructions are always loaded, skills load on demand, and connectors reach into other systems." _Visual:_ four things in the control room, each with its plain label and a small static or dynamic tag linking back to Slide 5: your standing orders in your notebook, the expedition brief on the wall, the manual at the console, and the cable to the sonar and the lab database. Coding-agent view: `~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md` and an MCP server. _Research:_ 3
7. **Two ways to call a skill** — invocation: you call it by name, or the AI picks it from its description. Caption: "You call a skill by name, or the AI picks it from its description." _Visual:_ the control room split in two. Left: you name the card, "Sediment sample, please." Right: the pilot scans the index and pulls the card when the dive needs it. Under the right half: in Vercel's tests, agents left skills unused 56% of the time. Coding-agent view: a typed slash command on the left, a description match on the right. Motion: a highlight lands on one index line. _Research:_ 3, 5

### When to write one

8. **The third time is the signal** — when a skill is worth writing: the first time teaches you what's needed, the second refines it, and by the third you know what a good result looks like; the Section opens on "What works for people also works for AI", where the borrowed principles begin. Caption: "The third time, and you know what a good result looks like, is the signal." _Visual:_ a callback to Slide 1's comic in three panels: explaining the sediment sample, refining it, then writing the card. A small callout at the end: "Did you know? This matches the rule of three from Fowler's Refactoring", a software engineering rule against generalising too early. Motion: Slide 1's empty card filling with steps. _Research:_ 1, 8
9. **Not every repeat deserves a card** — YAGNI and premature optimisation: a skill written too early locks in an unproven procedure, and every quick skill is one more thing to maintain. Caption: "A card written too early locks in a procedure nobody has proven." _Visual:_ a manual stuffed with thin cards, several stamped "never tested". Beside it, a three-question check: does it repeat, does it have rules, does a mistake cost something? A small callout names YAGNI and Knuth on premature optimisation. Motion: the index growing line by line until it runs off the page, the one entry you need buried in the middle. _Research:_ 1
10. **Write it from a good run** — two ways to create one: from your own notes, or by letting the AI interview you about a run that worked, so the skill captures your intent, not only the steps. Caption: "Turn a run that worked into a skill: from your own notes, or by asking the AI to write it up." _Visual:_ two paths into one card. Left: your logbook pages from earlier dives. Right: today's dive went well, so before evening the pilot interviews you about it (why that depth, why that order, what would have counted as failure), then writes the card while he still knows. Callout: "The AI interview from the last Episode works here too." Coding-agent view: asking the agent to turn this conversation into a skill. Motion: both sources folding into one card. _Research:_ 4

### The label

11. **The index is all the AI sees** — at the start the AI sees only names and descriptions; information scent says the label must promise what's inside. Caption: "At the start the AI sees only each skill's name and description, so the label must promise what's inside." _Visual:_ the manual from the pilot's view: the index readable, every card behind it closed and greyed out. Two entries side by side: a vague "Samples" and a clear "Take a sediment sample at a new site". A small callout names information scent from Xerox PARC research. Coding-agent view: the name and description lines of a `SKILL.md`. Motion: the clear entry lights up as the dive's task appears. _Research:_ 2
12. **Name the moment, not the content** — describe when to use the skill, and when not to, in the words someone would actually say. Caption: "Describe when to use a skill, in the words someone would actually say." _Visual:_ two index lines for the same card. The content label: "Sediment sampling procedure, steps 1 to 9". The moment label, in two halves: "Use when we reach a new site and need a sample from the seabed. Not for water samples or filming." Above them, your request on the day: "Grab some mud here before we move on." Only the moment label matches it. Motion: a line drawn from your request to the moment label. _Research:_ 4
13. **More cards, harder choice** — overlapping labels compete, skills go unused, and a short index in the project instructions helps. Caption: "The more skills look alike, the less often the right one gets picked." _Visual:_ an index crowded with near-twins ("Sample", "Take sample", "Seabed sample v2") and a question mark over the console. The expedition brief on the wall carries a short list: "On this expedition, use these three cards." A callout names Hick's law, said honestly as a finding about people, beside Vercel's test, where a short index in `AGENTS.md` beat skills left to be found. Motion: the twins fade back and one line on the wall list lights up. _Research:_ 2, 5

### What goes inside

14. **What goes where is information architecture** — every piece of knowledge needs a home, and choosing it is information architecture; performance, reusability and token cost are said in the Voice script. Caption: "Where you put each piece of knowledge decides how well, how widely and how cheaply a skill works." _Visual:_ one piece of knowledge, today's site depth, with two possible homes and their plain costs: inside the card, "always there, fits one site"; on the expedition brief, "fits every site, has to be looked up". A small callout: information architecture, the craft of organising information so it can be found. _Research:_ 2
15. **One card, one job** — cohesion and coupling: a good skill does one thing and isn't tied to any one project. Caption: "A good skill does one job and isn't tied to any one project." _Visual:_ two halves. Left: an overstuffed card, "Sample, film, log and clean up". Right: a sampling card with "descend to 40 m" scribbled in for site 4; at the next site the seabed lies at 120 m, and the robot hangs uselessly at 40. A callout names cohesion and coupling and the Agent Skills paper's test: if you can't describe a skill in one sentence, it's two skills. Motion: the robot stopping short, far above the seabed. _Research:_ 1, 4
16. **Inside the card** — domain knowledge can live inside a skill, apart from the steps until a step needs it. Caption: "Domain knowledge can live inside a skill, kept apart from the steps until a step needs it." _Visual:_ the card in its sleeve, each extra tied to the step that uses it: step 3, "lower the arm", points to the arm preset, which runs a fixed motion; step 4, "identify what you collected", points to the species guide, which opens on its own contents page; step 6, "label the sample", points to the label template. Two notes: when the steps get long, the next paragraph belongs in the sleeve; long extras start with a contents list, because the AI may only skim the start. Coding-agent view: `SKILL.md` linking one level deep into `references/`, `assets/` and `scripts/`. Motion: step 4 lights up and the species guide slides out. _Research:_ 4

### What stays beside

17. **Beside the card** — project details stay outside the skill, in files it reads when it runs. Caption: "Project details can stay beside the skill, in files it reads when it runs." _Visual:_ Slide 15's mistake, fixed. The card now says "descend to the depth in today's dive plan", and a line runs from that step to the expedition brief on the wall: "Site 4: 40 m. Site 7: 120 m." Coding-agent view: the step pointing to a project file such as `CONTEXT.md`. Motion: this time the robot reaches the seabed at 120 m.
18. **Who uses it, and where** — the decision tool, as a rule of thumb that the governance Slide later expands. Caption: "Who uses a skill, and where, decides what goes inside it and how much care it needs." _Visual:_ a simple 2×2, readable at rest and labelled "rule of thumb", with axes in organisational words, personal or shared and general use or project-specific, and small expedition pictures in each square. Personal and project-specific: details written straight in, no upkeep. Personal and general: details kept beside, your own toolkit. Shared and project-specific: details can live in its extras, owned by the project team. Shared and general: details beside, with an owner, a version and evals. Motion: one card moving from your notebook to the fleet manual, losing its scribbled details and gaining an owner tag. _Research:_ 7
19. **How grill-me and grill-with-docs work** — showcase of inside and beside together, on the real files, closing with one mention that a skill can run other skills. Caption: "The interview stays the same; what it learns about your project is written beside it for the next run." _Visual:_ three parts, left to right: grill-me's real `SKILL.md` with the interview steps highlighted as the procedure; grill-with-docs, which uses grill-me and adds domain modelling; and the files it writes beside itself, `GLOSSARY.md` and decision records, with an arrow back to the next run reading them. A small key in the corner maps them to the card and the expedition brief. A closing line: a skill can also run other skills, with no settled name for it yet. Motion: `GLOSSARY.md` gaining a new term after a session.

### Sharing it

20. **Shared skills are knowledge articles** — a shared skill needs what a company knowledge article needs; personal skills skip this until you share them. Caption: "A shared skill needs what any company knowledge article needs: an owner, a version and a review date." _Visual:_ two copies of the same card. Left: your notebook card, with no header. Right: the same card in the institute's fleet manual, with a control block: owner, version 1.3, next review in March. A small note: personal skills skip this until you share them. Motion: the control block stamped on as the card moves into the fleet manual. _Research:_ 6
21. **Who owns the fleet manual** — governance, as a callback to Slide 18's matrix, honest that most organisations are still working it out. Caption: "Shared, general skills need rules for who adds, checks and removes them, and most organisations are still working those out." _Visual:_ Slide 18's matrix returns and the view zooms into the shared, general square. Inside it, the fleet manual's front page lists what a card needs beyond Slide 20's control block: who may add one, its tier (fleet, ship or expedition), its token cost, which robots it works with, and a retirement date. One corner stays dark and unlabelled, for the questions nobody has settled yet. Motion: the zoom into that one square. _Research:_ 6, 7
22. **Does the card make things better?** — evals: run the same task with and without the skill, and test its label. Caption: "Test a skill by running the same task with and without it, because a bad skill can do worse than none." _Visual:_ two test dives side by side in shallow water, the same task each time: on the left the pilot works without the card, on the right with it, each with a scorecard. Below, a small check for the label: three requests that should pull the card and three that shouldn't. A callout gives Vercel's result, where a skill scored below having no skill at all. Motion: the two scores filling in, one after the other. _Research:_ 5

### Keeping it alive

23. **Every skill is a loan** — technical debt: writing a skill is quick, and keeping it right costs something over time. Caption: "Writing a skill is quick; keeping it right costs you something every month." _Visual:_ one card with a running tag, like a loan statement, each entry a small cost that piles up: the site list changed, a new robot arm arrived, an index line now overlaps another card. A callout names Ward Cunningham's technical debt. Motion: the tag growing one line at a time. _Research:_ 1
24. **The pilot changes, the card doesn't** — the late reveal of the analogy's world, and Lehman's laws: the world around a skill moves, so a skill that worked can drift. Caption: "A model update changes who reads your skill, so a card that worked yesterday can behave differently today." _Visual:_ a reveal panel: your pilot isn't the only one, every pilot has this condition, and pilot schools train them, one school per AI provider. Two panels follow. Update: your pilot returns from his school's new course, same name and same card, but "descend slowly" now gives a different dive. Switch: a pilot from another school reads the same card in their own way. A callout names Lehman's laws, that software in use has to keep changing or it gets worse. Motion: the same card going into two dives that end at different depths. _Research:_ 1, 9
25. **Retire cards** — delete skills nobody uses, so the right one stays easy to find. Caption: "Remove skills nobody uses, so the right one stays easy to find." _Visual:_ the fleet manual's index next to the season's dive log. Cards the log never mentions are greyed out and go into an archive box marked with their retirement date; the index left behind is short again, the one entry you need easy to spot, a callback to Slide 9's buried entry. Motion: the unused cards sliding into the archive box and the index closing up.
26. **The whole iceberg** — lands the Learning goal and the Actionables with a peak-end close: a recap of the three steps, then the honest caveat that the deep end is still unsettled for most organisations. Caption: "Write a skill the third time, label it by the moment, and decide where the project details live before you share it." _Visual:_ the full depth ruler from the Surface to the Abyss, each Section's takeaway written at its depth. The robot rises on its cable from the seabed to the ship, and on deck the manual lies open with a short index. Motion: the robot rising, each takeaway lighting up as it passes.

## Research questions

1. Why do the established software engineering principles behind Sections 3 to 8 hold (the rule of three from Fowler's Refactoring, credited to Don Roberts, as a rule against premature abstraction; YAGNI and Knuth on premature optimisation; cohesion and coupling; Cunningham's technical debt; Lehman's laws), as each one's original source words it?
2. Why do the UX and information architecture principles behind Sections 3 to 8 hold (information scent from Xerox PARC; Hick's law; Rosenfeld and Morville's information architecture), as each one's original source words it?
3. Why do skills, personal instructions, project instructions and connectors load and get invoked the way they do across Claude, ChatGPT, Codex, Gemini and Copilot, and what does each app call them?
4. Why do the agentskills.io standard and Anthropic's authoring guidance recommend writing skills the way they do (descriptions with "not for" lines, contents lists for long reference files, references one level deep)?
5. Why do skills help or hurt agent results, per Vercel's numbers (56% of skills left unused, a short `AGENTS.md` index beating discovered skills, a skill scoring below no skill) and any newer evals?
6. Why do organisations tier, own and review shared skills the way they do today, treating them like knowledge articles with an owner and a review date?
7. Why does a skill's audience and scope (personal or shared, general or project-specific) decide where its context lives and how much care it needs, and does any framework support such a matrix?
8. Why does "what works for people also works for AI" hold as a rule of thumb, and where does it break?
9. Why could people with amnesia like patient H.M. learn new movements without remembering the lessons, and how far does that picture hold for a model?

## Open ideas

- Update Slide 9 of "From shared understanding to shared context" so the first prompt counts as dynamic context, following the definitions in Google's "The New SDLC With Vibe Coding".
- Low poly as a candidate addition to the Iceberg style in `docs/design/design-guide.md`, once Han has seen it rendered.
- Orchestration skills, a skill that runs other skills like `new-episode`, for the follow-up Episode "Skill-based HITL workflow", right after this one.
- Analogies considered and dropped: a factory packing station with an agency temp, a crewed deep-sea submarine (Titan echo), a pleasure cruise, a military vessel, a ship's galley with a new cook, a pilot with a head injury from a storm; library and recipe stay as backups.
- Slide 18 as an Explorable: place your skill in a square and see what goes inside, beside, and what governance it needs.
- Workshop cuts, starting with Cyberforum Akademie on 16 Nov 2026, are composed later as unlisted Episodes from this one's Slides.
- A woven Thread following grill-me from personal prompt to retired skill; declined for a standalone showcase Slide.
- Title alternatives: "Below the waterline: AI skills you can sustain", "AI skills you can sustain".
- Hook alternatives: "Writing a skill takes five minutes. Owning thirty of them is the hard part." and "The best colleague you've ever had forgets everything by morning."
- NN/g F-pattern on scanning, dropped as too far from how the model reads.
