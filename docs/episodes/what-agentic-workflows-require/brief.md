---
type: brief
title: What agentic workflows require of people and organisations
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-14T14:28:29Z
verified:
  - by: process:markdown-harness
    at: 2026-11-14T10:16:02Z
  - by: process:markdown-harness
    at: 2026-11-14T11:20:56Z
  - by: human:han
    at: 2026-11-14T11:32:49Z
  - by: process:markdown-harness
    at: 2026-11-14T14:28:29Z
  - by: human:han
    at: 2026-11-14T14:32:42Z
---

# What agentic workflows require of people and organisations

## Format

Foundations, 20 to 30 minutes.

## Audience

Team leads, managers and CEOs of smaller companies who use AI chat tools and need to judge what their people and their organisation need to work with agents. It is the first Episode of the series and stands alone: it teaches agent, context and skills from cold, and later Episodes point back to it. First shown at the Cyberforum Akademie workshop; reusable in any workshop.

## Style

Board: managers already plan on whiteboards and sticky notes, and planning backwards from a goal and breaking it into tasks is what a board shows.

## Learning goal

Explain what an agentic workflow is and what it requires of each person and of the organisation, so the workflow is designed AI first, around the goal, not around current teams, culture and processes.

## Actionables

1. Pick one recurring process in your team, and mark which steps an agent could run and whether a person stays in, on or out of the loop for each.
2. Before you hand a task to an agent, write down what it receives, what it must deliver, and how someone else can check the result.
3. If you lead a transformation and the AI workflow your people define mirrors how they work today, suspect Conway's law, and redesign it around the goal.
4. Look at your team: who can break work down, write clear handoffs and review an agent's result? Those are the skills to build.

## Hook

"Everyone delivered exactly what was asked, and none of it added up. AI just gets you there faster."

## Red thread

Perfect steps don't add up on their own; an agentic workflow is a goal broken into reviewable handoffs, how far you step out depends on how well you can check them, each person has to plan back from the goal, agree contracts and review the results, and whether it works depends on designing it around the goal, not the org chart.

## Analogy

The company summer party for 200 employees across five offices.

- In the loop: you lead freelancers and approve each step.
- On the loop: your team runs it, and you read reports and step in when needed.
- Out of the loop: an all-inclusive agency delivers it, and you only see the result.
- The party date is the goal you plan backwards from; the venue's kitchen is an external dependency; "31 vegetarian" handed from Food & drinks to the venue's kitchen is a contract at the seam, and it needs a definition.
- Guests travel from five offices: everyone shares the destination, the arrival time and a travel budget, but nobody prescribes car, train or carpool, which is a contract on the goal, not the process.

## Constraints

- Stands alone: the first Episode of the series, so no Slide relies on or links back to another Episode.
- A manager's view: what people and organisations need to work with agents, with no tools or code, plus one or two Slides of general tips for building a lean, AI-native workflow.
- Term first, analogy second: every Slide states the correct term and its factual claim first, with a cited definition where it introduces a term; the summer party lives in the visuals and appears in words only as a secondary example.
- One example world: the summer party throughout, guests travelling there included; the transformation story is told without naming the company or team.
- Humour on the situation, never on a profession.
- Slide 1's question stays open: the Episode answers it step by step from different angles. Each of Slide 1's four failures sits at a seam between two cards, where a fact one card held never reached the other; Slide 7 resolves the two that break "gets home safely", Slides 8 and 9 one each that breaks "celebrates together", and Slide 12 collects the answers.

## Slides

### A thought experiment

1. **The thought experiment** — carries the Hook: four excellent freelancers plan the summer party (Activities, Travel, Venue, Food & drinks); they never meet and can only leave notes on a shared board. Each meets its own goal perfectly, and the sum still fails. The question to the audience: what do you, as the manager, need to do so the result still comes out great? It stays open; the Episode answers it step by step from different angles, and Slide 12 collects the answers. _Visual:_ four ticked cards added up, plus by plus, to "= Party, 20 June ✗"; each card carries one failure at a seam with another card, labelled with the half of the goal it breaks: Activities books sporty team-building, paintball, while Travel booked an accessible bus for ten wheelchair users, who sit it out (together; Slide 9); Travel has everyone carpool at no extra cost, while Food & drinks booked an open bar until 01:00, so the drivers have been drinking (safely; Slide 7); Venue finds somewhere scenic and within budget, an alpine hut at 1,800 m, while Travel's guest info gives only route and times, so guests arrive in summer clothes for 6 °C at night (safely; Slide 7); Food & drinks orders dinner for 200 with "31 vegetarian" from the hut's kitchen, which reads vegetarian the Western way and serves egg dishes the Indian colleagues can't eat (together; Slide 8).
2. **Now with agents** — AI speeds up the doing, but it can't add context nobody gave it; in the Voice script, an agent fills a gap with a plausible guess instead of asking. _Visual:_ Slide 1's board replayed with agent badges on the four cards and every ticked card stamped "2 min" instead of "2 weeks"; the same four failures in the same places, reached faster. _Research:_ 1

### What an agentic workflow is

