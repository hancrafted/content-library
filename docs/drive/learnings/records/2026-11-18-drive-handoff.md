---
workflow: drive-handoff
date: '2026-11-18'
fortify: engaged
---

# drive-handoff

The drive handoff: pushes, the PR watch and the learnings tickets; its Fortify filed ticket #772.

## term-coined-for-plain-words

- **Evidence:** the Operator removed the glossary terms Run terms, Interrupt and Notify adapter from #746; Decision record 0028 uses plain words
- **Correction:** "remove" on the glossary entries Run terms, Interrupt and Notify adapter (Operator, #746 review)

## learnings-brief-names-no-evidence-source

- **Evidence:** #745's brief gave no Workflow records, every Evidence line went to drive-handoff, and the Orchestrator corrected `learnings.md` itself (d81199f95), which fortify.md reserves for a Subagent
- **Correction:** the #745 brief named no evidence source, so its Subagent credited every Evidence line to this Workflow; the Orchestrator then edited learnings.md itself (d81199f95), which fortify.md reserves for a Subagent (Orchestrator's own)

## doc-ticket-dispatched-before-described-code-merges

- **Evidence:** #744 ran in parallel with #741 and wrote `drive worktree sync` from the ticket, not the CLI; the Orchestrator fixed it inline (76f36928f); `dispatch.md` dispatches "the moment its last blocker is merged" but nothing makes a doc ticket blocked by the code it describes
- **Correction:** #744 (skill text describing the #741 CLI) was dispatched in parallel with #741, so it documented the ticket, not the code; `drive worktree sync` without `--base` was wrong; the Orchestrator fixed it inline (76f36928f) (Orchestrator's own)

## pr-watch-counts-orchestrator-reply

- **Evidence:** the watch woke on the Orchestrator's reply (same GitHub account as the Operator); #741 skips comments that start with `<!-- drive -->`
- **Correction:** the Decision PR watch counted the Orchestrator's own reply (same GitHub account) and woke early; fixed by the `<!-- drive -->` marker in #741/#744 (Orchestrator's own)

## cli-change-dogfooded-from-older-checkout

- **Evidence:** the first `drive pr watch 768` ran from the main checkout, whose CLI predates #741, and failed with "unknown group 'pr'"
- **Correction:** the first `drive pr watch 768` ran from the main checkout, whose CLI predates #741, and failed with "unknown group 'pr'" (Orchestrator's own)

## worktree-done-refuses-over-stale-pids

- **Evidence:** #744 and the review fix were refused over pids that were another session's or already gone; the first left its worktree on disk until cleanup; `--kill` exists since 2026-11-17 and covers only live pids this shell may stop
- **Correction:** `drive worktree done` refused to remove a worktree over pids that belonged to other sessions (#744) or had already exited (review fix); the first left the worktree on disk (Subagents, twice)

## commit-hook-times-out-under-parallel-load

- **Evidence:** the test stage took 221 s under parallel load and failed two unrelated tests; the retry passed; `vitest.config.mts` already scales the timeout to the measured load, so it is a gap in that measure, not a missing one
- **Correction:** one commit hook failed on two unrelated test timeouts while a Subagent ran in parallel (test stage 221 s); the retry passed (Orchestrator's own)

## notify-push-reaches-only-terminal

- **Evidence:** #768 was ready and the Operator was notified, but Remote Control was off, so no phone push; the Binding's `notify` port (`docs/drive/binding.yml`) names an adapter and checks nothing
- **Correction:** the notify port's push notification reached only the terminal; Remote Control was off, so no phone push (gap)
