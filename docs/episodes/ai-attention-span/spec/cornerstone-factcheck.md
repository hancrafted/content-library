# Cornerstone fact-check (adversarial)

Scope: the block `cornerstone-model:begin` to `cornerstone-model:end` in `prototype/cornerstone.html` (lines 1462-1880; note the first grep hit for the marker is a comment in the header, so a naive awk dumps the whole file).

Confidence legend: [V] verified against a primary source (URL given); [D] derived by me from sources plus recomputation with node; [J] my judgement.

Primary sources used:

- Claude Code tools reference: https://code.claude.com/docs/en/tools-reference
- Claude Code context window: https://code.claude.com/docs/en/context-window
- Claude Code model config (1M, auto-compact): https://code.claude.com/docs/en/model-config
- Claude Code costs: https://code.claude.com/docs/en/costs
- API context windows: https://platform.claude.com/docs/en/build-with-claude/context-windows
- API PDF support: https://platform.claude.com/docs/en/build-with-claude/pdf-support
- Chroma, Context Rot (Hong, Troynikov, Huber, July 2025): https://www.trychroma.com/research/context-rot
- Liu et al. 2023, Lost in the Middle: https://arxiv.org/abs/2307.03172

Arithmetic check [D]: every step sum is internally consistent. m8 = 240 + 80,400 = 80,640; m11 = 118,180; m14 = 98,260; m17 = 64,120; m20 = 46,610; m23 = 1,220. Running total at step 24 = 451,380 = 45.1% of 1M. Plan total 14,800 + 21,600 + 9,400 + 6,500 = 52,300, and 52,300 - 40,000 = 12,300. Tech chips (80.4k, 118k, 98k, 64k, 46.5k, 1.2k) match the blocks. The problem is not the sums, it is what the numbers claim to be.

---

## WRONG

### W1. WebFetch puts the full page into context (m8, m14; also `w-venues`, slide-8 texts, "80.4K / 98K") [V]

Claim: "ten web pages ... all of their text now sits in the context" (m8 simple); "WebFetch x 10 -> 80,400 tokens" (m8 technical); m14 "Twelve more pages, read and kept."; m9 "Eighty thousand tokens behind them."
True: WebFetch converts the page to Markdown, then "runs the prompt against the content in a separate model call, and Claude receives the result of that call rather than the raw page". The docs call it "lossy by design". It reads at most 100,000 characters per call. So each `tool_result` is a prompt-focused extract, typically a few hundred to ~2K tokens, not ~8K of raw page. WebSearch returns "result titles and URLs" only (up to eight backend searches per call), about 0.5-2K tokens.
Source: https://code.claude.com/docs/en/tools-reference (section "WebFetch tool behavior" and "WebSearch tool behavior").
Replacement numbers:

- m8: 2 WebSearch (~1.5K each incl. titles/snippets) + 10 WebFetch (~1.2K each) = about 15K tool_result; tool_use: 12 calls x ~110 = ~1,300 (not 240).
- m14: 1 WebSearch (1.5K) + 12 WebFetch (~1.2K) = about 16K; tool_use ~1,500 (not 260).
  Honest alternative if you want the big-number story (this is the real teaching point): have the AI pull raw pages with `Bash curl` / a browser MCP / Playwright snapshot, or a WebFetch whose prompt is "return the full page". Then 8K per page is realistic (a typical HTML-to-markdown article is 3-15K tokens, a bloated venue page 20K+). Say so in the text: "the AI fetched the raw pages with curl".
  Replacement text (m8 simple): "To answer one short question, the AI searched twice and opened ten pages. Each page is boiled down to an extract, but ten extracts still add up, and you never see them in the chat."
  Replacement text (m8 technical): "WebFetch fetches a page, converts it to Markdown and has a small model extract what the prompt asks for; only that extract returns as a tool_result (about 1K each). WebSearch returns titles and URLs. Ten fetches add roughly 12-15K, not the pages' full text."
  Consequence: the central "one innocent question = 80K" story (slide 8) is false for stock Claude Code WebFetch. It becomes true only for raw-output tools (Read on big files, Bash curl/cat, browser snapshots, MCP tools returning big JSON).

