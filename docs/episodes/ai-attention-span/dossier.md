---
type: dossier
title: Why AI has a weird attention span you must learn to manage
status: draft
generated:
  by: claude-code/opus-5.5
  at: 2026-10-20T20:35:57Z
locale: en
brief: ./brief.md
verified:
  - by: process:markdown-harness
    at: 2026-10-20T19:36:52Z
  - by: process:markdown-harness
    at: 2026-10-20T20:25:27Z
  - by: process:markdown-harness
    at: 2026-10-20T20:35:57Z
---

# Why AI has a weird attention span you must learn to manage {#ai-attention-span}

## The long phone call {#the-long-phone-call}

#### Voice script

1. **A long chat is a long call** — Imagine the last long phone call you had with someone close, a sister, a friend, your mum. You called to settle one thing, and an hour later you hung up. Before I say a word about AI, I want you to feel what that call left you with, because the question I want to ask you is whether a long AI chat does the same thing to you, so the call comes first and the chat second.

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

1. **The start sticks** — Say you call your sister to sort out the holidays. "Let's sort out the holidays!" is how it starts, and that first line sets the frame for everything after it, so you still remember it at the end. That is called primacy.
2. **The end sticks** — You also remember how it ended. "Talk soon, bye", and the last few minutes before it, because they just happened and are still fresh. That is called recency.
3. **The middle blurs** — Now the middle. An hour of detail went by, the neighbours' renovation, Mum's new phone, your sister's back pain, and if someone asked you what was in it, you could hardly say. All of it was said, and very little of it stayed.
4. **One thing stands out** — Except one thing. Pepper ate a whole birthday cake, candles included. Nobody asked you to keep that, and you can still tell it, because what is different from everything around it survives. That is called the isolation effect.
5. **We never fixed the date** — And then the punchline. Dinner is ready, she has to run, and you realise: we never fixed the date. The one thing you called for never got settled. (pause) Hold on to that, because the question is whether an AI chat does the same.

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

1. **Meet the summer-party chat** — So let me introduce a chat that stays with us for the rest of the episode. You plan a company summer party with an AI: 40 people, end of June, a budget of 40,000 euro, and you give it a catering PDF and a guest list. Remember this chat, because we come back to it on every slide that follows.
2. **It happens in a long chat too** — Now let it run for an hour. You started with the plan and the budget, and the first messages tend to get used, the latest messages tend to get used, and the middle gets lost. A detail you keep repeating, like the 12 vegetarian guests, survives. Later the budget slips, which is odd for a number from your very first message, and why that happens comes on a later slide.
3. **A shape, not a brain** — I'm not saying the AI thinks the way you do. It has no sister and no Mum with a new phone. What I'm saying is that the shape is the same, and a shape is something you can predict, so you know where to expect the slip.
4. **What a lost detail costs** — With your sister, a lost detail is funny. With a deadline, it's expensive. So ask yourself which one your chat is: the one with the dog and the cake, or the one with your budget in it.

## The AI's attention span {#the-ais-attention-span}

#### Voice script

1. **Why it happens** — So far you have seen what happens. Now the cause, because once you know how the AI holds a chat, the pattern stops being a surprise, and only after that do we look at what it does to your answers.

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

1. **You type one line** — You type one short line, say, find three venues in Lisbon. But what the AI receives is the whole conversation so far, from your first message to your last, and it receives all of it with every single message you send.
2. **There is a size limit** — That bundle has a maximum size. Picture it as a bar that fills up block by block, one block for every question and every answer, until there is no room left. That bar is the context window. That limit is the AI's attention span: how much it can hold in view at once.
3. **The term to keep** — The term to keep is context window. If you remember one word from today, take this one, context window.
4. **Context engineering** — There is a name for working with it: context engineering. It means giving the AI the right context at the right time, not the most context, the right one. That is what we manage today.

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

1. **The start helps, but is no guarantee** — Now watch what happens as this chat grows. The start still helps, because the first messages tend to be used well, like the opening of the call, but that is no guarantee, and you will see why in a moment. One thing before we go on: the numbers on this slide are illustrative, I picked a 200K window and the little bars that show how much the AI looks at each message, to show the shape, not to measure anything.
2. **The newest stays sharp** — The newest stays sharp too. The latest messages are used well, like the last minutes of the call, because they sit right at the end of what the AI is reading.
3. **The middle blurs** — The middle blurs. What you said an hour ago sits in the blurry part, and the AI treats it the way you treat the neighbours' renovation: it was there, but it is thin.
4. **A standout survives** — And one standout survives. The 12 vegetarian guests, a detail the chat keeps repeating, are still there, and the plan comes back with a vegetarian menu.
5. **Answers get worse** — Now something new, and this is where it gets uncomfortable. As the chat fills, the answers get worse. This is called context rot.
6. **The budget is forgotten** — Look at the budget. Your very first message said 40,000 euro, and now the plan comes back at 52,300. The start of a chat is attended to well, so it was not lost by its position. It got little attention because it is one short number among many similar ones.
7. **Filling the gap** — So here is a small number sitting among all the similar numbers from the offers and the searches, and when the AI can't find it, I think it fills the gap itself with something that sounds plausible. I want to be straight about this: that is my hypothesis, not proven.

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

