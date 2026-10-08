---
type: agent-guide
---

# Grilling Format

How a grilling round is written in this repo. It covers every round: `/grill-me` and `/grill-with-docs`.

This **overrides** the grilling skill's "ask the whole frontier in one round". The frontier still decides which questions are askable; [classification](#classification) decides which of them reach the user.

## The opening

A session usually starts on a GitHub issue, and the user is not carrying what that issue was about. Write an orientation before Q1 — once when a `/grill-me` or `/grill-with-docs` session starts, and again each time the session picks up a new issue.

Two lines, no more:

1. **The purpose** — what the issue exists to settle, named by title.
2. **The end result** — what the user is holding when the session closes: a design-ADR on disk, a rewritten doc, a set of filed issues.

The orientation is not a question and takes no answer. Write it, then ask Q1.

## Classification

The user's attention belongs on contracts and architecture. Classify every candidate question before it is asked. Each question gets exactly one bucket: the first row below that fits.

| Bucket         | The answer changes                                                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `contract`     | everything at a seam or boundary: URLs and routes, the Episode format, what is stored in the browser, or the `npm run` command surface |
| `architecture` | software architecture, design pattern, communication pattern, an Archgate ADR or a design-ADR, or needs a new one                      |
| `workflow`     | what a future agent session does — an agent-guide, a skill, `AGENTS.md`                                                                |
| `neither`      | none of the above: every reasonable answer leaves them as they were                                                                    |

The first three are **asked**. `neither` is **decided**.

### Asked questions

- **One decision per question.** A question that needs "and" is two questions.
- **No cap on count.** A cap compresses several decisions into one question, and then they can no longer be answered separately. The filter is what keeps rounds short; if fifteen questions are genuinely asked, the user wants all fifteen.
- **Most consequential first**, so time running out costs the cheap end.
- The frontier rule stands: a question whose answer hangs on another open question waits for a later round.

### Decided questions

Decide every `neither` question yourself and list it at the end of the round under **Decided without asking**, one line each: the decision, then its reason, naming the design principle where one applies — cohesion, coupling, blast radius. The reason is what lets the user spot a misclassification at a glance. A line the user leaves uncontested when answering the round is settled. A contest is recorded under [Classification cases](#classification-cases).

## Question shape

Keep the grilling skill's markers (`❓ **Qn**`, `➡️`) and fill each question out in this order:

1. **The bucket and a full wh-question** as the headline: `❓ **Q1** · contract — **Which …?**`. The bucket lets the user contest the classification. The wh-question ends in a question mark and names its own subject, so it reads on its own with nothing above it. "Which directory should own the Episode files?" — not "Where Episode files live". A noun phrase makes the user reconstruct the question before they can start answering it.
2. **Options** as a numbered list, one sentence each, with at most one `because` reason.
3. **A recommendation** under the options, naming the option it picks and why it wins.
4. **An example per option**, showing what the decision looks like once taken — the file it writes, the config it changes, the directory layout it produces. Show the effect; don't describe it.

Every example gets the same shape, the same depth, and inline comments giving the why in a few words — a design pattern or a reason. Write each one as though you were about to recommend it — a thin example under the option you are arguing against makes the recommendation before the reasoning does.

## Language

Write the question in plain words and keep the technical terms exact. A term is exact when `GLOSSARY.md` or the surrounding docs already establish it — reach for that one rather than a synonym.

Coin nothing silently. Where a concept genuinely has no name yet, say so in the question ("no name for this yet, calling it a _lesson bundle_ here"), so a fresh word is never mistaken for established vocabulary.

## Refer by name

No bare id ever reaches the user. Every id-like handle travels with its name or slug:

- `FE-003-localization`, never `FE-003`.
- A design-ADR by its title, never `design-ADR-0007`.
- Issues by their title, never `#12`.

The id alone is unreadable; the name carries the meaning while the id keeps the trail.

## A round in this format

Opening: _Where Episode files live_. This issue settles which directory owns the Episode files, one per Locale. You leave with one design-ADR on disk. The example is illustrative, not a decision.

---

❓ **Q1** · architecture — **Which directory should own an Episode's German text?**

1. Next to the English text, in the same Episode folder, because one folder then holds everything about one Episode.
2. In a separate `de/` tree that mirrors the English one, because translators can work without touching English files.
3. In `src/lib/messages.ts`, because the site already keeps UI strings there.

➡️ **Recommendation: Option 1.** One folder per Episode keeps both languages in step: a change to one is visible next to the other.

#### Concrete Examples

**Option 1: Same Episode folder**

```text
docs/episodes/
└── feedback-loops/
    ├── episode.md       # Colocation: the English text, canonical at the bare root
    └── episode.de.md    # Colocation: the German text sits beside its source
```

**Option 2: Mirrored `de/` tree**

```text
docs/episodes/
├── feedback-loops/
│   └── episode.md       # Separation: English files untouched by translation work
docs/episodes-de/
└── feedback-loops/
    └── episode.md       # Mirror: same path, different tree, drift is easy to miss
```

**Option 3: In `messages.ts`**

```text
src/lib/
└── messages.ts          # Single table: every string for both languages, grows with each Episode
```

## A classified round

The round above shows the question shape; this one shows classification, in this repo's buckets. The issue _Decide what an unknown locale prefix returns_ listed four decisions, one of them compound. Classified, they become two asked questions and two decided lines. The example is illustrative, not a decision.

Opening: _Decide what an unknown locale prefix returns_. This issue settles what a visitor gets at a path like `/fr/episode/page-template`. You leave with a design-ADR on disk.

---

❓ **Q1** · contract — **What should a path with an unknown locale prefix such as `/fr` return?**

1. A 404 page, because only `/de` exists as a prefix.
2. A redirect to the English page, because the visitor most likely wants the content.
3. The English page served at the unknown prefix, because nothing is lost.

➡️ **Recommendation: Option 1.** Option 3 gives one page two URLs, which search indexes treat as duplicates. Option 2 needs a redirect, which a static export cannot do without a client script. The status code changes what a visitor and a crawler see, which is what makes this `contract`.

**Option 1: 404**

```text
/fr/episode/page-template
result: 404 page                       # fail closed: an unstated Locale gets no content
```

**Option 2: redirect**

```text
/fr/episode/page-template
result: client redirect to /episode/page-template   # trust the visitor's intent, needs a script
```

**Option 3: serve English**

```text
/fr/episode/page-template
result: English page at the /fr URL    # forgiving, but a duplicate URL for one Episode
```

---

❓ **Q2** · architecture — **Which layer should reject the unknown prefix?** _(options, recommendation and examples as in Q1)_

---

**Decided without asking:**

- The test for unknown prefixes sits beside `locale.test.ts` — one test file per pure module: cohesion.
- The 404 page reuses `SiteShell` — one header and footer, no second layout to keep in step: coupling.

## Classification cases

When the user pulls a **Decided without asking** line back into a question, or waves an asked question off as mechanics, add one line here: the question, the bucket it was given, the bucket the user gave it, and why. The filter sharpens from these instead of staying general.

_None yet._
