---
type: dossier
title: What agentic workflows require of people and organisations
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-14T15:03:59Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-14T15:03:59Z
---

# What agentic workflows require of people and organisations {#everyone-delivered-nothing-added-up}

## A thought experiment {#a-thought-experiment}

#### Voice script

1. **Imagine the board** — NEEDS REWRITE (write-voice-script): four freelancers, four cards. Imagine you are the manager of a summer party for 200 colleagues from five offices, and you have hired four excellent freelancers to plan it, one each for Activities, Travel, Venue and Food and drinks. They never meet and they never call each other, because the only thing they share is a board where everyone leaves notes.

### The thought experiment {#the-thought-experiment}

#### Visual

master: basic-page · motion: local

The party board with four cards, one per freelancer: Activities, Travel, Venue, and Food & drinks. Each card ticks off in turn, and the ticks add up, plus by plus, to "= Party, 20 June ✗". Each card carries one failure at a seam with another card, labelled with the half of the goal it breaks.

Activities booked paintball, while Travel booked an accessible bus for ten wheelchair users, who sit it out (breaks "together"; Slide 9 resolves it). Travel has everyone carpool at no extra cost, while Food & drinks booked an open bar until 01:00, so the drivers have been drinking (breaks "safely"; Slide 7). Venue found somewhere scenic and within budget, an alpine hut at 1,800 m, while Travel's guest info gives only route and times, so guests arrive in summer clothes for 6 °C at night (breaks "safely"; Slide 7). Food & drinks ordered dinner for 200 with "31 vegetarian" from the hut's kitchen, which reads vegetarian the Western way and serves egg dishes the Indian colleagues can't eat (breaks "together"; Slide 8).

The marks stay unexplained; later Slides resolve each one, and Slide 12 collects the answers.

#### Speaker notes

1. **A real version of the board** — Anthropic's lead agent gave its subagents vague task descriptions, and they duplicated each other's searches and left gaps until each task carried an objective, an output format, tool guidance and boundaries; one team's account of its own system, not a controlled comparison [1].
   - sources: [1] Anthropic, How we built our multi-agent research system — https://www.anthropic.com/engineering/multi-agent-research-system

#### Voice script

1. **Everyone delivered** — NEEDS REWRITE (write-voice-script): four cards ticked, every freelancer met their own goal perfectly.
2. **None of it adds up** — NEEDS REWRITE: the four failures at the seams, each told in one line (paintball and the accessible bus, open bar and the drivers, alpine hut and summer clothes, vegetarian and the egg dishes); perfect steps do not add up on their own.
3. **Your question** — NEEDS REWRITE: what do you, as the manager, need to do so the result still comes out great; one tempting answer is to get them talking, more meetings; the question stays open and Slide 12 collects the answers.

### Now with agents {#now-with-agents}

#### Visual

master: basic-page · motion: local

Slide 1's board replayed with an agent badge on each of the four cards, Activities, Travel, Venue and Food & drinks. Every ticked card is stamped "2 min" instead of "2 weeks", and the same four failures appear in the same places, reached faster.

#### Speaker notes

1. **A model can learn from public text alone** — the LLaMA authors set out to show state-of-the-art models can be trained using publicly available datasets exclusively [1].
   - sources: [1] Touvron et al., LLaMA: Open and Efficient Foundation Language Models — https://arxiv.org/abs/2302.13971
2. **Customer conversations are not training data** — Anthropic states that by default it does not use inputs or outputs of its commercial products for training, so a company's internal processes, decisions and naming are mostly absent from what a model learned [5].
   - sources: [5] Anthropic, Is my data used for model training? (commercial products) — https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training
3. **Rare facts are learned poorly** — accuracy on a fact question tracks how many training documents mention it, so even a fact that is in the data is weak when it is rare [2].
   - sources: [2] Kandpal et al., Large Language Models Struggle to Learn Long-Tail Knowledge — https://arxiv.org/abs/2211.08411
4. **The context must be supplied** — the retrieval literature's remedy is to pair the model with a searchable memory consulted at request time, which is why organisational knowledge has to arrive with the request [4].
   - sources: [4] Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — https://arxiv.org/abs/2005.11401

#### Voice script

1. **Speed, not context** — NEEDS REWRITE (write-voice-script): the same four cards given to agents; AI speeds up the doing, it cannot add context nobody gave it.
2. **Plausible guess** — NEEDS REWRITE: an agent fills a gap with a plausible guess instead of asking; the same four failures, in two minutes instead of two weeks.

