---
type: dossier
title: From shared understanding to shared context
status: draft
generated:
  by: claude-code/sonnet-5.5
  at: 2026-01-01T00:00:00Z
locale: en
brief: ./brief.md
---

# From shared understanding to shared context {#from-shared-understanding-to-shared-context}

## A thought experiment {#a-thought-experiment}

#### Voice script

1. **Imagine your organization as a line** — Second person, the Analogy first: imagine your own organization as a factory line, documents moving between work centres. Everyone here has lived the tire swing cartoon.
2. **Where this is going** — Name the route: what happens when every station gets AI, then what you hand the agent, then how an AI interview builds it for you.

### What the customer really wanted {#what-the-customer-really-wanted}

#### Visual

master: basic-page · motion: local

The factory Explorable, shown in three states one after another. First the tire swing cartoon, each station building its own version of the swing. Then a balanced factory line: work centres joined by transfer belts, storages and queues between them, a document icon as the unit moving through, constant input, steady output and high quality. Then the same line with the dials for efficiency, effectiveness and multiplication cranked up, where documents begin to queue at some stations and the line stops being balanced. Design reference: the Explorable lives on the unmerged branch `episode/software-ecology` and is still a prototype, so this describes what the Slide shows, not code.

#### Speaker notes

1. **Why the line gets out of balance** — DORA's 2025 report overview says AI's primary role is as an amplifier, magnifying an organization's existing strengths and weaknesses, and that the greatest returns come from a focus on the organizational system rather than the tools. It is an overview page; the report text was not read [1].
   - sources: [1] DORA, State of AI-assisted Software Development 2025 (overview page) — https://dora.dev/research/2025/dora-report/

#### Voice script

1. **The Hook** — AI doesn't produce the correct swing, but it can build the wrong one ten times faster.
2. **Cartoon to balanced line** — The cartoon turned into a factory line: balance, constant input, output, high quality. If this was how your organization worked.
3. **Reality** — Crank the dials, and you get a real organization: bottlenecks form. Hand over the verdict: which station is yours?

### What happens with AI {#what-happens-with-ai}

#### Visual

master: basic-page · motion: local

title: What happens when every station gets AI

The same Explorable with the AI dial turned up on every work centre. The stations run faster, and documents pile up in the queues in front of the stations that cannot keep pace, especially those that check the work.

#### Speaker notes

1. **Measured: the load moves to review** — on teams with high AI adoption, developers completed 21% more tasks and merged 98% more pull requests, while review time rose 91% and pull requests grew 154%; the report finds no significant company-level gain [1].
   - sources: [1] Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025) — https://www.faros.ai/blog/ai-software-engineering
   - target: the queues in front of the review station
2. **Engineers say the same** — Google engineers report that the time saved in creating is re-spent on auditing and verifying, and DORA reads this as work moving from authors to reviewers [1].
   - sources: [1] DORA, Balancing AI tensions — https://dora.dev/insights/balancing-ai-tensions/
3. **What is measured and what is inferred** — the shift to review is measured; the shift to specification is an inference from it, because no source shows unclear specifications limiting AI-sped output. It is correlational, vendor and self-reported data about software teams [1].
   - sources: [1] Faros AI, The AI Productivity Paradox Report 2025 (23 July 2025) — https://www.faros.ai/blog/ai-software-engineering

#### Voice script

1. **Every station faster** — AI accelerates each station, and the whole organization falls out of balance. You can see it in the market right now.
2. **Moving bottleneck** — Writing was the brake, that brake is gone. The cost did not vanish, it moved to the next station and compounds there.

### Speed the whole line can carry {#speed-the-whole-line-can-carry}

#### Visual

master: basic-page · motion: local

The factory Explorable with the line running at a higher speed and still balanced: queues short, every work centre keeping pace with the next. Held beside the previous Slide's pile-ups, so the viewer sees the difference.

#### Speaker notes

1. **Returns come from the system** — DORA's overview reports that the greatest returns from AI come from a strategic focus on the underlying organizational system, not the tools. This is an overview page, so treat it as a pointer [1].
   - sources: [1] DORA, State of AI-assisted Software Development 2025 (overview page) — https://dora.dev/research/2025/dora-report/

#### Voice script

