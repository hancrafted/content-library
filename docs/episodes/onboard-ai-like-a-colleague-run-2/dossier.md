---
type: dossier
title: Stop prompting AI, start onboarding it
status: draft
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-13T14:26:25Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-10-13T14:29:51Z
---

# Stop prompting AI, start onboarding it {#stop-prompting-start-onboarding}

## The promise and the gap {#the-promise-and-the-gap}

#### Voice script

1. **Open on the hype** — "Become 20x more productive with AI"; you have seen it; you have tried it.
2. **Bridge to the room** — you have heard the promise; now step out of AI for a moment and into a thought experiment.

### Twenty times on paper {#twenty-times-on-paper}

#### Visual

master: grid-1x2 · motion: local
title: Promised against delivered

Two facing halves. The left half carries the promise, a large "20x". The right half carries the viewer's own experience, "your last real attempt", as a plain line of type with a question mark where an answer would be. On entering the Slide the left numeral rises to 20x once and holds; the right half fades in a beat later and stays still, so the gap is the last thing on screen.

#### Speaker notes

1. **Measured gains are real but uneven** — three field experiments with 4,867 developers found a 26% increase in completed tasks for those given a coding assistant, far below "20x", and each single experiment was noisy [1].
   - sources: [1] The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566
   - target: the right half
2. **People misjudge their own gain** — in a trial with 16 experienced developers, they forecast a 24% speedup and afterwards believed AI had saved them 20%, while measured time rose 19%. METR marks that result out of date and says it does not show AI fails to speed up most developers, so the point is how unreliable self-perception is, not that AI slows people down [1][2].
   - sources: [1] Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — https://arxiv.org/abs/2507.09089
   - sources: [2] METR, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity (study announcement with limitations) — https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
3. **Population-level effects are small so far** — linking surveys of 25,000 Danish workers to administrative records found precise null effects on earnings and recorded hours, ruling out effects larger than 2% two years after ChatGPT's launch [1].
   - sources: [1] Humlum, Vestergaard, Large Language Models, Small Labor Market Effects (NBER Working Paper 33777) — https://www.nber.org/papers/w33777

#### Voice script

1. **The number** — twenty times; the promise from vendors and feeds; take it at face value for a moment.
2. **Your number** — your own last serious attempt; usable, not transformative; the gap between the two.
3. **Why, left open** — why the gap exists; hold the question, do not answer it yet.

## Day one with a capable stranger {#day-one-with-a-capable-stranger}

#### Voice script

1. **Switch to the room** — leave AI aside; a thought experiment; take a second and picture it.
2. **A real task** — a new colleague starts today; you must brief them; a use case, not a lecture.

### A colleague who knows the written world {#a-colleague-who-knows-the-written-world}

#### Visual

master: grid-1x3 · motion: local
title: Your new colleague

Three columns on hairlines, each with an oversized numeral: "Knows the written world", "Completely confident", "Eager to please". The columns enter left to right once when the Slide becomes active, one beat apart, then rest; each is readable at rest without any pointer.

#### Speaker notes

1. **Vendors brief it as a capable newcomer** — Anthropic's prompting guidance says to think of the model as "a brilliant but new employee who lacks context on your norms and workflows", and to test a prompt by showing it to a colleague with minimal context [1].
   - sources: [1] Anthropic, Be clear and direct (prompting guidance) — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
2. **The lens has a lineage** — Ethan Mollick first called AI an intern, then in November 2024 dropped "intern" as too constraining and proposed an "infinitely patient new coworker who forgets everything you tell them each new conversation" [1].
   - sources: [1] Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024) — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough
3. **Developers use the same picture** — Matt Pocock frames the agent as a colleague "who wakes up every morning and cannot remember who they are", and says the codebase must be optimized for new starters because an agent starts afresh every session. This rests on the podcast's published notes, not the full audio [1].
   - sources: [1] Gergely Orosz, AI Skills with Matt Pocock, The Pragmatic Engineer (17 Sep 2026; podcast notes quoting Pocock) — https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock

#### Voice script

1. **Profile** — knows essentially the whole written world; extremely knowledgeable; extremely confident.
2. **Eager** — wants to please; will not say "I don't know"; no memory of your company.

### The plan is due by end of day {#the-plan-is-due-by-end-of-day}

#### Visual

