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

Failing tests, in Han's words:

- "An Episode card takes its icon and accent from the Concept named in `applyThemeFromConcept`."

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
6. **The page shows it.** `/research/<id>` shows the Answer, the `confidence` as a badge with its definition, the Concepts it informs, its Sources, and the Speaker notes that cite it. Evidence pages render through unified (remark → rehype) with one plugin that links each `[n]` citation marker in an Answer to the `n`th entry of that page's Sources list (a remark plugin over the Markdown tree, so the link survives rehype); a marker with no matching Source fails the build.

### The citation contract

7. **Default: cite a Research question.** A Speaker note's `sources` list is the citation point; each of its items carries exactly one of `research` or `url`. A `research` item names a Research question by id; its title, link and `confidence` come from the question, so the item has no title of its own. (Wording: _Speaker note item_ in _Layers_ is the unit a note's `sources` entries hang on; every entry in a note's `sources` is one citation.)
8. **Exception: cite a Source directly, only when it is high trust.** A `url` item keeps today's `url` and its title in the Slide's `i18n`, and needs a host on the allowlist (rule 9) or an entry in the migration baseline (rule 13); no item has both `research` and `url`, or neither. A Source that is not high trust is never cited directly: the claim needs a Research question, which is where weak Sources are weighed, caveated and given a `confidence`.

   ```ts
   sources: [
     { slug: 'onboarding', research: 'AIE-0001' }, // default: the note cites a Research question
     { slug: 'claude-docs', url: 'https://docs.anthropic.com/…' }, // direct: host is on the allowlist
   ];
   ```

   The citation attaches where the claim is made; today that is the note's `sources` list, and attaching to a single note item is the implementer's refinement.

9. **What decides high trust: the Source's host, from one allowlist** (the host list is `decided-for-Han (test run)`, contestable). A Source is high trust when its host is an accountable primary publisher of the claim it supports. Three kinds qualify: a vendor's own documentation for what that vendor's product does (`anthropic.com` and `claude.com` hosts for Anthropic's products), a standard or law's own text (`eur-lex.europa.eu`), and the scholarly record (`arxiv.org`, `doi.org`, `nber.org`, `aeaweb.org`). The list lives in code in one place, one entry per host with a reason line. There is exactly one level: on the list is high trust, off it is not; markdown-harness cannot hold levels either. Matching is anchored on `https://` and the host, so `docs.anthropic.com.evil.example` is not `docs.anthropic.com`. Adding a host is a trust decision, not a content edit: Han accepts it. Blogs, analytics vendors, media and aggregators (`hbr.org`, `paulgraham.com`, `steveblank.com`, `benchmarks.ebsta.com`, `github.com`) are not on it. A host says who publishes, not that a given page is right, so a cited Source still needs a Research question when the claim is contested.
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

### Implementation sketch (non-binding; implementer decides)

- Source shape: `{ slug, research: 'AIE-0001' }` or `{ slug, url }`; the allowlist is one code module, one entry per host with a reason line.

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

1. **The shared pool is one flat folder of Slide folders,** with the same shape as any Slide folder. A Slide lives in its Episode's `slides/` until first reuse. First reuse is one command that moves the folder into the pool, re-points the owning Episode's import, and adds the reference to the reusing Episode. Slug, text and anchors do not change, so no published URL moves. Pool Slides obey the same import boundary as any Slide.
2. **An Episode lists a pool Slide by reference.** An unchanged reuse is a reference: the Episode's Section list names the pool Slide; nothing is copied.
3. **An instance is a Slide folder in the Episode's own `slides/`,** copied from the pool Slide the moment a Run edits it. It gets its own globally unique slug at the copy, never the origin's, and carries a marker `copiedFrom` naming the origin Slide and the commit it was copied at. A copy that no edit has touched is deleted and replaced by a reference, so no unchanged instance outlives its Run.
4. **The Promotion Gate resolves every instance,** one decision per instance, Han deciding:
   - **Update the shared Slide:** the instance's content replaces the pool Slide, the Gate lists every Episode that references the origin, and the instance folder is deleted. The Episode's entry becomes a reference to the pool Slide and **pins the retired instance slug as its anchor**, so that Episode's published anchor does not move. If the pool Slide changed since `commit`, the Gate says so and Han reconciles by hand; there is no automatic merge.
   - **Become its own Slide:** the `copiedFrom` marker is removed; slug, folder and anchors stay. **Flagged deviation:** the map's resolution (316 #8) says "under a new slug"; this keeps the instance's slug instead. It was unique since the copy (rule 3), so nothing collides, and a new slug would move a published anchor, which vision rule 4 and the published-anchors test forbid. Contestable. The Slide is a new Slide in the Episode's folder, and reuses by the same rule 1.
     Neither outcome renames a slug, so a promotion collision cannot occur: the instance's slug was unique from birth.
