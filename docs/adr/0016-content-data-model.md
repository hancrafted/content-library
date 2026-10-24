---
type: design-adr
status: proposed
---

# Content data model

The library holds three kinds of content that today's records blur: the proof behind a claim, the Slides that teach it, and the arrangements that present Slides to an audience. Six closed Tags stand in for subjects, a Workshop stands in for every arrangement, and a Speaker note cites a bare URL. This record settles the records, their relationships and their contracts across three layers, so that later implementation tickets only make tests pass.

It amends _The Slide is a self-contained folder_, _Episode content is staged then promoted_, _Tags replace Topics_ and the Archgate ADR _FE-012 Shared Visual Content_. The product vision (`docs/steering/product-vision.md`) ranks every trade-off here.

## Layers

- **Evidence:** Concept → Research question → Source. The proof, rendered publicly on this site.
- **Teaching:** Episode → Slide → Speaker note item, Explorable explanation. The Episode is the product unit; the Slide is the technical unit.
- **Delivery:** Event → Playlist → Episode. Arranging and presenting, never owning Slides.

## Decisions from the initial grill

The initial grill (map _Content data model and product vision_, ticket _Content data model: initial grill_) settled these; the sections below refine them per seam.

1. **Records.** Evidence records (Concept, Research question) are markdown with frontmatter; teaching and delivery records are TypeScript. Zod schemas exist for every record kind, with `.describe()` on fields. markdown-harness governs authoring; Zod governs the store and rendering.
2. **Concepts replace Tags,** not one to one. Only top Concepts (`broader: []`, SKOS: no parent) carry a theme. Episode metadata names `applyThemeFromConcept`, which sets the card's icon and accent and replaces the lead-Tag look.
3. **Evidence renders on this site** at `/concepts/<id>` and `/research/<id>`, built with unified (remark → rehype), English only; German pages link the English page, marked as English.
4. **Slide reuse is reference by default, copy on write.** A Slide lives in its Episode's folder until first reuse, then moves to the shared pool. An edited reuse is an instance marked with what it was copied from; Promotion resolves it at a Gate. Slide slugs are globally unique from birth, Title slides excepted, and are never renamed.
5. **A Definition Slide** is a page Slide that carries `defines: <concept-id>`.
6. **Shared visual is renamed Explorable explanation** everywhere, in its own folder apart from plain shared parts.
7. **Event + Playlist replace Workshop.** An Event presents one Playlist; a Playlist orders Episodes, event-frame Episode first.
8. **`unlisted` is only a visibility flag.** Every Episode has the same abilities; duplicating an Episode references the original's Slides, never copies them.

## Evidence vocabulary

The six Tags become seven top Concepts, each scoped by one sentence against its neighbours; the research categories dissolve into them; a Concept is one markdown file with a stable, name-derived id.

### Top Concepts

A top Concept has `broader: []` (SKOS: no parent). The seven form the closed set of themes `applyThemeFromConcept` may name; a new top Concept is a new theme, which is a design decision, not a content edit. Grounded in the six current Tags, the 24 research files and the 6 Episodes (a Research question may inform several Concepts; the first is its main one).

| Id (from)                                                 | Scoping definition                                                                                                                                                                                    | Main Research questions                                              | Episodes today                                                        |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `context-engineering` (Tag, kept)                         | What an AI is given to work from: the context window, the brief, memory between chats and knowledge of your organisation, not how the model behaves once it has them.                                 | AIE-0004, AIE-0011, LLM-0002, LLM-0003, LLM-0005                     | ai-attention-span, maintaining-markdown-for-ai, onboard-ai-every-time |
| `agentic-ai` (Tag, kept)                                  | Handing work to an AI and staying responsible for it: delegating, decomposing, clarifying, checking and the risk of not checking, not whether an organisation adopts AI.                              | AIE-0001, AIE-0005, AIE-0006, AIE-0007, AIE-0008, AIE-0009, AIE-0010 | ai-gives-you-more-work, ai-token-economy, onboard-ai-every-time       |
| `llm-behaviour` (new)                                     | How a language model behaves as a system whatever you feed it: nondeterminism and confidence on vague prompts, not what you should feed it.                                                           | LLM-0001, LLM-0004                                                   | none yet                                                              |
| `ai-adoption` (new, from `workflow` and the AIE/ORG gaps) | Whether a person or an organisation turns AI use into measured productivity: the gap between promise and result, the workflow change and the tacit knowledge it needs, not how one task is delegated. | AIE-0002, AIE-0003, ORG-0001                                         | ai-gives-you-more-work (shares with `agentic-ai`)                     |
| `markdown-documentation` (Tag `markdown`, renamed)        | Writing and maintaining plain-text documents so people and AI read one source of truth, not what an AI does with them.                                                                                | none yet                                                             | maintaining-markdown-for-ai                                           |
| `ai-cost` (Tag `cost`, renamed)                           | What running AI costs and what drives it: tokens, context length, model price, not a startup's costs in general.                                                                                      | LLM-0002 (also informs)                                              | ai-token-economy                                                      |
| `sales` (Tag, kept)                                       | Winning paying customers for a service: cycle length, pipeline conversion, selling early, and the cash timing it creates.                                                                             | SALES-0001 to SALES-0006, START-0001                                 | never-too-early-sales                                                 |

