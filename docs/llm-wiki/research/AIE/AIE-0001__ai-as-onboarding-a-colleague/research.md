---
type: research
title: 'Why do others frame working with AI as onboarding a colleague?'
description: 'Vendors and practitioners call AI a new colleague because it has broad ability but no knowledge of your work, so you must supply context, a brief and checks.'
confidence: contested
informs: [agentic-ai, context-engineering]
generated:
  by: claude-code/opus-5.5
  at: 2026-10-13T00:00:00Z
stale_after: 2027-04-13T00:00:00Z
sources:
  - id: 1
    resource: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
    title: 'Anthropic, Be clear and direct (prompting guidance)'
  - id: 2
    resource: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
    title: 'Anthropic Engineering, Effective harnesses for long-running agents (published 26 Nov 2025)'
  - id: 3
    resource: https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock
    title: 'Gergely Orosz, AI Skills with Matt Pocock, The Pragmatic Engineer (17 Sep 2026; podcast notes quoting Pocock)'
  - id: 4
    resource: https://www.oneusefulthing.org/p/on-boarding-your-ai-intern
    title: 'Ethan Mollick, On-boarding your AI Intern, One Useful Thing (20 May 2023)'
  - id: 5
    resource: https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough
    title: 'Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024)'
  - id: 6
    resource: https://x.com/karpathy/status/1868061331355840704
    title: 'Andrej Karpathy, post on X (14 Dec 2024)'
  - id: 7
    resource: https://hbr.org/2026/03/create-an-onboarding-plan-for-ai-agents
    title: 'Joseph Fuller, Create an Onboarding Plan for AI Agents, Harvard Business Review (25 Mar 2026)'
  - id: 8
    resource: https://github.com/hancrafted/content-library/blob/9d1648022ac049eb2001917ada8a96d14af3d247/docs/research/ai-onboarding-freelancer.md
    title: 'Earlier research file, Onboarding an AI agent like an amnesiac freelancer (docs/research/ai-onboarding-freelancer.md, researched 2026-10-08)'
  - id: 9
    resource: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
    title: 'Michael Nygard, Documenting Architecture Decisions'
  - id: 10
    resource: https://code.claude.com/docs/en/best-practices
    title: 'Anthropic, Claude Code best practices'
  - id: 11
    resource: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
    title: 'GitHub Docs, Add repository custom instructions for Copilot'
  - id: 12
    resource: https://agents.md
    title: 'AGENTS.md, README for agents'
  - id: 13
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, Claude Code memory'
---

# Why do others frame working with AI as onboarding a colleague?

## Context

Asked to support the claim that "treat AI like a new colleague you must onboard" is an established lens and not one speaker's invention. The question is why several independent voices reach the same frame, and where the frame is contested.

## Answer

Several independent voices, from a model vendor to a well-known AI educator and a TypeScript educator, use the new-colleague frame because the AI's situation matches a newcomer's: broad general ability, no knowledge of your norms, projects or history, and no memory that carries over between sessions. A newcomer is useful only after someone supplies context, a clear brief and a way to check the work, so the frame points at the human's management effort rather than at the tool. The lens is not uncontested: Mollick later called the "intern" version too constraining, because current models can outperform an intern, and kept a "new coworker" version. Where the frame stops fitting (the agent does not learn between sessions, and instructions in prose are not enforced) is itself a reason the human must write things down.

## Findings