5. **`slideHref` resolves per Episode, by the slug the Slide author wrote.** A Slide in the pool links to a sibling by that sibling's pool slug. The walk resolves it to this Episode's placement of that Slide or, if the Episode holds an instance copied from it, to the instance; it emits the Episode's own anchor, including a pinned one. A sibling the Episode does not hold fails the build (as before), unless the call site opts into a text fallback, which renders plain text. Adding a pool Slide to an Episode therefore fails the build until its linked siblings are there too, or the author has made the link optional.
6. **An unlisted Episode's `slides/` changes nothing:** it owns Slides, references pool Slides, makes instances and promotes exactly as a public Episode. Its Slides sit in the same global slug namespace and its anchors are snapshotted by the same published-anchors test.
7. **Global slug uniqueness refuses, at build and in the command that creates a Slide or instance:** a slug used by two Slides anywhere (Episode folders and pool together); a retired instance slug reused, since the Episode's pin keeps it reserved; an instance given its origin's slug. Title slides are exempt; their anchor stays per Episode.

### Implementation sketch (non-binding; implementer decides)

Paths and shapes below are examples; the map leaves them to the implementer.

- The pool folder is `src/components/slide-pool/<slug>/`; first reuse is a `git mv`.
- `copiedFrom: { slug, commit }` in the instance's entry.
- Fallback call: `slideHref(slug, { fallback: 'text' })`.

Failing tests, in Han's words:

- "Reusing a Slide in a second Episode moves it into the pool and the first Episode's page looks the same."
- "Editing a reused Slide in one Episode does not change it in the others."
- "Promoting an edit as an update changes the shared Slide, lists the Episodes it affects, and no published anchor moves."
- "Promoting an edit as its own Slide keeps its slug and anchors."
- "A link between sibling Slides still works in an Episode whose siblings differ, and a missing sibling fails the build."
- "Two Slides with the same slug anywhere are refused."

## Delivery contract

Settled in ticket _Delivery contract: Event, Playlist, routes and visibility_ (each point `decided-for-Han (test run)`, contestable). It amends _Tags replace Topics_ decision 5 and refines the Event + Playlist decision above.

### Records

1. **An Event** is a dated occasion: slug (`<date>-<name>`, e.g. `2026-10-23-axel-agentic-workflow`), date, kind (`workshop` | `webinar` | ...), optional time and location, the Audience it targets, and the id of the one Playlist it presents. It owns no Slides, holds no text (title and description are Translation keys by slug, FE-003) and has no `visibility` and no status of its own.
2. **A Playlist** is an ordered list of Episode ids with a `type` and a `visibility`, and nothing else: no overrides, no entry record, no video.
   - `type: event`: made for exactly one Event; its first entry is that Event's event-frame Episode (a test refuses otherwise). `type: standard`: a curated list with no Event.
   - `visibility: public | unlisted`: whether the Playlist's own surfaces are listed and indexed. An Event page takes its visibility from its Playlist. `attendees` is refused by the schema until horizon 3 gives it an enforcer (a static site cannot hide anything).
3. **An Episode** gains `type: standard | event-frame` and `visibility: public | unlisted`.
   - `event-frame` holds agenda, scope and organisational information for one Event, has no video, and is always `unlisted` (a test refuses a public one). It carries `status: published`, never `upcoming`: its Event's date, not its own status, decides whether the occasion is upcoming. It is never a card in the Episode overview and never an Upcoming Episode.
   - `status: upcoming` (video not out) applies to public Episodes only; an unlisted Episode is published when its page exists. Upcoming and unlisted stay two separate axes.
