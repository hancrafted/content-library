---
name: playwright-cli
description: Explore a page of the built export interactively with Playwright's own CLI — find controls by role, click them, read attributes such as data-motion and data-state. Use whenever an Explorable's controls, roles or state must be discovered by clicking, not measured; layout numbers and screenshots belong to visual-check.
---

# Playwright CLI

`npx playwright cli` ships inside `@playwright/test`: no extra package, no install. It keeps one browser open across calls, so each command acts on the page the last one left. Use it for interactive inspection; there is no automated browser suite. Playwright's planner, generator and healer agents (`init-agents`) stay out.

## Which tool

- Controls, roles, state after a click, `data-motion` / `data-state`: this skill.
- Boxes, computed styles, screenshots, light and dark: `visual-check` (`npm run inspect-page`).

## Explore

Serve the export first (`npm run build`, then `npm run preview` in the background; port 4300).

1. `npx playwright cli -s=<name> open http://localhost:4300/<path>/` starts a named session. Always pass `-s=<name>`, so parallel agents never share a browser.
2. `… snapshot` lists the page's accessibility tree; `… find "<text or --regex>"` searches it. Each node carries a ref (`e195`) and its role, e.g. `button "Context window" [pressed]`. The snapshot is also written to `.playwright-cli/`.
3. `… --raw eval "el => el.getAttribute('data-motion')" <ref>` reads one attribute from an element. Without a ref, `eval "() => …"` runs against the page; it can list every `[data-motion]` at once.
4. `… click <ref>` acts. Read the attribute again afterwards to see the change.
5. `… generate-locator <ref>` prints the Playwright locator for the element.
6. `… close` ends the session. `… close-all` and `kill-all` clear strays.

`--raw` prints only the value. Refs go stale after the page re-renders: take a new `snapshot` before reusing one.

## Example: the Context controls on `/episodes/explorable-explanations/`

```bash
npx playwright cli -s=probe open http://localhost:4300/episodes/explorable-explanations/
npx playwright cli -s=probe find "Context window"       # button "Context window" [pressed] [ref=e195]
npx playwright cli -s=probe --raw eval "el => el.getAttribute('aria-pressed')" e195   # "true"
npx playwright cli -s=probe --raw eval "() => [...document.querySelectorAll('[data-motion]')].map(e => e.getAttribute('data-motion')).join()"   # "rise"
npx playwright cli -s=probe click e195
npx playwright cli -s=probe --raw eval "el => el.getAttribute('aria-pressed')" e195   # "false"
npx playwright cli -s=probe close
```

## Record the observation

Report the control's role and name, the action and the resulting state. Check `data-motion="settled"` before judging a completed animation; do not infer completion from elapsed time.

`.playwright-cli/` is git-ignored scratch.
