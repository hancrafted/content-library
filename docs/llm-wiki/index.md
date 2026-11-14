---
okf_version: '0.2'
---

# LLM wiki

Research any Episode can cite, one file per question. The retrieval job reads each description to decide whether a file answers a new question.

## Research

### AI Enablement (AIE)

- [Why do others frame working with AI as onboarding a colleague?](research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md) — Vendors and practitioners call AI a new colleague because it has broad ability but no knowledge of your work, so you must supply context, a brief and checks.
- [Why do individuals fail to reach the promised AI productivity boost?](research/AIE/AIE-0002__individual-ai-productivity-gap/research.md) — Individuals miss the promised AI boost because gains depend on task fit, context and checking: measured effects are mixed and smaller than the hype, and self-reports overstate them.
- [Why do organizations fail to reach the promised AI productivity boost?](research/AIE/AIE-0003__organizational-ai-productivity-gap/research.md) — AI value needs complementary investment in workflows and skills that adoption alone skips, so measured firm gains are small; the "95% of pilots fail" figure is disputed, but the gap is real.
- [Why does richer context and a clearer brief measurably improve AI output?](research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md) — Relevant, specific context and a fully specified brief measurably lift LLM output, but padding, noise and boilerplate overviews do not help and can hurt.
- [Why does unchecked AI work carry real risk?](research/AIE/AIE-0005__risks-of-unchecked-ai-output/research.md) — Unchecked AI output has caused documented harm, from sanctioned fake citations to less secure code written with more confidence, so someone must verify it.
- [Why is effective AI delegation a management discipline rather than a skill of seniority, given that AI boosts novices more on simple tasks?](research/AIE/AIE-0006__ai-delegation-as-management-skill/research.md) — Delegating real work to AI takes management disciplines (briefing, context, verification) that experience merely correlates with, and novice-boost studies measure bounded tasks, not that discipline.
- [Why does decomposing a complex task into smaller subtasks improve LLM results?](research/AIE/AIE-0007__task-decomposition-improves-llm/research.md) — Models often solve each sub-problem yet fail to compose them, and decomposing into simpler, separately prompted subtasks closes much of that gap.
- [Why do explicit written requirements reduce the variation in LLM output?](research/AIE/AIE-0008__written-requirements-reduce-variance/research.md) — A stated requirement is met more steadily across prompts and model updates than a guessed one, but stating all at once can lower compliance and run noise remains.
- [Why does letting an LLM ask clarifying questions before a task improve the result?](research/AIE/AIE-0009__clarifying-questions-before-task/research.md) — Clarifying questions improve results because they replace the model's guesses about missing requirements with the user's answers, but only for underspecified tasks.
- [Why does checking intermediate steps catch errors that a review of only the final result misses?](research/AIE/AIE-0010__checking-intermediate-steps/research.md) — A correct-looking final answer can rest on flawed reasoning, so step-level checks find errors that final-result checks pass, though models cannot reliably find those errors in themselves.
- [Why does a fresh, focused context outperform a long, accumulated chat?](research/AIE/AIE-0011__fresh-context-beats-long-chat/research.md) — A fresh, focused context outperforms a long chat because accuracy falls as input grows and a model that took a wrong turn leans on its own earlier attempts and does not recover.
- [Why does the claim of 20x productivity from AI rest on estimates rather than measurement?](research/AIE/AIE-0017__twenty-x-productivity-claim/research.md) — The 20x figure is an estimate from interested parties about leading-edge programmers, not a measurement; controlled studies find gains far smaller, and sometimes a slowdown.
- [Why does AI-assisted execution move the bottleneck to specification and review?](research/AIE/AIE-0018__ai-shifts-bottleneck-to-spec-and-review/research.md) — AI speeds up execution but the saved time is re-spent on verification, and review load rises with no company-level gain; the specification half is inferred, not measured.

### Evals (EVAL)

