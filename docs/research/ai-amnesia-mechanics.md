# Why an AI coding agent behaves like an amnesiac

Research date: 2026-10-08. Feeds the Episode "Treat AI like an amnesiac
freelancer you have to onboard". Not binding. Sources were fetched on the
research date; quotes are verbatim from the fetched page unless marked
otherwise. Vendor docs change; re-check before publishing a slide.

## Summary

- The model itself keeps nothing between calls. Each request is independent;
  "conversation" is the full history re-sent every turn, and "memory" features
  are files or notes injected into that request, not changed weights.
- A new Claude Code session "begins with a fresh context window". The only
  things that carry over are text that gets re-loaded: CLAUDE.md / AGENTS.md
  files and notes the agent wrote down.
- Long sessions fail differently: recall degrades as the window fills
  ("context rot"), and information in the middle of a long input is used worst.
- The model learned the world up to a training cutoff, never your repo, your
  conventions or last Tuesday's decision. That has to be handed over as text.
- Compaction (summarising old turns) keeps a session going but is lossy;
  vendors say so themselves and tell you to put persistent rules in files.

## 1. Model calls are stateless; "memory" is injected context

**1.1 Each API request is independent.**
Finding: OpenAI's API treats every generation request as independent; multi-turn
chat works only because you pass prior messages (or a response ID that chains
them) in again.
Source: https://platform.openai.com/docs/guides/conversation-state
Quote: "While each text generation request is independent and stateless, you can
still implement multi-turn conversations by providing additional messages as
parameters to your text generation request."
Related: even with `previous_response_id`, "all previous input tokens for
responses in the chain are billed as input tokens in the API", i.e. the history
is still re-processed each turn.

**1.2 The context window is the model's working memory, distinct from training.**
Finding: Anthropic defines the context window as everything the model can see
this turn, explicitly separate from the training corpus.
Source: https://platform.claude.com/docs/en/build-with-claude/context-windows
Quote: "The 'context window' refers to all the text a language model can
reference when generating a response, including the response itself. This is
different from the large corpus of data the language model was trained on, and
instead represents a 'working memory' for the model." Also: each turn's input
"contains all previous conversation history plus the current user message".
Figure: window is "1M (or 200k) tokens" depending on the model.

**1.3 A fresh session starts empty; two mechanisms carry knowledge over.**
Finding: Claude Code's own docs say a session starts with a blank window and
only CLAUDE.md files and auto memory persist.
Source: https://code.claude.com/docs/en/memory
Quote: "Each Claude Code session begins with a fresh context window. Two
mechanisms carry knowledge across sessions: CLAUDE.md files ... Auto memory:
notes Claude writes itself based on your corrections and preferences".

**1.4 CLAUDE.md is context, not enforcement, and not learned weights.**
Finding: these files are loaded as text at session start; the model may still
ignore them, and size hurts adherence.
Source: https://code.claude.com/docs/en/memory
Quote: "Claude treats CLAUDE.md files as context, not enforced configuration".
Figures: "target under 200 lines per CLAUDE.md file. Longer files consume more
context and reduce adherence"; auto memory loads "first 200 lines or 25KB".
To enforce, the same page points to a PreToolUse hook.
Corroboration: Anthropic's engineering blog says "CLAUDE.md files are naively
dropped into context up front" while grep/glob fetch other files on demand.
https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

**1.5 AGENTS.md (OpenAI Codex) works the same way: read once at start.**
Finding: Codex builds an instruction chain from AGENTS.md files when a run
starts, not continuously.
Source: https://developers.openai.com/codex/guides/agents-md
Quote: "Codex reads AGENTS.md files before doing any work." and "Codex builds an
instruction chain when it starts (once per run; in the TUI this usually means
once per launched session)."

**1.6 OpenAI's own memory features are described as a recall layer.**
Finding: Codex/ChatGPT memories carry "useful context" forward, but OpenAI says
not to rely on them for rules that must always apply; they are injected into
future sessions via a setting.
Source: https://developers.openai.com/codex/memories
Quote: "Keep required team guidance in AGENTS.md or checked-in documentation.
Treat memories as a helpful recall layer, not as the only source for rules that
must always apply." Setting: `memories.use_memories` "controls whether Codex
injects existing memories into future sessions."

**1.7 Anthropic's "memory tool" is files the app reads and writes.**
Finding: even the dedicated memory API is a client-side directory of files the
model reads back on demand, not a change to the model.
Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
Quote: "Claude can create, read, update, and delete files that persist between
sessions, building up knowledge over time without keeping everything in the
context window."