The `workflow` Tag does not survive: it grouped three Episodes that share no subject. Each Episode keeps its other Tags, and what `workflow` meant goes to `agentic-ai` or `ai-adoption`.

### Research categories

The categories (AIE, COG, LLM, ORG, SALES, START, WORK) do not survive as a field or a layer. Only five (AIE, LLM, ORG, SALES, START) hold files today; COG and WORK exist only in the handoff. Subject comes from the Concepts a Research question informs. The prefix stays as a historic, meaningless id namespace and folder name, because ids are stable (horizon 3 progress tracking keys on them); no existing file is renamed and a new question takes the nearest existing prefix.

### The Concept record

One markdown file per Concept at `docs/llm-wiki/concepts/<id>/concept.md`, flat (never nested by parent), governed by a markdown-harness rule selecting `concept.md`, validated by a Zod schema in the store.

- **Id:** the kebab-case English name, stable, no category or number. It is the folder name, the `/concepts/<id>` route and the reference value everywhere. A Concept is never renamed: a better name becomes an alias. Kept Tag ids carry over, so today's Episodes map without a rename.
- **Load-bearing fields:** `type: concept`, `title` (the name), `description` (the one-sentence scoping definition, at most 200 characters), `broader` (required; `[]` for a top Concept), `generated` (by, at), the body (definition first, then the longer explanation). Optional: `aliases`, `related`, `stale_after`, `verified`.
- **`narrower` is derived, not stored.** It is the inverse of `broader`, so storing both lets them disagree; the build computes it. `related` is symmetric and stored on one side only; the build mirrors it.
- **Checks:** every id resolves; `broader` has no cycle; only a top Concept names a theme; a Concept with `broader: []` appears in the theme record and the reverse.
- **No `category` field and no sources:** proof lives on Research questions, which name the Concepts they inform; a Concept page lists them.

```markdown
---
type: concept
title: 'Context engineering'
description: 'What an AI is given to work from: the context window, the brief, memory between chats and knowledge of your organisation.'
aliases: ['prompt context']
broader: [] # SKOS broader: no parent, so a top Concept that carries a theme
related: [llm-behaviour] # SKOS related: associative, not hierarchical; mirrored by the build
generated:
  by: claude-code/opus-5.5
  at: 2026-10-25T00:00:00Z
---

Context engineering is ...
```

```markdown
---
type: concept
title: 'Startup cash flow'
description: 'Why revenue arrives after the costs that cause it in an early-stage company.'
broader: [sales] # SKOS broader: one parent, so no theme of its own; its card takes sales
# narrower is not written: SKOS narrower is derived from every broader that names this Concept
---
```

Decided-for-Han (test run): all of the above, contestable.

## Citations

Settled in ticket _Citations: how does a claim cite a Research question?_ (answers `decided-for-Han (test run)`). It rests on _Evidence vocabulary_ (categories dissolve, ids stable) and on the markdown-harness facts of ticket _What can markdown-harness check for source trust and citations?_ (a `pattern` on a source URL is configuration; "this id exists elsewhere", domain trust levels and JSON Schema need a change to markdown-harness).

### Research question

1. **Id and URL.** A Research question's id is the `<category>-<####>` part of its folder name, for example `AIE-0001`, kept as written. Its page is `/research/<id>`, English only (decision 3). The `__<question-slug>` part of the folder is for people and is not part of the id. No existing file is renamed (_Research categories_), and a retired id is never reused.
2. **The id is derived, not stored.** There is no `id` field: the store takes it from the folder name, so folder and field cannot disagree. The build fails on a malformed or duplicate id across the wiki and staging together.
3. **`informs` is a required field:** a non-empty list of Concept ids, the first being the main one (as in _Top Concepts_). markdown-harness checks that it is present and non-empty; the Zod store checks that each id is a Concept. This is what lets a Concept page list its Research questions.
4. **`confidence` is a required field:** `settled`, `contested` or `open`. It describes the evidence for the Answer, never the writer's certainty:
   - `settled`: the Answer rests on at least two independent primary Sources that agree, and no Source or Caveat contradicts it.
   - `contested`: credible primary Sources disagree, or the effect is real but depends on context the Answer names.
   - `open`: anything less: one Source, only weak Sources, or a mechanism still debated.
