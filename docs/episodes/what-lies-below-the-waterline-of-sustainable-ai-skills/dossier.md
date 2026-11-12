---
type: dossier
title: What lies below the waterline of sustainable AI skills
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-11-12T16:12:31Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-11-12T16:12:31Z
---

# What lies below the waterline of sustainable AI skills {#waterline-of-sustainable-ai-skills}

## A thought experiment {#a-thought-experiment}

#### Voice script

1. **You are the captain** — Coastal research expedition. You are the captain. Your pilot of ten years, the best you know, steers the diving robot by cable from the control room.
2. **One settled condition** — He forms no new memories overnight. He keeps everything he ever learnt as a pilot. Say it as a thought experiment, no role switch.

### A pilot who forgets every morning {#a-pilot-who-forgets-every-morning}

#### Visual

master: grid-bento · motion: local

Caption: "Every conversation with AI starts from zero on how you work." A comic strip in low poly, the control room as the scene. First panel: a framed photo on the control-room wall, you and the pilot across ten years of expeditions. Then three mornings, each in its own panel: the pilot greets you with a speech bubble, "Nice to meet you", you explain the sediment sample again, and the robot sits idle on deck. The strip ends on "What would you do?" beside an empty procedure card. Panels appear one after another, nothing loops at rest, and under reduced motion all panels show at once. The Slide keeps only the question and the empty card, so it works without the live chat.

#### Speaker notes

1. **Mollick's forgetful coworker** — Ethan Mollick advises treating AI "like an infinitely patient new coworker who forgets everything you tell them each new conversation" [1]. Claude Code sessions each begin "with a fresh context window" and only written files carry knowledge across [2]. "Amnesiac" is the Episode's word, not Mollick's.
   - sources: [1] Ethan Mollick, Getting started with AI: Good enough prompting, One Useful Thing (24 Nov 2024) — https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough
   - sources: [2] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory

#### Voice script

1. **Three mornings** — Each morning: "Nice to meet you". You explain the sediment sample again. The robot waits on deck.
2. **The hook** — "You've explained this to the AI a hundred times. It has heard it once."
3. **What would you do** — Ask the question. Live workshop: answer in the chat. On video: pause on the empty card. Do not answer yet.

### The dive manual {#the-dive-manual}

#### Visual

master: grid-1x1 · motion: local

Caption: "A skill hands the AI your proven procedure on demand." One wide view of the control room: the pilot at the console, the manual open at its index, the expedition brief on the wall, and the robot on its cable through the window. Callouts name only index entry, procedure card and expedition brief. One card slides out of the manual on its own. The Spec offers Options for this Slide (comic, cutaway illustration), as Han expects a new kind of visual here.

#### Speaker notes

1. **A skill spares you the repeat** — Anthropic contrasts skills with prompts: a skill spares you from repeating the same guidance across conversations [1]. When a request matches a skill's description, Claude reads `SKILL.md` and only then does that content enter the context [1].
   - sources: [1] Anthropic, Agent Skills overview — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

#### Voice script

1. **The answer** — Write it down. A procedure card in a manual, so he reads it each morning instead of you explaining it.
2. **Three things to remember** — Index entry, procedure card, expedition brief. The Episode returns to these three.
3. **The card slides out** — Watch the one card come out of the manual. Let the picture land.

## What a skill is {#what-a-skill-is}

#### Voice script

1. **Surface first** — Before when to write one, what is on a card. Everything in chat-app words first. Coding-agent view per Slide for developers.
2. **The mechanics, plainly** — Even inside the metaphor, say how loading really works. Plain labels beside the picture.

### A skill is a procedure card {#a-skill-is-a-procedure-card}

#### Visual

master: grid-1x1 · motion: none

Caption: "A skill is a written procedure with a name and a note on when to use it." One card in a clear sleeve. The front holds the title and the "use when" line, the back the numbered steps. Tucked into the sleeve are a species guide, a sample label and an arm preset. Coding-agent view: the same card beside its folder, each part linked to `SKILL.md`, `references/`, `assets/` and `scripts/`.

#### Speaker notes