4. A public `standard` Playlist lists only public Episodes (a test refuses otherwise); an `event` Playlist may list unlisted Episodes whatever its own visibility, so a public Event may present unlisted Episodes. Episode slugs are unique across all Episodes, so a route never needs the Playlist to disambiguate.

### Routes

| URL (`/de` prefix for German)                   | What it is                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `/events/`                                      | Index of Events whose Playlist is public. Replaces `/workshops/`.              |
| `/events/<event-slug>/`                         | The Event page: facts, Playlist as a numbered list, event-frame Episode first. |
| `/events/<event-slug>/episodes/<episode-slug>/` | One Episode of that Event's Playlist, with its position in the Playlist.       |
| `/episodes/<episode-slug>/`                     | A public Episode, unchanged. An unlisted Episode has no such URL.              |

- One `events` route serves every Event kind; the kind is data, so a workshop that becomes a webinar keeps its URL.
- Static params are closed at build time (FE-005): one per Event and one per Playlist entry, no params outside that set. An unlisted Episode in no Event's Playlist is an orphan and a test refuses it.
- There is no Playlist route yet. The first public `standard` Playlist brings `/playlists/<playlist-slug>/` in its own ticket (horizon 2).
- The three catalogue pages that sit in `EPISODE_SLUGS` today as "unlisted" (`slide-layouts`, `slide-master`, `slides`) are tooling pages, not Episodes in this model. They move to a separate tooling-pages list outside the Episode slugs and carry no `visibility`; they keep their URLs, are `noindex`, self-canonical and sitemap-free (visibility table). Today `isNoindex` does not cover them and they are indexed.

### Redirects

- One 301 per locale from each old Workshop URL to its Event: `/workshops/axel-agentic-workflow-2026-10-23/` to `/events/2026-10-23-axel-agentic-workflow/`, the `/de/` pair, and `/workshops/` to `/events/` with its `/de/` pair. They go in `public/_redirects` in the same change as the rename (`docs/features/hosting.md`); `next.config.ts` cannot hold them (FE-005 §2). Four lines now, far under the 2,000 static limit.
- A build test reads `_redirects` and fails when a legacy Workshop slug has no line. Redirects themselves need Pages, so no browser test can follow them.
- The temporary github.io redirect stubs derive from `out/` and will not gain stubs for the old `/workshops/` URLs; accepted, since that deploy is being switched off.

### Visibility, indexing and canonical

One predicate decides each page's treatment and both `pageMetadata` and the sitemap ask it (FE-008 §5), so they cannot disagree:

| Page                                                                   | In sitemap                                  | Robots                                                                             | Canonical                             |
| ---------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| Public, published Episode at `/episodes/<slug>/`                       | yes                                         | index                                                                              | itself, with hreflang                 |
| Event page, Playlist public                                            | yes                                         | index                                                                              | itself, with hreflang                 |
| Event page, Playlist unlisted                                          | no                                          | `noindex`                                                                          | itself                                |
| Unlisted Episode under an Event, no public original                    | no                                          | `noindex`                                                                          | itself                                |
| Unlisted Episode that declares `canonicalEpisode: <public episode id>` | no                                          | index                                                                              | that public Episode's URL             |
| Public Event whose Playlist holds unlisted Episodes                    | Event page: yes; unlisted Episode pages: no | Event page index; unlisted Episode pages `noindex` unless they declare a canonical | itself, or the `canonicalEpisode` URL |
| Tooling page (`slide-layouts`, `slide-master`, `slides`)               | no                                          | `noindex`                                                                          | itself                                |
| A public Episode viewed at an Event-scoped URL                         | no                                          | index                                                                              | its `/episodes/<slug>/` URL           |
| An upcoming public Episode viewed at an Event-scoped URL               | no                                          | `noindex`                                                                          | itself                                |
| Upcoming Episode (public only)                                         | no                                          | `noindex`                                                                          | itself                                |