5. **Who sets `confidence`.** The agent that writes the research proposes it, with the Answer, by the three definitions above. Han confirms or changes it at the Promotion Gate. After that only Han changes it, and a re-run for staleness (`stale_after`) resets it to a proposal he confirms again. markdown-harness enforces presence and the three values (`allowed`); whether a value is _earned_ is judgement, so `intent` states the definition and review enforces it.
6. **The page shows it.** `/research/<id>` shows the Answer, the `confidence` as a badge with its definition, the Concepts it informs, its Sources, and the Speaker notes that cite it.

### The citation contract

7. **Default: cite a Research question.** A Speaker note's source entry names a Research question by id; its title, link and `confidence` come from the question, so the entry carries no title of its own.
8. **Exception: cite a Source directly, only when it is high trust.** A direct entry keeps today's `url` and its title in the Slide's `i18n`. A Source that is not high trust is never cited directly: the claim needs a Research question, which is where weak Sources are weighed, caveated and given a `confidence`.

   ```ts
   sources: [
     { slug: 'onboarding', research: 'AIE-0001' }, // default: the note cites a Research question
     { slug: 'claude-docs', url: 'https://docs.anthropic.com/…' }, // direct: host is on the allowlist
   ];
   ```

   The citation attaches where the claim is made; today that is the note's `sources`, and attaching to a single note item is the implementer's refinement.

9. **What decides high trust: the Source's host, from one allowlist.** A Source is high trust when its host is an accountable primary publisher of the claim it supports. Three kinds qualify: a vendor's own documentation for what that vendor's product does (`anthropic.com` and `claude.com` hosts for Anthropic's products), a standard or law's own text (`eur-lex.europa.eu`), and the scholarly record (`arxiv.org`, `doi.org`, `nber.org`, `aeaweb.org`). The list lives in code in one place, one entry per host with a reason line. There is exactly one level: on the list is high trust, off it is not; markdown-harness cannot hold levels either. Matching is anchored on `https://` and the host, so `docs.anthropic.com.evil.example` is not `docs.anthropic.com`. Adding a host is a trust decision, not a content edit: Han accepts it. Blogs, analytics vendors, media and aggregators (`hbr.org`, `paulgraham.com`, `steveblank.com`, `benchmarks.ebsta.com`, `github.com`) are not on it. A host says who publishes, not that a given page is right, so a cited Source still needs a Research question when the claim is contested.
10. **The allowlist is not a gate on Research questions.** A research file's `sources[].resource` stays governed by the existing primary-source `intent`, not a host pattern: research legitimately weighs a practitioner essay or a dataset, and those belong there precisely because the question carries the caveats.
11. **Where each check lives.** markdown-harness (configuration): `confidence` values and presence, `informs` presence. The vitest suite (`npm run verify`, hermetic): everything markdown-harness cannot do, namely that a cited Research question id exists, that `informs` ids are Concepts, that a direct `url` is on the allowlist (Speaker note sources are TypeScript in `slide.tsx`, which markdown-harness does not read), and the migration baseline below. `check:sources` stays the network liveness check.
12. **Staged research can be cited before Promotion, but not past publication.** A Run's Speaker notes cite research that is still in `docs/episodes/<slug>/research/` (its id resolves from staging), because Promotion comes after the Episode is final. The check refuses a `published` Episode that cites an id that exists only in staging, so Promotion happens before publishing. Staged ids have no page until promoted.

### Migration of the 138 existing URL sources

13. **Grandfather behind a shrinking baseline; migrate on touch; no big-bang migration.** There are 138 sources on 113 Speaker notes and 24 Research questions (13 more staged), so a Research question does not exist for most claims yet, and writing them all would block this model on research work. Instead:
    - A source that is already high trust is valid under the contract and needs nothing. By the count of literal URLs, 57 of 92 are on the allowlist's hosts; 35 are not. The other 46 sources use non-literal forms, which the implementation's check classifies.
    - Every existing source that is not high trust is listed once in a checked-in baseline file generated by the check. A source in the baseline passes.
    - **The baseline only shrinks.** A new off-list URL source that is not in the baseline is refused; a baseline entry whose source no longer exists is refused too, so removing a migrated source forces the baseline update and the list cannot grow stale.
    - **Migrate on touch:** a note edited in a Run, or an instance made from it, moves its baseline sources to Research questions in that change. The pipeline's review step asks for it (the _Pipeline and evidence_ seam); the check enforces the ratchet, not the touch.
    - The baseline is reviewed when horizon 2 starts (2027); an empty baseline is deleted and the exception ends.
