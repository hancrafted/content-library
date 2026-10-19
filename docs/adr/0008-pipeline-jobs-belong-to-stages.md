---
type: design-adr
status: accepted
---

# Pipeline jobs belong to stages, and the pipeline is scaffolded before it is tailored

A new-episode `pipeline.yml` lists its Stages in order, `stages: [brief, setup, research, dossier, specification, build, pr]`, and every Job names the one it belongs to in `stage:`. The dashboard grouped Jobs into Stages by inferring them from job ids; the pipeline is the contract, so it now says. The pipeline is copied as a draft right after the Brief and tailored at the end of Setup, so every Job shows from the start; research Jobs exist only where retrieval asks for one; the Spec is local markdown; and the Build is one Job per Section. Issue #183.

## Decisions

1. **Stages in the schema.** Top-level `stages` is a required list of unique stage ids, and each Job carries a required `stage` naming one of them. The schema check (`src/lib/episode-pipeline.pure.ts`) refuses a missing, duplicate or unknown stage, and a Job that needs or wants a Job of a later Stage. A Stage may hold no Job: a per-run pipeline whose retrieval reused every research file has an empty Research Stage.
2. **The Run writes the draft; Setup closes by finalizing it.** `begin-run` copies the template to `docs/episodes/<slug>/pipeline.yml` with `status: draft`, `template:`, `<slug>` and both ports filled, so no Job scaffolds it (amended: `scaffold-pipeline` was a Setup Job, and its design-reference outputs moved into `customize-pipeline`). Then `categorize-research`, `retrieval` and `convert-references` collect what tailoring needs (`retrieval` and `convert-references` move into Setup; `categorize-research` and `retrieval` gain `isolation: worktree`, since they now run beside `convert-references`). `customize-pipeline` finalizes the file. _Amended:_ it was a human gate where Han approved the pipeline; the gate is removed, and `customize-pipeline` sets `status: approved` itself, its checks holding the pipeline.
3. **A draft per-run pipeline may keep `foreach` and glob outputs; an approved one has none.** The draft holds the template's fan-out Jobs unexpanded until `customize-pipeline` expands them, and the check refuses them only once `status: approved`.
4. **Research Jobs are lazy.** `retrieval` decides per research question: a fitting, fresh llm-wiki file is reused with no Job; a fitting file past its `stale_after` gets a refresh Job; no fit gets a new research Job. It records each decision in `research-plan.md` and lists the questions needing a Job under `## Research jobs`, one item per Job with its research folder. `write-research` has `foreach: docs/episodes/<slug>/research-plan.md#research-jobs` and needs `customize-pipeline`, which expands only those items, as `write-research-<question-slug>`. The research-jobs check (`src/lib/episode-research-jobs.pure.ts`) keeps the Jobs and the list in step, folder for folder, instead of one Job per Brief question. `write-dossier` needs `customize-pipeline` and wants `write-research`.
5. **The Spec is local markdown.** `write-spec` writes `docs/episodes/<slug>/spec/spec.md`, one h2 per Section, and `write-design-spec` writes `spec/design-spec.md`, both governed by markdown-harness rules and queried before writing. No GitHub spec issue or sub-issues: `write-design-spec` keeps its human gate, now Han's approval of the design spec file. `spec/` joins the staging list of design-ADR-0004. **Amended by design-ADR-0011:** the two spec files become one Spec, `spec/spec.html`, a static HTML page written by `write-spec` alone, which carries the human gate; `write-design-spec` is removed, and a contract test plus the `write-spec` rubric replace the markdown-harness rules.
6. **Build is one Job per Section.** `implement-episode-init` scaffolds the Episode page with one placement marker per Section, then `implement-section` with `foreach: docs/episodes/<slug>/brief.md#slides` expands to one `implement-section-<section-slug>` Job per h3 of the Brief's Slides, in parallel worktrees, each an implementor and reviewer pair. This replaces `implement-episode` and `implement-spec`'s hidden per-ticket fan-out. `open-pr` needs every Section Job.
7. **A placement marker is one module per Section.** `src/components/episodes/<ep>/sections/<section-slug>.ts` exports that Section's ordered Slide list, section slide first, and the Episode record imports the modules into `sections` in Section order. `implement-episode-init` writes each marker with the section slide alone; the Section Job `implement-section-<section-slug>` adds its page Slides to its own module only, so parallel Section branches never edit one line and merge without conflict. FE-002 and FE-004 admit the `sections/` folder.

