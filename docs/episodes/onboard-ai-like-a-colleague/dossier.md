---
type: dossier
status: checked
locale: en
brief: ./brief.md
---

# Stop prompting AI, start onboarding it {#onboard-ai-like-a-colleague}

The Episode runs from a gap the viewer has felt, through one lived thought experiment, to a single habit: write the day-one note before typing. About ten minutes, nine Slides.

## The gap {#the-gap}

### 20x on the poster, not on your screen {#twenty-x-versus-your-screen}

#### Visual

master: basic-page · motion: liquid-ink-transition

The basic-page master carries the claim as its title, "become 20x more productive with AI", and a short caption. No catalog match: the wanted layout also has a small, plain prompt box with a mediocre answer in it beneath the claim, and a question mark left hanging in the room as the only other element. No explanation appears.

#### Speaker notes

1. **The measured gains are real but small** — three field experiments with 4,867 developers found about 26% more completed tasks with an AI assistant, far from 20x, and each single experiment was noisy [1].
   - sources: [1] The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers — https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566
2. **A famous slowdown, now out of date** — METR measured 19% longer tasks for 16 experienced developers on their own repositories in early 2025; its authors now say the old result no longer reflects current impact. Do not present it as a current fact [2].
   - sources: [2] METR, update on its AI developer productivity study (February 2026) — https://metr.org/blog/2026-02-24-uplift-update/
3. **We misjudge our own gains** — the same developers forecast a 24% speedup and afterwards believed AI had saved them 20%, in the wrong direction [3].
   - sources: [3] Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — https://arxiv.org/abs/2507.09089

#### Segments

1. The promise — 20x, productivity, every feed
2. Your own attempt — your prompt, flat answer, shrug
3. Leave it open — why, hang in the room

## The thought experiment {#thought-experiment}

### Sommerfest, due by five {#sommerfest-due-by-five}

#### Visual

master: three-column · motion: liquid-ink-transition

Three cards side by side set the scene as plain facts: the job (a Sommerfest or Christmas party for about 100 people, a fully structured plan due end of day for your team lead or the CEO), the clock (first day, urgent), and the new colleague (knows essentially the entire written world, extremely confident, eager to please). No labels beyond the three card heads.

#### Speaker notes

1. **Why a colleague and not a tool** — vendors and practitioners independently frame the model as a brilliant newcomer who lacks context on your norms, which is why the test works for non-coders too [1].
   - sources: [1] Anthropic, Be clear and direct — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
2. **Others use the same lens** — Matt Pocock describes an agent as a colleague who starts afresh every session, and Mollick's current form is an "infinitely patient new coworker who forgets everything" [2][3].
   - sources: [2] AI Skills with Matt Pocock, The Pragmatic Engineer — https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock
   - sources: [3] Getting started with AI: Good enough prompting — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough
3. **"Intern" is the wrong rank** — Mollick dropped the intern wording in 2024 because it makes people use AI in constrained ways; "colleague" is the supported form [3].
   - sources: [3] Getting started with AI: Good enough prompting — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough

#### Segments

1. The job — Sommerfest, 100 people, end of day
2. Who walks in — knows everything, confident, eager
3. Take a second — the room, your move

### What you would say first {#what-you-would-say-first}

#### Visual

master: basic-page · motion: liquid-ink-transition

The basic-page master holds a quiet title and caption. No catalog match: the wanted layout is a single quiet frame with the new colleague at an empty desk, and your own sentences appearing one after another as speech lines, in the order you would actually say them. The lines are unlabelled; nothing groups them.

#### Speaker notes

1. **Anthropic's own test** — show the prompt to a colleague with minimal context and see whether they would be confused [1].
   - sources: [1] Anthropic, Be clear and direct — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
2. **Facts you hold, it does not** — handing a model the one relevant document lifted question-answering accuracy from 56.1% to 88.3% for GPT-3.5-Turbo. Weak for this audience: a 2023 retrieval result, so it shows direction, not size [2].
   - sources: [2] Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/pdf/2307.03172
3. **Unstated requirements: one benchmark result** — in one benchmark study, models guessed a missing requirement right about 41% of the time. It is a benchmark result, not a rule, and it does not measure a human writing a brief [3].
   - sources: [3] What Prompts Don't Say — https://arxiv.org/abs/2505.13360
4. **All at once versus piece by piece: one benchmark result** — in one benchmark with simulated users, tasks fed over several turns lost 39% of performance on average against a fully specified single turn. It does not measure a human writing a brief, so read it as direction only [4].
   - sources: [4] LLMs Get Lost In Multi-Turn Conversation — https://arxiv.org/abs/2505.06120