## What an agentic workflow is {#what-an-agentic-workflow-is}

#### Voice script

1. **Name the thing** — Before we fix the board, we need two terms to stand on. What is an agent, and what makes a workflow agentic? Term first, then the board.

### What an agent is {#what-an-agent-is}

#### Visual

master: basic-page · motion: local

title: What an agent is

The AI capability Explorable with the Agents column lit, a new Preset, its scene playing the agent's loop of acting with tools and reading the result; the Explorable keeps its own look, a deliberate exception to the Board style.

#### Speaker notes

1. **Anthropic's definition** — agents are systems where LLMs dynamically direct their own processes and tool usage, keeping control over how they accomplish tasks [6].
   - sources: [6] Anthropic, Building effective agents — https://www.anthropic.com/engineering/building-effective-agents
2. **A shorter form** — "An LLM agent runs tools in a loop to achieve a goal", with a stopping condition [7].
   - sources: [7] Willison, I think "agent" may finally have a widely enough agreed upon definition — https://simonwillison.net/2025/Sep/18/agents/

#### Voice script

1. **Model, tools, loop** — An agent is a language model that uses tools in a loop and decides for itself how to reach a goal. It is not a single chat answer you read and move on from, it is a loop of acting, looking at the result and acting again until it believes it is done.
2. **Steers its own steps** — NEEDS REWRITE (write-voice-script): this Episode starts from cold, so say what an agent is without relying on earlier Episodes; because the agent steers its own steps, you cannot assume it takes the steps you would have taken; the definition is cited in the Speaker notes.

### What an agentic workflow is {#what-an-agentic-workflow-is-slide}

#### Visual

master: basic-page · motion: none

The human-in-the-loop Explorable with its summer-party Workflow ("Plan a summer party"); it keeps its own look, a deliberate exception to the Board style. It shows four stages, Plan, Requirements, Research and Page, as a path of tasks with handoffs towards the party: "AI grills you" (a plan of epics), "Grill the epic" (requirements and tickets, checked by a second chat), "Chat" (one fresh chat per ticket, research with sources) and "Gather the note", then "Make the page". Two gates mark where a person signs off: after Requirements ("You sign off") and after Page. The path of tasks and handoffs is labelled "You design this"; one step, zoomed, is labelled "The agent steers this".

#### Speaker notes

1. **IBM's wording** — "Agentic workflows are AI-driven processes where autonomous AI agents make decisions, take actions and coordinate tasks with minimal human intervention." [1]
   - sources: [1] Gutowska and Stryker (IBM), What are Agentic Workflows? — https://www.ibm.com/think/topics/agentic-workflows
2. **Salesforce's wording** — "Agentic workflows are structured processes where AI agents make decisions, solve problems, and perform tasks with minimal human input." The word "structured" is Salesforce's; "coordinate tasks" is IBM's. The Slide's sentence merges the two and belongs to neither vendor [2].
   - sources: [2] Salesforce, What Are Agentic Workflows? — https://www.salesforce.com/agentforce/agentic-workflows/
3. **Why the vendors stress autonomy** — both sell agent platforms and praise reduced oversight; that this explains their wording is an inference, the pages give no reason [1].
   - sources: [1] Gutowska and Stryker (IBM), What are Agentic Workflows? — https://www.ibm.com/think/topics/agentic-workflows
4. **Two levels of control** — Anthropic draws the line at who controls the steps: workflows are orchestrated through predefined code paths, agents direct their own process. Applying "you design the path, the agent steers inside its task" to a team's process is an inference [3].
   - sources: [3] Anthropic, Building effective agents — https://www.anthropic.com/engineering/building-effective-agents
5. **Autonomy as a degree** — Ng prefers to call systems agent-like to different degrees, with a gray zone, over a binary [4].
   - sources: [4] Andrew Ng, The Batch issue 253 (letter on agentic workflows) — https://www.deeplearning.ai/the-batch/issue-253/

#### Voice script

1. **The definition** — An agentic workflow is a process in which agents, not people, take the decisions and do the tasks, within a structure you set. The exact wording and where it comes from are in the Speaker notes.
2. **Two levels** — Read it as two levels. On the first level you design the path, which means the tasks and what each task hands over to the next. On the second level the agent steers inside its own task, and that is the part you hand away.
3. **Minimal, how minimal** — Notice the phrase minimal human intervention, because it carries a lot of weight and says very little. How minimal, and for which task? That is what the next Section answers.

