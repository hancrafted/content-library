# Coding standards

Read during review, not implementation. Mechanical rules live in lint, archgate and tests, which `npm run verify` runs; this file holds only where the binding rules are and the judgement calls no check can make.

## Where the rules are

- Archgate ADRs, `.archgate/adrs/`: the binding decisions. Each ADR's Do's and Don'ts are review criteria, whether or not a companion `.rules.ts` automates them.
- `GLOSSARY.md`: domain vocabulary. Names in code, tests and copy use its terms, not the ones listed to avoid.
- `docs/agents/`: design references for specific areas (Episode page layout, context drawer, translation keys, Episode migration). Apply the one covering the files in the diff.

## Judgement calls

- A change matches the surrounding code's style and structure; a new pattern earns a reason.
- A new check states where it runs (`verify`, pre-push, CI) and is wired there in the same change.
