# Run log

## brief-grill · 2026-10-12T09:00:00Z

### Inputs

- One-line idea: "why agents forget in long sessions".

### Output

- `brief.md`, `status: checked`, committed with `Gate: draft brief` for Han to approve.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.

### Metrics

- implementor · attempt 1 · pass · 1800 s · 42000 tokens

### Notes

Han reworded the Red thread in Settle; the agent's candidate framed the window as memory, not budget.

## write-research · 2026-10-12T10:15:00Z

### Inputs

- `brief.md#research-questions`, question 1.
- `docs/llm-wiki/index.md`: no match.

### Output

- `research/AIE-0000__why-recall-degrades-with-position/research.md`, `status` not applicable.
- Edited #101 · 2026-10-12T10:14:00Z, body ends `Edited-by: write-research`.

### Checks

- `mh check`: pass.
- Reviewer: pass.

### Metrics

- implementor · attempt 1 · fail · rubric "Fail if a finding cites no Source" · 240 s · 18000 tokens
- implementor · attempt 2 · pass · 120 s · 9000 tokens
- reviewer · attempt 2 · pass · 60 s · 6000 tokens

### Notes

The first attempt left Finding 3 uncited; the reviewer line went back verbatim and the retry fixed it.