### W2. `Read` can read a guests.xlsx (m17) [V]

Claim: `Read("guests.xlsx")`, "64,000 tokens of sheet text in one tool_result" (m17 technical); "every cell of it".
True: "Read refuses a file whose extension it treats as binary, such as .xlsx, .parquet, .heic, or .zip." Claude then falls back to a skill (e.g. an xlsx skill) or a shell script (python/openpyxl/pandas).
Source: https://code.claude.com/docs/en/tools-reference (Read tool behavior).
Also the size is absurd: a 40-row guest list (say 8 columns) is about 1-2K tokens as text. 64K would be a spreadsheet with ~10K+ rows.
Replacement: tool call `Bash("python3 -c 'import pandas as pd; print(pd.read_excel(\"guests.xlsx\").to_csv())'")`, tool_use ~150, tool_result ~1,800. If you need a heavy result, change the file: "guests.xlsx, 12 sheets, 9,000 rows" and show the AI printing it in full: ~60K is then defensible, and the lesson ("dumping a whole sheet") works. Change the chip text `Read guests.xlsx · 40 rows` accordingly (40 rows and 64K tokens contradict each other: 1.6K tokens per row).

### W3. Reading a 42-page PDF in one `Read` call (m11) [V]

Claim: `Read("offers/catering-offers.pdf") -> 118,000 tokens` in one call; simple: "the AI read the whole file, every page of it".
True: "Claude reads short .pdf files whole. For PDFs longer than 10 pages, it reads in ranges with a `pages` parameter, such as "1-5", up to 20 pages at a time." Page-range reads render pages with `pdftoppm` (poppler); "Images, PDFs, and notebooks keep their limits." So a 42-page PDF needs at least 3 Read calls (1-20, 21-40, 41-42) and without poppler the call fails. An 18-page contract also needs `pages` (e.g. "1-18").
Source: https://code.claude.com/docs/en/tools-reference (Read: PDFs).
Replacement: m11 tool_use = Glob (~90) + 3 x Read (~110 each) = ~420; tool_result = Glob ~40 + three Read results. Technical text: `Read("offers/catering-offers.pdf", pages="1-20")` then `"21-40"`, `"41-42"`. Add the real constraint to the text: "Claude Code reads long PDFs in chunks of at most 20 pages; the AI chose to read all three chunks."
Cost per page [V for API figures, J for Claude Code]: the API says text-only PDF costs ~1,500-3,000 tokens per page, and the image+text mode about 7,000 tokens for 3 pages (~2.3K/page) in the Bedrock Converse note; Claude Code renders pages as images (image tokens ~ width x height / 750, capped at ~1.5-1.6K per page). So 42 pages realistically is 60K (images only) to 130K (text + image at 3K/page). 118K (2.8K/page) is therefore in range; keep it, it is the one big number that is defensible. 46.5K for 18 pages (2.6K/page) is also in range. Keep both, fix only the call structure.
Source for per-page cost: https://platform.claude.com/docs/en/build-with-claude/pdf-support

### W4. Autocompact buffer = 45K (all Presets: `bufferTokens ??= 45000`) [D, from V sources]

True: with the 1M window Claude Code compacts at about 967K by default, i.e. the reserved headroom is about 33K (1,000,000 - 967,000). Your own reference `/context` confirms 33k on a 400K window (8.3%), so the buffer is a roughly fixed 33K, not proportional and not 45K. 45K is 4.5% of 1M and nothing Anthropic documents. Free space on the 1M bar is also overstated by 12K.
Source: https://code.claude.com/docs/en/model-config ("Models running with a native 1M window compact before the window fills, at about 967K tokens by default"); reference /context output.
Replacement: `bufferTokens ??= 33000`. Grid: 3 boxes (round(33000/10000) = 3) instead of 5.

