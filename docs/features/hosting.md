---
type: feature-guide
title: Hosting
stale_after: 2027-04-20T00:00:00Z
---

# Hosting

Read before touching a deploy workflow, `public/_headers`, `public/_redirects`, `SITE_URL`, or a page slug. The site is the static export in `out/`, served by Cloudflare Pages at https://hancrafted.net (the apex is canonical). No server runs.

## How it deploys

- `.github/workflows/deploy-cloudflare.yml` builds with an empty `NEXT_PUBLIC_BASE_PATH` and `SITE_URL=https://hancrafted.net`, runs `npm run test:build`, and uploads `out/`; a separate `deploy` job runs `wrangler pages deploy out --project-name=hancrafted` in the `production` or `preview` GitHub environment, so the run page links the deployed URL. A push to `main` is production; a same-repo pull request is a preview at `<branch>.hancrafted.pages.dev`. A fork's or Dependabot's pull request gets no preview, because it has no Cloudflare secrets. Pages lowercases a branch alias and truncates it to 28 characters, so a long or mixed-case branch name previews at a shortened URL; the `preview` environment link on the run shows it.
- Secrets `CLOUDFLARE_API_TOKEN` (Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID` live in the repository settings.
- `public/_headers` sets long immutable caching on `/_next/static/*`, basic security headers, and `X-Robots-Tag: noindex` on every `*.pages.dev` host. It sets no Content-Security-Policy: the export has inline scripts, so a policy needs verifying first.
- `public/_redirects` is the home for slug-rename redirects (same host only). Pages cannot redirect one hostname to another there.
- `src/app/sitemap.ts` and `src/app/robots.ts` write `sitemap.xml` (hreflang alternates; pages come from `PAGES` in `src/lib/routes.ts`, minus the ones `isNoindex` marks, the same rule `pageMetadata` applies) and `robots.txt` at build time, from `SITE_URL`.

## Temporary: the old github.io URLs

`.github/workflows/deploy.yml` still deploys to GitHub Pages, but only redirect stubs (`scripts/redirect-stubs.ts`): one HTML per exported page with a meta refresh and a canonical to the same path on https://hancrafted.net. GitHub Pages cannot send a 301. `redirectStubPlan` alone decides which files of `out/` are pages; it keeps `404.html` and points it at the home page, so every unknown old URL lands there. Remove the workflow and switch Pages off (Settings, Pages) after a few months.

## Moving the domain

The origin `https://hancrafted.net` is written in these places; change them together:

- `SITE_URL` in the workflow-level `env` of `.github/workflows/ci.yml`, `deploy-cloudflare.yml` and `deploy.yml` (the stubs' target).
- The www redirect rule, the custom domains and the Search Console property in the Cloudflare and Google dashboards (manual steps below).
- The comment in `public/_headers` and the prose in this file and in `public/_redirects`.

Code reads the origin only from `SITE_URL` (FE-008 §3); the unit tests' literals are fixtures.

## One-time manual steps

1. Create the project: `npx wrangler pages project create hancrafted --production-branch=main`.
2. Dashboard, Workers & Pages, `hancrafted`, Custom domains: add `hancrafted.net` and `www.hancrafted.net`. The zone is already at Cloudflare, so DNS records are created for you.
3. Redirect www to the apex with a Cloudflare Redirect Rule (or a Bulk Redirect): zone `hancrafted.net`, Rules, Redirect Rules, when hostname equals `www.hancrafted.net`, dynamic redirect to `concat("https://hancrafted.net", http.request.uri.path)` with status 301 and query string preserved. `_redirects` cannot do this.
4. Web Analytics: dashboard, Web Analytics, enable for the Pages project (automatic injection). Cookie-free, no code change.
5. Let the first push to `main` deploy, then check `https://hancrafted.net/`, `/de/`, `/sitemap.xml` and `/robots.txt`.
6. Submit `https://hancrafted.net/sitemap.xml` in Google Search Console, when that property exists.

## Renaming a slug

Add a line to `public/_redirects` for each locale, `/episodes/old/ /episodes/new/ 301` and the `/de/` pair, in the same change as the rename.
