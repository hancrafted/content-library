# write-design-spec

Output: `docs/episodes/<slug>/spec/design-spec.md`, the Episode's visual language and a design answer for every Slide, under the spec's Sections and Slides; [the sample](../assets/sample-episode/spec/design-spec.md) shows its shape. A local staging file, never a GitHub issue. The job runs after `write-spec`, in the orchestrator session, and ends at a human gate: Han approves the design spec with `approve.ts`, after editing it if he wants.

## Prompt

Name every domain concept by its [`GLOSSARY.md`](../../../GLOSSARY.md) term, never an _Avoid_ word. The implementor runs in this session, because a subagent has no Agent tool, and it spawns the designers itself. `npx mh query docs/episodes/<slug>/spec/design-spec.md` prints the intent of every field and heading; follow each.

1. **Visual language first.** Read the Brief's `## Style` line and the matching named style in [the design guide](../../../docs/design/design-guide.md), then write `## Visual language`: the Episode's recurring motifs, its motion character and how it uses the accent colours, in a few lines. It stays within that style; the Brief is the source, so the section narrows it and never contradicts it.
2. **One designer per Section, in parallel.** Spawn one subagent per spec h2, each told to use the `ui-ux-pro-max:slides` skill, `model` the agent's `model`. Each designer reads the references below plus its Section of `spec/spec.md`, and returns one design answer per Slide of its Section. Write the answers into `design-spec.md` yourself, under the spec's h2 and h3 titles and slugs: parallel edits to one file would conflict.
3. **A failed rubric line goes back to that Section's designer only.** Quote the line verbatim; the other Sections stay as they are.

### What the designers read

The Brief, including its `## Style`; each reference the Brief lists, `design-reference.md` with its page images, which is the model Han brought; the Dossier (the Visual, title and Voice script of each Slide); `GLOSSARY.md`; the design spec's `## Visual language`; the ADRs `.archgate/adrs/FE-002-episode-page.md`, `FE-007-module-layering.md`, `FE-009-slide-wrapper-and-scene.md` and `FE-011-design-tokens.md`; and `docs/design/`: [the Slide library](../../../docs/design/slide-library.md) (which Master slides and library motions exist), [the design guide](../../../docs/design/design-guide.md) (Han's taste, and the run-1 Slides as "not this") and [the design system](../../../docs/design/design-system.md) (tokens and motion rules). Point each designer at the files; never paste them.

### What a designer decides

Every Slide is designed, not only the ones the Dossier's Visual could not match. Creative freedom holds inside the context above and the ADRs:

- The Dossier's `master:` and `motion:` are the writer's proposal. The designer may keep or overrule them as the specialist, and an overruled one names its reason in the answer.
- A Slide that is a Slide library entry used as is says so, and needs no wireframe.
- Otherwise the Slide is a copy of a Master slide with changes, or a one-off Scene from `SlideFrame` and the kit's `<Title>` (FE-002 §3). A new part or motion lives in the Slide's own folder, a server part or its own `*.client.tsx`, and moves to `slide-shared/` once a second Slide needs it (FE-007).
- The answer names parts, tokens, props and i18n keys, plus a low-fidelity text wireframe (ASCII in a code block) for every Slide that is not a library entry used as is. It builds no rendered prototype: the rendered check stays in `implement-section`.
- A Slide is a scrolling web section, not a fixed frame (FE-009): the wrapper's "at least viewport height" is the only height rule.
- A Slide whose Visual names a `Design reference:` page, or that redraws one, opens that page image and names it in the answer by its repo path, `Design reference: docs/episodes/<slug>/reference/<file-slug>/pages/page-<NN>.jpg`, then `Build against this page: keep <what>; change <what>`. The design answer is what a Section implementor builds to, so the line carries both the image and what to keep.

### Settle it as a Scene

Run 1's designers stopped, or handed the question to Han, whenever the library had no part that fit. Those answers are the worked examples of what to settle instead, in the `Design answer` bullets of the run-1 tickets [#100](https://github.com/hancrafted/content-library/issues/100), [#101](https://github.com/hancrafted/content-library/issues/101), [#102](https://github.com/hancrafted/content-library/issues/102) and [#103](https://github.com/hancrafted/content-library/issues/103). Each begins from "No catalog part carries it" or "the catalog has no match" (run 1's word for the Slide library), then ends in an `Open for Han` question that asks whether a Scene counts, or whether to change a shared master. That question is the designer's to settle: a Scene from the frame parts is allowed (FE-002 §3), so the answer chooses one and gives its reason, and `Open for Han` stays only for a call that is Han's alone, such as copy the Dossier does not name. Read those four tickets with `gh issue view` before designing a Slide the library does not carry.

### The orchestrator after the gate

Once Han has approved `design-spec.md`, and before `implement-episode-init`, rewrite every overruled `master:` and `motion:` into the Dossier: one commit on `episode/<slug>` through the `commit` skill, with `Source: docs/episodes/<slug>/spec/design-spec.md` and `Agent: write-design-spec`. Do it in this session. The designers never edit the Dossier.

### Gate outcome

When Han has approved, log one Score on the Job: `episode:run -- <slug> score write-design-spec gate "<outcome>" --source human:han --via chat|commit --comment "<his words, if any>"`. The outcome is `approved after edits` (Han's approval commit changes `design-spec.md`, the diff against the `Gate: draft design spec` commit), `approved as drafted` (he read it and approved it untouched) or `approved unreviewed` (he approved without reading it; his words say so). The run-log entry carries no Metrics. When most runs are `approved as drafted` (`SELECT value, count(*) FROM scores WHERE name = 'gate' AND source = 'human:han' GROUP BY value`; `approved unreviewed` counts for nothing), `gate: human` is removed.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). Beyond them, `design-spec.md` has its `## Visual language` and a design answer for every Slide of `spec/spec.md`, and is committed through the `commit` skill with `Gate: draft design spec`: the human gate stops the run here. After Han's approval, the Build jobs build from the design answers.

## Rubric

1. Every Slide of the spec has a design answer.
2. Every Slide that is not a Slide library entry used as is has a text wireframe.
3. The design follows the design spec's visual language.
4. Every overruled `master:` or `motion:` names its reason.
5. Colour, size and weight are tokens (FE-011); every import is one FE-007 §5 allows.
6. The Slide follows FE-009: no fixed height, no clipping, Foreground clear of the chrome (see "What a designer decides").
7. Every Slide that redraws a reference page names its page image by repo path with `Design reference:`, and says what to keep and what to change.
