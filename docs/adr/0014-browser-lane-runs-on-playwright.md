---
type: design-adr
status: accepted
---

# The browser lane runs on Playwright and grows from UI feedback

The browser lane (`*.browser.test.ts`) drove `chrome-headless-shell` over raw CDP from Vitest and passed by sleeping: 52 fixed waits in the Context test alone, about 60 of the lane's 115 seconds. It was not flaky against the built export, only slow and fragile, and it broke whenever its target Slide changed. The lane moves to Playwright Test, runs against the built export, waits only on the page, and holds only what a browser alone can prove: the Explorable explanation behaviours the user had to correct by looking.

## Decisions

1. **Runner.** Playwright Test, Chromium only, as its own runner; Vitest keeps the fast suite and the post-build suite, and `vitest.browser.config.ts` goes. Playwright's own Chromium serves the lane; `visual-check` keeps its `chrome-headless-shell`.
2. **Target.** The built export in `out/`, served on the preview port by Playwright's `webServer`, under one `baseURL`. The per-file URL overrides (`CONTEXT_WINDOW_URL`, `HITL_URL`, `A11Y_BASE_URL`) go.
3. **Files.** The suffix stays `*.browser.test.ts`: it names the lane, not the tool. An Explorable explanation's spec sits in its own `explorables/<name>/` folder; site-wide checks (accessibility, `spec-preview`) stay in `tests/browser/` and `skills/`. Specs keep ARCH-003's shape: three `describe` blocks and `// ARRANGE` / `// ACT` / `// ASSERT`.
4. **Scope grows from feedback.** The lane starts sparse. When the user corrects an Explorable explanation's behaviour (animation, Preset, state, layout) for the first time after looking at it, the agent proposes a browser test pinning the corrected behaviour and writes it once the user confirms. The test title states the behaviour in the user's words. Episode Slides and copy changes never trigger one. Logic that needs no browser goes to a `*.pure.test.ts`.
5. **Settled, not slept.** Every animating element of an Explorable explanation carries `data-motion="running|settled"`, set when its animation completes; one shared `settled()` helper waits on it. `data-state` keeps saying which state a visual is in. No spec sleeps: `eslint-plugin-playwright` makes `no-wait-for-timeout` and `prefer-web-first-assertions` errors over `**/*.browser.test.ts`.
6. **DOM numbers, not screenshots.** Specs assert boxes, attributes and computed styles against hand-written expected values. No `toHaveScreenshot`, no `toMatchAriaSnapshot`.
7. **When it runs.** Pre-push, as before, when a push touches the lane's paths. Nightly on `main` in GitHub Actions, plus `workflow_dispatch`: the job builds the export itself and caches the Playwright browser by version; a red run reaches the user as GitHub's failure email. Moving the lane onto every pull request is the user's call, with no fixed criterion; then pre-push drops its local build.
8. **Agent tooling.** A `playwright-cli` skill lets agents explore a page; specs are still written test-first under `/tdd`. Playwright's planner, generator and healer agents stay out.

## Migration

- `a11y`, `spec-preview` and `human-in-the-loop` port as they are; `human-in-the-loop` trades its 4 sleeps for `settled()`.
- The 38 Context browser tests shrink to those that pin a past user correction, each traced to its fix commit; their pure logic moves to `*.pure.test.ts`; the rest are deleted.

## Considered options

- **Vitest browser mode.** Rejected: it mounts components inside the browser and cannot load the exported pages, routes or the Context drawer.
- **Raw CDP with a hand-written `waitFor`.** Rejected: rebuilds the auto-waiting Playwright ships, and is ours to maintain.
- **LLM-at-runtime tools** (Stagehand, Midscene). Rejected: nondeterministic, which ARCH-003 forbids. `agent-browser`: no assertions and no clock.
- **Every Preset × every control.** Rejected: grows multiplicatively and brings the slow lane back. A loop over the Preset list was also set aside for the sparse start.
- **A fake clock (`page.clock`) to drive animations.** Kept out as the default: it fakes `requestAnimationFrame` and reaches GSAP only when installed before GSAP loads, and only in steps of 500 ms or less (GSAP's lag smoothing); it does not govern CSS animations.
- **Screenshot baselines.** Rejected: ARCH-003 bans snapshot matchers, and macOS baselines never match the Linux runner.
- **The lane on every PR now.** Deferred: nightly first shows how the lane behaves on the Linux runner without blocking a PR.

## Consequences

- A spec fails on what the page shows, not on how long it took; the lane gets shorter, and nightly proves it on Linux.
- A behaviour the user never corrected has no browser test; the lane is as complete as the feedback behind it.
- Explorable explanations gain a `data-motion` attribute to keep honest: a missing `settled` on completion hangs the spec until its timeout.
- A CI-only failure surfaces the next morning, not on the PR, until the lane moves to pull requests.
- `eslint-plugin-playwright` misses the stars signal of ARCH-001 (398; 42 contributors, 3.0M weekly downloads, released 2026-10-05), admitted because core ESLint has no rule for Playwright's waiting patterns.
- Enforcement: ESLint over `**/*.browser.test.ts`; ARCH-003's shape rules, once its globs cover `tests/browser/` and `skills/`; the feedback rule in `AGENTS.md`, held by review. ARCH-003 §4.2 ("CI opens no browser") needs amending by the user before the nightly lands. Research behind the tool choice: `.scratch/browser-tests/research.md` (local).
