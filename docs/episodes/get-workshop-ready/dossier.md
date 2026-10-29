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
2. **Why this page** — I split this into one step per screen, because a long setup guide feels like a wall and a single step feels like something you can finish. Every step hands you one thing that works and the next step needs it, so when you arrive at the workshop, we can start with a grilling session right away and nobody spends the first hour on setup.

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

1. **Four pieces, one chain** — Here is the whole route in four pieces: a terminal, an AI agent, a folder and a skill. Each piece only works because the one before it works, so when the last one runs, you know the whole chain holds. It takes about twenty minutes, and you can stop after any step and come back.
2. **Skip what you have** — If you already have an AI agent installed, jump straight to step five, because nothing before it changes for you. And if you would rather build the setup yourself than download it, the last Section is for you, so skip to the end.

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

1. **Not a personal failing** — If opening a terminal feels a little odd, that is a common reaction, and I would not read it as a sign that you are bad with computers. I think the fear comes from the blank window that gives you no hint what to press, and that is my hypothesis, not a proven fact. Nothing here asks you to prove anything, we only open the window and look at it.
2. **One window, one cursor** — Pick your system in the toolbar, then find Terminal on a Mac, PowerShell on Windows, or the terminal on Linux, and open it. You will see a mostly empty window with a blinking cursor, and that is exactly what success looks like here. It is not frozen, it is waiting for you.
3. **Stuck? Paste it** — If something looks different on your screen, you do not have to work it out alone. Paste your error into the troubleshooting box under the step, and it wraps your system, your AI agent and the step number into a prompt you can hand to a free ChatGPT. Every step below has one, so asking for help is part of the route.

## Your AI agent {#your-ai-agent}

#### Voice script

1. **Terminal done** — So you now have a window that waits for words. Because an empty window cannot do much on its own, the next piece is the AI agent that will live inside it.

### Install your AI agent {#install-your-ai-agent}

#### Visual

master: basic-page · motion: none

Both toolbars show here, because the content differs: the OS toolbar (Mac, Windows, Linux) and the AI agent toolbar (Claude Code preferred, then Antigravity, Codex, GitHub Copilot), both synced across the page. Under the picks the step shows one button, "Open the official install page for <your AI agent>", and one line on what to do there for the viewer's OS. It gives no command or version number; the official page is the source and the step stays short. A line says the preferred pick is Claude Code, and that the other three work too. A last line shows the success state: the agent's start screen or version output in the terminal, and the words "it worked when you see this". The troubleshooting box below wraps the pasted error with the picked OS, AI agent and "Step 3: Install your AI agent".

#### Speaker notes

#### Voice script

1. **Official page only** — Installing an AI agent changes more often than a guide like this can keep up with, so I do not read steps to you here. We link to the official install page of your AI agent, which always has the current steps, and we only tell you what to look for. You can follow that page line by line and come straight back.
2. **Claude Code preferred** — I prefer Claude Code, and the workshop is built around it. Antigravity, Codex and GitHub Copilot work as well, so pick yours in the toolbar and the page follows your choice. If you have no preference, choose Claude Code and you will see the same screens as I do.
3. **It tells you when it worked** — You know the install worked when your AI agent shows its start screen in the terminal, and the page shows you what that looks like. If you see it, you are done with this step. If you do not, that is what the troubleshooting box is for.

### Log in {#log-in}

#### Visual

master: basic-page · motion: none

The AI agent toolbar shows here (Claude Code, Antigravity, Codex, GitHub Copilot) and the OS toolbar does not, since login does not differ by OS. Under each pick the step shows one picture of the sign-in screen the AI agent opens and a link to that AI agent's official login page, with one line on what to do: sign in with the account and come back. The troubleshooting box below wraps the pasted error with the OS, the picked AI agent and "Step 4: Log in".

#### Speaker notes

#### Voice script

1. **Sign in once** — Now the AI agent needs to know who you are. It opens a sign-in for you the first time, you log in, and you come back to the terminal. You do this once, and it stays.
2. **Your own account** — Which account fits which AI agent differs, and the official page of your AI agent says it better than I could, so the link is right here. Use your own account, not a shared one, so that the AI agent is yours to run.

## Your folder {#your-folder}

#### Voice script

1. **Terminal and AI agent, now the place to work** — You have a terminal and an AI agent, so what is missing is a place to work. An AI agent works inside one folder and reads what is there, so we give it one on purpose: the starter folder.

### Download and unzip the starter folder {#download-and-unzip-the-starter-folder}

#### Visual

master: grid-1x2 · motion: local

The two halves show the step in order. Left: one download button for the zip, with the file landing in the Downloads folder. Right: the unzipped folder, opened, with its files visible (AGENTS.md, GLOSSARY.md and the skills folder). Hover on one half dims the other. Neither toolbar shows: the step is the same for everyone, and a line says double-clicking the zip unzips it on Mac and Windows. The troubleshooting box below wraps the pasted error with the OS, the AI agent and "Step 5: Download and unzip the starter folder".

