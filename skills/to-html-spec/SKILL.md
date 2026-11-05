---
name: to-html-spec
description: Turn documents, tickets or a grilled conversation into a standalone visual HTML Spec with structured human feedback. Use to create a visual spec, compare solution Options, or explicitly update an existing HTML Spec, including Episode design and architecture reviews.
---

# To HTML Spec

Make the decision understandable, then make responding easy. The output is one HTML file, not a production implementation or a fixed document template.

## 1. Establish the review

Read the supplied input and the caller's instructions. Set the audience, decision scope, output location, feedback destination and next action. A workflow supplies its destinations; otherwise propose a project-local handoff location and show it in the page, editable by the reviewer.

The default role is an **explanatory snapshot**. Only the user or caller can declare an **authoritative Spec**, or a **travelling Spec** that a workflow enriches across Jobs. For an explicit update, read the named HTML and retain its stable identities. The caller owns progression, persistence and approval rules; this skill never starts a Run or implements the reviewed proposal.

If a consequential gap blocks useful presentation, ask at most one short round in the repository's grilling format. When no format is supplied, use numbered questions, real alternatives and a recommendation, with "yes" accepting it. Ask about presentation or understanding, not facts you can read. For an analogy, offer three plausible choices when that would help. Then proceed with visible assumptions and unresolved decisions; authority and permission remain unresolved rather than assumed.

_Done when_ the role, audience, paths and unresolved decisions are explicit.

## 2. Compose the decisions

Give each review item a visible, numbered ID and a stable machine identity. Numbering may change; identity follows the decision. Distinguish supplied requirements, evidence and agent proposals, preserving source references. Explain technical meaning in plain language; disclose precise details rather than replacing them with an analogy.

Choose the rendering per item using [visual categories](references/visual-categories.md). Show before/after for changes, including fixes. Draw the actual relationships, states or proposed UI; label missing evidence and simulations. True alternatives differ in the decision, not just decoration.

The common shell is a header with purpose and scope, sticky item navigation and a scrolling review document. Add reviewer tools only where useful: preview width, theme, state or motion controls, for example. Follow supplied/project design guidance; otherwise use a restrained, readable style. Target desktop and landscape tablet, with basic responsiveness.

While the reviewer types, pastes or dictates feedback, the relevant decision visual must remain visible. Choose a layout that satisfies this at the intended viewport, including tall content and long comments. Viewing an Option and selecting it are separate actions.

_Done when_ every item has an identity and an appropriate visual, with feedback possible while viewing it.

## Workspace proposal

Optional guidance, not a requirement: try a centered visual with Option cards in a sticky right-hand rail, containing choices, explanations and comments. Collapse the left navigation to recover width. Use another arrangement when it better preserves simultaneous viewing and feedback.

## 3. Add review behaviour

Apply the [feedback contract](references/feedback-contract.md) to the authored HTML. Each item supports the suitable response type: boolean, single choice or multiple choice, initially unanswered. Provide deselection and per-item reset, comments per Option and per item. With two or more Options, mark exactly one recommended and explain why; a recommendation is not a preselected answer. An item without choices or comments is skipped.

Where an analogy helps, provide an independent show/hide button on that item and explain its limits. At the end, provide an optional **Next action** field and **Copy feedback as prompt**. Enable explicit overall approval only if the caller needs it; choices and saving never imply approval.

Use ordinary, labelled, editable textareas for comments. Preserve focus and selection through preview/tool changes; accept native insertion, paste and composition events. External dictation supplies text; the page records no audio.

Retain browser-local drafts through refresh and explicit HTML updates. Copying, exporting or saving leaves fields and drafts intact. Reconcile changed content by identity, keeping old feedback visible for reconfirmation rather than silently approving a new Option.

_Done when_ every review action, draft recovery and feedback handoff follows the contract, including failure paths.

## 4. Deliver and verify

Inline all runtime CSS and JavaScript. CDN tooling may be used during generation, but the delivered page needs no network to render or review; embed required visual assets too. Render diagrams ahead of time or embed their renderer. A snapshot needs no shared runtime, installed package or framework. A travelling Spec uses the caller's existing machinery and file contracts; preserve its Gates and external ownership instead of introducing a second lifecycle.

Perform [artifact verification](references/verification.md) against the delivered file, not only isolated previews. Report anything unverified, especially actual external-dictation compatibility and visual taste. Keep check scripts and inspection artifacts outside product code.

Open the HTML using the local platform's opener and print its absolute path or served URL. State its role, feedback destination and how to return feedback. An explicit update changes only the requested artifact; there is no background synchronization or universal revision archive.

_Done when_ the delivered file passes its mechanical checks, the user can open it and unresolved limitations are named.

## Manual evaluation

Only when evaluating or improving the skill, follow [manual evaluation](references/manual-evaluation.md). It holds the two frozen inputs, section-ablation procedure and feedback-to-grader loop. Ordinary Spec generation does not load it.
