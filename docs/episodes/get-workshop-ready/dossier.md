---
type: dossier
title: 'Get workshop-ready: your AI agent on your laptop'
status: draft
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-29T16:35:30Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-10-29T16:35:30Z
---

# Get workshop-ready: your AI agent on your laptop {#get-workshop-ready}

## Your terminal {#your-terminal}

#### Voice script

1. **Hook** — You have never opened a terminal. By the end of this page you will have run your first skill in one.
2. **Why this page** — one step per screen, each a working piece that the next one needs, so the workshop starts with a grilling session and no setup.

### Overview {#overview}

#### Visual

master: vertical-stepper · motion: local

title: Eight steps to your first skill

The whole route as a short numbered step list, one line per step, grouped under the five Sections, with the step count shown ("8 steps, about 20 minutes"). The Hook sits above the list: "You've never opened a terminal. By the end of this page you'll have run your first skill in one." Two skip links sit under it: "AI agent already installed? Jump to step 5" and "Want the technical route? Jump to the last Section." Each step opens to a one-line promise of what the viewer has in hand afterwards (a terminal, an AI agent, a folder, a skill). Opening a step moves the line down to it, so the viewer sees how far along the route is. The OS and AI agent toolbars do not show here: the content does not differ. Every later step carries a troubleshooting box where the viewer pastes their error and gets a prompt wrapping it with OS, AI agent and step, ready to paste into free ChatGPT; the overview says so in one line.

#### Speaker notes

1. **Say how many steps** — the W3C advises saying on the first step how many steps follow and on each step how far along the user is, for example "Step 2 of 4" [1].
   - sources: [1] W3C Web Accessibility Initiative, Forms Tutorial: Multi-page Forms — https://www.w3.org/WAI/tutorials/forms/multi-page/
   - target: the step count above the list
2. **A head start finishes more** — car-wash loyalty cards with two pre-stamped stamps out of ten were redeemed by 34% of customers, against 19% for blank cards; the transfer from loyalty cards to a setup guide is an inference [2].
   - sources: [2] Nunes and Drèze, The Endowed Progress Effect: How Artificial Advancement Increases Effort — https://doi.org/10.1086/500480
3. **Minimal still needs a way out** — a minimal manual, centred on real tasks, taught faster than a standard manual in a study of 64 students, but beginners still need error-recovery material, which is why every step has a troubleshooting box [3][4].
   - sources: [3] Lazonder and van der Meij, The minimal manual: is less really more? — https://doi.org/10.1006/imms.1993.1081
   - sources: [4] Kalyuga, Ayres, Chandler and Sweller, The Expertise Reversal Effect — https://doi.org/10.1207/S15326985EP3801_4

#### Voice script

1. **Four pieces, one chain** — terminal, AI agent, folder, skill: each step hands the next one something that works.
2. **Skip what you have** — already installed an AI agent, jump ahead; want the technical route, jump to the end.

### Open your terminal {#open-your-terminal}

#### Visual

master: basic-page · motion: none

The OS toolbar (Mac, Windows, Linux) sits above the step, and the viewer's pick is synced across the whole page and not remembered. Under each pick the step shows one picture and one line: where to find Terminal on a Mac, PowerShell on Windows, the terminal on Linux, and what the window looks like when it is open and waiting. The AI agent toolbar does not show here: this step does not differ by AI agent. A line says a blinking cursor and an empty prompt mean it worked. Below the step sits the troubleshooting box: a text field for the viewer's error and a ready-made prompt for free ChatGPT, wrapped with their OS, the AI agent and "Step 2: Open your terminal".

#### Speaker notes

1. **Hesitation is normal** — computer anxiety is a long-studied, widespread reaction; about 80% of the 89 studies on experience found more experience went with less anxiety, and a relaxed first experience was linked to lower anxiety. No study measures fear of the terminal itself, so applying this to the terminal is an inference [1].
   - sources: [1] Powell, Computer anxiety: Comparison of research from the 1990s and 2000s — https://doi.org/10.1016/j.chb.2013.05.012
2. **Why the command line feels scary** — system administrators said you cannot click your way around a command line to figure it out, and that it may be scary or overwhelming for a beginner; this is a survey quote, not a measured rate of mistakes [2].
   - sources: [2] Voronkov, Martucci and Lindskog, System Administrators Prefer Command Line Interfaces, Don't They? An Exploratory Study of Firewall Interfaces — https://arxiv.org/abs/1905.13582