1. **What a skill is made of** — a skill is a folder with a required `SKILL.md` (a name and a description, then the instructions) and optional `scripts/`, `references/` and `assets/` folders [1]. ChatGPT describes the same three parts in its own words: a name and description, workflow steps and supporting materials [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
2. **Names differ by app** — Claude, ChatGPT and Codex say "Skills", GitHub Copilot says "agent skills", and the Gemini app is replacing Gems with skills on 17 December 2026 [3]. Whether the Gemini app's skills are `SKILL.md` folders is not stated in the pages read; it is verified for Gemini CLI only [4].
   - sources: [3] Google, About the transition from Gems to skills (Gemini Apps Help) — https://support.google.com/gemini/answer/18560919?hl=en
   - sources: [4] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md

#### Voice script

1. **Name and use-when** — Front of the card: a title and a "use when" line. That is what you see first.
2. **Steps on the back** — The numbered steps on the back. The extras in the sleeve: guide, label, preset.
3. **For developers** — Coding-agent view: the card beside its folder, each part mapped to a file.

### Three levels of loading {#three-levels-of-loading}

#### Visual

master: vertical-stepper · motion: local

Caption: "The AI reads only the index until a task needs more." The manual shown in three steps, each with a plain factual label: "Always loaded: every skill's name and description", "Loaded when the skill is used: its main instructions", "Loaded only if needed: references, templates and scripts". Under the third, a note that a script can run without its code entering the conversation, as Claude documents it. A soft light moves across the three steps in loading order. Invocation is not a level; it is the later Slide on two ways to call a skill.

#### Speaker notes

1. **Three levels, stated by the standard** — the Agent Skills standard names metadata (name and description, about 100 tokens) loaded at startup for all skills, the `SKILL.md` body when the skill is activated, and files in `scripts/`, `references/` or `assets/` only when required [1]. Anthropic states the same three levels [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
2. **Other apps load in stages too** — Codex lists name, description and file path first and reads the full instructions when it decides to use a skill [3]; Gemini CLI documents metadata first, body on activation [4]. For apps whose pages were not read, the three-level claim is inferred from the shared format.
   - sources: [3] OpenAI, Build skills (Codex docs) — https://learn.chatgpt.com/docs/build-skills
   - sources: [4] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
3. **Scripts: documented for Claude only** — Claude runs scripts through bash and "only their output enters context" [5]. The other vendors' pages read say bundled scripts exist but do not say what that does to context, so keep this claim to Claude.
   - sources: [5] Anthropic, Agent Skills (Claude Platform docs) — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview

#### Voice script

1. **Step one** — Point at the first step of the manual. Say "level one" and read its label aloud.
2. **Step two** — Move to the second step. The light moves with you.
3. **Step three** — The last step. Mention the script note under it, then say the precise claims sit in the notes.

### Skills are dynamic context {#skills-are-dynamic-context}

#### Visual

master: grid-2x1 · motion: local

Caption: "What's always loaded is static; a skill loads on demand, so it is dynamic." The context window Explorable with a Preset in the scene's words. Static, always there: your standing orders, the expedition brief and the manual's index. Dynamic, filling during the dive: the pulled card, camera frames, sonar readings and sample logs. Plain labels beside each: personal instructions, project instructions, skill index, skill body, tool results. The dynamic part fills as the dive goes on. A skill is dynamic whether you call it at the start or the pilot picks it mid-task.

#### Speaker notes

1. **Static and dynamic, as Google defines them** — static context is always loaded: system instructions, rule files (AGENTS.md, CLAUDE.md, GEMINI.md), global memory and persona definitions; dynamic context is loaded on demand: skill instructions triggered by task matching, tool results, retrieved documents and windowed session history [1].
   - sources: [1] Osmani, Saboo and Kartakis, The New SDLC With Vibe Coding (Google whitepaper, PDF copy) — https://rocketedge.com/wp-content/uploads/2026/06/Day_1_v3.pdf
2. **"Static" is a rule of thumb** — instructions are not strictly static. Claude Code `.claude/rules/` files with `paths` load only when matching files open [2], Gemini CLI loads further `GEMINI.md` files just in time when a tool touches a directory [3], and Copilot path-specific instructions apply by file match [4]. By default, a skill's name and description are always loaded too, unless the skill is set to user-only invocation [5].
   - sources: [2] Anthropic, How Claude remembers your project (Claude Code docs) — https://code.claude.com/docs/en/memory
   - sources: [3] Google, Provide context with GEMINI.md files (Gemini CLI docs) — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/gemini-md.md
   - sources: [4] GitHub, Adding repository custom instructions for GitHub Copilot — https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
   - sources: [5] Anthropic, Extend Claude with skills (Claude Code docs) — https://code.claude.com/docs/en/skills

#### Voice script

1. **Back to the window** — Callback to the context window Explorable. The same window, now in the dive's words.
2. **The standing part** — Point at the standing orders, the expedition brief and the manual's index in the scene.
3. **Filling as you dive** — The pulled card, camera frames, sonar readings, sample logs. Point to the note for the exceptions.

### Instructions, skills and connectors {#instructions-skills-and-connectors}

#### Visual

master: three-column · motion: none

Caption: "Instructions are always loaded, skills load on demand, and connectors reach into other systems." Four things in the control room, each with its plain label and a small static or dynamic tag linking back to the Slide on dynamic context: your standing orders in your notebook (personal instructions, they travel to any ship), the expedition brief on the wall (project instructions), the manual at the console (skills), and the cable to the sonar and the lab database (a connector). Coding-agent view: `~/.claude/CLAUDE.md`, `AGENTS.md`, `SKILL.md` and an MCP server. If the connector reads as too much in the render, the Slide falls back to three things.

#### Speaker notes

1. **Instructions are always loaded, skills are not** — Claude Code reads CLAUDE.md "at the start of every session" and loads a skill "on demand" [1]. Codex, Gemini CLI and GitHub Copilot document the same split for their instruction files and skills [2].
   - sources: [1] Anthropic, Extend Claude Code (Claude Code docs) — https://code.claude.com/docs/en/features-overview
   - sources: [2] GitHub, Adding agent skills for GitHub Copilot CLI — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
2. **Names in chat apps** — Claude calls them Instructions, project instructions and Connectors [3]; ChatGPT now says "apps (formerly connectors)" [4]; the Gemini app says "Instructions for Gemini" and "Connected Apps" [5].
   - sources: [3] Anthropic, Understanding Claude's personalization features (Help Center) — https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features
   - sources: [4] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
   - sources: [5] Google, Manage your tasks and workflows in Gemini Apps (Help) — https://support.google.com/gemini/answer/17094507?hl=en
3. **Connectors reach, skills know how** — connectors are Model Context Protocol (MCP) servers that add tools and data, not guidance [6]. Anthropic describes MCP as the connection and a skill as the knowledge of how to use it [7].
   - sources: [6] GitHub, About Model Context Protocol (MCP) (Copilot docs) — https://docs.github.com/en/copilot/concepts/context/mcp
   - sources: [7] Anthropic, Extend Claude Code (Claude Code docs) — https://code.claude.com/docs/en/features-overview

#### Voice script

1. **Four things in the room** — Notebook, wall, manual, cable. Same room, four jobs.
2. **Read the tags** — Touch each small tag in turn: notebook, wall, manual, cable. Link back to the Slide on dynamic context.
3. **Your words may differ** — Your app may use other names for these. Developers: the files from the coding-agent view.

### Two ways to call a skill {#two-ways-to-call-a-skill}

#### Visual

master: grid-1x2 · motion: local

Caption: "You call a skill by name, or the AI picks it from its description." The control room split in two. Left: you name the card, "Sediment sample, please." Right: the pilot scans the index and pulls the card when the dive needs it. Under the right half: "In Vercel's test of one Next.js docs skill, the agent never opened it in 56% of cases." Coding-agent view: on the left a typed command, `/name` in Claude Code and Copilot CLI, `$name` in Codex, `@name` in ChatGPT; on the right a description match. A highlight lands on one index line.

#### Speaker notes

1. **Calling by name differs by app** — Claude Code runs `/skill-name` at the start of a message [1]; Codex uses `$` or `/skills` [2]; ChatGPT and the Gemini app use `@` [3]; Copilot CLI uses a slash before the name [4]. "Slash command" is Claude Code and Copilot CLI wording; "by name" holds for all.
   - sources: [1] Anthropic, Extend Claude with skills (Claude Code docs) — https://code.claude.com/docs/en/skills
   - sources: [2] OpenAI, Build skills (Codex docs) — https://learn.chatgpt.com/docs/build-skills
   - sources: [3] OpenAI Academy, Skills — https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills
   - sources: [4] GitHub, Adding agent skills for GitHub Copilot CLI — https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills
2. **Picking by description** — otherwise the model matches the task to the description. Gemini CLI adds a step: the model asks to activate a skill and the user consents before it is injected [5].
   - sources: [5] Google, Agent Skills in Gemini CLI — https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md
3. **What the 56% measures** — "In 56% of eval cases, the skill was never invoked": the documentation skill in Vercel's default configuration for Next.js 16 APIs, not all skills in general [6]. Explicit instructions to use it raised invocation to 95% or more, and the pass rate from 53% to 79% [6]. One vendor's eval, no named model, no replication, so treat it as an illustration.
   - sources: [6] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals

#### Voice script

1. **By name** — You say the card's name. It comes out. No guessing.
2. **By description** — He scans the index and decides. His only cue is the label you wrote.
3. **Unused is real** — Point at the line under the picture and read the Vercel number aloud. Say it is one vendor's test.

## When to write one {#when-to-write-one}

#### Voice script

1. **Sunlight** — Down one level. The Sunlit zone: when a task deserves a card, and how to label it.
2. **Borrowed principles** — "What works for people also works for AI." Say it as a strong rule of thumb, not a law. From here the principles come from engineering, information architecture and UX.
3. **Why a rule of thumb** — The model acts only on what it is given, like a newcomer. It also breaks in places: next Slide.

### The third time is the signal {#the-third-time-is-the-signal}

#### Visual

master: grid-1x3 · motion: local

Caption: "The third time, and you know what a good result looks like, is the signal." A callback to the first Slide's comic, in three panels: explaining the sediment sample, refining it, then writing the card. The first Slide's empty card fills with steps. A small callout at the end: "Did you know? This matches the rule of three from Fowler's Refactoring", a software engineering rule against generalising too early.

#### Speaker notes

1. **Fowler's wording of the rule of three** — "The first time you do something, you just do it. The second time you do something similar, you wince at the duplication, but you do the duplication thing anyway. The third time you do something similar, you refactor." [1] It is a heuristic, not a measured result. The credit to Don Roberts is in the 1999 book, which the research could not read.
   - sources: [1] Fowler, Refactoring: Improving the Design of Existing Code (1997 slides) — https://pdfs.semanticscholar.org/2f09/a866bc7cb521227dc5ab2c4092096077c1ac.pdf
2. **Why treating the model like a newcomer works** — Anthropic tells the writer to think of Claude as "a brilliant but new employee who lacks context on your norms and workflows", and to show a prompt to a colleague with minimal context [2]. Anthropic Engineering calls building a skill "like putting together an onboarding guide for a new hire" [3].
   - sources: [2] Anthropic, Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
   - sources: [3] Anthropic Engineering, Equipping agents for the real world with Agent Skills — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
3. **Where the rule of thumb breaks** — each is backed by a source, but listing them as the breaks is a synthesis: sessions start fresh, so only written files carry over [4]; rules in a file are "context, not enforced configuration" [4]; newer models read instructions more literally [5]; the same words read differently by model [5]; assistants drift toward agreeing with the user [6].
   - sources: [4] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory
   - sources: [5] OpenAI, GPT-4.1 Prompting Guide — https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
   - sources: [6] Sharma et al., Towards Understanding Sycophancy in Language Models — https://arxiv.org/abs/2310.13548

#### Voice script

1. **Three tries** — First you learn what is needed. Second you refine. Third you know what good looks like. Say it as what you do in practice.
2. **Not only repetition** — You also need to be able to check the result, or you are copying a habit.
3. **Did you know** — Point at the small callout and name Fowler's rule of three. Keep it light; the exact wording is in the note.

### Not every repeat deserves a card {#not-every-repeat-deserves-a-card}

#### Visual

master: grid-1x2 · motion: local

Caption: "A card written too early locks in a procedure nobody has proven." A manual stuffed with thin cards, several stamped "never tested". Beside it, a three-question check: does it repeat, does it have rules, does a mistake cost something? A small callout names YAGNI and Knuth on premature optimisation. The index grows line by line until it runs off the page, the one entry you need buried in the middle.

#### Speaker notes

1. **Knuth on premature optimisation** — "We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%" [1]. His reason is a cost, and the same paper calls ignoring efficiency in the small "an overreaction", so it is a rule about timing and measurement. The quotes were not checked against the original (the ACM page returned 403).
   - sources: [1] Knuth, Structured Programming with go to Statements — https://dl.acm.org/doi/10.1145/356635.356640
2. **YAGNI, and what it does not cover** — "Always implement things when you actually need them, never when you just foresee that you need them" [2]. Fowler counts four costs of a presumptive feature (build, delay, carry, repair) and says YAGNI does not apply to effort to make software easier to modify [3].
   - sources: [2] Jeffries, You're NOT gonna need it! — https://ronjeffries.com/xprog/articles/practices/pracnotneed/
   - sources: [3] Fowler, Yagni — https://martinfowler.com/bliki/Yagni.html

#### Voice script

1. **Too early** — A card written before the procedure is proven freezes a guess.
2. **A thin card has a price** — Every quick card is one more entry to keep right, and one more line in the index.
3. **Three questions** — Does it repeat. Does it have rules. Does a mistake cost something. This check is mine, a practical filter.

### Write it from a good run {#write-it-from-a-good-run}

#### Visual

master: grid-1x2 · motion: local

Caption: "Turn a run that worked into a skill: from your own notes, or by asking the AI to write it up." Two paths into one card. Left: your logbook pages from earlier dives. Right: today's dive went well, so before evening the pilot interviews you about it (why that depth, why that order, what would have counted as failure), then writes the card while he still knows. A callout: "Asking the AI to interview you works here too." Coding-agent view: asking the agent to turn this conversation into a skill. Both sources fold into one card.

#### Speaker notes

1. **Start from a real run** — the standard advises: "Complete a real task in conversation with an agent, providing context, corrections, and preferences along the way. Then extract the reusable pattern into a skill." A skill an LLM writes from general knowledge alone yields "vague, generic procedures" [1].
   - sources: [1] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
2. **The agent can interview you** — Anthropic's skill-creator checks the current conversation for a workflow the user wants to capture, extracts answers from it first, then interviews the user to fill gaps [2].
   - sources: [2] Anthropic, skill-creator SKILL.md — https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md

#### Voice script

1. **Two starting points** — Your own notes, or a run that just went well.
2. **Capture the why** — Ask for the interview: why that depth, why that order, what failure looked like. Intent, not only steps.
3. **While he still knows** — Write the card the same evening. Tomorrow he will not remember.

## The label {#the-label}

#### Voice script

1. **The label decides** — Still in sunlight. A card nobody picks helps nobody, so the label matters most.
2. **Name, description** — Two lines: the name and the description. That is all the index shows.

### The index is all the AI sees {#the-index-is-all-the-ai-sees}

#### Visual

master: grid-1x2 · motion: local

Caption: "At the start the AI sees only each skill's name and description, so the label must promise what's inside." The manual from the pilot's view: the index readable, every card behind it closed and greyed out. Two entries side by side: a vague "Samples" and a clear "Take a sediment sample at a new site". A small callout names information scent, from Xerox PARC research. Coding-agent view: the name and description lines of a `SKILL.md`. The clear entry lights up as the dive's task appears.

#### Speaker notes

1. **Description carries the whole burden** — because only name and description load at startup, "the description carries the entire burden of triggering. If the description doesn't convey when the skill is useful, the agent won't know to reach for it" [1].
   - sources: [1] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
2. **Information scent** — Pirolli and Card's abstract names "information scent models, which address the identification of information value from proximal cues" [2]. It is a finding about people foraging for information; that a vague label gives a model less to go on is an inference, not their finding. The page-646 definition was read second-hand.
   - sources: [2] Pirolli and Card, Information Foraging (Psychological Review, 1999) — https://doi.org/10.1037/0033-295X.106.4.643

#### Voice script

1. **The pilot's view** — Show the manual from his seat: the index open, the cards behind it greyed out.
2. **Two entries** — Point at "Samples", then at "Take a sediment sample at a new site". Let the viewer judge.
3. **Scent** — Researchers call this information scent. Name it, then hand it back to the label on screen.

### Name the moment, not the content {#name-the-moment-not-the-content}

#### Visual

master: grid-1x2 · motion: local

Caption: "Describe when to use a skill, in the words someone would actually say." Two index lines for the same card. The content label: "Sediment sampling procedure, steps 1 to 9". The moment label, in two halves: "Use when we reach a new site and need a sample from the seabed." and a closing "Not for water samples or filming." Above them, your request on the day: "Grab some mud here before we move on." Only the moment label matches it. A line is drawn from your request to the moment label.

#### Speaker notes

1. **What and when** — the standard says a description "Should describe both what the skill does and when to use it" and include keywords that help agents identify relevant tasks [1]. Anthropic adds specific triggers and contexts, because Claude chooses among potentially 100+ skills by it [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
2. **Write in the user's words** — "Use imperative phrasing", "Focus on user intent, not implementation", and "Err on the side of being pushy. Explicitly list contexts where the skill applies" [3].
   - sources: [3] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
3. **The "not for" half is not in the sources** — none of the sources read recommends a "not for" clause in a description. Over-triggering is handled by testing near-miss queries that share keywords but need something different, which "test whether the description is precise, not just broad" [4]. Writing the line is an author's reading of that advice.
   - sources: [4] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions

#### Voice script

1. **Two labels** — Point at the content label, then at the moment label. Read both aloud.
2. **Your request** — "Grab some mud here before we move on." Only one label matches that.
3. **A habit of mine** — Show the closing "Not for" line and say it is your habit.

### More cards, harder choice {#more-cards-harder-choice}

#### Visual

master: grid-1x2 · motion: local

Caption: "The more skills look alike, the less often the right one gets picked." An index crowded with near-twins ("Sample", "Take sample", "Seabed sample v2") and a question mark over the console. The expedition brief on the wall carries a short list: "On this expedition, use these three cards." One callout names Hick's law as a finding about people; another gives Vercel's test, where a short index in `AGENTS.md` beat skills left to be found. The twins fade back and one line on the wall list lights up.

#### Speaker notes

1. **Hick and Hyman: a finding about people** — Hick applied information theory to choice-reaction-time experiments with up to ten alternatives [1]. Hyman reports that reaction time rises linearly with the amount of information in the choice [2]. That a longer list makes an AI choose worse is an inference, not a measured result.
   - sources: [1] Hick, On the Rate of Gain of Information (Quarterly Journal of Experimental Psychology, 1952) — https://doi.org/10.1080/17470215208416600
   - sources: [2] Hyman, Stimulus Information as a Determinant of Reaction Time (Journal of Experimental Psychology, 1953) — https://doi.org/10.1037/h0056940
2. **The Vercel index** — a compressed docs index of about 8KB in `AGENTS.md` reached a 100% pass rate against 53% for the skill by default. Vercel's working theory: no decision point, and skills load only when invoked [3]. It is a docs index for one framework, not a procedure.
   - sources: [3] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
3. **Too broad, too narrow** — the standard warns that skills "scoped too broadly become hard to activate precisely", while too narrow forces several to load [4]. No source measures lookalike skills lowering the pick rate directly.
   - sources: [4] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices

#### Voice script

1. **Near-twins** — Three cards that sound alike, and a pilot who has to guess.
2. **A short list on the wall** — Put the few cards that matter into the expedition brief. The wall is always in view.
3. **Hick's law** — Name the law on the callout, keep it short, and return to the wall list.

## What goes inside {#what-goes-inside}

#### Voice script

1. **Twilight** — Deeper: the card is written and labelled. Now what goes on it and what does not.
2. **A decision, not a law** — Keeping procedure apart from project details is a design decision with trade-offs, never a rule.

### What goes where is information architecture {#what-goes-where-is-information-architecture}

#### Visual

master: grid-1x2 · motion: local

Caption: "Where you put each piece of knowledge decides how well, how widely and how cheaply a skill works." One piece of knowledge, today's site depth, with two possible homes and their plain costs: inside the card, "always there, fits one site"; on the expedition brief, "fits every site, has to be looked up". The depth note moves from the card to the wall. A small callout: information architecture, the craft of organising information so it can be found.

#### Speaker notes

1. **Information architecture, in its authors' words** — "a design discipline that is focused on making information findable and understandable" [1]; one of their four definitions is "The structural design of shared information environments" [2]. "The craft of organising information so it can be found" is a paraphrase, not their wording.
   - sources: [1] Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., Part I introduction — https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html
   - sources: [2] Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., ch. 2 — https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html
2. **Every line is a recurring cost** — once loaded, a skill's content "stays in context across turns, so every line is a recurring token cost" [3], and every token "competes for the agent's attention" [4].
   - sources: [3] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [4] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices

#### Voice script

1. **A home for each fact** — Every piece of knowledge needs a home. Choosing it is information architecture.
2. **Three costs** — Performance: will it be read. Reusability: how many sites it fits. Token cost: what loading it takes.
3. **Two homes** — Inside: always there, one site. On the wall: every site, but looked up.

### One card, one job {#one-card-one-job}

#### Visual

master: grid-1x2 · motion: local

Caption: "A good skill does one job and isn't tied to any one project." Two halves. Left: an overstuffed card, "Sample, film, log and clean up". Right: a sampling card with "descend to 40 m" scribbled in for site 4; at the next site the seabed lies at 120 m and the robot hangs uselessly at 40. A callout names cohesion and coupling. The robot stops short, far above the seabed.

#### Speaker notes

1. **Coupling and cohesion, as first written** — "The fewer and simpler the connections between modules, the easier it is to understand each module without reference to other modules"; "Binding is the measure of the cohesiveness of a module", with functional binding the strongest [1].
   - sources: [1] Stevens, Myers and Constantine, Structured design — https://doi.org/10.1147/sj.132.0115
2. **A coherent unit of work** — the standard says a skill should "encapsulate a coherent unit of work that composes well with other skills"; too narrow forces several to load, too broad is hard to activate precisely [2]. The "if you can't describe it in one sentence, it is two skills" test appears in none of the pages read; do not attribute it to the standard.
   - sources: [2] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
3. **Hard-coded details can override the task** — in a benchmark of 98 public skills, a generic workflow template made the agent write files to `.github/workflows/` when the task required `ci/`; the authors advise abstract guidance over templates with hard-coded paths [3]. It is one worked example, not a test of this picture.
   - sources: [3] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401

#### Voice script

1. **Overstuffed** — One card that samples, films, logs and cleans up. Which job is it?
2. **Scribbled in** — "Descend to 40 metres" is true at site 4. At site 7 the robot hangs in the water.
3. **Cohesion and coupling** — Point at the callout and name the two words. Return to the robot hanging at 40 m.

### Inside the card {#inside-the-card}

#### Visual

master: three-column · motion: local

Caption: "Domain knowledge can live inside a skill, kept apart from the steps until a step needs it." The card in its sleeve, each extra tied to the step that uses it: step 3, "lower the arm", points to the arm preset, which runs a fixed motion; step 4, "identify what you collected", points to the species guide, which opens on its own contents page; step 6, "label the sample", points to the label template. Two notes: when the steps get long, the next paragraph belongs in the sleeve; long extras start with a contents list, because the AI may only skim the start. Coding-agent view: `SKILL.md` linking one level deep into `references/`, `assets/` and `scripts/`. Step 4 lights up and the species guide slides out.

#### Speaker notes

1. **Move detail into files, and say when to read them** — "Keep your main SKILL.md under 500 lines. Move detailed reference material to separate files" [1]. The key is telling the agent when to load each file, for example "Read references/api-errors.md if the API returns a non-200 status code" [2].
   - sources: [1] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [2] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
2. **Contents list for long files** — "For reference files longer than 100 lines, include a table of contents at the top. This ensures Claude can see the full scope of available information even when previewing with partial reads" [3]. This is Anthropic's account of Claude's behaviour and no source measures its effect.
   - sources: [3] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
3. **One level deep** — Claude "might partially read files when they're referenced from other referenced files", using commands such as `head -100`, so references stay one level deep from `SKILL.md` [4]. The standard states the rule without the reason [5].
   - sources: [4] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
   - sources: [5] Agent Skills, Specification — https://agentskills.io/specification

#### Voice script

1. **Extras by step** — Each extra belongs to the step that uses it.
2. **The long step** — Point at the step that has grown long and watch its next paragraph slip into the sleeve.
3. **Contents first** — Open the species guide to its contents page and show it to the viewer.

## What stays beside {#what-stays-beside}

#### Voice script

1. **Beside, not inside** — The other home: details that stay outside the card, in files it reads when it runs.
2. **Where it gets shared** — Who uses a card decides how much care it needs. That sets up the next Section.

### Beside the card {#beside-the-card}

#### Visual

master: grid-1x2 · motion: local

Caption: "Project details can stay beside the skill, in files it reads when it runs." The previous mistake, fixed. The card now says "descend to the depth in today's dive plan", and a line runs from that step to the expedition brief on the wall: "Site 4: 40 m. Site 7: 120 m." Coding-agent view: the step pointing to a project file such as `CONTEXT.md`. This time the robot reaches the seabed at 120 m.

#### Speaker notes

1. **Teach the class of problem, read the instance** — a skill "should teach the agent how to approach a class of problems, not what to produce for a specific instance"; the example reads the schema from `references/schema.yaml` instead of writing joins into the skill [1]. Claude Code offers `${CLAUDE_PROJECT_DIR}` so a skill can reference project files independent of where it is installed [2].
   - sources: [1] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices
   - sources: [2] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills

#### Voice script

1. **The card points** — The card says "the depth in today's dive plan". The plan lives on the wall.
2. **Same card, any site** — Replay site 7: this time the robot reaches the seabed at 120 m.
3. **For developers** — A project file such as `CONTEXT.md`, read when the step runs.

### Who uses it, and where {#who-uses-it-and-where}

#### Visual

master: grid-2x2 · motion: local

Caption: "Who uses a skill, and where, decides what goes inside it and how much care it needs." A simple 2x2, readable at rest and labelled "rule of thumb". Axes in organisational words: personal or shared, and general use or project-specific, with a small expedition picture in each square. Personal and project-specific: details written straight in, no upkeep. Personal and general: details kept beside, your own toolkit. Shared and project-specific: details can live in its extras, owned by the project team. Shared and general: details beside, with an owner, a version and evals. One card moves from your notebook to the fleet manual, losing its scribbled details and gaining an owner tag.

#### Speaker notes

1. **Where a skill is stored encodes who gets it** — Claude Code skills in the home directory load "in every project", skills committed to a repository reach "everyone who works there", and plugins or managed settings reach "a whole team" [1]. Codex splits repository folders from user folders the same way [2].
   - sources: [1] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [2] OpenAI, Build skills (Codex documentation) — https://learn.chatgpt.com/docs/build-skills
2. **The matrix itself is an inference** — no published framework combines the two axes into a 2x2 with care levels; the nearest are one-axis tier schemes [3]. Microsoft's zoned governance ties care to audience for agents, not skills: private personal agents, approved environments and admin approval for shared ones [4]. Label the square a rule of thumb.
   - sources: [3] Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution — https://arxiv.org/abs/2604.16911
   - sources: [4] Microsoft, Implement a zoned governance strategy (Copilot Studio) — https://learn.microsoft.com/en-us/microsoft-copilot-studio/guidance/sec-gov-phase2
3. **Why evals matter once shared** — 40 of 98 skills change sign between two harnesses running the same model, so a skill is best evaluated "with the model, agent, and repositories in which it will be deployed" [5].
   - sources: [5] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401

#### Voice script

1. **Two questions** — Who uses it: just you, or others. Where: any project, or one.
2. **Four squares** — Details written in, kept beside, held in extras, or beside with an owner. Walk the squares once.
3. **A rule of thumb** — Read the "rule of thumb" label on the square aloud, as your own.

### How grill-me and grill-with-docs work {#how-grill-me-and-grill-with-docs-work}

#### Visual

master: three-column · motion: local

Caption: "The interview stays the same; what it learns about your project is written beside it for the next run." The only Slide outside the control room, a showcase on the real files. Three parts, left to right: the real `SKILL.md` of grill-me with the interview steps highlighted as the procedure; grill-with-docs, which uses grill-me and adds domain modelling; and the files it writes beside itself, `GLOSSARY.md` and decision records, with an arrow back to the next run reading them. A small key in the corner maps them to the card and the expedition brief. A closing line: a skill can also run other skills, with no settled name for it yet. `GLOSSARY.md` gains a new term after a session.

#### Speaker notes

1. **Written beside, read next run** — Anthropic says models, like people who use "file systems, inboxes, and bookmarks", do well with notes kept outside the context window [1], and a skill should teach an approach while reading instance details from files [2]. The grill-me and grill-with-docs files are this repository's own, not a research source.
   - sources: [1] Anthropic Engineering, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
   - sources: [2] Agent Skills, Best practices for skill creators — https://agentskills.io/skill-creation/best-practices

#### Voice script

1. **The interview is the card** — Grill-me: the interview steps are the procedure. It stays the same every time.
2. **Follow the arrow** — Point at `GLOSSARY.md` and the decision records, then trace the arrow back to the next run.
3. **Skills can run skills** — One closing line: a skill can run other skills. No settled name for it yet. Do not expand.

## Sharing it {#sharing-it}

#### Voice script

1. **Midnight** — Deep water. Everything so far was for you. What changes when a colleague reads your card.
2. **Three jobs** — Give it an owner and a version. Decide who looks after the fleet manual. Test that it helps.

### Shared skills are knowledge articles {#shared-skills-are-knowledge-articles}

#### Visual

master: grid-1x2 · motion: local

Caption: "A shared skill needs what any company knowledge article needs: an owner, a version and a review date." Two copies of the same card. Left: your notebook card, with no header. Right: the same card in the institute's fleet manual, with a control block: owner, version 1.3, next review in March. A small note: personal skills skip this until you share them. The control block is stamped on as the card moves into the fleet manual.

#### Speaker notes

1. **The registry entry** — Anthropic's enterprise guidance says to keep a registry entry per skill with purpose, owner ("Team or individual responsible for maintenance"), version, dependencies and evaluation status including the last evaluation date [1].
   - sources: [1] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
2. **The review date is an adaptation** — Knowledge-Centered Service does not review on a schedule: "Let reuse of Not Validated articles be the review" [2], and the page does not use the word "owner". Owner, version and a calendar review date combine KCS and Anthropic's guidance; no source defines them as a rule for skills.
   - sources: [2] Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State — https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030
3. **The open format has no such fields** — the Agent Skills format has no owner, version or review-date field; its optional `metadata` map holds them by convention [3]. Anthropic also says "Skill authors should not be their own reviewers" [4].
   - sources: [3] Agent Skills, Specification — https://agentskills.io/specification
   - sources: [4] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Your notebook** — A card with no header is fine while it is only yours.
2. **Into the fleet manual** — Once others rely on it, it needs what a company knowledge article has: an owner, a version, a review date.
3. **Why** — One author's edit now changes what everyone's pilot does.

### Who owns the fleet manual {#who-owns-the-fleet-manual}

#### Visual

master: grid-2x2 · motion: local

Caption: "Shared, general skills need rules for who adds, checks and removes them, and most organisations are still working those out." The earlier matrix returns and the view zooms into the shared, general square. Inside it, the fleet manual's front page lists what a card needs beyond the control block: who may add one, its tier (fleet, ship or expedition), its token cost, which robots it works with, and a retirement date. One corner stays dark and unlabelled, for the questions nobody has settled yet.

#### Speaker notes

1. **Vendors tier by audience** — Anthropic's tiers in claude.ai: personal skills, skills shared with individuals, group skills bundled in a plugin, and organisation-wide skills that only owners can add or remove [1]. "Fleet, ship, expedition" are the Episode's words, not vendor terms; vendors tier by audience and risk, not by how general the content is.
   - sources: [1] Anthropic, Provision and manage skills for your organization — https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization
2. **Who adds, checks and removes** — the org library offers "Requires review", "Open" and "Off", a reviewer approves "a fixed version" and users stay on it until a new one is approved [2]. Anthropic says to pin production skills to a version and to deprecate skills whose evaluations consistently fail or whose workflow is retired [3].
   - sources: [2] Anthropic, Provision and manage skills for your organization — https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization
   - sources: [3] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
3. **Token cost and fit are per-card facts** — a loaded skill is a recurring token cost [4], and a skill's value depends on the model and harness it runs in [5].
   - sources: [4] Anthropic, Extend Claude with skills (Claude Code documentation) — https://code.claude.com/docs/en/skills
   - sources: [5] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401
4. **"Still working it out" is a judgement** — Anthropic's enterprise guidance lists what to track per skill (purpose, owner, version, evaluation status) and does not report how many organisations do so [6], so the unsettled corner is the Episode's judgement, not a measured claim.
   - sources: [6] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Back to the square** — Shared and general. Zoom in.
2. **What the front page needs** — Who may add. Which tier. Token cost. Which robots. When it retires.
3. **The dark corner** — Point at the dark corner and say plainly what you do not know.

### Does the card make things better? {#does-the-card-make-things-better}

#### Visual

master: grid-1x2 · motion: local

Caption: "Test a skill by running the same task with and without it, because a bad skill can do worse than none." Two test dives side by side in shallow water, the same task each time: on the left the pilot works without the card, on the right with it, each with a scorecard. Below, a small check for the label: a few requests that should pull the card and a few that should not, including near-misses. A callout: "In one benchmark, skills the AI wrote for itself scored below having no skill." The two scores fill in, one after the other.

#### Speaker notes

1. **Below no skill: SkillsBench, not Vercel** — skills written by the agent itself land 8.1 to 11.5 points below the no-skill baseline on all three configurations tested [1]. In Vercel's eval the skill tied the baseline at 53%; only sub-scores dipped (lint 89% against 95%) [2]. Do not attribute "below no skill" to Vercel's headline.
   - sources: [1] Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks — https://arxiv.org/abs/2602.12670
   - sources: [2] Jude Gao (Vercel), AGENTS.md outperforms skills in our agent evals — https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals
2. **Bad skills can hurt, many do nothing** — of 98 public skills, 92 showed no statistically significant effect, and harmful ones lost up to 17.0 points by anchoring the agent on their own templates [3]. Curated skills raised the average pass rate from 33.9% to 50.5% [4].
   - sources: [3] Han et al., SWE-Skills-Bench: Do Agent Skills Actually Help in Real-World Software Engineering? — https://arxiv.org/abs/2603.15401
   - sources: [4] Li et al., SkillsBench: Benchmarking How Well Agent Skills Work Across Diverse Tasks — https://arxiv.org/abs/2602.12670
3. **Test the label too** — the trigger set in the standard is "about 20 queries: 8-10 that should trigger and 8-10 that shouldn't", each run about 3 times [5]. Anthropic's guide says to build scenarios and compare against a no-skill baseline [6]. "Three and three" is not in either.
   - sources: [5] Agent Skills, Optimizing skill descriptions — https://agentskills.io/skill-creation/optimizing-descriptions
   - sources: [6] Anthropic, Skill authoring best practices — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

#### Voice script

1. **Same task twice** — Once without the card, once with it. Compare the scores.
2. **The callout** — Pause on the benchmark callout and let the viewer read it. Do not explain it.
3. **Test the label** — Requests that should pull the card, and ones that should not. Near-misses count most.

## Keeping it alive {#keeping-it-alive}

#### Voice script

1. **The Abyss** — The deepest zone: months later. Writing was quick; keeping it right is the work.
2. **Nobody sees it** — Most people stop at the first run. This part is rarely looked at.

### Every skill is a loan {#every-skill-is-a-loan}

#### Visual

master: vertical-stepper · motion: local

Caption: "Writing a skill is quick; keeping it right costs you something every month." One card with a running tag, like a loan statement, each entry a small cost that piles up: the site list changed, a new robot arm arrived, an index line now overlaps another card. A callout names Ward Cunningham's technical debt. The tag grows one line at a time.

#### Speaker notes

1. **Cunningham's debt, in his words** — "Shipping first time code is like going into debt. A little debt speeds development so long as it is paid back promptly with a rewrite." "Every minute spent on not-quite-right code counts as interest on that debt." [1] He names the failure mode as "the failure to consolidate". The software parallel to skills is an inference, not his claim.
   - sources: [1] Cunningham, The WyCash Portfolio Management System — https://c2.com/doc/oopsla92.html

#### Voice script

1. **Quick to write** — Five minutes to write a card.
2. **A running tab** — The site list changes. A new arm arrives. An index line starts to overlap another card.
3. **Owning thirty** — The cost is not in writing it. It is in owning it.

### The pilot changes, the card doesn't {#the-pilot-changes-the-card-doesn-t}

#### Visual

master: grid-1x2 · motion: local

Caption: "A model update changes who reads your skill, so a card that worked yesterday can behave differently today." A reveal panel: your pilot is not the only one, every pilot has this condition, and pilot schools train them, one school per AI provider. Two panels follow. Update: your pilot returns from his school's new course, same name and same card, but "descend slowly" now gives a different dive. Switch: a pilot from another school reads the same card in their own way. A callout names Lehman's laws, that software in use has to keep changing or it gets worse; here the world around the card moves. The same card goes into two dives that end at different depths.

#### Speaker notes

1. **Lehman's first two laws, and their limits** — "E-type systems must be continually adapted else they become progressively less satisfactory"; complexity increases "unless work is done to maintain or reduce it" [1]. The laws are disputed: only continuing change and continuing growth were validated by all studies reviewed [2], and Linux grew super-linearly [3].
   - sources: [1] Lehman, Ramil and Wernick, Metrics and Laws of Software Evolution: The Nineties View — https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf
   - sources: [2] Herraiz, Rodriguez, Robles and Gonzalez-Barahona, The evolution of the laws of software evolution: a discussion based on a systematic literature review — https://doi.org/10.1145/2543581.2543595
   - sources: [3] Godfrey and Tu, Evolution in Open Source Software: A Case Study — https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf
2. **The same words read differently by model** — Anthropic's guide has model-specific sections on where "a single model behaves differently and what to change in your prompt" [4]; OpenAI notes that prompts optimized for other models "may not immediately work" [5].
   - sources: [4] Anthropic, Prompting best practices — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
   - sources: [5] OpenAI, GPT-4.1 Prompting Guide — https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide
3. **H.M. is an analogy, and it breaks at the card** — H.M. learned mirror drawing and kept it across 3 days while remembering none of the sessions [6], because skills are stored by a memory system outside the damaged region [7]. For a model this maps only as analogy: trained weights fit the skill side, but a skill file is read as text, which makes it closer to a declarative note. That mapping is inference; Milner 1962 was read only through Squire's account.
   - sources: [6] Squire, The Legacy of Patient H.M. for Neuroscience — https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/
   - sources: [7] Squire, Conscious and Unconscious Memory Systems — https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/

#### Voice script

1. **Not the only pilot** — Every pilot has this condition. Pilot schools are the AI providers.
2. **Update and switch** — Walk the two panels in order: the returning pilot, then the pilot from another school.
3. **Hand over the verdict** — Ask which of your cards you would re-check after an update.

### Retire cards {#retire-cards}

#### Visual

master: grid-1x2 · motion: local

Caption: "Remove skills nobody uses, so the right one stays easy to find." The fleet manual's index next to the season's dive log. Cards the log never mentions are greyed out and go into an archive box marked with their retirement date. The index left behind is short again, the one entry you need easy to spot, a callback to the earlier buried entry. The unused cards slide into the archive box and the index closes up.

#### Speaker notes

1. **Archive over delete** — Knowledge-Centered Service prefers archiving to deleting, because deleting can break links and an archived article can be restored [1]. Anthropic says to deprecate a skill whose evaluations consistently fail or whose workflow is retired [2]. Reading the dive log to pick what to archive is the Episode's own method.
   - sources: [1] Consortium for Service Innovation, KCS v6 Practices Guide, Technique 5.2: KCS Article State — https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030
   - sources: [2] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise

#### Voice script

1. **Read the log** — Which cards did the season's dives actually use.
2. **The archive box** — Watch the greyed-out cards slide into the box and point at its date stamp.
3. **Short index again** — The one you need is easy to see again.

### The whole iceberg {#the-whole-iceberg}

#### Visual

master: horizontal-rail · motion: local

Caption: "Write a skill the third time, label it by the moment, and decide where the project details live before you share it." The full depth ruler from the Surface to the Abyss, each Section's takeaway written at its depth. The robot rises on its cable from the seabed to the ship, and on deck the manual lies open with a short index. Each takeaway lights up as the robot passes it.

#### Speaker notes

1. **What is settled, and what is not** — no source defines owner and review date as a rule for skills, and none shows how many organisations govern shared skills at all [1]. The audience-by-scope matrix is a rule of thumb, not a published framework [2].
   - sources: [1] Anthropic, Skills for enterprise — https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise
   - sources: [2] Saha and Hemanth, Skilldex: A Package Manager and Registry for Agent Skill Packages with Hierarchical Scope-Based Distribution — https://arxiv.org/abs/2604.16911

#### Voice script

1. **Three steps** — One: pick a task you have explained three times and turn a good run into a skill. Two: write its description as the moment you would need it. Three: before sharing, decide where the project details live, and give it an owner.
2. **The honest caveat** — Governance, review and retirement are the deep end. Say you are still learning here, and invite the viewer's practice.
3. **Your first card** — Low-key offer: start with the task you explained last week.