## How far you step out {#how-far-you-step-out}

#### Voice script

1. **Open question** — The definition left one thing open, which is how much of a person stays in the workflow. That is not one setting for the whole company, it is a choice you make for each task, and it is the next thing to learn.

### In, on or out of the loop {#in-on-or-out-of-the-loop}

#### Visual

master: basic-page · motion: none

The three levels as stacked bands, risk rising towards in and speed towards out. Each band holds its one-line definition, its role and a party task as its example: in, the gatekeeper approves (booking the activity); on, the pilot watches and steps in on exceptions (the venue); out, the auditor checks the logs afterwards (the guest list). Design inspiration: the risk traffic light and the spectrum of autonomy in `.scratch/what-agentic-workflows-require/spec/inspiration/`.

#### Speaker notes

1. **Origin of the three terms** — the triad comes from a 2012 report on weapon autonomy: in the loop means force only with a human command, on the loop means under a human operator who can override, out of the loop means without any human input [1].
   - sources: [1] Human Rights Watch and Harvard IHRC, Losing Humanity (19 Nov 2012) — https://www.hrw.org/report/2012/11/19/losing-humanity/case-against-killer-robots
2. **Two senses of "on"** — the EU 2019 ethics guidelines define on the loop as intervening during design and monitoring operation, which differs from the military override sense used here; the guidelines have no out-of-the-loop term [3].
   - sources: [3] EU High-Level Expert Group on AI, Ethics Guidelines for Trustworthy AI (8 Apr 2019) — https://ec.europa.eu/newsroom/dae/document.cfm?doc_id=60419
3. **Approving to monitoring** — experienced users shift from approving individual actions to monitoring the agent and intervening when needed [8].
   - sources: [8] Anthropic, Measuring AI agent autonomy in practice (18 Feb 2026) — https://www.anthropic.com/research/measuring-agent-autonomy
4. **Out is a per-step property** — no source claims a person is out of the loop for a whole lifecycle; the humans move to specs and outcome checks [13].
   - sources: [13] Willison, How StrongDM's AI team build serious software without even looking at the code — https://simonwillison.net/2026/Feb/7/software-factory/
5. **Regulation limits out** — for high-risk uses, EU AI Act Article 14 requires that a person can override and stop the system [4].
   - sources: [4] EU AI Act (Regulation 2024/1689), Article 14 Human oversight — https://artificialintelligenceact.eu/article/14/
6. **Aviation supplied the concept, not the words** — Sheridan traces supervisory control to computers replacing direct manual control in aircraft, which left the person "in a new role of monitor and goal-constraint setter"; no source traces the words "in, on, out of the loop" to aviation, they come from the military policy above [1].
   - sources: [1] Sheridan, Human Supervisory Control (Handbook of Systems Engineering and Management, Wiley, 1999, ch. 16) — https://www.hlaszny.com/booksAndPapers/buckets/b3_handbookOfSysEng/Ch%2016%20Human%20Supervisory%20Control.pdf
7. **Levels are not a strict ladder** — the FAA warns that describing automation as a linear hierarchy of levels is difficult to apply operationally, and that responsibility for flightpath management stays with the pilots at all times; it concerns airline pilots, so carrying it to agents is an analogy [3].
   - sources: [3] FAA, Advisory Circular 120-123, Flightpath Management (21 Nov 2022) — https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_120-123.pdf

#### Voice script

1. **In** — In the loop means the agent acts only after a person has approved. Think of the activity for the party: nothing is booked until you say yes.
2. **On** — On the loop means the agent acts on its own while a person watches and can step in. The venue works like this, you read the reports and you intervene when something looks wrong.
3. **Out** — Out of the loop means the agent acts without any person, who sees only the result. The guest list can work like this, because you are happy to receive the finished list and move on.
4. **Borrowed terms** — NEEDS REWRITE (write-voice-script): where the three terms were borrowed from, in one plain line for the listener; fields where an automated action cannot be undone, so the person's role was designed on purpose.
5. **Per task** — So you choose per task, not per company. Minimal intervention stops being a vague promise and becomes a setting that you choose, task by task.

