# Cornerstone grill: the context window shared visual

Gate 1 of `.scratch/ai-attention-span/handoff.md`: the UI UX Pro Max grill on the context window cornerstone of Episode `ai-attention-span`, run in a forked session beside the Brief gate. Visual reference: Han's Miro mockup, `.scratch/ai-attention-span/context-window-cornerstone.png` ("Default: Bar, Simple" and "Toggled: Grid, Detailed"), the base to build on. Behaviour reference: the handoff's Spec 0. Style: Chat (`docs/design/design-guide.md`).

Tags: _Han_ = Han decided it in this grill. _agent-decided_ = listed under "Decided without asking" and left uncontested.

## Status

Rounds 1–6 answered (Q1–Q34). Round 7 is Han's feedback on the prototype, built into version 2. Prototype in `.scratch/ai-attention-span/prototype/cornerstone.html`. Rounds 8–10 built into version 5, round 11 into version 6. Version 4 is kept as `prototype/cornerstone-v4-before-compact.html`, version 5 as `prototype/cornerstone-v5.html`. Han closed the grill after round 11 and one performance run. Nothing open: the buffer was settled in round 13, and the phone check was skipped by Han.

## For the main session

- **Brief, Open ideas.** The Brief keeps the smart-zone numbers in the voice track (main session Q6). Q21 puts them on the Slide as labelled lines: Matt Pocock 150K and Han 300K. The Brief's "Han stays under 30K, up to 40K in automated runs" disagrees with Q19's 300K; put both changes to Han at the Brief gate.
- **Mockup numbers.** With a 1M window, the mockup's 62% used and its token counts no longer hold together; the Preset data sets new ones (see Q22). The window size is a Preset field, default 1M.
- **New dev dependencies.** Playwright and an axe integration (Q30, Q32, Q34). Today's browser lane is vitest plus the pinned chrome-headless-shell (`skills/visual-check/scripts/browser.ts`); `ARCH-003-testing` §4.2 may need an amendment. Still local only, never CI.
- **Docs.** A new `docs/features/` entry for the cornerstone with its manual testing criteria (Q33).
- **Rename.** `Simple | Detailed` became `Simple | Technical` (round 7); the Spec and the `docs/features/` entry use Technical.
- **Brief and Slides, round 9.** The default window is now 200K, and Slide 5 shows the same chat in 1M. Pocock's line is 80K on 200K and 150K on 1M, labelled "Smart zone by Matt Pocock". Han's 300K line appears only on 1M. The chat lost the venue contract (now 21 steps, about 128K). Slide 8's jump is the catering PDF read, not the web search. Autocompact comes back into scope as its own Preset (round 10); the main session moved it out, so put this to Han at the Brief gate.
- **Fact-check.** `.scratch/ai-attention-span/cornerstone-factcheck.md`. The Spec cites its sources: Claude Code tools reference for WebFetch, Read on PDFs and .xlsx; model-config for compaction at ~967K. Its Missing list belongs in the Spec's content: resent context, prompt caching, thinking tokens, subagents.
- **Prototype.** `.scratch/ai-attention-span/prototype/cornerstone.html`; per the prototype skill (rule 6), commit it to a throwaway branch. The fork does not commit.
- **Performance, version 6 (one run, /performance-optimization).** Measured in Chrome on the local server; no optimisation was needed, none was made.
  - Load: DOMContentLoaded 46ms, load 49ms, no long tasks, no layout shift (CLS 0).
  - Commit a step (dispatch + layout, Slide 4, 28 steps × 3): bar median 2ms, p95 3.6ms; grid median 7.2ms, p95 11.8ms. Hover a message: bar 1.5ms, grid 6.4ms median. All far inside the 200ms INP budget.
  - Mounting the grid Preset: 18ms. The page holds about 830 DOM nodes.
  - The grid costs more because it rebuilds 100 boxes on every render, hover included. If the Spec's grid ever grows (more boxes, more categories), diff the boxes instead of `replaceChildren`; not worth it at 100.
  - Guard for the Spec: a browser test that a full scrub of the longest Preset stays under 16ms per commit in the grid.
- **Round 11 changes for the Spec.** Bar/Grid is no longer a control: Simple shows the bar, Technical the grid. The smart-zone lines and the zoom live only in the bar. Simple chat follows the Claude app (grey user bubble, plain replies, collapsible tool lines); Technical is the terminal. No reply box. One toolbar.

