---
type: feature-guide
title: Agentic workflow Authoring guide
stale_after: 2027-04-22T00:00:00Z
---

# Agentic workflow Authoring guide

Read before writing or changing a Workflow file (`src/components/slide-shared/human-in-the-loop/<id>.<locale>.yml`). It is the whole contract of the file: what each field means, which problem the loader reports for which mistake, and a one-stage file that loads. The types are `workflow-schema.types.ts`; the shape check is `workflow-shape.pure.ts`; the meaning checks are `workflow-loader-checks.pure.ts`; both run in `loadWorkflow` (`workflow-loader.pure.ts`). Where the visual is placed and tested: [human-in-the-loop.md](human-in-the-loop.md). A **Workflow** is defined in the [glossary](../../GLOSSARY.md).

## One language per file

A file is written in one language and renders as written; it has no locale field. A Workflow ships as a pair, `<id>.en.yml` and `<id>.de.yml`, registered in `workflow-data.ts` (`FILES`, `WORKFLOW_IDS`). `workflow-pair.test.ts` holds both files of a pair to one structure: Workflow, stage, task and slot ids, slot modes, `free`, sample and example counts, section purposes and technique ids, fan-out, the number of facts, checks and card lines, the template keys. Strings are free. Change one file's structure and change its twin in the same commit. The build throws every problem of a shipped file; a viewer's upload lists them under the toolbar.

## Top level

All fields are required unless marked. Unknown fields are rejected.

| Field         | Holds                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`, `title` | The Workflow's id (the file's name, the picker key) and its picker title.                                                                                 |
| `scenario`    | `summary` (one line, shown as the scenario) and `facts` (at least one).                                                                                   |
| `purposes`    | Exactly the six keys `role`, `context`, `task`, `steps`, `template`, `scope`, each one explanation, written once. A section's `purpose` tooltip shows it. |
| `techniques`  | The catalogue of prompt techniques, at least one: `{ id, tier: basic \| advanced, title, explain }`. A new technique is a new entry.                      |
| `reviewer`    | `sections`, at least one: the general reviewer, written once, joined with every task's checks.                                                            |
| `templates`   | A markdown handoff template per key; a task names its key.                                                                                                |
| `stages`      | At least one stage, in drawing order.                                                                                                                     |

Keep scenario facts out of prompt sections. They live in `scenario`, the slot samples and the examples; a section reaches them through a slot marker. A new scenario then swaps data, not prompts.

## Templates and handoffs

Every handoff is markdown: one H1, then H2 sections, and no front matter. A chat app such as ChatGPT cannot be relied on to write front matter, and a learner who must add it by hand gets stuck, so the headings alone carry the shape. A template is a handoff with the sections left empty.

- A template has an H1, no front matter, and holds no `{{marker}}`.
- An H2 written `<like this>` stands for one or more sections of any title; `# <Title>` is the usual H1.
- Every sample and every example is held to its template: it has no front matter, an H1, and H2 headings that follow the template's in order. Headings inside code fences do not count.

## Stage and task fields

