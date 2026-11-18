# Fortify

The Evolve phase: every Workflow ends by hardening the repo's harness against what went wrong in it, so the same failure mode cannot recur unnoticed. It runs after the Operator merges the Integration branch's PR and before cleanup, on a branch from the base branch, so it sees the whole Workflow. It blocks nothing: it asks the Operator nothing and builds no decision page; its results are the learnings file and one ticket.

## Corrections reach the learnings file through a Subagent

You log each Operator correction the moment it is made, under **Corrections** in `.scratch/<topic>/decisions.md`, in the Operator's wording. That log is the record "at once": it survives compaction and keeps you diff-free. The Fortify evidence Subagent copies every correction into `docs/drive/learnings.md`. A correction never waits for Fortify to be safe, and you never edit `learnings.md` yourself.

## Steps

1. **Session reviews.** For each Evolve skill in the Binding that reviews past sessions and that only the Operator can invoke (its frontmatter says so), list it with the session names (your own and each Subagent's, by Task branch) in the Fortify branch's PR body, for the Operator to run when convenient. Go on without its result.

   _Done when:_ each such skill is listed with the session names.

2. **Your own deviations.** List every point where you departed from this skill or the Decision docs during the Workflow (a step skipped, a stop added, a command run by hand), each with its cause, in `.scratch/<topic>/decisions.md` under **Corrections**, marked as yours. They are evidence the same as the Operator's corrections.

   _Done when:_ every deviation you can name is a line there.

3. **Evidence, delegated.** One Subagent on the Task branch `<Fortify branch>--evidence`, merged into the Fortify branch, writes `.scratch/<topic>/fortify-evidence.md` from:
   - every line under **Corrections** in `decisions.md`, yours included;
   - every entry in `docs/drive/learnings.md`, with its count and status;
   - the result of each Evolve skill a Subagent can run that reviews sessions or surveys architecture;
   - the Enforcers in `docs/drive/enforcers.yml`;
   - the open tickets labelled `fortify` on the tracker.

   It maps each correction and finding to a failure mode, matching existing entries in `learnings.md` first ([matching](#matching-a-prior-proposal)), and lists 2-3 quick wins and 2-3 architectural options, each with every field of [the field table](#the-options). It fills **Existing state** by checking the current code and config for the proposed fix: a fix that already exists drops out or is reframed as a gap in it, with the file and date it appeared. In the same task it copies every correction into `learnings.md`, adds every option once (a new failure mode starts at count 1, a known one has its count raised by one, once per Workflow, so the count measures recurrence across Workflows rather than noise within one), and sets each status to `proposed`.

   _Done when:_ every correction is in `learnings.md`, mapped to one failure mode, and every option is an entry with all fields of the table, its Existing state checked against the code.

4. **One architectural ticket.** File the recommended architectural option on the tracker, labelled `fortify`; create the label first when the tracker lacks it. At most one `fortify` ticket is open at a time, so hardening work never piles up faster than it lands. When one is open, keep it, and set the new recommendation's status to `waiting` in `learnings.md`, first in line for the next Fortify. The ticket body holds the quick wins too; the Operator picks one when triaging it. The recommended option's status becomes `ticket <ref>`.

5. **Land it.** Push the Fortify branch with `drive push`, open its PR to the base branch and notify the Operator through the Binding's notify port.

_Done when:_ every option and correction is in `learnings.md`, at most one `fortify` ticket is open and it is the recommended architectural option (or the recommendation waits), and the Fortify PR is open.

## The learnings file

`docs/drive/learnings.md` holds one entry per failure mode, never one per option or per Workflow, so a count can rise. Corrections stay verbatim in their own section and point at their entry.

```markdown
# Drive learnings

Format: the drive skill's references/fortify.md, "The learnings file".

## Failure modes

### <failure mode, one narrow line>

- **Count:** <Workflows it recurred in> (last: <date>, <topic>)
- **Enforcer:** <kind>: <name from enforcers.yml, or "new <kind>">, <quick win | architectural>
- **Status:** proposed | waiting | ticket <ref> | fixed <merge commit or ref>
- **Evidence:** <topic>: <one line>; <topic>: <one line>

## Corrections

- <date> <topic>: <the Operator's correction, verbatim> → <failure mode heading>
```

A file that predates this format keeps every line: the evidence Subagent converts each one into a correction or an entry, never deleting what it cannot map.

### Matching a prior proposal

Two candidates are the same failure mode when the same check would catch both, whatever their wording or proposed Enforcer. Raise the existing entry's count and append the evidence line; keep its heading unless the new wording is narrower. A `fixed` entry that recurs means its Enforcer failed: say so in the evidence, with the fix's reference.

A count of 3 or more is a **smell**: put it first, whether or not an option this time addresses it.

## The options

The evidence file lists the options, the most consequential first:

1. **Smells**, when any entry has a count of 3 or more: the entry, its count and its evidence lines; the ticket body leads with them.
2. **Quick wins**: 2–3 options, each 15–30 minutes of a Subagent's work.
3. **Architectural options**: 2–3 options, each a ticket's worth of work.
   Every option carries these fields, in this order of reading:

| Field          | What it holds                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Name           | the problem in plain words a cold reader grasps, never a code identifier                                  |
| Failure mode   | one narrow line a check can decide: what went wrong, not a theme (the `learnings.md` heading)             |
| What happened  | when, what failed and what it cost, from the correction lines, `learnings.md` entries and review findings |
| Existing state | what the current code and config already hold toward the fix, checked, with file and date                 |
| Principle      | the engineering principle the fix applies, so the change reads as an application of it                    |
| Before / after | one concrete case of the repo as it is and as it would be, shown as a diagram or ordered steps            |
| Enforcer       | the check that would catch it next time, from `enforcers.yml` or a new one named                          |
| Cost           | the work to build it and what it adds to every run afterwards                                             |
| Door           | two-way (cheap to undo) or one-way, with the undo named                                                   |
| Prior count    | its count in `learnings.md`, 0 when new, and its status when not `proposed`                               |

Rank Enforcers deterministic first: types, lint, tests, an ADR checker's rule, a hook. A narrow LLM judge qualifies only when its verdict can be checked; a rule in prose with no check is not an Enforcer.

## Where a lesson lives

A lesson that holds for every project belongs in this skill's source, changed deliberately; `docs/drive/` keeps what holds for this project only.