**1.8 The shift-work framing is Anthropic's own.**
Finding: Anthropic describes long-running agents exactly as engineers who forget
everything between shifts.
Source: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
Quote: "each new session begins with no memory of what came before. Imagine a
software project staffed by engineers working in shifts, where each new engineer
arrives with no memory of what happened on the previous shift."
Their fix is written artifacts (an initializer agent plus a progress file and
git history) that each new session reads first.

## 2. Context limits and degraded recall inside a long session

**2.1 Position matters: the middle of a long input is used worst.**
Finding: accuracy is highest when relevant info is at the start or end of the
input and drops when it sits in the middle, even for long-context models.
Source: Liu et al., "Lost in the Middle: How Language Models Use Long
Contexts", TACL 2024 (arXiv 2307.03172). https://arxiv.org/abs/2307.03172
Quote: "performance is often highest when relevant information occurs at the
beginning or end of the input context, and significantly degrades when models
must access relevant information in the middle of long contexts, even for
explicitly long-context models."
Figure (from the PDF, Table 1): gpt-3.5-turbo-0613 closed-book accuracy is
56.1%, and in the 20- and 30-document settings its accuracy with documents in
the worst position is lower than that closed-book figure, i.e. adding the
documents hurt. Caveat: models tested are 2023-era; newer models degrade more
gently, so cite the direction, not the size.

**2.2 "Context rot": more tokens, worse recall, across all tested models.**
Finding: Chroma tested 18 LLMs and found performance becomes less reliable as
input grows, even on deliberately simple tasks.
Source: Hong, Troynikov, Huber, "Context Rot: How Increasing Input Tokens
Impacts LLM Performance", Chroma technical report, 14 Jul 2025.
https://research.trychroma.com/context-rot
Quote: "We evaluate 18 LLMs, including the state-of-the-art GPT-4.1, Claude 4,
Gemini 2.5, and Qwen3 models. Our results reveal that models do not use their
context uniformly; instead, their performance grows increasingly unreliable as
input length grows."
Note: vendor-neutral industry report, not peer reviewed (it is a tech report).

**2.3 Anthropic adopts the term and gives a mechanism.**
Finding: Anthropic's context-engineering post says recall falls as tokens
increase, for every model, and attributes it to attention being spread thin.
Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
(published 29 Sep 2025)
Quote: "as the number of tokens in the context window increases, the model's
ability to accurately recall information from that context decreases. While some
models exhibit more gentle degradation than others, this characteristic emerges
across all models. Context, therefore, must be treated as a finite resource with
diminishing marginal returns."
Mechanism quote: the transformer "results in n² pairwise relationships for n
tokens", and "models develop their attention patterns from training data
distributions where shorter sequences are typically more common than longer
ones". Treat the mechanism as Anthropic's explanation, not a proven law.

**2.4 Anthropic API docs and Claude Code docs repeat it as a practical rule.**
Source: https://platform.claude.com/docs/en/build-with-claude/context-windows
Quote: "As token count grows, accuracy and recall degrade, a phenomenon known as
context rot."
Source: https://code.claude.com/docs/en/best-practices
Quote: "Claude's context window fills up fast, and performance degrades as it
fills." Every file read and command output counts toward the window.

**2.5 A bigger window does not remove the problem.**
Finding: the same docs that list a 1M-token window say more context "isn't
automatically better" (context-windows page above). Capacity and reliable
use of that capacity are different things.

## 3. Training cutoff: general world knowledge, not your project

**3.1 Models have a fixed training-data cutoff.**
Finding: knowledge stops at a date; Anthropic publishes it per model.
Source: https://platform.claude.com/docs/en/about-claude/models/overview
Figure: the current models are listed with "Training data cutoff Jun 2026".
Anything after that date, and anything private, is absent unless supplied in
context. (Date comes from the page fetched 2026-10-08; it will change.)

