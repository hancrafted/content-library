# Artifact verification

The grader in `SKILL.md`'s deliver step already checks the page contract, offline loading, the mode's controls, a comment's byte-identical round trip through Copy prompt and Save, and that a denied copy, a failed save or a cancelled Reset all keeps input and claims no success, at 1440 and 1024 px. For everything else, use the repository's browser and inspection tools, or a temporary browser script.

## Mechanical checks

Check the delivered HTML, with networking disabled, at desktop and landscape-tablet widths. Exercise its actual controls; an isolated mock is not the review page.

| Action                           | Required observation                                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open the delivered file offline  | Visuals, controls and feedback operate without external assets or runtime CDN requests.                                                                                                                           |
| Navigate all review items        | IDs resolve uniquely; the displayed Option is identifiable separately from choices.                                                                                                                               |
| Select, deselect and reset       | Boolean, single/multiple choice and per-item reset behave as declared; untouched items export as skipped.                                                                                                         |
| Use preview tools while editing  | Focus/text are retained; the relevant visual remains visible while commenting, including long content. Measure viewport intersection and inspect whether the useful subject, not merely an edge, remains visible. |
| Reload with a draft              | Choices and item/Option comments survive; other decision pages and evaluation arms do not inherit them.                                                                                                           |
| Raise `data-revision` and reload | Responses start unanswered and the approval is gone; the earlier revision's feedback shows read-only.                                                                                                             |
| Export all response states       | The handoff names the page id, revision and destination, keeps every comment, marks untouched items skipped and keeps agent-preset text apart from the reviewer's.                                                |
| Block or corrupt draft storage   | Editing and handoff still work, with a truthful recovery warning.                                                                                                                                                 |

For the handoff controls, also exercise:

- The Next action starts on the recommended action with its `(recommended by agent)` sentences; changing the action clears them, including after a draft restores.
- Saving with an approval action selected exports approval of this revision, with no second confirmation.
- A confirmed Reset all restores the recommended action and its sentences.
- Save, Copy prompt and reset buttons keep visible, accessible names. The page says that Save accepts the selected Next action and names `<page-id>-r<N>-feedback.md`.

Wait on observable states, not fixed sleeps. Inspect both themes when theme switching is offered. Verify keyboard operation, labelled fields, visible focus, contrast and absence of unintended horizontal overflow. For motion, verify purposeful states and reduced-motion behaviour without claiming a geometry test proves the effect looks liquid.

## Human checks

Read each item as its intended audience. Can they understand the decision and consequences from the visual? Are alternatives genuinely different? Is the recommendation explained? Does an analogy clarify rather than distort? Do before/after pictures tell the same story as the precise details?

On an `explain` page, read each reflection prompt: it opens a question the decisions leave to the reader, and nothing on the page answers it for them.

Visual taste and explanatory usefulness need human judgment. Passing DOM checks is not proof of either.

## Report

Report the checks actually run and any failure or omitted check. Ordinary paste validation does not certify a specific operating-system dictation tool: actual-tool compatibility remains unverified until exercised. If tooling prevents a check, name the limitation instead of claiming a pass.