3. **Setup is the hard part** — Software Carpentry reports that installing software is often harder than using it, and that every new tool fails for at least one person in the room across Mac, Windows and Linux [3].
   - sources: [3] Wilson, Software Carpentry: lessons learned — https://doi.org/10.12688/f1000research.3-62.v2
4. **Feedback builds confidence** — in a university Unix course with near-instant per-answer feedback, 78.2% of 2021 respondents said they had procedural Unix knowledge, against 38.8% before; the authors call this self-report possibly subjective, and the students were not solo first-timers [4].
   - sources: [4] Berry et al., ShellOnYou: learning by doing Unix command line — https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf
   - target: the open-terminal picture

#### Voice script

1. **Not a personal failing** — if opening it feels odd, that is a common reaction, and you have nothing to prove here.
2. **One window, one cursor** — find it for your system, open it, and see the cursor wait for you.
3. **Stuck? Paste it** — the troubleshooting box turns your error into a prompt for ChatGPT.

## Your AI agent {#your-ai-agent}

#### Voice script

1. **Terminal done** — you have a window that waits for words, and next the AI agent goes into it.

### Install your AI agent {#install-your-ai-agent}

#### Visual

master: basic-page · motion: none

Both toolbars show here, because the content differs: the OS toolbar (Mac, Windows, Linux) and the AI agent toolbar (Claude Code preferred, then Antigravity, Codex, GitHub Copilot), both synced across the page. Under the picks the step shows one button, "Open the official install page for <your AI agent>", and one line on what to do there for the viewer's OS. It gives no command or version number; the official page is the source and the step stays short. A line says the preferred pick is Claude Code, and that the other three work too. A last line shows the success state: the agent's start screen or version output in the terminal, and the words "it worked when you see this". The troubleshooting box below wraps the pasted error with the picked OS, AI agent and "Step 3: Install your AI agent".

#### Speaker notes

#### Voice script

1. **Official page only** — the install page of your AI agent knows the current steps better than we could, so we link to it and keep ours short.
2. **Claude Code preferred** — pick yours in the toolbar, and the other three work as well.
3. **It tells you when it worked** — you see the agent's start screen in the terminal, that is the success state shown on the page, then on to logging in.

### Log in {#log-in}

#### Visual

master: basic-page · motion: none

The AI agent toolbar shows here (Claude Code, Antigravity, Codex, GitHub Copilot) and the OS toolbar does not, since login does not differ by OS. Under each pick the step shows one picture of the sign-in screen the AI agent opens and a link to that AI agent's official login page, with one line on what to do: sign in with the account and come back. The troubleshooting box below wraps the pasted error with the OS, the picked AI agent and "Step 4: Log in".

#### Speaker notes

#### Voice script

1. **Sign in once** — the AI agent opens a sign-in, and you use your account.
2. **Your own account** — which account fits which AI agent is on its official page, linked here.

## Your folder {#your-folder}

#### Voice script

1. **Terminal and AI agent, now the place to work** — the AI agent works inside one folder, so we give it one: the starter folder.

### Download and unzip the starter folder {#download-and-unzip-the-starter-folder}

#### Visual

master: grid-1x2 · motion: local

The two halves show the step in order. Left: one download button for the zip, with the file landing in the Downloads folder. Right: the unzipped folder, opened, with its files visible (AGENTS.md, GLOSSARY.md and the skills folder). Hover on one half dims the other. Neither toolbar shows: the step is the same for everyone, and a line says double-clicking the zip unzips it on Mac and Windows. The troubleshooting box below wraps the pasted error with the OS, the AI agent and "Step 5: Download and unzip the starter folder".

#### Speaker notes

#### Voice script

1. **One link, one zip** — download the starter folder, and unzip it by double-clicking.
2. **Where it lives** — note where the folder sits, because the next step goes into it.

### Start the agent inside that folder {#start-the-agent-inside-that-folder}

#### Visual

master: basic-page · motion: none

Both toolbars show here, since the commands and the launch differ by OS and by AI agent. Under the picks the step shows the minimum: go into the unzipped folder in the terminal, then start the picked AI agent, with the terminal window drawn at each point so the viewer sees the folder name in the prompt and the AI agent's first screen. A link goes to the official start page of the picked AI agent. A line says: a trust question about the folder may come up, and answering yes for this folder is expected. The troubleshooting box below wraps the pasted error with the picked OS, AI agent and "Step 6: Start the agent inside that folder".

#### Speaker notes

#### Voice script

