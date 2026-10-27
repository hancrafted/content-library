---
type: feature-guide
title: Agentic workflow Authoring guide
stale_after: 2027-04-22T00:00:00Z
---

# Agentic workflow Authoring guide

Read before writing or changing a Workflow file (`src/explorable-explanations/human-in-the-loop/<id>.<locale>.yml`). It is the whole contract of the file: what each field means, which problem the loader reports for which mistake, and a one-stage file that loads. The types are `workflow-schema.types.ts`; the shape check is `workflow-shape.pure.ts`; the meaning checks are `workflow-loader-checks.pure.ts`; both run in `loadWorkflow` (`workflow-loader.pure.ts`). Where the visual is placed and tested: [human-in-the-loop.md](human-in-the-loop.md). A **Workflow** is defined in the [glossary](../../GLOSSARY.md).

## One language per file

A file is written in one language and renders as written; it has no locale field. A Workflow ships as a pair, `<id>.en.yml` and `<id>.de.yml`, registered in `workflow-data.ts` (`FILES`, `WORKFLOW_IDS`). `workflow-pair.test.ts` holds both files of a pair to one structure: Workflow, stage, task and slot ids, slot modes, `free`, sample and example counts, section purposes and technique ids, `foreach`, the number of facts, checks and card lines, the template keys. Strings are free. Change one file's structure and change its twin in the same commit. The build throws every problem of a shipped file; a viewer's upload lists them under the toolbar.

## Top level

All fields are required unless marked. Unknown fields are rejected.

| Field         | Holds                                                                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `title` | The Workflow's id (the file's name, the picker key) and its picker title.                                                                                                       |
| `description` | Optional: one sentence, written for the use case picker, shown under the title there. A shipped Workflow carries it in both languages; an uploaded file without it still loads. |
| `scenario`    | `summary` (one line, shown as the scenario) and `facts` (at least one).                                                                                                         |
| `purposes`    | Exactly the six keys `role`, `context`, `task`, `steps`, `template`, `scope`, each one explanation, written once. A section's `purpose` tooltip shows it.                       |
| `techniques`  | The catalogue of prompt techniques, at least one: `{ id, tier: basic \| advanced, title, explain }`. A new technique is a new entry.                                            |
| `reviewer`    | `sections`, at least one: the general reviewer, written once, joined with every task's checks.                                                                                  |
| `templates`   | A markdown handoff template per key; a task names its key.                                                                                                                      |
| `stages`      | At least one stage, in drawing order.                                                                                                                                           |

Keep scenario facts out of prompt sections. They live in `scenario`, the slot samples and the examples; a section reaches them through a slot marker. A new scenario then swaps data, not prompts.

## Templates and handoffs

Every handoff is markdown: one H1, then H2 sections, and no front matter. A chat app such as ChatGPT cannot be relied on to write front matter, and a learner who must add it by hand gets stuck, so the headings alone carry the shape. A template is a handoff with the sections left empty.

- A template has an H1, no front matter, and holds no `{{marker}}`.
- An H2 written `<like this>` stands for one or more sections of any title; `# <Title>` is the usual H1.
- Every sample and every example is held to its template: it has no front matter, an H1, and H2 headings that follow the template's in order. Headings inside code fences do not count.

## Stage and task fields

Stage: `id`, `title`, `learningGoal` (one line under the popover title), `jobs` (at least one), and optional `summary` (the Stages card's text, at most eight words), `foreach` (the stage repeats; see Repeated stage), `move` (`B`, `R`, `I`, `E` or `F`, the BRIEF letter; a stage teaches one move or none), `gate` (a whole number, the stage's gate) and `card` (`label`, `lines`, `status`, the sign-off card). The first stage with a `card` holds the focal job of the diagram.

Task: `id`, `title`, `goal`, `template`, `slots` (may be empty), `do`, `details`, and `output` (required except on the final job of the last stage), and optional `review`, `needs`, `instructions`.

- `goal`: `do` is the one-sentence goal of the do step, the stepper's title; `review` is the goal of the review step and is required when the job has a review.
- `needs`: ids of jobs of the same stage that run first. A slot may take the output of a job it needs; a slot that takes a same-stage output without `needs`, an unknown id and a cycle are load problems.

