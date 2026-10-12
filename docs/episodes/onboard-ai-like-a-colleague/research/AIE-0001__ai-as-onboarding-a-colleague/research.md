---
type: research
description: 'Vendors and practitioners call AI a new colleague because it has broad ability but no knowledge of your work, so you must supply context, a brief and checks.'
question: 'Why do others frame working with AI as onboarding a colleague?'
researched_on: 2026-10-12T00:00:00Z
stale_after: 2027-04-12T00:00:00Z
---

# Why do others frame working with AI as onboarding a colleague?

## Context

Asked to support the claim that "treat AI like a new colleague you must onboard" is an established lens and not one speaker's invention. The question is why several independent voices reach the same frame, and where the frame is contested.

## Answer

Several independent voices, from a model vendor to a well-known AI educator and a TypeScript educator, use the new-colleague frame because the AI's situation matches a newcomer's: broad general ability, no knowledge of your norms, projects or history, and no memory that carries over between sessions. A newcomer is useful only after someone supplies context, a clear brief and a way to check the work, so the frame points at the human's management effort rather than at the tool. The lens is not uncontested: Mollick later called the "intern" version too constraining, because current models can outperform an intern, and kept a "new coworker" version. Where the frame stops fitting (the agent does not learn between sessions, and instructions in prose are not enforced) is itself a reason the human must write things down.

## Findings

1. Anthropic's prompting guidance tells the reader to brief the model as a capable newcomer: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows." Its test is to show the prompt to a colleague with minimal context and see whether they would be confused [1][2].
2. Anthropic's engineering team describes long-running agents as engineers in shifts: "engineers working in shifts, where each new engineer arrives with no memory of what happened on the previous shift". Its remedy is written hand-over artefacts that each new session reads first, as a shift change would require [1][3].
3. Matt Pocock, on The Pragmatic Engineer podcast (17 Sep 2026), frames the agent as a colleague with no memory: "Imagine you have a human who wakes up every morning and cannot remember who they are, like the guy from Memento." He says "We are trying to optimize our codebases for new starters" and that, unlike a human, an agent "starts afresh every single session", so the codebase must be optimized for it [4].
4. Ethan Mollick used the intern form of the lens in 2023: "several billion people just got free interns", and "Just like any new worker, you are going to have to learn its strengths and weaknesses". He added that he uses "intern" as "a very loose analogy" and that the AI "makes stuff up all the time", so its work needs checking [5].
5. Mollick revised the lens in November 2024. He said the intern advice "ends up making people use AI in very constrained ways", and proposed treating AI "like an infinitely patient new coworker who forgets everything you tell them each new conversation". Of its four features he counts being new on the job and being a coworker as human-like, and forgetting and infinite patience as alien. The coworker frame means collaborating instead of issuing commands, and forgetting means supplying context each time [6].
6. Andrej Karpathy (14 Dec 2024) turned the frame into a capability test: whether you would "hire it as a junior intern", where the task is not to solve a theorem but to set up its Slack, read the onboarding docs, do a task and check in the next week. That is, onboarding is the yardstick for usefulness [7].
7. Harvard Business School's Joseph Fuller (HBR, 25 Mar 2026) argues that companies "are missing out on AI's value because they have not changed the way work is organized around it" and that agentic AI is "primarily about managing work". The read text of the article was limited to its summary; it supports the management reading of the frame, not a claim that it uses the onboarding words [8].
8. Carried from the earlier research file: the human practice the frame borrows from is old. Michael Nygard wrote decision records for the later newcomer: "We will write each ADR as if it is a conversation with a future developer", at one or two pages. Without the record, a newcomer must blindly accept or blindly change a decision [9][10].
9. Carried from the earlier research file: vendors converge on a brief file read at the start of every session (CLAUDE.md, AGENTS.md, copilot-instructions.md). Anthropic: "CLAUDE.md is a special file that Claude reads at the start of every conversation", and "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!". GitHub describes its template as information for an agent "seeing it for the first time", capped at 2 pages [9][11][12][13].
10. Carried from the earlier research file: the frame includes checking the work. Anthropic's best-practice page says to "Give Claude a way to verify its work" and "If you can't verify it, don't ship it" [9][11].
11. Carried from the earlier research file, where the frame breaks: a freelancer learns by week three and an agent does not, so anything unwritten is gone; and prose instructions are "context, not enforced configuration", so rules that must hold need hooks or checks [9][14].

## Sources

1. Anthropic, Be clear and direct (prompting guidance) — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct — accessed 2026-10-08 via [9], quotes as recorded there
2. Anthropic, Be clear and direct — same page as [1], used for the colleague-with-minimal-context test — https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct — accessed 2026-10-08 via [9]
3. Anthropic Engineering, Effective harnesses for long-running agents (published 26 Nov 2025) — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents — accessed 2026-10-12
4. Gergely Orosz, AI Skills with Matt Pocock, The Pragmatic Engineer (17 Sep 2026; podcast notes quoting Pocock) — https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock — accessed 2026-10-12
5. Ethan Mollick, On-boarding your AI Intern, One Useful Thing (20 May 2023) — https://www.oneusefulthing.org/p/on-boarding-your-ai-intern — accessed 2026-10-12
6. Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024) — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough — accessed 2026-10-12
7. Andrej Karpathy, post on X (14 Dec 2024) — https://x.com/karpathy/status/1868061331355840704 — accessed 2026-10-12 (via X's syndication endpoint; page itself returned HTTP 402)
8. Joseph Fuller, Create an Onboarding Plan for AI Agents, Harvard Business Review (25 Mar 2026) — https://hbr.org/2026/03/create-an-onboarding-plan-for-ai-agents — accessed 2026-10-12 (summary only, paywalled)
9. Earlier research file this one extends: Onboarding an AI agent like an amnesiac freelancer — docs/research/ai-onboarding-freelancer.md — accessed 2026-10-12 (researched 2026-10-08)
10. Michael Nygard, Documenting Architecture Decisions — https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions — accessed 2026-10-08 via [9]
11. Anthropic, Claude Code best practices — https://code.claude.com/docs/en/best-practices — accessed 2026-10-08 via [9]
12. GitHub Docs, Add repository custom instructions for Copilot — https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions — accessed 2026-10-08 via [9]
13. AGENTS.md, README for agents — https://agents.md — accessed 2026-10-08 via [9]
14. Anthropic, Claude Code memory — https://code.claude.com/docs/en/memory — accessed 2026-10-08 via [9]

## Caveats

- The consultant's workshop that Han reports is his own testimony. It has no public source, so it is not evidence here and no Finding rests on it.
- Sources [1], [2], [10] to [14] were read in the earlier file's pass on 2026-10-08 and are not re-fetched here; the quotes are carried from that file.
- Finding 3 rests on the podcast's published notes, not the full audio. A BigGo summary attributes "very fast, very forgetful junior developers" to Pocock, but that wording was not found in a primary text and is not used. The notes use "colleague" and "new starters", not "junior".
- Finding 6 quotes only the first sentence and paraphrases the rest, because the tweet text was read through a syndication endpoint with a quote limit; check wording against the post before showing it on a slide.
- Finding 7: HBR is paywalled and only the summary was read.
- The "amnesiac" wording is Han's and this file's inference from Mollick's "forgets everything" and Pocock's Memento; Anthropic's page does not use "amnesia".
- The sources are practitioners and vendors giving advice. They show the lens is common, not that it measurably improves results; that is outside this question.
- Mollick's later rejection of "intern" is the strongest counter-evidence to the lens in its junior form. He keeps a new-coworker form, which is the form this file supports.