### Reviewability sets the distance {#reviewability-sets-the-distance}

#### Visual

master: basic-page · motion: local

An axis from in to out with the party tasks placed on it, and two things that set where a task sits: its risk, what a wrong result can do, and how well the result can be checked. The activity starts at in (paintball, Slide 1) and slides to on once it gets a check it can pass: everyone can join, wheelchair access, no fitness needed.

#### Speaker notes

1. **Software is easy to check** — "Software is unusually amenable to supervisory oversight because the outputs can be tested"; where checking needs the expertise that producing took, trust may build more slowly [9].
   - sources: [9] Anthropic, Measuring AI agent autonomy in practice (18 Feb 2026) — https://www.anthropic.com/research/measuring-agent-autonomy
2. **Vigilance is no check** — complacency and automation bias occur in naive and expert people and are not removed by training or instructions, so the check must be built into the result [3].
   - sources: [3] Parasuraman and Manzey, Complacency and Bias in Human Use of Automation: An Attentional Integration (Human Factors 52(3), 2010) — https://doi.org/10.1177/0018720810376055
3. **Level is a design choice** — the level of automation is set per function, judged by human performance consequences and the cost of errors, which is why a task may stay in for reasons other than checkability [2].
   - sources: [2] Parasuraman, Sheridan, Wickens, A Model for Types and Levels of Human Interaction with Automation (IEEE Trans. SMC-A 30(3), 2000) — https://doi.org/10.1109/3468.844354
4. **Oversight follows risk in the rules** — the EU AI Act requires oversight measures "commensurate with the risks, level of autonomy and context of use" of a high-risk system [5].
   - sources: [5] EU AI Act (Regulation 2024/1689), Article 14 Human oversight — https://artificialintelligenceact.eu/article/14/
5. **Risk as a tool rating** — OpenAI tells builders to rate each tool low, medium or high by factors such as read-only versus write access, reversibility and financial impact, and to trigger human oversight for sensitive, irreversible or high-stakes actions until confidence in the agent grows [8].
   - sources: [8] OpenAI, A practical guide to building agents — https://cdn.openai.com/business-guides-and-resources/a-practical-guide-to-building-agents.pdf
6. **Risk is one input, not the rule** — no source says risk alone decides the level; the aviation-derived model ranks the effect on human performance first and the cost of errors second, so combining risk and checkability into one per-task choice is a synthesis [2].
   - sources: [2] Parasuraman, Sheridan, Wickens, A Model for Types and Levels of Human Interaction with Automation (IEEE Trans. SMC-A 30(3), 2000) — https://doi.org/10.1109/3468.844354

#### Voice script

1. **The rule** — You can step out of the loop only as far as you can check the result. Where checking costs as much as doing the work yourself, stepping out does not save you anything, it only means you accept a risk that nobody looks at.
2. **Hypothesis, said openly** — The rule that you can step out only as far as you can check is my hypothesis, and I say so openly; the evidence for it comes mostly from software, so treat it as a good bet and not as a law.
3. **Risk too** — NEEDS REWRITE (write-voice-script): what a wrong result can do also sets the level; the more severe or irreversible, the more a person stays in.
4. **Make it checkable** — That makes the check the lever you control. Give the activity a test it can pass, such as everyone can join, wheelchair access, no fitness needed, and the same task can move from in the loop to on the loop.

## What it requires of each person {#what-it-requires-of-each-person}

#### Voice script

1. **Skills behind the failures** — NEEDS REWRITE (write-voice-script): back to the board; each of the four failures comes from a skill missing in a person, three skills in all, and each has a name.

### Plan back from the goal {#plan-back-from-the-goal}

#### Visual

master: basic-page · motion: none

The board read right to left from the goal note "20 June: everyone celebrates together and gets home safely". Working back from "gets home safely" adds what Slide 1 never had: a shuttle back after the open bar, and "bring warm clothes, 6 °C at night" in the guest info. The venue's kitchen is marked as an external dependency, outside your control. A call-out beside the board reads "Backward pass of the Critical Path Method, a well-known project-management principle" and "Agents do better with a clearly defined goal and outcome".

#### Speaker notes

1. **Pappus and Pólya** — analysis starts from what is required, takes it for granted, and asks from what antecedent it could be derived, until it reaches something already known; Pólya's entry calls it "working backwards" [1].
   - sources: [1] Pólya, How to Solve It (1945), entries Pappus and Working backwards — https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf
2. **Regression in planning** — in AI planning, each backward step adds the action's preconditions to the goal, and each precondition is a dependency the plan needs [2].
   - sources: [2] Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed., chapter 11 Planning — https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf
3. **Fewer actions to consider** — backward search considers only relevant actions; in the textbook air cargo problem about 1000 actions lead forward and 20 work backward, for that one problem only [2].
   - sources: [2] Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed., chapter 11 Planning — https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf
4. **It feels wrong** — Pólya notes a psychological difficulty in turning around and not following the direct path to the end [1].
   - sources: [1] Pólya, How to Solve It (1945), entries Pappus and Working backwards — https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf
5. **Project management does it too** — in the Critical Path Method, Kelley and Walker compute the latest time each event may occur "relative to a fixed project completion time"; neither this paper nor the NASA handbook uses the phrase "backward pass", which is later textbook vocabulary [1].
   - sources: [1] Kelley and Walker, Critical-Path Planning and Scheduling (Proceedings of the Eastern Joint Computer Conference, 1959) — https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf
6. **What the backward run gives** — a job whose maximum available time equals its duration is critical, because a delay in it delays the project; the method takes the jobs and dependencies as given and is not shown to find missing tasks, so that use here is an inference [1].
   - sources: [1] Kelley and Walker, Critical-Path Planning and Scheduling (Proceedings of the Eastern Joint Computer Conference, 1959) — https://mosaicprojects.com.au/PDF/PM-History_Critical_Path_Planning_&_Scheduling_Kelley_and_Walker_1959.pdf
7. **Scope starts at the end product** — the NASA handbook says a work breakdown structure begins with the end item and successively subdivides it, and calls it "a product-oriented structure, not an organizational structure" [2].
   - sources: [2] Sadler, NASA Work Breakdown Structure (WBS) Handbook (NASA/SP-20250006071) — https://www.nasa.gov/wp-content/uploads/2025/06/nasa-wbs-handbook.pdf
8. **Vendors say: clear goals** — Anthropic names the best-fit tasks for agents as those with clear success criteria and feedback loops, such as code that automated tests can verify; this is guidance, not a measurement [3].
   - sources: [3] Anthropic, Building effective agents — https://www.anthropic.com/engineering/building-effective-agents
9. **Missing detail costs accuracy** — models infer unstated requirements 41.1% of the time, prompts that omit requirements are twice as likely to regress when the model or prompt changes, and accuracy sometimes drops by more than 20% [7].
   - sources: [7] Yang et al., What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts — https://arxiv.org/abs/2505.13360
10. **Asking recovers it, and the limit** — on an underspecified coding benchmark, interacting to ask questions gained up to 74% over not asking, a ceiling and not an average; no source isolates a clear goal as a single variable, so the claim is that missing detail hurts and recovering it helps [5].
    - sources: [5] Vijayvargiya et al., Ambig-SWE: Interactive Agents to Overcome Underspecificity in Software Engineering — https://arxiv.org/abs/2502.13069

#### Voice script

1. **Start at the goal** — Start with the goal and work backwards. Backward reasoning is a plain-language name for something Pólya calls working backwards and AI planning calls regression. You ask what must be true just before the goal, then what must be true before that, and you repeat until you arrive at where you stand today.
2. **State the outcome** — Write the goal as an outcome and not as an activity. Not book a venue, but everyone celebrates together and gets home safely, because an outcome tells you when you are done and an activity does not.
3. **Outside your control** — NEEDS REWRITE (write-voice-script): sort the dependencies into inside and outside your control; the venue's kitchen is not yours, so you plan around it.
4. **The tasks nobody owned** — NEEDS REWRITE: working back from "gets home safely" finds the shuttle after the open bar and the warm-clothes line in the guest info, which resolves the drinking drivers and the cold guests.
5. **Well known, and agents like it** — NEEDS REWRITE: planning back from the goal is a well-known project-management principle, and agents do better with a clearly defined goal and outcome; hand the listener the verdict as a question.

### Contracts at the seams {#contracts-at-the-seams}

#### Visual

master: basic-page · motion: none

The Food & drinks to venue-kitchen seam zoomed, with its contract card. Receives: 200 guests, 31 vegetarian, defined as no meat, fish or eggs. Delivers: dinner for 200 at 19:00. Checked by: the menu against the definition. Below it a line: "how: the kitchen's choice".

