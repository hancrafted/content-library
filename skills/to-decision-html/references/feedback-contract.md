# Feedback contract

## Identity and revision

Carry a stable Spec identity, its location, its role and a revision identifier in the HTML and feedback. Keep a content fingerprint for each item and Option, covering what was reviewed, including visuals and behaviour. Changes to responses do not change these fingerprints.

Draft storage is scoped to the logical Spec, independent of the current revision, and isolated from other Specs and evaluation arms. Store the reviewed revision and fingerprints with the responses. Titles alone are not unique storage keys.

On refresh or explicit update:

- Restore unchanged items and Options normally.
- Preserve comments and former choices for changed or removed items/Options in a visible "needs review" record; require reconfirmation before treating a changed choice as current.
- An approval applies only to its reviewed revision. A changed Spec reopens it.
- New items start unanswered.

Guard storage reads, parsing and writes. Corrupt or unavailable storage must not disable editing or copying; show that draft recovery is unavailable and keep the current in-memory input. Browser-local drafts are not saved handoffs.

## Next action and approval

Derive a small set of allowed continuations from the originating conversation or workflow, such as re-grill, revise the Spec or approve implementation. Preset one recommended action and 1-2 editable sentences starting `(recommended by agent)`, naming the proposed skills. Keep the action's identity separate from the optional instructions. Changing the action clears the text instead of substituting another suggestion.

Show the consequence beside the handoff controls: **Save As accepts the selected Next action**, including a preset approval action, without another confirmation. Export approval of the exact reviewed revision when that action permits implementation; a missing additional comment does not withdraw it. Merely choosing decision-item Options, retaining a browser draft or resetting the form is not approval.

Copy prompt and Save As transport the same selected-action instruction and must state that returning their output to the agent accepts that action. Agent-recommended text must remain labelled as such, distinct from human comments. A restored approval from an older revision needs reconfirmation: on revision change, choose a non-approval continuation until the reviewer explicitly selects approval again.

Caller constraints win: omit approval actions the workflow does not allow and retain its Gates. Proposed skills are instructions for the receiving agent to consider, not commands executed by the page.

## Destination and revision

Display and export an absolute filesystem path, not a relative path or `file://` URL. For a generic Spec, propose `feedback-01.md` beside the HTML. Each page revision owns exactly one destination; repeated Save As replaces that file. When the agent updates the HTML, assign the next unused numbered filename and a new revision, preserving previous feedback even if its old file was never saved. Keep the assignment in the HTML, not just browser storage; a restored draft must not restore an older revision's destination.

The destination may be edited; browser JavaScript cannot write an arbitrary path, so Save As is the browser-controlled route to it. Existing workflow destinations and round allocation retain their own rules.

## Responses

Record item and Option IDs, not just display numbers or labels. Boolean responses have explicit yes/no choices; single-choice responses can be cleared; multiple-choice responses permit zero to many picks.

Capture the item comment and every Option comment, including comments on unselected Options. Preserve entered text exactly. A comment without a pick is feedback, not a skipped item. Export a distinguishable skipped state for untouched items. Do not demand a comment merely because no Option is selected.

Keep native typing, paste and composition working. Avoid intercepting paste or rebuilding focused fields when switching a preview. Persist input on native editing events; check programmatic insertion as well as manual typing. Keyboard focus, labels and reset controls remain usable.

Give per-item reset controls reset icons and visible labels stating what is cleared; they affect only their named item. **Reset all** asks for confirmation, clears current choices and comments, and restores the recommended Next action and its preset text. Preserve the feedback destination and historical reconfirmation records. Resetting is not approval.

## Copy as prompt

The default handoff is an AI-consumable prompt containing:

1. The instruction to save the complete received prompt verbatim to the absolute destination, without summarizing. Generic Specs allow replacement only of the file assigned to this exact revision; a mismatched existing revision is a stop, not permission to overwrite it. If Save As already wrote identical text there, the receiving agent reads that file instead of making another copy.
2. The exact Spec reference: identity, location, revision and relevant fingerprints.
3. Structured item/Option responses, verbatim comments, skips and reconfirmation records.
4. The caller's continuation instructions, selected Next action, agent recommendation and optional edited instructions, clearly distinguished. The action refines, rather than overrides, workflow constraints.
5. Revision-bound approval when conveyed by the accepted Next action; otherwise no claim of approval.

Use a delimited payload with reversible escaping, such as JSON strings, so quotes, newlines and pasted markup survive without being interpreted as prompt structure. Explain to the receiving agent: first save the received text 1:1, then read the exact referenced Spec. A missing or mismatched revision is a stop for affected feedback, not permission to guess or silently apply it to today's content.

The prompt needs no preceding chat, but it does require access to its referenced HTML. Do not repeat the whole Spec to simulate self-containment.

Give **Copy prompt** a copy icon and visible label. Only announce clipboard success after the browser confirms it. If clipboard access is unavailable, expose the complete prompt in a selectable field for manual copying. Success, failure and cancellation all preserve responses and drafts.

## Save As

Put **Save As** (save icon) beside Copy prompt. Both serialize the same complete handoff and never clear fields or drafts. On failure expose the copy fallback with the user's input intact.

Save As offers a browser save picker where supported, otherwise a download. Report only what the browser confirms: initiating a download does not prove a write to the proposed path. Saving elsewhere does not reassign the page revision's destination.

A saved file does not automatically wake the creating session: tell the reviewer to return with "saved feedback" and the path, and tell that session where to look.

## Workflow saving

When the caller supplies a save helper and feedback format, use those existing contracts. Show the effective destination and confirm successful writing before calling the feedback saved. A failed request leaves the input intact and exposes a copy fallback. A workflow may manage round allocation, archival and approval; this page does not infer those actions.

Keep this contract's response meaning in the workflow representation. If a caller's existing format cannot carry the requested responses, identify the incompatibility before authoring an incompatible replacement; obtain a scoped decision rather than silently dropping comments.
