---
type: dossier
title: What lies below the waterline of sustainable AI skills
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-13T18:46:16Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-12T16:12:31Z
  - by: process:markdown-harness
    at: 2026-11-12T16:22:59Z
  - by: process:markdown-harness
    at: 2026-11-12T17:45:14Z
  - by: process:markdown-harness
    at: 2026-11-12T17:52:18Z
  - by: process:markdown-harness
    at: 2026-11-12T20:12:29Z
  - by: process:markdown-harness
    at: 2026-11-12T20:28:05Z
  - by: process:markdown-harness
    at: 2026-11-13T18:46:16Z
---

# What lies below the waterline of sustainable AI skills {#waterline-of-sustainable-ai-skills}

## A thought experiment {#a-thought-experiment}

#### Voice script

1. **You are the captain** — Imagine you work with an AI model that is brilliant at its job, the most capable colleague you have. I will give it a picture, because we need one all the way down: you are the captain of a coastal research project, and the model is your pilot of ten years, who steers a diving robot on a cable from the control room on deck while you decide where the project goes next.
2. **One settled condition** — Your pilot has one condition, and it never changes. He forms no new memories overnight, but he keeps everything he ever learnt as a pilot, every rule of the trade. That is an AI model: what it learnt in training stays, and what you told it in yesterday's conversation is gone.

### An AI model that forgets every morning {#an-ai-model-that-forgets-every-morning}

#### Visual

master: grid-bento · motion: local

AI statement, the headline caption: "Unless you write it down, every new conversation with AI starts from zero on how you work." Analogy caption, smaller and beside the picture: "Your pilot is the AI model: ten years of skill, no memory of yesterday."

A comic strip in low poly, the control room as the scene. First panel: a framed photo on the control-room wall, you and the pilot across ten years of projects, with a small tag on the pilot reading "AI model", so the viewer knows from the first panel who he stands for. Then three mornings, each in its own panel: the pilot greets you with a speech bubble, "Nice to meet you", you explain the sediment sample again, and the robot sits idle on deck. The strip ends on "What would you do?" beside an empty procedure card, left untagged so the question stays open. Panels appear one after another, nothing loops at rest, and under reduced motion all panels show at once. The Slide keeps only the question and the empty card, so it works without the live chat.

#### Speaker notes

1. **Each AI conversation starts fresh: Mollick's forgetful coworker** — Ethan Mollick advises treating AI "like an infinitely patient new coworker who forgets everything you tell them each new conversation" [1]. Claude Code sessions each begin "with a fresh context window" and only written files carry knowledge across [2]. "Amnesiac" is the Episode's word, not Mollick's.
   - sources: [1] Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024) — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough
   - sources: [2] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory

#### Voice script

1. **Three mornings** — So the next morning you open a new conversation, and the model knows nothing of yesterday. In our picture the pilot greets you with "Nice to meet you", you explain how to take the sediment sample step by step, and the robot waits on deck while you talk. The morning after, it is the same greeting and the same explanation, and by the third morning you could recite it in your sleep.
2. **The hook** — That is what working with AI feels like today, because every conversation starts from zero on how you work. You've explained this to the AI a hundred times. It has heard it once.
3. **What would you do** — So here is my question, and I would like your honest answer: if you worked with this model for a whole season, what would you do about it? If you're with me in a workshop, type it into the chat now. If you're watching the recording, pause here and answer out loud. I'll come back to it.

### A skill hands the AI your procedure {#a-skill-hands-the-ai-your-procedure}

#### Visual

master: grid-1x1 · motion: local

AI statement, the headline caption: "When a request matches its description, or you call it by name, the AI reads that one skill into the context." Analogy caption, smaller and beside the picture: "The pilot pulls one card from the dive manual when the dive needs it."

One wide view of the control room: the pilot at the console, the manual open at its index, the project brief on the wall, and the robot on its cable through the window. Three callouts, each with the AI term as its label and the scene's word in smaller type beneath it, numbered in the order the Voice script names them: "Skill" (procedure card), "Description" (index line) and "Project instructions" (project brief). One card slides out of the manual on its own. The Spec offers Options for this Slide (comic, cutaway illustration), as Han expects a new kind of visual here.

#### Speaker notes

1. **A skill spares you the repeat** — Anthropic contrasts skills with prompts: a skill spares you from repeating the same guidance across conversations [1]. When a request matches a skill's description, Claude reads `SKILL.md` and only then does that content enter the context [1]. Calling a skill by name loads it too, as the Slide on two ways to call a skill shows.
   - sources: [1] Anthropic, Agent Skills overview — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

#### Voice script

1. **The answer** — Most people land on the same idea within a minute: write it down. Write the procedure once, keep it where the model can find it, and let the model read it when the task comes up, instead of you explaining it again every morning. That is a skill, and in our picture it is a procedure card in the dive manual at the console. The rest of this Episode is about doing it well.
2. **Three things to remember** — Hold on to three terms, because we return to them all the way down. The skill is the procedure itself, the card. Its description is the one line that tells the model what the skill is for, an entry in the manual's index. And the project instructions hold what is true for this one project, the project brief on the wall.
3. **The card slides out** — And here is the part that matters most: the model does not read every skill you have. It reads the descriptions, and it opens one skill when the task needs it, the way one card comes out of the manual when the dive needs it. (pause) That is the picture for everything that follows.

## What a skill is {#what-a-skill-is}

#### Voice script

1. **Surface first** — We are still at the surface, so before we ask when to write a skill, let's see what a skill is made of. I'll use the words your chat app uses, and if you work with a coding agent, some Slides have a second view that shows you the files behind each part.
2. **The mechanics, plainly** — I want to be exact about how a skill gets loaded, because everything later depends on it. So I say first what the AI really does, and use the dive only to make it easier to picture.

### A skill is a folder of instructions {#a-skill-is-a-written-procedure}

#### Visual

master: grid-1x2 · motion: none

AI statement, the headline caption, quoting Anthropic's definition of a skill verbatim, with "Anthropic" named beside it as its author: "Skills are folders that include instructions, scripts, and resources that Claude can load when needed." Analogy caption, smaller and beside the picture: "A procedure card: title and use-when line in the head, steps in the body, extras in the sleeve."

Two visuals. First, `SKILL.md` alone, as one procedure card on a clipboard drawn as one continuous graphic on the left, with the headings "SKILL.md alone" and "The folder" on the right above their previews; each part is labelled with its AI term first and the scene's word beneath: "name and description" (the head: the title and the "use when" line) and "instructions" (the body: the numbered steps). Coding-agent view: the same two parts labelled "frontmatter" and "body of SKILL.md". Second, a folder preview of the optional supporting files beside it (a species guide in `references/`, a label template in `assets/`, an arm preset in `scripts/`), with a link to agentskills.io, the open standard's site.

#### Speaker notes

