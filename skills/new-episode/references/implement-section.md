# implement-section

Output: one Section's page Slides in `src/`, built at its placement marker, merged into `episode/<slug>`. One job per Section, `implement-section-<section-slug>`, each in its own worktree and run in parallel; the job's `intent` names its Section. `<section-slug>` is the Section's h3 title under the Brief's `## Slides` in kebab case, the slug `customize-pipeline` expands the foreach by, and the same slug names the Section's placement marker, so the job id names the module it owns.

## Prompt

The implementor (`archgate:developer`) builds its Section of `docs/episodes/<slug>/spec/spec.md`, the h2 the job's `intent` names, test-first by `tdd`, and commits through `commit`. It skips `archgate:reviewer` and `archgate:lessons-learned`: the job's reviewer covers review, and the orchestrator writes `LEARNINGS.md`. `archgate check` still runs. Apply [`skill-overrides.md`](skill-overrides.md) to every skill the job lists.

- Build each page Slide of the Section in its own Slide folder and add it to the Section's placement marker ([`implement-episode-init.md`](implement-episode-init.md#placement-markers)) in spec order. Touch no other Section's marker or Slides: a sibling job builds them in parallel.
- On a retry, the failed lines go to a new implementor, quoted verbatim, as fix work in the job's worktree.
- Serve the Section for Han while the job runs: in the job's worktree, start `npx next dev -p <port>`, `<port>` the job's `port` in `pipeline.yml`, detached, so it outlives the agent's session: the harness's detached background mode, or `nohup npx next dev -p <port> > .scratch/dev-<port>.log 2>&1 & echo $! > .scratch/dev-<port>.pid`. A retry reuses the server already listening there. The orchestrator stops it before it removes the worktree; after the merge, `implement-episode-init`'s server shows the Section.

## Design answers

`design-spec.md` was approved at the `write-design-spec` gate: build each Slide to its design answer, its wireframe and its named parts, tokens, props and i18n keys; the answer's `master:` and `motion:` (already rewritten into the Dossier) are the ones to use. Build no layout the answer does not give, and ask no design question: a gap in the answer is a `Needs human:` line. A design answer naming a `Design reference:` page image is built against it: keep what its `Build against this page` line keeps, by [`skill-overrides.md`](skill-overrides.md#visual-check).

## Review

The reviewer runs in the orchestrator session and calls the Skill tool with `code-review` on the job's branch, base `episode/<slug>`, its subagents on the agent's `model`. Pass the Section of the spec and of the design spec to its Spec subagent with the lines under `## Rubric` beside it, and every `Design reference:` page image the Section's design answers name: for rubric line 4 it reads each page image beside a `--clip` capture of its Slide (`npm run inspect-page -- … --clip '[id="<section>--<slide>"]' --out <scratchpad>.png`), one pair per Slide. Then it makes one interactive Chrome pass over the Section (Context drawer, scroll, motion), the Episode's tab in front. With no connected browser it never blocks: it writes `Needs human: interactive pass skipped, no browser` and goes on. Each finding the Spec or Standards report marks hard is a failed line, quoted verbatim; a judgement call goes into Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). The first failure is the failed attempt.

## Visual check

The `visual-check` check, over the Section's Slides, in both themes, by FE-009's browser check. By the `visual-check` skill: serve `out/` with `npm run preview` in the background, then probe every Slide by its own `#<section>--<slide>` URL (an Episode mounts a Slide's content only near the viewport, so one page load measures every off-screen Slide as an empty box). Cover three widths, 375, 1100 and 1440 px, each with the Context drawer beside, over and closed, in light and dark:

```sh
npm run inspect-page -- --url http://localhost:4300/<episode path>#<section>--<slide> --theme light --width <w> --height 800 \
  --probe '[id="<section>--<slide>"]' …
```

Every Slide must have a `count` of 1, a wrapper box at least the viewport tall (the wrapper's "at least viewport height" is FE-009's only height rule, so a taller Slide is fine), no horizontal overflow, and a Foreground clear of the chrome; also probe its mounted descendants (`[id="<section>--<slide>"] *`) and require a `count` above 0. Record the numbers per Slide, width, drawer state and theme in the run-log entry's Checks, and log the `visual-check` result as a `check` Score with the failing numbers as `body`.

## Rubric

1. Every Dossier Voice script item of the Section's Slides appears verbatim as a Voice script segment of its Slide.
2. Every Slide uses the master and motion its Dossier Visual names (`none` is no motion), shows the Visual's `title:` when it has one and the Dossier h3 otherwise, and the table of contents shows the h3. Where the Visual's `title:` goes: the h3 is the Slide's `title` key in `i18n/<locale>.json` (the table of contents reads it), and the Visual's `title:` is a separate `heading` key in the same file, which the kit's `Title` renders in place of its children; a Slide without a `title:` has no `heading` key.
3. Every Speaker note of the Section's Slides in the Dossier appears in its Slide's notes.
4. Every Slide follows its design answer, with no layout, component or motion the answer does not give; a Slide whose answer names a `Design reference:` page keeps what the answer keeps from that page image.
5. The visual check ran at 375, 1100 and 1440 px, drawer beside, over and closed, in both themes, and its numbers show no overflow, wrappers at least viewport height and Foreground clear of the chrome.
6. The job changed no file of another Section.
