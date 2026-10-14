---
type: design-adr
status: accepted
---

# Skills follow the Agent Skills specification

Skills written for this repo follow the Agent Skills specification ([agentskills.io/specification](https://agentskills.io/specification)), so any harness that loads skills reads them unchanged. They live in `skills/`, apart from the installed skills that `skills-lock.json` owns. Then the path alone tells an agent whether a skill is ours to edit.

## Rules

1. **The spec decides the format.** `SKILL.md` frontmatter holds the spec's keys only: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. A harness-specific key such as Claude Code's `disable-model-invocation` stays out. Our skills can be invoked by the model.
2. **Authored skills live in `skills/<name>/`.** `.claude/skills/<name>` and `.agents/skills/<name>` are relative symlinks straight to `../../skills/<name>`. A skill that is not in `skills-lock.json` is authored and belongs in `skills/`. Installed skills stay in `.agents/skills/`, where their installer writes.
3. **Write with `/writing-for-agents`, then review once with `/skill-creator:skill-creator`.** The review covers what no checker can read: the body, the description's triggers, and the progressive-disclosure structure. Run its evals only when asked.
4. **markdown-harness and vitest are the gate.** `skills/markdown-harness.config.yaml` holds the spec's frontmatter rules, and `npm run check:skills` runs it with `--root skills`, so installed skills are never governed, not even by `mh query` or the Read hook. `skills/skills.test.ts` checks that each `name` matches its folder, which a field rule cannot. A skill adds its own `markdown-harness.config.yaml` only when it has markdown of its own to govern, and `check:skills` runs every one that exists.
5. **Pin the spec.** This ADR follows the spec as read on 2026-10-14, checked against `skills-ref` at commit `69ef37e`. When the spec changes, review the `agentskills-spec` rule against it.

## Considered options

- **Run `skills-ref validate` in `verify`**: this is the reference validator, but it runs on Python with `uvx` and fetches from GitHub, and CI has no `uv`. markdown-harness already gates our markdown and expresses every frontmatter check `skills-ref` makes. Rejected.
- **Spec rule in the root config** (`fileNames: [SKILL.md]`): `mh check` skips `.agents/`, but `mh query` and the Read hook would govern installed skills too, and `folders:` cannot recurse to fence it in. Rejected.
- **A config in every skill pinning `name`**: duplicated five times only to compare a field with a folder. Rejected for one test.
- **Allow named harness keys** (`disable-model-invocation`): this kept `new-episode` manual-only. Our skills are model-invocable by default, so the key was dropped. Rejected.
- **Move installed skills into `skills/` too**: then every installer update would fight the layout. Rejected.

## Consequences

- `new-episode` can now be invoked by the model, in Claude Code and in Codex (`agents/openai.yaml` drops `allow_implicit_invocation: false`).
- Prettier, ESLint and `tsc` now cover all authored skills. The sample Episode fixture is excluded from Prettier, which would rewrite its `[n]: <url> "title"` definitions.
