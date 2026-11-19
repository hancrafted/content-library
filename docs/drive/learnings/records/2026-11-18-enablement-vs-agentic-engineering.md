---
workflow: enablement-vs-agentic-engineering
date: '2026-11-18'
fortify: skipped
skip-reason: 'skipp fortify'
---

# enablement-vs-agentic-engineering

The enablement-vs-agentic-engineering Episode.

## wrong-model-tier-decision-page

- **Evidence:** Han had to ask twice for an Opus Subagent for /to-review; the fidelity rule gave mid because every item sat at diagram
- **Evidence:** the second ask was redundant, the Orchestrator's reply said the page agent already ran on Opus, so the Operator could not see the tier (source: monitor)
- **Evidence:** Fortify offered an architectural option (a computed tier command); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed, no count raise (same Workflow)
- **Correction:** Han had to ask twice for an Opus subagent for /to-review ("use an opus subagent to do the /to-review"; "use opus subagent for it").

## grill-round-ignores-grilling-format

- **Evidence:** round 1 had no opening, buckets, wh-headlines, examples or numbering; AGENTS.md:19 names the format only for /grill-with-docs and /wayfinder; Fortify offered a quick win (widen the AGENTS.md line) and an architectural option (`grill.format` key in project.yml); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed
- **Correction:** Grill round 1 ignored docs/agents/grilling-format.md (opening, buckets, wh-headlines, examples, numbering).

## grilling-format-buckets-lack-knowledge-work

- **Evidence:** Slide-structure and matrix questions fit none of contract, architecture, workflow
- **Correction:** Fortify: grilling-format buckets are software-only (contract/architecture/workflow); knowledge-work grills need their own buckets, e.g. information architecture.

## visual-slides-page-starts-at-diagram-fidelity

- **Evidence:** review page round 1 was too low fidelity; Han asked for the Claude Desktop image and the repo diagram, one extra round; Fortify offered a quick win (review.md Fidelity line) and an architectural option (dispatch check on `slide` items); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed
- **Correction:** Review page round 1 was too low fidelity for visual Slides; Han asked for high-fidelity visualizations (Claude Desktop image, repo diagram).

## integration-pr-merged-before-code-review

- **Evidence:** PR #761 merged 2026-11-18 with 0 reviews; Verify review skipped; Fortify offered a quick win (draft PR until the review report) and an architectural option (required status `drive/review`); the Operator skipped picks on 2026-11-18 ("skipp fortify"), so it stays proposed
- **Correction:** PR #761 merged by Han before /code-review ran (Verify review skipped).

## detached-dev-server-exits-silently

- **Evidence:** `npx next dev` in background exited 1 with 'Errors: 1' and no reason; foreground worked
- **Correction:** The detached dev server start (`npx next dev` in background) exited 1 with "Errors: 1" and no message; a foreground start worked.

## subagent-draws-real-product-from-imagination

- **Evidence:** round 2 drew a Claude Desktop window and three terminals unseen; the Operator then sent four screenshots of the real app and tools, and round 3 redrew Slides 3 and 5
- **Correction:** slide 3 [Image #4] this si the curernt desktop showing my project. on top left we have projects, meetings, artifacts, schedule. on right we have instrcutions, memory and context. create the graphic in the center and show the content it left and right

## watching-drive-session-costs-transcript-lookup

- **Evidence:** the monitor found the file by listing the project folder, and misjudged the Subagent's elapsed time by an hour because the transcript's 10:30 was 11:30 local

## operator-skips-fortify

- **Evidence:** "skipp fortify" (2026-11-18), its seven entries stay proposed
