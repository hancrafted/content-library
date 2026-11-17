# Fortify

The Evolve phase: every Workflow ends by hardening the repo's harness against what went wrong in it. It runs after the Integration branch's last push passes CI, at the latest after the merge and before cleanup, so it sees the whole Workflow.

1. **Evidence, delegated.** One Subagent gathers, into `.scratch/<topic>/fortify-evidence.md`: the **Corrections** in `decisions.md`, the past proposals in `docs/drive/learnings.md` with their counts, the result of each Evolve skill that reviews a session or surveys architecture, and the project's Enforcers from `docs/drive/enforcers.yml`. It also writes every correction into `docs/drive/learnings.md`.
2. **Options.** From the evidence, one Subagent builds one decision page (with the Binding's decision-page skill when it has one) offering:
   - 2–3 **quick wins**, 15–30 minutes each;
   - 2–3 **architectural options**.

   Each option names one narrow failure mode, the evidence it rests on, and the Enforcer that would catch it next time. Rank Enforcers deterministic first: types, lint, tests, an ADR checker's rule, a hook. A narrow LLM judge qualifies only when its verdict can be checked. An option already in `learnings.md` says how often it was proposed.

3. **The Operator picks** one per category.
4. **Quick win now.** Dispatch it as a task; it merges into the Integration branch before cleanup.
5. **One architectural ticket.** File the pick as the single open ticket labelled `fortify`. When one is open already, the Operator chooses: replace it, or let the new one wait in `learnings.md`.
6. **The rest in learnings.** Each unpicked option goes into `docs/drive/learnings.md` once, with its recurrence count raised when it was proposed before: a count that keeps rising is a smell to raise with the Operator.
7. When an Evolve skill reviews past sessions, suggest the Operator run it on this Workflow's sessions, naming them.

A lesson that holds for every project belongs in this skill's source, changed deliberately; `docs/drive/` keeps what holds for this project only.
