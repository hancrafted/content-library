# Drive profiles

Project rules that extend the Profiles the `/drive` skill ships: the architect's, which the Orchestrator reasons by,
and the implementer's, which every Subagent brief points at. Write only what is specific to this project.

## Architect

- The Operator is Han. Read `docs/steering/product-vision.md` before a decision; a change that trades architecture or
  agent legibility for delivery is escalated to him first (Archgate ADR GEN-004).
- Archgate ADRs in `.archgate/adrs/` bind every agent; `agentType` in `binding.yml` makes each Subagent honour them.
- Branch types: `episode` and `post-production` are `<type>`s beside the Conventional Commits types and
  `decisions`; Episode Runs (`/new-episode`) and post-production use them.

## Implementer

- Run `archgate check` with the project's verification; an ADR violation blocks the merge, a warning goes in the
  report.
- `drive worktree done --base` prints the fast-suite tests that ran past 750 ms on your branch, with the load factor:
  tests creeping towards CI's 3 s limit. Name any of yours under **Trade-offs**.
- An unmet acceptance criterion is a blocker, never a Trade-off: report it `- [ ]` with a `deferred: <ticket url>`
  only when the Orchestrator agreed; `drive worktree done` refuses the merge otherwise.

## Define pre-flight

The Define pre-flight names what is live or scheduled that the change touches. The kinds for this project:

- Events composing a changed Episode, each with its date: past, today or upcoming. An upcoming or same-day Event
  makes the change time-boxed: say so in the Decision PR body.
