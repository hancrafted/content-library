---
title: "A session-start hook moves the Orchestrator's working directory"
enforcer: "review: Orchestrator commands use absolute paths or `git -C`, quick win; the repo's SessionStart hook (`.claude/settings.json`, matcher `compact`) runs no `cd`, so the move came from a user-level hook outside this repo (not checked further)"
status: proposed
---

# A session-start hook moves the Orchestrator's working directory

## Symptom

A SessionStart hook `cd`s into an unrelated worktree and the Orchestrator's next commands run there.