## Chat

- Collapsed, the chat leaves a thin rail with one coloured tick per message, a minimap; hovering or clicking a tick still lights its part. _Han_ (Q5: "1")
- The chat scrolls on its own for reading; it never sets how full the context is (see Scroll bar). _Han_ (Q1)
- Narrow screens (below `md`) stack: control row, chat (max ~40svh, scrolls), a row with the timeline and the context bar both horizontal (filling left to right), then the panel. _Han_ (Q14: "1")
- A faded bubble the AI may fill itself gets a dashed outline and one small note beside it (Slide 4: the 40,000 euro budget). _Han_ (Q18: "1")
- The system lines "Starting instructions, hidden" and "Memory loaded" stay centred grey chips, linked to their parts like bubbles. _agent-decided_
- On every step change the chat jumps to the newest message at that step, like a messenger; between scrubs the reader scrolls up freely. _Han_ (Q9: "1")

## Scroll bar

- Timeline, not reading position. The middle bar is a timeline of the conversation, one step per message; moving it adds or removes messages at the bottom of the chat and fills the context. Reason: one chat turn can add far more context than it takes chat height (the web search), so chat height and the context bar cannot stay in sync. Han wants to scrub it with the mouse and watch the context and the attention redistribute live. _Han_ (Q1: "the basic issues is that it's impossible to keep the height of the chat with the vertical context window bar in sync, as one chat can add a lot of context. at the same time i really like the idea of using the mouse to scrub over a timeline or scrollbar to see live updates, this is espeical visual if we see the attention redistribute."; option 2 confirmed in round 2)
- Hover scrubs a preview, click commits: moving the pointer along the timeline previews that step live; leaving it snaps back to the committed step unless clicked. Steps change instantly, no tween. _Han_ (Q8: "2")
- On touch, dragging the thumb commits and the step stays where the finger lifts; a tap on the track jumps there. _Han_ (Q13: "1")
- A Preset locks the timeline step and the control row separately, each by its own flag. _Han_ (Q12: "2")
- One step per message; the web search is one step, so its jump reads as one event. _agent-decided_
- A native range input (`role=slider`, arrow keys step it), styled as the mockup's thumb. _agent-decided_
- A static one-line hint beside the timeline ("Drag or hover to replay the chat"); it disappears after the first interaction, returns on reload, never stored. _Han_ (Q25: "1")
- Hover previews only where hover exists (`@media (hover: hover)`); touch never previews. _agent-decided_
- A preview also moves the chat to that step's newest message; leaving restores the committed step and its scroll. _agent-decided_

## Context view

