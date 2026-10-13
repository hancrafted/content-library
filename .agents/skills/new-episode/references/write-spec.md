# write-spec

Output: a spec issue for implementing the Episode, with one sub-issue per Section, on GitHub Issues. No staging file: the run-log entry's Output lists the issue URLs.

## Prompt

First look up this Episode's spec issue by its label `episode:<slug>` (`gh issue list --label episode:<slug> --state all`). When one exists, an earlier attempt made it: edit it and its sub-issues in place, by the failed lines, and create none. Otherwise create the label if it is missing, then the spec, with the label on the spec issue alone.

Turn the approved Dossier into a spec with the `to-spec` skill, then into tickets with `to-tickets`. Han is away during the run, so where `to-spec` asks him to confirm the seams, use the existing Episode seams from `.archgate/adrs/FE-004-slide-architecture.md` and record that choice in the spec.

- The staging files are the content spec: the tickets point to them by heading anchor and never paste their text, so the Dossier stays the single source of truth.
- One sub-issue per Section (Dossier h2), covering its section slide and every page Slide under it. The Title slide and the Episode's own wiring belong to the first ticket, and every other ticket is blocked by it.
- Each ticket names, per Slide: its Voice script items by number, as the Slide's Voice script segments, verbatim in the built Slide; the Dossier's Visual master and motion; its Speaker notes, as the Slide's note keys.
- A Visual flagged as a catalog miss in the run log becomes its ticket's design question, never an invented layout.

Every issue body you write or edit ends with the line `Edited-by: write-spec`, the last line of the body; log each one under the run-log entry's Output as `Edited #<issue> · <timestamp>`.

## Done when

The spec issue and every sub-issue exist with the `ready-for-agent` label, each sub-issue linked to the spec, and exactly one issue carries the label `episode:<slug>`.

## Rubric

1. Every Dossier h3 is covered by exactly one ticket.
2. There is one sub-issue per Section.
3. Every ticket points to its Dossier headings instead of copying their text.
4. Every Visual a ticket names is the one the Dossier names.
5. No ticket asks for a layout, component or motion the Dossier does not name.
