# implement-episode-init

Output: the Episode's page in `src/` (a Guide's by [A Guide](#a-guide)), on the integration branch `episode/<slug>`: its wiring, metadata, Title slide, section slides and one placement marker per Section, so the `implement-section` jobs that follow build in parallel without touching the same file. Built from the `Episode page` section of the approved Spec, `docs/episodes/<slug>/spec/spec.html`.

## Prompt

The implementor (`archgate:developer`) builds the Spec's `Episode page` section, test-first by `tdd`, and commits through `commit`. The approved Spec is the only source; the Spec Gate deleted the Dossier. It reads the `Episode page` section (route, metadata, registration, Title slide, placement markers, post-build step), the Title-slide article's `data-picked` Option, and, for each section slide, the `<h2>` and `ol[data-spec="voice-script"]` directly under its `data-spec="section"`, each `<li>` one Voice script segment, verbatim, its `<strong>` the segment's title. The Slides inside are the Section jobs'. It skips `archgate:reviewer` and `archgate:lessons-learned`: the job's reviewer covers review, and the orchestrator writes `LEARNINGS.md`. `archgate check` still runs. Apply [`skill-overrides.md`](skill-overrides.md) to every skill the job lists.

- Scaffold the Episode by [episode-migration](../../../docs/features/episode-migration.md): steps 2, 3 and 7 for its slugs, folder, record, Translation files and page, and steps 4 and 5 for the Title slide and one section slide per Section only, as the Spec's `Episode page` and section entries give them. The record takes the shared Slide header (no `header` field).
- Build the picked Title-slide Option as a set: its Title slide mock is the record's `title` Slide, a Slide folder whose Scene carries the Hero motif and the one h1; each `li[data-spec="echo"]` is its Section's section slide Scene, by its `data-section`. Its build notes give the parts, tokens and i18n keys, and each Context marker a mock shows is a `ContextMarker` opening the Speaker note they name.
- Write one placement marker per Section, by the [naming below](#placement-markers), in Spec order. Each holds that Section's section slide and no page Slide.
- Capture the post-build text: `npm run build`, then `npm run test:build`, and commit the written `tests/post-build/episode-text/<ep>.{en,de}.json`. The slug joins `PUBLISHED_SLUGS` only at publication.
- Serve the Episode for the user: in the Episode's worktree, reuse the dev server `begin-run` started on `dev_port` in `pipeline.yml` (`lsof -nP -iTCP:<dev_port> -sTCP:LISTEN` prints a line); start none of your own, and leave it running when the job ends: the dashboard links it, and it shows each Section as it merges into `episode/<slug>`. When none answers there, start `npx next dev -p <dev_port>` detached in the Episode's worktree.

### Placement markers

One module per Section ([design-ADR-0008](../../../docs/adr/0008-pipeline-jobs-belong-to-stages.md) Decision 7, FE-004 Decision 3), `src/episodes/<ep>/sections/<section-slug>.ts`, exporting that Section's ordered Slide list, which the Episode record imports into `sections` in order. `<section-slug>` is the Section's h3 title under the Brief's `## Slides` in kebab case, the one slug [`customize-pipeline`](customize-pipeline.md) gives the Section's job when it expands the `implement-section` foreach; never the Spec Section's `id`, which may differ. Its Section job adds its page Slides to that list alone, so parallel Section branches never edit one line, and its job id `implement-section-<section-slug>` names the module it owns.

### Metadata

The Episode is a draft: it has no video and no Promotion. This overrides the metadata line in step 3 of [episode-migration](../../../docs/features/episode-migration.md).

- Write `episode-metadata.ts` with `status: 'upcoming'`, `visibility: 'public'` and no `publishedOn`; the schema (`src/content-store/schemas/episode.schema.ts`) refuses one, and refuses a record without a visibility. Publishing flips both and is the user's separate step ([episode-publishing](../../../docs/features/episode-publishing.md)), never this job's or Promotion's.
- Format and Tags come from the Brief. `format` and at least one Tag are required by the Episode schema (`src/content-store/schemas/episode.schema.ts`), so a required field the Brief does not name gets a `needs-human` note plus the closest honest value (the nearest existing Format or Tag), never an invented one.
- Register the Episode by running `npm run registry`: the Episode registry derives the slug, the metadata and the record from the folder, whatever its `status`, so an upcoming Episode with a page type-checks; the fast suite fails while the registry is stale. The page is built `noindex` and its card stays unlinked until publishing; write no `published-anchors.json` here.

### A Guide

A Brief whose `## Format` names `guide` builds a Guide, not an Episode (`docs/features/resources.md`, Guides): every step above holds, with these paths and records in place of the Episode's.

- The folder is `src/episodes/guides/<slug>/`, its placement markers `src/episodes/guides/<slug>/sections/<section-slug>.ts`; `episode.ts` exports the `episode()` composition as for an Episode.
- The record is `src/content-store/guides/<slug>.ts`, exporting `guide` with `slug`, `tags` from the Brief and `visibility: 'public'`, `satisfies GuideInput` (`src/content-store/schemas/guide.schema.ts`). It replaces [Metadata](#metadata): no `episode-metadata.ts`, `status` or `format`. `npm run registry` lists both.
- Write `src/episodes/guides/<slug>/published-anchors.json` with the anchors the page renders: a Guide's anchors bind from the start, as a Template's and an Explorable page's do, and `src/episodes/lib/published-anchors.test.ts` prints the file to write.
- The first Guide adds its page, which static export refuses while no Guide exists: `src/page-assembly/guide/guide-page.tsx` and the route pair `src/app/(en)/guides/[slug]/page.tsx` and `src/app/[locale]/guides/[slug]/page.tsx`, each mirroring its Explorable page counterpart (`explorable-page/explorable-page.tsx`, `explorables/[slug]/page.tsx`) through `guideParams`, `guideAt` and `PageOf<'guide'>`, and a `guideVideo(slug, locale)` in `src/content-store/store.ts` beside `explorablePageVideo`, with `GuideParams` re-exported there.
- The page-wide toolbar picks (operating system, AI agent) are `usePagePick` from `src/episodes/hooks/use-page-pick.ts`; the Episode container already provides them. A troubleshooting box is the shared `TryPrompt` with `useCopy` from `src/shared/hooks/use-copy.ts`.

## Review

The reviewer calls the Skill tool with `code-review`, the fixed point the last commit before this job started (the merge-base with `main` would pull in everything the Episode branch carries from earlier jobs), its subagents on the agent's `model`. Pass the Spec's `Episode page` section to its Spec subagent with the lines under `## Rubric` beside it. Each finding the Spec or Standards report marks hard is a failed line, quoted verbatim; a judgement call goes into Notes.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop). The first failure is the failed attempt.

## Rubric

1. The page serves at its route, with the Title slide and every section slide of the Spec, in Spec order, each built to the picked Title-slide Option: the record's `title` Slide and one section slide Scene per echo.
2. Every Section of the Spec has exactly one placement marker, named as [Placement markers](#placement-markers) says, holding its section slide and no page Slide.
3. The metadata is `upcoming` with no `publishedOn`, and every value comes from the Brief or carries a `Needs human:` line.
4. The post-build text captures are committed and `npm run test:build` passes.