- `output` names what the task hands on. A later task's slot takes it by that id. The final job of the last stage may have none; the viewer ticks a checkbox when it is done.
- `template` is a key of `templates`, shared by the do prompt, the reviewer and the checks.
- `do` carries `simple` and `technical`, each at least one section. Simple is a text-only chat; technical is a coding harness, so its prompt is the slash command plus the task. Both are full prompts; nothing is assembled between them.
- `instructions`: one or two plain sentences on what the user does in the do step, shown above the slots.
- `details`: `why`, `example`, `goodLooksLike` (at least one line) and optional `techniques`; the right column of the popover. `why` and `techniques` render under "why it matters".
- Ids are unique across the file: stage ids, task ids and outputs.

Section: `heading` (rendered as H2), `text` (markdown with markers), and optional `purpose` (no purpose, no marker or tooltip), `explain` (replaces the purpose's explanation for this section), `techniques` (catalogue ids, listed with their tier in the purpose tooltip), `only` (`demo` or `full`: the section shows in that mode only, in a do prompt or the reviewer; absent, in both). `project-plan` gives every prompt a `Practice run` section with `only: demo`, which steers toward the simplest option, and a `Scope` section with `only: full`; both say to name a missing number as an open decision rather than guess one. Every `techniques` list, on a section or on `details`, names catalogue ids only, each once, and is non-empty when present. Tag only where the technique genuinely applies.

## Slots are the edges

A slot is a paste-in input of a prompt. The diagram draws its edges from the slots, so a slot's `id` names the `output` of a task in an **earlier stage** (not the same stage). Fields: `id`, `mode`, `label`, `sample`, optional `free`.

- `single` takes one value, marker `{{id}}`. The value is a handoff of the producing task's template; the sample is one string.
- `multiple` takes the rounds of a repeated stage. Its `id` is the repeated job's `output`; markers are `{{id_1}}` ... `{{id_N}}`, one input per marker, plus button capped at the highest marker the do prompts use. The sample is a list with one entry per marker, in marker order. A `single` slot may also take one chat's result as `{{output_K}}`.
- A job of a repeated stage with `demo: N` hands on `x_1` ... `x_N` and `x` (all of them). A `multiple` slot must take `x`; a `single` slot must take one `x_K`.
- A job of a repeated stage may take the output of a job of its own stage that it `needs`: the slot is `single` and, in round K, takes that round's own result (`{{id}}` is read as `{{id_K}}`). `project-plan` uses it for the spec of an epic, which takes the grill of the same epic.
- `free: true` marks the user's own text (the task to plan), not an earlier output. It names no output and its sample is plain text, not a handoff. With no `sample`, it takes the scenario: the summary, a blank line, then the facts as a list. Use `single`.
- A do slot needs a sample (a free slot gets the scenario one); the sample stays in the prompt while the slot is empty, so a jump-in user sees a working prompt. Make a sample the same shape and content the producing task's example has, or a user jumping in sees inputs that do not match the stage before.

## Markers

Written `{{name}}` in a section's `text` (spaces inside are trimmed). Anything else is an unknown marker.

| Marker           | Where                           | Filled with                                                                                                                                                                                                    |
| ---------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{{slot_id}}`    | do sections                     | The pasted value, or the slot's sample while empty.                                                                                                                                                            |
| `{{slot_id_K}}`  | do sections                     | The Kth entry of a `multiple` slot, K from 1 to the stage's demo cap N.                                                                                                                                        |
| `{{item}}`       | do sections of a repeated stage | The H3 section the round works on: its heading and the text under it.                                                                                                                                          |
| `{{item}}`       | a job's review `checks`         | The same, in a Chat review of one round. The CLI review covers every round at once, so it leaves out each check that names `{{item}}`.                                                                         |
| `{{slot_id_*}}`  | do sections                     | Every marker of a `multiple` slot, `{{slot_id_1}}` ... `{{slot_id_N}}`, one per round played, joined by a rule. N is the demo cap in demo mode and the number of H3s pasted in full mode, never below the cap. |
| `{{limit.name}}` | do sections and review `checks` | The job's `limits.name`: its `demo` value in demo mode, its `full` value otherwise.                                                                                                                            |
| `{{template}}`   | do and reviewer sections        | The task's template, in a fenced markdown block.                                                                                                                                                               |
| `{{inputs}}`     | reviewer sections               | Each review slot under its label, its marker in a fenced block; a `multiple` slot gets one per chat.                                                                                                           |
| `{{checks}}`     | reviewer sections               | The task's `checks`, numbered.                                                                                                                                                                                 |

`{{inputs}}` and `{{checks}}` are for the `reviewer` only, and the reviewer may use no slot marker. Place the template with an explicit `{{template}}`; it is never appended. Simple plays a repeated stage once per round, each with `{{item}}` filled in; technical shows one prompt per job, so write the technical prompt of a repeated stage for one orchestrator that launches one subagent per round and leave `{{item}}` out of it.

## Limits

A job may carry `limits: { <name>: { full: N, demo: M } }` for a number its prompts name, such as how many questions a grill may ask. Write `{{limit.<name>}}` in a do section or a review check; the popover fills it by mode. Every demo cap sits there, next to its full value (the round caps of a stage sit in `foreach.demo`). The loader reports a `{{limit.x}}` the job does not declare and a `demo` value above its `full` one; `limits` is part of the pair structure.

## Taking every round's result

A job that reads all rounds of a repeated stage (the merge of the epic specs, the combine of the ticket results) takes a `multiple` slot and writes one marker `{{id_*}}` where the results go. The marker expands into one entry per round played, so full mode with nine pasted tickets gets nine fields and demo mode gets the cap. The sample list has one entry per demo round.

## Repeated stage

A stage repeats with `foreach: { over: <output>#<h2 slug>, demo: N, item: <word> }`; it replaces the old `fanOut`. `item` is optional: what one round is called in the file's language (`epic`, German `Epic`), so the Detailed bracket reads "× each epic (2)"; without it the bracket says "round". `over` names an output an earlier stage hands on and the slug of an H2 of that job's template (lowercase words joined by dashes). Each H3 under that H2 in the pasted result is one round, and the whole stage's jobs run once per round. A round reaches its item through `{{item}}`, which is filled with the H3 and the text under it; the round's title is the H3 text.

- Demo mode takes the first `demo` H3s, in document order; full mode takes every H3 pasted. Before anything is pasted, the rounds come from the producing job's `details.example`.
- Each job's output becomes `x_1` ... `x_N` (N is `demo`); a later slot over it is `multiple` with N markers. `details.example` of a job in the stage is a list of N, one example per demo round, so the example and the downstream sample stay one coherent set.
- The loader reports an `over` that is not `output#slug`, an unknown output or heading, a `demo` below 1, `fanOut` as an unknown field and `{{item}}` outside a repeated stage.
- Results are kept as `stage.job`, or `stage.job#k` for round k; `workflow-run.pure.ts` is the one seam that turns a Workflow and its results into job states, rounds and counts.

```yaml
# Tickets (earlier stage) hand on a template with ## Tickets / ### <Ticket title>
- id: research
  title: Research
  learningGoal: Give each ticket its own fresh chat.
  foreach:
    over: tickets#tickets
    demo: 3
    item: ticket
  jobs:
    - id: venue
      title: Chat
      output: research # hands on research_1, research_2, research_3
      template: research
      slots:
        - { id: tickets, mode: single, label: Your tickets, sample: '...' }
      do:
        simple:
          - heading: Your ticket
            purpose: context
            text: 'Work only on this ticket: {{item}}'
        technical:
          - heading: Task
            purpose: task
            text: '/research the tickets below, one subagent per ticket. {{tickets}}'
      details:
        example: ['<round 1 handoff>', '<round 2 handoff>', '<round 3 handoff>']
# the Compare task, a later stage:
#   slots: [{ id: research, mode: multiple, label: ..., sample: [ "<1>", "<2>", "<3>" ] }]
#   a do section uses {{research_1}} {{research_2}} {{research_3}}
```

## Review

`review` is optional: give one where a mistake costs most, such as the job before a gate. It runs in a fresh chat, only reports, then writes a fix handoff the user pastes back into the first chat. Fields: `slots` (at least one), `checks` (at least one, the tailored layer), optional `instructions`; the goal of the step sits in the job's `goal.review`.

- General checks live once in `reviewer`; `checks` are task-specific sanity checks a fresh reviewer can judge from the work and its inputs.
- A review slot's sample is optional. Its `id` is either an output of an earlier stage (taken in the right mode, checked against that task's template) or a fresh id that clashes with no other id in the file; the task's own `output` is allowed too. A fresh id is checked against the task's own template.
- `{{inputs}}` in the `reviewer` writes the slots; each review slot is therefore a paste-in of the result under review plus whatever it is checked against.

## A complete one-stage file

The smallest file that loads. The test `workflow-guide.test.ts` loads this block, so it stays true.

```yaml
# guide-fixture
id: greeting
title: Greeting
scenario:
  summary: Write a greeting for a new colleague.
  facts:
    - The colleague starts on Monday
purposes:
  role: Giving the AI a role makes it more likely to behave that way.
  context: What the AI cannot know unless you tell it.
  task: The one thing you want done.
  steps: The order to work in, so the AI does not skip or reorder.
  template: The exact shape of the answer, so the next chat can read it.
  scope: What is in and out, so the AI does not wander.
techniques:
  - id: delimiters
    tier: basic
    title: Fence pasted text
    explain: Put pasted text in a fenced block, so the AI can tell your words from the material.
reviewer:
  sections:
    - heading: Your role
      purpose: role
      text: You are a strict reviewer in a fresh chat. You only check the work.
    - heading: What you are given
      purpose: context
      techniques: [delimiters]
      text: '{{inputs}}'
    - heading: Checks for this task
      purpose: task
      text: '{{checks}}'
    - heading: Template
      purpose: template
      text: '{{template}}'
templates:
  greeting: |
    # <Greeting for whom>
    ## Message
    ## Tone
stages:
  - id: write
    title: Write
    learningGoal: 'Break it down: one small piece, written in a fresh chat.'
    summary: One small piece, in a fresh chat
    move: B
    jobs:
      - id: greet
        title: Greeting
        goal:
          do: Write one friendly greeting for the new colleague.
          review: Have a second AI chat check the greeting.
        output: greeting
        template: greeting
        slots:
          - id: task
            mode: single
            free: true
            label: Your task
        instructions: Open a fresh chat and paste the prompt.
        do:
          simple:
            - heading: Your role
              purpose: role
              text: You are a friendly colleague.
            - heading: The task
              purpose: context
              techniques: [delimiters]
              text: |
                My task is:

                {{task}}
            - heading: Format
              purpose: template
              text: |
                If you can create a file, write a markdown file. If not, answer in raw markdown in this template.

                {{template}}
          technical:
            - heading: Task
              purpose: task
              text: 'Write the greeting for this task: {{task}}'
            - heading: Format
              purpose: template
              text: |
                Write a markdown file, or raw markdown if you cannot create files, in this template.

                {{template}}
        review:
          slots:
            - id: greeting
              mode: single
              label: The greeting to review
          checks:
            - The message names the colleague's start day.
        details:
          why: A short piece fits one chat and one handoff.
          example: |
            # Greeting for Sam
            ## Message
            Welcome, Sam. See you on Monday.
            ## Tone
            Warm and short.
          goodLooksLike:
            - The message is two sentences or fewer.
```

## Problems the loader reports

`loadWorkflow` returns every problem at once, one sentence each; the shape problems come first and stop the meaning checks.

- The text is not YAML: "The file is not valid YAML."
- Shape, with a path such as `stages[0].jobs[1].do.simple`: `<path> is missing.`; `<path> is not a field of the schema.`; `<path> must be a mapping.` / `a list.`; `<path> needs at least N entries.`; `<path> must be text` (non-empty), `a whole number of at least 1`, `true or false`, or `text or a list of texts`; `<path> is "x", which is not one of ...` (a `purpose`, `tier`, `mode`, `only`, `move`); `purposes` lacking one of its six keys or holding another.
- Templates: front matter; no H1; a `{{marker}}` inside.
- Ids: a stage, task or technique id used twice; an output handed on by two tasks; a slot id twice in one task; a `demo` cap below 1.
- Slots: names no output of an earlier stage (and is not `free`); takes all rounds of a repeated stage but is `single`; is `multiple` but its output is not from a repeated stage; a non-free do slot with no sample; a `multiple` slot with a lone sample or a `single` slot with a list; a list whose length differs from the markers; a review slot id that clashes with another id.
- Jobs: a `needs` id that is no job of the stage; a `needs` cycle; a slot taking a same-stage output without `needs`; a job with a review and no `goal.review`; a job with no output that is not the final job of the last stage; a stage `summary` over eight words.
- Techniques: a section or details naming an unknown technique id.
- Markers: an unknown marker in a task prompt (either runtime) or in the reviewer, naming the marker.
- Handoffs: a sample or example with front matter, with no H1, or whose H2 sections differ from the template's; a task naming an unknown template; a list example on a job whose stage does not repeat; an example list whose length is not the stage's demo cap.

Verify a new file by running `npm test` (`workflow-pair.test.ts`, the loader and the guide test), or load it through the toolbar upload.
