---
type: research
title: 'Why do skills, personal instructions, project instructions and connectors load and get invoked the way they do across Claude, ChatGPT, Codex, Gemini and Copilot, and what does each app call them?'
description: 'Instructions load always, skills load in three levels on demand by name or description match, connectors expose tools; the mechanics hold across apps, but names and invocation syntax differ.'
generated:
  by: claude-code/opus-5.5
  at: 2026-11-12T15:48:26Z
stale_after: 2027-05-12T00:00:00Z
sources:
  - id: 1
    resource: https://agentskills.io/specification
    title: 'Agent Skills, Specification'
  - id: 2
    resource: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
    title: 'Anthropic, Agent Skills (Claude Platform docs)'
  - id: 3
    resource: https://code.claude.com/docs/en/skills
    title: 'Anthropic, Extend Claude with skills (Claude Code docs)'
  - id: 4
    resource: https://code.claude.com/docs/en/memory
    title: 'Anthropic, How Claude remembers your project (Claude Code docs)'
  - id: 5
    resource: https://code.claude.com/docs/en/features-overview
    title: 'Anthropic, Extend Claude Code (Claude Code docs)'
  - id: 6
    resource: https://code.claude.com/docs/en/mcp
    title: 'Anthropic, Connect Claude Code to tools via MCP (Claude Code docs)'
  - id: 7
    resource: https://support.claude.com/en/articles/12512180-use-skills-in-claude
    title: 'Anthropic, Use skills in Claude (Help Center)'
  - id: 8
    resource: https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features
    title: 'Anthropic, Understanding Claude''s personalization features (Help Center)'
  - id: 9
    resource: https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities
    title: 'Anthropic, Use connectors to extend Claude''s capabilities (Help Center)'
  - id: 10
    resource: https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
    title: 'OpenAI Academy, Skills'
  - id: 11
    resource: https://developers.openai.com/api/docs/guides/tools-skills
    title: 'OpenAI, Skills (API guide)'
  - id: 12
    resource: https://learn.chatgpt.com/docs/build-skills
    title: 'OpenAI, Build skills (Codex docs)'
  - id: 13
    resource: https://learn.chatgpt.com/docs/agent-configuration/agents-md
    title: 'OpenAI, AGENTS.md (Codex docs)'
  - id: 14
    resource: https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
    title: 'Google, Agent Skills in Gemini CLI'
  - id: 15
    resource: https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md
    title: 'Google, Provide context with GEMINI.md files (Gemini CLI docs)'
  - id: 16
    resource: https://support.google.com/gemini/answer/17094507?hl=en
    title: 'Google, Manage your tasks and workflows in Gemini Apps (Help)'
  - id: 17
    resource: https://support.google.com/gemini/answer/18560919?hl=en
    title: 'Google, About the transition from Gems to skills (Gemini Apps Help)'
  - id: 18
    resource: https://support.google.com/gemini/answer/15637730?hl=en
    title: 'Google, Get personalization in Gemini Apps (Gemini Apps Help)'
  - id: 19
    resource: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
    title: 'GitHub, Adding agent skills for GitHub Copilot CLI'
  - id: 20
    resource: https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
    title: 'GitHub, Adding repository custom instructions for GitHub Copilot'
  - id: 21
    resource: https://docs.github.com/en/copilot/concepts/context/mcp
    title: 'GitHub, About Model Context Protocol (MCP) (Copilot docs)'
  - id: 22
    resource: https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills?view=visualstudio
    title: 'Microsoft, Use Agent Skills with GitHub Copilot in Visual Studio'
  - id: 23
    resource: https://rocketedge.com/wp-content/uploads/2026/06/Day_1_v3.pdf
    title: 'Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, PDF copy)'
  - id: 24
    resource: https://arxiv.org/abs/2602.12430
    title: 'Xu and Yan, Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward'
---

# Why do skills, personal instructions, project instructions and connectors load and get invoked the way they do across Claude, ChatGPT, Codex, Gemini and Copilot, and what does each app call them?

## Context

Asked to support a claim about how AI apps load context: a skill is a folder of instructions that loads on demand, instructions are always loaded, and connectors reach other systems. The claim is checked per app against each vendor's own documentation and the Agent Skills standard.

