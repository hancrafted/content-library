---
type: dossier
title: Why AI has a weird attention span you must learn to manage
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-20T20:25:27Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-10-20T19:36:52Z
  - by: process:markdown-harness
    at: 2026-10-20T20:25:27Z
---

# Why AI has a weird attention span you must learn to manage {#ai-attention-span}

## The long phone call {#the-long-phone-call}

#### Voice script

1. **A long chat is a long call** — a long AI chat behaves like a long phone call; the call first, then the chat

### The long phone call {#the-long-phone-call-story}

#### Visual

master: basic-page · motion: local

title: The long phone call

The call as a transcript in chat bubbles with your sister on a clean white stage. The bubbles, in order: You: "Let's sort out the holidays!" Sister: "Yes! But first, did you hear about Mum's new phone?" You: "No, what happened?" Sister: "She sent me forty photos of her thumb." You: "Ha! Did you see the neighbours' renovation?" Sister: "Don't get me started. And my back hurts again." Sister: "And Pepper ate a whole birthday cake, candles included!" You: "Did you try that new recipe?" Sister: "Not yet. Oh, dinner is ready, I have to run." You: "Talk soon, bye!"

It plays in three steps. First, every bubble in the middle fades to soft grey while the first bubbles and the last bubbles stay lit in the accent colour. Second, the dog-story bubble ("And Pepper ate a whole birthday cake, candles included!") lights up again on its own. Third, a last bubble appears, "…wait, we never fixed the date.", and the call's one purpose is shown unsettled. A small caption names the three effects the viewer just saw: the start, the end, the standout.

#### Speaker notes

1. **Recall is U-shaped** — in free recall of a word list, the first and last items are recalled best and the middle ones worst [1].
   - sources: [1] Murdock, The serial position effect of free recall — https://doi.org/10.1037/h0045106
2. **Why the start sticks** — people rehearse early items more often than middle ones, and the number of rehearsals predicts recall [2].
   - sources: [2] Rundus, Analysis of rehearsal processes in free recall — https://doi.org/10.1037/h0031185
3. **Why the end sticks** — delaying recall with a distractor task removes the recency part but leaves the start intact, which points to two separate stores [3]; where recency comes from is still debated [4].
   - sources: [3] Glanzer and Cunitz, Two storage mechanisms in free recall — https://doi.org/10.1016/S0022-5371(66)80044-0
   - sources: [4] Bjork and Whitten, Recency-sensitive retrieval processes in long-term free recall — https://doi.org/10.1016/0010-0285(74)90009-7
4. **The standout survives** — an item that differs from its neighbours is remembered better, and it stands out against its context, not on its own [5][6].
   - sources: [5] von Restorff, Über die Wirkung von Bereichsbildungen im Spurenfeld — https://doi.org/10.1007/BF02409636
   - sources: [6] Hunt, The subtlety of distinctiveness: What von Restorff really did — https://doi.org/10.3758/BF03214414
5. **Lab lists, not phone calls** — every study uses word lists or short material, so that the same pattern holds for an hour-long call is an inference, though the effects are textbook findings [1].
   - sources: [1] Murdock, The serial position effect of free recall — https://doi.org/10.1037/h0045106

#### Voice script

1. **The start sticks** — it's called primacy; "let's sort out the holidays", the first thing sets the frame and you remember it
2. **The end sticks** — it's called recency; "talk soon, bye", the last minutes are fresh because they just happened
3. **The middle blurs** — an hour of detail, the neighbours, the phone, the back pain; you can hardly say what was in it
4. **One thing stands out** — the dog and the birthday cake; what is different survives, it's called the isolation effect
5. **We never fixed the date** — the one thing you called for; does an AI chat do the same

### AI forgets the middle too {#ai-forgets-the-middle-too}

#### Visual

master: basic-page · motion: local

