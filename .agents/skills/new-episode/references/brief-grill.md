# brief-grill

Output: `docs/episodes/<slug>/brief.md`, ending at a human gate. No reviewer: Han is the reviewer.

The grill is a dialogue with Han, so it runs in the orchestrator's session, never in a subagent. [`docs/agents/episode-brief-grill.md`](../../../../docs/agents/episode-brief-grill.md) is the whole procedure: the time-box, the phases Frame → Explore → Settle, and the Brief template. Load the `grilling` skill for its stance and follow that guide wherever the two differ.

## Starting points

- **A one-line idea**: run the grill from Frame.
- **A pasted voice handoff**: save it verbatim to `.scratch/<slug>/handoff.md` first, then write `brief.md` from it by the guide's _Writing the Brief_ steps. Its Open questions become the first thing you settle with Han.
- **An existing `brief.md`** with `status: draft`: Han is still editing it. Ask what is left, and settle only that.

## Done-checks

1. `npm run check:docs` is clean, and `npx vitest run tests/docs/episode-staging.test.ts` passes.
2. Every heading holds Han's choice. A heading still reading `Not settled.` goes back to Han by name: the orchestrator refuses to start on it.
3. The draft is committed through the `commit` skill with `Gate: draft brief` before Han edits it.

Then append the run-log entry (creating `run-log.md` with its `# Run log` h1 if it is new) and stop: the gate opens when Han commits `status: approved` with `Gate: approved brief`.