## Answer

Where the sources document it (Claude Code, Codex, Gemini CLI and GitHub Copilot), always-on instructions load at the start of each session or request; for ChatGPT and the Gemini app this is unverified. Skills load in stages: name and description first, then the body when the skill is used. Bundled files load only when needed, as documented for Claude, the Agent Skills standard and Gemini CLI; for the other apps this is inferred from the shared format. This is the reason given by the vendors and the Agent Skills standard: a skill's body and files cost no context until they are used. A skill is used either when the user names it (the syntax differs per app: `/name`, `$name`, `@name`) or when the model matches the task to the description. Connectors (MCP servers) add tools and data rather than instructions. The mechanics hold across apps; names, invocation syntax and a few loading details do not, and the table in Findings lists each app's own words.

## Findings

1. A skill is a directory with a required `SKILL.md` (frontmatter `name` and `description`, then instructions) and optional `scripts/`, `references/` and `assets/` [1]. Claude, OpenAI's API, Gemini CLI and GitHub Copilot all follow this format [2][11][14][19][22]. ChatGPT describes a skill as a name and description, workflow steps usually in `SKILL.md`, and supporting materials, and says skills follow the open Agent Skills standard [10][11].
2. The standard specifies three loading levels: metadata (`name` and `description`, about 100 tokens) at startup for all skills, the `SKILL.md` body when the skill is activated, and files in `scripts/`, `references/` or `assets/` only when required [1]. Anthropic states the same three levels [2], and Gemini CLI documents the metadata-first, body-on-activation pattern [14]. Codex lists only name, description and file path first and reads full instructions when it decides to use a skill [12]. OpenAI's API shows the model name, description and path, then reads `SKILL.md` from the path [11]. Copilot injects `SKILL.md` into context once a skill is chosen [19]. A survey paper's abstract calls this progressive disclosure a "paradigm" of skills [24].
3. A script's code stays out of the conversation in Anthropic's design: Claude runs scripts through bash "and only their output enters context" [2]. Claude Code's skills page calls a bundled helper "executed, not loaded" [3]. The other vendors' pages read for this question say bundled scripts exist and are available [11][19] but do not state the effect on context, so that claim is documented for Claude only.
4. Instructions that are always loaded: Claude Code reads CLAUDE.md "at the start of every session", with user-level `~/.claude/CLAUDE.md` for all projects and project-level `./CLAUDE.md` for the team [4]. It reads `AGENTS.md` only when no `CLAUDE.md` exists in the working directory or above; `~/.claude/CLAUDE.md` still loads alongside it [4]. Codex builds an instruction chain once per run from `~/.codex/AGENTS.md` and each directory down to the working directory, capped at 32 KiB by default [13]. Gemini CLI concatenates `~/.gemini/GEMINI.md` and workspace `GEMINI.md` files and sends them "with every prompt" [15]. GitHub Copilot adds repository-wide `.github/copilot-instructions.md`, path-specific `.instructions.md` and `AGENTS.md` instructions "automatically" to requests, and personal instructions take the highest priority, though all relevant sets are provided [20].
5. In Claude's chat app, "Instructions" are account-wide and apply to all conversations, while project instructions apply only to chats within that project [8]. In ChatGPT, OpenAI's skills page says projects hold shared context, files and conversations while skills are reusable workflows [10]. Gemini's app lists "Instructions for Gemini" under Personal Intelligence, and the name and the claim that Gemini can draw on such personalization when working on tasks come from [16]; [18] says only that you can customize Gemini's responses with instructions.
6. Skills load on demand while rules do not, per the vendors' own contrast. Claude Code: CLAUDE.md "loads every conversation", a skill loads "on demand", and a skill's description costs context every turn unless `disable-model-invocation` is set [5]. Gemini CLI says `GEMINI.md` gives persistent workspace context while skills are loaded only when activated [14][15]. Copilot: use custom instructions for guidance "relevant to almost every task" and skills for instructions Copilot "should only access when relevant" [19]. Google's whitepaper "The New SDLC With Vibe Coding" frames the same split: "Static context is always loaded: system instructions, rule files (AGENTS.md, CLAUDE.md, GEMINI.md), global memory, and persona definitions", while "Dynamic context is loaded on demand: skill instructions triggered by task matching, tool results retrieved during execution, documents fetched from RAG pipelines, and windowed session history" [23].
7. There are two ways to invoke a skill. Claude Code: `/skill-name` at the start of a message runs it directly, or Claude loads it when the description matches [3]. Codex: `/skills` or `$` mentions a skill explicitly, otherwise it triggers implicitly on the description, and `allow_implicit_invocation: false` turns the implicit path off [12]. ChatGPT: automatic use or `@`-mention [10]. Gemini app: `@` plus the skill name, or automatic use [16]; the transition page says `/` first and later `@` [17]. Copilot CLI: a slash before the skill name, or automatic use [19]. Gemini CLI: the model calls `activate_skill`, the user then sees a consent prompt, and only after consent is the skill injected; `/skills` manages skills rather than invoking them [14].
8. Claude.ai: Claude "determines when each skill is needed", the user can name it, and skills are uploaded as zip folders with code execution enabled [7]. Custom skills do not sync across claude.ai, the API and Claude Code [2], although Claude Code can sync account skills at session start [7]. Also, ChatGPT skills do not yet sync across products [10].
9. Connectors are Model Context Protocol (MCP) servers. Claude calls them "connectors" and can bring a connected service into a conversation on its own when it fits; users toggle them per chat through the "+" or "/" menu [9]. Claude Code loads MCP tool names at session start and defers full schemas until needed [5][6]. ChatGPT now says "apps (formerly connectors)" [10]. Gemini calls Google services and third-party services "Connected Apps", separate from skills [16]. Copilot calls them MCP servers, adding "connections to tools and data, rather than replacing guidance" [21]. A skill can use a connector: ChatGPT skills only instruct the model to use apps it already has access to [10], and Claude's docs describe MCP as the connection and a skill as the knowledge of how to use it [5].
10. Each app's own names, as the vendors write them (a dash marks a name the pages read do not give):

    | App | Skill | Personal instructions | Project instructions | Connectors |
    | --- | --- | --- | --- | --- |
    | Claude (app) | Skills [7] | Instructions, "Instructions for Claude" [8] | Project instructions [8] | Connectors [9] |
    | Claude Code | Skills, `SKILL.md` [3] | `~/.claude/CLAUDE.md`, "User instructions" [4] | `./CLAUDE.md`, "Project instructions", or `AGENTS.md` [4] | MCP servers [6] |
    | ChatGPT | Skills [10] | Custom instructions (not read in a vendor page, see Caveats) | Project instructions (not read in a vendor page, see Caveats) | Apps, formerly connectors [10] |
    | Codex | Skills, `.agents/skills` [12] | `~/.codex/AGENTS.md` [13] | `AGENTS.md` per directory [13] | not read |
    | Gemini app | Skills, replacing Gems [17] | Instructions for Gemini [16] | not read | Connected Apps [16] |
    | Gemini CLI | Skills [14] | `~/.gemini/GEMINI.md` [15] | workspace `GEMINI.md` [15] | not read |
    | GitHub Copilot | Agent skills [19] | Personal instructions [20] | Repository custom instructions, `.github/copilot-instructions.md`, `AGENTS.md` [20] | MCP servers [21] |