Two chat threads side by side on the white stage: the sister thread on the left, a long AI chat on the right, drawn with the same bubbles. The sister thread is the call from the first Slide, shortened to its first two bubbles, the dog-story bubble and its last bubbles. The AI thread is the summer-party chat, one shared conversation that returns on the next Slides: the company summer party the AI helps plan in the workshop hands-on. In this order. You: "Plan a summer party for our team: 40 people, end of June, budget 40,000 euro." AI: "Happy to help! Indoor or outdoor? Any dietary needs I should know about?" You: "Outdoor if we can. 12 guests are vegetarian, please keep that in mind." AI: "Noted: 12 vegetarian guests. Shall I look for venues?" You: "Find three venues in Lisbon." AI: "Three options: Quinta terrace, LX Factory rooftop, Estrela garden pavilion." You: "The catering offers are in the project folder. Which one fits?" AI: "Sabor Verde fits best: it includes a vegetarian menu for 12." You: "Check hotels near the venue for 15 guests from abroad." AI: "Hotel Lumen and Casa do Rio both have 15 rooms free on 27 June." You: "The guest list is in there too." AI: "Got it: 40 guests, 15 travelling, 12 vegetarian." You: "Great, put the full plan together." AI: "Full plan: venue 14,800, catering with the vegetarian menu 21,600, hotels 9,400, music 6,500. Total 52,300 euro."

One effect at a time, the same lighting is applied to both threads. The first bubbles light up on both sides, then the newest bubbles, then the middle fades to grey on both sides, then one standout bubble in the middle (Pepper and the cake on the left, the 12 vegetarian guests on the right) lights again. Under the two threads, the bottom line appears: "With your sister, a lost detail is funny. With a deadline, it's expensive." The context window is not named on this Slide.

#### Speaker notes

1. **Measured, even for long-input models** — relevant information is used best at the beginning or end of the input and worst in the middle, also in models built for long contexts [1].
   - sources: [1] Liu et al., Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172
2. **A built-in pull to the start** — the first tokens of an input draw strong attention as an "attention sink", even when they carry no meaning [2].
   - sources: [2] Xiao et al., Efficient Streaming Language Models with Attention Sinks — https://arxiv.org/abs/2309.17453
3. **Two position effects** — causal masking biases attention toward earlier positions, and relative position encodings favour nearby tokens, which trades off against the accumulating importance of early positions [3]; that these two together produce the middle dip is an inference, the paper's abstract does not state it.
   - sources: [3] Wu et al., On the Emergence of Position Bias in Transformers — https://arxiv.org/abs/2502.01951
4. **The strength varies** — the dip is strongest when the input fills up to about half the window; beyond that the start advantage fades and the end advantage stays [4].
   - sources: [4] Veseli et al., Positional Biases Shift as Inputs Approach Context Window Limits — https://arxiv.org/abs/2508.07479
5. **Planted facts, not chat products** — the studies plant a fact in the input and test whether the model retrieves it; none tests current chat products, so applying them to a chat is an inference [1].
   - sources: [1] Liu et al., Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Meet the summer-party chat** — the workshop's hands-on: you plan the company summer party with the AI; 40 people, end of June, a budget of 40,000 euro, a catering PDF, a guest list; we come back to this chat all episode
2. **It happens in a long chat too** — you start with the plan and the budget, the chat runs on for an hour; the first and last messages tend to get used, the middle gets lost, and a repeated detail like the vegetarians survives; the budget slips later, and why comes on a later Slide
3. **A shape, not a brain** — I'm not saying the AI thinks like you do; I'm saying you can predict where it slips
4. **What a lost detail costs** — with your sister it's funny; with a deadline it's expensive; ask yourself which one your chat is

## The AI's attention span {#the-ais-attention-span}

#### Voice script

1. **Why it happens** — the pattern has a cause in how the AI holds a chat; first the cause, then what it does to your answers

### The context window {#the-context-window}

#### Visual

master: basic-page · motion: local

