---
type: feedback
title: Feedback round 1
generated:
  by: human:han
  at: 2026-10-29T18:37:45Z
round: 1
via: spec
---

# Feedback round 1

- `top` · design — picked: 0a
- `your-terminal--overview` · design — picked: 1b
- `your-terminal--open-your-terminal` · design — picked: 2a
- `your-ai-agent--install-your-ai-agent` · design — picked: 3a
- `your-ai-agent--log-in` · design — picked: 4a
- `your-folder--download-and-unzip-the-starter-folder` · design — picked: 5a
- `your-folder--start-the-agent-inside-that-folder` · design — picked: 6a — this is the step with the highest failure mode. most will not know what cd and path is and it will be difficult to debug if the user cant describe to you an agent where the folder is. on mac you can right click > servies > open in terminal. is that possible for windows too? my assumption is that linux users are mostly power users or programmer and should know this.
- `your-first-skill--run-your-first-skill` · design — picked: 7a
- `the-technical-route--set-up-the-matt-pocock-skills-yourself` · design — picked: 8a — downloading the folder from step 5 will be in conflict as the skills will be already installed. we technicall only need our check skill (is should check that mattpocock skills are installed) and the glossary entry. Also the setup skill from mattpock need to be invoked with some info like 1. use local markdown setup no github 2. single GLOSSARY.md 3. default trackers 4. USE AGENTS.md and CLAUDE.md with @AGENTS.md and the users need to install just the main Matt Pocock Skills, not the skills under "other".