1. Anthropic's prompting guidance tells the reader to brief the model as a capable newcomer: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows." Its test is to show the prompt to a colleague with minimal context and see whether they would be confused [1].
2. Anthropic's engineering team describes long-running agents as engineers in shifts: "engineers working in shifts, where each new engineer arrives with no memory of what happened on the previous shift". Its remedy is written hand-over artefacts that each new session reads first, as a shift change would require [1][2].
3. Matt Pocock, on The Pragmatic Engineer podcast (17 Sep 2026), frames the agent as a colleague with no memory: "Imagine you have a human who wakes up every morning and cannot remember who they are, like the guy from Memento." He says "We are trying to optimize our codebases for new starters" and that, unlike a human, an agent "starts afresh every single session", so the codebase must be optimized for it [3].
4. Ethan Mollick used the intern form of the lens in 2023: "several billion people just got free interns", and "Just like any new worker, you are going to have to learn its strengths and weaknesses". He added that he uses "intern" as "a very loose analogy" and that the AI "makes stuff up all the time", so its work needs checking [4].
5. Mollick revised the lens in November 2024. He said the intern advice "ends up making people use AI in very constrained ways", and proposed treating AI "like an infinitely patient new coworker who forgets everything you tell them each new conversation". Of its four features he counts being new on the job and being a coworker as human-like, and forgetting and infinite patience as alien. The coworker frame means collaborating instead of issuing commands, and forgetting means supplying context each time. This new-coworker form replaces his 2023 intern form (Finding 4) [5].
6. Andrej Karpathy (14 Dec 2024) turned the frame into a capability test. He wrote that the most bullish capability he looks for "is not whether it's able to solve PhD grade problems. It's whether you'd hire it as a junior intern", and that the task is not "solve this theorem" but "get your slack set up, read these onboarding docs, do this task and let's check in next week". Onboarding is the yardstick for usefulness [6].
7. Harvard Business School's Joseph Fuller (HBR, 25 Mar 2026) argues that companies "are missing out on AI's value because they have not changed the way work is organized around it" and that agentic AI is "primarily about managing work". The read text of the article was limited to its summary; it supports the management reading of the frame, not a claim that it uses the onboarding words [7].
8. Carried from the earlier research file: the human practice the frame borrows from is old. Michael Nygard wrote decision records for the later newcomer: "We will write each ADR as if it is a conversation with a future developer", at one or two pages. Without the record, a newcomer must blindly accept or blindly change a decision [8][9].
9. Carried from the earlier research file: vendors converge on a brief file read at the start of every session (CLAUDE.md, AGENTS.md, copilot-instructions.md). Anthropic: "CLAUDE.md is a special file that Claude reads at the start of every conversation", and "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!". GitHub describes its template as information for an agent "seeing it for the first time", capped at 2 pages [8][10][11][12].
10. Carried from the earlier research file: the frame includes checking the work. Anthropic's best-practice page says to "Give Claude a way to verify its work" and "If you can't verify it, don't ship it" [8][10].
11. Where the frame breaks: a human newcomer learns on the job and an agent does not, so anything unwritten is gone. Anthropic's shift metaphor has each new session arrive "with no memory" [2], Pocock says an agent "starts afresh every single session" [3], and Mollick's coworker "forgets everything you tell them each new conversation" [5]. Prose instructions are also "context, not enforced configuration" (carried from the earlier research file, quote as recorded there), so rules that must hold need hooks or checks [13].

## Caveats

- The consultant's workshop that Han reports is his own testimony. It has no public source, so it is not evidence here and no Finding rests on it.
- The Anthropic prompting page [1] and the sources [9], [10], [11], [12] and [13] were read in the earlier file's pass on 2026-10-08 and are not re-fetched here; the quotes are carried from that file, now removed from the repository [8]. Finding 11's quote from [13] is unverified in this pass.
- Finding 3 rests on the podcast's published notes, not the full audio. A BigGo summary attributes "very fast, very forgetful junior developers" to Pocock, but that wording was not found in a primary text and is not used. The notes use "colleague" and "new starters", not "junior".
- Finding 6's wording was checked on 2026-10-13 against the full post text (273 characters, two paragraphs) from X's syndication endpoint (cdn.syndication.twimg.com); x.com itself returns HTTP 402 and was not read directly.
- Finding 7: HBR is paywalled and only the summary was read.
- The "amnesiac" wording is Han's and this file's inference from Mollick's "forgets everything" and Pocock's Memento; Anthropic's page does not use "amnesia".
- The sources are practitioners and vendors giving advice. They show the lens is common, not that it measurably improves results; that is outside this question.
- Mollick's later rejection of "intern" is the strongest counter-evidence to the lens in its junior form. He keeps a new-coworker form, which is the form this file supports.

[1]: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct 'Anthropic, Be clear and direct (prompting guidance)'
[2]: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents 'Anthropic Engineering, Effective harnesses for long-running agents (published 26 Nov 2025)'
[3]: https://newsletter.pragmaticengineer.com/p/ai-skills-with-matt-pocock 'Gergely Orosz, AI Skills with Matt Pocock, The Pragmatic Engineer (17 Sep 2026; podcast notes quoting Pocock)'
[4]: https://www.oneusefulthing.org/p/on-boarding-your-ai-intern 'Ethan Mollick, On-boarding your AI Intern, One Useful Thing (20 May 2023)'
[5]: https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough 'Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024)'
[6]: https://x.com/karpathy/status/1868061331355840704 'Andrej Karpathy, post on X (14 Dec 2024)'
[7]: https://hbr.org/2026/03/create-an-onboarding-plan-for-ai-agents 'Joseph Fuller, Create an Onboarding Plan for AI Agents, Harvard Business Review (25 Mar 2026)'
[8]: https://github.com/hancrafted/content-library/blob/9d1648022ac049eb2001917ada8a96d14af3d247/docs/research/ai-onboarding-freelancer.md 'Earlier research file, Onboarding an AI agent like an amnesiac freelancer (docs/research/ai-onboarding-freelancer.md, researched 2026-10-08)'
[9]: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions 'Michael Nygard, Documenting Architecture Decisions'
[10]: https://code.claude.com/docs/en/best-practices 'Anthropic, Claude Code best practices'
[11]: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions 'GitHub Docs, Add repository custom instructions for Copilot'
[12]: https://agents.md 'AGENTS.md, README for agents'
[13]: https://code.claude.com/docs/en/memory 'Anthropic, Claude Code memory'
