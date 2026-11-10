---
name: to-decision-html
description: Turn decisions into one standalone HTML decision page that a person decides from or understands, and bring their feedback back. Use to let someone pick between Options (decide), to explain decisions already made in a ticket or plan (explain), or to revise a decision page from its feedback.
---

# To decision HTML

A **decision page** is one standalone HTML file. In mode `decide` a person decides open decisions from it with confidence; in mode `explain` a reader understands decisions already made. Every item leads with its decision, and each visual serves that decision. You write the page and stop there: the caller owns what happens next, including implementing what the page proposes.

## When the caller owns the frame

When the caller owns both the frame (the page, its layout and controls) and the feedback (its format, rounds and approval), write content only: the items, their Options and visuals, built by steps 1 to 3 in the caller's markup and at the fidelity it names, handed back where it says. The caller's frame takes the place of steps 4 to 7.

## 1. Gather the inputs

The caller supplies the domain. Take each input from the caller first:

| Input                | What it settles                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Audience             | Who reads the page and what they already know.                                                              |
| Decisions            | The items: open decisions for `decide`, settled ones for `explain`.                                         |
| Design guidance      | Styling and design tokens, or compiled CSS to inline.                                                       |
| Vocabulary           | The domain terms, used exactly as given.                                                                    |
| Gates                | The approval rules the page keeps.                                                                          |
| Allowed Next actions | The continuations the reviewer may choose (`decide`).                                                       |
| Feedback route       | The caller's save helper and format, or the [feedback contract](references/feedback-contract.md)'s default. |
| Optional             | Mode, motion library, per-item depth and fidelity rung.                                                     |

Explore the working folder and any links you are given for evidence. The page lists every file and link you read, so the reader sees what its claims rest on.

For a revision of an existing page, read it first: keep its page id and every item and Option id, and raise `data-revision` by one.

_Done when_ every input is supplied or listed as missing.

## 2. Calibrate once

Skip this step when the caller supplied every input. Otherwise ask one round, only for what is missing, in the repository's grilling format when it has one. Show a table: the page's mode, audience and feedback route, then every item with its depth (`simple`, `detailed` or `both`) and fidelity rung. Propose a value in each cell; "yes" accepts them all.

Without an answer, proceed, and mark each value you chose as _assumed_ on the page.

_Done when_ the page has a mode and every item a depth and rung, each confirmed or marked assumed.

## 3. Build each item: decision → evidence → rendering

Order items by consequence, most consequential first. For each item:

1. **Decision.** State it in one sentence, then what changes for the reader: under each Option in `decide`, overall in `explain`.
2. **Evidence.** Assemble the bundle: examples, visuals, context and references. Label every statement as evidence (with its source), agent proposal or unknown. A research question is not a finding. Explain technical meaning in plain words and keep the precise detail beside it.
3. **Rendering.** Choose it from the table, at a rung of the fidelity ladder.

| Decision                 | Rendering that helps a person judge it                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Software architecture    | Before/after dependency, sequence, UML or ER diagrams; the responsibilities that move and the files affected.               |
| Information architecture | Before/after folder trees, naming examples, navigation maps or content relationships.                                       |
| UI or visual design      | Real-content mocks at useful widths, compared at a scale where hierarchy and density can be judged.                         |
| UX or animation          | Live states and transitions; pointer and keyboard controls, replay, and reduced-motion behaviour where relevant.            |
| Feature or user story    | A user journey, state diagram or concrete scenario: actors, intended outcome, alternatives and acceptance examples.         |
| Bug fix                  | Observed against expected behaviour, then the before/after proposal; a reproduced failure told apart from a reconstruction. |
| Concept or requirement   | A relationship diagram, worked example or process visual; precise detail one step deeper.                                   |

Show before and after for every change, fixes included. The before comes from evidence; when it is unknown, the page says unknown. Graph-shaped relationships get a diagram; when a graph layout hides the point, compose HTML and SVG instead. True alternatives differ in the decision itself. An analogy explains and never proves: give it a show/hide toggle on its item and name where it breaks down.

### Fidelity ladder

`diagram` (diagram or sketch) → `wireframe` → `mock` (real-content mock) → `prototype` (interactive). Pick the lowest rung that settles the decision, unless the caller names one. The ladder guides rather than limits. Each item states its rung and why that rung is enough, so the reviewer can ask for a higher one, and a revision may raise it.

### Diagrams and motion

Keep each Mermaid diagram's source word for word in `<script type="text/x-mermaid" data-diagram="<name>">`, so it can be copied into documentation, and render it beside the script, in the same parent element:

- **With a browser tool**, pre-render the source to inline SVG while you build the page.
- **Without one**, load Mermaid from jsDelivr at an exact version, show the source as text until it renders, and mark `<html data-offline="partial">`.

[Diagrams](references/diagrams.md) gives both procedures.

Animate with CSS transitions and the Web Animations API, and honour `prefers-reduced-motion`. Inline a library only when the caller names it, such as a motion library's core at the caller's pinned version; the Mermaid fallback is the one exception.

### Confidence bar

An item is finished when a reader can answer from the page alone:

1. What is the decision, in one sentence?
2. What changes for me?
3. Which statements are evidence, which are proposals, which are unknown?
4. Which Option is recommended, and why? (`decide`)
5. Is the fidelity enough to judge it?
6. Is it a one-way or two-way door, and how much effort does it take? (`decide`)

_Done when_ every item clears the bar for its mode.