### W5. Smart-zone line attributed to Matt Pocock at 150K [V]

True: Pocock's stated number is about 100K tokens, "it doesn't matter whether you're using a 1 million context window or 200K, it's always going to be about 100K". The terms "smart zone / dumb zone" come from Dex Horthy (HumanLayer); Pocock popularised them. No source I found gives 150K for Pocock.
Sources: https://www.howardism.dev/articles/context-window-smart-zone, https://lifanh.com/writing/matt-pocock-workflow-report/, https://daily.dev/posts/full-workshop-ai-coding-for-real-engineers---matt-pocock-ai-hero-5psxtf1hr (all secondary summaries of his workshop; check the video for the exact quote before the episode ships).
Replacement: `LINE_MATT = { tokens: 100000, label: 'Matt Pocock', short: '100K' }` and credit "term by Dex Horthy". Note that this also moves the first crossing from step 11 to step 8 (117K at m8; the m8 spike alone crosses 100K).

### W6. Per-message token sizes of your own messages and replies (m3-m24) [D + J]

I compared each step's claimed tokens against the displayed `text` (chars/4).

- User turns claim 28-62 tokens for texts of 7-19 tokens (2.4x-6.5x). E.g. m7 "Find three venues in Lisbon." is ~7 tokens, claimed 28; m19 "Can you check the venue contract?" ~8, claimed 52.
- Assistant turns claim 210-1,480 for texts of 12-28 tokens (16x-69x). E.g. m12 940 tokens for one sentence; m24 1,480 for ~30 tokens of shown text.
  Two honest options (pick one and say so):

1. Keep the numbers and label them. Assistant turns in Claude Code include thinking blocks, and on Opus 4.5+ / Sonnet 4.6+ / Sonnet 5.x the API keeps previous thinking blocks in context ("they count toward the context window like any other input tokens"). Then m12 = ~900 thinking + 40 text is believable. Add a "Thinking" category or say "reply incl. thinking" in the technical text. Source: https://platform.claude.com/docs/en/build-with-claude/context-windows (The context window with thinking).
2. Shrink to the visible text: user 8-25 each, assistant 20-120 each (m24 full plan with 4 lines ~120, if the shown list is the whole message).
   Also Claude Code appends `<system-reminder>` blocks to user turns (date, CLAUDE.md, task reminders, file-change notices); 20-40 tokens of overhead per user turn is realistic and could justify the user numbers if you say so [J].

---

## UNREALISTIC

### U1. "The budget is forgotten at ~45% fill" (m22-m24, attentionAt) [J, supported by research below]

At 451K tokens a current frontier model (Opus 4.x/5.x, Sonnet 4.6/5.x) will almost certainly still retrieve a single plain statement "budget 40,000 euro" from step 3. Single-fact retrieval (needle-in-a-haystack) is near-perfect at that length; what degrades is multi-hop reasoning, ambiguity and distractors. Chroma's study (18 models incl. Claude 4, GPT-4.1, Gemini 2.5) shows degradation with length even on simple tasks, and that it depends on needle-question similarity, distractors, and haystack structure, "often in surprising and non-uniform ways". It does not show "forgets a single clear constraint at 45%". And your own story, a `budget.py` that omits the limit, is a planning failure, not an attention failure. A sceptical developer will say that.
What makes the story more honest: (a) the budget is in a ~62-token user message surrounded by 80K-118K tool results full of competing numbers (prices, deposits, other budgets) = distractors, exactly Chroma's failure mode; (b) the AI never re-reads or restates the constraint; (c) say "in practice the budget gets lost more often than a lab would predict, because there are distractors", not "attention runs out".
Replacement text (m24 technical): "Assistant turn. Nothing in the last 450K tokens repeats the 40,000 limit, and every tool result added competing numbers. Models do not use long context uniformly (Chroma 2025); a constraint stated once, far back, among distractors, is the one that gets dropped. The plan is 12,300 euro over budget."
Replacement text (m24 simple): "The vegetarians were repeated, so they made it. The budget was said once, a long time ago, and the plan ignored it."
Do not state a percentage at which this happens; it varies by model and task.
Sources: https://www.trychroma.com/research/context-rot, https://platform.claude.com/docs/en/build-with-claude/context-windows ("As token count grows, accuracy and recall degrade, a phenomenon known as context rot").

