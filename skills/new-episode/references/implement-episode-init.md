# implement-episode-init

Output: the Episode's page in `src/`, on the integration branch `episode/<slug>`: its wiring, metadata, Title slide, section slides and one placement marker per Section, so the `implement-section` jobs that follow build in parallel without touching the same file. Built from the `Episode page` section of the approved Spec, `docs/episodes/<slug>/spec/spec.html`.

## Prompt

The implementor (`archgate:developer`) builds the Spec's `Episode page` section, test-first by `tdd`, and commits through `commit`. The approved Spec is the only source; the Spec Gate deleted the Dossier. It reads the `Episode page` section (route, metadata, registration, Title slide, placement markers, post-build step) and, for each section slide, the `<h2>` and `ol[data-spec="voice-script"]` directly under its `data-spec="section"`, each `<li>` one Voice script segment, verbatim, its `<strong>` the segment's title. The Slides inside are the Section jobs'. It skips `archgate:reviewer` and `archgate:lessons-learned`: the job's reviewer covers review, and the orchestrator writes `LEARNINGS.md`. `archgate check` still runs. Apply [`skill-overrides.md`](skill-overrides.md) to every skill the job lists.

- Scaffold the Episode by [episode-migration](../../../docs/features/episode-migration.md): steps 2, 3 and 7 for its slugs, folder, record, Translation files and page, and steps 4 and 5 for the Title slide and one section slide per Section only, as the Spec's `Episode page` and section entries give them.
- Write one placement marker per Section, by the [naming below](#placement-markers), in Spec order. Each holds that Section's section slide and no page Slide.
- Capture the post-build text: `npm run build`, then `npm run test:build`, and commit the written `tests/post-build/episode-text/<ep>.{en,de}.json`. The slug joins `PUBLISHED_SLUGS` only at publication.
- Serve the Episode for Han: in the Episode's worktree, start `npx next dev -p <port>`, `<port>` the job's `port` in `pipeline.yml`, detached, so it outlives the agent's session: the harness's detached background mode, or `nohup npx next dev -p <port> > .scratch/dev-<port>.log 2>&1 & echo $! > .scratch/dev-<port>.pid`. Leave it running when the job ends: the dashboard links it, and it shows each Section as it merges into `episode/<slug>`.

### Placement markers

Proposed, and open until Han settles it (design-ADR-0008): one module per Section, `src/components/episodes/<ep>/sections/<section-slug>.ts`, exporting that Section's ordered Slide list, which the Episode record imports into `sections` in order. `<section-slug>` is the Section's h3 title under the Brief's `## Slides` in kebab case, the one slug [`customize-pipeline`](customize-pipeline.md) gives the Section's job when it expands the `implement-section` foreach; never the Spec Section's `id`, which may differ. Its Section job adds its page Slides to that list alone, so parallel Section branches never edit one line, and its job id `implement-section-<section-slug>` names the module it owns. Should FE-002 or FE-004 refuse a `sections/` folder, the marker falls back to one commented line per Section in the record's `sections` array, and the merges are serialised.

### Metadata

The Episode is a draft: it has no video and no Promotion. This overrides the metadata line in step 3 of [episode-migration](../../../docs/features/episode-migration.md).

- Write `episode-metadata.ts` with `status: 'upcoming'` (the existing non-published value, `UpcomingEpisodeMetadata`) and no `publishedOn`; the type refuses one. Publishing flips both and is Han's separate step ([episode-publishing](../../../docs/features/episode-publishing.md)), never this job's or Promotion's.
- Topic, extra Topics and Tags come from the Brief. `topic`, `format` and `tags` are required in `SharedMetadata` (`src/lib/episode-metadata.pure.ts`), so a required field the Brief does not name gets a `Needs human:` line in the run-log entry plus the closest honest value (the nearest existing Topic or Format, an empty `tags` list), never an invented one. `extraTopics` is optional: when the Brief names none, leave it out.
- Register the metadata in the `REGISTERED` map in `episode-repository.ts`: it holds every registered slug whatever its `status`, so an upcoming Episode with a page type-checks. The page is built `noindex` and its card stays unlinked until publishing; write no `published-anchors.json` here.

## Review

The reviewer calls the Skill tool with `code-review`, the fixed point the last commit before this job started (the merge-base with `main` would pull in everything the Episode branch carries from earlier jobs), its subagents on the agent's `model`. Pass the Spec's `Episode page` section to its Spec subagent with the lines under `## Rubric` beside it. Each finding the Spec or Standards report marks hard is a failed line, quoted verbatim; a judgement call goes into Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). The first failure is the failed attempt.

## Rubric

1. The page serves at its route, with the Title slide and every section slide of the Spec, in Spec order.
2. Every Section of the Spec has exactly one placement marker, named as [Placement markers](#placement-markers) says, holding its section slide and no page Slide.
3. The metadata is `upcoming` with no `publishedOn`, and every value comes from the Brief or carries a `Needs human:` line.
4. The post-build text captures are committed and `npm run test:build` passes.