**3.2 Private repos, conventions and decisions were never in training.**
Finding: this is an inference, not a vendor quote. The vendors' own guidance is
consistent with it: Claude Code docs tell you to put "Coding standards,
workflows, project architecture" and "project context Claude can't derive from
the code" in CLAUDE.md / auto memory
(https://code.claude.com/docs/en/memory), and Codex docs say to put required
team guidance in AGENTS.md (https://developers.openai.com/codex/memories).
I found no primary source that states "models are not trained on your private
repo" as a sentence; state it on a slide as our framing, not a citation.

## 4. Compaction and summarisation lose detail

**4.1 Compaction is summarise-and-restart.**
Finding: when a conversation nears the limit, it is summarised and a new window
is started from the summary.
Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
Quote: "Compaction is the practice of taking a conversation nearing the context
window limit, summarizing its contents, and reinitiating a new context window
with the summary."
OpenAI's equivalent returns an "encrypted compaction item that carries forward
key prior state and reasoning using fewer tokens. It is opaque and not intended
to be human-interpretable." https://platform.openai.com/docs/guides/compaction

**4.2 Anthropic warns that compaction can drop what later turns out to matter.**
Source: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
Quote: "overly aggressive compaction can result in the loss of subtle but
critical context whose importance only becomes apparent later."

**4.3 Instructions given only in chat do not reliably survive.**
Source: https://code.claude.com/docs/en/how-claude-code-works
Quote: "Claude compacts automatically, but instructions from early in the
conversation can get lost. Put persistent rules in CLAUDE.md".
Source: https://code.claude.com/docs/en/memory (troubleshooting section)
Quote: "Project-root CLAUDE.md survives compaction: after /compact, Claude
re-reads it from disk and re-injects it into the session ... If an instruction
disappeared after compaction, it was given only in conversation".
Takeaway: the file on disk is the durable layer; the conversation is not.

**4.4 Anthropic API docs: compaction exists because quality degrades.**
Source: https://platform.claude.com/docs/en/build-with-claude/compaction
Quote: "it keeps the active context small, because response quality degrades as
a conversation grows."

## Could not verify / gaps

- ChatGPT consumer memory: the OpenAI help-centre and announcement pages
  returned no usable text to my fetcher (JS-rendered/blocked). I did not
  confirm "ChatGPT memory is injected text, not weights" from a ChatGPT page.
  The Codex memories page (1.6) is the verified OpenAI source; it says Codex
  memories are "injected", and that ChatGPT web uses a separate store.
- No primary source found stating that vendors do not train on your private
  repo to give "learning". Opposite claim (that memory is not weight updates)
  is supported only by mechanism descriptions (1.3 to 1.7), not by an explicit
  "does not update weights" sentence.
- Lost in the Middle used 2023 models; I did not re-check whether current
  frontier models still show the U-shape. Chroma (2.2) is the more recent
  evidence but is not peer reviewed.
- Chroma's per-model degradation numbers were not extracted; only the
  headline finding is cited.
- I did not quantify how much detail compaction loses; vendors only warn.

## Usable slides

1. "Every call starts blank." The model keeps nothing between requests; chat
   history is re-sent each turn. (OpenAI conversation-state docs, 1.1.)
2. "A new session begins with no memory of what came before." Anthropic uses
   the shift-worker analogy itself. (Anthropic harnesses post, 1.8; Claude
   Code memory docs, 1.3.)
3. "CLAUDE.md / AGENTS.md is a briefing note, not training." Loaded as text at
   start, "context, not enforced configuration"; keep it under 200 lines.
   (Claude Code memory docs, 1.4; Codex AGENTS.md docs, 1.5.)
4. "More tokens, worse recall." Chroma tested 18 LLMs and found reliability
   falls as input grows; Anthropic: recall decreases "across all models".
   (Chroma 2.2; Anthropic 2.3.)
5. "Instructions buried in the middle get lost." Lost in the Middle: accuracy
   dips when relevant info is mid-context. State the direction, not numbers,
   since the models are old. (Liu et al., 2.1.)
6. "Summaries drop details; files on disk don't." Compaction can lose "subtle
   but critical context"; project-root CLAUDE.md is re-read from disk after
   /compact. Write decisions down. (Anthropic 4.2; Claude Code docs 4.3.)

## Sources

- Liu et al., Lost in the Middle (TACL 2024): https://arxiv.org/abs/2307.03172
- Chroma, Context Rot (2025-07-14): https://research.trychroma.com/context-rot
- Anthropic, Effective context engineering for AI agents (2025-09-29):
  https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, Effective harnesses for long-running agents (2025-11-26):
  https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Claude Code, How Claude remembers your project:
  https://code.claude.com/docs/en/memory
- Claude Code, How Claude Code works:
  https://code.claude.com/docs/en/how-claude-code-works
- Claude Code, Best practices: https://code.claude.com/docs/en/best-practices
- Claude API, Context windows:
  https://platform.claude.com/docs/en/build-with-claude/context-windows
- Claude API, Compaction:
  https://platform.claude.com/docs/en/build-with-claude/compaction
- Claude API, Memory tool:
  https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool
- Claude API, Models overview:
  https://platform.claude.com/docs/en/about-claude/models/overview
- OpenAI, Conversation state:
  https://platform.openai.com/docs/guides/conversation-state
- OpenAI, Compaction: https://platform.openai.com/docs/guides/compaction
- OpenAI Codex, AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- OpenAI Codex, Memories: https://developers.openai.com/codex/memories