1. **One fast station is not the goal** — A sustainable increase in overall productivity is a line that carries the speed everywhere, not one fast station.
2. **Bridge** — So what makes the stations keep pace? Whatever arrives at the first station. That is the requirement, and the next Section is about it.

## Every product is a translation {#every-product-is-a-translation}

#### Voice script

1. **A new pain** — Think of the last time you got back exactly what you asked for and it was still wrong. Then it was not the building that failed.
2. **Where the Section goes** — Three steps: what value is, where it splits in two, and what makes a requirement good.

### Value was always translation {#value-was-always-translation}

#### Visual

master: grid-1x2 · motion: none

A person's speech bubble on one side, and on the other a box, a handshake and a lectern: the product, the service and the lecture that the intent turned into.

#### Speaker notes

1. **The hard part is the concept** — Brooks argues the hard part of building software is deciding what to build, the conceptual construct, and not the labor of representing it in code; an error in the concept cripples the result and is hardest to rectify later [1].
   - sources: [1] Brooks, No Silver Bullet: Essence and Accidents of Software Engineering — https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html
2. **How strong the evidence is** — this is one author's argument from experience, written in 1986 about human-built software. No source compares requirements and execution on the same projects, and that it holds when an AI builds is an inference [1].
   - sources: [1] Brooks, No Silver Bullet: Essence and Accidents of Software Engineering — https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html

#### Voice script

1. **Every effort is a translation** — A product, a service, a lecture: each one translates what a human wanted into something that solves the actual problem.
2. **A translation layer** — If your customer could write SQL straight to the database, they would not need the front end. Hypothesis, not measured: the translation is the hard part.

### Defining and building {#defining-and-building}

#### Visual

master: grid-1x2 · motion: none

The factory line split in two halves, a defining half and a building half, with an AI worker on each. On the defining half a small speech bubble reads: "as long as AI can't read our minds."

#### Speaker notes

1. **Clients cannot state it up front** — Brooks holds that clients do not know what they want and cannot specify it completely and correctly before they have tried versions of the product, so refining requirements iteratively is what builders do most for them [1].
   - sources: [1] Brooks, No Silver Bullet: Essence and Accidents of Software Engineering — https://www.cgl.ucsf.edu/Outreach/pc204/NoSilverBullet.html
2. **Practitioners name it too** — in a survey of 228 companies, incomplete or hidden requirements were the most cited requirements problem (48%), and avoidable rework is estimated at 40 to 50 percent of project effort, though the 100x late-fix rule and the CHAOS failure rates are disputed [1].
   - sources: [1] Why do unclear requirements lead to rework and failed projects? (earlier research file) — docs/llm-wiki/research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md

#### Voice script

1. **Two halves** — Every effort splits into defining and building. AI speeds up building, and can assist defining.
2. **Foreshadow** — Defining is where the AI can help you define: remember meta prompting, we come back to it.

### Precision and accuracy {#precision-and-accuracy}

#### Visual

master: grid-2x2 · motion: none

First the four classic dartboards (precise and accurate, precise but off target, accurate but scattered, neither). Then the same four as documents arriving at the bike assembly bench: a clear sheet for the right bike, a clear sheet for the wrong bike, a vague sheet that happens to point right, a vague sheet that points wrong.

#### Speaker notes

1. **Missing requirements show up as wrong output** — in 55 historic aerospace software incidents, 85% produced wrong output instead of stopping, only 16% were errors of traditional programming, and 40% came from absent code, meaning missing requirements or unanticipated situations [1].
   - sources: [1] Prokop, Historical Aerospace Software Errors Categorized to Influence Fault Tolerance — https://ntrs.nasa.gov/api/citations/20230012909/downloads/Historical%20Aerospace%20Software%20Errors.pdf
   - target: the "precise but off target" board
2. **Limits** — the 40% mixes missing requirements with unanticipated situations, the categories were assigned in hindsight, and the author doubts that more requirements would have averted many of these errors. A survey of specifications found that how much quality matters depends on the project [1].
   - sources: [1] Mund, Femmer, Méndez Fernández, Eckhardt, Does Quality of Requirements Specifications matter? Combined Results of Two Empirical Studies — https://arxiv.org/abs/1702.07656

#### Voice script

1. **Precision** — Precision: someone else could execute without a single question.
2. **Accuracy** — Accuracy: the result matches the intent and solves the actual problem. A precise but inaccurate document is the ten wrong swings, faster.
3. **Art, not a science** — An art, not a science: you only know after trying. This is where the requirements Section sits.

