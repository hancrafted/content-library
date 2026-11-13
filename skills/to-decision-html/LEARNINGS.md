# Learnings

What real uses of `to-decision-html` have taught about how its pages work, as opposed to what they say. Each lesson becomes a change to `SKILL.md`, a reference or the grader, checked with the evals. Read this file before improving the skill.

## Adding a lesson

Add one when the person faults the page's form: how picking works, how much text there is, how high above the details the decision is framed, the layout, the controls. Feedback on the content (whether an Option is right) goes to the caller as usual and is not a lesson.

Append a numbered entry under Lessons with four parts:

- **Title:** the failure in a few words, in bold.
- **What happened:** what the person said, quoted where possible.
- **Evidence:** the session id (`$CLAUDE_CODE_SESSION_ID` in Claude Code, otherwise the harness's session id, or `unknown`), the date, the page's path, and numbers measured on the page (words, items, Options, diagrams).
- **Proposed fix:** the rule in `SKILL.md`, a reference or the grader that should change, and how.

Commit the entry on its own with `/commit`, so it can be cherry-picked to `main` from any branch. Cite a lesson by its title, since numbers change when lessons are pruned. Delete a lesson once its fix lands, naming where it went in that commit's body.

## Lessons

1. **Picking an Option meant hunting for a radio button.** Han reviewed an `/improve-codebase-architecture` round: "picking an option requires finding the radio to click in a card among a sea of text. That should be more intuitive."
   - **Evidence:** session `5d29bb73-a311-444f-aeda-75218d59632b`, 2026-11-13, `.scratch/software-ecology/architecture/worth-exploring.html`: 17 items, 28 Options, 27 radio buttons, each inside a text-heavy Option card. `SKILL.md` step 4 says "Viewing an Option and picking it are separate actions" without saying how a pick should look.
   - **Proposed fix:** step 5 makes the pick a large, labelled target that is obvious at a glance, such as a "Pick A / B / C" segmented control at the head of the item, or the whole Option card as a toggle with a visible picked state. The grader checks that each pick control has a target of at least 44 × 44 px and a visible label.

2. **Too much text.** Han: "too much text."
   - **Evidence:** same session and page: 3,092 words of visible text across 17 items. 10 items had a depth toggle, yet the simple view still read as prose.
   - **Proposed fix:** the Depth section caps the simple view, for example at one sentence for the decision, three short lines for each Option and one visual. Everything else moves to the detailed layer. The reader-load text-density grader (#531) measures it.

3. **Code-level decisions stayed at code level.** Han expected the page to lift decisions about code to a high-level view with visuals: before and after framed as the principle applied (SOLID, decoupling, high cohesion) and why, so he can judge benefit, impact, cost and trade-offs instead of details. Options should read like "A: apply principle or design pattern X". The detailed view should then explain in depth, like a software engineering teacher, why it helps, what the principle means and where it comes from.
   - **Evidence:** same session and page: no diagrams (0 `svg`, 0 Mermaid), and Options named after code ("One beatsOf plan", "A startOf module", "Pure enterState and a useEnterState hook"). The Software architecture row in step 3 asks for "the responsibilities that move and the files affected", which pulls toward detail.
   - **Proposed fix:**
     - Step 3 says an item leads at the level the reader decides at. When the decision is about code, the simple view names the principle or pattern each Option applies, its benefit, its cost and its impact, with a before-and-after diagram. The detailed layer teaches the principle (what it means, where it comes from, why it helps here) and then gives the files affected.
     - The Software architecture row changes to match.
     - The skill stays free of domain knowledge: the caller supplies the principles, and the skill only demands that the page lead with them.

4. **A Slide preview stayed small on a wide screen.** Han: "for slide preview, the content area needs to be able to grow up to full HD width" when the screen allows it, such as an ultrawide.
   - **Evidence:** session `131efde1-89ad-4ae0-addb-29ed117700b3`, 2026-11-13, a `/new-episode` Spec, `docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/spec/spec-v2.html`: 28 items. At 2560 × 1440 the main column stops at 1192 px, 47% of the viewport, and the page sits centred with about 540 px empty on each side, so no Slide preview can grow past 1192 px.
   - **Proposed fix:** step 4 lets a visual with a design size, which the caller names (a Slide at 1920 × 1080), grow to that width when the viewport allows it: the main column's cap is the widest design size plus the rail, not a fixed reading width. The grader measures the widest visual at 2560 × 1440.

5. **Collapsing the navigation left a dead column, and a laptop had no room for the rail.** Han: on a laptop, toggling the navigation out "left a whitespace column of ca. 100px". A laptop should still leave over about 1000 px for the content, so the sticky decision and feedback rail fits on its right.
   - **Evidence:** session `131efde1-89ad-4ae0-addb-29ed117700b3`, 2026-11-13, a `/new-episode` Spec, `docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/spec/spec-v2.html`. At 1440 × 900 with the navigation collapsed, items start at x = 120, leaving a 120 px empty column. At that width the Option card spans the main column (1096 px) instead of sitting in a rail beside the content.
   - **Proposed fix:** step 4 says a collapsed navigation gives back all of its width, with only the page gutter left. At laptop width (1440 px) the content keeps at least 1000 px with the sticky rail beside it. The grader checks both at 1440 × 900 with the navigation collapsed.

6. **No quick way to the top or bottom of a long page.** Han asked for a scroll-to-top and scroll-to-bottom button floating at the bottom right, for example one circle split into a top half and a bottom half.
   - **Evidence:** session `131efde1-89ad-4ae0-addb-29ed117700b3`, 2026-11-13, a `/new-episode` Spec, `docs/episodes/what-lies-below-the-waterline-of-sustainable-ai-skills/spec/spec-v2.html`: 28 items and 125 text fields on one long page, with no control that jumps to the top or the bottom.
   - **Proposed fix:** step 4 adds a floating button at the bottom right, one circle split into "to top" and "to bottom", each half with its own accessible name. Under `prefers-reduced-motion: reduce` it jumps without smooth scrolling.