#### Segments

1. Where do I start — tell the story first, why this party
2. What they need to know — budget, headcount, our culture, last year
3. What they can touch — booking, caterers, calendar
4. What I want back — one structured plan, by five
5. Before they run — what do I say, in my own words

### Four o'clock, the plan comes back {#four-oclock-the-plan-comes-back}

#### Visual

master: basic-page · motion: liquid-ink-transition

The basic-page master holds a title and caption. No catalog match: the wanted layout shows the finished plan on screen, polished and confident, with one line in it quietly off (a venue that is booked, or a budget that is wrong), and a hand with a pen hovering over it.

#### Speaker notes

1. **Confident and wrong looks the same** — in the BCG study, on a task built to lie outside the model's ability, AI users were 19 points less likely to be correct, and their wrong answers read as coherent. The task was designed to fail, so this shows a mechanism, not a typical rate [1].
   - sources: [1] Navigating the Jagged Technological Frontier — https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf
2. **Delegating raises confidence** — in a 47-person study, programmers with an AI assistant wrote less secure code and were more likely to believe it secure. Disputed: a 58-person study found a gap of at most about 10%, and both used 2021 to 2022 models [2][3].
   - sources: [2] Do Users Write More Insecure Code with AI Assistants? — https://arxiv.org/abs/2211.03622
   - sources: [3] Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants — https://arxiv.org/abs/2208.09727
3. **Someone must stay the gatekeeper** — a New York court fined lawyers $5,000 for filing six cases ChatGPT invented, and wrote that using AI is not improper but rules "impose a gatekeeping role on attorneys" [4].
   - sources: [4] Mata v. Avianca, Inc., Opinion and Order — https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf

#### Segments

1. The plan lands — polished, fast, sure of itself
2. One line is off — the venue, the budget
3. You catch it, or you do not — your eye, their confidence

## From doing to managing {#from-doing-to-managing}

### You managed it, you did not do it {#you-managed-it}

#### Visual

master: basic-page · motion: liquid-ink-transition

The basic-page master carries one sentence, "You did not do the task. You managed it.", as title and caption. No catalog match: the wanted layout adds a small arrow from a pen to a clipboard on a clean frame. No mapping of the experiment onto anything.

#### Speaker notes

1. **The work moves, it does not vanish** — METR's developers spent about 9% of their time reviewing and cleaning AI output, and said the AI acted like a new contributor lacking the repository's tacit knowledge. Early-2025 tools and 16 people, so read it as a mechanism [1].
   - sources: [1] Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity — https://arxiv.org/abs/2507.09089
2. **Employers added oversight work** — in Danish records, chatbots left earnings and hours nearly unchanged while employers added new tasks in content generation, AI oversight and AI integration [2].
   - sources: [2] Large Language Models, Small Labor Market Effects (NBER w33777; now retitled "Still Waters, Rapid Currents") — https://www.nber.org/papers/w33777
3. **Why novices still gain** — studies where AI helps novices most give bounded tasks inside the model's reach. The claim here is that the task demands delegation discipline, which experience only correlates with. This is an inference; no study tests management skill directly [3][4].
   - sources: [3] Generative AI at Work — https://www.nber.org/papers/w31161
   - sources: [4] Navigating the Jagged Technological Frontier — https://www.hbs.edu/ris/Publication%20Files/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier_5c589c8c-fbb5-458f-b285-c944746cd717.pdf

#### Segments

1. What you actually did — not the plan, the briefing
2. Doing to managing — the shift, a skill of its own
3. Not about rank — the task asks, experience helps

### Four disciplines, one line each {#four-disciplines}

#### Visual

master: grid-2x2 · motion: liquid-ink-transition

Four equal tiles, each a name with one line under it: prompt engineering (the ask as a clear, unambiguous brief), context engineering (budget, headcount, culture, past events), harness engineering (booking system, catering contacts, calendar), graph engineering (the workflow across agents, project management for AI). The fourth tile carries a small "new, still loosely defined" tag. The tiles are teased, not explained, and the party example is the only sample content.

#### Speaker notes

1. **Prompt engineering** — underspecified prompts are about twice as likely to regress across model or prompt changes [1].
   - sources: [1] What Prompts Don't Say — https://arxiv.org/abs/2505.13360
2. **Context engineering** — Anthropic treats context as a finite resource with diminishing returns and aims for the minimal set of information that fully outlines the expected behavior, which is not necessarily short. In coding-agent studies, repository overviews did not help; that non-standard specifics help is plausible and reported by one source, not established [2][3].
   - sources: [2] Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - sources: [3] Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents? — https://arxiv.org/abs/2602.11988