The Context window cornerstone, shown by Preset: the Bar view with Simple explanations. On the white stage, the chat sits on the left as rounded bubbles, one shared scroll bar runs down the middle, and on its right the context bar fills from top to bottom, one block per message. The chat is the summer-party conversation from Slide 2, appearing message by message from the first bubble, You: "Plan a summer party for our team: 40 people, end of June, budget 40,000 euro.", down to AI: "Three options: Quinta terrace, LX Factory rooftop, Estrela garden pavilion." The explanation panel sits beside the bar in plain words: "The AI is handed the whole chat again with every message. The space for it is limited. That limit is the context window." Everything starts grey; as the chat grows, the accent colour picks out one bubble and its block in the bar together, first the budget message, so the viewer sees which message sits where. The Slide reads top to bottom without touching a toggle.

#### Speaker notes

1. **The model keeps nothing** — the Messages API is stateless: it holds no conversation between requests, and the caller passes the earlier user and assistant turns along with the new message [1].
   - sources: [1] Anthropic, Messages API reference — https://platform.claude.com/docs/en/api/messages
2. **Replies feed back in** — the model's reply becomes part of the input for the next turn [2].
   - sources: [2] Anthropic, Context windows — https://platform.claude.com/docs/en/build-with-claude/context-windows
3. **Both directions count** — the context window holds the conversation history plus the newly generated output [2].
   - sources: [2] Anthropic, Context windows — https://platform.claude.com/docs/en/build-with-claude/context-windows
4. **Apps may differ** — the sources describe the developer API; that a chat app resends the history is an inference, and chat interfaces such as claude.ai can instead manage the window by dropping the oldest content first [2].
   - sources: [2] Anthropic, Context windows — https://platform.claude.com/docs/en/build-with-claude/context-windows

#### Voice script

1. **You type one line** — what you send is a short message; what the AI receives is the whole conversation so far, again, every time
2. **There is a size limit** — the bundle has a maximum size; this limit is the AI's attention span; it fills message by message
3. **The term to keep** — context window; if you remember one word from today, this one
4. **Context engineering** — giving the AI the right context at the right time; that is what we manage today

### What happens when the bar fills up {#what-happens-when-the-bar-fills-up}

#### Visual

master: basic-page · motion: local

title: What happens when the bar fills up

The Context window cornerstone, shown by Preset: the Attention view on the default 200K window, scrolled to the end of the same summer-party chat so the context bar is well filled; the chat runs to its last bubbles, You: "Great, put the full plan together." and AI: "Full plan: venue 14,800, catering with the vegetarian menu 21,600, hotels 9,400, music 6,500. Total 52,300 euro." No compaction happens on this Slide. Next to each message block a small attention bar shows how much the AI looks at it. The bars of the newest messages stay tall, and the bars across the middle flatten to thin grey lines. The budget bubble is the first bubble of the chat, You: "Plan a summer party for our team: 40 people, end of June, budget 40,000 euro."; the start of a chat is attended well, yet its bar is thin and the bubble is faded, with a dashed outline and a small note beside it, "the AI may fill this gap itself". The reason is shown beside it, not its position: the budget is one short number, and the searches and the offers around it carry many similar numbers that compete for the attention. A small label on the window and the bars reads "illustrative numbers", since the 200K window and the attention shown are illustrative. One middle bubble, You: "Outdoor if we can. 12 guests are vegetarian, please keep that in mind.", keeps a tall bar in the accent colour, because the chat repeats it. As the viewer watches, the earlier effects return one by one, then a label appears on the whole chat: answers get worse. Last, an arrow runs from the faded budget bubble to the last AI bubble with the label "the budget got forgotten".

#### Speaker notes

1. **Quality falls before the limit** — on a 13-task benchmark almost all of 17 long-context models lost a lot of accuracy as input grew, and only half kept satisfactory performance at 32K tokens although all claimed 32K or more [1].
   - sources: [1] Hsieh et al., RULER: What's the Real Context Size of Your Long-Context Language Models? — https://arxiv.org/abs/2404.06654
2. **Length alone hurts** — even with perfect retrieval, performance dropped by 13.9% to 85% as input grew, and the drop persisted when irrelevant tokens were masked out [2].
   - sources: [2] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381
3. **Extra material makes it worse** — across 18 models, performance degraded with input length in every experiment, and even a single distractor lowered it [3].
   - sources: [3] Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance — https://www.trychroma.com/research/context-rot