master: grid-1x1 · motion: local
title: Sommerfest for 100, due by 17:00

One feature cell across the whole Foreground: the task as a brief poster, "Company-wide Sommerfest for about 100 people. A fully structured plan. Due by end of day, for the CEO." A thin progress line along the bottom edge fills from morning to 17:00 once on entry and holds, so the urgency is visible at rest.

#### Speaker notes

1. **Onboarding as the yardstick** — Andrej Karpathy framed the real capability test not as solving PhD-grade problems but as whether you would hire it as a junior intern: "get your slack set up, read these onboarding docs, do this task and let's check in next week" [1].
   - sources: [1] Andrej Karpathy, post on X (14 Dec 2024) — https://x.com/karpathy/status/1868061331355840704

#### Voice script

1. **The task** — company-wide event; Sommerfest or Christmas party; about 100 people.
2. **The clock** — first day; urgent; a structured plan by end of day for your team lead or the CEO.

### What would you tell them first {#what-would-you-tell-them-first}

#### Visual

master: horizontal-rail · motion: local
title: Your first day together

Six moments on one horizontal axis, labelled with times and plain actions and no discipline names: 09:00 walk them through last year's party, 09:30 tell them the budget and the headcount, 10:00 hand over the booking login and the caterer's number, 10:30 say what the plan must look like and who reads it, 13:00 look at the first draft, 16:00 check it before it goes up. The axis and the dots draw in once the first time the Slide becomes active; each label is readable at rest.

#### Speaker notes

1. **Write for the newcomer** — Michael Nygard wrote decision records "as if it is a conversation with a future developer", so a newcomer need not blindly accept or blindly change a decision. Carried from an earlier research file, not re-fetched [1].
   - sources: [1] Michael Nygard, Documenting Architecture Decisions — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
2. **Checking is part of the frame** — Anthropic's best-practices page says to "Give Claude a way to verify its work" and "If you can't verify it, don't ship it". Carried from an earlier research file, not re-fetched [1].
   - sources: [1] Anthropic, Claude Code best practices — https://code.claude.com/docs/en/best-practices
   - target: the 13:00 and 16:00 moments

#### Voice script

1. **Take a second** — ask the room; how would you onboard them; no right answer yet.
2. **Walk the morning** — last year's party, the budget, how many people, the culture; you hand over what you know.
3. **Tools and the ask** — the booking system, the catering contacts, the calendar; say what the plan should look like.
4. **Look at the draft** — you do not wait until 17:00; check at lunch and again before it goes up.

## You managed it, you did not do it {#you-managed-it-you-did-not-do-it}

#### Voice script

1. **Pause on the shift** — the experiment is over; what it showed is about to be named.

### You managed the task {#you-managed-the-task}

#### Visual

master: grid-1x1 · motion: local
title: You managed it, you did not do it

One statement across the whole Foreground, "Doing became managing", set large. A thin line beneath it draws once on entry from a "do" end to a "manage" end and holds, with no pointer needed.

#### Speaker notes

1. **A management reading, not a tool reading** — Harvard Business School's Joseph Fuller argues companies miss AI's value because they have not changed how work is organized around it, and that agentic AI is "primarily about managing work". Only HBR's summary was read [1].
   - sources: [1] Joseph Fuller, Create an Onboarding Plan for AI Agents, Harvard Business Review (25 Mar 2026) — https://hbr.org/2026/03/create-an-onboarding-plan-for-ai-agents
2. **The task, not the rank, asks for it** — the novice boost was measured on bounded tasks inside the model's competence: 34% more issues resolved per hour for novice support agents against minimal effect for experienced ones [1]. On a task built to lie outside the frontier, consultants using AI were 19 percentage points less likely to be correct [2]. That the task demands management discipline, merely correlating with experience, is this Episode's inference; no source tests it directly.
   - sources: [1] Brynjolfsson, Li, Raymond, Generative AI at Work (NBER Working Paper 31161) — https://www.nber.org/papers/w31161
   - sources: [2] Dell'Acqua, McFowland, Mollick, Lifshitz-Assaf, Kellogg, Rajendran, Krayer, Candelon, Lakhani, Navigating the Jagged Technological Frontier — https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf
3. **Experience with the tool predicts results** — in Anthropic's usage data, users with six months or more of tenure show a success rate 3 to 5 points higher within the same task cluster, delegate less by directive and iterate more. Success is Claude's own assessment and self-selection is not ruled out [1].
   - sources: [1] Anthropic, Anthropic Economic Index report: Learning Curves (March 2026) — https://www.anthropic.com/research/economic-index-march-2026-report
4. **Where the analogy stops** — a human newcomer learns on the job, an agent does not: Anthropic describes each new session as an engineer arriving "with no memory of what happened on the previous shift", so anything unwritten is gone [1].
   - sources: [1] Anthropic Engineering, Effective harnesses for long-running agents (published 26 Nov 2025) — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

#### Voice script

1. **You did not plan the party** — you set the stage; context, access, the ask, the check; that is the work.
2. **Doing became managing** — the shift AI demands; light, not a 1:1 mapping; the analogy is a lens, not a spec.

### Prompting like a tool, briefing like a colleague {#prompting-like-a-tool}

#### Visual

master: grid-1x2 · motion: local
title: One line against a first day

Two facing halves. The left shows a one-line prompt, "Plan our Sommerfest.", alone in a lot of empty space. The right shows the same task as the day-one note: last year, budget and headcount, access, the ask, how it will be checked. On entry the right half fills line by line once while the left stays bare.

#### Speaker notes

1. **Unstated requirements are guessed** — models infer a missing requirement correctly only about 41% of the time, and underspecified prompts are twice as likely to regress when the model or prompt changes [1].
   - sources: [1] Yang, Shi, Ma, Liu, Kästner, Wu, What Prompts Don't Say: Understanding and Managing Underspecification in LLM Prompts — https://arxiv.org/abs/2505.13360
2. **Say it up front** — across more than 200,000 simulated conversations, every tested model did worse when a task arrived underspecified over several turns than when fully specified at once, by 39% on average [1].
   - sources: [1] Laban, Hayashi, Zhou, Neville, LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120
3. **Relevant, specific context, not volume** — handing a model the one relevant document lifted question-answering accuracy for GPT-3.5-Turbo from 56.1% to 88.3%, a 2023 retrieval result whose direction transfers and whose size does not. With 20 or 30 documents it could fall below having none [1]. Anthropic: "minimal does not necessarily mean short" [2]. Measured evidence for a human-written brief in non-coding knowledge work is thin.
   - sources: [1] Liu et al., Lost in the Middle: How Language Models Use Long Contexts, TACL 2024, Table 1 and section 2.3 — https://arxiv.org/pdf/2307.03172
   - sources: [2] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

#### Voice script

1. **Back to the hook** — your prompt was one line; you would never brief a person that way.
2. **The answer to the hanging why** — AI underdelivers because you prompt it like a tool; the task is to onboard it like a colleague.

### Confident is not correct {#confident-is-not-correct}

#### Visual

master: basic-page · motion: local
title: Confident is not correct

A one-page plan in the middle of the Slide, as a short list of claims in plain type. Once the Slide is active, a check mark appears beside each claim in turn as it is verified; one claim stays unmarked and is flagged, with the caption "sounded just as sure". Everything reads finished at rest, with the flagged line still visible.

#### Speaker notes

1. **Invented sources, defended** — in a New York federal case, lawyers filed a brief citing six cases ChatGPT had invented, defended them when challenged and were fined; the court held that the rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings" [1].
   - sources: [1] Judge P. Kevin Castel, Mata v. Avianca, Inc., Opinion and Order, No. 22-cv-1461 (PKC) (S.D.N.Y. June 22, 2023), ECF 54 — https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf
2. **Wrong answers read as coherent** — on the BCG task outside the model's frontier, AI users' wrong answers read as coherent, which made errors harder to catch [1].
   - sources: [1] Dell'Acqua, McFowland, Mollick, Lifshitz-Assaf, Kellogg, Rajendran, Krayer, Candelon, Lakhani, Navigating the Jagged Technological Frontier — https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf
3. **A check can be cheap** — a 19-item surgical checklist was associated with inpatient death falling from 1.5% to 0.8% across eight hospitals. A before-and-after study, and not AI evidence; it shows a simple check can work [1].
   - sources: [1] Haynes et al., A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population, New England Journal of Medicine 360(5), 2009 — https://pubmed.ncbi.nlm.nih.gov/19144931/

#### Voice script