### U2. "100 units of attention spread across messages" (attentionAt, the Attention mode) [J]

Not how it works. Attention is a softmax per head, per layer, per query token, summing to 1 over all key positions (system prompt, tools and thinking included), and it is different for each generated token. There is no single per-message budget. As an illustration it is defensible only if labelled "illustrative model, not measured", and the label "Attention is a budget" (slide 5) is a metaphor. "Budget" and "units" invite people to think of a fixed pool being consumed, which is roughly right for softmax normalisation, but the per-message split is invented.
Concrete problems in the model:

- The constants (0.06, 0.08, 3.2, 5, 0.9 x (1 - min(0.85, fill x 2.2)), +0.8 per ref) are hand-tuned. The "middle" term hits its floor at 38.6% fill, so everything past 387K looks identical. The 45% fill figure is an artefact of 2.2 x fill clamped at 0.85.
- Results at step 24 [D]: m1 (start material) 19 units, m2 7, m3 (the budget) 2, m5 13, m23 12, m24 20. The budget message gets 2 of 100 units, but most middle messages get 0-2 too, so every middle message is equally "forgotten", including ones a later step relies on. The big tool results (m8, m11, m14, m17) get 1 unit each (m20 gets 4) though they are the bulk of the tokens. In reality, big tool results receive a large absolute number of attended tokens; the per-message split is per-token-normalised. Make clear "per message" is pedagogical.
- Message size term `pow(tokens/1000, 0.12)` is arbitrary.
  Replacement label: "Illustrative: how much of the model's focus each message might get. Real attention is computed per token, per layer; this chart shows the pattern researchers measured (strong start, strong end, weak middle), not real values."

### U3. "A message that is referred to again keeps more attention" (m5 simple/technical; `+0.8 * refs`) [J]

What is real: restating a fact puts a fresh copy near the end of the context (recency) and gives the model several places to find it; the original message does not "keep more attention" because later messages mention it. This is a recency/redundancy effect, not a per-message boost. Evidence for primacy/recency + position: Liu et al. 2023 (U-shaped accuracy, best at beginning and end, worst in the middle, 20-document QA, models with ~4K-16K contexts, GPT-3.5, Claude 1.3 era).
Replacement text (m5 simple): "A small detail the chat keeps repeating. Each repeat puts a fresh copy near the newest messages, so it stays easy to find."
Replacement text (m5 technical): "User turn. Restated in steps 6, 12, 18 and 24, so there is always a recent copy in context. That redundancy, not any special status of the original message, is why it survives."
Also: m5 sits at position 5 of 24, i.e. near the start. Calling it "the spike in the middle of the Attention chart" is wrong in position terms: it is in the early part of the chart. Say "the spike near the start".
Source: https://arxiv.org/abs/2307.03172

### U4. Tool-use token counts are far too small (all chips) [J, with V on structure]

A `tool_use` block carries id, name and JSON input: ~60-120 tokens for a simple call, 200-500 for a Bash script. m8 (12 calls) = 240 is impossible (20 tokens each); m14 (13 calls) = 260; m11 (Glob + Read(s)) = 180 is low; m20 (1 Read) = 110 is ok; m17 = 120 is low for a Bash/python call (use ~200); m23 = 320 is fine for a script. Fix: m8 ~1,300; m11 ~420 (see W3); m14 ~1,500; m17 ~200.

### U5. Bash output (m23) [V on limits, J on size]

