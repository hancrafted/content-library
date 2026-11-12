---
type: brief
title: What lies below the waterline of sustainable AI skills
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-12T10:13:10Z
verified:
  - by: process:markdown-harness
    at: 2026-11-12T10:20:00Z
---

# What lies below the waterline of sustainable AI skills

## Format

Foundations, about 30 minutes.

## Audience

Standalone for people who already use ChatGPT, Copilot or Claude at work, mostly tech-adjacent or non-technical, with no engineering background. They know prompting and chat, and want to stop re-explaining how they work and to know when a skill is worth writing. First shown right after participants used grill-me and to-spec; repeated and updated across workshops. Developers using coding agents (Claude Code, Codex) get the coding-agent view.

## Style

Iceberg, with a factory packing station as the scene: its four zones carry the title's waterline from what everyone sees down to what few look at, and a packing station is a picture a non-technical audience already knows from every parcel they have unpacked.

## Learning goal

Spot when a repeated task should become a skill, and tell what goes into the skill and what stays in project context.

## Actionables

1. Pick one task you've explained three times, and turn a good run of it into a skill.
2. Write its description as the moment you'd need it.
3. Before sharing a skill, decide where the project details live, and give it an owner.

## Hook

"You've explained this to the AI a hundred times. It has heard it once."

## Red thread

Every conversation with AI starts from zero on how you work; a skill hands the AI your proven procedure on demand, and where you put the project details, inside the skill or beside it, decides how reusable it is.

## Analogy

A skill is a packing binder on the shelf of a factory's packing station. The AI is a temp from an agency, a capable packer who has never seen your station, so each chat is a new temp; you are the shift lead who writes the binders. The spine label is the description, the binder holds the procedure, and the packing slip that comes with each order is the project context. The plant's house rules at the gate are your personal instructions, the station's wall chart its project instructions, and the label printer reaching into the order system is a connector. The iceberg is the Episode's style, not a second analogy: each Section sits at its zone's depth.

## Constraints

- Two layers: the default view shows skills in a chat app, in its words (personal instructions, project instructions, connectors); an optional coding-agent view (Claude Code, Codex) has copy-pastable commands and the technical detail (`~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md`, slash commands), switched per Slide to suit the workshop, like the views of the context window Explorable.
- Not a law: keeping procedure apart from project context is shown as a design decision with trade-offs (performance, reusability, token cost), never as a rule.
- Timeless roots: every principle in Sections 3 to 7 is cited from established engineering, information architecture or UX sources, not tool trends.
- One scene: every Slide's picture is the packing station, except Slide 19, which shows the real grill-me files with the binder only as a small key.

## Slides

### Starting from zero

1. **A new temp every morning** — carries the Hook as a thought experiment, copied from the new-hire Slide of "onboard-ai-every-time" and keeping its role-switch label: a capable temp who has never seen your station arrives each morning, so you explain the same procedure daily; what would you do? Write it down. _Visual:_ the same packing instructions handed over on five mornings to five temps from the agency; Above water zone.
2. **The packing station's answer: a shelf of binders** — sets the picture the Episode returns to: spine label, binder, packing slip. _Visual:_ a packing station with a shelf of labelled binders, a packing slip on the bench, the tape sealer and the label printer.

### What a skill is

3. **A skill is a binder** — defines a skill: a folder with a name, a description and the procedure, plus optional files; the coding-agent view shows the open standard. _Visual:_ an open packing binder beside its folder tree (SKILL.md, references, assets, scripts). _Research:_ 2
4. **Three levels of loading** — progressive disclosure: the spine is always visible, the cover page when it's pulled, the appendix only when needed. _Visual:_ one binder opening one level at a time: spine, cover page, appendix. _Research:_ 2
5. **Skills are dynamic context** — callback to the context window: everything loaded takes space and attention; instructions are static and always loaded, while a skill arrives mid-job and pulls in more as it works: files read, tool results, its own outputs. _Visual:_ the context window Explorable with only binder spines loaded, then a binder arriving at the station mid-job as slips and parts pile up beside it. _Research:_ 2
6. **Personal instructions, project instructions, skill or connector** — tells apart rules that follow you everywhere, rules for one project, know-how on demand, and reach into other systems; the coding-agent view labels them `~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md` and a tool. _Visual:_ the plant's house rules at the gate, the station's wall chart, a binder on the shelf, and the label printer wired to the order system. _Research:_ 2
7. **Two ways to open the binder** — invocation: you call it by name with a slash command, or the AI picks it from its label. _Visual:_ the shift lead handing over a binder by name, and the temp scanning spines. _Research:_ 2, 3

### When to write one

8. **The third time is the signal** — do it once, notice it the second time, write it down the third. _Visual:_ the same kind of order arriving three times; on the third a binder is written. _Research:_ 1
9. **Not every repeat deserves a binder** — YAGNI and premature optimisation: a skill written too early locks in an unproven procedure, and thirty quick skills are thirty things to maintain. _Visual:_ a crowded shelf of thin, untested binders. _Research:_ 1
10. **Write it from a good run** — two ways to create one: from your own runbook, or have the AI turn a conversation that worked into a skill. _Visual:_ a well-packed parcel turning into a binder, from two directions. _Research:_ 2

### The label