- `noindex` is a meta tag, never an `X-Robots-Tag` entry in `public/_headers` (a second source of truth, and per-path lists drift). `robots.txt` stays `allow: /`, since a crawler must fetch a page to see its `noindex`.
- A page with a canonical elsewhere carries no `noindex` (the two signals contradict) and no hreflang of its own; the sitemap lists only self-canonical, indexable pages. No indexable page canonicalises to a `noindex` page, so an Episode reached at its Event URL is indexable only once its own page is.
- `canonicalEpisode` must name a public Episode (a test refuses otherwise). It is the only way an unlisted Episode points at another; duplicating an Episode references the original's Slides, never copies them, and sets this field by hand. A check enforces it: an Episode derived from a public Episode (an unlisted Episode whose Slide list holds every Slide of a public Episode; the detection is the implementer's) must name `canonicalEpisode`, else the build fails. `decided-for-Han (test run)`.
- **Unlisted is not private.** The URL is public to anyone holding it; nothing confidential belongs in an unlisted Episode. Access control waits for horizon 3.
- The Episode overview and Upcoming Episodes list public, `type: standard` Episodes only. The `/events/` index and the header's Events entry (which replaces Workshops) list public Events only.

### Past Event

- **Past** means the Event's date is before the build date. It is derived, never stored, because an Event has no status. A static page is only as fresh as its last deploy, so a past Event may lack its notice until the next push; accepted.
- References are live and never pinned, so a past Event shows what the Episodes say today. The notice exists, as one fixed line saying the content may differ from the recording.
- It appears on the Event page, above the Playlist, and on every Event-scoped Episode page, above the title: those are the URLs someone holding a recording opens. It does not appear on `/episodes/<slug>/`, which belongs to no Event. An upcoming Event shows none.
- Its wording, look and exact position are left to ticket _Prototype: an Event page and an unlisted one-off Episode_.

### Implementation sketch (non-binding; implementer decides)

- Route static params: `{ event }` per Event, `{ event, episode }` per Playlist entry, with `dynamicParams = false`.

### Failing tests (in Han's words)

- "An unlisted Episode never shows in the sitemap, the Episode overview or an Upcoming list."
- "An unlisted Episode page tells search engines not to index it."
- "An Episode I derived from a public one points its canonical at the public page."
- "I open the old workshop link and land on the Event page" (build test over `_redirects`, plus the `/de` pair).
- "An Event's page lists its Episodes in the Playlist's order, event-frame first."
- "A past Event says its content may differ from the recording; an upcoming Event does not."
- "A tooling page is never in the sitemap."
- "An Episode derived from a public one that does not name its canonical Episode fails."
- Fast suite: the schema refuses a public event-frame Episode, a public `type: standard` Playlist with an unlisted Episode, `visibility: attendees`, a canonical naming a non-public Episode, an orphan unlisted Episode, an Event whose Playlist is missing or not `type: event`.

## Pipeline and evidence

Settled in ticket _Pipeline and evidence: how /new-episode draws on and grows research_ (answers `decided-for-Han (test run)`). It amends _Episode content is staged then promoted_ and uses _Citations_ and _Slide reuse_ as given. Facts: `skills/new-episode/assets/pipeline.yml` (Setup jobs `categorize-research`, `retrieval`, `convert-references`, `customize-pipeline`; Research job `write-research`), `references/retrieval.md`, `references/write-research.md`, `skills/episode-promote/SKILL.md` step 7 and `promote-research.ts`.

### Reuse before commission

1. **A Run draws on the evidence layer first and commissions only what is missing.** For each Research question in the Brief, `retrieval` searches the Research questions of the wiki and of every other open Staging, narrowed first by the Concepts the question belongs to, and decides one outcome:
   - `reuse <id>`: a question fits (its h1 and `Context` support the claim this Episode makes, not just the topic) and is fresh (`stale_after` is later than today). No job; Slides cite it by id.
   - `refresh <id>`: fits but stale. A job rewrites it.
   - `new`: nothing fits, or a question answers only part. A job writes one; the partial match is cited as a Source.
     `confidence` does not decide reuse: an `open` or `contested` question is reused as it stands, and the plan names its `confidence` so the Dossier carries the caveat and never states the claim as settled.