Claude Code returns Bash output inline up to roughly 30,000 characters (about 7.5K tokens); past that it saves the output to a file and returns the path plus a 2,000-character preview (failure output: ~10,000 characters, head+tail). A `budget.py` that prints a few lines of costs is ~100-300 tokens, 900 is a lot but not impossible if it prints a table. Suggest 350. Source: https://code.claude.com/docs/en/tools-reference (Bash, Output limits). This matters for the teaching: Bash is the one tool with a built-in cap, so "dump a whole log" tops out near 7.5K tokens unless the AI Reads the saved file.

### U6. Glob (m11) [V]

Glob returns file paths only, sorted by modification time, capped at 100 files: for one match, ~30-60 tokens. The chip is fine as long as nothing big is attributed to it. Nitpick inside: "Glob ... Absent by default on macOS, Linux, and WSL" per the tools reference (Claude Code uses Bash/`find`/`rg` there), so on a Mac the AI would use `Bash("find . -name '*catering*.pdf'")` or the Grep tool. m1 technical lists Glob among built-ins on every platform; soften to "file-search tools such as Grep (and Glob on Windows)". Source: https://code.claude.com/docs/en/tools-reference (Glob tool behavior).

### U7. m1 starting block composition [V on the reference, J on rest]

34,100 = the reference's four numbers exactly, so it is faithful for a 400K session. But: (a) MCP server instructions (1k), custom agents (163) are omitted; (b) in current Claude Code MCP tool definitions are deferred by default ("only tool names and server instructions enter context until Claude uses a specific tool", costs page), so "one MCP server 1.4k" is names only; (c) a stock install has no MCP at all. Fine to keep as an example, but the technical text should say "yours will differ: run /context". Source: https://code.claude.com/docs/en/costs ("Reduce MCP server overhead"), https://code.claude.com/docs/en/context-window.

### U8. "Messages" split into user / assistant / tool_use / tool_result as `/context` categories [J, partly unverified]

The reference `/context` output you gave shows Messages as one number (116.3k). The four-way split is a teaching construct, not something `/context` prints. Technical mode reads as if these were `/context` rows ("named as Claude Code's /context names them" in the CATS comment). Only the first five names and Free space / Autocompact buffer are /context names. I could not confirm from docs whether the newest builds list a message breakdown (tool calls / results / attachments) under the Messages row, so check your own `/context` before claiming either way. Suggest an explicit caption: "Messages is one row in /context; we split it here to show who wrote what."
The hierarchy is also too neat: in a real session Messages also contain system-reminder attachments, hook output, thinking blocks, and file attachments (`@file`), none of which has a category.

---

## MISSING (a developer audience will ask)