1. **A hundred units** — Think of attention as a budget of a hundred units. And I say it plainly: these numbers, the token counts and the window sizes on this slide are illustrative. I made them up to show the shape, so please don't take them as measurements.
2. **Where it goes** — Where does the budget go? A big share to the start, a big share to the newest messages, and what is left is shared out across the middle, thinner and thinner with every message you add. That is why the middle fades.
3. **A spike in the middle** — But a detail you keep repeating keeps its share, and it shows as a spike in the middle. The 12 vegetarian guests came up again and again, so they stay bright, while the budget, said once, fades.
4. **Smart zone and dumb zone** — Somewhere, the middle gets too thin to trust. Before that line the AI is in the smart zone, beyond it in the dumb zone. Matt Pocock puts the line at 80K tokens on a 200K window and at 150K on a 1M window. That is his number, a rule of thumb, and you only get the zone names now because you have already seen the middle fade.
5. **Having it is not using it** — Having it is not the same as using it. Your sister secretly recorded the call, and she still can't find what you said at one hour, 13 minutes and 17 seconds. The recording is complete, and finding one sentence in it is the hard part. A full window works the same way.
6. **My own line** — My own line sits at 300K tokens, and only on the 1M window. That is one practitioner's habit, not a law. Yours may differ, and that is fine, as long as it is a line you chose on purpose.

### What we learned so far {#what-we-learned-so-far}

#### Visual

master: basic-page · motion: none

A small version of the phone-call transcript on the left, with the fade on its middle, and a small cornerstone context bar on the right, filled and faded the same way. One line under each: under the call, "Long calls keep the start, the end and a standout"; under the bar, "A long chat does the same, because the window is limited". A single closing line spans both: "Manage it, or the middle gets lost."

#### Speaker notes

1. **Two kinds of evidence** — the human pattern comes from lab word lists [1], the model pattern from retrieval tests on long inputs [2]; the match between them is an analogy, not a proof.
   - sources: [1] Murdock, The serial position effect of free recall — https://doi.org/10.1037/h0045106
   - sources: [2] Liu et al., Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172

#### Voice script

1. **Same effects** — Let's put it together. Long AI conversations show the same effects as long human ones: the start, the end and a standout survive, and the middle blurs.
2. **The window is the span** — The reason is that the AI's attention span is its context window, a limited space that fills with every message.
3. **Manage it** — So treat it as a resource you manage actively, so that important decisions and information don't get lost in the middle. The rest of the episode is about what goes into that window, and what you do about it.

## What fills the window {#what-fills-the-window}

#### Voice script

1. **More in there than you typed** — You have seen the window fill with your messages. But your messages are only a part of it, so the next question is what else goes in without you noticing.

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

1. **More than the chat** — What you see in the chat is only part of what the AI reads. The chat is the visible slice, and around it sit other parts that you never typed.
2. **Starting instructions** — First, the starting instructions: text placed in front of your first message, before you type a single word. That way the AI is already briefed before you say anything.
3. **Memory** — Second, memory: short notes about you, saved earlier and put back in front of the AI, which is why a new chat already knows a few things about you. It is useful, and it is one more thing in the window.
4. **The rest** — The rest are attached files, web pages the AI read, and results from tools and connectors. I only name them today. What matters is that they all share the same window as your chat.

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

1. **Three venues** — Say you ask: find three venues in Lisbon. It is a small question. The answer is three options in a few lines, and behind it the AI ran two searches.
2. **What you don't see** — Those searches bring back extracts of web pages that you never see. Each one is a modest bite, and the window takes it and moves on.
3. **The catering PDF** — Then you point at the catering offers in the project folder and ask which one fits. The answer is one line, Sabor Verde. To give it, the AI read the whole catering PDF, all twenty pages, and that one question filled the window far more than anything before it.
4. **The intern** — Give an intern the same task and they would read the whole file first too, before telling you one line. The AI does exactly that, only fast, and it shows you just the result. There is nothing wrong with it, you only need to know it happened.
5. **A big bite** — So one short question can take a big bite out of the window while the chat looks as small as before. Keep that in mind when a chat feels full sooner than you expected.

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

1. **Her own notes** — Your sister doesn't keep the call. She keeps her own notes of it, a few scribbled lines: Mum's phone, the renovation, Pepper and the cake. A few lines instead of everything.
2. **The app does something like it** — The app does something like it. When a chat gets long, older messages can be squeezed into a short summary, so the conversation can go on instead of hitting the wall.
3. **You can't watch the meter** — And here is the catch: the chat looks the same. Every bubble is still there, so you can't rely on a gauge, you rely on habits.
4. **Why the budget survived** — Why did the budget survive here? Because you flagged the 12,300 over budget just before, so it was fresh when the summary was written, and the plan fits 40,000 euro again. That was timing.

