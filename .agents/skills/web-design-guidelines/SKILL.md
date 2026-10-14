---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read [`command.md`](command.md): the guidelines and the output format.
2. Read the specified files (or ask the user for files/pattern).
3. Check against every rule in `command.md`.
4. Output findings in the terse `file:line` format.

`command.md` is a local copy pinned to upstream commit `434b7f91364665f2f733b310ec54809bf8f37937` of `vercel-labs/web-interface-guidelines` (`command.md`, fetched 2026-10-14). The upstream skill fetched it at runtime; this copy keeps reviews repeatable and offline. Refresh by fetching `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` and updating the sha here.

If no files are specified, ask the user which files to review. Apply [`../new-episode/references/skill-overrides.md`](../new-episode/references/skill-overrides.md#web-design-guidelines) when reviewing this repo.