1. **What a skill is made of** — a skill is a folder with a required `SKILL.md` (a name and a description, then the instructions) and optional `scripts/`, `references/` and `assets/` folders [1]. ChatGPT describes the same three parts in its own words: a name and description, workflow steps and supporting materials [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
2. **Names differ by app** — Claude, ChatGPT and Codex say "Skills", GitHub Copilot says "agent skills", and the Gemini app turns Gems into skills for personal accounts on 17 December 2026 [3]. Whether the Gemini app's skills are `SKILL.md` folders is not stated in the pages read; it is verified for Gemini CLI only [4].
   - sources: [3] Google, About the transition from Gems to skills (Gemini Apps Help) — https://support.google.com/gemini/answer/18560919?hl=en
   - sources: [4] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
3. **The description is the routing line** — Google's Day 3 whitepaper calls the description "your routing algorithm" [5]. This is Google's framing of how a skill is chosen, not a measurement of how often it routes correctly.
   - sources: [5] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
4. **Anthropic's definition of a skill** — Anthropic defines skills as "folders that include instructions, scripts, and resources that Claude can load when needed" [6]. The Slide quotes the sentence as written; "Claude" in it is Anthropic's product,, and the Agent Skills standard (note 1) publishes the same folder format for other agents.
   - sources: [6] Anthropic, Introducing Agent Skills — https://claude.com/blog/skills

#### Voice script

1. **Name and use-when** — A skill is a folder of instructions, and the company that introduced skills says so in almost those words. The folder holds one file it cannot do without, and that file starts with a name and a description, one line saying when to use it. That line matters more than it looks, because it is the first thing the model sees and, as you'll hear in a minute, often the only thing. On our card it is the title and the "use when" line in the head.
2. **Steps in the body** — Then come the instructions, the procedure itself as numbered steps, in the body of the card. Beside that file a skill can carry optional supporting files that its steps reach for, like a species guide, a label template or an arm preset tucked into the card's sleeve. So a skill is a procedure, plus the material that procedure needs.
3. **For developers** — If you work with a coding agent, switch to the coding-agent view, where the two parts of the file are called its frontmatter and the body of SKILL.md, and you can open and edit each. If you don't, you can ignore that view completely.

### How AI discovers and reads a skill {#three-levels-of-loading}

#### Visual

master: vertical-stepper · motion: local

AI statement, the headline caption: "How AI discovers a skill, then reads it and its supporting files only when needed." Analogy caption, smaller and beside the picture: "The pilot reads the manual's index, then one card, then only the extras a step asks for."

The concept first, as a card above the example: Nielsen Norman Group's definition of progressive disclosure, quoted word for word with "Nielsen Norman Group" and the author named beneath: "Progressive disclosure defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone." A smaller line adds that for skills, Anthropic's docs say Claude loads information in stages as needed. The three cards 1, 2 and 3 sit in one row. The example is a skill's three loading levels. The manual shown in three steps, each led by a plain factual label: "Always loaded: every skill's name and description", "Loaded when the skill is used: its main instructions", "Loaded only if needed: references, templates and scripts". The manual's index, one card and the sleeve sit small beside each label as the picture. Under the third, a note that a script can run without its code entering the conversation, as Claude documents it. A soft light moves across the three steps in loading order. Invocation is not a level; it is the later Slide on two ways to call a skill.

#### Speaker notes

1. **Three levels, stated by the standard** — the Agent Skills standard names metadata (name and description, about 100 tokens) loaded at startup for all skills, the `SKILL.md` body when the skill is activated, and files in `scripts/`, `references/` or `assets/` only when required [1]. Anthropic states the same three levels [2]. Google's Day 3 whitepaper states them too: "1. Metadata (name + description) is always in the agent's context. 2. SKILL.md body is loaded only when the skill triggers. 3. Bundled resources are loaded strictly as needed" [6]. That is Google's description of the design, not a test that it works.
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
   - sources: [6] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
2. **Other apps load in stages too** — Codex lists name, description and file path first and reads the full instructions when it decides to use a skill [3]; Gemini CLI documents metadata first, body on activation [4]. For apps whose pages were not read, the three-level claim is inferred from the shared format.
   - sources: [3] OpenAI, Build skills (Codex docs) — https://learn.chatgpt.com/docs/build-skills
   - sources: [4] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
3. **Scripts: documented for Claude only** — Claude runs scripts through bash and "only their output enters context" [5]. The other vendors' pages read say bundled scripts exist but do not say what that does to context, so keep this claim to Claude. Google's Day 3 whitepaper adds one line, that scripts "execute without ever polluting the token window" [7]; treat it as Google's statement, not as documented behaviour in other apps.
   - sources: [5] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
   - sources: [7] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
4. **What the skill index costs** — Day 3 calls the metadata cost "tiny" but recurring: it is paid "on every turn" [8]. That is Google's claim; the size of the index comes from the standard's figure of about 100 tokens per skill in note 1, not from Day 3.
   - sources: [8] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
5. **Progressive disclosure, as Anthropic names it** — Anthropic's docs say the filesystem-based design "allows progressive disclosure: Claude loads information in stages as needed, rather than consuming context upfront" [9]. The concept is general; a skill is the example.
   - sources: [9] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
6. **Progressive disclosure, as Nielsen Norman Group defines it** — Jakob Nielsen's article defines it in its summary: "Progressive disclosure defers advanced or rarely used features to a secondary screen, making applications easier to learn and less error-prone" [10]. It is an interaction-design principle from 2006, older than skills; the Slide quotes it as written.
   - sources: [10] Nielsen Norman Group, Jakob Nielsen, Progressive Disclosure — https://www.nngroup.com/articles/progressive-disclosure/

#### Voice script

1. **The concept** — So how does the model find a skill, and how much of it does it read? Interface designers met the same problem long before AI: a screen that shows every option at once overwhelms the person using it, so you show the basics first and open the rest when someone needs it. They call it progressive disclosure, and a skill is loaded the same way, in three levels.
2. **Step one** — Level one is how the model discovers a skill, and it is always loaded: every skill's name and description. So even with a hundred skills installed, all the model carries into every conversation is that short index, the index page of the manual.
3. **Step two** — Level two is loaded when the skill is used. Only when a task matches a description does the model read that skill's main instructions, and not a moment before, the way the pilot pulls one card.
4. **Step three** — Level three is loaded only if needed: the references, templates and scripts, the extras in the sleeve, which the model opens only when a step sends it there. The exact behaviour differs a little from app to app, so I keep the precise claims in the notes beside this Slide.

### Skills are static and dynamic context {#skills-are-dynamic-context}

#### Visual

master: grid-2x1 · motion: local

AI statement, the headline caption: "What's always loaded is static; a skill loads on demand, so it is dynamic." Analogy caption, smaller and beside the picture: "Before the dive: your orders, the brief and the index. During it: the card and everything the robot sends up."

The context window Explorable with a Preset in the scene's words, in the Explorable's own order and labels, static on top and dynamic below. Each entry is labelled with its AI term first and the scene's word beneath. Static, always there, top to bottom: system prompt, skills (the name and description of every skill: the manual's index) and memory files (`AGENTS.md`, `CLAUDE.md` in Claude Code: your standing orders and the project brief). Dynamic, filling during the dive: skill instructions (the pulled card) and tool results (camera frames, sonar readings and sample logs), then free space. The dynamic part fills as the dive goes on. A skill is dynamic whether you call it at the start or the AI picks it mid-task.

#### Speaker notes

1. **Static and dynamic, as Google defines them** — static context is always loaded: system instructions, rule files (AGENTS.md, CLAUDE.md, GEMINI.md), global memory and persona definitions; dynamic context is loaded on demand: skill instructions triggered by task matching, tool results, retrieved documents and windowed session history [1]. This is Google's vendor framing of the vendors' own mechanics, not a measured result.
   - sources: [1] Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding
2. **Why static and dynamic context are kept apart** — Day 1 says static context "is expensive because every token is present in every interaction, regardless of relevance", and that too much of it "wastes tokens and dilutes signals" while too little "means the agent forgets critical rules" [2]. Day 3 repeats the split for the two files: "From one side AGENTS.md is always loaded within the project; Skills load on demand." [3]
   - sources: [2] Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding
   - sources: [3] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
3. **Static instructions are a rule of thumb** — instructions are not strictly static. Claude Code `.claude/rules/` files with `paths` load only when matching files open [4], Gemini CLI loads further `GEMINI.md` files just in time when a tool touches a directory [5], and Copilot path-specific instructions apply by file match [6]. By default, a skill's name and description are always loaded too, unless the skill is set to user-only invocation [7].
   - sources: [4] Anthropic, How Claude remembers your project (Claude Code docs) — https://code.claude.com/docs/en/memory
   - sources: [5] Google, Provide context with GEMINI.md files (Gemini CLI docs) — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md
   - sources: [6] GitHub, Adding repository custom instructions for GitHub Copilot — https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
   - sources: [7] Anthropic, Extend Claude with skills (Claude Code docs) — https://code.claude.com/docs/en/skills

#### Voice script

1. **Back to the window** — Some of you have seen the context window Explorable, where we looked at everything the model holds in its head at once. This is the same context window, and now we place skills in it.
2. **The standing part** — Start with what is there before any task begins, in the order the Explorable shows it: the system prompt, the skills, meaning the name and description of every skill, and the memory files, meaning your instructions in AGENTS.md. On our ship that is the standing rules, the manual's index, and your standing orders and the project brief. That part is static, so it sits in the window whatever the task turns out to be.
3. **Filling as you dive** — Then the task begins and the window fills up: the skill the model opened, and the tool results it gets back, the camera frames, sonar readings and sample logs of the dive. That part is dynamic, and a skill's instructions belong to it, whether you call the skill at the start or the model picks it halfway through. So a skill sits on both sides of the line: its name and description are static, and the skill itself is dynamic.

### Instructions, skills and connectors {#instructions-skills-and-connectors}

#### Visual

master: three-column · motion: none

AI statement, the headline caption: "Personal and project instructions are always loaded, skills load on demand, and connectors reach into other systems." Analogy caption, smaller and beside the picture: "Your notebook, the wall, the manual and the cable."

The control room as one picture, then four cartoon panels stacked vertically on the left, one per thing, each led by its AI label and a small static or dynamic tag linking back to the Slide on dynamic context, with the explanation of each on the right, beside its panel. The four things, with the scene's object as the panel: personal instructions, static, which travel to any project (your standing orders in your notebook, which travel to any ship); project instructions, static (the project brief on the wall); skills, dynamic (the manual at the console); and a connector, its tools listed up front and its results on demand (the cable to the sonar and the lab database). Coding-agent view: `~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md` and an MCP server. If the connector reads as too much in the render, the Slide falls back to three things.

#### Speaker notes

1. **Instructions are always loaded, skills are not** — Claude Code reads CLAUDE.md "at the start of every session" and loads a skill "on demand" [1]. Codex, Gemini CLI and GitHub Copilot document the same split for their instruction files and skills [2]. ChatGPT custom and project instructions were not read, and whether the Gemini app loads its instructions at the start of each session is unverified, so the split is not confirmed for those two apps.
   - sources: [1] Anthropic, Extend Claude Code (Claude Code docs) — https://code.claude.com/docs/en/features-overview
   - sources: [2] GitHub, Adding agent skills for GitHub Copilot CLI — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