1. **Go in, then start** — navigate into the folder, and start your AI agent there.
2. **Same folder every time** — the AI agent reads what is in the folder it starts in, and that is how it will find your skill.
3. **Chain so far** — terminal, AI agent, folder: one piece away from the proof.

## Your first skill {#your-first-skill}

#### Voice script

1. **Everything in place** — a terminal, an AI agent, a folder, and now the piece that proves the chain.

### Run your first skill {#run-your-first-skill}

#### Visual

master: grid-1x2 · motion: local

Two halves in sequence. Left: the AI agent's permission prompt after the viewer types the skill's name, check-workshop-readiness, with one line pointing at the yes option and saying that approving it is the step. Right: the hancrafted homepage open in the viewer's default browser, with the line "You just ran a skill. See you at the workshop; meanwhile browse hancrafted." Hover on one half dims the other. A fallback line says that if the command fails, the skill prints the link to open by hand. The AI agent toolbar shows (the prompt looks different per AI agent) and the OS toolbar does not. There is no check of any kind beyond the homepage opening. The troubleshooting box below wraps the pasted error with the OS, the picked AI agent and "Step 7: Run your first skill".

#### Speaker notes

1. **The prompt is a safeguard, not an error** — a model can be steered by text it reads, such as a web page or a project file, so OWASP recommends requiring a human to approve high-impact actions; each vendor builds that approval into its default mode [1][2][5][6][7][8][9].
   - sources: [1] OWASP, LLM01: Prompt Injection — https://genai.owasp.org/llmrisk/llm01-prompt-injection/
   - sources: [2] OWASP, LLM06:2025 Excessive Agency — https://genai.owasp.org/llmrisk/llm062025-excessive-agency/
   - sources: [5] OpenAI, Codex: Agent approvals and security — https://learn.chatgpt.com/docs/agent-approvals-security
   - sources: [6] Google, Gemini CLI: Policy engine — https://geminicli.com/docs/reference/policy-engine/
   - sources: [7] GitHub, About GitHub Copilot CLI — https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli
   - sources: [8] Google, Antigravity: Permissions — https://antigravity.google/docs/permissions/
   - sources: [9] Anthropic, Claude Code: Configure permissions — https://code.claude.com/docs/en/permissions
   - target: the permission prompt
2. **Claude Code's prompt** — in manual mode, commands outside a built-in read-only set trigger a "Bash command" dialog asking "Do you want to proceed?" with Yes, "Yes, and don't ask again" and No. Prompt names and defaults differ by AI agent and version and change often, so recheck before showing one on screen [3].
   - sources: [3] Anthropic, Claude Code: Configure permissions — https://code.claude.com/docs/en/permissions
3. **Why approvals are kept** — Anthropic says broad file access is risky especially under prompt injection; this is a vendor statement, not an independent study [4].
   - sources: [4] Anthropic, Making Claude Code more secure and autonomous with sandboxing — https://www.anthropic.com/engineering/claude-code-sandboxing

#### Voice script

1. **Type the skill** — run check-workshop-readiness, and the AI agent stops to ask you.
2. **Say yes** — you are the one who decides, and for this skill the answer is yes.
3. **The proof** — the hancrafted homepage opens, and that is the whole check.

## The technical route {#the-technical-route}

#### Voice script

1. **For people who build** — the same result without the starter folder, by installing the pieces yourself.

### Set up the Matt Pocock skills yourself {#set-up-the-matt-pocock-skills-yourself}

#### Visual

master: basic-page · motion: none

The commands as a short numbered list, each line a code block with a one-line reason: install Node.js (linking to the official Node.js download page), add the Matt Pocock skills with `npx skills@latest add mattpocock/skills` (the `skills` CLI; it asks which skills to install, so the line says to include `setup-matt-pocock-skills`), run his setup skill by typing `/setup-matt-pocock-skills` in the AI agent for a local setup without GitHub, then run check-workshop-readiness so the homepage opens. The Spec's designers must resolve one placeholder: how check-workshop-readiness reaches this route, because it ships in the starter folder and not in the Matt Pocock repository; the step shows it as the last command with a note that it comes from the starter folder. A short explanation sits above the list. The OS and AI agent toolbars do not show: this route assumes the viewer already has a working terminal and AI agent. The troubleshooting box below wraps the pasted error with the OS, the AI agent and "Step 8: Set up the Matt Pocock skills yourself".

#### Speaker notes

#### Voice script

1. **Same chain, built by hand** — what the starter folder did for you is four short steps: install Node.js, add the skills, run the setup skill, then the check.
2. **Same proof** — run check-workshop-readiness, and the homepage opens.