14. **A check refuses, from the day the implementation ticket merges:** a Research question without a valid `confidence` or `informs`; a Concept id in `informs` that does not exist; a `research:` citation to an id that does not exist; a direct `url` that is neither on the allowlist nor in the baseline; a baseline entry that is gone; a published Episode citing a staged id. There is no warning period: the baseline is the transition.

### The 13 staged research files

15. **They join the same contract in the same implementation change.** The research rule governs `research.md` in staging and in the wiki alike, so requiring `confidence` and `informs` fails the 13 staged files (`COG-0001`, `LLM-0006` to `LLM-0010`, `AIE-0012` to `AIE-0015`, `WORK-0001` to `WORK-0003`) unless they are backfilled. The implementation backfills all 37 files at once: the agent proposes `confidence` and `informs`, Han confirms. Their ids already continue the per-category counts, so nothing renumbers.
16. **One overlap is handed on.** `AIE-0014` (`llm-non-deterministic-output`) answers nearly the question `LLM-0001` already answers. Staged ids are not public, so Promotion may merge it into `LLM-0001` and retire `AIE-0014`; the _Pipeline and evidence_ seam decides how the retrieval job catches such duplicates.

Failing tests, in Han's words:

- "A Speaker note that cites a Research question shows its title, links to its page and shows how settled it is."
- "A Speaker note that cites a Research question that does not exist fails."
- "A new Speaker note source from a blog fails; one from Anthropic's documentation passes."
- "A look-alike host such as `docs.anthropic.com.evil.example` is not trusted."
- "A Research question with no `confidence`, or one that is not settled, contested or open, fails."
- "A Research question that informs no Concept, or a Concept that does not exist, fails."
- "A Concept page lists every Research question that informs it, and a Research page lists the Speaker notes that cite it."
- "Fixing a grandfathered source removes it from the baseline, and a baseline entry for a source that is gone fails."
- "A published Episode that cites research still in staging fails."

Decided-for-Han (test run): all of the above, contestable.

## Slide reuse

Settled in ticket _Slide reuse: shared pool, instances and Promotion_ (answers `decided-for-Han (test run)`). It amends _The Slide is a self-contained folder_ and _Episode content is staged then promoted_.

1. **The shared pool is one flat folder of Slide folders,** `src/components/slide-pool/<slug>/`, with the same shape as any Slide folder. A Slide lives in its Episode's `slides/` until first reuse. First reuse is one command that moves the folder into the pool (`git mv`), re-points the owning Episode's import, and adds the reference to the reusing Episode. Slug, text and anchors do not change, so no published URL moves. Pool Slides obey the same import boundary as any Slide.
2. **An Episode lists a pool Slide by reference.** An unchanged reuse is a reference: the Episode's Section list names the pool Slide; nothing is copied.
3. **An instance is a Slide folder in the Episode's own `slides/`,** copied from the pool Slide the moment a Run edits it. It gets its own globally unique slug at the copy, never the origin's, and carries a marker `copiedFrom: { slug, commit }`. A copy that no edit has touched is deleted and replaced by a reference, so no unchanged instance outlives its Run.
4. **The Promotion Gate resolves every instance,** one decision per instance, Han deciding:
   - **Update the shared Slide:** the instance's content replaces the pool Slide, the Gate lists every Episode that references the origin, and the instance folder is deleted. The Episode's entry becomes a reference to the pool Slide and **pins the retired instance slug as its anchor**, so that Episode's published anchor does not move. If the pool Slide changed since `commit`, the Gate says so and Han reconciles by hand; there is no automatic merge.
   - **Become its own Slide:** the `copiedFrom` marker is removed; slug, folder and anchors stay. The Slide is a new Slide in the Episode's folder, and reuses by the same rule 1.
     Neither outcome renames a slug, so a promotion collision cannot occur: the instance's slug was unique from birth.
