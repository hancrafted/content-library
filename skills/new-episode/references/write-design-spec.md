# write-design-spec

Output: the Episode's visual language in its spec issue, and a design answer for every Slide in its ticket's body, on GitHub Issues. No staging file: the run-log entry's Output lists the issue URLs. The job runs after `write-spec`, in the orchestrator session, and ends at a human gate: Han approves a design by relabelling its ticket.

## Prompt

Name every domain concept by its [`GLOSSARY.md`](../../../GLOSSARY.md) term, never an _Avoid_ word. The implementor runs in this session, because a subagent has no Agent tool, and it spawns the designers itself. Find the spec issue by its label `episode:<slug>` (`gh issue list --label episode:<slug> --state all`) and its tickets as that issue's sub-issues.

1. **Visual language first.** Read the Brief's `## Style` line and the matching named style in [the design guide](../../../docs/design/design-guide.md), then add a `## Visual language` section to the spec issue: the Episode's recurring motifs, its motion character and how it uses the accent colours, in a few lines. It stays within that style; the Brief is the source, so the section narrows it and never contradicts it. Edit the spec issue in place with `gh issue edit`, never as a comment, and keep one such section on a retry.
2. **One designer per ticket, in parallel.** Spawn one subagent per ticket, each told to use the `ui-ux-pro-max:slides` skill, `model` the agent's `model`. Each designer reads the references below plus its own ticket, and writes its answer into that ticket's body with `gh issue edit`, never as a comment, so a retry updates it. A ticket body keeps one `Design answer` bullet per Slide; a retry replaces it.
3. **A failed rubric line goes back to that ticket's designer only.** Quote the line verbatim; the other tickets stay as they are.

### What the designers read

The Brief, including its `## Style`; each reference the Brief lists, `design-reference.md` with its page images, which is the model Han brought; the Dossier (the Visual, title and Voice script of each Slide); `GLOSSARY.md`; the spec issue's `## Visual language`; the ADRs `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md` and `FE-011-design-tokens.md`; and `docs/design/`: [the Slide library](../../../docs/design/slide-library.md) (which Master slides and library motions exist), [the design guide](../../../docs/design/design-guide.md) (Han's taste, and the run-1 Slides as "not this") and [the design system](../../../docs/design/design-system.md) (tokens and motion rules). Point each designer at the files; never paste them.

### What a designer decides

Every Slide is designed, not only the ones the Dossier's Visual could not match. Creative freedom holds inside the context above and the ADRs:

- The Dossier's `master:` and `motion:` are the writer's proposal. The designer may keep or overrule them as the specialist, and an overruled one names its reason in the answer.
- A Slide that is a Slide library entry used as is says so, and needs no wireframe.
- Otherwise the Slide is a copy of a Master slide with changes, or a one-off Scene from `SlideFrame` and the kit's `<Title>` (FE-002 §3). A new part or motion lives in the Slide's own folder, a server part or its own `*.client.tsx`, and moves to `slide-shared/` once a second Slide needs it (FE-007).
- The answer names parts, tokens, props and i18n keys, plus a low-fidelity text wireframe (ASCII in a code block) for every Slide that is not a library entry used as is. It builds no rendered prototype: the rendered check stays in `implement-episode`.
- A Slide is a scrolling web section, not a fixed frame (FE-009): the wrapper's "at least viewport height" is the only height rule.
- A Slide whose Visual names a `Design reference:` page, or that redraws one, opens that page image and names it in the answer by its repo path, `Design reference: docs/episodes/<slug>/reference/<file-slug>/pages/page-<NN>.jpg`, then `Build against this page: keep <what>; change <what>`. The ticket is all a ticket implementer reads, so the line carries both the image and what to keep.

### Settle it as a Scene

Run 1's designers stopped, or handed the question to Han, whenever the library had no part that fit. Those answers are the worked examples of what to settle instead, in the `Design answer` bullets of the run-1 tickets [#100](https://github.com/hancrafted/content-library/issues/100), [#101](https://github.com/hancrafted/content-library/issues/101), [#102](https://github.com/hancrafted/content-library/issues/102) and [#103](https://github.com/hancrafted/content-library/issues/103). Each begins from "No catalog part carries it" or "the catalog has no match" (run 1's word for the Slide library), then ends in an `Open for Han` question that asks whether a Scene counts, or whether to change a shared master. That question is the designer's to settle: a Scene from the frame parts is allowed (FE-002 §3), so the answer chooses one and gives its reason, and `Open for Han` stays only for a call that is Han's alone, such as copy the Dossier does not name. Read those four tickets with `gh issue view` before designing a Slide the library does not carry.

### Ticket body

Each design answer is a bullet `**Design answer (ui-ux-pro-max:slides)**` under its Slide. The criterion is "build to the ticket's design answer". Every body you edit ends as the [footer rule](../SKILL.md#agent-marks) says. Log each one under the run-log entry's Output as `Edited #<issue> · <timestamp>`.

### Triage labels

`write-spec` files each ticket `needs-triage`. Leave the label on while you write; the label is Han's gate, not yours. Han relabels a ticket `ready-for-agent` to approve its design, and may edit the answer first.

### The orchestrator after the gate

When no ticket is `needs-triage`, and before `implement-episode`, rewrite every overruled `master:` and `motion:` into the Dossier: one commit on `episode/<slug>` through the `commit` skill, a `Source:` trailer per overruling ticket, as its full issue URL (`https://github.com/hancrafted/content-library/issues/<ticket>`, since the `commit` skill rejects `#<ticket>`), and `Agent: write-design-spec`. Do it in this session. The designers never edit the Dossier, because parallel edits to one file would conflict.

### Gate outcome per ticket

When Han has approved, log one Score per ticket on the Job: `episode:run -- <slug> score write-design-spec gate "<outcome>" --source human:han --via chat --ticket <issue> --comment "<his words, if any>"`, read from the ticket's edit history. The outcome is `approved after edits` (Han edited the ticket before approving), `approved as drafted` (he read it and approved it untouched) or `approved unreviewed` (he approved without reading it, in bulk or on trust; his words say so). Record the Score once Han has said which, after the label change that approves the ticket. The run-log entry carries no Metrics. A ticket edit whose body ends `Edited-by: <job id>` is an agent's, so only an unmarked edit counts as an edit (`agentOf` in [`scripts/marks.pure.ts`](../scripts/marks.pure.ts)). When most tickets are `approved as drafted` across runs (`SELECT value, count(*) FROM scores WHERE name = 'gate' AND source = 'human:han' GROUP BY value`; `approved unreviewed` counts for nothing), `gate: human` is removed.

## Done when

Every ticket body has a design answer for every Slide, the spec issue has its `## Visual language`, each body carries the footer, and every ticket still carries `needs-triage`: the human gate stops the run here. After Han's approval, `implement-episode` builds from the approved design answers.

## Rubric

1. Every Slide of the ticket has a design answer.
2. Every Slide that is not a Slide library entry used as is has a text wireframe.
3. The design follows the spec issue's visual language.
4. Every overruled `master:` or `motion:` names its reason.
5. Colour, size and weight are tokens (FE-011); every import is one FE-007 §5 allows.
6. The Slide follows FE-009: no fixed height, no clipping, Foreground clear of the chrome (see "What a designer decides").
7. Every Slide that redraws a reference page names its page image by repo path with `Design reference:`, and says what to keep and what to change.
