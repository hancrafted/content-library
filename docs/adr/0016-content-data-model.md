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

_Pending: ticket *Citations: how does a claim cite a Research question?*._

## Slide reuse

_Pending: ticket *Slide reuse: shared pool, instances and Promotion*._

## Delivery contract

_Pending: ticket *Delivery contract: Event, Playlist, routes and visibility*._

## Pipeline and evidence

_Pending: ticket *Pipeline and evidence: how /new-episode draws on and grows research*._

## Event page behaviour

_Pending: ticket *Prototype: an Event page and an unlisted one-off Episode*._

## Considered options

- **Always copy, then merge at Promotion.** Rejected in the initial grill: Promotion becomes a three-way merge, drift needs a recorded base, and an unpromoted copy becomes a permanent fork.
- **A separate Astro/Starlight evidence site.** Rejected: evidence renders on this site, one build and one link graph.
- **Evidence vocabulary: one-to-one Tag rename.** Rejected: `workflow` grouped no subject and two research areas (model behaviour, adoption) had no home.
- **Evidence vocabulary: keep research categories as a Concept field.** Rejected: a second axis beside `broader` that two Concepts can disagree on.
- **Evidence vocabulary: store `narrower`.** Rejected: it is the inverse of `broader`; two copies drift.

## Consequences

- `GLOSSARY.md` changes ship with each implementation ticket, never ahead of the code.
- Ids stay stable: horizon 3 progress tracking will key on them.
- Evidence vocabulary: a new top Concept is a new theme (icon and accent), so it is a design decision; the Tag record and its filter chips are replaced by the Concept store.