11. **The spine is all the AI sees** — at the start the AI sees only names and descriptions; information scent says the label must promise what's inside. _Visual:_ the shelf as the temp sees it, spines only. _Research:_ 1
12. **Name the moment, not the content** — describe when to use the skill, in the words someone would actually type. _Visual:_ two spines side by side, a content label against a moment label. _Research:_ 1
13. **More binders, harder choice** — Hick's law: overlapping labels compete, skills go unused, and a short index in the project instructions helps. _Visual:_ near-identical spines on a crowded shelf, a short index added to the station's wall chart. _Research:_ 1, 3

### Inside or beside

14. **What goes where is information architecture** — organisation, labels and navigation decide performance, reusability and token cost. _Visual:_ the station's shelf with three dials for performance, reusability and tokens. _Research:_ 1
15. **One binder, one job** — cohesion and coupling: one skill does one thing well, tied loosely to any one project; one customer's details written into the binder work once and break every other order. _Visual:_ the gift note "Happy 40th, Anna" written into the binder, turning up in every parcel after it. _Research:_ 1
16. **Inside the binder** — procedure on top, domain knowledge in references, templates in assets, fixed steps in scripts, each loaded only when needed. _Visual:_ binder tabs for procedure, references, templates and scripts. _Research:_ 2
17. **Beside the binder** — the packing slip: project files the skill reads when it runs, kept outside it. _Visual:_ the binder on the bench beside the packing slip and the customer's folder.
18. **Who uses it, and where** — the decision tool: just you or shared, one project or many; only you in one project bakes context in and skips governance, shared across projects keeps context out and gets an owner and evals. _Visual:_ a 2×2 matrix with binders placed in each square, readable at rest.
19. **How grill-me and grill-with-docs work** — showcase of inside and beside together, on the real files: grill-me is the procedure, the interview format; grill-with-docs adds domain modelling, writing a glossary and decision records beside it for future runs to read. _Visual:_ grill-me's real SKILL.md, grill-with-docs writing GLOSSARY.md and decision records beside it, and the next run reading them; a small binder key in the corner.

### Keeping it alive

20. **Every skill is a loan** — technical debt: writing a skill is quick, and you pay interest in maintenance. _Visual:_ a binder carrying a running interest tag. _Research:_ 1
21. **The plant changes, the binder doesn't** — Lehman's laws: a model update or a new environment is a new temp reading an old binder, with results you can't predict. _Visual:_ the same binder at a new packing line with new machines. _Research:_ 1
22. **Shared skills are knowledge articles** — an owner, a version and a review date; personal skills skip this until you promote one. _Visual:_ a binder cover with a document-control stamp. _Research:_ 1, 4
23. **Retire binders** — delete skills nobody uses, so the shelf stays easy to choose from. _Visual:_ unused binders going into an archive box.

### Governance and evals

24. **Who owns the binders** — governance: tiers from universal to product-specific, each with an owner and a review, like document control in a plant; still work in progress for most organisations. _Visual:_ tiered shelves with owner tags, in The deep zone. _Research:_ 4
25. **Does the binder make things better?** — evals: run the job with and without the skill, because a bad skill can score below no skill at all. _Visual:_ two packing runs side by side, with and without the binder, and their scores. _Research:_ 3
26. **The whole iceberg** — lands the Learning goal: from the third-time signal near the surface to governance in the deep, back to the Red thread. _Visual:_ the full depth ruler, each Section's takeaway at its depth.

## Research questions

1. Why do the established principles behind Sections 3 to 7 hold (rule of three, YAGNI and premature optimisation, information scent, Hick's law, information architecture, cohesion and coupling, technical debt, Lehman's laws, knowledge articles), and what is each one's source and wording?
2. Why do skills, personal instructions, project instructions and connectors load and get invoked the way they do across Claude, ChatGPT, Codex, Gemini and Copilot, what does each app call them, checked against the agentskills.io standard?
3. Why do skills help or hurt agent results, per Vercel's numbers and any newer evals?
4. Why do organisations tier, own and review shared skills the way they do today?

## Open ideas

- Library (walking shelves, seeing spines) and recipe as backup analogies.
- Workplaces considered for the scene: a joinery workshop, a restaurant kitchen, a bakery, a car repair garage, an assembly station, a quality inspection station; the packing station won as the one everyone knows from unpacking parcels.
- The AI as an apprentice, a travelling journeyman or a cobot; the temp won because a new chat really is a different worker with no memory.
- Factory as the Episode's style for continuity with "From shared understanding to shared context"; Iceberg chosen so the waterline shows on every Slide.
- A woven Thread following grill-me from personal prompt to retired skill; declined for a standalone showcase Slide.
- Slide 18 as an Explorable: place your skill in a square and see what goes inside, beside, and what governance it needs.
- Workshop cuts, starting with Cyberforum Akademie on 16 Nov 2026, are composed later as unlisted Episodes from this one's Slides.
- Follow-up Episode: "Skill-based HITL workflow", right after this one.
- Title alternatives: "Below the waterline: AI skills you can sustain", "AI skills you can sustain".
- Hook alternatives: "Writing a skill takes five minutes. Owning thirty of them is the hard part." and "The best colleague you've ever had forgets everything by morning."
- NN/g F-pattern on scanning, dropped as too far from how the model reads.