- [Why does an agent eval need repeated trials, frozen inputs and replayed tool calls before two variants can be compared?](research/EVAL/EVAL-0001__comparable-agent-eval-scores/research.md) — One agent run is one draw and the world it calls drifts, so a score difference means something only with several trials per task on frozen tasks and replayed calls, paired by task with error bars.

### Large language models (LLM)

- [Why do large language models give different answers to the same prompt?](research/LLM/LLM-0001__llm-output-nondeterminism/research.md) — Models sample each next token from a probability distribution, and even with sampling switched off, server-side numerical effects still change the output between runs.
- [Why does an LLM resend the whole chat on every message?](research/LLM/LLM-0002__llm-resends-whole-chat/research.md) — The model keeps no state between requests, so each message must carry the full conversation as input, and that whole input is processed and billed again unless a cache covers it.
- [Why does an LLM forget everything between chats?](research/LLM/LLM-0003__llm-memory-between-chats/research.md) — A model keeps nothing between requests, so it only knows what the current context holds; any memory across chats is text an application stores and sends again.
- [Why do LLMs answer confidently instead of asking when a prompt is vague?](research/LLM/LLM-0004__llm-confidence-on-vague-prompts/research.md) — Training and evaluation reward a committed answer over an abstention or a clarifying question, so language models guess one reading of a vague prompt.
- [Why does an LLM trained on public text lack knowledge of a specific organisation?](research/LLM/LLM-0005__llm-lacks-organization-knowledge/research.md) — An LLM lacks organisational knowledge because a company's internal facts are absent from public training text, and rare facts are learned poorly even when present.
- [Why does a role line shape an LLM's tone and depth but not its accuracy?](research/LLM/LLM-0011__role-line-tone-not-accuracy/research.md) — Studies find that a persona or role line does not reliably raise factual accuracy, while it does shift style and depth; vendor guides describe a role as a tone and focus setting.
- [Why does fencing pasted text keep an LLM from following instructions hidden in it?](research/LLM/LLM-0012__fencing-pasted-text-hides-orders/research.md) — A fence marks which text is input, which lowers the rate of obeyed hidden instructions, but models do not enforce the boundary, so fencing reduces the risk and does not prevent it.
- [Why does one worked example hold an LLM to a format better than a description does?](research/LLM/LLM-0013__worked-example-holds-format/research.md) — Demonstrations teach the model the output format directly, but no study found compares one example with a clear description on modern models.
- [Why does a stated output template make an LLM's answers readable by the next chat?](research/LLM/LLM-0014__output-template-chains-chats/research.md) — A stated format steers output and chains pass one output in as the next input, but no source tests a fixed template as the handoff between chats.
- [Why does permission to answer "unknown" reduce made-up answers?](research/LLM/LLM-0015__permission-to-say-unknown/research.md) — An explicit "I don't know" option removes the pressure to guess, but in prompt-only tests it helps only modestly and mostly turns wrong answers into refusals.
- [Why does asking for a source per claim help with unsupported claims in a web-search answer?](research/LLM/LLM-0016__source-per-claim-checkable/research.md) — A source per claim makes each claim checkable by a person and a later chat, but the studies do not show it makes the model state fewer unsupported claims, and cited sources are often wrong.
- [Why does a fresh chat catch errors the chat that wrote the answer misses?](research/LLM/LLM-0017__fresh-chat-review-catches-errors/research.md) — A review in the chat that wrote the answer leans toward approving it; a fresh chat drops that context, but the gain over one self-review is thin.
- [Why are a model, prompting, an agent, a workflow and a factory distinct layers of working with AI?](research/LLM/LLM-0018__ai-layers-model-to-factory/research.md) — A large language model is the foundation; prompting, agents and workflows have first-party definitions, while "factory" is a 2026 practitioner label with no settled definition.
- [Why do measured AI productivity gains fall short of the ceilings claimed for prompting, agents, workflows and a factory?](research/LLM/LLM-0019__ai-productivity-ceiling-per-level/research.md) — Randomised studies measure about 1.1 to 1.6x for chat-style prompting and 0.8 to 1.2x for coding agents; no study measures a workflow or a factory.
- [Why is there a gap between how workers use AI and what leaders expect from it?](research/LLM/LLM-0020__ai-usage-gap-workers-leaders/research.md) — Surveys show a minority of AI users work with agents and leaders are more familiar with agents and more optimistic than employees, but no source measures leaders expecting factory-scale gains.
- [Why does a language model's output get worse when its context holds distractors, contradictions or unclear instructions?](research/LLM/LLM-0022__context-rot-from-muddy-context/research.md) — Output gets worse when the context holds irrelevant, conflicting or underspecified material, not only when it is long, because early wrong assumptions persist.
- [Why do prompt, context, harness, loop and graph engineering matter at different AI capability Levels?](research/LLM/LLM-0023__ai-disciplines-prompt-to-graph/research.md) — Prompt and context engineering are older practice, harness, loop and graph engineering are 2026 names; loop and graph have thin primary evidence and graph is contested as a discipline.
- [Why do human-in, human-on and human-out-of-the-loop mark different AI capability Levels?](research/LLM/LLM-0024__human-in-on-out-of-the-loop/research.md) — The three terms come from military autonomy policy and the EU 2019 ethics guidelines; applied to LLM agents they are used loosely, and the evidence supports the product owner's ordering only in part.
- [Why do workers, AI users and leaders sit at different AI capability Levels?](research/LLM/LLM-0025__ai-adoption-per-capability-level/research.md) — Per-Level adoption numbers for Prompting, Agents, Workflows and Factory with the population stated for each, plus one direct source for leaders expecting autonomous operation.

### Organizations (ORG)

- [Why does tacit organisational knowledge fail to transfer during employee onboarding?](research/ORG/ORG-0001__tacit-knowledge-onboarding-transfer/research.md) — Tacit knowledge resists being written down, and the receiver needs prior knowledge and close contact to absorb it, so what is not shown in practice is lost on a newcomer.

### Sales (SALES)

- [Why do typical B2B sales cycles take as long as they do?](research/SALES/SALES-0001__b2b-sales-cycle-length/research.md) — B2B sales cycles are long because the buyer is a group whose members each hold veto power, so cycle length is significantly affected by group size and purchase type.
- [Why are stage conversion rates in a B2B sales pipeline as low as they are?](research/SALES/SALES-0002__b2b-pipeline-conversion-rates/research.md) — Each stage filters out most entries, buying groups of many people must agree, and the biggest loss is buyers who decide nothing, so only a minority of opportunities close.
- [Why does selling early yield market insight?](research/SALES/SALES-0003__early-selling-market-insight/research.md) — Selling early yields market insight because founders start with an inaccurate model of their customers, and only direct contact with real buyers replaces that guess with facts.
- [Why does engaging in sales and obtaining early sales results, like LOI, filled sales pipeline, generate trust?](research/SALES/SALES-0004__early-sales-results-build-trust/research.md) — Early sales results are costly, observable signals of quality that cut a buyer's or investor's uncertainty about a young firm, but no study measures letters of intent or pipelines directly.
- [Why does engaging in sales early lead to a repeatable sales process?](research/SALES/SALES-0005__early-selling-repeatable-process/research.md) — Early selling by the founders is how a startup learns who buys, why and how, and a repeatable sales process is that learning written down; scaling before it exists burns cash.
- [Why does building an effective sales pipeline take months to ramp up?](research/SALES/SALES-0006__sales-pipeline-ramp-up-time/research.md) — A pipeline takes months because the market, the buyer and the metrics are unknown at the start, and each must be learned through real conversations before a repeatable process exists.

### Startups (START)

- [Why does revenue typically lag the costs that generate it in an early-stage startup?](research/START/START-0001__revenue-lags-costs-in-startups/research.md) — Revenue lags costs because a startup pays for building, hiring and selling before customers exist, then waits through deal closing, invoicing and payment terms before cash arrives.

### Software engineering (SWE)

- [Why does the software ecology video treat software as a socio-technical ecosystem?](research/SWE/SWE-0001__software-as-socio-technical-system/research.md) — The software ecology talk treats software as a socio-technical ecosystem because what an organization builds mirrors its people, culture and tools, so no single node explains or fixes the whole.
- [Why do unclear requirements lead to rework and failed projects?](research/SWE/SWE-0002__unclear-requirements-cause-rework/research.md) — Practitioners name incomplete requirements their top problem and report rework and overruns, but the famous failure rates and the 100x late-fix cost are disputed.

## Raw

### Google 5-Day Agents & Vibe Coding

- [Day 1 - The New SDLC with Vibe Coding](<raw/google-5-day-agents-vibecoding/Day 1 - The New SDLC with Vibe Coding/Day 1 - The New SDLC with Vibe Coding.pdf>) — Traces the shift from syntax to intent across the software development lifecycle, contrasting ad-hoc vibe coding with disciplined agentic and harness engineering where developers act as conductors and orchestrators.
- [Day 2 - Agent Tools & Interoperability](<raw/google-5-day-agents-vibecoding/Day 2 - Agent Tools & Interoperability/Day 2 - Agent Tools & Interoperability.pdf>) — Covers open interoperability standards—MCP for tool connections, A2A for multi-agent delegation, A2UI for generative interfaces, and AP2/UCP for autonomous commerce—that turn isolated agents into modular systems.
- [Day 3 - Agent Skills](<raw/google-5-day-agents-vibecoding/Day 3 - Agent Skills/Day 3 - Agent Skills.pdf>) — Introduces Agent Skills (`SKILL.md` folders with scripts, references and assets) as a portable procedural-memory primitive that loads specialist instructions on demand via progressive disclosure to avoid context bloat.
- [Day 4 - Vibe Coding Agent Security and Evaluation](<raw/google-5-day-agents-vibecoding/Day 4 - Vibe Coding Agent Security and Evaluation/Day 4 - Vibe Coding Agent Security and Evaluation.pdf>) — Defines a 7-pillar defense-in-depth security harness (sandboxing, supply-chain defense, scoped identity, and Red/Blue/Green SecOps) alongside trajectory and outcome evaluation for non-deterministic coding agents.
- [Day 5 - Spec-Driven Production Grade Development in the Age of Vibe Coding](<raw/google-5-day-agents-vibecoding/Day 5 - Spec-Driven Production Grade Development in the Age of Vibe Coding/Day 5 - Spec-Driven Production Grade Development in the Age of Vibe Coding.pdf>) — Shows how to turn vibe-coded prototypes into production software using Spec-Driven and Behavior-Driven Development, hierarchical context files (`AGENTS.md`, `GEMINI.md`, `SKILL.md`), AI-generated tests, and zero-trust guardrails.

### Private

- [Storytelling with Data: A Data Visualization Guide for Business Professionals](<raw/private/Cole Nussbaumer Knaflic - Storytelling with Data_ A Data Visualization Guide for Business Professionals (2016_2015, John Wiley & Sons) - libgen.li/Cole Nussbaumer Knaflic - Storytelling with Data_ A Data Visualization Guide for Business Professionals (2016_2015, John Wiley & Sons) - libgen.li.pdf>) — Practical guide by Cole Nussbaumer Knaflic on communicating quantitative findings clearly by establishing context, choosing appropriate chart types, eliminating visual clutter, directing audience attention, and structuring a narrative.
- [Don't Make Me Think, Revisited: A Common Sense Approach to Web Usability (3rd Edition)](<raw/private/Don't Make Me Think, Revisited, 3rd Edition/Don't Make Me Think, Revisited, 3rd Edition.pdf>) — Steve Krug's guide to web and mobile usability built around self-evident interfaces, designing for scanning rather than reading, clear navigation, and lightweight, frequent usability testing.
