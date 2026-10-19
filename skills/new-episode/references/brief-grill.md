# brief-grill

Output: `docs/episodes/<slug>/brief.md`, ending at a human gate. A fresh reviewer judges it against its intents, and the user answers every failed line: they are the implementor's only source of words.

The grill is a dialogue with the user, so the implementor runs in the orchestrator's own session, where the user answers. The `brief-grill` skill is the whole procedure: the phases Frame → Explore → Settle → Self-check, writing the Brief, and the Brief template. Invoke `brief-grill` and `grilling` with the Skill tool, never read their `SKILL.md`: invoking loads each skill's own references. Follow `brief-grill` wherever `grilling` differs.

## Starting points

The user either brings a Brief or brings an idea. Accept the Brief when they have one; grill only when they do not.

- **An existing Brief**, from a voice session (pasted, or written by Cowork to `.scratch/<slug>/handoff.md`) or written elsewhere: save a paste verbatim to `.scratch/<slug>/handoff.md` first; that file stays the user's original. Copy it into the Episode worktree as `docs/episodes/<slug>/brief.md` by the skill's _Writing the Brief_ steps, dropping only the `<!-- save as … -->` line. Run the job's checks (`mh`, then `vitest`) and list every gap: each failed line, and each heading reading `Not settled.`.
- **A one-line idea, or nothing**: run the `brief-grill` skill from Frame.

## Episode Design Reference

When the prompt or Brief names a file (pdf, word) brought in as a model for the Episode (a deck, a sketch, a Miro slides export), copy it to `.scratch/<slug>/<file-slug>.<file-extension>`, the `<file-slug>` its subject in kebab case. Then add the Brief's optional `## Episode Design Reference` with one item per file, `[<title>](reference/<file-slug>/design-reference.md)`: a shape-only fix the Job's summary names with the file's original path. The `convert-references` job writes that path during Setup; until then the link has no target.

## Fixing a failed check

The Brief is the user's wording, so a fix changes shape, never words:

- **Shape only**: frontmatter, heading order, a list written as prose or the reverse, where every word stays. Fix it yourself and name each fix in the Job's summary.
- **Anything that changes a word**, and every `Not settled.` heading: put it to the user as a question, heading by heading as in the skill's Settle phase, and write their answer verbatim. Leave every heading they settled as they wrote it.

## Waiting on the user

Each question you put to the user, in the Settle phase or on a retry, opens a Gate span before you wait: `open-gate brief-grill han-reply`, and `close-gate han-reply` when they answer, so their thinking time stays apart from yours.

## Retry

The reviewer's failed lines go to the user, not to a rewrite: on attempt 2 and later, quote each failed line to them as a question, write down their answer verbatim, then run the checks and a fresh reviewer again.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop), then the reviewer passes. Beyond them:

1. Every heading holds the user's choice. A heading still reading `Not settled.` goes back to the user by name: the orchestrator refuses to start on it.
2. The Brief carries `status: draft`, a `generated: { by, at }` and a `process:markdown-harness` entry in `verified` (written after the checks and the reviewer pass), and is committed through the `commit` skill with `Gate: draft brief` before the user edits it.

Then close the Job with its summary, log the Gate's `start` for `draft brief`, and open the Spec for the user:

1. Run `npm run episode:spec-assemble -- <slug>`: the Spec holds the Brief as Slide cards and a Brief card (Learning goal, Actionables, Research questions, Style, Constraints), each heading with a note field keyed `brief--<heading-slug>`.
2. Open `http://localhost:<spec_port>` in the user's browser (`open <url>`) and print the URL; `spec_port` is in `pipeline.yml`.
3. Stop. The user saves notes on the page; each lands as a `brief--<heading-slug>` item in `feedback/<NN>/feedback.md`. Write each note verbatim into `brief.md` under that heading, commit with `Gate: draft brief`, and re-run `episode:spec-assemble`.
4. The user approves in chat, never on the page. Then run `node skills/new-episode/scripts/approve.ts docs/episodes/<slug>/brief.md` and commit it with `Gate: approved brief` and an `Agent: brief-grill` trailer; `verified` stays `human:han`. Re-assembling now renders the Brief card read-only.

## Rubric

1. The text under every heading except Episode Design Reference is the user's wording: `.scratch/<slug>/handoff.md` when it exists, their answers in this session, or a shape-only fix the Job's summary names.
2. No two sections of the Brief contradict each other, and no section contradicts itself.
3. Every sentence is one a downstream job acts on: a sentence that changes no job's output is noise.
