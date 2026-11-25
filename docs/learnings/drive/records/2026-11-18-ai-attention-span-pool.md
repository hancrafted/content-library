---
type: record
workflow: ai-attention-span-pool
date: '2026-11-18'
fortify: skipped
skip-reason: 'skip fortify and repeat the same for the "ai-gives-you-more-work" episode'
---

# ai-attention-span-pool

A shared Slide pool for the ai-attention-span Episode.

## subagent-merges-without-build-tests

- **Evidence:** #711 merged on `npm run verify` alone; pre-push failed on `tests/post-build/episode-text/ai-attention-span.de.json` and cost one fix task

## subagent-skips-acceptance-criterion

- **Evidence:** #712 reported visual-check as not done under Not verified and merged; the Orchestrator dispatched it separately

## pool-slide-test-references-event-episode

- **Evidence:** #711 left pool tests rendering through the 2026-10-28 Event copy and pool asserts duplicated in five section tests; review caught it, fix-review b54769a05

## attribution-reminder-conflicts-with-commit-rule

- **Evidence:** both implementation Subagents noted `/commit` strips the Co-Authored-By the harness asks for; the project rule won

## fortify-evidence-merged-into-merged-integration-branch

- **Evidence:** the Fortify evidence Subagent self-merged into the Integration branch after the Operator had merged its PR, so the work landed on a dead branch and had to be recovered

## operator-skips-fortify

- **Evidence:** the Operator skipped the Fortify picks on ai-attention-span-pool, ai-gives-you-more-work-pool and onboard-ai-every-time-event-look ("skip fortify and repeat the same for the \"ai-gives-you-more-work\" episode"); the entries above stay unpicked at count 1 (the first three Workflows count once, as before the migration)
- **Correction:** skip fortify and repeat the same for the "ai-gives-you-more-work" episode. also apply the same transition as with the attention episode