M1. Every request resends everything (V). "Claude Code sends your full conversation with every request, and each time Claude uses tools it sends another request carrying that batch of tool results" (costs page). This chat has about 14 API requests minimum (one per tool-result chip + one per reply, more if you count Glob->Read and 3 PDF chunks); my recomputation [D] gives ~3.6M cumulative input tokens across the chat for a 451K final context, 8x the final size. m4 technical mentions the first part, but nothing shows the cost consequence. Suggest a technical-mode line: "Total tokens processed across all requests: 3.6M, of which most are cache reads."
M2. Prompt caching (V). Cached prefix is re-read at a lower rate (cache reads ~10% of base input price), 5-minute default TTL, 1h optional; a break longer than the TTL means a full-price rewrite ("Cache misses ... reprocesses your full context"). Cached tokens "still occupy the context window ... changes what you pay for those tokens, not whether they count" (context windows page, V). m1 technical has one correct line; add that caching does not reduce attention load or context rot. Source: https://code.claude.com/docs/en/prompt-caching, https://platform.claude.com/docs/en/build-with-claude/context-windows
M3. Thinking tokens (V). Counted in the window; on Opus 4.5+, Sonnet 4.6+, Sonnet 5.x, Haiku 5.5 previous thinking blocks are kept by default. This is also the cleanest justification for W6's large assistant sizes. Source: context windows page.
M4. Subagents keep big reads out of the main window (V). The slide-11 Preset covers the pattern, but technical text for m8/m11 should name the escape hatch: "Task/Agent tool: the subagent reads the 42-page PDF in its own window and returns a summary (~500 tokens)". Source: https://code.claude.com/docs/en/context-window ("how a subagent keeps large reads out of your context"), https://code.claude.com/docs/en/costs ("Delegate verbose operations to subagents").
M5. What compaction really does (V). Replaces the conversation with a structured summary generated by a model call; re-injects CLAUDE.md, auto memory, skill descriptions, up to five recently read files (each only if under 5,000 tokens, else just a path) and invoked skill bodies (5K each, 25K total); path-scoped rules are summarised away. Default trigger on 1M models is ~967K, configurable 100K-1M via `/autocompact` or `CLAUDE_CODE_AUTO_COMPACT_WINDOW`. "Kept free for summaries" is roughly right, but more precisely: headroom so the summarisation request fits and the session can continue. It is lossy. Pocock's "sediment" argument (secondary) is why some prefer `/clear`. Source: https://code.claude.com/docs/en/context-window, https://code.claude.com/docs/en/model-config
M6. The 1M window is not the same as a 1M smart zone (V for the 1M part). Say the real mechanics: the model compacts at ~967K but the smart-zone lines are at 100-300K, so compaction is not protection against rot. Chroma: degradation is gradual, not at a cliff.
M7. System reminders (V in context-window doc; format J): Claude Code injects `<system-reminder>` blocks (CLAUDE.md contents, date, todo/task state, file-changed notices, background command status) into user turns and tool results. They are in the context, count as tokens, and are never shown in the transcript. Good fit for the "content that never appears in your terminal" theme.
M8. Images and screenshots (V for the formula in Anthropic's vision docs, J for the Claude Code resize): a screenshot is roughly width x height / 750 tokens, capped around 1.5K per image after Claude Code downsizes. A PDF read as images in Claude Code is the same mechanism (W3).
M9. Context editing / tool-result clearing (V). The API can clear old tool results automatically; Claude Code does so internally ("clearing old tool results from context" counts as an expected cache rebuild). It is the direct counter to the m8/m11/m14 pile-up. Source: https://platform.claude.com/docs/en/build-with-claude/context-editing
M10. Model dependence of the 1M default (V). 1M default: Fable 5.x, Sonnet 5+, Haiku 5.5, Opus 4.7+; Opus 4.6 and Sonnet 4.6 only via `[1m]` and plan/usage-credit conditions; older (Sonnet 4.5, Haiku 4.5) 200K. Your reference output had a 400K window, so the Preset should say "default window: 1M; yours may differ, run /context". Claim "1M default is accurate for current models" stands. Source: https://code.claude.com/docs/en/model-config ("Extended context"), https://platform.claude.com/docs/en/build-with-claude/context-windows
M11. Context awareness (V, minor). Some models receive `<budget:token_budget>` and "Token usage: x/y" warnings injected after tool calls; Sonnet 5.5 and Opus 4.7+ do not. Not needed for the episode, but a sharp developer may ask whether the model "knows" it is 45% full.

---

## Wording in `simple` / `technical` texts that is false or misleading

1. m2 simple: "What the app remembered about you from earlier chats, added quietly before your first message." In Claude Code, `CLAUDE.md` is written by you or the project and auto memory is notes Claude saved; neither is "your earlier chats". Replacement: "Notes and rules the app loads for you before your first message, such as your own instruction file." [V, context-window doc]
2. m2 technical: "CLAUDE.md and saved memories, injected after the system prompt." Close; real injection is as a `<system-reminder>` user-side block in the first message, not part of the system prompt [J]. Safer: "loaded into context before your first message".
3. m4 technical: "Request 2's input is request 1's input plus this reply plus your next message." Correct [V], but add "re-sent in full each time".
4. m8 simple: "all of their text now sits in the context" false for WebFetch (W1).
5. m9 simple: "Eighty thousand tokens behind them." Same, replace with the corrected number or reframe via raw-fetch.
6. m11 simple: "the AI read the whole file, every page of it." Make it "the AI read it 20 pages at a time, 42 pages in all."
7. m12 simple/technical: "The vegetarian detail comes back again." Fine. m5 technical "spike in the middle" is wrong, see U3.
8. m17: see W2 (cannot Read xlsx; 40 rows x 64K tokens).
9. m23 simple "The numbers are right; the budget is not in it." Fine. m23 technical correct narrative; add "this is a planning mistake, not memory loss" if you keep the attention story honest (U1).
10. m24 simple: "The budget ... did not [make it]." Same caveat (U1).
11. m1 technical: "a cached prefix is cheaper but still counts and still takes attention." Correct [V]. Keep.
12. CATS comment: "named as Claude Code's /context names them": only partly true (U8). Also "Tool calls" and "Tool results" are API block types (`tool_use`, `tool_result`), correct as API names, not /context names.
13. Slide 4 "What happens when the bar fills up": at 45% nothing happens mechanically: no autocompact (that is at ~967K) and no truncation. Make sure the slide text does not imply the bar being "full"; at step 24 the bar is less than half full.

## Nitpicks

N1. `Read` of an ".xlsx" and "Glob" on Mac are the two tool-availability slips; also "WebSearch x 2 (one retried)": retries on API overload are internal to Claude Code and do not add a second `tool_use` block (V: "retries it with backoff"). A "retry" that the model itself does (a second query) is fine; label it "second search".
N2. Smart-zone line "Han 300K" is the author's own claim, which is fine if labelled as such; it has no external source and sits at 30% of the 1M window. Chroma and Liu do not give a threshold; say "rule of thumb".
N3. Liu et al. 2023 used 2K-4K token inputs on 2023 models (GPT-3.5-Turbo, Claude 1.3, MPT, LongChat); do not cite it as evidence for 300K-token behaviour in 2026 models. Cite it for the U-shape only; cite Chroma 2025 for length effects on current models (and note Chroma's tasks were simple, synthetic).
N4. `pct()` shows 0.x% only for values under 1%, so m3 shows "4%" at step 3; irrelevant to facts.
N5. "autocompact buffer shown hatched at the end of the window": correct visually; in `/context` it is shown at the end of free space as reserved, consistent with the reference.
N6. Slide 10 "Fresh chat + handoff card" uses memory 2,000 and user 1,900 tokens; plausible for a ~1.4K-word handoff. Fine.

---

## Suggested replacement data (drop-in, if you keep the "stock Claude Code" framing)

| Step                                | tool_use | tool_result    | Notes                                               |
| ----------------------------------- | -------- | -------------- | --------------------------------------------------- |
| m8 web (2 WebSearch + 10 WebFetch)  | 1,300    | 15,000         | 3K search + 12K extracts                            |
| m11 Glob + 3x Read pages            | 420      | 118,000 (keep) | 3 chunks of 20/20/2 pages; or 60,000 if images only |
| m14 web (1 WebSearch + 12 WebFetch) | 1,500    | 16,000         |                                                     |
| m17 xlsx via Bash/pandas            | 200      | 1,800          | or enlarge the sheet to ~9,000 rows for ~60K        |
| m20 Read pages="1-18"               | 120      | 46,500 (keep)  |                                                     |
| m23 Bash                            | 320      | 350            |                                                     |
| bufferTokens                        |          | 33,000         |                                                     |
| LINE_MATT                           |          | 100,000        | credit Dex Horthy for the term                      |

With these, step 24 lands near 250K (not 451K) and crosses 100K at m11 and 300K never. If the episode needs the 300K crossing, make the large results come from raw tools (curl, whole-sheet dumps, unfiltered MCP JSON) and say so, rather than from WebFetch.
