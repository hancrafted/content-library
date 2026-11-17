# Fortify

The Evolve phase: every Workflow ends by hardening the repo's harness against what went wrong in it, so the same failure mode cannot recur unnoticed. It runs after the Integration branch's last push passes CI, at the latest after the Operator merges its PR and before cleanup, so it sees the whole Workflow. Run it before that merge when you can: Fortify's tasks then merge into the Integration branch and ride in its PR. Once that PR has merged, they start from a new Integration branch `<type>/<slug>-fortify` with its own PR.

## Corrections reach the learnings file through a Subagent

You log each Operator correction the moment it is made, under **Corrections** in `.scratch/<topic>/decisions.md`, in the Operator's wording. That log is the record "at once": it survives compaction and keeps you diff-free. The Fortify evidence Subagent copies every correction into `docs/drive/learnings.md`. A correction never waits for Fortify to be safe, and you never edit `learnings.md` yourself.

## Steps

1. **Session reviews.** For each Evolve skill in the Binding that reviews past sessions and that only the Operator can invoke (its frontmatter says so), suggest the Operator run it now on this Workflow's sessions, naming them: your own session and each Subagent's, by its Task branch. Whatever it returns goes into the evidence; without it, go on.

   _Done when:_ each such skill was suggested with the session names, and its result is in hand or the Operator declined.

2. **Evidence, delegated.** One Subagent on the Task branch `<Integration branch>--fortify-evidence` writes `.scratch/<topic>/fortify-evidence.md` from:
   - every line under **Corrections** in `decisions.md`;
   - every entry in `docs/drive/learnings.md`, with its count and status;
   - the session reviews from step 1, and the result of each Evolve skill a Subagent can run that reviews sessions or surveys architecture;
   - the Enforcers in `docs/drive/enforcers.yml`;
   - the open tickets labelled `fortify` on the tracker.

   It maps each correction and finding to a failure mode, matching existing entries in `learnings.md` first ([matching](#matching-a-prior-proposal)), and lists the candidates, each with its prior count. In the same task it copies every correction into `learnings.md` and raises the counts its corrections recur, then merges into the Integration branch.

   _Done when:_ every correction is in `learnings.md`, mapped to one failure mode, and the evidence file lists each candidate with its evidence, Enforcer and prior count.

3. **Decision page.** One Subagent builds it, with the Binding's decision-page skill when `evolve` has one, in mode _decide_, its feedback returning by that skill's route. The shape is [The decision page](#the-decision-page).

   _Done when:_ the page holds 2–3 options per category, each with all four fields, and the Operator has its path.

4. **The Operator picks** one quick win and one architectural option, and on an open `fortify` ticket, replace or wait. The Operator may pick none in a category; log that like an unpicked option.

5. **Quick win now.** Dispatch it as one task, merged before cleanup. Its brief also carries the outcome for `learnings.md` (steps 6 and 7), so the outcome lands in the same merge.

6. **One architectural ticket.** File the pick on the tracker, labelled `fortify`; create the label first when the tracker lacks it. At most one `fortify` ticket is open at a time, so hardening work never piles up faster than it lands; before filing, list the tracker's open tickets with that label:
   - **replace**: close the open one with a comment linking the new ticket; its entry in `learnings.md` returns to `waiting`.
   - **wait**: file nothing; the pick goes into `learnings.md` as `waiting`, first in line for the next Fortify.

7. **The rest in learnings.** Every option on the page gets its entry in `learnings.md` once: a new failure mode starts at count 1, a known one has its count raised by one (once per Workflow, however many corrections and options this Workflow mapped to it, so the count measures recurrence across Workflows rather than noise within one). The picked quick win's status becomes `fixed <merge commit>`, the architectural pick's `ticket <ref>`.

_Done when:_ the quick win is merged, at most one `fortify` ticket is open and it is the pick (or the pick waits), and every option and correction is in `learnings.md`.

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

Two candidates are the same failure mode when the same check would catch both, whatever their wording or proposed Enforcer. Raise the existing entry's count and append the evidence line; keep its heading unless the new wording is narrower. A `fixed` entry that recurs means its Enforcer failed: say so on the page, with the fix's reference.

A count of 3 or more is a **smell**: put it at the top of the page, whether or not an option this time addresses it.

## The decision page

One page, mode _decide_, the most consequential item first:

1. **Smells**, when any entry has a count of 3 or more: the entry, its count and its evidence lines.
2. **Quick wins**: 2–3 options, each 15–30 minutes of a Subagent's work.
3. **Architectural options**: 2–3 options, each a ticket's worth of work.
4. **The open `fortify` ticket**, when there is one: replace or wait, beside the new architectural options.

Every option carries four fields:

| Field        | What it holds                                                                    |
| ------------ | -------------------------------------------------------------------------------- |
| Failure mode | one narrow line a check can decide: what went wrong, not a theme                 |
| Evidence     | the correction lines, `learnings.md` entries and review findings it rests on     |
| Enforcer     | the check that would catch it next time, from `enforcers.yml` or a new one named |
| Prior count  | its count in `learnings.md`, 0 when new, and its status when not `proposed`      |

Rank Enforcers deterministic first: types, lint, tests, an ADR checker's rule, a hook. A narrow LLM judge qualifies only when its verdict can be checked; a rule in prose with no check is not an Enforcer.

## Where a lesson lives

A lesson that holds for every project belongs in this skill's source, changed deliberately; `docs/drive/` keeps what holds for this project only.
