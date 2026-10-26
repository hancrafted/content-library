---
type: design-adr
status: proposed
---

# The token usage lookup is experimental

The dev-only token editor's "Find usage" button lists the elements in view that use a token. It lives in one folder, `src/shared/components/design-system-token-editor/token-usage/`, which the editor root reaches through a single `rowAddon` prop. It ships as an experiment: useful for a review session, not yet a feature to rely on. This record keeps why it is allowed to be approximate, and what would end the experiment.

## Why it is approximate

A stylesheet does not say which elements use a custom property, and the browser offers no reverse lookup. The lookup therefore measures instead of reading: wrong answers are possible, and each is named below.

- **It is dev-only.** It renders only under `next dev`, so no visitor sees it and `out/` never carries it.
- **No marker convention is required for it.** Han decided that markers would drift under maintenance, so nothing on a Slide has to be added for the lookup. It reads the `data-slot`, `data-slide`, `data-section` and `data-testid` attributes that already exist, only as labels, and falls back to the tag name.

## How it works

For one token, the lookup samples the computed style of the elements in view, sets the token on its carriers to a sentinel value (a colour or a length, by token kind), samples again, and restores the token in the same frame so nothing is painted. An element whose sampled properties changed uses the token, and the changed properties are what the list shows. Only elements in view are sampled.

## Removal

Delete `src/shared/components/design-system-token-editor/token-usage/` and the `rowAddon={usageRowAddon}` prop (with its import) in `token-editor.client.tsx`. `carriers` stays exported from `src/shared/lib/page-tokens.ts`; the editor itself uses it.

## Open hardening points

1. **Token kind is guessed from the name prefix.** Unknown families (`--space-*`, `--shadow-*`, `--motion-*`) get only the colour and length sentinels. Classify by value instead.
2. **No guard test for a global token that gets a sentinel.** Add a test that every global token in `globals.css` receives one.
3. **A fixed sample of about 40 properties.** It misses `gap`, `margin`, `width`, `height`, `outline-width`, `stop-color` and `stop-opacity`.
4. **Slide-token selectors that `querySelectorAll` cannot parse** (`:hover` and unusual forms) can throw. Wrap them in try/catch and report the token as not searchable.
5. **Label fallback without markers.** Use `aria-label` or `id`, then a short text snippet, then the tag.
6. **Inherent limits, documented not fixed.** Only what is in view is sampled (unmounted Slides are missed); uses that only apply on hover or focus are missed; tokens read once by JavaScript (canvas, GSAP) are missed; shadow DOM and iframes are not entered.
7. **Performance on very large pages.** There is no timing guard.

## Promotion criteria

The lookup stops being experimental when hardening points 1 to 4 are done and it has been used in a real review session without a wrong answer that point 6 does not explain. Until then, treat an empty or short list as a hint, not a proof.

## Related

- `FE-011` (design tokens): the tokens the lookup searches for.
- `docs/design/design-system.md`, "Design-system token editor".