## Ports

Each Build Job serves its worktree with `next dev` on its own port, and the dashboard links `http://localhost:<port>`, so Han previews a Section while it is built with no backend: `pipeline.yml` is the contract. Issue #184.

1. **`port` on a Job.** An optional whole number from 1024 to 65535. The template and the `begin-run` draft pipeline carry none; `customize-pipeline` writes them, so in an approved per-run pipeline every Job of the `build` stage but `implement-episode-init` has one. The port check (`src/lib/episode-pipeline-ports.pure.ts`) refuses a port in the template, a port on a Job outside the `build` stage, a port two Jobs share, 4382 (the dashboard's own dev port) and a `build` Job without a port once approved.
2. **A consecutive block from the first free port.** `customize-pipeline` probes ports from 4000 and gives each `implement-section-*` Job the next free one in Section order, skipping a busy port, `dev_port`, `spec_port` and 4382.
3. **The Run owns two servers.** _Amended:_ `begin-run` writes `dev_port: P` (the first free port from 4000, never 4382) and `spec_port: P+1` at the top of `pipeline.yml` and starts the dashboard dev server on P and the Spec server with watch on P+1, detached, each pid in `.scratch/<slug>/servers/<port>.pid`. `implement-episode-init` reuses `dev_port` and carries no `port`. The dashboard links `spec_port` once the folder is selected. `end-run` and `wt:done` stop both by pid file, and `npm run dev-stop -- <port>` stops one; no process the Run did not start is touched.
4. **A Section Job's agent starts its server detached**, `npx next dev -p <port>`, so it outlives the agent's session, and records its PID in `.scratch/dev-<port>.pid`. The `dev_port` server runs in the Episode's worktree and stays up for Han, showing each Section once merged. A Section Job's server lives only while the Job runs: the orchestrator stops it before `wt:done` removes the worktree it serves.
5. **The dashboard shows a Preview only while the server is meant to answer:** a Section Job's until it finishes `ok` or `reused`, the integration Job's once it has started. It never checks the server answers.

## Considered options

- **Infer Stages from job ids**, as the dashboard did: every new Job needs a dashboard change, and a one-off Job falls in no Stage. Rejected.
- **A top-level map of Stage to job ids** instead of `stage` on each Job: the grouping then lives apart from the Job it describes, and every expansion in `customize-pipeline` edits two places. Rejected for cohesion: a Job carries its own grouping, and the list fixes the order.
- **Keep one research Job per Brief question**, ended `reused` when retrieval reuses: the dashboard shows Jobs that run no agent. Rejected.

## Agent-decided (contest in review)

- The names `implement-episode-init` and `implement-section-<section-slug>`, and the stage ids.
- `customize-pipeline` needs `retrieval` but only wants `convert-references`, so a missing conversion tool still leaves the design references out instead of blocking the Episode, as before.
- The `implement-section` reviewer runs in the orchestrator session: `code-review` spawns subagents, which a subagent cannot.
- A refresh Job writes a new numbered research folder, because the research-folder check refuses an ID used twice (see Open).
- `implement-section-<section-slug>` takes its slug from the Brief's Slides h3 title in kebab case, since `customize-pipeline` runs before the Dossier exists, and `implement-episode-init` names each Section's placement marker by the same slug, never the Dossier h2's `{#slug}`, so a job id always names the marker it owns.

## Open

- ~~Does `spec/` move to the code folder at Promotion, or get deleted with Staging?~~ Settled by design-ADR-0011: Promotion moves the Spec's words into `slide.md` and the Spec is deleted with Staging.
- Whether a refresh Job overwrites the llm-wiki research file or writes a new numbered one.

## Consequences

- The GitHub label gate goes: every `gate: human` Job of the template names an output Han approves, so `episode:status` asks `gh` nothing, and a gate Job with no output stays `gate`.
- An agent's `ticket` block goes with `implement-spec`'s per-ticket fan-out: the schema check refuses it, `implement-spec` no longer counts as a skill that spawns subagents, and the skill-use check lists no ticket subagent's skills. The dashboard still reads a `ticket` block in an old pipeline, and the run log still parses a `ticket` field and the `/#<ticket>` spawn suffix, so a Run logged before this change keeps its ticket lanes.
- A per-run pipeline committed before this change lacks `stages` and fails the schema check; none is committed today.
