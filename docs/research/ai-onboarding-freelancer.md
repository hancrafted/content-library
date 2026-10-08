# Onboarding an AI agent like an amnesiac freelancer

Question: if you treat an AI agent as a skilled freelancer who arrives with no memory of the project every single time, what does good onboarding look like?

Researched 2026-10-08. Vendor pages were fetched and quoted directly; quotes are verbatim from the fetched text. Items I could not verify are flagged in "Sources".

## Summary

- Anthropic itself uses the onboarding frame: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows." Its golden rule is to show your prompt to a colleague with minimal context and see if they would be confused.
- The agent's briefing is a file loaded at the start of every session (CLAUDE.md, AGENTS.md, copilot-instructions.md). Vendors converge on one pattern: a short, predictable, repo-level "README for agents" plus build/test commands, with nested files for sub-areas.
- Short beats complete. Anthropic says bloated CLAUDE.md files cause Claude to ignore the actual instructions, GitHub caps its own onboarding template at 2 pages, and Nygard capped ADRs at one or two pages for humans. All three are the same constraint: attention is finite.
- The most valuable artefact is a way to check work: tests, build commands, scripts. Anthropic: "Give Claude a way to verify its work." This is the agent version of a definition of done, and it is the only part that does not depend on the agent reading and obeying prose.
- The metaphor breaks in three places. The freelancer improves over weeks and the agent does not (so write down everything), the agent follows text literally and treats instructions as context, not enforced configuration (so enforce hard rules with hooks or checks), and every line you add costs context for every task.

## Findings

### 1. Vendors explicitly use the new-employee frame

- Claim: Anthropic's prompting guidance tells you to brief the model as you would a capable newcomer with no context.
- Source: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
- Quote: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows. The more precisely you explain what you want, the better the result."
- Quote: "Show your prompt to a colleague with minimal context on the task and ask them to follow it. If they'd be confused, Claude will be too."
- Not found: the string "amnesia" does not appear on this page. The "brilliant new employee with amnesia" phrasing is not in the fetched text; treat it as unverified paraphrase and do not attribute it to Anthropic. The page also says: "If you want 'above and beyond' behavior, explicitly request it rather than relying on the model to infer this from vague prompts."

### 2. The brief is a file the agent reads at the start of every conversation

- Claim: Claude Code loads CLAUDE.md at the start of every session to give persistent context it cannot infer from the code.
- Source: https://code.claude.com/docs/en/best-practices
- Quote: "CLAUDE.md is a special file that Claude reads at the start of every conversation. Include Bash commands, code style, and workflow rules. This gives Claude persistent context it can't infer from code alone."
- Claim: Claude Code also has auto memory, so "no memory" is a choice of configuration, not a hard limit. Both systems load at conversation start.
- Source: https://code.claude.com/docs/en/memory
- Quote: "Claude Code has two complementary memory systems. Both are loaded at the start of every conversation."

### 3. Keep the brief small: bloat makes the agent ignore it

- Claim: Anthropic's pruning test is whether removing a line would cause mistakes.
- Source: https://code.claude.com/docs/en/best-practices
- Quote: "Would removing this cause Claude to make mistakes?" followed by "If not, cut it. Bloated CLAUDE.md files cause Claude to ignore your actual instructions!"
- Quote: "If your CLAUDE.md is too long, Claude ignores half of it because important rules get lost in the noise."
- Claim: Material that applies only sometimes belongs elsewhere, not in the always-loaded file.
- Quote: "CLAUDE.md is loaded every session, so only include things that apply broadly. For domain knowledge or workflows that are only relevant sometimes, use" skills.
- Claim: Splitting into imports does not save context.
- Source: https://code.claude.com/docs/en/memory
- Quote: imports "help you organize a long file but don't reduce its context cost, because imported files also load at launch."

### 4. Context is a finite budget

- Claim: Anthropic's engineering team frames context as a scarce resource with diminishing returns and recommends the smallest sufficient set.
- Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Quote: "Context, therefore, must be treated as a finite resource with diminishing marginal returns."
- Quote: "you should be striving for the minimal set of information that fully outlines your expected behavior. (Note that minimal does not necessarily mean short; you still need to give the agent sufficient information up front)."
- Claim: Prefer pointers the agent can follow on demand over pasting everything.
- Quote: agents "maintain lightweight identifiers (file paths, stored queries, web links, etc.) and use these references to dynamically load data into context at runtime."
- Source for the performance claim: https://code.claude.com/docs/en/best-practices : "Claude's context window fills up fast, and performance degrades as it fills."

