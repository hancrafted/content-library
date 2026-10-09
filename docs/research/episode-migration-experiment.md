# Episode migration experiment

Measures how well the Episode architecture guides an agent: the same handoff runs against successive designs, and the diffs show what the guidance changed.

## Runs

| Run | Date       | Agent             | Design                                                                                    | Result                                                                |
| --- | ---------- | ----------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | 2026-10-09 | Gemini            | `context.ts` per Episode, hand-built anchors                                              | `df25149` (maintaining-markdown-for-ai), `743eeea` (ai-token-economy) |
| 2   | 2026-10-09 | Sonnet sub-agents | Slide-as-unit redesign                                                                    | `7196c88` (maintaining-markdown-for-ai), `45737ca` (ai-token-economy) |
| 3   | —          | Sonnet sub-agents | Authoring gaps closed: kit fields, `canvas/`, counted reading time, screenshot self-check | —                                                                     |

Hold constant: the handoff below, the source folders, the follow-up prompts. Run in a fresh worktree from `main`.

## Handoff (run 1, verbatim)

```text
/implement in a worktree, migrate /Users/han/Developer/coaching-content/src/maintaining-markdown-for-ai as an episode in this repo, called the same in episode/maintaining-markdown-for-ai

# Handoff: migrate "Maintaining markdown for AI" into content-library

## Goal
Port the attached HTML tower page (index.html, presentation.js, animation.css) into this repo as one Episode. Faithful = same Sections, Slides, wording and visual intent. NOT the same code. Purpose: stress-test the ADRs and the harness on a first full migration.

## Read first
AGENTS.md, GLOSSARY.md, FE-002, FE-005, FE-006, FE-007, FE-009, FE-010, docs/agents/episode-catalog-keys.md, and the reference Episodes (amnesiac-freelancer, page-template). Work with /tdd, /code-review, /commit. Run npm run verify && npm run build && npm run test:build before done.

## Source map (premises — re-check them)
- Each `.beat` <section> is one Slide. `data-section` + `data-section-title` give the Section. `data-assertion` is the Slide's claim. `data-beat` (S4.2…) is the source id.
- 7 Sections, 12 Slides. S1.1 is the Title slide. There is no S7: keep the order, renumber.
- `[data-speaker-notes]` holds prose notes. `[data-voice-script]` holds the prose voice script.
- Video id `YxCVw4bUbW0` (from TALK_VIDEO_ID).

## Settled
1. Slug `maintaining-markdown-for-ai`. Kebab-case Section and Slide slugs from their titles (FE-002).
2. English text moves verbatim into en.json under the catalog-key doc. Nothing inline.
3. German is written fresh from the same facts, not translated (FE-010).
4. Each animated Slide becomes a server Slide plus a leaf `*.client.tsx` for its motion (FE-006). Keep the logic in `*.pure.ts`. Respect prefers-reduced-motion as the source does.
5. Visuals rebuilt inside the FE-009 Slide wrapper on the Slide master scale. Match layout and colour language (primary = machine, secondary = human, accent = AI) using site tokens, not daisyUI classes.
6. Drop the theme picker, presentation mode, keyboard shortcuts, custom TOC progress bars, Google Fonts: the site already owns these, or they are banned.
7. Store only the YouTube id in `youtube`. Do not build an embed: that decision is still open.

## Open — ask me, do not guess
- Speaker notes: the source is prose. FE-010 needs title/caption items, targeting `<slide anchor>--<element>`. Propose condensed items plus targets per Slide and show me before wiring up. Keep the full prose somewhere only if an ADR allows it.
- Voice script: the source has no time marks, cue words, words … (truncated in the original paste)

## Report
… /de, every ADR gap and friction found (the real output test): for each, the rule, the file, what blocked you. Do not "fix" an ADR to make the port pass.
```

## Run 2 read-first

The handoff's read-first list changed in the slide-as-unit refactor. For run 2, the agent reads:

- `docs/agents/episode-translation-keys.md` (replaces `docs/agents/episode-catalog-keys.md`).
- `docs/agents/episode-migration.md` (new): the conversion recipe.
- FE-002 (rewritten around the Slide as the unit), plus FE-006, FE-009, FE-010.
- `src/components/episodes/page-template/` (minimal copy source) and `src/components/episodes/slide-layouts/` (every Slide layout rendered).

## Run 3 read-first

Run 2's handoff, changing only the read-first list (the updated `docs/agents/episode-migration.md`, `docs/agents/episode-translation-keys.md`, FE-002, FE-003, FE-006, FE-010) and adding the screenshot self-check in both themes (migration step 9). The orchestrator does the final review in Chrome, screenshots as fallback (step 10).

## Follow-ups (run 1)

1. The agent asked to confirm its plan; confirmed.
2. The first pass was not faithful. Prompt: open the browser and compare the current implementation with the previous one (the source tower page), then close the gaps.
3. After maintaining-markdown-for-ai was accepted: "repeat the same for the other one" (ai-token-economy).

## Comparing

- `git diff df25149 <run-2-commit> -- src/components/episodes/maintaining-markdown-for-ai/`
- Count: files touched outside the Episode folder, questions the agent asked, ADR gaps it reported, fix-up rounds until faithful.

### Run 3 against run 2

Per Episode, against the `experiment/migration-run-2` worktree:

| Metric                                                                                                                                                        | Run 2 | Run 3 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----- |
| Files touched outside the Episode folder                                                                                                                      |       |       |
| Workarounds: `t.raw`, `as` casts, own locale keys or kit aliases, client buttons for links, raw colours without a dark value, hand-written anchors or minutes |       |       |
| First-draft lint failures the agent reported                                                                                                                  |       |       |
| Lines, files, tests                                                                                                                                           |       |       |
| Folder shape (`slides/`, `canvas/`, `client/`); do the two agents agree                                                                                       |       |       |
| ADR gaps the agent reported                                                                                                                                   |       |       |
| Visual review findings, light and dark                                                                                                                        |       |       |

Fidelity to the source stays Han's call.