#### Speaker notes

1. **A contract has two sides** — Meyer's model is the business contract: each party expects benefits and accepts obligations to obtain them, documented in a contract document [1].
   - sources: [1] Meyer, Applying "Design by Contract" (IEEE Computer, October 1992) — https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf
2. **Pre- and postcondition** — the precondition states what any call must satisfy, the postcondition what the call ensures in return; each condition belongs to exactly one party [1].
   - sources: [1] Meyer, Applying "Design by Contract" (IEEE Computer, October 1992) — https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf
3. **No defensive duplication** — either the condition is guaranteed by the client or handled by the supplier; checking everything on both sides adds complexity [1].
   - sources: [1] Meyer, Applying "Design by Contract" (IEEE Computer, October 1992) — https://pages.mtu.edu/~aebnenas/teaching/spring2010/cs3141/readings/meyerPDF.pdf
4. **Same split in Eiffel** — Eiffel Software defines a precondition as what must be true before a component is used and a postcondition as what it guarantees after execution [2].
   - sources: [2] Eiffel Software, Design by Contract — https://www.eiffel.com/values/design-by-contract/

#### Voice script

1. **Design by contract** — Design by contract, after Meyer, says that cooperation rests on contracts, and a contract states what each party receives and what it delivers. That sounds like software, but it is the most practical tool a manager has for a handoff.
2. **Receives, delivers, checked by** — So before you hand any task to an agent, write three lines. What it receives, what it must deliver, and how someone else can check the result. Do this for one task this week, before you hand it over.
3. **Leave the how open** — NEEDS REWRITE (write-voice-script): the contract leaves out how the work is done, the kitchen's choice; say it is the speaker's reading, Meyer does not say it in these words.
4. **The egg dishes** — NEEDS REWRITE: the fact "31 vegetarian" travelled, but the word meant something else on each side; with a definition (no meat, fish or eggs) and a check, the egg dishes cannot arrive quietly.

### Reviewing the result {#reviewing-the-result}

#### Visual

master: basic-page · motion: none

The paintball note checked twice. Against its contract: activity for 200 ticked, within budget ticked, on 20 June ticked. Against the goal "everyone celebrates together": crossed, because ten colleagues use wheelchairs, as Travel's accessible bus already said, a fact on another card that Activities never saw.

#### Speaker notes

1. **Two definitions** — Boehm defines verification as establishing the correspondence between a software product and its specification, and validation as establishing its fitness or worth for its operational mission [1].
   - sources: [1] Boehm, Guidelines for Verifying and Validating Software Requirements and Design Specifications (Euro IFIP 79) — https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf
2. **His two questions** — "Am I building the product right?" for verification and "Am I building the right product?" for validation [1].
   - sources: [1] Boehm, Guidelines for Verifying and Validating Software Requirements and Design Specifications (Euro IFIP 79) — https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf
3. **Where the fix lands** — a failed verification changes the product; a failed validation can change the requirements themselves [1].
   - sources: [1] Boehm, Guidelines for Verifying and Validating Software Requirements and Design Specifications (Euro IFIP 79) — https://mferchaves.wordpress.com/wp-content/uploads/2014/08/articulo_4.pdf
4. **Software practice, not agents** — NASA words the same pair as "Are we building the product right?"; applying it to work handed to an agent is an inference [3].
   - sources: [3] NASA, IV&V Overview — https://www.nasa.gov/ivv-overview/

#### Voice script

1. **Two checks** — Reviewing a result takes two checks that people often merge into one. Verification checks the result against its contract. Validation checks the result against the goal.
2. **Paintball passes** — The paintball note passes every line of its contract: an activity for 200, within budget, on the right day. And it still fails the goal, because the contract was right about what was asked and wrong about what was needed.
3. **The human part** — The second check is the human part, and it is the one that lets you step further out. When you are not watching, what you can trust is a result that has been checked against the goal, not only against the note.
4. **Your verdict** — So the next time an agent hands you a result that matches its task perfectly, ask yourself which of the two checks you have actually done.

## What it requires of the organisation {#what-it-requires-of-the-organisation}

#### Voice script

1. **From people to the company** — Skills in your people are not enough. The workflow they draw has a shape of its own, and that shape comes from the organisation they work in.

### The org chart trap {#the-org-chart-trap}

