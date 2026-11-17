# Merge and review

The Orchestrator stays the architect over every merge and every reviewer, reading reports and diff stats rather than whole diffs.

## Check each merged task

The moment a report arrives, check it against its ticket:

1. **Shape.** Every acceptance criterion has a line, and **Not verified**, **Trade-offs**, **Interfaces changed** and **Terms** are present.
2. **Scope.** `git show --stat <merge commit>` stays inside the paths the brief gave the task; a changed interface is one the ticket or the spec asked for.
3. **Trade-offs.** Each reported trade-off is an item to verify, not a fact to accept: check its claim yourself, and ask how it will look to the Operator (a red CI run, a slower command, a changed screen). One the Operator has not accepted goes to them before the next push.
4. **Terms.** Carry each proposed term into `decisions.md`; it reaches the glossary only through the next Decision docs PR.

A task that fails a check is reverted at once in the Integration branch's worktree: `git revert -m 1 <merge commit>`, then re-dispatch it with the reason. Each task is one merge commit, so a revert touches nothing else.

A task the brief marks _by PR_ (the Operator asked to see its diff or preview): push the Task branch, open its PR into the Integration branch, and check it the same way once the Operator merges it.

## The Integration branch's PR

Push the Integration branch after every merge, in the background (the push runs the project's pre-push checks). The first push after the first merge opens the draft PR to the base branch, with a short body; its final body is a Subagent's task, with the bound PR skill when the Binding has one. Read every CI result; a red run is the next task. The Operator alone merges this PR.

## Review checkpoints

Run the Verify phase's review skill where a ticket's **Review after** line says `yes`, and once before the PR is marked ready; never after every small change. Give it the range since the last checkpoint and the spec.

Triage every finding:

| Verdict    | When                                      | Record                                |
| ---------- | ----------------------------------------- | ------------------------------------- |
| **accept** | the claim holds and the fix belongs here  | the finding, for the fix Subagent     |
| **reject** | the claim is wrong or against a decision  | the reason, naming the decision       |
| **defer**  | the claim holds but belongs to later work | the reason and the ticket it moves to |

Re-check the top claims yourself against the code before you accept or reject them; a reviewer's confidence is not evidence. Show the Operator the triage, then hand every accepted finding to one fix Subagent on one Task branch.