1. **The profile again** — knowledgeable, confident, eager; that combination hands in polished work that may be wrong.
2. **You check, as with any new hire** — spot-check the first drafts; you stay responsible for what goes to the CEO.

## The effort moves, it does not vanish {#the-effort-moves-it-does-not-vanish}

#### Voice script

1. **Where did the time go** — the time you saved typing went somewhere; that is the learning goal in one line.

### The work relocates {#the-work-relocates}

#### Visual

master: basic-page · motion: local
title: The effort moves

One horizontal bar of a single task's effort, drawn twice, without numbers. In the first, "typing it yourself" fills the bar. In the second, the same-width bar splits into "briefing", "context", "tools" and "checking" and a small "AI" segment. On entry the typing segment shrinks while the other segments grow into its place, once, and the total width never changes. Marked as a schematic, not a measurement.

#### Speaker notes

1. **Where the individual's time goes** — in the METR trial developers accepted fewer than 44% of generations and spent about 9% of their time reviewing and cleaning AI output; they described the AI as a new contributor lacking the repository's tacit context [1]. The reading that effort relocates is an inference; no source tests it directly.
   - sources: [1] Becker, Rush, Barnes, Rein, Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — https://arxiv.org/abs/2507.09089
2. **Employers restructured work** — in the Danish data employers absorbed chatbots through task reorganization that created new work in content generation, AI oversight and AI integration [1].
   - sources: [1] Humlum, Vestergaard, Still Waters, Rapid Currents: Early Labor Market Transformation under Generative AI, formerly Large Language Models, Small Labor Market Effects (NBER Working Paper 33777, revised March 2026) — https://www.nber.org/papers/w33777
3. **Value arrives with complements** — general purpose technologies "enable and require significant complementary investments" in processes, business models and human capital, often intangible and poorly measured, so productivity is understated early (the Productivity J-Curve) [1].
   - sources: [1] Brynjolfsson, Rock, Syverson, The Productivity J-Curve: How Intangibles Complement General Purpose Technologies (NBER Working Paper 25148; AEJ Macroeconomics 13(1), 2021) — https://www.nber.org/papers/w25148

#### Voice script

1. **Relocated, not removed** — the effort left typing and arrived at briefing, context, tools and checking.
2. **Why the shortfall** — skip that reinvestment and you keep the cost and miss the gain.

### From your desk to your organization {#from-your-desk-to-your-organization}

#### Visual

master: grid-1x2 · motion: local
title: Skills for you, disciplines for the firm

Two facing halves. The left, "For you", names the personal skill: briefing, handing over context, checking. The right, "Across your organization", names the shared discipline: who writes the context down, who owns the checks, how work is organized around AI. Each half draws its hairline once on entry.

#### Speaker notes

1. **Adoption without impact** — in a survey of close to 6,000 executives, about 69% of firms actively use AI yet roughly 90% of executives report no impact on productivity or employment over the last three years [1].
   - sources: [1] Yotzov, Barrero, Bloom, Davis et al., Firm Data on AI (NBER Working Paper 34836, revised March 2026) — https://www.nber.org/papers/w34836
2. **The skill gap is acknowledged** — in a survey of about 800 US enterprise decision-makers, nearly half report technical skill gaps while training investment is down 8 points, and 43% of leaders warn of skill atrophy without deliberate role design and coaching. Self-reported [1].
   - sources: [1] Wharton Human-AI Research and GBK Collective, Accountable Acceleration: Gen AI Fast-Tracks Into the Enterprise, Executive Summary — https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf
3. **Individuals move first** — the MIT NANDA preliminary report finds workers at over 90% of surveyed companies using personal AI tools while official initiatives stall. Its figures rest on interviews and leader surveys, self-graded, so read as indicative only [1].
   - sources: [1] Challapally et al., The GenAI Divide: State of AI in Business 2025 (MIT Project NANDA, preliminary findings, July 2025) — https://static1.squarespace.com/static/6500be7b90b0f770653f355f/t/691cc39e865ddb4ded472c4c/1763492766933/MIT+-+2025+The+GenAI+Divide+-+State+of+AI+in+Business+2025.pdf

#### Voice script

1. **For yourself** — new skills; the day-one note becomes a habit.
2. **For your organization** — the same disciplines at team scale; who writes things down, who checks.

## Four disciplines, one line each {#four-disciplines-one-line-each}