2. **Names in chat apps** — Claude calls them Instructions, project instructions and Connectors [3]; ChatGPT now says "apps (formerly connectors)" [4]; the Gemini app says "Instructions for Gemini" and "Connected Apps" [5].
   - sources: [3] Anthropic, Understanding Claude's personalization features (Help Center) — https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features
   - sources: [4] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
   - sources: [5] Google, Manage your tasks and workflows in Gemini Apps (Help) — https://support.google.com/gemini/answer/17094507?hl=en
3. **Connectors reach, skills know how** — connectors are Model Context Protocol (MCP) servers that add tools and data, not guidance [6]. Anthropic describes MCP as the connection and a skill as the knowledge of how to use it [7].
   - sources: [6] GitHub, About Model Context Protocol (MCP) (Copilot docs) — https://docs.github.com/en/copilot/concepts/context/mcp
   - sources: [7] Anthropic, Extend Claude Code (Claude Code docs) — https://code.claude.com/docs/en/features-overview
4. **Skill vs. AGENTS.md, as Google puts it** — Day 3 has a "Skill vs. AGENTS.md" passage: "From one side AGENTS.md is always loaded within the project; Skills load on demand. The cleanest setups use both." It advises keeping AGENTS.md tight and, if needed, using it as a router into the skills library "with a short catalog at the bottom that tells the agent what's available" [8]. Day 1 calls always-loaded rule files static context [9]. Both are Google's vendor guidance on how to split the two, not evidence that the split works.
   - sources: [8] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
   - sources: [9] Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding

#### Voice script

1. **Four things in the room** — Four things shape what the model knows, and they do four different jobs: personal instructions, project instructions, skills and connectors. In the control room they are your notebook, the project brief on the wall, the manual at the console, and the cable to the sonar and the lab database.
2. **Read the tags** — Take them one at a time. Personal instructions are static, and they follow you into every project, as your notebook comes with you onto any ship. Project instructions are static too, but only inside this one project. Skills are dynamic, because one arrives when a task needs it, and a connector's results are dynamic too, because they arrive from another system while you work; the connector also lets the model act in that system. That is the split from the last Slide, now with names.
3. **Your words may differ** — Your app may use other words for these four, so match the job, not the word. And if you work with a coding agent, the other view shows the files: your personal instructions file, AGENTS.md for the project, a SKILL.md for each skill, and a server for each connector.

### Two ways to call a skill {#two-ways-to-call-a-skill}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "You call a skill by name, or the AI picks it from its description." Analogy caption, smaller and beside the picture: "Ask for the card, or let the pilot find it in the index."

The control room split in two, each half headed by its AI label. Left, "Called by name": you name the card, "Collect sediment sample, please." Right, "Picked from its description": the pilot scans the index and pulls the card when the dive needs it. Under the right half: "In Vercel's test of one Next.js docs skill, the agent never opened it in 56% of cases." Coding-agent view: on the left a typed command, `/name` in Claude Code and Copilot CLI, `$name` in Codex, `@name` in ChatGPT; on the right a description match. A highlight lands on one index line.

#### Speaker notes

1. **Calling a skill by name differs by app** — Claude Code runs `/skill-name` at the start of a message [1]; Codex uses `$` or `/skills` [2]; ChatGPT and the Gemini app use `@` [3]; Copilot CLI uses a slash before the name [4]. Gemini's own help pages disagree on `/` versus `@` for the Gemini app [9][10], so the Slide shows `@` and the note keeps `/`. "Slash command" is Claude Code and Copilot CLI wording; "by name" holds for all.
   - sources: [1] Anthropic, Extend Claude with skills (Claude Code docs) — https://code.claude.com/docs/en/skills
   - sources: [2] OpenAI, Build skills (Codex docs) — https://learn.chatgpt.com/docs/build-skills
   - sources: [3] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
   - sources: [4] GitHub, Adding agent skills for GitHub Copilot CLI — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
   - sources: [9] Google, Manage your tasks and workflows in Gemini Apps (Help) — https://support.google.com/gemini/answer/17094507?hl=en
   - sources: [10] Google, About the transition from Gems to skills (Gemini Apps Help) — https://support.google.com/gemini/answer/18560919?hl=en
2. **The model picks a skill by its description** — otherwise the model matches the task to the description. Gemini CLI adds a step: the model asks to activate a skill and the user consents before it is injected [5].
   - sources: [5] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
3. **Skills left unused: what the 56% measures** — "In 56% of eval cases, the skill was never invoked": the documentation skill in Vercel's default configuration for Next.js 16 APIs, not all skills in general [6]. Explicit instructions to use it raised invocation to 95% or more, and the pass rate from 53% to 79% [6]. In the default configuration the skill tied the no-skill baseline overall at 53% [6]. One vendor's eval, no named model, no replication, so treat it as an illustration.
   - sources: [6] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
4. **Unused skills in Google's Day 3: two misreadings of Vercel** — it writes "a 56% non-invocation rate for skills expected to activate consistently" [7]. That turns one Next.js docs skill into skills in general, and calls Vercel's eval suite a "production analysis". It also says "a skill stripped of its instructions scored 58%, while the agent without the skill scored 63%" [7]. In Vercel's post that is the default skill against the baseline on the test sub-score alone, not a stripped skill, and overall pass rates were equal at 53% [8]. Vercel's own wording wins. Day 3 is Google's vendor guidance on how to use skills, not evidence that skills go unused.
   - sources: [7] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
   - sources: [8] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

#### Voice script

1. **By name** — There are two ways a skill gets used. The first is the simple one: you call it by name, the way you would tell the pilot "Collect sediment sample, please", and the model opens that skill. No guessing involved.
2. **By description** — In the second you say nothing about the skill. The model reads the descriptions while it works and decides for itself that this task needs one. Its only clues are the name and description you wrote, so if the description is poor, the skill stays unused, however good its instructions are.
3. **Unused is real** — And skills going unused is not a theory: it has been measured, though only in one vendor's test of one documentation skill, so hold the finding loosely. The question it should leave you with, in front of every skill you write, is whether the model would ever pick it.

## When to write one {#when-to-write-one}

#### Voice script

1. **Sunlight** — We are one level down, in the sunlit zone. Here we decide two things: when a task deserves a skill at all, and how to describe it so the model actually picks it.
2. **Borrowed principles** — From here on I borrow principles from engineering, information architecture and UX, and they all lean on one idea: what works for people also works for AI. I say that as a strong rule of thumb, not as a law.
3. **Why a rule of thumb** — It holds because the model acts only on what you hand it, like a capable newcomer on their first day. It is only a rule of thumb because there are places where it breaks, and I've put those in the notes on the next Slide for you to read.

### The third time is the signal {#the-third-time-is-the-signal}

#### Visual

master: grid-1x3 · motion: local

AI statement, the headline caption: "Write a skill the third time, once you know what a good result looks like." Analogy caption, smaller and beside the picture: "Explain the sample, refine it, write the card."

A callback to the first Slide's comic, in three panels, each headed by what happens with the AI: "1st time: you learn what's needed" (explaining the sediment sample), "2nd time: you refine it" (refining it), "3rd time: you write the skill" (writing the card). The first Slide's empty card fills with steps. A small callout at the end: "Did you know? This matches the rule of three from Fowler's Refactoring", a software engineering rule against generalising too early.

#### Speaker notes

1. **When to write a skill: Fowler's rule of three** — "The first time you do something, you just do it. The second time you do something similar, you wince at the duplication, but you do the duplication thing anyway. The third time you do something similar, you refactor." [1] It is a heuristic, not a measured result. The credit to Don Roberts is in the 1999 book, which the research could not read.
   - sources: [1] Fowler, Refactoring: Improving the Design of Existing Code (1997 slides) — https://pdfs.semanticscholar.org/2f09/a866bc7cb521227dc5ab2c4092096077c1ac.pdf
2. **The model as a new employee: why the rule of thumb holds** — Anthropic tells the writer to think of Claude as "a brilliant but new employee who lacks context on your norms and workflows", and to show a prompt to a colleague with minimal context [2]. Anthropic Engineering calls building a skill "like putting together an onboarding guide for a new hire" [3].
   - sources: [2] Anthropic, Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
   - sources: [3] Anthropic Engineering, Equipping agents for the real world with Agent Skills — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
3. **Where the model is not like a person** — each is backed by a source, but listing them as the breaks is a synthesis: sessions start fresh, so only written files carry over [4]; rules in a file are "context, not enforced configuration" [4]; newer models read instructions more literally [5]; the same words read differently by model [5]; assistants drift toward agreeing with the user [6].
   - sources: [4] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory
   - sources: [5] OpenAI, GPT-4.1 Prompting Guide — https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
   - sources: [6] Sharma et al., Towards Understanding Sycophancy in Language Models — https://arxiv.org/abs/2310.13548

