# Run log

## brief-grill · 2026-10-12T09:00:00Z

### Inputs

- One-line idea: "why agents forget in long sessions".

### Output

- `brief.md`, with a `process:markdown-harness` `verified` entry, committed with `Gate: draft brief` for Han to approve.

### Checks

- `mh check`: pass.
- `vitest` staging test: pass.

### Notes

Han reworded the Red thread in Settle; the agent's candidate framed the window as memory, not budget.

## retrieval · 2026-10-12T09:45:00Z

### Inputs

- `brief.md#research-questions`, questions 1 and 2.
- `docs/llm-wiki/index.md`.

### Output

- Question 1: new, no index entry explains why recall depends on position.
- Question 2: reuse `docs/llm-wiki/research/AIE/AIE-0004__context-and-brief-improve-ai-output/research.md`.

### Research jobs

- new: AIE-0000__why-recall-degrades-with-position, question 1.

### Checks

- `mh check`: pass.

### Notes

Question 2 reuses the llm-wiki file: its `stale_after` is still ahead, and its Findings on what a focused context does to output support the claim the Episode makes.

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

### Notes

The first attempt left Finding 3 uncited; the reviewer line went back verbatim and the retry fixed it.