#### Speaker notes

#### Voice script

1. **One link, one zip** — There is one link to one zip file. Download it, and then unzip it. On a Mac, double-click the zip. On Windows, right-click it and choose Extract All. On Linux, use Extract here in your file manager. Inside you will find the files the workshop needs, already in place, so there is nothing to assemble.
2. **Where it lives** — Take a second to notice where the folder landed, usually in your Downloads. The next step goes into exactly this folder, so if you remember where it is, the rest is easy.

### Start the agent inside that folder {#start-the-agent-inside-that-folder}

#### Visual

master: basic-page · motion: none

Both toolbars show here, since the commands and the launch differ by OS and by AI agent. Under the picks the step shows the minimum: go into the unzipped folder in the terminal, then start the picked AI agent, with the terminal window drawn at each point so the viewer sees the folder name in the prompt and the AI agent's first screen. A link goes to the official start page of the picked AI agent. A line says: a trust question about the folder may come up, and answering yes for this folder is expected. The troubleshooting box below wraps the pasted error with the picked OS, AI agent and "Step 6: Start the agent inside that folder".

#### Speaker notes

#### Voice script

1. **Go in, then start** — In your terminal you first move into the unzipped folder, and only then you start your AI agent. The page draws the terminal at each point, so you can check that the folder name appears in front of your cursor before you start. The AI agent may ask whether you trust this folder. For this one, you do, so say yes.
2. **Same folder every time** — The order matters because an AI agent reads what is in the folder it starts in. That is how it will find your skill in a moment, and if you start it somewhere else, the skill is simply not there. So whenever you work with this starter folder, start the AI agent from inside it.
3. **Chain so far** — Look at what you have. A terminal that waits, an AI agent inside it, and a folder it can read. One piece is left, and it is the one that proves all the others work.

## Your first skill {#your-first-skill}

#### Voice script

1. **Everything in place** — So everything is in place: a terminal, an AI agent and a folder. What is left is a skill, which is a small set of instructions your AI agent can follow, and running it shows that the chain is real.

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

1. **Type the skill** — Type the name of the skill, check-workshop-readiness, and your AI agent reads it. Before it does anything on your computer, it stops and asks you. That pause is not an error, it is the AI agent handing the decision to you.
2. **Say yes** — You are the one who decides here, so look at what it wants to run. For this skill, it opens one web page, and the answer is yes. If you were ever unsure what a command does, you could ask the AI agent to explain it before you approve. Would you rather have a tool that asks, or one that does not?
3. **The proof** — Approve it, and the hancrafted homepage opens in your browser. That is the whole check, and there is nothing more to submit. You just ran a skill, so see you at the workshop, and until then, have a look around hancrafted. If the page does not open, the skill prints the link, and you can open it by hand.

## The technical route {#the-technical-route}

#### Voice script

1. **For people who build** — This last Section is for people who build, and it is optional. If you are comfortable with a terminal, you can get the same result without the starter folder by installing the pieces yourself. Everyone else can stop at the homepage.

### Set up the Matt Pocock skills yourself {#set-up-the-matt-pocock-skills-yourself}

#### Visual

master: basic-page · motion: none

The commands as a short numbered list, each line a code block with a one-line reason: install Node.js (linking to the official Node.js download page), add the Matt Pocock skills with `npx skills@latest add mattpocock/skills` (the `skills` CLI; it asks which skills to install, so the line says to include `setup-matt-pocock-skills`), run his setup skill by typing `/setup-matt-pocock-skills` in the AI agent for a local setup without GitHub, then run check-workshop-readiness so the homepage opens. The Spec's designers must resolve one placeholder: how check-workshop-readiness reaches this route, because it ships in the starter folder and not in the Matt Pocock repository; the step shows it as the last command with a note that it comes from the starter folder. A short explanation sits above the list. The OS and AI agent toolbars do not show: this route assumes the viewer already has a working terminal and AI agent. The troubleshooting box below wraps the pasted error with the OS, the AI agent and "Step 8: Set up the Matt Pocock skills yourself".

#### Speaker notes

#### Voice script

1. **Same chain, built by hand** — What the starter folder did for you comes down to four short steps. You install Node.js from its official page, add the Matt Pocock skills, run his setup skill so everything stays local without a GitHub account, and then run the check. The exact lines are on the page, because I would rather you copy them from there than hear them from me.
2. **Same proof** — The proof is the same as before. You run check-workshop-readiness, and the hancrafted homepage opens. One thing to know: that skill comes with the starter folder, not with the Matt Pocock skills, so the page tells you where to take it from.