4. **What the studies measure** — the studies measure lost accuracy, not a hallucination mechanism [2][3].
   - sources: [2] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381
   - sources: [3] Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance — https://www.trychroma.com/research/context-rot
5. **Mostly synthetic tests** — most studies use a planted fact or padded filler and models of 2024 and 2025, and the size of the drop varies by model and task [2].
   - sources: [2] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381

#### Voice script

1. **The start helps, but is no guarantee** — the first and last messages tend to be used best, like the opening and the end of the call; the numbers on this Slide are illustrative
2. **The newest stays sharp** — the latest messages are used well too
3. **The middle blurs** — what you said an hour ago sits in the blurry middle
4. **A standout survives** — the repeated detail, the 12 vegetarian guests, is still there; the plan has a vegetarian menu
5. **Answers get worse** — new: as the chat fills, the answers get worse, even before it is full; this is called context rot
6. **The budget is forgotten** — your very first message said 40,000 euro; now the plan comes back at 52,300; it was not lost by its position, it got little attention among many similar numbers
7. **Filling the gap** — one small number among many similar ones from the offers and searches, so the AI fills the gap itself; that's my hypothesis, not proven

### Attention is a budget {#attention-is-a-budget}

#### Visual

master: basic-page · motion: none

The Context window cornerstone, shown by Preset: paused on the Attention view, at rest. A horizontal bar chart of 100 units of attention, labelled "illustrative numbers", splits into three parts: 20 units to the start, 30 units to the most recent messages, 50 units spread ever thinner across the whole middle. The repeated vegetarian detail (You: "Outdoor if we can. 12 guests are vegetarian, please keep that in mind.") stays bright in the accent colour in the middle. Beside it, two context bars of the same summer-party chat stand side by side, both labelled "illustrative numbers", so the claim shows without a click. Left, the default 200K window: one dashed line at 80K tokens labelled "Smart zone by Matt Pocock", the chat's fill crossing it. Right, the 1M window: the same chat fills only a small part of it, Matt Pocock's line sits at 150K, still labelled "Smart zone by Matt Pocock", and a second dashed line at 300K is labelled "Smart zone by Han", shown only on the 1M window; the chat crosses neither. Before a line is the smart zone and beyond it the dumb zone, each with a label. The zone labels appear only on this Slide, after the viewer has already seen the middle fade.

#### Speaker notes

