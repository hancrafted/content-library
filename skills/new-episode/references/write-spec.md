# write-spec

Output: a spec issue for implementing the Episode, with one sub-issue per Section, on GitHub Issues. No staging file: the run-log entry's Output lists the issue URLs.

## Prompt

First look up this Episode's spec issue by its label `episode:<slug>` (`gh issue list --label episode:<slug> --state all`). When one exists, an earlier attempt made it: edit it and its sub-issues in place, by the failed lines, and create none. Otherwise create the label if it is missing, then the spec, with the label on the spec issue alone.

Turn the approved Dossier into a spec with the `to-spec` skill, then into tickets with `to-tickets`. Han is away during the run, so where `to-spec` asks him to confirm the seams, use the existing Episode seams from `.archgate/adrs/FE-004-slide-architecture.md` and record that choice in the spec.

- The staging files are the content spec: the tickets point to them by heading anchor and never paste their text, so the Dossier stays the single source of truth.
- One sub-issue per Section (Dossier h2), covering its section slide and every page Slide under it. The Title slide and the Episode's own wiring belong to the first ticket, and every other ticket is blocked by it.
- Each ticket names, per Slide: its Voice script items by number, as the Slide's Voice script segments (the ticket points at each paragraph by its heading anchor and item number; the built Slide carries it verbatim); the Dossier's Visual master, motion and `title:` line when it has one (the h3 is the table-of-contents title, the Visual's `title:` the on-screen one; never retitle a Slide silently); the Title slide and section slides have no Visual, they use the kit's title and section layouts with `motion: none`; its Speaker notes, as the Slide's note keys.
- Post-build step 8 of [episode-migration](../../../docs/features/episode-migration.md) (capture `tests/post-build/episode-text/<ep>.{en,de}.json`; the slug joins `PUBLISHED_SLUGS` only at publication, not now) belongs to the wiring ticket, the first one: implementers do not build, so it names both steps and `npm run test:build`. Its done-when carries the line: run `npm run build`, then `npm run test:build`, and commit the written captures.
- Every ticket is filed with the label `needs-triage`, not `ready-for-agent`: [`write-design-spec`](write-design-spec.md) designs each Slide into the ticket body next, and Han approves the design by relabelling the ticket.
- A ticket asks no design question. Where a Slide's Visual names no Master slide that fits, a `No library match:` line in the run log is input for the designer; the ticket just says to build to its design answer.
- The ticket's criteria read "Each Slide is built to the ticket's design answer" in place of an exact master and motion.

Every issue body you write or edit ends with the line `Edited-by: write-spec`, the last line of the body; log each one under the run-log entry's Output as `Edited #<issue> · <timestamp>`.

## Done when

The spec issue and every sub-issue exist (each sub-issue labelled `needs-triage`), each sub-issue linked to the spec, and exactly one issue carries the label `episode:<slug>`.

## Rubric

1. Every Dossier h3 is covered by exactly one ticket.
2. There is one sub-issue per Section.
3. Every ticket points to its Dossier headings instead of copying their text.
4. Every Visual a ticket names is the one the Dossier names, and no ticket gives the Title slide or a section slide a Visual or a motion.
5. No ticket carries a design question or a "stop and comment" instruction; its criteria say to build to the ticket's design answer.
