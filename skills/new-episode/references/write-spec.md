# write-spec

Output: `docs/episodes/<slug>/spec/spec.md`, the build spec: what `implement-episode-init` and each `implement-section` job build, one section per Section. A local staging file, never a GitHub issue; [the sample](../assets/sample-episode/spec/spec.md) shows its shape.

## Prompt

Turn the approved Dossier into the build spec. `npx mh query docs/episodes/<slug>/spec/spec.md` prints the intent of every field and heading; follow each. Use the Episode seams from `.archgate/adrs/FE-004-slide-architecture.md`, and say so in the spec's `## Episode page`.

- The Dossier is the content source: the spec points at it by heading anchor (`../dossier.md#<slug>`) and never pastes its text.
- `## Episode page` is the init job's part: the route, the metadata from the Brief, the registration, the Title slide (its Voice script included, which the kit gives no own slot: map the h1's paragraphs to the first segment of the first section slide), one placement marker per Section by the name [`implement-episode-init.md`](implement-episode-init.md#placement-markers) gives, and post-build step 8 of [episode-migration](../../../docs/features/episode-migration.md): capture `tests/post-build/episode-text/<ep>.{en,de}.json` with `npm run build` then `npm run test:build`; the slug joins `PUBLISHED_SLUGS` only at publication.
- One h2 per Section (Dossier h2), titled and slugged as the Dossier's, covering its section slide; one h3 per page Slide under it, titled and slugged as the Dossier h3. A Section job reads only its own h2.
- Each Slide names its Voice script items by number, as the Slide's Voice script segments; the Dossier's Visual master, motion and `title:` line when it has one (the h3 is the table-of-contents title, the Visual's `title:` the on-screen one; never retitle a Slide silently); and its Speaker notes, as the Slide's note keys. The Title slide and section slides have no Visual: they use the kit's title and section layouts with `motion: none`.
- The spec asks no design question and says "Build to the design spec's answer" in place of a layout: [`write-design-spec`](write-design-spec.md) designs every Slide next. A `No library match:` line in the run log is input for the designer.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop).

## Rubric

1. Every Dossier h3 is covered by exactly one spec h3, under the h2 of its Section.
2. There is one h2 per Section, and `## Episode page` names one placement marker per Section.
3. Every Slide points to its Dossier headings instead of copying their text.
4. Every Visual the spec names is the one the Dossier names, and no Title slide or section slide gets a Visual or a motion.
5. No Slide carries a design question or a "stop and comment" instruction; each says to build to the design spec's answer.