1. **The attention budget** — Anthropic describes every token attending to every other, so each added token spreads the same attention thinner; it is a vendor account of the measured drop, not itself measured in the studies [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
2. **The U-shape is measured** — a model's attention itself shows a U-shape toward the start and end of the input, whether or not those tokens are relevant [2].
   - sources: [2] Hsieh et al., Found in the Middle: Calibrating Positional Attention Bias Improves Long Context Utilization — https://arxiv.org/abs/2406.16008
3. **The start is weighted** — the first few tokens draw strong attention as an attention sink even when they carry no meaning [3].
   - sources: [3] Xiao et al., Efficient Streaming Language Models with Attention Sinks — https://arxiv.org/abs/2309.17453
4. **No single line** — where the middle gets too thin differs per model and task; when the needle shares no words with the question, 11 of 13 models advertised at 128K or more fell below half of their short-input score at 32K [4].
   - sources: [4] Modarressi et al., NoLiMa: Long-Context Evaluation Beyond Literal Matching — https://arxiv.org/abs/2502.05167

#### Voice script

1. **A hundred units** — think of attention as a budget of a hundred units; the numbers, the token counts and the window sizes too, are illustrative; I made them up to show the shape
2. **Where it goes** — a big share to the start, a big share to the newest messages, the rest spread thinner and thinner
3. **A spike in the middle** — a detail you keep repeating keeps its share; the 12 vegetarian guests
4. **Smart zone and dumb zone** — somewhere the middle gets too thin to trust; before the line the AI is in the smart zone, beyond it in the dumb zone; Matt Pocock puts the line at 80K on a 200K window and 150K on a 1M window; his number, a rule of thumb
5. **Having it is not using it** — your sister recorded the call and still can't find what you said at one hour, 13 minutes, 17 seconds
6. **My own line** — 300K tokens, and only on the 1M window; one practitioner's habit, not a law

### What we learned so far {#what-we-learned-so-far}

#### Visual

master: basic-page · motion: none

A small version of the phone-call transcript on the left, with the fade on its middle, and a small cornerstone context bar on the right, filled and faded the same way. One line under each: under the call, "Long calls keep the start, the end and a standout"; under the bar, "A long chat does the same, because the window is limited". A single closing line spans both: "Manage it, or the middle gets lost."

#### Speaker notes

1. **Two kinds of evidence** — the human pattern comes from lab word lists [1], the model pattern from retrieval tests on long inputs [2]; the match between them is an analogy, not a proof.
   - sources: [1] Murdock, The serial position effect of free recall — https://doi.org/10.1037/h0045106
   - sources: [2] Liu et al., Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Same effects** — long AI conversations show what long human conversations show
2. **The window is the span** — the AI's attention span is its context window
3. **Manage it** — treat it as a resource you actively manage, so important decisions and information don't get lost in the middle

## What fills the window {#what-fills-the-window}

#### Voice script

1. **More in there than you typed** — what you see is only part of what the AI reads; what else goes in

### What's really in the window {#whats-really-in-the-window}

#### Visual

master: basic-page · motion: local

The Context window cornerstone, shown by Preset: the Grid view, with the explanation panel on two parts only. The window is drawn as a grid of labelled parts: starting instructions, memory, files and web pages the AI read (the catering PDF, guests.xlsx, the searches), and the chat itself, which holds the summer-party bubbles from Slide 2 in grey. All parts are grey except the chat bubbles. Two parts light up in the accent colour in turn, the starting instructions and the memory. The explanation panel beside the grid says, for the starting instructions, "Text placed before your first message, before you type anything", and for the memory, "Short notes about you, saved earlier and put back in front of the AI, so a new chat already knows you". The other parts are named but not explained.

#### Speaker notes

1. **Nothing carries over by itself** — a model holds nothing between requests; memory across chats exists only when an application stores notes outside the model and puts them back into the context [1].
   - sources: [1] Han, Why does an LLM forget everything between chats? (earlier research file, excludes consumer chat apps) — docs/episodes/onboard-ai-every-time/research/LLM-0003__llm-memory-between-chats/research.md
2. **Documented for Claude Code** — its instructions and its saved notes are loaded at the start of every conversation, and Claude treats them as context, not enforced configuration [2].
   - sources: [2] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory
3. **Loading has a cost** — longer instruction files consume more context and reduce adherence, and only the first 200 lines or 25KB of the notes index load at the start [2].
   - sources: [2] Anthropic, How Claude remembers your project — https://code.claude.com/docs/en/memory
4. **Chat apps document the effect** — Claude's app saves memory as topics so the next conversation already knows what changed [3], and Gemini remembers information you share, even in new chats [4]; that the apps load it at the start is an inference.
   - sources: [3] Anthropic, Use Claude's chat search and memory to build on previous conversations — https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-conversations
   - sources: [4] Google, Manage what Gemini remembers about you and customize responses — https://support.google.com/gemini/answer/16598625
5. **Not every feature preloads** — Claude's past-chat search is fetched on request [3], and ChatGPT looks for relevant context only when it is likely to improve a response [5].
   - sources: [3] Anthropic, Use Claude's chat search and memory to build on previous conversations — https://support.claude.com/en/articles/11817273-use-claude-s-chat-search-and-memory-to-build-on-previous-conversations
   - sources: [5] OpenAI, Memory in ChatGPT — https://help.openai.com/en/articles/8590148-memory-faq

#### Voice script

1. **More than the chat** — what you see in the chat is only part of what the AI reads
2. **Starting instructions** — text placed in front of your first message, before you type a word
3. **Memory** — short notes about you, saved earlier and put back in front of the AI, which is why a new chat already knows a few things about you
4. **The rest** — attached files, web pages, tool results; I only name them today, they all share the same window

### One innocent question {#one-innocent-question}

#### Visual

master: basic-page · motion: local

The Context window cornerstone, shown by Preset: the Technical view with the grid, at the point of the summer-party chat where You: "The catering offers are in the project folder. Which one fits?" is asked; the earlier bubbles sit grey above it, among them the two web searches, which show as modest blocks. The answer is one line, AI: "Sabor Verde fits best: it includes a vegetarian menu for 12." In the grid beside it, one big block jumps in, the catering PDF the AI read to answer, far larger than anything before it. The question bubble, the answer bubble and that big block are lit together in the accent colour; everything else stays grey. A small label on the block reads "20 pages read behind the scenes, not shown in the chat".

#### Speaker notes

1. **Everything is loaded** — with basic web search every result is loaded into the context window, much of it irrelevant to the request [1].
   - sources: [1] Anthropic, Web search tool (Claude API documentation) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
2. **It stays** — search results count as input tokens, in the turn itself and in later turns, and are passed back into later requests, so they remain part of the window [1].
   - sources: [1] Anthropic, Web search tool (Claude API documentation) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool
3. **A PDF is the big bite** — Anthropic estimates an average web page at about 2,500 tokens and a research-paper PDF at about 125,000 [2].
   - sources: [2] Anthropic, Web fetch tool (Claude API documentation) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool
4. **The remedy** — vendors filter before the window or cap the returned tokens [2]; OpenAI describes the same shape, with deep research tapping hundreds of sources [3].
   - sources: [2] Anthropic, Web fetch tool (Claude API documentation) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool
   - sources: [3] OpenAI, Web search (API documentation) — https://developers.openai.com/api/docs/guides/tools-web-search
5. **API figures, not app figures** — these sources describe developer tools; how many pages a given chat app loads per question is not published [1].
   - sources: [1] Anthropic, Web search tool (Claude API documentation) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool

#### Voice script

1. **Three venues** — a small question, three options in the answer, and two searches behind it
2. **What you don't see** — the searches add some extracts you never see, a modest bite each
3. **The catering PDF** — then you point at the catering offers; the AI reads all twenty pages, the big jump
4. **The intern** — give an intern the same task and they'd read the whole file first too; the AI just does it fast and shows you only the result
5. **A big bite** — one short question can take a big bite out of the window

### You can't watch the meter {#you-cant-watch-the-meter}

#### Visual

master: basic-page · motion: local

First version: the sister's notepad, a few scribbled lines on a notepad card in place of the whole call, drawn in the Chat style as a plain white card with handwriting-like lines: "Mum's phone", "neighbours' renovation", "Pepper ate the cake", with the accent colour on the last line. Later stage: the Context window cornerstone, shown by Preset: compaction, on the summer-party chat, which has run on until the fill enters the hatched space kept free for summaries. Compaction runs, and every message block in the context bar collapses into one summary block, placed after the starting instructions and the memory; free space returns. The chat on the left looks unchanged, every bubble still there. Before it, the chat runs on and fills the buffer: You: "That's 12,300 over our budget. Also check the venue contract.", the AI reads the 18-page venue contract (a big block), and the chat keeps going until the fill enters the hatched space. Those run-on bubbles are why the budget survives: the user flagged it again, so it is fresh when the summary is written. The summary block lists what it kept: "The goal: a summer party for 40, end of June, in Lisbon", "The budget: 40,000 euro, and that the last plan was 12,300 over", "12 vegetarian guests, 15 travelling", "Venue Estrela pavilion, caterer Sabor Verde, hotels Lumen and Casa do Rio", "Contract: music until 23:00, 30% deposit". After it AI: "The contract allows music until 23:00 and asks for a 30% deposit." is answered from the summary alone. Then the chat goes on: You: "Put the plan together again." AI: "Plan: venue 14,800, catering with the vegetarian menu 15,600, hotels 6,600, music 3,000. Total 40,000 euro, on budget." No meter or percentage is shown anywhere on the Slide, which is the point. A small label on the summary block reads "older messages, squeezed".

#### Speaker notes

1. **Documented for Claude** — for users with code execution enabled, Claude summarises earlier messages when a conversation approaches the context limit [1].
   - sources: [1] Anthropic, How do usage and length limits work? — https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work
2. **The only sign** — the page describes you occasionally seeing Claude "organizing its thoughts", and announces no notice each time; that it hides this on purpose is an inference [1].
   - sources: [1] Anthropic, How do usage and length limits work? — https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work
3. **Full history is kept** — the whole chat is preserved so Claude can reference it after summarising [1].
   - sources: [1] Anthropic, How do usage and length limits work? — https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work
4. **A summary can lose things** — Anthropic warns that over-aggressive compaction can lose subtle but critical context whose importance only shows later [2].
   - sources: [2] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
5. **Other apps are unknown** — no vendor page found documents summarising in ChatGPT, Gemini or Copilot, and a chat interface may instead drop the oldest content first [3]; OpenAI's compaction is documented for its API and is opaque [4].
   - sources: [3] Anthropic, Context windows — https://platform.claude.com/docs/en/build-with-claude/context-windows
   - sources: [4] OpenAI, Compaction — https://developers.openai.com/api/docs/guides/compaction

#### Voice script

1. **Her own notes** — your sister doesn't keep the call, she keeps her own notes of it; a few lines instead of everything
2. **The app does something like it** — when a chat gets long, older messages can be squeezed into a short summary so the conversation can go on
3. **You can't watch the meter** — the chat looks the same, and nothing tells you how full the window is, so you rely on habits, not a gauge
4. **Why the budget survived** — you flagged the 12,300 over budget just before, so it made it into the summary and the plan fits 40,000 euro again; not every detail makes it

## Managing the attention span {#managing-the-attention-span}

#### Voice script

1. **You manage by habit** — you can't read a gauge, so you build habits, from everyday ones to the big project

### Everyday habits {#everyday-habits}

#### Visual

master: basic-page · motion: local

A cut-down Context window cornerstone, shown by Preset: two bars side by side. On the left the full old chat, the summer-party conversation, a long context bar with the middle faded to grey. On the right a fresh chat, a nearly empty bar holding only one lit card in the accent colour, the handoff card. The handoff card reads: "Handoff card: Party for 40, 27 June, budget 40,000 €. Venue: Estrela pavilion. Caterer: Sabor Verde (12 vegetarian). Next: invitations." It is the same venue and caterer as the summary on Slide 9. The first bubble of the fresh chat is You: the handoff card pasted in. An arrow carries the handoff from the old bar to the new one. Under the bars, three plain captions appear in turn: "One chat, one job", "Ask for a handoff after real progress or before a break, read it, correct it", "Start the next chat with it".

#### Speaker notes

1. **Length itself hurts** — with perfect retrieval, performance still dropped as input grew, and the drop persisted when irrelevant tokens were replaced by whitespace or masked from attention [1]; that a fresh, shorter chat avoids the drop is an inference from this, the studies do not test a restart.
   - sources: [1] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381
2. **One job per chat** — even a single distractor lowers performance relative to the needle alone, so unrelated material in a chat has a cost [2].
   - sources: [2] Hong, Troynikov, Huber, Context Rot: How Increasing Input Tokens Impacts LLM Performance — https://www.trychroma.com/research/context-rot
3. **A short recap helped** — having the model recite the retrieved evidence before solving, which turns a long task into a short one, improved results [1]; that a handoff works the same way is an inference.
   - sources: [1] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381

#### Voice script

1. **Break it down** — you know this already; split a big task into small steps
2. **Fresh start** — you know this one too; a fresh start spends the whole window on the work in front of you
3. **One chat, one job** — the topic changes, open a new chat
4. **Ask for a handoff** — after real progress or before a coffee break, stop and ask for a handoff
5. **Read and correct it** — read it, correct what's wrong; a summary can lose things, and you are accountable
6. **Start the next chat with it** — paste the handoff in first; the new chat starts small and sharp

### The workflow for bigger projects {#the-workflow-for-bigger-projects}

#### Visual

master: basic-page · motion: local

Mini context bars on the white stage. One slim bar at the top is the planner chat of the summer party, drawn in the accent colour; it stays slim throughout. Below it, a row of worker chats, each a bar of its own: venues, catering and invites. The catering worker's bar jumps with the PDF read, the one a planner chat would not carry. In turn, the planner hands a step to a fresh worker bar, which fills up, and the result comes back to the planner as one small lit card; then the worker bar is thrown away, fading out. The next worker bar starts empty. The planner's bar grows only by a card at a time.

#### Speaker notes

1. **Clean windows for each part** — Anthropic's remedy for long tasks includes sub-agents that work with clean windows [1].
   - sources: [1] Anthropic, Effective context engineering for AI agents — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
2. **Short tasks beat long ones** — turning a long task into a short one improved results, GPT-4o on RULER by up to 4% [2].
   - sources: [2] Du et al., Context Length Alone Hurts LLM Performance Despite Perfect Retrieval — https://arxiv.org/abs/2510.05381

#### Voice script

1. **One chat is too small** — a bigger project would fill any single window
2. **Break it down first** — work backward from the outcome, with the AI's help if you like
3. **One planner** — one chat stays the planner and keeps only the plan and the results
4. **A fresh chat per step** — hand each step to a fresh chat, take the result back, and let that chat go
5. **You coordinate** — like a project manager; this is what we call a workflow

## Notes

- `convert-references` is blocked: the Brief's design reference for the context window cornerstone came in as a PNG with no PDF, so `reference/context-window-cornerstone/design-reference.md` does not exist. This Dossier is written without it, and no Slide names a `Design reference:` page. The cornerstone is described as a Preset per Slide in viewer terms.
- Slide 8 (One innocent question): the jump is the catering PDF read (about 55K for 20 pages), not a web search. WebFetch returns extracts, about 16 to 17.5K per search; the Brief's "about ten web pages" and the earlier "ten or more searches" are gone. Speaker note 3 rests on `research/LLM-0009__web-search-fills-context-window` Finding 5 (Anthropic's per-size estimates, API figures). Sourced only from the fork's fact-check, not a research Finding, and a source the Spec must cite: Claude Code tools reference (https://code.claude.com/docs/en/tools-reference) for WebFetch returning an extract and not the page, for Read taking PDFs over 10 pages in ranges of up to 20 pages, and for Read refusing .xlsx (guests.xlsx is opened with Bash and pandas, about 2K); the roughly 2,700 tokens a page is the grill's estimate (`.scratch/ai-attention-span/cornerstone-factcheck.md`, W1, W2, W3).
- The summer-party chat replaces the Lisbon chat on every Slide; its source is `.scratch/ai-attention-span/cornerstone-grill.md` (Rounds 9 to 11) and the prototype's chat data. The token counts are set at the Spec in the Preset data, not in this Dossier.
- Slide 4: "the AI may fill this gap itself" is an inference from the lost-accuracy results and the distractor finding, marked as a hypothesis in the Voice script. Slide 4 has no compaction. The grill put compaction on Slide 4; Han moved it to Slide 9.
- Slide 5: the smart-zone lines (Matt Pocock 80K on 200K and 150K on 1M, "Smart zone by Matt Pocock"; Han 300K on 1M only, "Smart zone by Han") come from the grill (Round 9, Han's words), not from a research Finding. They are one practitioner's habits.
- Slide 9: compaction is its own Preset (the fill enters the buffer, one summary block, free space returns, the chat app looks unchanged, the summary keeps the budget). The buffer (about 33K; compaction at about 967K on 1M) is from the fact-check (Claude Code model-config), not a research Finding, and a source the Spec must cite; the buffer on a 200K window is unverified. Only Claude documents summarising in its consumer app; the Slide says the other apps are unknown.
- Slide 7: "loaded at the start" is documented for Claude Code only; for the chat apps the Slide calls it a reading.