## 4. Lay out the page

A header states purpose and scope. Item navigation stays visible while the page scrolls. Build for desktop and landscape tablet with no horizontal scroll.

While the reviewer types, pastes or dictates a comment, the visual it is about stays in view, even with tall content and long comments. One arrangement that works: the visual centred, with Option cards in a sticky right-hand rail holding choices, explanations and comments, and a collapsible left navigation to win back width. Choose another arrangement when it keeps visual and comment in view together better. Viewing an Option and picking it are separate actions. Add reviewer tools, such as preview width, theme, state or motion controls, where an item needs them.

Follow the caller's design guidance; without it, use a restrained, readable style on design tokens with light and dark themes.

_Done when_ every item's visual and its comment fields can be seen together at both widths.

## 5. Add the mode's controls

**`decide`**

- Each item takes the response that fits it: boolean, single choice or multiple choice. Every response starts unanswered and can be cleared.
- Every item with Options marks exactly one recommended, with its reason. The reviewer still makes the pick.
- Each item shows its door (one-way or two-way) and effort.
- Comments sit on each item and on each Option, unselected Options included.
- Above the Next action, a **Before you approve** block asks open questions through lenses the items may have missed, such as security, operations, information architecture and accessibility. The answers are the reviewer's to give, so the page asks and stops.
- The Next action offers only the allowed Next actions, preset by the [feedback contract](references/feedback-contract.md).

**`explain`**

The reader learns decisions someone else already made, such as a ticket's. The page teaches each decision and leaves it settled.

- Each item gives its decision a visual and at least one concrete example: a scenario, a before and after, or a worked case.
- An item clears confidence-bar questions 1, 2, 3 and 5. Questions 4 and 6 belong to `decide`: a settled decision has no recommendation, door or effort left to weigh.
- Responses are the reader's questions, so the page carries no Options, choice inputs or Next action.
- A **reflection** block asks open questions through general non-functional lenses: systems and critical thinking, information architecture, security for engineers, and UX for audience-facing work. Choose the lenses that fit the audience. Each prompt is a question; the reader writes the answer, so the page shows no agent-written answer, hint or answer key beside it.
- A **Questions?** block holds a labelled comment field with Copy prompt and Save from the [feedback contract](references/feedback-contract.md). It carries the reader's questions to the agent or the decisions' author.

_Done when_ every item carries its mode's controls, and the page holds its mode's blocks: Before you approve and the Next action in `decide`, reflection and Questions? in `explain`.

## 6. Hand back the feedback

Apply the [feedback contract](references/feedback-contract.md): Copy prompt and Save carry the reviewer's responses and comments back to you, verbatim, with no server. A caller's own save helper and format take precedence over it.

_Done when_ the page names its feedback file, `<page-id>-r<N>-feedback.md`, or the caller's destination.

## 7. Deliver and verify

The page meets the contract below and loads with no network. Inline all CSS and JavaScript, embed every asset, and draw diagrams as inline SVG.

| Where                                   | Attribute          | Values                                                                       |
| --------------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `<html>`                                | `data-page-id`     | A lowercase slug, stable across revisions.                                   |
| `<html>`                                | `data-revision`    | A positive integer, starting at 1.                                           |
| `<html>`                                | `data-mode`        | `decide` or `explain`.                                                       |
| `<html>`                                | `data-offline`     | `partial`, only while a diagram needs its pinned renderer from the network.  |
| Each item                               | `data-item`        | A stable id, unique on the page.                                             |
| Each item                               | `data-fidelity`    | `diagram`, `wireframe`, `mock` or `prototype`.                               |
| Each item                               | `data-depth`       | `simple`, `detailed` or `both`.                                              |
| Each Option, inside its item            | `data-option`      | A stable id, unique in its item.                                             |
| Each Option                             | `data-recommended` | `true` or `false`.                                                           |
| Each `<script type="text/x-mermaid">`   | `data-diagram`     | A unique name; the script holds the diagram's source.                        |
| The Before you approve/reflection block | `data-reflection`  | Present once; in `decide`, above the Next action.                            |
| The Questions? block (`explain`)        | `data-questions`   | Present once, holding the editable `<textarea>` for the reader's questions.  |
| The Next action (`decide`)              | `data-next-action` | Present once, holding the `<select>` or radio inputs that choose the action. |
| The Copy prompt button                  | `data-copy-prompt` | Present once.                                                                |
| The Save button                         | `data-save`        | Present once; downloads `<page-id>-r<N>-feedback.md`.                        |
| The Reset all button (`decide`)         | `data-reset-all`   | Present once; asks with `confirm()` before it clears.                        |
| Each item's reset button (`decide`)     | `data-reset`       | Inside its item; clears only that item.                                      |

Everything else on the page is yours to shape.

When Node and Playwright are available, run `node scripts/grade.ts <page.html>` from this skill's folder. It prints each check's pass or fail as JSON; fix every failure. Then run the [verification](references/verification.md) checks the grader cannot make.

Open the page with the platform's opener, then print:

- the page's absolute path and its mode;
- the feedback filename, `<page-id>-r<N>-feedback.md`, or the caller's destination;
- how to continue: after Save, say "saved feedback"; after Copy prompt, paste the prompt into this or any agent session.

_Done when_ the grader passes or is named as unavailable, every check that could not run is named, and the person has the open page and those three lines.

## Evaluation

Only when evaluating or improving this skill, follow [evals](evals/README.md).