3. **What an agent is** — the term the workflow builds on: an agent is a language model that uses tools in a loop and decides for itself how to reach a goal (Anthropic, Building effective agents); its Speaker note carries that definition, cited. _Visual:_ the AI capability Explorable with the Agents column lit (a new Preset), its scene playing the agent's loop; the Explorable keeps its own look, a deliberate exception to Board. _Research:_ 2
4. **What an agentic workflow is** — the definition after IBM and Salesforce: structured processes in which AI agents make decisions, take actions and coordinate tasks with minimal human intervention. It works on two levels: you design the path of tasks and handoffs, and the agent steers inside its task. How minimal the intervention is stays open for Slides 5 and 6. _Visual:_ the human-in-the-loop Explorable with its summer-party Workflow: the path of tasks and handoffs towards the party is what you design, and each step is what an agent steers. _Research:_ 3, 4

### How far you step out

5. **In, on or out of the loop** — the three levels of human oversight, from military and aviation automation, each defined in one plain line (after Losing Humanity, 2012): in, the agent acts only after a person approves; on, it acts on its own while a person watches and can step in; out, it acts without any person, who sees only the result. Oversight is chosen per task, which answers the "minimal intervention" left open on Slide 4. _Visual:_ the three levels as stacked bands, risk rising towards _in_ and speed towards _out_, each with its role (in: the gatekeeper approves; on: the pilot watches and steps in on exceptions; out: the auditor checks the logs afterwards) and a party task as its example; inspired by the risk traffic light and the spectrum of autonomy in `.scratch/what-agentic-workflows-require/spec/inspiration/`. _Research:_ 5, 12
6. **Reviewability sets the distance** — the level is set by the task's risk, what a wrong result can do, and by how well the result can be checked: you can only step out of the loop as far as you can check it, and making a task checkable is what moves it out. _Visual:_ an axis from in to out with the party tasks placed on it; the activity starts at _in_ (paintball, Slide 1) and slides to _on_ once it gets a check it can pass: everyone can join, wheelchair access, no fitness needed. _Research:_ 6, 12

### What it requires of each person

7. **Plan back from the goal** — backward reasoning, defined first: start from the goal and work back to the steps that must come before it, breaking the goal into subgoals until it reaches where you stand today; state the goal as an outcome, tell dependencies inside your control from those outside it, and find the tasks nobody owned. A call-out names it as a well-known project-management principle, the backward pass of the Critical Path Method, and notes that agents do better when given a clearly defined goal and outcome. Resolves Slide 1's drinking drivers and cold guests. _Visual:_ the board read right to left from the goal note "20 June: everyone celebrates together and gets home safely"; working back from "gets home safely" adds what Slide 1 never had: a shuttle back after the open bar, and "bring warm clothes, 6 °C at night" in the guest info. _Research:_ 7, 13, 14
8. **Contracts at the seams** — design by contract, defined first after Meyer: cooperation rests on contracts that state each party's obligations and benefits; agree what each task receives and delivers, not how it is done inside. Resolves Slide 1's egg dishes: the fact travelled, but the word meant something else on each side. _Visual:_ the Food & drinks → venue kitchen seam zoomed, with its contract card — Receives: 200 guests, 31 vegetarian, defined as no meat, fish or eggs; Delivers: dinner for 200 at 19:00; Checked by: the menu against the definition — and below it "how: the kitchen's choice". _Research:_ 8
9. **Reviewing the result** — verification and validation (Boehm): check the result against its contract, then against the goal; the second check is the human part, and it is what lets you step further out. Resolves Slide 1's paintball. _Visual:_ the paintball note checked twice — against its contract: activity for 200 ✓, within budget ✓, on 20 June ✓; against the goal, "everyone celebrates together": ✗, ten colleagues use wheelchairs, as Travel's accessible bus already said. _Research:_ 9

### What it requires of the organisation

10. **The org chart trap** — Conway's law (1968): a workflow people design copies how they communicate and work today; told through the transformation story, unnamed, where a team's draft AI workflow gave one discipline fourteen discovery steps. _Visual:_ the party committee's org chart — ten venue scouts, one caterer, one travel planner — beside its draft workflow, with fourteen venue-scouting steps and one catering step, column heights matching the headcount; a callback to Slide 1's five columns. _Research:_ 10
11. **Designed AI first** — general tips for a lean, AI-native workflow: design from the goal and its measurable outcome, not from today's roles; put a contract on every milestone and leave the inside of each step free; cut seams, merging steps that produce nothing reviewable. Pays off the "get them talking" answer: you didn't need more meetings, you needed contracts. _Visual:_ Slide 10's board redrawn around the goal, with fewer notes and a contract on every arrow, the three tips beside it.
12. **What to look for in your team** — lands the Learning goal and answers Slide 1's question, "What did you need to do?": the skills to build in each person, each tied to the failure it fixed (break the work down from the goal → the drinking drivers and the cold; write contracts at the seams → the egg dishes; review against the contract and the goal → paintball), and what the organisation must provide (clear goals, contracts between teams, a policy on oversight per task, workflows designed around the goal, not the org chart). _Visual:_ Slide 1's question as the heading, and two short columns on the board, one for each person and one for the organisation. _Research:_ 11
13. **From article to quiz** — the wrap-up: one whole agentic workflow end to end, turning any knowledge article, a PDF or a URL, into a quiz, with each step set in, on or out of the loop and a contract at every handoff; it recaps the Actionables. _Visual:_ the human-in-the-loop Explorable; it runs the summer-party Workflow until the quiz Workflow is authored separately.