## Context is the requirement {#context-is-the-requirement}

#### Voice script

1. **The claim** — Claim: context engineering is requirements engineering for agents. What you hand the agent decides the result.
2. **The route** — Left to right: what the AI sees, static and dynamic, what goes wrong, how to keep it clean.

### What the AI actually sees {#what-the-ai-actually-sees}

#### Visual

master: basic-page · motion: local

The Context window Explorable (`src/explorables/context-window/`), called back from the context window Episode (`src/episodes/ai-attention-span/`): the window as a bar that fills with what the AI reads, each turn, with what you wrote as one part of it.

#### Speaker notes

1. **The window has an attention budget** — Anthropic says recall decreases as the number of tokens in the window increases, so context has diminishing marginal returns and an attention budget [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - target: the bar filling up

#### Voice script

1. **Callback** — This is the third time you see this picture if you saw the context window Episode: everything the AI works from is what is in the window.
2. **Not your mind** — The AI cannot read your mind. It reads this, and only this.

### Context engineering is requirements engineering for agents {#context-engineering-is-requirements-engineering-for-agents}

#### Visual

master: grid-1x2 · motion: none

The dartboard from the earlier Slide beside a context window, the same four outcomes drawn on each: a window with precise, accurate content, precise but wrong, accurate but vague, and neither.

#### Speaker notes

1. **The definition** — Anthropic defines context engineering as curating and maintaining the optimal set of tokens during inference, guided by "the smallest possible set of high-signal tokens" that maximise the chance of the desired outcome [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
2. **Input quality tracks output quality** — in a randomized experiment with 30 novices, training in requirement-oriented prompting beat conventional prompt-engineering training (20% against 1% gains), and the authors report input-requirement quality correlates with output quality. It is a small trip-advisor chatbot study, not coding agents [1].
   - sources: [1] Ma, Peng, Yang, Shen, Koedinger, Wu, What Should We Engineer in Prompts? Training Humans in Requirement-Driven LLM Use — https://arxiv.org/abs/2409.08775
3. **A proposal, not a finding** — researchers draw the parallel explicitly, but no source measured it; the sentence that both disciplines share a job is an inference [1].
   - sources: [1] Chen, Wang, Sun, Liu, Zhang, Liu, Promptware Engineering: Software Engineering for Prompt-Enabled Systems — https://arxiv.org/abs/2503.02400
4. **Where the parallel stops** — a requirements document gains from completeness while a context window is a finite budget that can lose from it, and context changes during a run instead of being signed off once [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

#### Voice script

1. **The definition** — What you add to the context window decides whether the agent has the precision and accuracy to work towards.
2. **Same four outcomes** — Same dartboard, same four outcomes, different object. Your requirement document is now a context window.
3. **Calibrated candour** — Where it breaks: a window is a budget. This is my framing, researchers propose it, nobody has measured it.

### Static and dynamic context {#static-and-dynamic-context}

#### Visual

master: grid-1x2 · motion: none

The bike assembly bench in two halves. On the left, what is set up before the shift: the instruction sheet, the standing rules, the first work order, labelled memory files, system prompt, initial prompt. On the right, what arrives during the shift: parts fetched from the storeroom, a phone call to a supplier, the folder of the current job, labelled retrieval, web search, project folder.

#### Speaker notes

1. **Dynamic means loaded at run time** — agents keep lightweight identifiers such as file paths and links and load data into context at run time using tools, instead of loading everything up front [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - target: the right half of the bench

#### Voice script

1. **Before the shift** — Static: set up before the work starts. Memory files, system prompts and the initial prompt.
2. **During the shift** — Dynamic: what the agent pulls in on its own, retrieval, web search, your project folder.
3. **Why it matters** — Why care? Both land on the same bench, the same window.

### You run the bench {#you-run-the-bench}

#### Visual

master: basic-page · motion: none

A person at the bike bench sorting what lands on it, with the AI worker beside them taking pieces from the person's hand and working on what is on the bench.

#### Speaker notes

1. **More is not safer** — stating all requirements at once lowered compliance (98.7% for one requirement alone against 85.0% for gpt-4o with 19), and repository context files that restated discoverable information did not generally improve coding-agent success [1].
   - sources: [1] Why do explicit written requirements reduce the variation in LLM output? (earlier research file) — docs/llm-wiki/research/AIE/AIE-0008__written-requirements-reduce-variance/research.md

#### Voice script

1. **Human manages the context** — You manage what goes on the bench, and steer the agent in the right direction. AI as a hire: how would you brief a new colleague?
2. **Not how the AI works inside** — This is about what you manage, never how the model works inside. The next Slide shows how a bench goes bad.

### Context rot {#context-rot}

#### Visual

master: grid-2x2 · motion: none

title: Context rot at the bench

The bike bench as a grid with two rows and four columns. Static row: a wrong screw size on the instruction sheet, a binder of every bike model, fifty near-identical wrenches, old and new instruction sheets both pinned up. Dynamic row: a mislabelled box of screws, colleagues dropping by with questions, ten crates of similar parts, "rush it" against "check every piece". Each column's label is plain: a wrong fact stuck in, too much history, too many similar tools, two instructions that disagree. The four IBM terms appear only as small captions.

#### Speaker notes

1. **Length alone does part of the damage** — output quality falls as the window fills, even with perfect retrieval [2].
   - sources: [2] content-library research, Why does a language model's output quality drop as its context window fills? — docs/episodes/ai-attention-span/research/LLM-0007__context-rot-as-window-fills/research.md
2. **The four names** — Drew Breunig named context poisoning, distraction, confusion and clash in June 2025: poisoning is an error that gets saved and reused, distraction a long history that steers the model, confusion superfluous material such as surplus tools, clash conflicting material in the window [3].
   - sources: [3] Drew Breunig, How Long Contexts Fail — https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
3. **Credit and limit** — the IBM Technology video presents the same four; its page could not be read, so that statement rests on a secondary summary and needs confirming against the video. The taxonomy is a practitioner blog post and a failure can fit more than one mode [5].
   - sources: [5] IBM Technology, Context Engineering for AI Agents: 4 Failure Modes to Avoid — https://www.youtube.com/watch?v=BwXremQ-i6I
4. **Numbers for confusion and clash** — on the Berkeley Function-Calling Leaderboard every model does worse with more than one tool, a quantized Llama 3.1 8b failed with 46 tools and succeeded with 19; piecemeal prompts cut scores by 39% on average [3].
   - sources: [3] Drew Breunig, How Long Contexts Fail — https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html
   - target: the crates of similar parts and the colleagues dropping by

#### Voice script

1. **Junk drawer, meeting, two bosses** — Everyday pictures: a wrong fact in a recipe, a long meeting that forgets the decision, a junk drawer of keys, two bosses with opposite instructions.
2. **Static row** — On the static side: wrong screw size on the sheet, a binder of every model, fifty wrenches, old and new sheets side by side.
3. **Dynamic row** — Then the same four arriving during the shift. Poisoning, distraction, confusion and clash are the names; the bench is the picture.
4. **More context, worse result** — More is not safer. A fuller bench can be a worse bench.

### Keeping the bench clean {#keeping-the-bench-clean}

#### Visual

master: grid-2x2 · motion: none

The same bench, each of four fixes clearing one mess: checking the sheet against a real bike (validate), replacing the binder with a one-page summary (compact), keeping only the wrenches the job needs (curate), pulling the old sheets down or starting at a clean bench (prune).

#### Speaker notes

1. **The video's framing** — the IBM Technology video pairs each mode with one fix: validate, compact, curate, prune. This pairing is from a summary of the video and is unconfirmed; it needs confirming before it is stated as IBM's [5].
   - sources: [5] IBM Technology, Context Engineering for AI Agents: 4 Failure Modes to Avoid — https://www.youtube.com/watch?v=BwXremQ-i6I
2. **Breunig lists other fixes** — his companion post names six: RAG, tool loadout, context quarantine, pruning, summarization and offloading. Picking fewer than 30 tools improved selection accuracy up to threefold [4].
   - sources: [4] Drew Breunig, How to Fix Your Context — https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html
3. **One fix per mode is a simplification** — compaction can launder a bad fact into a clean summary, so it does not repair poisoning; that a fresh window is the thread behind compact and prune is inference, and Anthropic warns overly aggressive compaction loses subtle but critical context [6].
   - sources: [6] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

#### Voice script

1. **Four cleanups** — Validate, compact, curate, prune: one cleanup per mess. This is the video's framing, and I still need to confirm it.
2. **Fresh chat** — Sometimes the cleanest fix is a clean bench: start a fresh chat and bring only the result. That is the second actionable, and I come back to it.

## Creating context for agents {#creating-context-for-agents}

#### Voice script

1. **The pain** — Creating precise, accurate context that stays free of rot feels like a lot of work. Who has time to write that for every task?
2. **The claim** — Let the AI do the interviewing, and you do the answering.

### Meta prompting {#meta-prompting}

#### Visual

master: grid-1x2 · motion: none

A planning office beside the factory line. Questions go from the office to a person, answers come back, and the office hands one clean work order across to the bike bench, in a different room from the line.

#### Speaker notes

1. **Users answer better than they write** — when a model elicits preferences with open-ended questions, the user's answers are often more informative than prompts they wrote unaided, and users report it takes less effort [1].
   - sources: [1] Li et al., Eliciting Human Preferences with Language Models — https://arxiv.org/abs/2310.11589
2. **Prompts generated from requirements** — REprompt builds a multi-agent prompt optimiser from requirements-engineering principles; the abstract reports effective optimisation without numbers, and it is an early preprint [1].
   - sources: [1] Shi, Sun, Chen, Wu, Chen, Jin, Liu, REprompt: Prompt Generation for Intelligent Software Development Guided by Requirements Engineering — https://arxiv.org/abs/2601.16507

#### Voice script

1. **Separate session** — A separate session creates the high-signal context for you. High-signal means the smallest set of what matters.
2. **Fresh chat, clean work order** — Take the result into a fresh chat instead of continuing the long one. The line gets one clean work order, not the whole conversation.
3. **Why a separate office** — The planning chat is full of questions and drafts, which is rot at the bench. The work order is not.

### Grill-me {#grill-me}

#### Visual

master: basic-page · motion: local

A chat asking a round of questions at a time, the person answering each round, and after the last round the conversation ending in a spec document that lands as the first page on a clean bench.

#### Speaker notes

1. **Asking beats guessing, on unclear tasks** — on an underspecified variant of SWE-Bench Verified, agents that interacted with the user to fill missing information improved by up to 74% over non-interactive ones; that is a maximum, from simulated users, and models struggled to tell which tasks need a question [2].
   - sources: [2] Vijayvargiya et al., Ambig-SWE: Interactive Agents to Overcome Underspecificity in Software Engineering — https://arxiv.org/abs/2502.13069
   - target: the first round of questions
2. **Rounds are inferred** — the research backs asking clarifying questions before the task; "in rounds" is an inference. Separately, scores fell 39% on average when an instruction arrived over several turns, which measures piecemeal instructions and not clarifying questions [1].
   - sources: [1] Laban et al., LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120

#### Voice script

1. **Matt Pocock's skill** — Grill-me is Matt Pocock's skill. Why it works: it replaces the model's guesses about what you left out with your answers.
2. **Next 30 minutes** — What the next 30 minutes practise: you pick a use case, let the AI grill you, and it turns the session into a spec.
3. **Actionable one** — Before your next complex task, let the AI interview you in rounds of questions, then turn the result into a spec.

### BRIEF {#brief}

#### Visual

master: horizontal-rail · motion: none

The five letters on one axis, each mapped to a step of today's session: Break it down, Requirements first, Interview with AI, Evaluate each step, Fresh chat.

#### Speaker notes

1. **Why a fresh chat** — Anthropic describes compaction as summarising the contents and starting a new context window with the summary, warns that overly aggressive compaction can lose subtle but critical context, and recommends sub-agents with clean windows that return a condensed summary [6].
   - sources: [6] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - target: the F, Fresh chat

#### Voice script

1. **Callback** — Callback to the freelancer Episode, onboard AI every time: you hired a fast freelancer who forgets everything after each conversation.
2. **Map to today** — B and R are the line and the requirement, I is the grill, E is reading the spec, F is the fresh chat. What we do today, in five letters.
3. **Close** — Move that result into a fresh chat instead of continuing the long one. The tool is here, and you decide what the line gets. It is early, and thank you.

## Material left out

- Matt Pocock's skill details and the factory Explorable's code are not in the research; the Slides describe them in viewer terms.
- Breunig's other fixes beyond the video's four (RAG, quarantine, offloading) stay in the Speaker notes of Keeping the bench clean.