Stage: `id`, `title`, `learningGoal` (one line under the popover title), `jobs` (at least one), and optional `move` (`B`, `R`, `I`, `E` or `F`, the BRIEF letter; a stage teaches one move or none), `gate` (a whole number, the stage's gate) and `card` (`label`, `lines`, `status`, the sign-off card). The first stage with a `card` holds the focal job of the diagram.

Task: `id`, `title`, `output`, `template`, `slots` (may be empty), `do`, `details`, and optional `fanOut`, `instructions`, `review`.

- `output` names what the task hands on. A later task's slot takes it by that id.
- `template` is a key of `templates`, shared by the do prompt, the reviewer and the checks.
- `do` carries `simple` and `technical`, each at least one section. Simple is a text-only chat; technical is a coding harness, so its prompt is the slash command plus the task. Both are full prompts; nothing is assembled between them.
- `instructions`: one or two plain sentences on what the user does in the do step, shown above the slots.
- `details`: `why`, `example`, `goodLooksLike` (at least one line) and optional `techniques`; the right column of the popover. `why` and `techniques` render under "why it matters".
- Ids are unique across the file: stage ids, task ids and outputs.

Section: `heading` (rendered as H2), `text` (markdown with markers), and optional `purpose` (no purpose, no marker or tooltip), `explain` (replaces the purpose's explanation for this section), `techniques` (catalogue ids, listed with their tier in the purpose tooltip). Every `techniques` list, on a section or on `details`, names catalogue ids only, each once, and is non-empty when present. Tag only where the technique genuinely applies.

## Slots are the edges

A slot is a paste-in input of a prompt. The diagram draws its edges from the slots, so a slot's `id` names the `output` of a task in an **earlier stage** (not the same stage). Fields: `id`, `mode`, `label`, `sample`, optional `free`.

- `single` takes one value, marker `{{id}}`. The value is a handoff of the producing task's template; the sample is one string.
- `multiple` takes the chats of a fan-out. Its `id` is the fan-out's `output`; markers are `{{id_1}}` ... `{{id_N}}`, one input per marker, plus button capped at the highest marker the do prompts use. The sample is a list with one entry per marker, in marker order. A `single` slot may also take one chat's result as `{{output_K}}`.
- A fan-out `x` of N chats hands on `x_1` ... `x_N` and `x` (all of them). A `multiple` slot must take `x`; a `single` slot must take one `x_K`.
- `free: true` marks the user's own text (the task to plan), not an earlier output. It names no output and its sample is plain text, not a handoff. With no `sample`, it takes the scenario: the summary, a blank line, then the facts as a list. Use `single`.
- A do slot needs a sample (a free slot gets the scenario one); the sample stays in the prompt while the slot is empty, so a jump-in user sees a working prompt. Make a sample the same shape and content the producing task's example has, or a user jumping in sees inputs that do not match the stage before.

## Markers

Written `{{name}}` in a section's `text` (spaces inside are trimmed). Anything else is an unknown marker.

| Marker          | Where                          | Filled with                                                                                          |
| --------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `{{slot_id}}`   | do sections                    | The pasted value, or the slot's sample while empty.                                                  |
| `{{slot_id_K}}` | do sections                    | The Kth entry of a `multiple` slot, K from 1 to the fan-out's N.                                     |
| `{{n}}`         | do sections of a `fanOut` task | The chat number, 1 to N.                                                                             |
| `{{template}}`  | do and reviewer sections       | The task's template, in a fenced markdown block.                                                     |
| `{{inputs}}`    | reviewer sections              | Each review slot under its label, its marker in a fenced block; a `multiple` slot gets one per chat. |
| `{{checks}}`    | reviewer sections              | The task's `checks`, numbered.                                                                       |

`{{inputs}}` and `{{checks}}` are for the `reviewer` only, and the reviewer may use no slot marker. Place the template with an explicit `{{template}}`; it is never appended. Simple shows Chat 1..N tabs with `{{n}}` filled in; technical shows one prompt and fills `{{n}}` with 1, so write the technical fan-out prompt for one orchestrator that launches N subagents and leave `{{n}}` out of it.

## Fan-out

`fanOut: N` (a whole number of at least 2) makes N parallel chats from one template. The task's `output` becomes `x_1` ... `x_N`. `details.example` is a list of N, one example per chat in chat order; the popover shows chat n's example with chat n. The Compare slot over it is `multiple` and its sample list is the same N entries, so the example and the downstream sample stay one coherent set. Each chat should take its own unit of work (chat n takes ticket n), or N chats may do the same work.

```yaml
# Research task: three chats, one per ticket (fragment)
- id: venue
  title: Chat
  output: research # hands on research_1, research_2, research_3
  template: research
  fanOut: 3
  slots:
    - { id: tickets, mode: single, label: Your tickets, sample: '...' }
  do:
    simple:
      - heading: Your ticket
        purpose: context
        text: 'This is chat {{n}}. Take ticket number {{n}} from: {{tickets}}'
    technical:
      - heading: Task
        purpose: task
        text: '/research the tickets below, one subagent per ticket. {{tickets}}'
  details:
    example: ['<chat 1 handoff>', '<chat 2 handoff>', '<chat 3 handoff>']
# the Compare task, a later stage:
#   slots: [{ id: research, mode: multiple, label: ..., sample: [ "<1>", "<2>", "<3>" ] }]
#   a do section uses {{research_1}} {{research_2}} {{research_3}}
```

## Review

`review` is optional per task; Interview ships without one. It runs in a fresh chat, only reports, then writes a fix handoff the user pastes back into the first chat. Fields: `slots` (at least one), `checks` (at least one, the tailored layer), optional `instructions`.

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
    move: B
    jobs:
      - id: greet
        title: Greeting
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
- Shape, with a path such as `stages[0].jobs[1].do.simple`: `<path> is missing.`; `<path> is not a field of the schema.`; `<path> must be a mapping.` / `a list.`; `<path> needs at least N entries.`; `<path> must be text` (non-empty), `a whole number of at least 1`, `true or false`, or `text or a list of texts`; `<path> is "x", which is not one of ...` (a `purpose`, `tier`, `mode`, `move`); `purposes` lacking one of its six keys or holding another.
- Templates: front matter; no H1; a `{{marker}}` inside.
- Ids: a stage, task or technique id used twice; an output handed on by two tasks; a slot id twice in one task; a `fanOut` below 2.
- Slots: names no output of an earlier stage (and is not `free`); takes all chats of a fan-out but is `single`; is `multiple` but its output is no fan-out; a non-free do slot with no sample; a `multiple` slot with a lone sample or a `single` slot with a list; a list whose length differs from the markers; a review slot id that clashes with another id.
- Techniques: a section or details naming an unknown technique id.
- Markers: an unknown marker in a task prompt (either runtime) or in the reviewer, naming the marker.
- Handoffs: a sample or example with front matter, with no H1, or whose H2 sections differ from the template's; a task naming an unknown template; a list example on a task without fan-out; a fan-out example list whose length is not N.

Verify a new file by running `npm test` (`workflow-pair.test.ts`, the loader and the guide test), or load it through the toolbar upload.