## Caveats

Claims about how AI apps load context that do not hold uniformly across apps:

- Scripts running without their code entering the conversation is documented only for Claude [2][3]; for other apps it is an inference from the shared format.
- "Instructions are static" is a rule of thumb, not exact. Claude Code `.claude/rules/` files with `paths` load only when matching files open [4], Gemini CLI loads further `GEMINI.md` files just in time when a tool touches a directory [15], and Copilot path-specific instructions apply by file match [20]. Claude Code also loads `AGENTS.md` only when no `CLAUDE.md` exists [4].
- Claude Code's `disable-model-invocation: true` removes a skill's description from context and makes it user-only [3][5]; Codex has the same switch as `allow_implicit_invocation` [12]. "Always loaded: name and description" therefore holds by default only. Codex and Claude Code both cap or shorten the listing [3][12].
- Invocation syntax differs: Gemini's own pages disagree on `/` versus `@` [16][17], and the Claude.ai Help article documents a `/` skill menu only for the Microsoft 365 add-ins [7]. In Gemini CLI the model requests activation and the user consents before the skill is injected [14]. "Slash command" is Claude Code and Copilot CLI wording [3][19]; "by name" covers apps in general.
- Gems are removed from personal accounts on 17 December 2026 and become skills [17]; the Gemini app's skill page does not say whether Gemini app skills are `SKILL.md` folders, so the folder claim is verified for Gemini CLI, not the Gemini app [14][16].
- ChatGPT custom instructions and project instructions were not read, because OpenAI's help articles returned HTTP 403 to the reader, so their loading behaviour is unverified here. Whether the Gemini app loads its instructions at the start of each session or request is also unverified: [16][18] say only that Gemini can draw on them. Codex and Gemini connector (MCP) pages and Microsoft 365 Copilot (as distinct from GitHub Copilot) were not read.
- Google's whitepaper "The New SDLC With Vibe Coding" was read as a PDF copy hosted on rocketedge.com, because the Kaggle page returned no body text; the quotes are from that copy [23]. The survey [24] is cited for its abstract's "progressive disclosure" paradigm; its token estimates differ from the standard's [1], which states about 100 tokens for metadata.