5. **`slideHref` resolves per Episode, by the slug the Slide author wrote.** A Slide in the pool links to a sibling by that sibling's pool slug. The walk resolves it to this Episode's placement of that Slide or, if the Episode holds an instance copied from it, to the instance; it emits the Episode's own anchor, including a pinned one. A sibling the Episode does not hold fails the build (as before), unless the call site opts into a fallback (`slideHref(slug, { fallback: 'text' })`), which renders plain text. Adding a pool Slide to an Episode therefore fails the build until its linked siblings are there too, or the author has made the link optional.
6. **An unlisted Episode's `slides/` changes nothing:** it owns Slides, references pool Slides, makes instances and promotes exactly as a public Episode. Its Slides sit in the same global slug namespace and its anchors are snapshotted by the same published-anchors test.
7. **Global slug uniqueness refuses, at build and in the command that creates a Slide or instance:** a slug used by two Slides anywhere (Episode folders and pool together); a retired instance slug reused, since the Episode's pin keeps it reserved; an instance given its origin's slug. Title slides are exempt; their anchor stays per Episode.

Failing tests, in Han's words:

- "Reusing a Slide in a second Episode moves it into the pool and the first Episode's page looks the same."
- "Editing a reused Slide in one Episode does not change it in the others."
- "Promoting an edit as an update changes the shared Slide, lists the Episodes it affects, and no published anchor moves."
- "Promoting an edit as its own Slide keeps its slug and anchors."
- "A link between sibling Slides still works in an Episode whose siblings differ, and a missing sibling fails the build."
- "Two Slides with the same slug anywhere are refused."

## Delivery contract

_Pending: ticket *Delivery contract: Event, Playlist, routes and visibility*._

## Pipeline and evidence

_Pending: ticket *Pipeline and evidence: how /new-episode draws on and grows research*._

## Event page behaviour

_Pending: ticket *Prototype: an Event page and an unlisted one-off Episode*._

## Considered options

- **Always copy, then merge at Promotion.** Rejected in the initial grill: Promotion becomes a three-way merge, drift needs a recorded base, and an unpromoted copy becomes a permanent fork.
- **A separate Astro/Starlight evidence site.** Rejected: evidence renders on this site, one build and one link graph.
- **Slide reuse: promotion renames the instance's slug.** Rejected: it moves a published anchor. Instances get a unique slug from birth, so nothing is renamed at the Gate.
- **Slide reuse: `slideHref` typed to the pool Slide's siblings, or links declared per Episode.** Rejected: a pool Slide cannot know the Episodes that hold it; per-Episode resolution by slug keeps the Slide self-contained.
- **Evidence vocabulary: one-to-one Tag rename.** Rejected: `workflow` grouped no subject and two research areas (model behaviour, adoption) had no home.
- **Evidence vocabulary: keep research categories as a Concept field.** Rejected: a second axis beside `broader` that two Concepts can disagree on.
- **Evidence vocabulary: store `narrower`.** Rejected: it is the inverse of `broader`; two copies drift.
- **Citations: cite a Source directly whenever the URL resolves.** Rejected: a Speaker note would carry no weighing of the Source; Research questions exist to hold caveats and `confidence`.
- **Citations: trust levels per host (high, medium, low).** Rejected: markdown-harness cannot select on a field value, and one level keeps "on the list or not" testable.
- **Citations: migrate all 138 sources now.** Rejected: most claims have no Research question yet; it would block the model on research work.
- **Citations: grandfather with no baseline.** Rejected: nothing would stop the off-list count growing.
- **Citations: `confidence` derived from Source count.** Rejected: contested and open need judgement the count cannot make; the agent proposes, Han confirms.
- **Citations: an `id` field in the research frontmatter.** Rejected: it can disagree with the folder name.

## Consequences

- `GLOSSARY.md` changes ship with each implementation ticket, never ahead of the code.
- Ids stay stable: horizon 3 progress tracking will key on them.
- Slide reuse: a retired instance slug stays reserved for as long as an Episode pins it as its anchor.
- Slide reuse: adding a pool Slide to an Episode can fail the build on its sibling links, by design.
- Evidence vocabulary: a new top Concept is a new theme (icon and accent), so it is a design decision; the Tag record and its filter chips are replaced by the Concept store.
- Citations: a baseline file of off-list URL sources exists until it is empty; reviewed at the start of horizon 2.
- Citations: all 37 research files (24 wiki, 13 staged) gain `confidence` and `informs` in one change; the research writer's template gains them in the _Pipeline and evidence_ seam.
- Citations: adding a host to the allowlist is a trust decision Han accepts, like a new top Concept.
- Citations: Promotion must precede publishing an Episode that cites its own staged research.
