# Setup

Run once per project, and again whenever a skill was installed or removed: `node scripts/drive.ts setup` from this skill's folder, at the project's root (`--agent-type <type>` and `--model <model>` seed a new Binding only). It is idempotent and prints each file it wrote, or that `docs/drive/` is up to date.

## What it writes

| File            | Setup's part                                                                                                                                                 | The Operator's part                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `binding.yml`   | seeds each phase with the installed skills it recognises, a model per phase and the agent type; later adds new skills                                        | every edit; `seen` keeps a removed skill from coming back        |
| `project.yml`   | seeds the base branch, the install command a lockfile implies, the parallel defaults and the `decisionDocs` globs it finds; later adds only missing sections | every value; preflight, lock and hooks are the Operator's to add |
| `enforcers.yml` | rewrites it each run from the project's manifests, hook folders and checkers                                                                                 | none: change the repo, then rerun setup                          |
| `profiles.md`   | the empty headings                                                                                                                                           | the project's rules per Profile                                  |
| `learnings.md`  | the empty file                                                                                                                                               | none: the Workflow appends                                       |

Skills are found in the skills lockfile and in the project's skill folders, authored ones first.

## The decision-doc guard

`drive guard [--against <ref>]` fails when a change touches a path listed in `decisionDocs` and the branch does not start with `decisions/<topic>` (which covers its Task branches `decisions/<topic>--…`), naming the file and the rule. Without `--against` it checks the staged changes, so it runs at commit time; with it, `HEAD` against its merge-base with `<ref>`, for CI. Setup wires it into the pre-commit hook, or into CI when the project has no hooks; check after setup that it runs. A Subagent that needs a Decision doc changed proposes it under **Terms** instead.

## Model presets

The skill ships one preset per phase, which setup seeds into a new Binding: `define` sonnet, `reason` opus, `implement` sonnet, `verify` opus, `evolve` sonnet; the larger model where judgement over design and review decides the outcome. Change a phase's `model` in `binding.yml` when experience shows its Subagents need more or less, and log why in `docs/drive/learnings.md`. The Orchestrator's own session override, when the Operator gives one, beats every preset for that session.

## After setup

Read the Binding with the Operator: a phase with no skill is done inline by the Orchestrator, and one skill may sit in several phases. Fill `profiles.md` with what is specific to this project, such as the rule that its ADRs bind or the extra branch types it admits.