#### Voice script

1. **Three tries** — So when does a task become a skill? Think about what you learn each time you explain it to the model. The first time you find out what is needed at all, the second time you tighten it, and by the third time you can tell what a good result looks like, which is the moment you know what you would be writing down.
2. **Not only repetition** — But counting is not enough. If you cannot check whether the result was good, you are not capturing a procedure, you are copying a habit, and the skill will repeat your habit with great confidence.
3. **Did you know** — Software engineers arrived at this the same way, long before any AI tool: they call it the rule of three, from Fowler's Refactoring, a rule against generalising too early. I'll leave the exact wording in the notes, because the point here is only that people got there first.

### Not every repeat deserves a skill {#not-every-repeat-deserves-a-skill}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "A skill written too early locks in a procedure nobody has proven." Analogy caption, smaller and beside the picture: "A manual stuffed with thin cards buries the one you need."

A manual stuffed with thin cards, several stamped "never tested". Beside it, the three-question check in AI terms: "Before you write a skill: does the task repeat, does it have rules, does a mistake cost something?" A small callout names YAGNI and Knuth on premature optimisation. The index grows line by line until it runs off the page, the one entry you need buried in the middle.

#### Speaker notes

1. **Skills written too early: Knuth on premature optimisation** — "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%" [1]. His reason is a cost, and the same paper calls ignoring efficiency in the small "an overreaction", so it is a rule about timing and measurement. The quotes were not checked against the original (the ACM page returned 403).
   - sources: [1] Knuth, Structured Programming with go to Statements — https://dl.acm.org/doi/10.1145/356635.356640
2. **Skills nobody needs yet: YAGNI, and what it does not cover** — "Always implement things when you actually need them, never when you just foresee that you need them" [2]. Fowler counts four costs of a presumptive feature (build, delay, carry, repair) and says YAGNI does not apply to effort to make software easier to modify [3].
   - sources: [2] Jeffries, You're NOT gonna need it! — https://ronjeffries.com/xprog/articles/practices/pracnotneed/
   - sources: [3] Fowler, Yagni — https://martinfowler.com/bliki/Yagni.html
3. **A crowded skill index costs the AI too** — by default every skill's description is loaded on every turn, unless the skill is user-only, and Claude Code and Codex cap or shorten the skill listing, so a crowded index can shorten or drop descriptions [4][5].
   - sources: [4] Anthropic, Extend Claude with skills (Claude Code docs) — https://code.claude.com/docs/en/skills
   - sources: [5] OpenAI, Build skills (Codex docs) — https://learn.chatgpt.com/docs/build-skills

#### Voice script

1. **Too early** — Now the opposite danger. If you write the skill after the first run, you freeze a guess, and a procedure nobody has proven now carries the authority of a skill.
2. **A thin card has a price** — And every quick skill has a price. It is one more thing to keep right and one more line in an index that only grows, so picture a manual stuffed with thin cards, several of them never tested, until the one you need is buried in the middle.
3. **Three questions** — So before you write a skill, ask three questions. Does the task repeat, does it have rules, and does a mistake cost something? If the answer is no to all three, leave it in the chat. This check is mine, a practical filter I use, not a published test.

### Write it from a good run {#write-it-from-a-good-run}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Turn a run that worked into a skill: from your own notes, or by asking the AI to write it up." Analogy caption, smaller and beside the picture: "Your logbook pages, or the pilot's evening interview about today's good dive."

Two paths into one skill, each headed by its AI label. Left, "From your own notes": your logbook pages from earlier dives. Right, "From an AI interview": today's dive went well, so before evening the pilot interviews you about it (why that depth, why that order, what would have counted as failure), then writes the card while he still knows. A callout: "Asking the AI to interview you works here too." Coding-agent view: asking the agent to turn this conversation into a skill. Both sources fold into one card.

#### Speaker notes

1. **Write the skill from a real run** — the standard advises: "Complete a real task in conversation with an agent, providing context, corrections, and preferences along the way. Then extract the reusable pattern into a skill." A skill an LLM writes from general knowledge alone yields "vague, generic procedures" [1].
   - sources: [1] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
2. **The agent can interview you** — Anthropic's skill-creator checks the current conversation for a workflow the user wants to capture, extracts answers from it first, then interviews the user to fill gaps [2].
   - sources: [2] Anthropic, skill-creator SKILL.md — https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md
3. **Run the task without a skill first: Google's route** — Day 3 suggests asking your most experienced practitioner to "narrate three workflows they do regularly", picking the most repeated one, running the prompts without any skill loaded, and drafting a SKILL.md from the transcript. It closes with "Resist the urge to let an LLM generate fifty skills on day one." [3] This agrees with the standard's advice to extract from a real run. It is Google's vendor guidance, not a measured result.
   - sources: [3] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills

#### Voice script

1. **Two starting points** — Say it is the third time and you are ready to write the skill. There are two good places to start: your own notes from earlier runs, the logbook pages of earlier dives, or a run with the AI that has just gone well, today's dive, while it is fresh.
2. **Capture the why** — With the fresh run, ask the AI to interview you before it writes anything: why that depth, why that order, what would have counted as failure. You want the skill to hold your intent and not only the steps, because steps without the why break the first time the situation changes.
3. **While he still knows** — Then let it write the skill in the same conversation, while the whole run is still in its context window. Tomorrow it will have forgotten, and that is the condition we started with. So that is your first step: pick one task you've explained three times, and turn a good run of it into a skill. In a coding agent, that is one sentence: ask it to turn this conversation into a skill.

## The description {#the-description}

#### Voice script

1. **The label decides** — We are still in sunlight, and this is the part most people skip. A skill the model never picks helps nobody, so the description matters more than the instructions.
2. **Name, description** — Before the model opens a skill, it sees two lines: the name and the description. That is all the index holds, and it is all the model has to decide with.

### The description is the trigger {#the-description-is-all-the-ai-sees}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "The AI sees only the name and description up front, and the description decides when the skill loads." Analogy caption, smaller and beside the picture: "From the pilot's chair: the index is open, every card behind it closed."

The manual from the pilot's view: the index readable and labelled "loaded: name and description", every card behind it closed, greyed out and labelled "not loaded yet". Two descriptions side by side: a vague "Samples" and a clear "Take a sediment sample at a new site". A small callout names information scent, from Xerox PARC research. Coding-agent view: the name and description lines of a `SKILL.md`. The clear entry lights up as the dive's task appears.

#### Speaker notes

1. **Description carries the whole burden** — because only name and description load at startup, "the description carries the entire burden of triggering. If the description doesn't convey when the skill is useful, the agent won't know to reach for it" [1].
   - sources: [1] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
2. **Descriptions and information scent** — Pirolli and Card's abstract names "information scent models, which address the identification of information value from proximal cues" [2]. It is a finding about people foraging for information; that a vague label gives a model less to go on is an inference, not their finding. The page-646 definition was read second-hand.
   - sources: [2] Pirolli and Card, Information Foraging (Psychological Review, 1999) — https://doi.org/10.1037/0033-295X.106.4.643

#### Voice script

1. **The pilot's view** — Sit in the model's chair for a second. At the start of a task it has every skill's name and description in front of it, and none of the instructions behind them, like a pilot with the index open and every card closed. So unless you call the skill by name, the description is the trigger: it decides whether the model picks the skill on its own.
2. **Two entries** — Take two descriptions for the same skill: "Samples", and "Take a sediment sample at a new site". A task comes in, because we have just reached a new site. Which one would you open?
3. **Scent** — Researchers who study how people search call this information scent: the cue on a label that tells you whether it leads where you want to go. They found it in people, and I am lending it to the model. So your job is to make the description smell like the task it serves, because that scent is what pulls the trigger.

### Name the trigger, not the content {#name-the-moment-not-the-content}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Say what a skill does and when to use it, in the words someone would actually say." Analogy caption, smaller and beside the picture: "Two index lines for the same card; only one matches what the captain says."

Two descriptions for the same skill, each headed by its AI label. "Describes the content": "SOP-07: corer handling, steps 1 to 9". "Describes the moment", in two halves: "Takes a sediment core. Use when we reach a new site and need a sample from the seabed." and a closing "Not for water samples or filming." Above them, your request on the day: "Grab some mud here before we move on." Only the moment description says when it is needed; the content line says nothing about it. A line is drawn from your request to the moment description.

#### Speaker notes

