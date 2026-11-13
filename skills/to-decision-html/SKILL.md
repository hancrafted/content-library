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

| Input                | What it settles                                                                     |
| -------------------- | ----------------------------------------------------------------------------------- |
| Audience             | Who reads the page and what they already know.                                      |
| Decisions            | The items: open decisions for `decide`, settled ones for `explain`.                 |
| Design guidance      | Styling and design tokens, or compiled CSS to inline.                               |
| Vocabulary           | The domain terms, used exactly as given.                                            |
| Gates                | The approval rules the page keeps.                                                  |
| Allowed Next actions | The continuations the reviewer may choose (`decide`).                               |
| Feedback route       | How feedback returns, per the [feedback contract](references/feedback-contract.md). |
| Optional             | Mode, motion library, per-item depth and fidelity rung.                             |

Explore the working folder and any links you are given for evidence. The page lists every file and link you read, so the reader sees what its claims rest on.

For a revision of an existing page, read it first: keep its page id and every item and Option id, and raise `data-revision` by one.

_Done when_ every input is supplied or listed as missing.

## 2. Calibrate once

Skip this step when the caller supplied every input. Otherwise ask one round, in the repository's grilling format when it has one. Show a table: the page's mode, audience and feedback route, then one row per item with its [depth](#depth) (`simple`, `detailed` or `both`) and fidelity rung. A cell the caller supplied shows its value as fixed; propose a value only in each missing cell, and "yes" accepts every proposal.

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

### Depth

Each item has a depth, set per item like its rung. The simple view alone clears the confidence bar; the detailed layer adds what a reader needs to verify the item, never the decision itself.

| Depth      | The item shows                                                                                      | Choose it when                                                               |
| ---------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `simple`   | The decision, what changes, the visual, the labelled evidence and, in `decide`, the recommendation. | The audience is new to the domain, or the item has no detail worth checking. |
| `detailed` | The simple view plus context, precise technical detail and references, all shown at once.           | Every reader will verify the claims.                                         |
| `both`     | The simple view first, and one toggle that reveals the detailed layer.                              | The audience mixes newcomers with readers who verify.                        |

Without caller input, propose `both` for an item whose references or technical detail stand behind a simple decision, and `simple` otherwise.

### Diagrams and motion

Keep each Mermaid diagram's source word for word in `<script type="text/x-mermaid" data-diagram="<name>">`, so it can be copied into documentation, and render it beside the script, in the same parent element. With a browser tool, pre-render the source to inline SVG while you build the page; without one, use the fallback, which shows the source as text until Mermaid renders it. [Diagrams](references/diagrams.md) gives both procedures.

Animate with CSS transitions and the Web Animations API, and honour `prefers-reduced-motion`. Inline a library only when the caller names it, such as a motion library's core at the caller's pinned version; the diagram fallback is the one exception.

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

A banner `<header>` holds the `<h1>` and a sentence stating purpose and scope. A `<nav>` links to every item and stays visible while the page scrolls. Build for desktop (1440 px) and landscape tablet (1024 px): the page never scrolls sideways, and no box clips or spills its text.

While the reviewer types, pastes or dictates a comment, at least half of the visual it is about stays in view, even with tall content and long comments. One arrangement that works: the visual centred, with Option cards in a sticky right-hand rail holding choices, explanations and comments, and a collapsible left navigation to win back width. Choose another arrangement when it keeps visual and comment in view together better. Viewing an Option and picking it are separate actions. Add reviewer tools, such as preview width, theme, state or motion controls, where an item needs them.

Follow the caller's design guidance; without it, use a restrained, readable style on design tokens with light and dark themes.

Every field and button has an accessible name, every control shows a visible focus indicator, and text reaches WCAG AA contrast (4.5:1, or 3:1 for large text) in both themes. Under `prefers-reduced-motion: reduce`, nothing animates, moves by transition or scrolls smoothly.

_Done when_ every item's visual stays at least half in view beside its comment fields at both widths, and every control is labelled, shows focus and reads at AA contrast in both themes.

## 5. Add the mode's controls

Both modes carry one reflection block of open questions through lenses the items may have missed. The reader writes the answers, so the page shows no agent-written answer, hint or answer key beside a prompt.

**`decide`**

- Each item takes the response that fits it: boolean, single choice or multiple choice, behaving as the [feedback contract](references/feedback-contract.md#responses-resets-and-drafts) says.
- Every item with Options marks exactly one recommended, with its reason. The reviewer still makes the pick.
- Each item shows its door (one-way or two-way) and effort.
- Comments sit on each item and on each Option, unselected Options included.
- The reflection block, **Before you approve**, sits above the Next action, through lenses such as security, operations, information architecture and accessibility.
- The Next action offers only the allowed Next actions, preset as the [feedback contract](references/feedback-contract.md#next-action-and-approval-decide) says.

**`explain`** teaches decisions someone else already made, with no picks: follow [explain mode](references/explain-mode.md).

_Done when_ every item carries its mode's controls, and the page holds its mode's blocks: Before you approve and the Next action in `decide`, reflection and Questions? in `explain`.

## 6. Hand back the feedback

Apply the [feedback contract](references/feedback-contract.md): Copy prompt and Save carry the reviewer's responses and comments back to you, verbatim, with no server.

_Done when_ the page names its [feedback file](references/feedback-contract.md#save) or the caller's destination.

## 7. Deliver and verify

The page loads with no network: inline all CSS and JavaScript, embed every asset, and draw diagrams as inline SVG.

### Page contract

The page carries these attributes; everything else on it is yours to shape.

- `<html>`: `data-page-id`, a lowercase slug stable across revisions; `data-revision`, a positive integer from 1; `data-mode`, `decide` or `explain`; `data-offline="partial"` only on the [diagram fallback](references/diagrams.md#fallback-without-a-browser-tool).
- Each item: `data-item`, a stable id unique on the page; `data-fidelity`, `diagram`, `wireframe`, `mock` or `prototype`; `data-depth`, `simple`, `detailed` or `both`. In `decide`, its reset button carries `data-reset` and clears only that item.
- Each Option, inside its item: `data-option`, a stable id unique in its item; `data-recommended`, `true` or `false`.
- Each `<script type="text/x-mermaid">`: `data-diagram`, a unique name; the script holds the diagram's source.
- Each `both` item's depth toggle: `data-depth-toggle`, exactly one per `both` item, on the control that reveals the detailed layer; none elsewhere.
- Once per page: `data-reflection` on the reflection block, in `decide` above the Next action; `data-copy-prompt` on Copy prompt; `data-save` on Save, which downloads the feedback file.
- Once in `decide`: `data-next-action` on the block holding the `<select>` or radio inputs that choose the action; `data-reset-all` on Reset all.
- Once in `explain`: `data-questions` on the Questions? block, holding the editable `<textarea>` for the reader's questions.
- Optional: `data-visual` on the visual a comment is about. Without it, the grader takes the largest `svg`, `img`, `canvas`, `video` or `iframe` in the comment's Option, else in its item.

### Grade and hand over

Run the grader only on what is already installed: from this skill's folder, run `node scripts/grade-page.ts <page.html>`. When it cannot resolve a package or a browser, name it unavailable and go on, installing and fetching nothing for it (`npx` included). It prints each check's pass or fail as JSON; fix every failure. The grader proves mechanics, not taste: whether the page looks right and explains well is left to human review. Then run the [verification](references/verification.md) checks the grader cannot make.

Open the page with the platform's opener, then print three lines: the page's absolute path and its mode; the feedback file's name or the caller's destination; and how to continue: after Save, say "saved feedback"; after Copy prompt, paste the prompt into this or any agent session.

_Done when_ the grader passes or is named as unavailable, every check that could not run is named, and the person has the open page and those three lines.