3. **Harness engineering** — Anthropic's remedy for agents that forget between shifts is written hand-over artefacts each new session reads first [4].
   - sources: [4] Effective harnesses for long-running agents — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

#### Segments

1. Four names — prompt, context, harness, graph
2. Prompt and context — the ask, the background
3. Harness and graph — the tools, the workflow across agents
4. Newest term — mid-2026, still loosely defined

### The same wall, one level up {#same-wall-one-level-up}

#### Visual

master: three-column · motion: liquid-ink-transition

Three columns read left to right: "You", "Your team", "Your organization", each with one short line about where the effort went (the day-one note, the shared setup, the training and workflow redesign). The columns share one arrow labelled "reinvest".

#### Speaker notes

1. **Value needs complementary investment** — general-purpose technologies "enable and require significant complementary investments" in processes and human capital, often intangible, so gains show up late [1].
   - sources: [1] The Productivity J-Curve — https://www.nber.org/papers/w25148
2. **Adoption without impact** — in a survey of about 6,000 executives, about 69% of firms use AI while roughly 90% report no effect on productivity or employment over three years [2].
   - sources: [2] Firm Data on AI (NBER w34836) — https://www.nber.org/papers/w34836
3. **A disputed headline** — the "95% of pilots fail" figure is the MIT NANDA report's own directional, interview-based number, read here from a third-party copy; a Wharton survey of about 800 leaders found nearly three in four see positive ROI, also self-reported. Neither settles the true share, so do not lead with 95% [3][4].
   - sources: [3] The GenAI Divide: State of AI in Business 2025 (copy of the PDF) — https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf
   - sources: [4] Accountable Acceleration: Gen AI Fast-Tracks Into the Enterprise — https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf
4. **Skills lag usage** — nearly half of organizations report technical skill gaps while training investment softened [4].
   - sources: [4] Accountable Acceleration: Gen AI Fast-Tracks Into the Enterprise — https://ai.wharton.upenn.edu/wp-content/uploads/2025/10/2025-Wharton-GBK-AI-Adoption-Report_Executive-Summary.pdf

#### Segments

1. Not only you — teams, companies, same wall
2. Adopted, not absorbed — tools in, workflows unchanged
3. Reinvest — new skills, new disciplines, across the organization

## Your move {#your-move}

### Write the day-one note first {#write-the-day-one-note}

#### Visual

master: basic-page · motion: liquid-ink-transition

The basic-page master holds the title "Day one, before you type" and a caption. No catalog match: the wanted layout is a blank note with a cursor holding four plain short lines to fill in, the context, the tools they would need, the brief, and how you will check their work. Each line has a blank to write on; no quadrants, indexes or tints.

#### Speaker notes

1. **Why check is on the list** — Anthropic's guidance for its coding agent is to give it a way to verify its work and, if you cannot verify it, not to ship it. The page was quoted from an earlier fetch, not re-fetched [1].
   - sources: [1] Best practices for Claude Code — https://code.claude.com/docs/en/best-practices
2. **A short checklist can cut errors in skilled work** — a 19-item surgical checklist was associated with inpatient death falling from 1.5% to 0.8%. This is surgery, not AI; it shows only that a simple step helps experts [2].
   - sources: [2] A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population — https://pubmed.ncbi.nlm.nih.gov/19144931/
3. **Keep the note short** — a line stays only if removing it would cause mistakes; bloated instruction files lead the model to ignore the actual instructions [3].
   - sources: [3] Best practices for Claude Code — https://code.claude.com/docs/en/best-practices

#### Segments

1. Next time — something real, before a word
2. Jot it down — day one, a new colleague
3. Four lines — context, tools, brief, check
4. Two minutes — small, then type

### AI can help you onboard AI {#ai-can-help-you-onboard-ai}

#### Visual

master: basic-page · motion: liquid-ink-transition

One line of text on a clear frame, "AI can help you onboard AI.", and under it a small quiet pointer to the grill-me approach. It ends the Episode cleanly; nothing is promised for the next one.

#### Speaker notes

1. **Why the effort pays back** — the shift from doing to managing is a skill you can practise, and it is the same one organizations must build. Anthropic's usage data links six months or more of experience with a 3 to 5 point higher success rate, observational and model-graded [1].
   - sources: [1] Anthropic Economic Index report: Learning Curves — https://www.anthropic.com/research/economic-index-march-2026-report

#### Segments

1. It feels like a lot — the weight, honest
2. The twist — AI helps you onboard AI
3. Grill-me, lightly — let it ask you the questions, then you are done