2. **`categorize-research` stops adding categories.** The categories dissolve (_Research categories_). The job now names each new folder with the nearest existing prefix and the next free number across the wiki and all Staging, and returns beside each question the Concept ids the question informs (the first the main one). It no longer edits `GLOSSARY.md`. A question that fits no Concept returns a `concept-gap` note instead of inventing one; a new narrower Concept is a markdown file the Run stages with its research and Han confirms at Promotion, and a new top Concept stays a design decision (_Top Concepts_).
3. **A near duplicate is caught at retrieval, not at Promotion.** The `AIE-0014` and `LLM-0001` overlap came from a Run that could not see another Run's Staging. Retrieval now reads staged questions of other open Runs, so a question that another Staging already answers is `reuse` of that staged id (citable, _Citations_ rule 12), never a second `new`. Already staged overlaps are resolved at the Promotion Gate (below).
4. **A refresh keeps the id.** An id is cited by notes and never reused (_Citations_ rule 1), so a refresh that took the next number would orphan every citation. The refresh job writes the same folder name in the Run's Staging; the duplicate-id check allows a staged id that shadows a wiki id only when the plan lists it as `refresh`; Promotion replaces the wiki file. Its `confidence` resets to a proposal Han confirms again (_Citations_ rule 5). This closes the question design-ADR _Episode content is staged then promoted_ left open.

### The research Stage is optional, the proof is not

5. **The Research Stage may hold no Job.** The Glossary already lets a Stage hold none; this makes it a normal outcome rather than the `- none: every question reused.` special case. An Episode whose every claim is reused, whose Slides are all references, or an event-frame Episode with no new claim, runs with an empty Research Stage. What is not optional is the proof: a Slide whose claim has no Research question or high-trust Source fails the citation checks (_Citations_), so an empty Stage is allowed only because retrieval found the evidence already there.
6. **The Research plan changes shape.** `research-plan.md` keeps `## Research jobs` and `## Reuse`, and each item gains what the contract needs:
   - Under `## Reuse`: each reused question with its `confidence` and the date it stays fresh.
   - Under `## Research jobs`: a `new` job names its Concepts it informs; a `refresh` job names the stale id. A third kind, `migrate`, is the touch rule below.
   - The rule `research-plan-body` fails an item with no `informs`, a reuse of an id that does not exist, and a refresh that names a folder other than the stale id's.
7. **Migrate on touch is a research job.** When the Slide plan (below) adapts a Slide, or the Run edits a note whose sources are in the grandfather baseline, retrieval lists one `migrate` job for those sources: a Research question that weighs them, so the baseline entries leave in the same Run (_Citations_ rule 13). The `implement-section` reviewer's rubric gains one line: no note the Section touched or copied keeps a baseline source. The ratchet itself stays the check's.
8. **The research writer's template changes** (handed on by _Citations_): `write-research.md` and its sample `AIE-0000` gain `informs` and `confidence`. The writer proposes `confidence` by the three definitions of _Citations_ rule 4 and says in one line which Sources earn it; it never sets a value for a question it did not weigh. Its rubric gains two lines: `confidence` follows the definitions, `informs` names Concepts that exist. `write-dossier` cites by id (`[AIE-0001]`), never by URL, except a high-trust Source.

### Promotion

9. **Research still moves in full, now through a Gate.** Cited or not, every staged question moves to `docs/llm-wiki/research/` (design-ADR _Episode content is staged then promoted_ keeps this). The Promotion Gate's harvest gains a card per staged question: `confidence` and `informs` for Han to confirm (_Citations_ rule 5), with the writer's one-line reason. `episode:promote-research` refuses, before moving, a question with no confirmed `confidence`, an `informs` that is not a Concept, an id the wiki holds that the plan did not list as `refresh`, or a staged Concept that is not accepted. Instance Slides are resolved at the same Gate by _Slide reuse_ rule 4.
10. **Duplicates are merged at the Gate, by decision.** Where two staged or wiki questions answer one question, Han chooses: merge into the older (its Answer gains the findings, the retired id is listed in a `supersedes` line and never reused, and every citation to it is re-pointed in the same commit) or keep both because the claims differ. For the standing overlap, the recommendation is to merge `AIE-0014` into `LLM-0001`: the claim is the same and neither id is public yet. No agent merges alone.
11. **Promotion still precedes publishing** an Episode that cites its own staged research (_Citations_ rule 12). The Promotion skill's step 1 says so.

