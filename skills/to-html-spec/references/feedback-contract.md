# Feedback contract

## Identity and revision

Carry a stable Spec identity, its location, its role and a revision identifier in the HTML and feedback. Keep a content fingerprint for each item and Option, covering what was reviewed, including visuals and behaviour. Changes to responses do not change these fingerprints.

Draft storage is scoped to the logical Spec, independent of the current revision, and isolated from other Specs and evaluation arms. Store the reviewed revision and fingerprints with the responses. Titles alone are not unique storage keys.

On refresh or explicit update:

- Restore unchanged items and Options normally.
- Preserve comments and former choices for changed or removed items/Options in a visible "needs review" record; require reconfirmation before treating a changed choice as current.
- An approval applies only to its reviewed revision. A changed Spec reopens it.
- New items start unanswered. Reset affects only its named item, with an explicit label stating what is cleared.

Guard storage reads, parsing and writes. Corrupt or unavailable storage must not disable editing or copying; show that draft recovery is unavailable and keep the current in-memory input. Browser-local drafts are not saved handoffs.

## Responses

Record item and Option IDs, not just display numbers or labels. Boolean responses have explicit yes/no choices; single-choice responses can be cleared; multiple-choice responses permit zero to many picks.

Capture the item comment and every Option comment, including comments on unselected Options. Preserve entered text exactly. A comment without a pick is feedback, not a skipped item. Export a distinguishable skipped state for untouched items. Do not demand a comment merely because no Option is selected.

Keep native typing, paste and composition working. Avoid intercepting paste or rebuilding focused fields when switching a preview. Persist input on native editing events; check programmatic insertion as well as manual typing. Keyboard focus, labels and reset controls remain usable.

## Copy as prompt

The default handoff is an AI-consumable prompt containing:

1. The instruction to save the complete received prompt verbatim to the displayed destination, without summarizing or replacing an existing handoff.
2. The exact Spec reference: identity, location, revision and relevant fingerprints.
3. Structured item/Option responses, verbatim comments, skips and reconfirmation records.
4. The caller's continuation instructions and the reviewer's optional Next action, clearly distinguished. The latter refines, rather than overrides, workflow constraints.
5. Explicit overall approval if supplied; otherwise no claim of approval.

Use a delimited payload with reversible escaping, such as JSON strings, so quotes, newlines and pasted markup survive without being interpreted as prompt structure. Explain to the receiving agent: first save the received text 1:1, then read the exact referenced Spec. A missing or mismatched revision is a stop for affected feedback, not permission to guess or silently apply it to today's content.

The prompt needs no preceding chat, but it does require access to its referenced HTML. Do not repeat the whole Spec to simulate self-containment.

Only announce clipboard success after the browser confirms it. If clipboard access is unavailable, expose the complete prompt in a selectable field for manual copying. Success, failure and cancellation all preserve responses and drafts. If the chosen destination already exists, preserve it and request a new destination rather than overwrite it.

## Workflow saving

When the caller supplies a save helper and feedback format, use those existing contracts. Show the effective destination and confirm successful writing before calling the feedback saved. A failed request leaves the input intact and exposes a copy fallback. A workflow may manage round allocation, archival and approval; this page does not infer those actions.

Keep this contract's response meaning in the workflow representation. If a caller's existing format cannot carry the requested responses, identify the incompatibility before authoring an incompatible replacement; obtain a scoped decision rather than silently dropping comments.