## Research questions

1. Why can an AI agent not supply organisational context it was never given? (existing: LLM-0005)
2. Why is an agent defined as a language model that uses tools in a loop and decides for itself how to reach a goal? (existing: LLM-0018)
3. Why do IBM and Salesforce define agentic workflows as structured processes in which AI agents make decisions, take actions and coordinate tasks with minimal human intervention?
4. Why does Anthropic separate workflows, which follow paths fixed in advance, from agents, which steer their own process?
5. Why do human in, on and out of the loop name three distinct levels of oversight? (existing: LLM-0024)
6. Why does how well a result can be checked limit how far human oversight can be reduced? (partial: AIE-0005)
7. Why does backward reasoning, working back from the goal, find the steps and dependencies a plan needs (Pólya, AI planning)?
8. Why does design by contract, agreeing what each party receives and delivers, make handoffs reliable without prescribing how the work is done (Meyer, Applying "Design by Contract", 1992)?
9. Why does checking a result against its specification (verification) not show whether it serves the goal (validation), after Boehm?
10. Why do the workflows an organisation designs copy its communication structure, as Conway's law states for systems "defined broadly"? (partial: SWE-0001)
11. Why are breaking work down, writing handoffs and reviewing results the skills people need to work with agents? (partial: AIE-0006, AIE-0018)
12. Why do in, on and out of the loop come from military and aviation automation, and why does a task's risk, what a wrong result can do, decide which level it gets? (partial: LLM-0024, AIE-0024)
13. Why is planning back from the goal a well-known project-management principle, as in the backward pass of the Critical Path Method?
14. Why do AI agents perform better when given a clearly defined goal and outcome?

## Open ideas

- Episode title alternatives: "What agentic workflows require" (the working title), "Everyone delivered, nothing added up", and "Agentic workflows: designed around the goal, not the org chart".
- Thought experiment alternatives: an empty board with a row of agents and the question "What do you give them first?"; you as the manager with five new hires on Monday; twenty amnesiac freelancers arriving tomorrow; capable people at desks at 8 a.m.; two weeks off-grid. Different languages as the reason the freelancers don't talk was rejected: it points to a translator as the fix.
- Failures not chosen for Slide 1: the last train at 22:30 and guests arriving at 4 p.m. for a 2 p.m. programme (too easy, rarely a seam); halal food as the dietary case; five offices partying side by side (unrealistic: the brief says one party); the venue allows only its own caterer while the caterer arrives with 200 meals (a second seam failure, a spare example for Slide 8); the invitation says "bring swimwear" for a closed lake. Headcount failures are out: everyone's note says 200.
- Slide 2 alternatives: one note zoomed on the agent's confident guess; fifty agents and multiplying seams.
- Slide 4: "plan, act, check" as the label of the agent's loop, replaced by "uses tools in a loop" to keep one term; option C, Slide 1's columns rewired before and after.
- Slide 5 alternatives: the same board three times; three boards collapsing into one tagged board.
- Slide 6: merging the reviewability axis into Slide 5.
- Slide 9: review as a trust ladder, each passed review moving a task one step further out, for the Voice script.
- Slide 10: the real team (one product manager, ten UX designers, two developers, one quality engineer) shown as headcount bars, rejected for the one-world Constraint and the risk of humour on a profession.
- Shirky principle (institutions preserve the problem they solve) as the motive behind the transformation story, beside Conway's law for its shape.
- Slide 11 tips not chosen: choose in, on or out per task by how well it can be checked (repeats Slide 5); let the people who own the goal draw the workflow, not each discipline its own column (repeats Slide 10).
- A Voice script line for Slide 7: language models plan worse backwards than forwards (arXiv 2411.01790), so working back from the goal is a skill people bring; it would need its own research question.
- Worlds considered: a follow-up expedition campaign after the skills Episode, a kitchen renovation, a Mars rover, a newsroom, a film shoot, a modular house, the Apollo programme; the summer party won because the audience knows it and Slides can be reused.
- Check the style of any Slides reused from earlier Episodes against Board.
- Hands-on for the workshop (one to one and a half hours, not settled): plan a narrow team event or Christmas party as an agentic workflow; the HITL Explorable's project-plan Workflow as an anchor.
- The Hook is a deliberate callback to Theory 1's Hook about building the wrong swing faster.
- Lesson for the skills Episode: too much of its wording is about the analogy; terms should come first there too.
- Hook alternatives: "Everyone did exactly what they were asked, and the result still missed the point. AI just gets you there faster." and "Every step was done perfectly, and the goal was still missed. AI only gets you there sooner."
- Learning goal alternatives: "Explain what an agentic workflow is, and what individuals and organisations need to build one that is AI native rather than a copy of the org chart."
