---
type: dossier
title: What agentic workflows require of people and organisations
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-14T12:18:28Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-14T12:12:11Z
  - by: process:markdown-harness
    at: 2026-11-14T12:18:28Z
---

# What agentic workflows require of people and organisations {#everyone-delivered-nothing-added-up}

## A thought experiment {#a-thought-experiment}

#### Voice script

1. **Imagine the board** — Imagine you are the manager of a summer party for 200 colleagues from five offices, and you have hired five excellent freelancers in five different cities to plan it. They never meet and they never call each other, because the only thing they share is a board where everyone leaves notes.

### The thought experiment {#the-thought-experiment}

#### Visual

master: basic-page · motion: local

The party board with five columns: venue, travel, catering, invitations, budget. Each note ticks off one after another, and when all are ticked, three red marks appear on the board: the last train at 22:30 from a venue 40 km out while the party runs to 1 a.m., guests arriving at 4 p.m. for a programme that starts at 2, and paintball for 200 while ten colleagues use wheelchairs. The marks stay unexplained; later Slides resolve each one.

#### Speaker notes

1. **A real version of the board** — Anthropic's lead agent gave its subagents vague task descriptions, and they duplicated each other's searches and left gaps until each task carried an objective, an output format, tool guidance and boundaries; one team's account of its own system, not a controlled comparison [1].
   - sources: [1] Anthropic, How we built our multi-agent research system — https://www.anthropic.com/engineering/multi-agent-research-system

#### Voice script

1. **Everyone delivered** — Every freelancer delivers exactly what their note asked for. The venue is booked, the trains are booked, the caterer is booked, the invitations are out and the budget is kept, so every note on the board is ticked.
2. **None of it adds up** — And the party still fails. The last train leaves before the party ends, the guests arrive two hours after the programme has started, and the activity excludes ten of your colleagues. Each step was perfect, and perfect steps do not add up on their own.
3. **Your question** — So here is the question I want you to carry through this Episode: what do you, as the manager, need to do so that the result still comes out great? Hold on to it, because we answer it one angle at a time, and the last Slide collects the answers.

### Now with agents {#now-with-agents}

#### Visual

master: basic-page · motion: local

Slide 1's board replayed with an agent badge on each of the five columns. Every ticked note is stamped "2 min" instead of "2 weeks", and the same three failures appear, reached faster.

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

1. **Speed, not context** — Now give the same five notes to agents. AI makes the doing fast, but it cannot add context that nobody gave it, so the speed helps with everything except the gaps.
2. **Plausible guess** — When an agent meets a gap, it does not stop and ask you, it fills the gap with a plausible guess and carries on. That is why the same three failures show up again, only now they arrive in two minutes instead of two weeks.
3. **Earlier Episodes** — If you have seen the earlier Episodes, you know this one: it is the amnesiac freelancer, except that now there are five of them and no meeting between them.

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
2. **Earlier Episodes** — You met this in the earlier Episodes, so I will not rebuild it here. What matters for the workflow is one consequence: because the agent steers its own steps, you cannot assume it takes the steps you would have taken.

### What an agentic workflow is {#what-an-agentic-workflow-is-slide}

#### Visual

master: basic-page · motion: none

The party board with the goal note on the right and task notes chaining towards it. Each arrow is labelled with what it hands over, and each note is marked person or agent. The path is labelled "You design this", and one zoomed agent note is labelled "The agent steers this".

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

The three definitions as a legend beside one party board, each note tagged: guest list out, venue on, activity in.

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

#### Voice script

1. **In** — In the loop means the agent acts only after a person has approved. Think of the activity for the party: nothing is booked until you say yes.
2. **On** — On the loop means the agent acts on its own while a person watches and can step in. The venue works like this, you read the reports and you intervene when something looks wrong.
3. **Out** — Out of the loop means the agent acts without any person, who sees only the result. The guest list can work like this, because you are happy to receive the finished list and move on.
4. **Per task** — So you choose per task, not per company. Minimal intervention stops being a vague promise and becomes a setting that you choose, task by task.

### Reviewability sets the distance {#reviewability-sets-the-distance}

#### Visual

master: basic-page · motion: local

An axis from in to out with the party tasks placed on it. The activity note starts at in (paintball, Slide 1) and slides along the axis to on once it carries a check it can pass: everyone can join, wheelchair access, no fitness needed.

#### Speaker notes

1. **Software is easy to check** — "Software is unusually amenable to supervisory oversight because the outputs can be tested"; where checking needs the expertise that producing took, trust may build more slowly [9].
   - sources: [9] Anthropic, Measuring AI agent autonomy in practice (18 Feb 2026) — https://www.anthropic.com/research/measuring-agent-autonomy
2. **Vigilance is no check** — complacency and automation bias occur in naive and expert people and are not removed by training or instructions, so the check must be built into the result [3].
   - sources: [3] Parasuraman and Manzey, Complacency and Bias in Human Use of Automation: An Attentional Integration (Human Factors 52(3), 2010) — https://doi.org/10.1177/0018720810376055
3. **Level is a design choice** — the level of automation is set per function, judged by human performance consequences and the cost of errors, which is why a task may stay in for reasons other than checkability [2].
   - sources: [2] Parasuraman, Sheridan, Wickens, A Model for Types and Levels of Human Interaction with Automation (IEEE Trans. SMC-A 30(3), 2000) — https://doi.org/10.1109/3468.844354

#### Voice script

