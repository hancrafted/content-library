---
workflow: brief-or-pay-the-price
date: '2026-11-18'
fortify: skipped
skip-reason: 'skip fority and record qw and ar to learndings.md'
---

# brief-or-pay-the-price

The brief-or-pay-the-price Explorable.

## parallel-tickets-edit-same-file

- **Evidence:** #719, #721 and #724 were split into "new files only" and a second phase sent by message after the blocking ticket merged

## subagent-merges-without-build-tests

- **Evidence:** #719 and #720 merged on `verify` alone, the Integration push failed twice on `tests/post-build/episode-text.build.test.ts` and #720 hand-edited the snapshots (fix-episode-text ab251ac2e); the shared brief's rule 3 was changed mid-run
- **Evidence:** offered as QW-1 and AR-1 on the Fortify page, Operator skipped the picks (2026-11-18)

## subagent-skips-acceptance-criterion

- **Evidence:** #718 dropped the morph fade-out and the BRIEF F "new" label, #720 the matrix FLIP from chip letters, #721 the BRACE→Workflow flight and the picker placement, each reported under Trade-offs and merged; the Operator or a review checkpoint found them (718-fix, #723, 721-review-fix)
- **Evidence:** offered as AR-2 on the Fortify page, Operator skipped the picks (2026-11-18)

## tracer-ticket-breaks-fe-012-patterns

- **Evidence:** review fixes for #716 (memoised parts §4.2, locale and words duplication) and #721 (client received both locales §1.2, dispatch into parts §4.1, controls registry §4.4); #720 and #723 built on the pattern first; brief-or-pay-the-price: offered as AR-4 on the Fortify page, Operator skipped the picks (2026-11-18)

## explorable-toolbar-not-shared-toggle-bar

- **Evidence:** UI feedback round 1, Han: "toolbar should be a toogle bar like the other explorables"; rebuilt on `ToggleGroup` in ui-feedback-1 (a2d9f0a56); brief-or-pay-the-price: offered as QW-3 on the Fortify page, Operator skipped the picks (2026-11-18)
- **Correction:** (UI feedback round 1) "toolbar should be a toogle bar like the other explorables and in one line on laptop" — the implementation built its own toolbar instead of the sibling Explorables' pill toggle bar.

## explorable-rows-change-height-between-tabs

- **Evidence:** UI feedback round 1, Han saw the jump; fixed with a fixed chip box in ui-feedback-1 and checked by hand in Chrome at 1512×804 (Q77, "No test now"); brief-or-pay-the-price: offered as AR-3 on the Fortify page, Operator skipped the picks (2026-11-18)
- **Correction:** (UI feedback round 1) "make sure that there is 0 ui jumping when switching between the 5 acronyms, which is the case right now" — row heights changed between definition tabs; no check caught it.

## no-cursor-pointer-rule-guard

- **Evidence:** Han asked for `cursor: pointer` on all clickable elements; `src/app/globals.css` got the rule in a2d9f0a56, no test pins it; brief-or-pay-the-price: offered as QW-2 on the Fortify page, Operator skipped the picks (2026-11-18)
- **Correction:** (UI feedback round 1) "in gernal all clickable elements should have cusror:pointer" — the site had no pointer rule after Tailwind v4.

## general-word-defined-as-project-term

- **Evidence:** PR #732 review, Han: "some of glosssary entry are masking very general terms. remove them."; Mirror, Cell and Annotation removed; brief-or-pay-the-price: offered as QW-4 on the Fortify page, Operator skipped the picks (2026-11-18)
- **Correction:** (PR #732 review) "remove" on the Mirror, Cell and Annotation glossary entries: "some of glosssary entry are masking very general terms. remove them."

## ticket-conflicts-with-binding-adr

- **Evidence:** #716 asked for one `i18n: { en, de }` file while FE-012 §1 required a pair per locale; found in the tracer's report, Han chose to amend FE-012 (fe012-amend 936123831); brief-or-pay-the-price: offered as QW-5 on the Fortify page, Operator skipped the picks (2026-11-18)

## grill-frames-domain-by-symmetry-or-example

- **Evidence:** three grill corrections (PRICE/BRIEF vs stages/BRACE symmetry, stages not agnostic, the summer party as the frame)
- **Correction:** (grill) The PRICE/BRIEF ↔ stages/BRACE symmetry was wrong: PRICE is a problem set that BRIEF solves; stages are a process and BRACE its principles.
- **Correction:** (grill) Stages are agnostic: DRIVE is one scenario, not hard-coded.
- **Correction:** (grill) The summer party is a use case only, not the frame of the definitions.

## operator-skips-fortify

- **Evidence:** "skip fority and record qw and ar to learndings.md" (2026-11-18), its picks recorded as proposed
- **Correction:** The Operator skipped the Fortify picks: "skip fority and record qw and ar to learndings.md".