### Reuse of Slides from the author's side

12. **A Slide plan joins the Run.** A new Setup job `slide-retrieval` writes `slide-plan.md` from the Brief's `## Slides` and the pool. For each Slide the Brief names it decides one outcome: `reuse <pool-slug>` (a reference), `adapt <pool-slug>, <what changes>` (an instance) or `new`. It matches a Slide that teaches a Concept first by Definition Slide (`defines: <concept-id>`), then by title and purpose. It lists every Episode that holds each candidate and the Research questions the candidate cites. A pool listing is generated on demand (slug, title, `defines`, Episodes holding it) so the job reads one page and never the folders.
13. **Research follows the Slides.** `retrieval` reads `slide-plan.md`: the Research questions that reused Slides already cite need no job and appear under `## Reuse`; a Slide marked `adapt` whose notes carry baseline sources yields a `migrate` job. `retrieval` needs `slide-retrieval`.
14. **What the author sees.** The Brief's Slide entries are unchanged; the plan is the agent's proposal and Han changes it at the Spec Gate, where it is shown. In the Spec a `reuse` Slide appears once, as it is, with no Options, labelled _reused from `<pool-slug>`, held by these Episodes_. An `adapt` Slide shows the pool Slide beside Options that only modify it. A `new` Slide behaves as today. Han can flip any Slide among the three at the Spec Gate; a flip is a feedback item keyed to its Slide.
15. **Build follows the plan.** `reuse` is one reference in the Episode's Section list, no folder. `adapt` runs _Slide reuse_ rule 3's copy command first (own slug, `copiedFrom`), then edits; if no edit lands, the copy is deleted and replaced by a reference. If the origin still lives in another Episode's folder, the reuse command moves it to the pool first (_Slide reuse_ rule 1), and the plan lists that move so the other Episode's owner sees it. `new` is built as today. The Dossier and the voice script are written only for `new` and `adapt` Slides; a reused Slide keeps its words.
16. **Reuse never touches the pool Slide's words from inside a Run.** Only the Promotion Gate changes a pool Slide, and only by _Slide reuse_ rule 4.

### A fix by hand feeds back