#### Voice script

1. **Names, not a map** — the work of setting AI up has names; four disciplines, one line each; not a step-for-step match with the party.

### Four ways to onboard AI {#four-ways-to-onboard-ai}

#### Visual

master: basic-page · motion: local
title: Four disciplines

Four nested rings around a small centre labelled "the task", widening outwards: prompt engineering (the ask, a clear and unambiguous brief), context engineering (the background you hand over: budget, headcount, culture, past events), harness engineering (the tools and environment: booking system, catering contacts, calendar) and graph engineering (the workflow across agents, project management for AI). The outer ring is drawn dashed and tagged "newest, since mid-2026, still loosely defined". On entry the rings draw in from the centre outwards, once, and hold.

#### Speaker notes

1. **Context is a finite resource** — Anthropic: context is "a finite resource with diminishing marginal returns" and the target is "the minimal set of information that fully outlines your expected behavior" [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
2. **Hand-over artifacts as harness** — Anthropic's remedy for agents arriving with no memory is a written hand-over that each new session reads first, as a shift change would require [1].
   - sources: [1] Anthropic Engineering, Effective harnesses for long-running agents (published 26 Nov 2025) — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

#### Voice script

1. **Prompt and context** — the ask phrased as a clear brief; the background you hand over.
2. **Harness** — the tools and environment you give access to.
3. **Graph, the newest** — managing the workflow across agents; project management for AI; emerging, loosely defined.

### Your day-one note before you type {#your-day-one-note-before-you-type}

#### Visual

master: vertical-stepper · motion: local
title: Before you type a word

A numbered process on one spine with four steps, each heading carrying the claim: 1 Context, what you would tell them about your situation; 2 Tools, what they would need access to; 3 Brief, what exactly you are asking for; 4 Check, how you will review their work. Opening a step reveals one line of depth only. The spine fills down to the open step; the four headings stand on their own at rest.

#### Speaker notes

1. **Write it down, or it is gone** — instructions given only in chat do not reliably survive compaction; Anthropic advises putting persistent rules in a file the agent reads at the start [1].
   - sources: [1] Anthropic, How Claude remembers your project (Claude Code memory) — https://code.claude.com/docs/en/memory
2. **Short and relevant beats long** — Chroma tested 18 models and found performance grows increasingly unreliable as input length grows, even on simple tasks [1].
   - sources: [1] Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance — https://research.trychroma.com/context-rot
   - target: step 1, Context

#### Voice script

1. **The habit** — next time you reach for AI on something real; before you type a word; jot down your day-one note.
2. **Four lines** — the context, the tools they would need, the brief, how you will check their work.

## AI can help you onboard AI {#ai-can-help-you-onboard-ai}

#### Voice script

1. **It feels like a lot** — four disciplines, a day-one note each time; admit that it is work.

### The twist {#the-twist}

#### Visual

master: grid-1x1 · motion: local
title: AI can help you onboard AI

One statement across the whole Foreground, "AI can help you onboard AI", with a small pointer line underneath naming grill-me. On entry the second "AI" slides in once and holds. The Slide reads as a complete ending, with no teaser.

#### Speaker notes

1. **AI as a second pair of eyes** — Anthropic recommends a second opinion in a fresh context, "so the agent doing the work isn't the one grading it". The grill-me link is this Episode's own framing [1].
   - sources: [1] Anthropic, Claude Code best practices — https://code.claude.com/docs/en/best-practices

#### Voice script

1. **The twist** — AI can help you onboard AI; it can interview you for the context you forgot.
2. **A first step** — grill-me as one way to start; worded as an ending, nothing left hanging.

## Material left out

Left out because it serves no actionable or is not citable as the research stands:

- The METR slowdown as a headline ("AI slows people down"): the authors mark it out of date and dispute its reach.
- "95% of AI pilots fail": disputed and self-graded, so it appears only as an indicative caveat.
- The code-security studies (Perry, Pearce, Asare, Sandoval): disputed, 2021 and 2022 models, so not cited.
- The workshop consultant who used the same frame: testimony without a public source.
- Volume claims about context ("more context is better"): the evidence holds only for relevant, specific context.
- Graph engineering has no research behind it; the Slide states only the Brief's own description.
- The open ideas of the Brief (the "You just got promoted" reframe, the travel-agency wrapper).
