---
type: feature-guide
title: Hosting
stale_after: 2027-04-20T00:00:00Z
---

# Hosting

Read before touching a deploy workflow, `public/_headers`, `public/_redirects`, `SITE_URL`, or a page slug. The site is the static export in `out/`, served by Cloudflare Pages at https://hancrafted.net (the apex is canonical). No server runs.

## How it deploys

- `.github/workflows/deploy-cloudflare.yml` builds with an empty `NEXT_PUBLIC_BASE_PATH` and `SITE_URL=https://hancrafted.net`, runs `npm run test:build`, then `wrangler pages deploy out --project-name=hancrafted`. A push to `main` is production; a same-repo pull request is a preview at `<branch>.hancrafted.pages.dev`. A fork's pull request gets no preview, because it has no secrets.
- Secrets `CLOUDFLARE_API_TOKEN` (Pages: Edit) and `CLOUDFLARE_ACCOUNT_ID` live in the repository settings.
- `public/_headers` sets long immutable caching on `/_next/static/*`, basic security headers, and `X-Robots-Tag: noindex` on every `*.pages.dev` host. It sets no Content-Security-Policy: the export has inline scripts, so a policy needs verifying first.
- `public/_redirects` is the home for slug-rename redirects (same host only). Pages cannot redirect one hostname to another there.
- `src/app/sitemap.ts` and `src/app/robots.ts` write `sitemap.xml` (hreflang alternates, `noindex` pages left out) and `robots.txt` at build time, from `SITE_URL`.

## Temporary: the old github.io URLs

`.github/workflows/deploy.yml` still deploys to GitHub Pages, but only redirect stubs (`scripts/redirect-stubs.ts`): one HTML per exported page with a meta refresh and a canonical to the same path on https://hancrafted.net. GitHub Pages cannot send a 301. Remove the workflow and switch Pages off (Settings, Pages) after a few months.

## One-time manual steps

1. Create the project: `npx wrangler pages project create hancrafted --production-branch=main`.
2. Dashboard, Workers & Pages, `hancrafted`, Custom domains: add `hancrafted.net` and `www.hancrafted.net`. The zone is already at Cloudflare, so DNS records are created for you.
3. Redirect www to the apex with a Cloudflare Redirect Rule (or a Bulk Redirect): zone `hancrafted.net`, Rules, Redirect Rules, when hostname equals `www.hancrafted.net`, dynamic redirect to `concat("https://hancrafted.net", http.request.uri.path)` with status 301 and query string preserved. `_redirects` cannot do this.
4. Web Analytics: dashboard, Web Analytics, enable for the Pages project (automatic injection). Cookie-free, no code change.
5. Let the first push to `main` deploy, then check `https://hancrafted.net/`, `/de/`, `/sitemap.xml` and `/robots.txt`.
6. Submit `https://hancrafted.net/sitemap.xml` in Google Search Console, when that property exists.

## Renaming a slug

Add a line to `public/_redirects` for each locale, `/episodes/old/ /episodes/new/ 301` and the `/de/` pair, in the same change as the rename.