17. **A fix by hand is a commit that corrects content a Run or a person made, outside a Run's job.** Content means an Episode, a Slide (its own or a pool Slide), a Research question or a Concept: paths `src/components/episodes/**`, `src/components/slide-pool/**`, `docs/llm-wiki/**`. Product vision rule 5 makes it feed back; this makes it checkable (rule 1 prefers a check to goodwill).
18. **The commit says where the lesson goes** (`decided-for-Han (test run)`: the `Feeds:` trailer). A `fix(...)` commit that touches those paths carries a `Feeds:` trailer with one of: a path of the skill, template, reference or guide that should have got it right (`skills/new-episode/references/write-research.md`); an issue URL, which is enough under a deadline (rule 5) and which names the fix to make; or `none: <reason>` where the fix is a one-off typo or a fact that no process could have caught. The commit-time gate (the `commit` skill's husky check) refuses such a commit without one. A path must exist. An issue is filed with the `needs-triage` label and a title naming the skill.
19. **Promotion reads them.** The lessons harvester gains the `fix(...)` commits of the Episode's branch since its last Gate: a card per commit with a `Feeds:` path proposes the change to that skill, template or guide (landed by `pipeline-feedback`), one with an issue shows it, one with `none` is listed so Han can contest the reason, and a fix with no trailer cannot exist, because the gate refused it. A fix after Promotion has no harvest, so its trailer is the only route; `pipeline-feedback` reads open `Feeds:` issues when it runs.
20. **A fix to evidence feeds the writer.** A change of `confidence` or an Answer by Han feeds `write-research.md` or its rubric by the same trailer, so the next question is proposed better. Han's own confirmation at the Gate is not a fix and needs no trailer.

### Implementation sketch (non-binding; implementer decides)

- Listing command: `npm run slides:pool`.
- Plan lines: `Question <n>: reuse <id>, confidence <value>, fresh until <date>`; `new: <folder>, question <n>, informs <concept-id…>`; `refresh: <folder>, question <n>, <the stale id>`; `migrate: <folder>, <slide-slug>`.
- Slide plan outcomes: `reuse <pool-slug>`, `adapt <pool-slug>, <what changes>`, `new`.
- Content paths for the `Feeds:` gate: `src/components/episodes/**`, `src/components/slide-pool/**`, `docs/llm-wiki/**`.

Failing tests, in Han's words:

- "A Run whose every Research question already has a fresh answer writes no research and still cites each one."
- "A Brief question that another Run's Staging already answers is reused, not written again."
- "A refreshed question keeps its id, and the notes that cited it still resolve."
- "A research plan item with no Concepts it informs fails."
- "A new Research question is proposed with a confidence and the Concepts it informs; one without either fails."
- "Promotion refuses a research question whose confidence Han has not confirmed."
- "A Slide that is reused in a new Episode costs one reference, no Options and no Voice script."
- "Flipping a Slide from reuse to adapt at the Spec Gate changes the Slide plan and the Spec."
- "Adapting a Slide leaves the other Episodes unchanged, and an adapted note with a grandfathered source gets a Research question."
- "A fix to an Episode or a Slide without a `Feeds:` line is refused at commit; one that names a skill file that does not exist is refused."
- "Promotion lists every hand fix of the Run with where it feeds back."

Decided-for-Han (test run): all of the above, contestable.

## Event page behaviour

Settled in ticket _Prototype: an Event page and an unlisted one-off Episode_ from a throwaway static prototype (kept outside the repo, never merged). Han could not react in this run, so his reaction is played from the vision and the Delivery contract and is `decided-for-Han (test run)`, contestable.

- **Event page.** Breadcrumb (Events / Event), title, one facts line (kind, date, place, Audience), description, then, for a past Event, the notice, then the Playlist as a numbered list of Episode cards. The event-frame Episode is item 1, shaded as a band and chipped "Event page" (DE "Veranstaltungsseite"); an unlisted one-off carries the chip "Unlisted" (DE "Nicht gelistet"). The existing Episode card is reused; there is no new card type.
- **Event-scoped Episode page.** Breadcrumb ends in the Episode title; the past notice sits above the title; the title is followed by "Episode 2 of 4" (position in the Playlist) and previous/next links inside the Playlist, with a link back to the Event. Unlisted and public Episodes look the same here; only the chip on the Event page differs.
- **Past notice.** One fixed line, same copy on the Event page and every Event-scoped Episode page, shown as a bordered, warning-tinted callout with a role of `note`. It is not dismissible and carries no date. It is Translation keys, not a stored field:
  - EN: "This Event has already taken place. The content below is kept up to date and may differ from the recording."
  - DE: "Diese Veranstaltung hat bereits stattgefunden. Die Inhalte werden laufend aktualisiert und können von der Aufzeichnung abweichen."
- **Upcoming Event** shows the same page without the notice. Nothing marks an unlisted Episode as unlisted beyond the chip and `noindex`.
- Prototype verdict: the Delivery contract's placement (above the Playlist, above the title) reads right; no change to it.

### Proposed failing browser tests (in Han's words)

Each runs on the built export (`*.browser.test.ts`), one test per line.

- "An Event page lists its Episodes in the Playlist's order, event-frame first": the Playlist items' order equals the record's order and item 1 carries the event-frame chip.
- "A past Event says its content may differ from the recording; an upcoming Event does not": the notice element is present on a past Event page and absent on an upcoming one.
- "I open an unlisted Episode from its Event and the notice is above the title": on a past Event's Episode page the notice precedes the `h1` in DOM order.
- "The notice is not on a public Episode's own page": `/episodes/<slug>/` has no notice even when the Episode also belongs to a past Event.
- "I can walk the Playlist from an Episode": an Event-scoped Episode page shows its position ("2 of 4"), and next and previous land on the neighbouring Episodes' Event-scoped URLs.
- "The German Event page warns in German": `/de/events/<event>/` shows the DE notice and no English one.
- "An unlisted Episode reached from its Event tells search engines not to index it": the page carries `meta robots noindex` (the sitemap side stays in the fast suite).

Per the Testing rule, the first three are the corrected behaviour Han would react to; the rest pin the contract.

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
- Delivery contract: **Visibility on the Event.** Rejected: a second flag to keep in step with its Playlist; access lives in one `visibility`, as the handoff already ruled.
- Delivery contract: **`noindex` plus canonical to the public original.** Rejected: search engines read the pair as contradictory; the canonical alone consolidates the signal.
- Delivery contract: **Unlisted Episodes also served at `/episodes/<slug>/`.** Rejected: two URLs for one page, and the bare Episode route would then need to know which Events present it.
- Delivery contract: **A stored Event status (upcoming or past).** Rejected: it goes stale by hand; the date derives it.
- Event page behaviour: **A dismissible or dated past notice.** Rejected: a recording viewer must always see it, and a date goes stale.
- Event page behaviour: **A separate card type for the event-frame Episode.** Rejected: the existing Episode card with a chip and a band suffices.
- Pipeline and evidence: **Commission research for every Brief question, as today.** Rejected: it writes duplicates (`AIE-0014` beside `LLM-0001`) and spends a Run on proof that exists.
- Pipeline and evidence: **A refresh takes the next free id.** Rejected: it orphans every note citing the stale id; a refresh keeps its id.
- Pipeline and evidence: **Reuse only `settled` questions.** Rejected: most questions are `open` today; reusing with the caveat is honest and cheaper than rewriting.
- Pipeline and evidence: **Make research an optional proof (a claim may stand uncited).** Rejected: vision rule 3; only the Stage is optional.
- Pipeline and evidence: **Reuse planning inside `retrieval`, one job.** Rejected: evidence and Slides are different pools with different outcomes; two jobs keep each file one decision.
- Pipeline and evidence: **Trust agents to feed hand fixes back unprompted.** Rejected: it did not happen reliably (`LEARNINGS.md` lessons arrive from harvests); a trailer the commit gate checks does.

## Consequences

- `GLOSSARY.md` changes ship with each implementation ticket, never ahead of the code.
- Ids stay stable: horizon 3 progress tracking will key on them.
- Delivery contract: the Workshop record, its `/workshops` routes, `workshopsPage` Translation keys and `docs/features/workshops.md` give way to Event and Playlist records, the `/events` routes and `docs/features/events.md`; `PageRef` gains Event and Event-scoped Episode forms; `isNoindex` takes visibility.
- Delivery contract: unlisted pages are findable by anyone with the link, and a past-Event notice can lag a deploy.
- Slide reuse: a retired instance slug stays reserved for as long as an Episode pins it as its anchor.
- Slide reuse: adding a pool Slide to an Episode can fail the build on its sibling links, by design.
- Evidence vocabulary: a new top Concept is a new theme (icon and accent), so it is a design decision; the Tag record and its filter chips are replaced by the Concept store.
- Event page behaviour: the past notice is two Translation keys (`eventsPage` namespace), and the Event-scoped Episode page gains a Playlist position and previous/next links.
- Citations: a baseline file of off-list URL sources exists until it is empty; reviewed at the start of horizon 2.
- Citations: all 37 research files (24 wiki, 13 staged) gain `confidence` and `informs` in one change; the research writer's template gains them in the _Pipeline and evidence_ seam.
- Citations: adding a host to the allowlist is a trust decision Han accepts, like a new top Concept.
- Citations: Promotion must precede publishing an Episode that cites its own staged research.
- Pipeline and evidence: `categorize-research`, `retrieval`, `write-research`, the `research-plan-body` rule, the research sample, `write-dossier`, the `implement-section` rubric and `episode-promote` (step 1, harvest, `promote-research`) change; a new `slide-retrieval` job and `slides:pool` listing are added. `GLOSSARY.md` gains Slide plan and the Research plan's wording when they ship.
- Pipeline and evidence: the duplicate-id check permits one shadow, a staged `refresh` of a wiki id, until Promotion replaces the file.
- Pipeline and evidence: `fix(...)` commits on content paths need a `Feeds:` trailer; the `commit` skill and its husky gate gain the check.
