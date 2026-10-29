---
type: brief
title: 'Get workshop-ready: your AI agent on your laptop'
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-29T16:01:06Z
verified:
  - by: process:markdown-harness
    at: 2026-10-29T16:01:06Z
---

# Get workshop-ready: your AI agent on your laptop

## Format

Not an Episode: a new Resource type "guide" at `/guides/<slug>`, built through the Episode pipeline. Not Foundations, Teardown or Short. Eight steps, about 20 minutes for a first-timer. The guide type is recorded by amending the Resources overview design-ADR before write-spec; until then the Run goes on through research.

## Audience

Really, really non-technical people who never even opened a PowerShell, on Mac, Windows or Linux. Tech-adjacent people who already have an AI agent skip ahead via the overview.

## Style

Studio: a general audience meeting AI for the first time: calm, current, no product-demo look.

## Learning goal

The viewer has an AI agent running in their terminal inside the starter folder and has run their first skill, so the workshop can start with a grilling session right off the bat.

## Actionables

1. Install your AI agent (Claude Code preferred; Antigravity, Codex or GitHub Copilot work too).
2. Download and unzip the starter folder.
3. Start the agent inside that folder.
4. Run check-workshop-readiness and approve its command; the hancrafted homepage opens.

## Hook

You've never opened a terminal. By the end of this page you'll have run your first skill in one.

## Red thread

Each step hands the next one a working piece: a terminal, an agent, a folder, a skill — until the homepage opening proves the whole chain.

## Analogy

No analogy: "A step-by-step guide doesn't need one."

## Constraints

- Every step links to the official install resource and gives only the bare minimum of instructions, so it doesn't go stale when the docs update; the help prompt covers the rest.
- Each Slide is one distinct step.
- The OS and AI-agent toolbar (two toggles, synced across the whole page) shows only on Slides whose content differs; the pick is transient, not remembered.
- Every step has a troubleshooting box: the viewer pastes their error, and a prompt wraps it with OS, agent and step, ready to paste into free ChatGPT (reuses the human-in-the-loop prompt component).
- No backend and no frontend check: the proof is the homepage opening.
- Use "AI agent", never "harness" or "coding agent", on screen.

## Slides

### Your terminal

1. **Overview** — opens with the Hook, then what needs to be done, with skip links: "AI agent already installed? Jump to step 5", "Want the technical route? Jump to the last Section." _Visual:_ the route as a short step list. _Research:_ 1
2. **Open your terminal** — find and open Terminal or PowerShell for the first time. _Visual:_ per-OS, via the toolbar. _Research:_ 2, 3

### Your AI agent

3. **Install your AI agent** — link to the official installer, minimum steps. _Visual:_ per OS and agent, via the toolbar.
4. **Log in** — sign in to the agent. _Visual:_ per agent, via the toolbar.

### Your folder

5. **Download and unzip the starter folder** — one link to the zip. _Visual:_ the download, the unzipped folder.
6. **Start the agent inside that folder** — navigate to the folder and launch the agent. _Visual:_ per OS and agent, via the toolbar.

### Your first skill

7. **Run your first skill** — run check-workshop-readiness: it looks up hancrafted in GLOSSARY.md and opens that URL in the default browser; if the command fails, it prints the link. "You just ran a skill. See you at the workshop; meanwhile browse hancrafted." _Visual:_ the permission prompt, then the homepage. _Research:_ 4

### The technical route

8. **Set up the Matt Pocock skills yourself** — short explanation: install Node.js, `npx skills add` the Matt Pocock skills, run his setup skill for a local setup without GitHub, then run check-workshop-readiness; the homepage opens. _Visual:_ the commands.

## Research questions

1. Why do first-timers finish a multi-step setup guide when it shows one step per screen, minimal instructions and visible progress?
2. Why do non-technical people, and even some software engineers, hesitate to open a terminal, up to avoiding it altogether?
3. Why have the attempts to make the terminal approachable for first-timers worked or failed? Examples: Software Carpentry's shell lessons, Warp, Windows Terminal onboarding, Fig.
4. Why does each AI agent ask permission before a skill runs a command?

## Open ideas

- Promote the human-in-the-loop prompt component to shared before the guide uses it (an Explorable can't import another's folder).
- Base zip: the whole Matt Pocock skill set (trim later), check-workshop-readiness, AGENTS.md, CLAUDE.md with `@AGENTS.md`, GLOSSARY.md with a hancrafted entry holding the homepage URL, the local setup output. Hosted in `public/`.
- Workshop-specific zip contents (e.g. the Day 2 vacation-planning folder): separate session.
- Research questions skipped in the grill: the agents' official install and login pages, the skills folder each agent loads, `CLAUDE.md` with `@AGENTS.md` versus a symlink, the zip within Cloudflare Pages' 25 MB limit, opening the default browser on every OS, `npx skills add` matching the zip, and the troubleshooting prompt's context.
- Dropped: screenshot proof, own npx check package (Zscaler and company-laptop blockers), frontend parsing of a ready report, skill count in the readiness skill, TL;DR for technical viewers, fast/technical toggle.