1. **The rule** — You can step out of the loop only as far as you can check the result. Where checking costs as much as doing the work yourself, stepping out does not save you anything, it only means you accept a risk that nobody looks at.
2. **Hypothesis, said openly** — I want to be straight with you about this rule: it is my hypothesis, a synthesis of several sources, and no study tests it as one claim. The evidence also comes mostly from software, so treat it as a good bet and not as a law.
3. **Make it checkable** — That makes the check the lever you control. Give the activity a test it can pass, such as everyone can join, wheelchair access, no fitness needed, and the same task can move from in the loop to on the loop.

## What it requires of each person {#what-it-requires-of-each-person}

#### Voice script

1. **Three skills, three failures** — Back to the board. Each of the three failures comes from a skill that was missing in a person, and each of those skills has a name.

### Plan back from the goal {#plan-back-from-the-goal}

#### Visual

master: basic-page · motion: none

The board read right to left from the goal note "20 June: everyone celebrates together and gets home safely". Working back from "gets home safely" adds a note Slide 1 never had, the shuttle back, and the train timetable is marked as an external dependency.

#### Speaker notes

1. **Pappus and Pólya** — analysis starts from what is required, takes it for granted, and asks from what antecedent it could be derived, until it reaches something already known; Pólya's entry calls it "working backwards" [1].
   - sources: [1] Pólya, How to Solve It (1945), entries Pappus and Working backwards — https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf
2. **Regression in planning** — in AI planning, each backward step adds the action's preconditions to the goal, and each precondition is a dependency the plan needs [2].
   - sources: [2] Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed., chapter 11 Planning — https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf
3. **Fewer actions to consider** — backward search considers only relevant actions; in the textbook air cargo problem about 1000 actions lead forward and 20 work backward, for that one problem only [2].
   - sources: [2] Russell and Norvig, Artificial Intelligence: A Modern Approach, 2nd ed., chapter 11 Planning — https://aima.cs.berkeley.edu/2nd-ed/newchap11.pdf
4. **It feels wrong** — Pólya notes a psychological difficulty in turning around and not following the direct path to the end [1].
   - sources: [1] Pólya, How to Solve It (1945), entries Pappus and Working backwards — https://www.hlevkin.com/hlevkin/90MathPhysBioBooks/Math/Polya/George_Polya_How%20to%20Solve%20It.pdf

#### Voice script

1. **Start at the goal** — Start with the goal and work backwards. Backward reasoning is a plain-language name for something Pólya calls working backwards and AI planning calls regression. You ask what must be true just before the goal, then what must be true before that, and you repeat until you arrive at where you stand today.
2. **State the outcome** — Write the goal as an outcome and not as an activity. Not book a venue, but everyone celebrates together and gets home safely, because an outcome tells you when you are done and an activity does not.
3. **Outside your control** — Then sort the dependencies into the ones you control and the ones you do not. The train timetable is not yours, so you plan around it instead of pretending you can change it.
4. **The task nobody owned** — Working back from getting home safely, you find the shuttle, the task that nobody owned on the first board. I should say that this is my inference: the sources show that working backwards finds the dependencies, and I am adding that it also finds the orphaned tasks.

### Contracts at the seams {#contracts-at-the-seams}

#### Visual

master: basic-page · motion: none

The travel to programme seam zoomed, with its contract card: Receives: five offices, venue address, budget per person. Delivers: everyone at the venue by 13:30. Checked by: arrival list against the programme start. Below it a line: "how: car, train or carpool, your choice".

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
3. **Leave the how open** — Notice what the contract leaves out: how the work is done. Travel owes everyone at the venue by half past one, and whether they come by car, train or carpool is their choice. That the how stays open is my reading, Meyer does not say it in these words.
4. **The arrival time** — And the four o'clock arrival? Nobody owned the arrival time at the seam between travel and programme. With a contract, travel owes it and programme can rely on it, so the failure cannot happen quietly.

### Reviewing the result {#reviewing-the-result}

#### Visual

master: basic-page · motion: none

The paintball note checked twice. Against its contract: activity for 200 ticked, within budget ticked, on 20 June ticked. Against the goal "everyone celebrates together": crossed, because ten colleagues use wheelchairs.

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

The party committee's org chart, with ten venue scouts, one caterer and one travel planner, beside its draft workflow, which has fourteen venue-scouting steps and one catering step. The column heights match the headcount, a callback to Slide 1's five columns.

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

1. **The answer** — So what did you need to do? You needed three skills in your people, and each one fixes exactly one failure from the board.
2. **Break down** — Break the work down from the goal, and the last train has an owner.
3. **Write contracts** — Write the contract at the seam, and the four o'clock arrival cannot happen.
4. **Review twice** — Review against the contract and against the goal, and the paintball does not go ahead.
5. **The organisation** — The organisation has its own part: clear goals, contracts between teams, a policy on how much oversight each task gets, and workflows designed around the goal and not around the org chart.
6. **Look at your team** — Now look at your team. Who can break work down, who writes a clear handoff, and who can review an agent's result? Those are the skills to build, and in my view they are where your effort pays off first, though no study has measured that as a set.
7. **Take one process** — And before Monday, do the smallest version of all of this. Pick one recurring process in your team, mark which steps an agent could run, and decide for each whether a person stays in, on or out of the loop.

## Material left out

The Brief's open ideas stay out: the Shirky principle, the arXiv 2411.01790 line on backward planning (it needs its own research question), and the hands-on workshop.