#### Visual

master: basic-page · motion: none

The party committee's org chart, with ten venue scouts, one caterer and one travel planner, beside its draft workflow, which has fourteen venue-scouting steps and one catering step. The column heights match the headcount, a callback to Slide 1's four cards.

#### Speaker notes

1. **The law as Conway states it** — "Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure" [6].
   - sources: [6] Melvin Conway, Conway's Law (author's page) — https://www.melconway.com/Home/Conways_Law.html
2. **Why it happens** — organising the team already makes design decisions, and two parts of a design can depend on each other only where their designers talked [1].
   - sources: [1] Melvin Conway, How Do Committees Invent? (Datamation, April 1968) — https://www.melconway.com/Home/Committees_Paper.html
3. **A tendency, not a rule** — a review of 142 empirical studies found mirroring a prevalent pattern but not universal: strong in 70% of industry and firm studies, absent in 56% of open collaborative projects [4].
   - sources: [4] Colfer and Baldwin, The mirroring hypothesis: theory, evidence, and exceptions (Industrial and Corporate Change, 2016) — https://dash.harvard.edu/server/api/core/bitstreams/7312037e-28a6-6bd4-e053-0100007fdf3b/content
4. **Components include tasks** — the same review defines the components of a technical system as all the tasks and decisions required to design, operate and maintain it [4].
   - sources: [4] Colfer and Baldwin, The mirroring hypothesis: theory, evidence, and exceptions (Industrial and Corporate Change, 2016) — https://dash.harvard.edu/server/api/core/bitstreams/7312037e-28a6-6bd4-e053-0100007fdf3b/content
5. **The first design is not the best** — Conway himself says the first design is almost never the best possible, so the organisation must stay flexible [1].
   - sources: [1] Melvin Conway, How Do Committees Invent? (Datamation, April 1968) — https://www.melconway.com/Home/Committees_Paper.html

#### Voice script

1. **Conway's law** — Conway's law, from 1968, in plain words: what people design follows who talks to whom. A workflow that people draw for themselves is a design too, so it does the same. The exact wording is in the Speaker notes.
2. **A team's draft** — I saw this with a team I worked with. They drew their AI workflow, and one discipline ended up with fourteen discovery steps while the others got one or two. The workflow mirrored the headcount, not the goal. I will not name the company or the team.
3. **Broadly defined** — Conway meant systems in a wide sense, but applying that to workflows is my inference, because nobody has measured it for workflows. It explains what I saw, though, and it gives you a test you can run.
4. **Your sign** — So if the workflow your people draw looks like your org chart, suspect Conway's law and redraw it from the goal. If you lead the transformation, that check is yours to make.

### Designed AI first {#designed-ai-first}

#### Visual

master: basic-page · motion: none

Slide 10's board redrawn around the goal, with fewer notes and a contract on every arrow, the three tips beside it: goal and measurable outcome, contract on every milestone, cut the seams.

#### Speaker notes

1. **Checkpoints in the path** — Anthropic's agent guidance has agents pause for human feedback at checkpoints or when encountering blockers [5].
   - sources: [5] Anthropic, Building effective agents — https://www.anthropic.com/engineering/building-effective-agents
2. **Contract-first decomposition** — a delegation framework makes delegation contingent on the outcome having precise verification, and splits a subtask further when its output is too costly or subjective to verify [2].
   - sources: [2] Tomašev, Franklin, Osindero (Google DeepMind), Intelligent AI Delegation — https://arxiv.org/abs/2602.11865
3. **Vague handoffs duplicate work** — Anthropic's research system produced duplicated work and gaps until each subagent had an objective, an output format, tool guidance and clear task boundaries [1].
   - sources: [1] Anthropic, How we built our multi-agent research system — https://www.anthropic.com/engineering/multi-agent-research-system

#### Voice script

1. **Start at the outcome** — Here are three tips for a lean workflow, and the first is to start from the goal and its measurable outcome, not from today's roles. The roles tell you who is available, and the outcome tells you what is needed.
2. **Contract on every milestone** — The second is to put a contract on every milestone and leave the inside of each step free. You decide what must arrive and how it is checked, and the person or the agent decides the rest.
3. **Cut seams** — The third is to cut seams. Every seam is a place where a gap can hide, so merge the steps that produce nothing anyone can review.
4. **Not more meetings** — Remember the question from the first Slide? One answer was to get them talking, to hold more meetings. You did not need more meetings, you needed contracts.

