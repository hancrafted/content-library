# Slide authoring context grill decisions (new-episode, run-2 step 2)

Settled with Han on 2026-10-13 in session 451b6f31, the grill for step 2 of `docs/handoff/new-episode-run-2.md`. It absorbs D11 (what the meaning colours may colour) and LEARNINGS 3 (importable motion). This file is the spec for the tickets listed under _Tickets_. Q numbers are the grill's.

`write-design-spec` (#118) reads the docs these decisions produce. It does not read this file.

## Meaning colours (D11)

1. Q1: `machine`, `human` and `ai` colour only an element that _is_ a machine, human or AI thing. A split with no such meaning (three cells, four quadrants) uses `foreground` or `primary`.
   - FE-002-episode-page Do 7 becomes "colour _only_ a machine/human/AI meaning with …". This is a manual review duty, because a lint cannot tell meaning.
   - Twelve Slide library files use the meaning colours today, mostly as cell accents (`grid-2x2`: `dot: 'bg-machine'`). Each is audited: real meanings stay, and decorative uses switch to neutral.
   - Run 1's `four-disciplines` copied the decorative use from `grid-2x2`.

## Medium and density

2. Q2: **Talk first** for now. The Slide is designed for the recorded talk: meaning shows at rest, and hover may add detail but never content. Reader first (hover and click carrying content) comes later. The guide records that as a dated line.
3. Q9: **A Slide stands on its own.** A reader who never hears the voice still gets its claim **at rest**, meaning a still frame with no pointer, nothing clicked and every motion finished. It may be as dense as a consultant's slide. Depth goes behind **progressive disclosure**, and disclosure holds depth, never the claim.
4. Q16: Disclosure surfaces, by depth:
   - **Popover:** a term or an aside, at most two lines.
   - **Context drawer:** evidence and sources, as Speaker notes.
   - **Modal:** one worked example, opened by a button. It is a native `<dialog>`, as FE-009-slide-wrapper-and-scene allows.
5. Q17: In run 2, a Slide's popover is copied from a Master slide that has one (`metro-map`, `horizontal-rail`, `horizontal-gantt`), and the placement maths stays in `usePopoverPlacement`. A shared popover part needs an FE-007-module-layering §5 amendment, because a Slide's `*.client.tsx` may not import `slide-shared/`. That is its own ticket and does not block run 2.
6. Q18: A Slide's title names its **topic**, and its caption states the **claim**. The Dossier h3 is also the table-of-contents entry (D6), so the title stays short.

## Motion (LEARNINGS 3)

7. Q3: A Slide's motion is **CSS only**, in the Slide's own CSS module: transitions, keyframes and scroll-driven `animation-timeline`. JavaScript motion (GSAP in a `*.client.tsx`) waits for an Episode that proves it needs it.
8. Q7: What starts a motion:
   - **By default,** one entrance when the Slide becomes active, keyed on `[data-zone='active']`, which `SlideMount` sets (`src/components/episode-page/slide-mount.client.tsx`). It replays on return, as FE-009 already accepts.
   - **Scroll-driven** (`animation-timeline`) only when the motion _is_ progress: a timeline, growth, a sequence. `vertical-sticky-years` is the worked example.
   - **Under reduced motion,** every motion rests in its final state.
   - FE-009-slide-wrapper-and-scene §6 is amended to name `data-zone` on `SlideMount` as a stable CSS hook. Renaming it becomes a breaking change.
9. Q8: A **Slide library motion** is a CSS module under `src/components/slide-shared/motions/`. The folder is empty today. A motion moves there when a second Slide needs it (D10, FE-007 Do 7). The staging check's `knownVisuals().motions` reads the file names in that folder. Still to verify before building: that a Slide's CSS module can `composes:` from `slide-shared/motions/` under the Next.js CSS-module setup and the dependency rules.
10. Q6, Q12: A Dossier Visual's `motion:` is a comma-separated list. Each entry is `none`, `local` or a library motion, and `none` stands alone.
    - `local` means motion written in the Slide's own folder, described in the Visual prose in viewer terms. It reuses the "Slide-local" sense in `docs/design/design-system.md`.
    - A Slide may mix both: `motion: reading-highlight, local`.
    - `write-dossier` proposes `none`, library motions, or `local` with a description. `write-design-spec` may overrule any of them, and the orchestrator writes the overruled value back (`write-design-spec-decisions.md` items 12 and 15).

## Style

11. Q11, Q15: An Episode's **style** may differ by Episode and audience, and stays consistent within one Episode. `docs/design/design-guide.md` holds a short list of **named styles**, each a few lines plus the audience it suits. It starts with **editorial** only:
    - type leads;
    - one diagram per Slide;
    - neutral surfaces;
    - `primary` marks the one thing to look at;
    - the meaning colours appear only for their meanings.

    A new style is added when an Episode uses one.

12. Q13: Han picks the style in the Brief, in a new `## Style` section: one line naming the style and the audience reason, settled in the Brief grill. `write-design-spec` writes the spec issue's visual language within it.
13. Q14: A style works within FE-011-design-tokens as it stands: Scene composition, Slide-local colours, illustration and motion. The typefaces, type scale and global tokens are the same in every Episode, and an Episode's `palette.css` keeps its FE-002 §7.3 limit.
14. Q19, Q21: Run 2's Episode is editorial. Its `brief.md`, checked out from the run-1 tag, gets this section at run-2 start:

    ```md
    ## Style

    Editorial: a mixed audience, from founders to people who only use ChatGPT, and consulting prospects;
    sober, self-explanatory Slides serve all of them and read as a consultant's work.
    ```

## Slide library and the design guide

15. Q4, Q10: `docs/design/slide-library.md` holds one `##` per Master slide with three lines:
    - _Shows_, a fact taken from the code;
    - _When_, when to use it;
    - _Motion_, its motion and which library motions it carries.

    A vitest fails when a Master slide folder and the headings differ. An agent drafts the _When_ lines from the code and from how earlier Episodes used each Master slide, and Han edits them at the PR. Library motions (decision 9) are listed in the same file. Item 7 of `write-design-spec-decisions.md` points at it in place of the missing `docs/design/README.md`.

16. Q5, Q20: `design-guide.md` gets two lists.
    - **Like this:** `markdown-in-ai-workflows` (`maintaining-markdown-for-ai`). It stands on its own at rest, with depth behind a modal and the Context drawer. Its meaning colours (Knowledge `ai`, Instructions `human`, Memory `machine`) break decision 1 and are not copied. The Episode is legacy and keeps them until it is next touched.
    - **Not this (run 1),** with `four-disciplines` as the example:
      - a Master slide with its text swapped, where the layout should come from the idea;
      - meaning hidden behind hover;
      - meaning colours used as decoration;
      - motion reduced to hover transitions.

      An agent drafts one line on why run 1 was underwhelming, and Han edits it at the PR.
17. `GLOSSARY.md` gets **Slide library** and **Master slide**, worded as in `write-design-spec-decisions.md` item 14, with _Avoid_: catalog. `design-system.md` swaps its "Out of scope" section for a **Motion** section holding decisions 7–9, which points at `slide-library.md` for the library list.

## Tickets

Each ticket runs through `tdd` (where it changes code), `code-review` and `commit`, on a branch from `main` with its own PR. `docs/design/*.md`, `GLOSSARY.md` and `brief-grill/SKILL.md` are in the Claude Desktop project list (`.agents/skills/claude-project-context/assets/files.md`), so those PRs end with the re-upload paths.

| Ticket                                                                                             | Decisions         | Blocks      |
| -------------------------------------------------------------------------------------------------- | ----------------- | ----------- |
| [#127](https://github.com/hancrafted/content-library/issues/127) Slide authoring docs              | 2–4, 6, 11, 15–17 | #118, run 2 |
| [#128](https://github.com/hancrafted/content-library/issues/128) Meaning colours                   | 1                 | run 2       |
| [#129](https://github.com/hancrafted/content-library/issues/129) CSS motion                        | 7–10              | #118, run 2 |
| [#130](https://github.com/hancrafted/content-library/issues/130) A `## Style` section in the Brief | 12, 14            | run 2       |
| [#131](https://github.com/hancrafted/content-library/issues/131) Shared popover part (needs Han)   | 5                 | nothing     |
