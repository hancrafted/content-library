# Content library

This project is a localized Next.js application which serves to visualize theory and content I use for training materials which are captured as YouTube videos for an English and German audience. The current deploy target are static pages on github pages.

## Rules

- Do not edit`CLAUDE.md`, it is a symlink to `AGENTS.md`.
- Always use `/commit` to commit, `/tdd` and `/code-review` for implementation
- Use `npm run verify` frequently to verify that the changes are correct.
- Binding decisions live in Archgate ADRs under `.archgate/adrs/`.
- An ADR's `files:`/`paths:` name where authors of governed code work, two or three globs, and cover every file its checks fire in. Compliance names kinds of enforcer (types, lint, tests), not config files.
- For any /grill-with-docs and /wayfinder, using the /grilling skill read the `docs/agents/grilling-format.md`, which overwrites the grill format. Analog for voice sessions read `docs/agents/grilling-voice.md`.
- Create worktrees in `.worktrees`. A worktree has no `node_modules`: symlink the main checkout's and exclude it in `.git/worktrees/<name>/info/exclude`. `next dev` refuses a second server while the main checkout's is running — preview a worktree with `next build --webpack && npx serve out -l 3100` instead; Turbopack panics on the symlinked `node_modules`.

## Testing

- Browser checks of GSAP motion (the landing hero): a background or occluded tab never fires `requestAnimationFrame`, so the animation stays paused and any window resize finishes it by design. Bring the tab to the front before judging motion; DOM counts (`[data-task-paper]` opacity, `[data-completed-papers]`, `[data-overflow-papers]`) verify the mechanics without it.

- `*.test.ts` is the fast suite in `npm run verify`; `*.build.test.ts` needs `out/` and runs only via `npm run test:build` after `npm run build`. Keep the two vitest configs split — `verify` must stay fast and must not require a build.

## Audiences

International English via YouTube — reach. German businesses for coaching and
consulting — conversion. They want different things from the same site, and the
locale split serves both: English canonical at the bare root so shared links
just work, German canonical at `/de` because search indexes locales separately
and German buyers arrive from German queries.

## How work arrives

Sessions run as voice brainstorms; the output is a copy-pasted handoff executed
by a separate agent — usually Gemini, sometimes Claude Code with browser access
for work needing more reasoning.

## Agent skills

### Issue tracker

Issues live in GitHub Issues for `hancrafted/content-library`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` at the root. When an engineering skill says "ADR", it means a **design-ADR**: it goes in `docs/adr/` with `type: design-adr` front matter. Archgate ADRs in `.archgate/adrs/` are separate, and engineering skills never write them. See `docs/agents/domain.md`.
