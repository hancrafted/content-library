---
type: design-adr
status: accepted
---

# Reading time is counted from the Voice script

A Slide's minutes, and each Voice script segment's `from`/`to`, are computed from the words the speaker reads: script plus bridge, at 140 words per minute in English and 120 in German. No Slide or segment declares a time. An Episode whose total is 0 shows no time: the table of contents hides its time-left label and the landing card shows no minutes. The rules live in `FE-002` §2 and `FE-010` §3; the count lives in `src/lib/speaking-time.pure.ts`.

## Why

Run 2 of the migration experiment wrote minutes by hand twice per Slide (once per locale) and segment spans a third time, beside a script that already fixed them. Nothing checked one against the other: edited scripts kept stale minutes, German minutes were copied from English, and a Slide with no script still claimed minutes. Counting removes the second source instead of checking it.

## Rates

- **en 140, de 120 words per minute.** Spoken presentation pace sits around 130–150 words per minute; German words are longer and compound, so fewer fit in a minute. One constant per locale, not per speaker or Slide.
- **Times stay exact fractions.** Spans and totals keep fractional minutes; only what a reader sees is rounded, and rounded up, so the last minute never reads as 0 before the end.

## Rejected

| Alternative                                 | Why not                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Keep hand-written minutes, test them        | A test would compare two numbers that each drift; it can say they disagree, not which is right. Counting has one source.      |
| Count from Slide text, not the Voice script | A reader's time on a visual Slide is not its prose length; the talk's length is what the recording and the reader both share. |
| Show a time for an Episode without a script | Any number would be a guess presented as a measurement. No script, no time.                                                   |
| Per-segment pace overrides (demos, pauses)  | Adds back a hand-written number per segment. Accept the error until a recording gives real timings.                           |

## Costs accepted

1. **Reading time is only as good as the Voice script.** A short or missing script understates it; a demo or a pause adds no words. At adoption, totals moved (en/de): ai-token-economy 30/30 → 0/0 (no script yet, so no time shown), amnesiac-freelancer 28/34 → 7/8, maintaining-markdown-for-ai 23/24 → 10/6, page-template 2/2 → 1/1.
2. **One pace per locale.** Speakers differ; the rate is a convention, not a measurement.

## Related

- `FE-002` (reading time from the script, hidden at 0), `FE-010` (segment spans counted, no time fields).
- `design-ADR-0001` (Slide-as-unit): a Slide declares slug, notes, segments, Canvas — no longer minutes.
