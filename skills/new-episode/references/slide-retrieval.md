# slide-retrieval

Output: `docs/episodes/<slug>/slide-plan.md`, the **Slide plan**, which decides per Slide the Brief names whether an existing Slide is reused by Reference, adapted as an Instance, or a new one built. No reviewer: the user checks it at the Spec Gate, where every Slide shows its outcome and they can flip it. It runs in Setup beside `categorize-research`, before `retrieval`, which brings in the research the kept Slides cite.

## Prompt

Slides come before building: build only what the library lacks (design-ADR 0016, _Pipeline and evidence_). For each page Slide under the Brief's `## Slides`, in its numbering:

1. List the candidates: `npm run slides:pool` prints every page Slide of every Episode and the Slide pool, one line each: slug, title, the Concept it `defines`, where it lives, the Episodes holding it and the Research questions it cites. Read that page, never the folders.
2. Match a Slide that teaches a Concept by its Definition Slide (`defines <concept-id>`) first, then any Slide by title and the Brief Slide's purpose. Open a likely candidate on the dev server and read its words before you decide.
3. Decide one outcome:
   - `reuse <slug>`: the candidate makes the Brief Slide's point as it stands, in words that fit this Episode. It costs one Reference: no Options, no Dossier words, no Voice script.
   - `adapt <slug>`: it makes the point once changed (another example, another industry, one label), and the change leaves most of it standing. It becomes an Instance with a slug of its own; say what changes.
   - `new`: nothing fits, or the change would rewrite most of it. Keep a near miss as `closest <slug>` so the user can flip the Slide at the Gate.

Write the plan by its rule (`npx mh query docs/episodes/<slug>/slide-plan.md`), one item per Brief Slide, `held by` and `cites` copied from the listing (`none` when empty):

```markdown
# Slide plan

## Slides

- Slide 1: reuse attention-is-a-budget; held by ai-attention-span; cites AIE-0011.
- Slide 2: adapt ai-forgets-the-middle-too; held by ai-attention-span; cites none; moves from ai-attention-span; changes the call becomes a sales handover.
- Slide 3: new.
- Slide 4: new; closest everyday-habits; held by ai-attention-span; cites none.
```

- A candidate that still lives in another Episode's own `slides/` (the listing says `in <episode>`, not `in the Slide pool`) adds `moves from <episode>` for a reuse or adapt: its first reuse moves it to the Slide pool, and the plan shows that Episode's owner the move.
- A Slide is never reused into the Episode that already holds it, and a Title slide is never a candidate: the listing leaves Title slides out.

## Done when

The job's `checks:` in `assets/pipeline.yml` run by the check table in [SKILL.md](../SKILL.md#the-job-loop); the staging test refuses an item of no known form, a Brief Slide with no item or two, an adapt that says not what changes, a candidate no Slide of the repository has, and `held by`, `cites` or `moves from` that disagree with the listing. The Job's summary gives the reason for each `reuse` and `adapt`.

## After the job

`retrieval` reads the plan: a kept Slide's cited questions go under `## Reuse` as `Slide <n>: reuse <id>, …`, and an adapted Slide with grandfathered Sources gets a `migrate` job. `write-dossier` writes no words for a reused Slide; `write-spec` shows it once with no Options, and an adapted one beside its origin. The Build stage follows the Spec: `slides:reuse` for a reuse, `slides:adapt` for an adapt, and `slides:settle` before `open-pr` turns every Instance no job edited back into a Reference.