- Part colours are the meaning tokens: You `human`, AI reply `ai`, starting instructions and memory `machine` at two strengths, web pages a Slide-local colour with a dark counterpart, free space `muted`. All through CSS variables, so they change later in one place. _Han_ (Q2: "1, as long we have css-variables, its flexible to update later")
- Lit = the part in the spotlight now, hovered (preview) or pinned, with its partner bubble: full colour plus the accent outline. While nothing is lit every part shows its full colour; once one is lit, every other part and bubble fades to soft grey. _Han_ (Q11: "3")
- Smart-zone lines: drawn on the context bar as dashed lines at a token amount and explained by the Attention chart. A Preset sets them: up to two lines, each with its label; default one line, Matt Pocock's 150K. Han's own line is a second option at 300K. _Han_ (Q15: "2, can be configured via preset, two options availalbe with label so we can set two. default one by matt pocock 150k and one by me at 300k"; Q19: "300k", over the Brief's 30K)
- The window size is configurable per Preset; the default is 1M tokens, the size most commonly marketed now. With 1M, both lines sit at their true positions: 150K at 15%, 300K at 30%. _Han_ (Q20: "1M window token"; Q22: "make the context window configurable. default let's use 1M which, is the most common marketed right now.")
- The summer party chat scales up past both lines: the web search reads full pages (~80K), later steps add attached files and more searches, and the timeline ends near 40% (~400K) of the default window. Scrubbing crosses 150K, then 300K, and the Attention chart redistributes at each. Slides 3–5 pick their step to fit their point. Exact counts are set once in the shared Preset data, at the Spec. _Han_ (Q22: "1")
- A line above the Preset's window size is not drawn, and the Preset data check flags it. The meter's percent is always fill ÷ window size. _agent-decided_
- The lines carry their labels and numbers on the Slide, not only in the voice track. _Han_ (Q21: "1")
- The lit outline is `primary`, the Chat style's stage light, in both themes. _Han_ (Q16: "1")
- Grid lit state: the lit part's boxes keep full colour, every other box fades; no group border; the `primary` outline on each lit box. _agent-decided_
- Legend under the bar; its items are buttons that light their part, as hovering the part does. _agent-decided_
- The bar's height is the whole window: free space grey, dashed limit line at the bottom, as in the mockup. _agent-decided_
- Every part is a real `button` with `aria-pressed`; the bar and the grid each take one tab stop, and arrow keys move between parts (roving focus). _agent-decided_
- Crossing a line lights it: dashed line and label turn from grey to `primary`, and the readout adds "Past Matt Pocock's smart zone". No motion; scrubbing back turns it off. _Han_ (Q26: "1")
- A pinned part survives a scrub to before it existed: an empty outline at zero height, and the panel says "Not in the context yet at this step". _Han_ (Q27: "1")
- Hit areas at least 44px via invisible padding; grid boxes too small are reached through the legend buttons. The focus ring uses the `ring` token, separate from the lit `primary` outline. Colour never carries meaning alone: every part is named in the legend and the panel, and lit is an outline. _agent-decided_

## Detail panel

- The "illustrative" label sits in the Attention panel's header as a caption, always visible. _agent-decided_
- Detailed mode renders `tool_use` / `tool_result` as inline code chips plus a monospace block, as in the right mockup; code at `0.9em` (FE-011 §3.5). _agent-decided_
- Simple/Detailed applies in both modes; in Attention, Detailed adds each bar's unit value. _agent-decided_
- With nothing lit, the panel shows the current step: "Step 7 of 14 · Web search read 10 pages · +80,000 tokens · 18% used". _Han_ (Q24: "1")
- A fixed minimum height, so a step change never shifts the layout. _agent-decided_

## Meter

- A toggle hides the "62% used" number; the limit line on the bar stays. A Preset may start with the meter hidden (set-up for Slide 9, "you can't watch the meter"). _Han_ (Q6: "1")

## Toggles

- One unified control element at the top right holds the controls. A Preset can hide it, which fixes the Slide's state. _Han_ (Q4: "there should be one unified control element on the top right, which given a preset can be hidden so the state is fixed")
- A Preset lists which controls show, per segment and icon button, so the controls open up Slide by Slide (Slide 3 view only, Slide 4 adds Attention, Slide 5 adds Detailed). _Han_ (Q23: "1")
- Its form: one pill row of three segments, `Bar | Grid` · `Explain | Attention` · `Simple | Detailed`, with two icon buttons at its end, collapse chat and hide meter, each with an accessible name. All options always visible. _Han_ (Q10: "1")

## Across parts (touch, keyboard, motion, print)

- Hover previews, click pins. Hovering a bubble or part lights its partner while hovered; a click, tap or Enter pins it until clicked again, a click elsewhere or Esc. On touch, a tap pins. _Han_ (Q7: "1")
- Under reduced motion every state change is instant; print shows each Preset's state with the controls hidden. _agent-decided_
- A screen reader hears committed steps only: one `role="status"` line plus the slider's `aria-valuetext`; previews stay silent. _Han_ (Q28: "1")
- The state never leaves the page: no URL, no browser storage; every load starts from the Preset. The state stays serializable so it could be packed into the URL later. _Han_ (Q29: "1, but the state should be serializable so we could pack it to the url if we wanted")

## Testing

- Behaviour lives in one pure reducer (state + event → state) and selectors (segments, percent, attention, crossed lines, readout) in `*.pure.ts`, each with its `*.pure.test.ts` in the fast suite (`ARCH-003-testing` §4); components render and dispatch. _agent-decided_ (Q30 recommendation, uncontested)
- A simple Preset validator, itself tested; every Preset runs through it in the fast suite: lines inside the window, step inside the timeline, fill only grows, parts sum to no more than the window, every part has a colour variable. _Han_ (Q31: "1, create a tested simple validator")
- Browser tests with Playwright, locally only, not in CI for now, covering most state changes and the timeline scrubbing: hover preview and snap-back, click commit, touch drag, pin and Esc, toggles, roving focus, the 375px layout; DOM numbers asserted. _Han_ (Q30: "i'm open to use playwright to test is locally but not in the ci for now"; Q32: "see Q30, i want most state changes to work and the timeline scrubbing")
- An axe accessibility scan on every Preset in the Playwright lane. _Han_ (Q34: "2")
- Manual testing criteria live in a `docs/features/` entry describing the component as a feature: phone drag and tap, VoiceOver reading one step, reduced motion, dark mode, print. _Han_ (Q33: "1, it's a entry in docs/features which describes this component as feature with manual testing criteria")
- ~~The mockup's numbers stay: 62% used, …~~ Superseded by Q20's 1M window; the example's numbers are set once in the shared Preset data (Q22). _agent-decided_, withdrawn

## Mini bar (Slides 10 and 11)

- A small sibling component, "mini bar", in the same shared-visual folder: static, no interaction, using the same pure functions (segments, percent used) and colour variables as the full cornerstone, so the numbers agree. Slide 10 shows two (old chat, fresh chat with the handoff card); Slide 11 shows the planner and the workers. _Han_ (Q17: "2")

## Round 7: feedback on the prototype

Han's words: "1. improve visual appeal into more polished sleek design. the timeline or scrubber doesn't look good, i improve it 2. add smooth but fast transition animations for entering and leaving and hover, give me options to choose 3. the height of the vertical bar for context window is not consistent as you scrub, it should have a fixed height? 4. [legend] should correlate to [/context], and have show a simple and technical version. i think the toggle should swtisch between simple and tech version, that makes more sense from domain also, so this can be used to train developers as well, who want to know which tools were called like glob or bash"

- The context bar has a fixed height, the whole window. Each block keeps its position; scrubbing only adds or removes blocks, and the usage list keeps every row, so nothing reflows. _Han_ (item 3)
- The toggle is `Simple | Technical` and switches the whole cornerstone: chat chips, legend, panel and the attention numbers. It replaces `Simple | Detailed` (Q10, Q23 adjusted). Reason: the cornerstone also trains developers who want to see which tools ran. _Han_ (item 4)
- The legend becomes usage by category, one row per category with tokens and percent, matching `/context`'s "Estimated usage by category". Technical: System prompt, System tools, MCP tools, Skills, Memory files, a Messages group (User messages, Assistant replies, Tool calls, Tool results), Free space, Autocompact buffer. Simple folds these into Starting instructions, Memory, You, AI replies, What the AI read, Free space and "Kept free for summaries". _Han_ (item 4)
- The autocompact buffer (45K, a Preset field) is drawn hatched at the end of the bar and as hatched boxes in the grid. _agent-decided_
- The example uses real tool names: `Glob`, `Read`, `WebSearch`, `WebFetch`, `Bash`. A tool step splits into a `tool_use` and a `tool_result` block. Attached files became Read tool results, so "Files you added" is gone and "What the AI read" takes in files and web pages. Every category's row lights its blocks. _Han_ (item 4) for the tools; the category split is _agent-decided_
- The chat now has 24 steps. 150K is crossed at step 11 (the catering PDF), 300K at step 14 (the hotel search), and the fill ends at 451K (45%). _agent-decided_
- A drawn scrubber: rail, fill up to the committed step, one coloured mark per step (tool steps larger, future steps dimmed), and a pill thumb that shows the step number. On hover, a ghost pill and a tooltip with the event and its tokens appear. A transparent native range still sits on top for keyboard and screen readers. _Han_ (item 1) for the redesign; its form is _agent-decided_
- Polish: the chat is a messenger card with an app bar and a composer, You bubbles are solid `human`, and surfaces get soft shadows and pill segments with a sliding indicator. _agent-decided_
- Motion on entering, leaving and hover is fast and CSS only, with exits at about 65% of the enter time and a 30ms stagger. This partly overrides Q8's "steps change instantly": the step itself still commits instantly, and only bubbles and blocks animate in and out. Under reduced motion, every change stays instant. _Han_ (item 2)
- Four options for Han to choose: Off (instant), Crisp (fade, 120/80ms), Rise (fade plus an 8px lift, 180/110ms, the prototype's default) and Spring (scale from 94% with a small overshoot, 260/120ms). **Han's choice is pending.**

## Round 8: feedback on version 2

Han's words: "0. keep Off, Crisp, Rise or Spring as options for preset, default to rise. 1. design is much clearner, increase the contrast like by 10%, it's a bit hard to read sometimes 2. the bars for own chat is so small, that i can select it compared to the ai blocks in the context window. can we implement a zoom feature, where when the move is in the context window bar, we see a section that moves with the move and it has like a zoom window on the right or left where i can click the smaller elements? … 3. spawn a adverserial ai engineer to fact check the content … 4. the tool itself on slide 3 is already overwhelming … we can toggle to show the chat, timeline, context window (bar or grid) and details. this slide 3 start only with a chat and timeline … default the details should be hidden 5. The hover on the grid still feels buggy. i would imagine only the same color should show … when i hover, the legend should lit up too 6. i live the icons, boxes and square used in claude code. imitate that"

- Motion is a Preset field with four values (Off, Crisp, Rise, Spring); the default is Rise. The validator rejects any other value. _Han_ (item 0)
- Secondary text and borders are about 10% closer to the foreground: `--cs-sub` and `--cs-border` are component tokens mixed from `muted-foreground` and `border`. No text is smaller than 0.72rem. _Han_ (item 1)
- **Loupe.** While the mouse is over the context bar, a lens frames the part under it, and a zoom card beside the bar lists the 7 blocks around the pointer. Each row is big enough to hover and click: colour, category, step, tokens. The card stays open while the pointer crosses into it. The bar itself stays true to scale, because a 28-token message is 0.003% of 1M and no zoom on a proportional bar makes it clickable. Touch and the 375px layout get no loupe; they reach small parts through the bubbles and the legend. _Han_ (item 2) for the loupe; the form is _agent-decided_
- **Show toggles.** The control row starts with Show: Chat, Timeline, Context, Details, as a `show` control a Preset can offer. The grid is one column per visible part, and a part that appears plays its enter motion. Bar | Grid hides while the context is hidden. Details are hidden by default. Slide 3 starts with only the chat and the timeline. _Han_ (item 4)
- **Lighting a block, not a message.** Hovering a bar block or a grid box lights that one block (`m8@tool_result`), not every block of its message, so only one colour lights. Hovering a bubble still lights its whole message. The legend lights every category row with a lit block, whatever is hovered. _Han_ (item 5)
- **Claude Code glyphs.** The grid and the legend use `/context`'s glyphs, drawn as SVG symbols in the category colour: a database cylinder ⛁ for used, corner brackets ⛶ for free space, a crossed square ⛝ for the autocompact buffer. The bar keeps its solid blocks. _Han_ (item 6)
- **Grid view widens the context column to 30rem**, so the legend names fit. _agent-decided_
- **Fact-check.** An adversarial review of the content is in `cornerstone-factcheck.md`; its corrections are not applied yet (round 9). _Han_ (item 3)
- **Performance, measured in Chrome.** One commit renders in 28ms in grid view and 10.5ms in bar view, under the 50ms long-task line, so nothing was optimised. The loupe redraws at most once per animation frame and rebuilds its rows only when the 7 blocks change. _agent-decided_

## Round 9: fact-check corrections and the 200K window

- WebFetch returns extracts, not pages: the two searches now add about 16–17.5K each. The big jump is the catering PDF read, and Slide 8 points there. _Han_ (Q35: "1")
- guests.xlsx is opened with `Bash` and pandas, about 2K, because `Read` refuses .xlsx. _Han_ (Q36: "1")
- PDFs over 10 pages are read in ranges of up to 20 pages, at about 2,700 tokens a page. The catering PDF is 20 pages in one `Read` (55K). _Han_ (Q37: "1"; size per Q43)
- The autocompact buffer is a Preset field. On 1M it is 33K (compaction at ~967K). On 200K it is 45K, which is **unverified**: Han pastes his own `/context` line. _Han_ (Q38: "1", Q46: "1")
- Messages are the size of their visible text, about 4 characters a token. _Han_ (Q40: "ok")
- The plan misses the budget because it got little attention among many similar numbers (distractors, Chroma 2025), not because it was forgotten at a fill level. _Han_ (Q41: "ok")
- The default window is 200K, and Slide 5 shows the same chat in a 1M window, where it fills 13% and crosses no line. _Han_ (Q42: "ok")
- The chat fits 200K: the venue contract is dropped and the catering PDF has 20 pages. It is now 21 steps and about 128K. It crosses 80K at step 11, the PDF, and ends at 64%. _Han_ (Q43: "yes")
- Pocock's line is 80K on 200K and 150K on 1M. Han: "80k for 200k window and 150k for 1M"; Q39: "keep the 150k, i've heard him say in multipe youtube videos". The fact-check's ~100K is set aside. _Han_ (Q39, Q44)
- Han's line: "for 200k no extra line, for 1M i use 300k". _Han_ (Q45)
- The line label reads "Smart zone by Matt Pocock 80K". The readout says "Past Matt Pocock's smart zone". _Han_
- The loupe opens to the right of the bar, over the labels and the usage list, so the timeline stays visible: "the zoom is great but it covers up the timeline, which is a central element … right is probably the better fit". _Han_

## Round 10: autocompact and the terminal

Han's facts, from screenshots:

- Haiku 5.5 runs a 400K window, and `/context` shows an autocompact buffer of 33k (8.3%). This corrects the fact-check, which lists Haiku 5.5 as 1M.
- GitHub Copilot with Sonnet 5.5 shows 200K and a "Buffer 10.0k". That is another product, so it is not used here.

Decisions:

- The buffer is 33K on every window: 400K and 1M both show 33K, so 200K is assumed the same, which is _agent-decided_ and **unverified on 200K**. Free space on 200K is now 167K.
- Autocompact comes back as a Preset, and only Slide 4 uses it. _Han_ (Q47: "ok", Q48: "ok, only one slide is about compaction")
- The chat runs on after step 21:
  - step 22, you flag the budget;
  - step 23, the AI reads the contract (46.6K) and the fill enters the buffer (174.6K of 200K);
  - step 24, compaction;
  - steps 25–28 come after it, and the plan fits 40,000. _agent-decided_
- Compaction is a written step in the chat data. The validator checks that the step before it is inside the buffer and that no other step enters the buffer. In the chat apps compaction is hidden, so Simple shows nothing in the chat; the timeline, bar and panel show it. _Han_ (Q49: "ok, but in chatgpt and claude its actually hidden")
- At compaction every message block collapses into one "Compact summary" block (8K, Simple: "Summary"), placed after the starting instructions and memory, and the free space returns. The blocks move to their new positions at twice the enter time. There are no re-read files, because both PDFs are over 5K and come back as paths. _Han_ (Q50: "ok")
- Bubbles from before compaction stay readable but get a dashed edge. Hovering them lights nothing in the bar, and the panel says "No longer in the context". _Han_ (Q51: "ok")
- The summary keeps the budget. The panel lists what was kept and what was dropped, and the plan after compaction fits the budget. _Han_ (Q52: "ok")
- Attention is recomputed over what is in the context. In it the summary gets 5 of 100 units, not "strong attention" as the recommendation said; the starting instructions and the newest messages dominate. _Han_ (Q53: "ok"), result _agent-decided_
- Scrubbing back before the compaction step brings back the full chat and bar. _Han_ (Q54: "ok")
- This Preset has automatic compaction only; manual `/compact` is a voice-track line for Slide 10. _Han_ (Q55: "ok")
- **Technical mode turns the chat into a Claude Code session in a terminal.** Han: "is it possible to turn the chat into a cli terminal session when we have technical on? that would be amazing". Its parts, _agent-decided_:
  - a dark terminal in both themes, through the `--cs-term-*` tokens;
  - `>` user prompts on a highlighted row and `⏺` replies;
  - tool calls written as `⏺ WebSearch("…")` with a `⎿` result line;
  - the starting instructions and memory as dim `#` lines;
  - `✻ Conversation compacted · summary 8k`;
  - a `>` prompt with a blinking caret, which stops under reduced motion.
    The look imitates Claude Code. The ui-ux-pro-max style search only returned neon and cyberpunk styles, so they were not used.

## Round 11: feedback on version 5

- **Grid legend underneath.** In grid view the usage list sits under the boxes, and the context column narrows from 30rem to 18rem. In Technical the list scrolls by about 3rem. _Han_: "in grid the legend go underneatn to save space".
- **Grid colour bug fixed.** The first box of each part is a button, and `.cs button { color: inherit }` beat `.cs-box`, so those boxes drew black and AI replies (one box each) never showed orange. _Han_: "ai replies is orange but no box is orange".
- **Scroll margin.** Pinning scrolls the bubble 1.5rem clear of the top edge (`scroll-margin-block`), in the chat and the terminal. A step change bottom-aligns the newest message; one taller than the view shows its top with 24px room. _Han_: "the scroll to should include a bit more margin on top".
- **Simple chat is the Claude app.** You in a grey bubble; replies as plain text; tool work as a grey line that opens: "Searched the web", "Read a file", "Ran a command", "Recalled memory CLAUDE.md", with a card of the description, the commands and the result. _Han_: "copy the claude desktop chat interface … user in bubble and reply as plain which commands … as collapsible".
  - A tool line opens while its message is pinned, from the chat, the bar, the grid or the zoom, and closes when unpinned. The open state lives in the model's `pinned`, so it stays serializable (_agent-decided_). Only one line is open at a time.
- **Reply box removed** in both depths. _Han_: "it's useless ui".
- **Context head on one line:** "Context window" left, "64% used · 128k of 200k" right. _Han_: "this can be one line".
- **One toolbar:** Conversation · Timeline · Context · Details | `</>` · Explain/Attention · collapse · meter. _Han_: "in one toolbar".
  - Simple/Technical is one toggle with the `</>` icon and a tooltip. The collapse and meter icons got tooltips too (_agent-decided_).
  - Bar/Grid is gone: Simple shows the bar, Technical the /context grid (`viewOf(state)`; `view` left the state, the Presets and the `CONTROLS`). _Han_: "bar/grid … can be subsumed unter the technical one".
  - Consequences: the smart-zone lines and the zoom exist only in the bar, so only in Simple. Slide 8 (Technical) now opens in the grid; Slide 5 loses its lines when switched to Technical.
  - "Chat" is now "Conversation" (Han wrote "conversion", read as conversation).

## Round 12: Preset data and upload (open)

Asked Q56–Q66 on the chat file format and the upload. Han's answers so far:

- **Q56:** YAML, not JSON, for authored data, because it allows comments. _Han_.
- **Q57:** Han asked whether Claude Code session logs (`~/.claude/projects/<project>/<session>.jsonl`) could be the default input, and to dogfood one. Q59–Q66 wait on this.
- **Q58:** if logs work, split config from data: `context-preset.config.yml` (window, lines, step, controls, …) plus `chat.jsonl`. _Han_.

**The dogfood (prototype tab "Claude Code log", `fromClaudeLog` in the model block).** It renders this fork's own log, symlinked as `prototype/session-log.jsonl`. `.scratch/` is gitignored; the log holds private session content and must never be committed or published.

- Parsing takes 60ms for 19.9MB: 248 requests become 321 steps, with 3 compactions.
- **Exact in the log:**
  - Every request's context size (`input_tokens + cache_read + cache_creation`). For this session the starting instructions were 73,449 tokens.
  - Every compaction (`compact_boundary`), with `trigger` (auto or manual), `preTokens` and `postTokens`. Here: 201,330→23,261 auto, 367,406→61,741 auto, 311,691→34,442 manual.
- **Estimated:**
  - How each request's growth splits into user, assistant, tool call and tool result. It is shared out by text length. Character count over 4 alone is far off: actual/estimate has a median of 1.56 and a p10–p90 range of 0.49–2.79. Proportional sharing keeps every step's total exact.
  - The split of the starting instructions into system prompt, tools, MCP, skills and memory. The log has only the total; a pasted `/context` in the config could supply it.
- **Not in the log:** the window size (a config field), explanations, events and attention.
- **Drift:**
  - 68,405 tokens left the context without a compaction (context editing or tool-result clearing), and the additive model can't draw that. The last step shows 289.8K where the log says 257.9K.
  - Fix: a `cleared` step kind that removes blocks, as compaction does.
- **Hidden growth** (system reminders, hook output, attachments; 902 attachment lines) is real context the chat never shows. Today it is carried into the next visible block. It is worth its own category: content for the "what fills the window" Slide.
- **Performance:** about 50ms per commit and per hover at 321 steps and 552 blocks, against about 7ms at 28 steps. That is inside the 200ms INP budget but noticeable. The cause is per-message `goneAt` calling `contextAt` (O(n²)); precompute a per-step layout if logs become the default.
- **Format risk:** the log is Claude Code's internal format, with about 15 line types that change between versions. Keep the adapter as a single pure seam (`log → Chat`) with fixture tests per Claude Code version.
- **Not checked:** subagent logs (`isSidechain`, here 0), and other harnesses.
- **Q68:** invisible growth (system reminders, hook output, attachments) gets its own legend category, "System reminders" (Simple: "Hidden notes from the app"). _Han_.
- **Q64:** an uploaded log lives in the tab only; nothing is uploaded or saved. _Han_.
- **Q65:** a log upload rejects only what can't be read; everything else loads with a warning. _Han_.
- **Grid bug fixed.** A log's hundreds of small blocks each claimed a box, so the grid was full at 157K of 1M. Boxes are now allocated per category, as `/context` groups them: at least one box each, the rest by share, and each box points at the block at its midpoint. At step 49 of the log there are now 17 used boxes for 16%. On Slide 7, 64% draws as 66 boxes, because the minimum of one box per category rounds up. Hovering m8's tool result lights 7 boxes.
- **Q67 open:** Han asked whether the summer party should be rewritten as a Claude Code `.jsonl`, so there is one format and agents can harvest or write chats.
- **Q67:** the summer party becomes a `.jsonl` in the documented subset of Claude Code's log, generated by an agent from an outline. Story texts and comments go in `context-preset.config.yml`, keyed by message uuid. _Han_: "1 we are already using jsonl for eventlog per episode already". One format, one reader, exact sizes.
- **Q59 and Q62 settled by Q67** (_agent-decided_): tool steps are the log's own `tool_use`/`tool_result` blocks, and the config is YAML only, so no JSON Schema choice remains.
- **Q60:** one log per language, `summer-party.jsonl` and `summer-party.de.jsonl`: same uuids and usage, translated text, compared by the validator. The config follows the same pattern (`context-preset.config.de.yml`). _Han_. The build picks the files from the page's locale: under `FE-003-localization` the URL is the only carrier of locale in the static export, so `/` loads the English pair and `/de/…` the German pair at build time. Nothing is detected in the browser. _Han_ asked, agent confirmed.
- **Q63:** `upload` is a control a Preset lists, off by default. _Han_.
- **Q66:** "Download this chat" as `.jsonl` is a separate Preset flag, on by default. _Han_. Round-trip test: `fromClaudeLog(toClaudeLog(chat))` deep-equals `chat`.
- **Round 12 closed.** For the main session: the chat format is the documented `.jsonl` subset plus a YAML config per Slide set and locale; the log adapter (`fromClaudeLog` in the prototype's model block) is the reference for the Spec's pure converter; the open model work is the "cleared" step type, the "System reminders" category, a per-step layout precomputed once (about 50ms per commit at 321 steps today) and a `toClaudeLog` writer. `prototype/session-log.jsonl` is a symlink to this fork's private log: delete it before anything leaves `.scratch/`.

## Round 13: open points closed

- **Autocompact buffer on 200K: 8.3%, 16.5K** in Claude Code, from Han's `/context`. GitHub Copilot on Sonnet 5.5 at 200K keeps 5% (10K). _Han_. The prototype now uses 16.5K on 200K and 33K on 400K and 1M. To keep Slide 4's compaction after a fill inside the buffer (validator Q49), the venue contract read grew from 18 pages and 46.5K to 21 pages and 57K: step 23 is now 185.1K of 200K. The usage rows now stop at zero when the fill enters the buffer: "Free space 0" and "Kept free for summaries 14.9k" (it showed −1,616 before).
- **Phone and OS reduced-motion check:** skipped. _Han_.
- **Grid morph:** "looks great". _Han_.
- **Harvest markers.** `prototype/cornerstone.html` (version 7, final) opens with a HARVEST GUIDE comment: for each marked block, whether spec.html takes it and in what form. Markers: `fallback` (drop), `cornerstone` CSS (take), `cornerstone-model` (take, into `*.pure.ts`) with nested `cornerstone-data` (reference content only; the real data is the `.jsonl` subset plus YAML) and `cornerstone-log` (take, reference converter), `cornerstone-view` (take), `shell` (drop, in style, body and script).