## Managing the attention span {#managing-the-attention-span}

#### Voice script

1. **You manage by habit** — You can't read a gauge, so you build habits. First the everyday ones, and then the one for a big project.

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

1. **Break it down** — Break it down. You know this one already: you split a big task into small steps, and each step is small enough to hold in view.
2. **Fresh start** — Fresh start. You know this one too: a fresh start spends the whole window on the work in front of you, and none of it on what happened an hour ago.
3. **One chat, one job** — One chat, one job. When the topic changes, open a new chat, so that the hotel question doesn't have to carry the catering PDF along.
4. **Ask for a handoff** — Ask for a handoff. After real progress, or before a coffee break, stop and ask the AI for a handoff: a short card with the goal, what is decided and what comes next.
5. **Read and correct it** — Then read it and correct what is wrong. A summary can leave things out or get one wrong, and you are the one accountable for what the next chat believes.
6. **Start the next chat with it** — And start the next chat with it. Paste the handoff in as the first message, and the new chat starts small and sharp, with the venue, the caterer, the budget and the next step, and nothing else.

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

1. **One chat is too small** — Sometimes the project is bigger than one chat can hold: the whole summer party, with venues, catering, hotels and invitations. One chat would fill up, whatever window size you give it.
2. **Break it down first** — So you break it down first. Work backward from the outcome, what do I need to run this party, and then what do I need for that, until the next step is clear. You can ask the AI to help you with that.
3. **One planner** — Then one chat stays the planner. It keeps only the plan and the results, so it stays small and has room to spare.
4. **A fresh chat per step** — Each step goes to a fresh chat: venues, catering, invitations. That chat reads its files and fills up as much as it needs, hands the result back to the planner as one small card, and then you let it go. Next step, next fresh chat.
5. **You coordinate** — And you coordinate, like a project manager. This is what we call a workflow. Every chat has one job, so none of them runs long enough to blur its middle. That is the whole idea: the window is the AI's attention span, and managing it is your job. One honest caveat: the zones and numbers I gave you are rules of thumb and illustrations, and I have not tested every chat app, so watch your own chats and adjust. If you want a low-key place to start, take the next chat that drifts, ask it for a handoff, and open a new one with it. Thank you.

## Notes

- `convert-references` is blocked: the Brief's design reference for the context window cornerstone came in as a PNG with no PDF, so `reference/context-window-cornerstone/design-reference.md` does not exist. This Dossier is written without it, and no Slide names a `Design reference:` page. The cornerstone is described as a Preset per Slide in viewer terms.
- Slide 8 (One innocent question): the jump is the catering PDF read (about 55K for 20 pages), not a web search. WebFetch returns extracts, about 16 to 17.5K per search; the Brief's "about ten web pages" and the earlier "ten or more searches" are gone. Speaker note 3 rests on `research/LLM-0009__web-search-fills-context-window` Finding 5 (Anthropic's per-size estimates, API figures). Sourced only from the fork's fact-check, not a research Finding, and a source the Spec must cite: Claude Code tools reference (https://code.claude.com/docs/en/tools-reference) for WebFetch returning an extract and not the page, for Read taking PDFs over 10 pages in ranges of up to 20 pages, and for Read refusing .xlsx (guests.xlsx is opened with Bash and pandas, about 2K); the roughly 2,700 tokens a page is the grill's estimate (`.scratch/ai-attention-span/cornerstone-factcheck.md`, W1, W2, W3).
- The summer-party chat replaces the Lisbon chat on every Slide; its source is `.scratch/ai-attention-span/cornerstone-grill.md` (Rounds 9 to 11) and the prototype's chat data. The token counts are set at the Spec in the Preset data, not in this Dossier.
- Slide 4: "the AI may fill this gap itself" is an inference from the lost-accuracy results and the distractor finding, marked as a hypothesis in the Voice script. Slide 4 has no compaction. The grill put compaction on Slide 4; Han moved it to Slide 9.
- Slide 5: the smart-zone lines (Matt Pocock 80K on 200K and 150K on 1M, "Smart zone by Matt Pocock"; Han 300K on 1M only, "Smart zone by Han") come from the grill (Round 9, Han's words), not from a research Finding. They are one practitioner's habits.
- Slide 9: compaction is its own Preset (the fill enters the buffer, one summary block, free space returns, the chat app looks unchanged, the summary keeps the budget). The buffer (about 33K; compaction at about 967K on 1M) is from the fact-check (Claude Code model-config), not a research Finding, and a source the Spec must cite; the buffer on a 200K window is unverified. Only Claude documents summarising in its consumer app; the Slide says the other apps are unknown.
- Slide 7: "loaded at the start" is documented for Claude Code only; for the chat apps the Slide calls it a reading.