[1]: <https://agentskills.io/specification> "Agent Skills, Specification"
[2]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview> "Anthropic, Agent Skills (Claude Platform docs)"
[3]: <https://code.claude.com/docs/en/skills> "Anthropic, Extend Claude with skills (Claude Code docs)"
[4]: <https://code.claude.com/docs/en/memory> "Anthropic, How Claude remembers your project (Claude Code docs)"
[5]: <https://code.claude.com/docs/en/features-overview> "Anthropic, Extend Claude Code (Claude Code docs)"
[6]: <https://code.claude.com/docs/en/mcp> "Anthropic, Connect Claude Code to tools via MCP (Claude Code docs)"
[7]: <https://support.claude.com/en/articles/12512180-use-skills-in-claude> "Anthropic, Use skills in Claude (Help Center)"
[8]: <https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features> "Anthropic, Understanding Claude's personalization features (Help Center)"
[9]: <https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities> "Anthropic, Use connectors to extend Claude's capabilities (Help Center)"
[10]: <https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills> "OpenAI Academy, Skills"
[11]: <https://developers.openai.com/api/docs/guides/tools-skills> "OpenAI, Skills (API guide)"
[12]: <https://learn.chatgpt.com/docs/build-skills> "OpenAI, Build skills (Codex docs)"
[13]: <https://learn.chatgpt.com/docs/agent-configuration/agents-md> "OpenAI, AGENTS.md (Codex docs)"
[14]: <https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md> "Google, Agent Skills in Gemini CLI"
[15]: <https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md> "Google, Provide context with GEMINI.md files (Gemini CLI docs)"
[16]: <https://support.google.com/gemini/answer/17094507?hl=en> "Google, Manage your tasks and workflows in Gemini Apps (Help)"
[17]: <https://support.google.com/gemini/answer/18560919?hl=en> "Google, About the transition from Gems to skills (Gemini Apps Help)"
[18]: <https://support.google.com/gemini/answer/15637730?hl=en> "Google, Get personalization in Gemini Apps (Gemini Apps Help)"
[19]: <https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills> "GitHub, Adding agent skills for GitHub Copilot CLI"
[20]: <https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions> "GitHub, Adding repository custom instructions for GitHub Copilot"
[21]: <https://docs.github.com/en/copilot/concepts/context/mcp> "GitHub, About Model Context Protocol (MCP) (Copilot docs)"
[22]: <https://learn.microsoft.com/en-us/visualstudio/ide/copilot-agent-skills?view=visualstudio> "Microsoft, Use Agent Skills with GitHub Copilot in Visual Studio"
[23]: <https://rocketedge.com/wp-content/uploads/2026/06/Day_1_v3.pdf> "Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, PDF copy)"
[24]: <https://arxiv.org/abs/2602.12430> "Xu and Yan, Agent Skills for Large Language Models: Architecture, Acquisition, Security, and the Path Forward"
