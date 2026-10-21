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

### Large language models (LLM)

- [Why do large language models give different answers to the same prompt?](research/LLM/LLM-0001__llm-output-nondeterminism/research.md) — Models sample each next token from a probability distribution, and even with sampling switched off, server-side numerical effects still change the output between runs.
- [Why does an LLM resend the whole chat on every message?](research/LLM/LLM-0002__llm-resends-whole-chat/research.md) — The model keeps no state between requests, so each message must carry the full conversation as input, and that whole input is processed and billed again unless a cache covers it.
- [Why does an LLM forget everything between chats?](research/LLM/LLM-0003__llm-memory-between-chats/research.md) — A model keeps nothing between requests, so it only knows what the current context holds; any memory across chats is text an application stores and sends again.
- [Why do LLMs answer confidently instead of asking when a prompt is vague?](research/LLM/LLM-0004__llm-confidence-on-vague-prompts/research.md) — Training and evaluation reward a committed answer over an abstention or a clarifying question, so language models guess one reading of a vague prompt.
- [Why does an LLM trained on public text lack knowledge of a specific organisation?](research/LLM/LLM-0005__llm-lacks-organization-knowledge/research.md) — An LLM lacks organisational knowledge because a company's internal facts are absent from public training text, and rare facts are learned poorly even when present.

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