### 5. Instructions are context, not enforcement

- Claim: Prose in CLAUDE.md is advisory; hard guarantees need hooks or permissions.
- Source: https://code.claude.com/docs/en/memory
- Quote: "Claude treats them as context, not enforced configuration." and "The more specific and concise your instructions, the more consistently Claude follows them."

### 6. AGENTS.md: one predictable place, nearest file wins

- Claim: AGENTS.md is a vendor-neutral "README for agents".
- Source: https://agents.md
- Quote: "README for agents: a dedicated, predictable place to provide the context and instructions to help AI coding agents work on your project."
- Quote: "Agents automatically read the nearest file in the directory tree, so the closest one takes precedence." Also: "explicit user chat prompts override everything."
- Source (OpenAI Codex): https://developers.openai.com/codex/guides/agents-md
- Quote: Codex reads these "files before doing any work", and "Codex builds an instruction chain when it starts (once per run...)". It concatenates root-down and "Files closer to your current directory override earlier guidance because they appear later in the combined prompt." A size cap applies (32 KiB by default).

### 7. GitHub Copilot: tell the agent how to build, test and validate

- Claim: GitHub's own template for a Copilot instructions file reads as an onboarding brief for an agent "seeing it for the first time".
- Source: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- Quote: "information describing how a cloud agent seeing it for the first time can work most efficiently." Limits: "Instructions must be no longer than 2 pages." and "Instructions must not be task specific."
- Quote: "Add information about how to build and validate changes so the agent does not need to search and find it each time." Also: "Use language to indicate when something should always be done. For example: 'always run npm install before building'."
- The same page says Copilot also reads AGENTS.md files (listed on the page; I did not verify the exact precedence rules).

### 7b. Give the agent a way to verify, which is the definition of done

- Claim: Anthropic's top recommendation is to supply checks, because the agent cannot otherwise tell whether it is done.
- Source: https://code.claude.com/docs/en/best-practices
- Quote (section heading): "Give Claude a way to verify its work". Example prompt: "write a failing test that reproduces the issue, then fix it". Also: "Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it."
- Quote: have a fresh-context reviewer, "so the agent doing the work isn't the one grading it."

### 8. Human side: decision records are written for the future newcomer

- Claim: Michael Nygard's ADRs exist so that people arriving later understand why, and they are short and written as prose.
- Source: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
- Quote: "We will write each ADR as if it is a conversation with a future developer."
- Quote: "The whole document should be one or two pages long."
- Quote: if a decision is later reversed, "we will keep the old one around, but mark it as superseded."
- Without the record, the post says a newcomer has two bad options: blindly accept the decision or blindly change it.

### 9. Human side: checklists (Gawande) and written briefs

