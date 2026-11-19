---
workflow: ai-gives-you-more-work-pool
date: '2026-11-18'
fortify: skipped
skip-reason: 'skip fortify and repeat the same for the "ai-gives-you-more-work" episode'
---

# ai-gives-you-more-work-pool

A shared Slide pool for the ai-gives-you-more-work Episode.

## subagent-skips-acceptance-criterion

- **Evidence:** the fix-review Subagent did not read the `test:build` output its ticket required, and the Orchestrator accepted that because pre-push runs build tests

## push-not-checked-against-remote

- **Evidence:** three more pushes piped through `grep`, `head` or `tail` (ai-attention-span-pool and ai-gives-you-more-work-pool), and none compared `git ls-remote` with the local commit

## arch-003-three-describe-forces-filler-tests

- **Evidence:** #729 added two tests that can never fail, only to satisfy the three-describe rule (its own Trade-offs line said so); the review caught them
