---
type: adr
id: GEN-004
title: 'Escalated Tech Debt'
domain: general
rules: true
files: ['src/**/*', 'tools/**/*', 'skills/**/*', '.github/**/*']
paths: ['**/*']
description: 'Escalation is the compliant path for a shortcut: name the trade-off, state the cost, get it accepted, then fence it with a bare tech-debt: pointer to its issue.'
---

# Escalated Tech Debt

## Context

A shortcut taken silently is debt nobody priced; one taken openly is a business decision. Agents under deadline reach for the shortcut first and mention it never, so the record has to be part of the work.

Prohibition fails the other way: an agent forbidden to cut corners cuts them out of sight. The compliant path is escalation, and only the unescalated shortcut violates.

## Decision

### 1. Escalate before building

1. A change that would trade architecture or agent legibility for delivery MUST stop and escalate first: name the trade-off, state the cost (what gets harder later, how to undo it), and get Han to accept it.
2. Acceptance is a business decision; an agent MUST NOT accept on his behalf.
3. After acceptance the shortcut MUST be fenced to the smallest scope that contains it.
4. A change that trades neither architecture nor agent legibility MUST proceed without asking.

### 2. Mark and file (📜 Rule: `tech-debt-links-issue`)

1. Every accepted shortcut MUST carry a `tech-debt:` pointer marker at its fence: the label and this repo's issue URL, nothing else — `// tech-debt: https://github.com/hancrafted/content-library/issues/<n>`.
2. The pointer sits on its own line, directly above the fenced code. `#` form where the language comments with `#` (YAML, shell), `/* */` in CSS.
3. The pointer holds the location only. The issue carries the `tech-debt` label and states the shortcut, its cost and the undo; prose at the fence, or a bare `#12`, does not count.
4. Prose naming the marker is not one: only a marker opening a comment is checked.

## Do's and Don'ts

### Do's

1. **DO** stop and ask before a shortcut, naming its cost. (Decision 1)
2. **DO** proceed without asking when a change trades neither architecture nor agent legibility. (Decision 1)
3. **DO** fence the shortcut and file its issue in the same change. (Decision 1)
4. **DO** fence with the bare pointer — `# tech-debt: https://github.com/hancrafted/content-library/issues/<n>` in a workflow. (Decision 2, 📜 Rule: `tech-debt-links-issue`)
5. **DO** write the cost and the undo in the issue. (Decision 2)

### Don'ts

1. **DON'T** take a shortcut without Han's acceptance and call it temporary. (Decision 1)
2. **DON'T** write a `tech-debt` marker with no issue URL, or with prose beside it — `// tech-debt: hand-rolled parser, <url>`. (Decision 2)

## Consequences

**Positive:**

1. **Priced debt:** every accepted shortcut has an owner-visible issue stating its cost.
2. **Compliant escape hatch:** an honest shortcut passes; only a hidden one fails.
3. **One home per fact:** the fence holds the location, the issue the reason; neither goes stale against the other.

**Negative:**

1. **Escalation costs a pause:** a deadline change waits for Han's answer.
2. **Escalation itself is unchecked:** the rule sees the marker, not whether acceptance happened; review carries that.
3. **Reason one hop away:** a reader at the fence opens the issue to learn why.

## Compliance and Enforcement

1. **Rule** `tech-debt-links-issue` (archgate, error): every source file under src/, tools/, skills/ and .github/; a `tech-debt` marker that is not a bare pointer to this repo's issue fails. Its test also holds it to the same verdict as the comment rule on a TS pointer.
2. **Review:** a shortcut with no marker is caught by `/code-review`.

**Exceptions:** raise a separate ADR; human approval required.

## References

- [Technical debt — Martin Fowler](https://martinfowler.com/bliki/TechnicalDebt.html) — debt as a deliberate, priced choice.
