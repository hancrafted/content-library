# Artifact verification

Use the repository's existing browser and inspection tools, or a temporary browser script. No external evaluation framework or product browser suite is required.

## Mechanical checks

Check the delivered HTML, with networking disabled, at desktop and landscape-tablet widths. Exercise its actual controls; an isolated mock is not the review page.

| Action                                                          | Required observation                                                                                                                                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Open the delivered file offline                                 | Visuals, controls and feedback operate without external assets or runtime CDN requests.                                                                                                                           |
| Navigate all review items                                       | IDs resolve uniquely; the displayed Option is identifiable separately from choices.                                                                                                                               |
| Select, deselect and reset                                      | Boolean, single/multiple choice and per-item reset behave as declared; untouched items export as skipped.                                                                                                         |
| Focus and paste into each comment type                          | Exact multiline text, including quotes and non-ASCII text, appears in the intended field and reaches the exported payload unchanged.                                                                              |
| Use preview tools while editing                                 | Focus/text are retained; the relevant visual remains visible while commenting, including long content. Measure viewport intersection and inspect whether the useful subject, not merely an edge, remains visible. |
| Reload with a draft                                             | Choices and item/Option comments survive; other Specs and evaluation arms do not inherit them.                                                                                                                    |
| Replace the served HTML with a changed revision and refresh     | Unchanged responses restore; changed/removed responses remain accessible and flagged; changed choices and overall approval require reconfirmation.                                                                |
| Copy/export/save, including a rejected clipboard/save operation | Fields and draft remain intact. Success messages reflect the actual result; fallback text is available on failure.                                                                                                |
| Export all response states                                      | The prompt names the exact revision and destination, preserves every comment and carries caller and human next actions separately.                                                                                |
| Block or corrupt draft storage                                  | Editing and handoff still work, with a truthful recovery warning.                                                                                                                                                 |

Wait on observable states, not fixed sleeps. Inspect both themes when theme switching is offered. Verify keyboard operation, labelled fields, visible focus, contrast and absence of unintended horizontal overflow. For motion, verify purposeful states and reduced-motion behaviour without claiming a geometry test proves the effect looks liquid.

## Human checks

Read each item as its intended audience. Can they understand the decision and consequences from the visual? Are alternatives genuinely different? Is the recommendation explained? Does an analogy clarify rather than distort? Do before/after pictures tell the same story as the precise details?

Visual taste and explanatory usefulness need human judgment. Passing DOM checks is not proof of either.

## Report

Report the checks actually run and any failure or omitted check. Ordinary paste validation does not certify a specific operating-system dictation tool: actual-tool compatibility remains unverified until exercised. If tooling prevents a check, name the limitation instead of claiming a pass.
