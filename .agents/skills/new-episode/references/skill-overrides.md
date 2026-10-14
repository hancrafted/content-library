# Skill overrides

Where a vendored third-party skill disagrees with this repo's ADRs, the ADR wins. A job that lists a skill below applies that skill's lines here, and its reviewer judges against them. A finding a skill's rules raise against an override is advisory.

## vercel-react-best-practices

- Use no state or data library (SWR, nuqs, zustand): FE-001.
- Keep `next/dynamic` with `ssr: false` inside `*.client.tsx` only, and use no `use server`, `after()` or `next/cache`: FE-005, FE-006.
- Add no inline script beyond FE-001's pre-paint theme script.
- Keep every Slide folder-isolated (FE-007 section 5); a Scene's internals are ungoverned (FE-007 section 4).
- Skip the `async-*` and `server-*` rules, except `server-serialization`.
- Apply the `rerender-*`, `js-*` and `rendering-*` rules in `*.client.tsx` leaves only.

## web-design-guidelines

- Keep app state in the path or hash, never a query parameter: FE-001.
- Derive the locale from the path, never from `Accept-Language`: FE-003.
- Apply the copy-case rules (Title Case, "&") to English copy only; German is sentence case.
- Put `overflow-x-hidden` on the page root only: FE-009 section 3.

## performance-optimization

- The site is a static export on GitHub Pages: no server, no response headers, no image optimizer (FE-005).
- Skip the backend, database and caching sections.
- Size images by hand before they enter the repo.
- Keep Lighthouse and `lhci` out of `npm run verify`; measure with `npm run inspect-page`.

## visual-check

- A ticket whose design answer names a `Reference:` page image reads that image once, then one screenshot per iteration, as the skill says; the page is the target, the screenshot what was built.
- Clip the screenshot to the Slide (`--clip '[id="<section>--<slide>"]'`), so the pair compares one Slide to one page.

## impeccable

- A finding outside the rules `.impeccable/config.json` leaves enabled is advisory.
- Change colour, font, size and weight through FE-011 tokens.
- Scene markup, layout and shape findings are ungoverned (FE-007 section 4).
- Run `npx impeccable detect` only; install no hook and no skill (`npx impeccable install` stays unused).