- Claim: Gawande argues simple checklists catch the errors skilled experts make from lapses in memory and attention, not ignorance.
- Source: Atul Gawande, "The Checklist", The New Yorker, 2007-12-10 (https://www.newyorker.com/magazine/2007/12/10/the-checklist), and the book The Checklist Manifesto (2009).
- UNVERIFIED: the New Yorker page returned a paywalled shell and I could not read the text, so I give no direct quote. The paraphrase above is from general knowledge; confirm before putting it on a slide.
- Freelance practice (written brief, definition of done): I found no primary source I could verify in this pass. Treat "contractor onboarding best practice" as practitioner convention, not research.

## Mapping table

| Human onboarding artefact                | Agent artefact                                                                                                                                        | Source                                                                  |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Written brief for the job                | The prompt or task spec: specific, with constraints, format and context                                                                               | docs.claude.com be-clear-and-direct ("brilliant but new employee")      |
| House rules, "how we work here"          | AGENTS.md / CLAUDE.md / copilot-instructions.md at repo root                                                                                          | agents.md; code.claude.com best-practices; docs.github.com              |
| "Ask the old hand" for local detail      | Nested AGENTS.md per package; the nearest file wins                                                                                                   | agents.md; developers.openai.com Codex                                  |
| Setup guide: how to build, run, test     | Build/test/lint commands in the instruction file                                                                                                      | docs.github.com ("how to build and validate changes")                   |
| Decision log: why we chose X             | ADRs, short prose, superseded not deleted                                                                                                             | cognitect.com Nygard 2011                                               |
| Glossary of the team's words             | Domain terms file referenced from the instruction file (agent equivalent not covered by a vendor page I read; this is a mapping, not a sourced claim) | none verified                                                           |
| Definition of done / acceptance criteria | Tests, build, scripts, screenshots the agent can run itself                                                                                           | code.claude.com best-practices ("Give Claude a way to verify its work") |
| Checklist before handoff                 | Verify command and a fresh-context review subagent                                                                                                    | code.claude.com best-practices; Gawande (unverified)                    |
| Second pair of eyes review               | Fresh-context reviewer, not the author                                                                                                                | code.claude.com best-practices                                          |
| Reading list for later                   | Pointers and skills loaded on demand rather than always                                                                                               | code.claude.com best-practices; anthropic.com context engineering       |

## Where the metaphor breaks

1. The freelancer learns, the agent does not. A freelancer gets better by week three without being told. A fresh session starts from the files only. Anything not written down is gone. Claude Code's auto memory narrows this gap, but it is saved notes loaded at start, not learning. Source: https://code.claude.com/docs/en/memory.
2. The agent follows text literally and has no tacit norms. A human newcomer absorbs culture by watching; the agent only has what you wrote and what it can infer from the code. Anthropic: explicit requests beat inference ("rather than relying on the model to infer this from vague prompts"). Good intentions in prose are also not guarantees: "context, not enforced configuration".
3. Reading is not free. A human skims a 40-page handbook once. The agent pays for every line at the start of every session, and quality drops as context fills ("performance degrades as it fills"). So the brief must be curated and pruned, which is the opposite of a thorough handbook. Pointers beat pastes.
4. The agent can be too compliant or too confident. It will not push back as a senior contractor would, and it can declare victory without checking. That is why verification (tests, a fresh reviewer) matters more here than for a human, who has professional pride and instinct for doubt. This is my inference; Anthropic's "the agent doing the work isn't the one grading it" supports the practice, not the psychology.
5. Instructions can conflict silently. Nearest-file-wins and root-down concatenation (agents.md, Codex) are mechanical rules, not judgement. Two ADRs or two rules that disagree will not be reconciled by negotiation.

## Sources

Fetched and read (primary, first-party):

- Anthropic, "Be clear and direct": https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
- Anthropic, Claude Code best practices: https://code.claude.com/docs/en/best-practices
- Anthropic, Claude Code memory (CLAUDE.md, auto memory): https://code.claude.com/docs/en/memory
- Anthropic Engineering, "Effective context engineering for AI agents": https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- AGENTS.md site: https://agents.md
- OpenAI Codex, AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- GitHub Docs, repository custom instructions for Copilot: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
- Michael Nygard, "Documenting Architecture Decisions", 2011-11-15: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

Not verified:

- "Amnesia": no occurrence on the Anthropic page; do not quote it.
- Gawande, "The Checklist" (New Yorker, 2007): page not readable (paywall). Book: The Checklist Manifesto (2009). Claims about it are unverified here.
- Freelancer/contractor onboarding practice (written briefs, definition of done): no primary source gathered; practitioner convention only.
- Glossary-to-agent mapping: sensible, but no vendor page read here recommends a glossary file as such.
- Vendor docs change often; quotes reflect pages fetched on 2026-10-08.

## Usable slides

1. "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows." (Anthropic, be-clear-and-direct, https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct)
2. The agent's briefing lives in a file read at the start of every conversation, and AGENTS.md calls it a "README for agents". (https://code.claude.com/docs/en/best-practices; https://agents.md)
3. Shorter beats longer: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!" GitHub caps its template at 2 pages; Nygard capped ADRs at one or two pages. (https://code.claude.com/docs/en/best-practices; https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions; https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
4. Write decisions "as if it is a conversation with a future developer": the amnesiac freelancer's version of a decision log. (Nygard, 2011, https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
5. Definition of done is a command the agent can run: "Give Claude a way to verify its work." (https://code.claude.com/docs/en/best-practices)
6. Where the metaphor breaks: instructions are "context, not enforced configuration", so rules that must hold belong in checks or hooks, not prose. (https://code.claude.com/docs/en/memory)