1. **A description says what and when** — the standard says a description "Should describe both what the skill does and when to use it" and include keywords that help agents identify relevant tasks [1]. Anthropic adds specific triggers and contexts, because Claude chooses among potentially 100+ skills by it [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
2. **Write the description in the user's words** — "Use imperative phrasing", "Focus on user intent, not implementation", and "Err on the side of being pushy. Explicitly list contexts where the skill applies" [3].
   - sources: [3] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
3. **"Not for" lines in a description: Google's advice alone** — the standard and Anthropic recommend no "not for" clause in a description. Over-triggering is handled there by testing near-miss queries that share keywords but need something different, which "test whether the description is precise, not just broad" [4].
   - sources: [4] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
4. **The "not for" clause in Google's Day 3** — Google's Day 3 whitepaper writes "explicitly state what it is not for", gives the example "Do NOT use for employee shift scheduling or financial accounting", and its checklist says "Include **when NOT to use** to prevent over-triggering" [5]. It calls the description "your routing algorithm. It is the only thing the model sees to decide whether to load the Agent Skill" and asks to "be pushy if the model under-triggers". It gives no measurement that the clause helps, so it is Google's vendor guidance, a choice between sources.
   - sources: [5] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills

#### Voice script

1. **Two labels** — Here are two descriptions for the same skill. The first names the content, "SOP-07: corer handling, steps 1 to 9", and the second says what the skill does and names the moment, "Takes a sediment core. Use when we reach a new site and need a sample from the seabed". One says only what is inside, the other names the trigger, when you need it, and that is your second step: write the description as the moment you'd need it.
2. **Your request** — Now it is the day of the dive and you type, "Grab some mud here before we move on." Nothing in "SOP-07, steps 1 to 9" tells the model when it is needed, but "a sample from the seabed" does, so only the moment description matches. Write it in the words you would actually say.
3. **The closing line** — Last, the moment description can end on a second half: "Not for water samples or filming." It tells the model where the skill stops, so it does not open it for a job it cannot do. Treat that half as a choice and not a rule, and test whether it helps your skill.

### More skills, harder choice {#more-skills-harder-choice}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Skills that look alike leave the AI guessing; a short list in the project instructions takes the guess away." Analogy caption, smaller and beside the picture: "Near-twin cards leave the pilot guessing; the list on the wall settles it."

A skill index crowded with near-twins ("Sample", "Take sample", "Seabed sample v2") and a question mark over the console. Beside it, the project instructions, labelled as such and drawn as the project brief on the wall, carry a short list: "On this project, use these three cards." One callout names Hick's law as a finding about people; another gives Vercel's test, where a line in `AGENTS.md` telling the agent to use its skill raised the pass rate from 53% to 79%. A third callout states the naming rule, "Name it as an action, lowercase words joined by hyphens", as Anthropic's skill-authoring best practices put it, with "Anthropic" named on the Slide. The twins fade back and one line on the wall list lights up.

#### Speaker notes

1. **Choosing among many skills: Hick and Hyman, a finding about people** — Hick applied information theory to choice-reaction-time experiments with up to ten alternatives [1]. Hyman reports that reaction time rises linearly with the amount of information in the choice [2]. That a longer list makes an AI choose worse is an inference, not a measured result.
   - sources: [1] Hick, On the Rate of Gain of Information (Quarterly Journal of Experimental Psychology, 1952) — https://doi.org/10.1080/17470215208416600
   - sources: [2] Hyman, Stimulus Information as a Determinant of Reaction Time (Journal of Experimental Psychology, 1953) — https://doi.org/10.1037/h0056940
2. **An AGENTS.md index beat skills: Vercel's test** — a line in `AGENTS.md` telling the agent to use its skill raised the pass rate from 53% to 79%, and the skill was opened in 95% or more of cases [3]. A compressed docs index of about 8KB in `AGENTS.md`, replacing the skill, reached 100%. Vercel's working theory: no decision point, and skills load only when invoked [3]. It is one docs skill for one framework, not a procedure.
   - sources: [3] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
3. **Skills too broad or too narrow** — the standard warns that skills "scoped too broadly become hard to activate precisely", while too narrow forces several to load [4]. No source measures lookalike skills lowering the pick rate directly.
   - sources: [4] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
4. **Name each skill as an action** — Anthropic's skill-authoring best practices say a skill's `name` uses lowercase letters, numbers and hyphens only, prefer the gerund form (`processing-pdfs`) and list action-oriented names such as `process-pdfs` and `analyze-spreadsheets` as an acceptable alternative; they advise against inconsistent patterns within a skill collection [5]. This Episode names its skills in the action form, `collect-sediment-sample`.
   - sources: [5] Anthropic, Skill authoring best practices (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

#### Voice script

1. **Near-twins** — Now see what happens when the skills pile up. "Sample", "Take sample", "Seabed sample v2": three skills whose descriptions sound alike, and a model that has to guess between them. It guesses, and you made it do so.
2. **A short list on the wall** — The fix is cheap: a short list in your project instructions, AGENTS.md if you work with a coding agent, that says "In this project, use these three skills." Project instructions are always loaded, so the model no longer has to choose from a crowded index. On our ship, that is a list on the wall.
3. **Hick's law** — People have the same trouble: the more the options look alike, the longer it takes to choose, and psychologists call that Hick's law. I am lending it to the model, so hold it as a picture, not a measurement. What I want you to take from this Slide is the short list: it is short, and it is always loaded.
4. **Name it as an action** — One more habit keeps the index tidy: name each skill as an action, in lowercase words joined by hyphens, like collect-sediment-sample. A name that says what the skill does tells the model, and you, what it is for before anyone reads the description, and when every name follows the same pattern, a near-twin stands out before it gets written.

## What context goes inside {#what-goes-inside}

#### Voice script

1. **Twilight** — Deeper now, into the twilight zone, where the light is dim. The skill is written and described, and the question is what context goes into it and what stays beside it.
2. **A decision, not a law** — I want to be careful with the word rule here. Keeping the procedure apart from project details is a design decision with trade-offs on both sides, so I'll show you the trade-offs and you decide.

### What context goes where {#what-goes-where-is-information-architecture}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Where you put each piece of knowledge decides how well, how widely and how cheaply a skill works." Analogy caption, smaller and beside the picture: "Today's site depth: written on the card, on the project brief on the wall, or in today's dive plan?"

One piece of knowledge, today's site depth, with three possible homes, each led by its AI label and its plain costs, the scene beneath: "In the skill: loaded with the skill each time it runs, but the skill now fits one project" (on the card, it fits one site); "In the project instructions: always loaded, so it costs tokens on every task, whether the task needs it or not, and the skill stays free for any project" (on the project brief on the wall); "In a project file the skill reads: loaded only when a step reads it, and the skill fits every project" (in today's dive plan). The depth note moves from the card to the dive plan. A concept card above the picture, like the one on the progressive disclosure Slide: information architecture, defined by Nielsen Norman Group in its own words, source named on the Slide. The three home cards stand in one row at equal width.

#### Speaker notes

1. **Information architecture, as Nielsen Norman Group defines it** — "Information architecture is the practice of structuring and organizing content on your site." [3] The Slide shows this sentence verbatim, with the source named; the site is read as the skill and its project by analogy.
   - sources: [3] Tankala, Information Architecture vs. Sitemaps, Nielsen Norman Group (3 Sep 2023) — https://www.nngroup.com/articles/information-architecture-sitemaps/
2. **Information architecture, in its authors' words** — "a design discipline that is focused on making information findable and understandable" [1]; one of their four definitions is "The structural design of shared information environments" [2]. "The craft of organising information so it can be found" is a paraphrase, not their wording.
   - sources: [1] Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., Part I introduction — https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html
   - sources: [2] Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., ch. 2 — https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html
3. **Every line of a loaded skill is a recurring token cost** — once loaded, a skill's content "stays in context across turns, so every line is a recurring token cost" [4], and every token "competes for the agent's attention" [5].
   - sources: [4] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [5] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices

#### Voice script

1. **A home for each fact** — Take one piece of project knowledge, something that changes from one project to the next, like the depth of today's dive site. It needs a home, and you have to pick one. Choosing where each piece of context lives is information architecture, the same craft that decides where things go on a well-built website, and you practise it whether or not you call it that.
2. **Three costs** — Every home costs you in three ways. Performance asks whether the model actually reads it at the moment it needs it, reusability asks how many projects the skill still fits, and token cost asks how much of the context window it fills, and how often.
3. **Three homes** — There are three homes for it. Inside the skill, it arrives every time the skill runs, but now the skill fits only this project. In your project instructions, it sits in the context window on every task, whether the task needs it or not, and the skill stays free for any project. In a project file the skill reads, it is loaded only at the step that needs it, and the skill fits every project. None is right in general, so it depends on how many projects the skill will serve.

### A project detail couples a skill to one project {#one-skill-one-job}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "A project detail written into a skill ties it to that one project." Analogy caption, smaller and beside the picture: "At site 7 the seabed lies at 120 m; the card still says 40."

One sampling card with "descend to 40 m" scribbled in for site 4, above two dives: at site 4 the robot reaches the seabed at 40 m; at site 7 the seabed lies at 120 m and the robot hangs at 40, 80 m short. A side card names the idea, coupling: a project detail written into the skill. A one-line pointer says code has a word for this, coupling, from structured design, applied to skills by analogy. The robot stops short, far above the seabed.

#### Speaker notes

1. **Coupling, as first written** — "The fewer and simpler the connections between modules, the easier it is to understand each module without reference to other modules" [1]. It is a design principle for code modules, applied to skills by analogy.
   - sources: [1] Stevens, Myers and Constantine, Structured design — https://doi.org/10.1147/sj.132.0115
2. **Project details hard-coded into a skill can override the task** — in a benchmark of 98 public skills, a generic workflow template made the agent write files to `.github/workflows/` when the task required `ci/`; the authors advise abstract guidance over templates with hard-coded paths [2]. It is one worked example, not a test of this picture.
   - sources: [2] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401

#### Voice script

1. **Scribbled in** — Take a sampling skill with one project detail written into it: "descend to 40 metres", true at site 4. At site 7 the seabed lies at 120, and the robot hangs uselessly at 40 while the model follows the skill perfectly. (pause) The skill was followed to the letter, and the dive still failed.
2. **Coupling** — Engineers have a word for this mistake: coupling. The 40 metres written into the skill ties it to one place. For a skill it comes down to this: keep project details out, so the skill has no ties to one project.

### Inside the skill {#inside-the-skill}

#### Visual

master: three-column · motion: local

AI statement, the headline caption: "Domain knowledge can live inside a skill, kept apart from the steps until a step needs it." Analogy caption, smaller and beside the picture: "The card in its sleeve: each extra tied to the step that uses it."

The skill's instructions as numbered steps, each supporting file led by its AI label and drawn as an extra in the card's sleeve: step 3, "lower the arm", points to a script (the arm preset, which runs a fixed motion); step 4, "identify what you collected", points to a reference file (the species guide, which opens on its own contents page); step 6, "label the sample", points to a template (the label template). Two notes in AI terms: "When the instructions get long, move the next paragraph into a reference file"; "Long reference files start with a contents list, because the AI may only read the start." Coding-agent view: `SKILL.md` linking one level deep into `references/`, `assets/` and `scripts/`. Step 4 lights up and the species guide slides out. A visible line under the caption says this is progressive disclosure, linked to the progressive disclosure Slide.

#### Speaker notes

1. **Move detail out of SKILL.md, and say when to read it** — "Keep your main SKILL.md under 500 lines. Move detailed reference material to separate files" [1]. The key is telling the agent when to load each file, for example "Read references/api-errors.md if the API returns a non-200 status code" [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
2. **Long reference files start with a contents list** — "For reference files longer than 100 lines, include a table of contents at the top. This ensures Claude can see the full scope of available information even when previewing with partial reads" [3]. This is Anthropic's account of Claude's behaviour and no source measures its effect.
   - sources: [3] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
3. **References stay one level deep** — Claude "might partially read files when they're referenced from other referenced files", using commands such as `head -100`, so references stay one level deep from `SKILL.md` [4]. The standard states the rule without the reason [5].
   - sources: [4] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
   - sources: [5] Agent Skills, Specification — https://agentskills.io/specification
4. **Progressive disclosure, as Anthropic names it** — Anthropic's docs say the filesystem-based design "allows progressive disclosure: Claude loads information in stages as needed, rather than consuming context upfront" [6]. Supporting files opened only at the step that needs them are the same idea as the three loading levels.
   - sources: [6] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

#### Voice script

1. **Extras by step** — So what can safely live inside a skill? Domain knowledge, kept in supporting files and tied to the step that needs it. Step three, lower the arm, runs a script, the arm preset. Step four, identify what you collected, reads a reference file, the species guide, and step six, label the sample, fills in a template.
2. **The long step** — When one step's instructions grow long, move the next paragraph into a reference file and leave a pointer in the step, so the instructions stay short enough for the model to take in at once.
3. **Contents first** — And start every long reference file with a contents list, because the model may only skim the top. When step four opens the species guide, its contents page alone tells the model what else is inside.

## What context stays beside {#what-stays-beside}

#### Voice script

1. **Beside, not inside** — Now the other home: project details that stay outside the skill, in project files it reads when it runs. The procedure goes inside, and whatever changes from one project to the next stays beside.
2. **Where it gets shared** — And who uses the skill decides how much care it needs. A skill for your own use can be loose, and a skill a colleague runs needs more, which sets up the next Section.

### Beside the skill {#beside-the-skill}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Project details can stay beside the skill, in files it reads when it runs." Analogy caption, smaller and beside the picture: "Same card, any site: this time the robot reaches the seabed at 120 m."

The previous mistake, fixed. The skill's step, labelled "Points to a project file", now says "descend to the depth in today's dive plan", and a line runs from that step to a project file the skill reads when it runs, drawn as today's dive plan pinned on the wall: "Site 4: 40 m. Site 7: 120 m." Coding-agent view: the step pointing to a project file such as `CONTEXT.md`. This time the robot reaches the seabed at 120 m.

#### Speaker notes

1. **A skill teaches the class of problem and reads the instance** — a skill "should teach the agent how to approach a class of problems, not what to produce for a specific instance"; the example reads the schema from `references/schema.yaml` instead of writing joins into the skill [1]. Claude Code offers `${CLAUDE_PROJECT_DIR}` so a skill can reference project files independent of where it is installed [2].
   - sources: [1] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
   - sources: [2] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills

#### Voice script

1. **The card points** — Here is the mistake from before, fixed. The skill no longer says 40 metres. Its step says "descend to the depth in today's dive plan", and that dive plan is a project file the skill reads when the step runs: site 4, 40 metres, site 7, 120 metres.
2. **Same card, any site** — Replay site 7. It is the same skill with no edit, and this time the robot reaches the seabed at 120 metres. The procedure stayed put and the site details lived in the project file, which is your third step in miniature: decide where the project details live.
3. **For developers** — In the coding-agent view the step names a project file, say CONTEXT.md, and the agent reads it when that step runs. For everyone else, it is any document in your project that the skill tells the model to read.

### Who uses it, and where {#who-uses-it-and-where}

#### Visual

master: grid-2x2 · motion: local

AI statement, the headline caption: "Who uses a skill, and where, decides what goes inside it and how much care it needs." Analogy caption, smaller and beside the picture: "One card moves from your notebook to the fleet manual; project cards stay in the project binder."

A simple 2x2, readable at rest and labelled "rule of thumb". Axes in organisational words: personal or shared skill, and general use or project-specific. Each square leads with its AI text, a small project picture beneath it. Personal and project-specific: details written into the skill, least upkeep. Personal and general: details kept beside the skill, your own toolkit. Shared and project-specific: details kept in its supporting files, owned by the project team. Shared and general: details kept beside, with an owner, a version and evals; owned, versioned and tested. One card moves from your notebook to the fleet manual, labelled "personal skill" then "shared skill", losing its scribbled details and gaining an owner tag.

#### Speaker notes

1. **Where a skill is stored encodes who gets it** — Claude Code skills in the home directory load "in every project", skills committed to a repository reach "everyone who works there", and plugins or managed settings reach "a whole team" [1]. Codex splits repository folders from user folders the same way [2].
   - sources: [1] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [2] OpenAI, Build skills (Codex documentation) — https://learn.chatgpt.com/docs/build-skills
2. **The skill scope matrix is an inference** — no published framework combines the two axes into a 2x2 with care levels; the nearest are one-axis tier schemes [3]. Microsoft's zoned governance ties care to audience for agents, not skills: private personal agents, approved environments and admin approval for shared ones [4]. Label the square a rule of thumb.
   - sources: [3] Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution — https://arxiv.org/abs/2604.16911
   - sources: [4] Microsoft, Implement a zoned governance strategy (Copilot Studio) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2
3. **Evals matter once a skill is shared** — 40 of 98 skills change sign between two harnesses running the same model, so a skill is best evaluated "with the model, agent, and repositories in which it will be deployed" [5].
   - sources: [5] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401

#### Voice script

1. **Two questions** — Here is a decision tool, and it asks two questions. Who uses the skill, only you or others too? And where, in any project or in one in particular?
2. **Four squares** — Four squares come out of that. Personal and project-specific: write the details straight in, it needs the least upkeep. Personal and general: keep the details beside, it is your own toolkit. Shared and project-specific: the details can live in its supporting files, and the project team owns it. Shared and general: the details sit beside, with an owner, a version and evals. So as a skill moves from your own notebook into the shared library, it loses its project details and gains an owner.
3. **A rule of thumb** — This matrix is a rule of thumb, and the label is mine. It is how I think about it, so try it on your own skills and tell me where it breaks.

### grill-with-docs keeps context beside the skill {#how-grill-me-and-grill-with-docs-work}

#### Visual

master: three-column · motion: local

AI statement, the headline caption: "The interview stays the same; what each run settles about your project is written beside it, for the next run to read. Based on Matt Pocock's grill-with-docs skill, from his skills repo (github.com/mattpocock/skills)." The caption links the skill and the repo. The analogy appears only as the small key in the corner.

The only Slide outside the control room, a showcase on the real files. One skill, grill-with-docs, holds the two skills it runs, the grilling interview (the procedure, highlighted) and domain-modeling, labelled "Stays the same every run". Beneath it two runs, Monday and Thursday: each writes `GLOSSARY.md` and decision records beside the skill, with an arrow carrying Monday's files into the start of Thursday's run. `GLOSSARY.md` gains a new term after Thursday's session. A small key in the corner maps them to the card and today's dive plan. A closing line: a skill can also run other skills (grill-with-docs runs grilling and domain-modeling), with no settled name for it yet.

#### Speaker notes

1. **Project context written beside the skill, read next run** — Anthropic says models, like people who use "file systems, inboxes, and bookmarks", do well with notes kept outside the context window [1], and a skill should teach an approach while reading instance details from files [2]. The grill-with-docs files are this repository's own copy of Matt Pocock's skill [3], not a research source. The Slide shows grill-with-docs only; the grill-me skill is not shown.
   - sources: [1] Anthropic Engineering, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - sources: [2] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
   - sources: [3] Pocock, skills (GitHub repository; skills/engineering/grill-with-docs) — https://github.com/mattpocock/skills

#### Voice script

1. **The interview is the card** — Let me show you inside and beside together, on real files instead of the dive. This is grill-with-docs, a skill by Matt Pocock that I use, and it runs an interview, which is the procedure. It stays the same every time.
2. **Follow the arrow** — While it runs, grill-with-docs writes files beside itself, a glossary and decision records, and the next run checks your words against them. The skill stays the same, and what it learned about your project waits beside it.
3. **Skills can run skills** — One last thing: a skill can also run other skills: grill-with-docs runs one called grilling and another called domain-modeling. There is no settled name for that yet, and I'll leave it there.

## Sharing it {#sharing-it}

#### Voice script

1. **Midnight** — Now we are in deep water, the midnight zone. Everything so far was for you, so what changes when a colleague runs your skill?
2. **Three jobs** — Three jobs wait down here. Give the skill an owner and a version, decide who looks after the shared library, and test that the skill actually helps.

### Shared skills are knowledge articles {#shared-skills-are-knowledge-articles}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "A shared skill needs an owner, a version and a review date, as Anthropic's enterprise guidance asks for every skill." Analogy caption, smaller and beside the picture: "Your notebook card, and the same card in the institute's fleet manual, like a company knowledge article."

Two copies of the same skill, each headed by its AI label. Left, "Personal skill": your notebook card, with no header. Right, "Shared skill": the same card in the institute's fleet manual, with a control block: owner, version 1.3, next review in March. A small note: personal skills skip this until you share them. The control block is stamped on as the card moves into the fleet manual.

#### Speaker notes

1. **A skill registry entry** — Anthropic's enterprise guidance says to keep a registry entry per skill with purpose, owner ("Team or individual responsible for maintenance"), version, dependencies and evaluation status including the last evaluation date [1].
   - sources: [1] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
2. **A skill review date is an adaptation** — Knowledge-Centered Service does not review on a schedule: "Let reuse of Not Validated articles be the review" [2], and the page does not use the word "owner". Owner, version and a calendar review date combine KCS and Anthropic's guidance; no source defines them as a rule for skills.
   - sources: [2] Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State — https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030
3. **The Agent Skills format has no owner field** — the Agent Skills format has no owner, version or review-date field; its optional `metadata` map holds them by convention [3]. Anthropic also says "Skill authors should not be their own reviewers" [4].
   - sources: [3] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [4] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Your notebook** — A personal skill has no header at all, like a card in your own notebook. That is fine while it is only yours, because you know who wrote it, when you last used it, and who fixes it when it breaks.
2. **Into the fleet manual** — Once you share it into your team's skill library, the fleet manual on our ship, it needs what any company knowledge article has: an owner, a version, and a date for its next review. It is the same skill with a control block on top, and your personal skills can skip this until you share them.
3. **Why** — Why bother? Because once it is shared, one author's edit changes what the model does for everyone who runs it, and nobody knows whom to ask when it goes wrong. That is your third step: before you share a skill, decide where the project details live, and give it an owner.

### Who owns the shared skill library {#who-owns-the-shared-skill-library}

#### Visual

master: grid-2x2 · motion: local

AI statement, the headline caption: "Shared, general skills need rules for who adds, checks and removes them, and there is no settled practice yet." Analogy caption, smaller and beside the picture: "The fleet manual's front page."

The earlier matrix returns and the view zooms into the shared, general square. Inside it, the front page of the shared skill library, drawn as the fleet manual, lists what a skill needs beyond the control block, each line led by its AI term: who may add one; its tier, who it reaches (fleet, ship or project in the scene); its token cost; which models and agents it works with (which robots); and a retirement date. One corner stays dark and unlabelled, for the questions nobody has settled yet.

#### Speaker notes

1. **Shared skills are tiered by audience** — Anthropic's tiers in claude.ai: personal skills, skills shared with individuals, group skills bundled in a plugin, and organisation-wide skills that only owners can add or remove [1]. "Fleet, ship, project" are the Episode's words, not vendor terms; vendors tier by audience and risk, not by how general the content is.
   - sources: [1] Anthropic, Provision and manage skills for your organization — https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization
2. **Who adds, reviews and removes shared skills** — the org library offers "Requires review", "Open" and "Off", a reviewer approves "a fixed version" and users stay on it until a new one is approved [2]. Anthropic says to pin production skills to a version and to deprecate skills whose evaluations consistently fail or whose workflow is retired [3].
   - sources: [2] Anthropic, Provision and manage skills for your organization — https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization
   - sources: [3] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
3. **Token cost and model fit are per-skill facts** — a loaded skill is a recurring token cost [4], and a skill's value depends on the model and harness it runs in [5].
   - sources: [4] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [5] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401
4. **Skill governance "still being worked out" is a judgement** — Anthropic's enterprise guidance lists what to track per skill (purpose, owner, version, evaluation status) and does not report how many organisations do so [6], so the unsettled corner is the Episode's judgement, not a measured claim.
   - sources: [6] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Back to the square** — Come back to the matrix, to the shared, general square. That is the kind of skill the most people rely on, so it is where care matters most.
2. **What the front page needs** — A shared library needs rules beyond the owner and the version: who may add a skill, which tier it sits in and so whom it reaches, what it costs to load, which models and agents it works with, and when it retires. Each is a question somebody has to answer before the skill goes in.
3. **The dark corner** — And then there are the questions nobody has settled yet. I want to be plain with you: I do not have the answers there, and I don't think many organisations do yet. If you have worked it out in yours, I would like to hear how.

### Does the skill make things better? {#does-the-skill-make-things-better}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Test a skill by running the same task with and without it, because a bad skill can do worse than none." Analogy caption, smaller and beside the picture: "Two test dives in shallow water, the same task each time."

Two eval runs side by side, the same task each time, labelled "Without the skill" and "With the skill", each with a scorecard; the picture is two test dives in shallow water, the pilot working without the card on the left and with it on the right. Below, a small check for the description: a few requests that should trigger the skill and a few that should not, including near-misses. A callout: "In one benchmark, skills an AI wrote for itself before solving the task, with no good run behind them, scored below having no skill." The two scores fill in, one after the other.

#### Speaker notes

1. **Skills that score below no skill: SkillsBench, not Vercel** — skills written by the agent itself land 8.1 to 11.5 points below the no-skill baseline on all three configurations tested [1]. In Vercel's eval the skill tied the baseline at 53%; only sub-scores dipped (lint 89% against 95%, test 58% against 63%) [2]. Do not attribute "below no skill" to Vercel's headline.
   - sources: [1] Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks — https://arxiv.org/abs/2602.12670
   - sources: [2] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
2. **Bad skills can hurt, many do nothing** — of 98 public skills, 92 showed no statistically significant effect, and harmful ones lost up to 17.0 points by anchoring the agent on their own templates [3]. Curated skills raised the average pass rate from 33.9% to 50.5% [4].
   - sources: [3] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401
   - sources: [4] Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks — https://arxiv.org/abs/2602.12670
3. **Test the skill's description too** — the trigger set in the agentskills.io guide to descriptions is "about 20 queries: 8-10 that should trigger and 8-10 that shouldn't", each run about 3 times [5]. Anthropic's guide says to build scenarios and compare against a no-skill baseline [6]. "Three and three" is in neither.
   - sources: [5] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
   - sources: [6] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
4. **Trigger tests in Google's Day 3: two sizes** — Day 3 says a description must pass checks "to hit the industry-standard 90% trigger accuracy rate", the first being "You must write 3 positive and 3 negative triggers", with no source for the rate. Elsewhere it says "Write three eval cases (two positive, one negative) before drafting the body" [7]. Its own counts disagree, it is Google's vendor guidance, and none of it is measured.
   - sources: [7] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
5. **Skill evals in Google's Day 3: one figure misread** — Day 3 says "a skill stripped of its instructions scored 58%, while the agent without the skill scored 63%" [7]. In Vercel's post that is the default skill against the baseline on the test sub-score alone, and overall they tied at 53% [8]. Vercel's wording wins, and SkillsBench in the first note, not Day 3, is the evidence for skills scoring below no skill.
   - sources: [7] Singhal, Hernandez Larios, Dus, Nigam and Kolan, Agent Skills (Google whitepaper, Kaggle) — https://www.kaggle.com/whitepaper-agent-skills
   - sources: [8] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

#### Voice script

1. **Same task twice** — How do you know a skill helps? Run the same task twice, once without the skill and once with it, and compare the results, like two test dives in shallow water. Don't trust your feeling about it, because feeling useful and being useful are not the same thing.
2. **The callout** — (pause) And this test matters more than it sounds, because a skill is not automatically a gain. A bad skill can leave the model worse off than no skill at all, which is the whole reason the comparison exists.
3. **Test the label** — Test the description too. Take a few requests that should trigger the skill and a few that should not, and include near-misses, the ones that sound like the skill but need something else. Those show you whether the model reaches for it at the right moment.

## Keeping it alive {#keeping-it-alive}

#### Voice script

1. **The Abyss** — This is the deepest zone, the abyss, months later. Writing the skill was quick, and keeping it right is the work.
2. **Nobody sees it** — Most people stop at the first good run, and the part below it gets little attention, which is why I want to spend three Slides here.

### Every skill is a loan {#every-skill-is-a-loan}

#### Visual

master: vertical-stepper · motion: local

AI statement, the headline caption: "Writing a skill is quick; keeping it right costs you something every month." Analogy caption, smaller and beside the picture: "A card with a running tag, like a loan statement."

One skill with a running tag, like a loan statement, each entry a small cost that piles up, written in AI terms with the scene in brackets: project details changed (the site list changed), a new tool arrived (a new robot arm), a description now overlaps another skill (an index line overlaps another card). A callout names Ward Cunningham's technical debt. The tag grows one line at a time.

#### Speaker notes

1. **Skill upkeep as technical debt: Cunningham's words** — "Shipping first time code is like going into debt. A little debt speeds development so long as it is paid back promptly with a rewrite." "Every minute spent on not-quite-right code counts as interest on that debt." [1] He names the failure mode as "the failure to consolidate". The software parallel to skills is an inference, not his claim.
   - sources: [1] Cunningham, The WyCash Portfolio Management System — https://c2.com/doc/oopsla92.html

#### Voice script

1. **Quick to write** — A skill takes five minutes to write. That is the loan: you get the speed now.
2. **A running tab** — Then the statements arrive, one line at a time. The project details changed, a new tool arrived, and a description now overlaps another skill's. None of them is a disaster, and each is a small cost that piles up. Engineers call it technical debt, Ward Cunningham's phrase.
3. **Owning thirty** — Writing thirty skills is easy. Owning thirty is the hard part, because the cost was never in writing the skill, it is in keeping it right, month after month.

### The model changes, the skill doesn't {#the-model-changes-the-skill-doesn-t}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "A model update changes who reads your skill, so a skill that worked yesterday can behave differently today." Analogy caption, smaller and beside the picture: "Same card, two dives, two depths."

A reveal panel, led by its AI statement, "Every AI model has this condition, and each AI provider trains its own", drawn as pilot schools, every pilot with the same condition. Two panels follow, each headed by its AI label. "Model update": your pilot returns from his school's new course, same name and same card, but "descend slowly" now gives a different dive. "Different model or agent": a colleague runs your skill in another app or agent, even on the same model, and it reads the same words its own way; in the scene, a pilot from another school reads the same card in their own way. A callout names Lehman's laws, that software in use has to keep changing or it gets worse; here the world around the skill moves. The same card goes into two dives that end at different depths.

#### Speaker notes

1. **Skills in a changing world: Lehman's first two laws, and their limits** — "E-type systems must be continually adapted else they become progressively less satisfactory"; complexity increases "unless work is done to maintain or reduce it" [1]. The laws are disputed: only continuing change and continuing growth were validated by all studies reviewed [2], and Linux grew super-linearly [3].
   - sources: [1] Lehman, Ramil and Wernick, Metrics and Laws of Software Evolution: The Nineties View — https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf
   - sources: [2] Herraiz, Rodriguez, Robles and Gonzalez-Barahona, The evolution of the laws of software evolution: a discussion based on a systematic literature review — https://doi.org/10.1145/2543581.2543595
   - sources: [3] Godfrey and Tu, Evolution in Open Source Software: A Case Study — https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf
2. **Each model reads the same instructions differently** — Anthropic's guide has model-specific sections on where "a single model behaves differently and what to change in your prompt" [4]; OpenAI notes that prompts optimized for other models "may not immediately work" [5].
   - sources: [4] Anthropic, Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
   - sources: [5] OpenAI, GPT-4.1 Prompting Guide — https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
3. **The model's memory and patient H.M.: an analogy that breaks at the skill** — H.M. learned mirror drawing and kept it across 3 days while remembering none of the sessions [6], because skills are stored by a memory system outside the damaged region [7]. For a model this maps only as analogy: trained weights fit the skill side, but a skill file is read as text, which makes it closer to a declarative note. That mapping is inference; Milner 1962 was read only through Squire's account.
   - sources: [6] Squire, The Legacy of Patient H.M. for Neuroscience — https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/
   - sources: [7] Squire, Conscious and Unconscious Memory Systems — https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/
4. **The agent changes the skill too, even on the same model** — in a benchmark of 98 public skills, 40 change sign between two harnesses running the same model, and the authors advise evaluating a skill "with the model, agent, and repositories in which it will be deployed" [8].
   - sources: [8] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401

#### Voice script

1. **Not the only pilot** — There is one more thing that changes under your skill, and you do not control it: the model that reads it. Every AI model has the condition we started with, and each AI provider trains its own, the way each pilot school trains its own pilots. So the reader of your skill is never fixed.
2. **Update and switch** — Two things can change the reader. A model update: your provider ships a new version, your skill keeps the same words, but an instruction like "descend slowly" now gives a different dive. A different model or agent: a colleague runs your skill in another app, and it reads the same words its own way. The skill did not change, the reader did, and engineers saw this long ago in software: what is in use has to keep changing, or it gets worse.
3. **Hand over the verdict** — So here is my question to you: which of your skills would you re-check after the next model update? If you own one, would you trust it to behave the same way tomorrow?

### Retire skills {#retire-skills}

#### Visual

master: grid-1x2 · motion: local

AI statement, the headline caption: "Retire skills nobody uses, so the right one stays easy to find." Analogy caption, smaller and beside the picture: "Cards the dive log never mentions go into the archive box."

The skill index, drawn as the fleet manual's index, next to the season's dive log. Skills no task used are greyed out, labelled "unused this season", and go into an archive box marked with their retirement date. The index left behind is short again, the one entry you need easy to spot, a callback to the earlier buried entry. The unused cards slide into the archive box and the index closes up.

#### Speaker notes

1. **Retire a skill: archive over delete** — Knowledge-Centered Service prefers archiving to deleting, because deleting can break links and an archived article can be restored [1]. Anthropic says to deprecate a skill whose evaluations consistently fail or whose workflow is retired [2]. Reading the dive log to pick what to archive is the Episode's own method.
   - sources: [1] Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State — https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030
   - sources: [2] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Read the log** — Last job: retire skills. Put your list of skills next to what your work actually used this season, the dive log on our ship, and see which skills no task ever opened.
2. **The archive box** — Those skills go into an archive, each with the date it was retired, so the decision is written down and nobody wonders later where a skill went.
3. **Short index again** — And the index left behind is short again, with the one you need easy to find. Remember the description buried in the middle of a stuffed manual a few Slides ago? It is back in view, and the model can pick it.

### The whole iceberg {#the-whole-iceberg}

#### Visual

master: horizontal-rail · motion: local

AI statement, the headline caption: "Write a skill the third time, describe it by the moment, and decide where the project details live before you share it." Analogy caption, smaller and beside the picture: "The robot back on deck; the manual open at a short index."

The full depth ruler from the Surface to the Abyss, each Section's takeaway written at its depth in AI terms. The robot rises on its cable from the seabed to the ship, and on deck the manual lies open with a short index. Each takeaway lights up as the robot passes it.

#### Speaker notes

1. **Skill governance: what is settled, and what is not** — no source defines owner and review date as a rule for skills, and none shows how many organisations govern shared skills at all [1]. The audience-by-scope matrix is a rule of thumb, not a published framework [2].
   - sources: [1] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
   - sources: [2] Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution — https://arxiv.org/abs/2604.16911

#### Voice script

1. **Three steps** — Let me bring the three steps up from the seabed. One: pick a task you have explained three times, and turn a good run of it into a skill. Two: write its description as the moment you would need it. Three: before you share it, decide where the project details live, and give it an owner.
2. **The honest caveat** — I want to be honest about the deep end. Governance, review and retirement are the part I am least sure about, and I am still learning there too. If you find something that works, tell me.
3. **Your first card** — We are back on deck, with a short index. If you want a low-key start, take the task you explained last week and turn its best run into your first skill. Thank you.
