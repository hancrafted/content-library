# Content library

This project is a localized Next.js application which serves to visualize theory and content I use for training materials which are captured as YouTube videos for an English and German audience. The deploy target is static pages on Cloudflare Pages at hancrafted.net (`docs/features/hosting.md`).

## Rules

- Do not edit`CLAUDE.md`, it is a symlink to `AGENTS.md`.
- Always use `/commit` to commit, `/tdd` and `/code-review` for implementation.
- `/code-review` is the reviewer. `archgate check` is the ADR gate; `archgate:reviewer` findings are advisory: confirm each against the ADR text before acting.
- Save a pasted handoff verbatim to `.scratch/<feature>/handoff.md` before starting; review agents read that file as the spec.
- Use `npm run verify` frequently to verify that the changes are correct.
- Binding decisions live in Archgate ADRs under `.archgate/adrs/`.
- Start with `.archgate/adrs/FE-004-slide-architecture.md` for the architecture map.
- `docs/agents/` holds method and procedure, product-agnostic. Feature reference (Episodes, Context drawer, Translation keys) lives in `docs/features/`.
- An ADR's `files:`/`paths:` name where authors of governed code work, two or three globs, and cover every file its checks fire in. Compliance names kinds of enforcer (types, lint, tests), not config files.
- For any /grill-with-docs and /wayfinder, using the /grilling skill read the `docs/agents/grilling-format.md`, which overwrites the grill format. Analog for voice sessions read `docs/agents/grilling-voice.md`.
- Skills: author a new one in `skills/<name>/`, symlinked from `.claude/skills/` and `.agents/skills/`, with `/writing-for-agents`, then review it once with `/skill-creator:skill-creator`. The format and gate are in `docs/adr/0006-skills-follow-agentskills.md`.
- Worktrees: `npm run wt:new -- <branch>` and `npm run wt:done -- <branch>` (the `worktree` skill). They override any worktree path a handoff names.

## Testing

- Visual checks: `npm run inspect-page` (the `visual-check` skill) prints DOM numbers; prefer them, and read at most one image per iteration.
- Chrome tools: load with `ToolSearch` `select:mcp__claude-in-chrome__…`; regex tool search cannot see them. `list_connected_browsers` returning `[]` means the extension is signed out: ask the user to re-auth. Several browsers and none selected: ask, then `select_browser`. Still blocked: `visual-check`.
- Browser checks of GSAP motion (the landing hero): a background or occluded tab never fires `requestAnimationFrame`, so the animation stays paused and any window resize finishes it by design. Bring the tab to the front before judging motion; DOM counts (`[data-task-paper]` opacity, `[data-completed-papers]`, `[data-overflow-papers]`) verify the mechanics without it.

- `*.test.ts` is the fast suite in `npm run verify`; `*.build.test.ts` needs `out/` and runs only via `npm run test:build` after `npm run build`; `*.browser.test.ts` drives a real browser and runs only locally via `npm run test:browser` (pre-push runs it when a push touches its paths), never in CI. Keep the vitest configs split — `verify` must stay fast and must not require a build.

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
