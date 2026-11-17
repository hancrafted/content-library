---
type: feature-guide
title: Hosting
stale_after: 2027-04-20T00:00:00Z
---

# Hosting

Read before touching a deploy workflow, `public/_headers`, `public/_redirects`, `SITE_URL`, or a page slug. The site is the static export in `out/`, served by Cloudflare Pages at https://hancrafted.net (the apex is canonical). No server runs.

## How it deploys

- **One build per commit** (`.github/workflows/ci.yml`, on every push to every branch; a PR shows the push run on its head commit as its checks). The `export` job builds `out/` with an empty `NEXT_PUBLIC_BASE_PATH` and `SITE_URL=https://hancrafted.net`, in the shape its ref ships: `LIST_UPCOMING_EPISODES` is unset on `main` (production lists no Upcoming Episodes) and `true` on every other ref (so `/episodes` lists and links Upcoming Episodes for review, `upcomingListed`). It uploads `out/` (hidden files included; kept 30 days on `main` for rollback, 1 day elsewhere) and outputs `changed`; it does not run the post-build suite. `changed` is the exit of `verify:needs-build` over the paths changed since the merge-base with `origin/main`, so a branch pushed without a PR works too. Every push builds, export input or not.
- **Post-build suite and the required check.** `build-test` needs only `export`: it downloads `out/`, runs `npm ci` and `npm run test:build` under the same env the build used. A final `gate` job named `build, post-build tests`, the context the `main` ruleset requires, needs both and runs `if: always()`; it fails unless both succeeded, so a skipped job never stands in for a pass.
- **Previews follow the push, not the event.** The `preview` job needs `export` and runs when `changed` is true, the ref is not `main`, the repository is this one and the actor is not Dependabot. It downloads `out/` and runs `wrangler pages deploy out --project-name=hancrafted` in the `preview` GitHub environment, at `<branch>.hancrafted.pages.dev` (a pushed branch, with or without a PR). A branch that changes no export input (docs, skills, tooling) gets no preview. A fork's or Dependabot's push builds and tests but gets no preview, because it has no Cloudflare secrets. Pages lowercases a branch alias and truncates it to 28 characters, so a long or mixed-case branch name previews at a shortened URL; the `preview` environment link on the run shows it. The preview may exist while `build-test` is red; a preview link goes to a client only once the run is green. A newer push cancels the older run, preview included.
- **Export inputs** live in one place: `EXPORT_PATHS` in `tools/verify/needs-build.pure.ts`, shared by pre-push and the `preview` gate. Add a path there when the build starts reading it; `needs-build.pure.test.ts` fails if `preview` stops being gated on `export`'s `changed` output or on `main`'s exclusion, or if `test:build` moves back into `export`.
- **Production** (`.github/workflows/deploy-cloudflare.yml`): it starts when CI completes on `main` and only when that run succeeded, so it waits for CI's run on the merged commit; a failed or cancelled CI run deploys nothing, and a newer merge cancels the older one's CI. It does not build: it downloads that run's `out/` (the build CI tested) and publishes it with wrangler in the `production` environment. Production is never cancelled mid-flight.
- **Rollback.** `workflow_dispatch` takes an optional `run-id`. Without it, the newest successful CI run on `main` is published; with it, that run's `out/` is (it must be a successful CI run on `main`, and its artifact must still be inside the 30 days). Redeploying an older run is the rollback.
- Secrets `CLOUDFLARE_API_TOKEN` (Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID` live in the repository settings.
- `public/_headers` sets long immutable caching on `/_next/static/*` and on `/art/*` (the content-hashed Scene art `npm run art` writes before every build, FE-005 §5), basic security headers, and `X-Robots-Tag: noindex` on every `*.pages.dev` host. It sets no Content-Security-Policy: the export has inline scripts, so a policy needs verifying first.
- `public/_redirects` is the home for slug-rename redirects (same host only). Pages cannot redirect one hostname to another there.
- `src/app/sitemap.ts` and `src/app/robots.ts` write `sitemap.xml` (hreflang alternates; pages come from the page catalogue, `PAGES` in `src/content-store/store.ts`, the ones whose treatment puts them in the sitemap, the same treatment `pageMetadata` reads) and `robots.txt` at build time, from `SITE_URL`.

## Temporary: the old github.io URLs

`.github/workflows/deploy.yml` still deploys to GitHub Pages, but only redirect stubs (`tools/deploy/redirect-stubs.ts`): one HTML per exported page with a meta refresh and a canonical to the same path on https://hancrafted.net. GitHub Pages cannot send a 301. `redirectStubPlan` alone decides which files of `out/` are pages; it keeps `404.html` and points it at the home page, so every unknown old URL lands there. Remove the workflow and switch Pages off (Settings, Pages) after a few months.

## Moving the domain

The origin `https://hancrafted.net` is written in these places; change them together:

- `SITE_URL` in the workflow-level `env` of `.github/workflows/ci.yml` (the build that production publishes) and `deploy.yml` (the stubs' target).
- The www redirect rule, the custom domains and the Search Console property in the Cloudflare and Google dashboards (manual steps below).
- The comment in `public/_headers` and the prose in this file and in `public/_redirects`.

Code reads the origin only from `SITE_URL` (FE-008 §3); the unit tests' literals are fixtures.

## One-time manual steps

1. Create the project: `npx wrangler pages project create hancrafted --production-branch=main`.
2. Dashboard, Workers & Pages, `hancrafted`, Custom domains: add `hancrafted.net` and `www.hancrafted.net`. The zone is already at Cloudflare, so DNS records are created for you.
3. Redirect www to the apex with a Cloudflare Redirect Rule (or a Bulk Redirect): zone `hancrafted.net`, Rules, Redirect Rules, when hostname equals `www.hancrafted.net`, dynamic redirect to `concat("https://hancrafted.net", http.request.uri.path)` with status 301 and query string preserved. `_redirects` cannot do this.
4. Web Analytics: dashboard, Web Analytics, enable for the Pages project (automatic injection). Cookie-free, no code change.
5. Let the first CI run on `main` that passes deploy, then check `https://hancrafted.net/`, `/de/`, `/sitemap.xml` and `/robots.txt`.
6. Submit `https://hancrafted.net/sitemap.xml` in Google Search Console, when that property exists.

## Renaming a slug

Add a line to `public/_redirects` for each locale, `/episodes/old/ /episodes/new/ 301` and the `/de/` pair, in the same change as the rename.
