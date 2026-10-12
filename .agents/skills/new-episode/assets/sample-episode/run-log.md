# Run log

## brief-grill · 2026-10-12T09:00:00Z

### Inputs

- One-line idea: "why agents forget in long sessions".

### Output

- `brief.md`, `status: approved` by Han at the Brief gate.

### Checks

- `mh check`: pass.

### Metrics

- implementor · attempt 1 · pass · 1800 s · 42000 tokens

### Notes

Han reworded the Red thread at the gate; the agent's candidate framed the window as memory, not budget.

## research · 2026-10-12T10:15:00Z

### Inputs

- `brief.md#research-questions`, question 1.
- `docs/llm-wiki/index.md`: no match.

### Output

- `research/AIE-0000__why-recall-degrades-with-position/research.md`, `status` not applicable.

### Checks

- `mh check`: pass.
- Reviewer: pass.

### Metrics

- implementor · attempt 1 · fail · rubric "Every Finding cites a Source" · 240 s · 18000 tokens
- implementor · attempt 2 · pass · 120 s · 9000 tokens
- reviewer · attempt 2 · pass · 60 s · 6000 tokens

### Notes

The first attempt left Finding 3 uncited; the reviewer line went back verbatim and the retry fixed it.