### What to look for in your team {#what-to-look-for-in-your-team}

#### Visual

master: grid-1x2 · motion: none

title: What did you need to do?

Slide 1's question as the heading, and two short columns on the board. One column holds the skills in each person, each tied to the failure it fixed. The other holds what the organisation must provide.

#### Speaker notes

1. **Management 101 skills** — "If you can explain what you need, give effective feedback, and design ways of evaluating work, you are going to be able to work with agents" [4].
   - sources: [4] Mollick, Management as AI Superpower (One Useful Thing, 27 January 2026) — https://www.oneusefulthing.org/p/management-as-ai-superpower
2. **Effort moves to steering and checking** — in a survey of 319 knowledge workers, critical thinking moved toward information verification, response integration and task stewardship [3].
   - sources: [3] Lee et al. (Carnegie Mellon, Microsoft Research), The Impact of Generative AI on Critical Thinking (CHI 2025) — https://www.microsoft.com/en-us/research/wp-content/uploads/2025/01/lee_2025_ai_critical_thinking_survey.pdf
3. **Evidence is indirect** — no source tests breaking work down, writing handoffs and reviewing results as a set, and none measures how many people can do them; that these are the skills to build is a synthesis [2].
   - sources: [2] Tomašev, Franklin, Osindero (Google DeepMind), Intelligent AI Delegation — https://arxiv.org/abs/2602.11865
4. **Juniors may not build them** — the narrow tasks through which juniors build judgement are those most likely to be offloaded to agents [2].
   - sources: [2] Tomašev, Franklin, Osindero (Google DeepMind), Intelligent AI Delegation — https://arxiv.org/abs/2602.11865

#### Voice script

1. **The answer** — NEEDS REWRITE (write-voice-script): so what did you need to do; three skills in your people, each tied to the failures it fixes.
2. **Break down** — NEEDS REWRITE: break the work down from the goal, and the drinking drivers and the cold guests have an owner.
3. **Write contracts** — NEEDS REWRITE: write the contract at the seam, and the egg dishes cannot happen.
4. **Review twice** — NEEDS REWRITE: review against the contract and against the goal, and the paintball does not go ahead.
5. **The organisation** — The organisation has its own part: clear goals, contracts between teams, a policy on how much oversight each task gets, and workflows designed around the goal and not around the org chart.
6. **Look at your team** — Now look at your team. Who can break work down, who writes a clear handoff, and who can review an agent's result? Those are the skills to build, and in my view they are where your effort pays off first.
7. **Take one process** — And before Monday, do the smallest version of all of this. Pick one recurring process in your team, mark which steps an agent could run, and decide for each whether a person stays in, on or out of the loop.

### From article to quiz {#from-article-to-quiz}

#### Visual

master: basic-page · motion: none

The human-in-the-loop Explorable, which keeps its own look, a deliberate exception to the Board style. It runs the summer-party Workflow until a quiz Workflow is authored separately; the quiz Workflow turns any knowledge article, a PDF or a URL, into a quiz. Each step carries its level, in, on or out of the loop, and a contract (receives, delivers, checked by) at every handoff.

#### Speaker notes

1. **Workflow and agent, two levels** — Anthropic separates workflows, orchestrated through predefined code paths, from agents that direct their own process; reading the quiz example as a path you design with steps the agent steers is an application of that split, not a claim the source makes [1].
   - sources: [1] Anthropic, Building effective agents — https://www.anthropic.com/engineering/building-effective-agents

#### Voice script

1. **One whole workflow** — keywords: one agentic workflow end to end, any knowledge article, a PDF or a URL, turned into a quiz; the path is yours to design, each step is the agent's to steer.
2. **In, on or out per step** — keywords: each step set in, on or out of the loop by its risk and how well the result can be checked (Actionable 1: pick a recurring process, mark the steps).
3. **A contract at every handoff** — keywords: what each step receives, delivers and how someone else checks it (Actionable 2).
4. **Designed around the goal** — keywords: start from the goal, not from today's teams (Actionable 3, Conway's law); who can break work down, write handoffs and review (Actionable 4); the recap of the four Actionables.

## Material left out

The Brief's open ideas stay out: the Shirky principle, the arXiv 2411.01790 line on backward planning (it needs its own research question), and the hands-on workshop.
