---
type: feature-guide
title: Context window cornerstone
stale_after: 2027-04-21T00:00:00Z
---

# Context window cornerstone

Read before placing, changing or testing the context window Shared visual (`src/components/slide-shared/context/`) or the call transcript (`src/components/slide-shared/call-transcript/`). Binding rules: [FE-007 Module Layering](../../.archgate/adrs/FE-007-module-layering.md) §5, [FE-006 Server/Client Boundary](../../.archgate/adrs/FE-006-server-client-boundary.md) §5 and [FE-011 Design Tokens](../../.archgate/adrs/FE-011-design-tokens.md). This guide holds the detail that does not bind.

## Placing it

- A Slide renders `<Context preset="slide-4" locale={locale} />` from `context.tsx`, the server entry. It reads the Preset, the chat and the words at build time and hands them, serializable, to the one client leaf, `context.client.tsx`.
- `words` overrides any word of the part's own: `<Context preset="slide-6" locale={locale} words={{ contextWindow: t('window') }} />`.
- Static mini bars (Slides 10 and 11): `<ContextMiniBars preset="slide-11-after" locale={locale} />`, server-only.
- The call transcript (Slides 1, 2 and 6): `<CallTranscript label={t('call.label')} size="md" lines={[{ who: 'you', text: t('bubbles.0'), light: 'lit' }, …]} />`. One line is `{ who: 'you' | 'sister' | 'ai' | 'tool'; text; light: 'lit' | 'faded' | 'standout' }`; `size` is `md` (the Scene) or `sm` (beside another picture). `CallBubble` and `callBubbleClass` place a single bubble. Every bubble carries `data-who`, `data-light` and `data-index`, so a Slide's own step leaf and CSS can fade or light bubbles; the transcript owns no words.
- Every Preset, the mini bars and a sample transcript show on one dev-only page: run `next dev` and open `/episodes/#shared-visuals` (or `/de/episodes/`). `next build` never imports it.

## Data

- `context-preset.config.yml` holds the numbers: the starting instructions, the window sizes (200K with a 16.5K buffer, 1M with 33K), the smart-zone lines, the chats, the step notes (`mayFill`, `refs`, `big`), the Brief's attention split for step 21 (start 20, middle 50, end 30 of 100 units, as the `attention.summer-party.21` override), the defaults and one Preset per Slide state. It also holds the English `words` and `story`; `context-preset.config.de.yml` holds only the German `words` and `story`, under the same keys (a test holds the key sets equal). The locale picks the pair at build time.
- A Preset's fields: `chat`, `step`, `mode` (explain, attention), `depth` (simple, technical), `pinned`, `show` (chat, timeline, context, panel), `controls` (show, depth, mode, collapse, meter), `controlsHidden`, `timelineLocked`, `meterHidden`, `download` (on by default), `upload` (off by default), `windows` (the window sizes, the first shown at rest), `windowSwitch` (the 200K | 1M switch in the context's head: off by default, on only in slide-5, shown even when controls are hidden), `motion` and `height` (the main row's height in rem on a wide container, 38 by default; slide-3 sets 26.6, 30% less, so the cards below show on a laptop). `presetProblems` refuses a step outside the timeline, an unknown part or control, a pinned part not in the chat, a window switch with fewer than two window sizes, a height that is not a positive number, more than two lines or a line above its window, and a fill that enters the buffer anywhere but right before a compaction.
- The chat is `summer-party.jsonl` and `summer-party.de.jsonl`, read by `fromClaudeLog` and written by `toClaudeLog`; `fromClaudeLog(toClaudeLog(chat))` deep-equals the chat. The two logs hold the same sizes; only the text differs.

### The log subset

The cornerstone reads the lines of a Claude Code session log (`~/.claude/projects/<project>/<session>.jsonl`) that shape the context window, and skips every other line, a line that is not JSON and a side-chain line.

| Line                                             | Fields read                                                                      | Becomes                                                                                                   |
| ------------------------------------------------ | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `type: user`, string or `text` content           | `uuid`, `message.content`, `isCompactSummary`, `isMeta`                          | a `you` step; a compaction summary; a hidden or meta text becomes a System reminder of the step before it |
| `type: user`, `tool_result` content              | `tool_use_id`, `content`                                                         | the result of the tool step that called it                                                                |
| `type: assistant`                                | `requestId`, `message.content` (`text`, `tool_use`, `thinking`), `message.usage` | an `ai` step, or one `tool` step per request's tool calls                                                 |
| `type: attachment`                               | `attachment.type`, `attachment.content`                                          | `nested_memory` is a memory step, any other a System reminder                                             |
| `type: system`, `subtype: compact_boundary`      | `compactMetadata.trigger`, `preTokens`, `postTokens`                             | a `compact` step                                                                                          |
| `type: system`, `subtype: microcompact_boundary` | `microcompactMetadata.tokensSaved`                                               | a `cleared` step: the oldest tool results leave the window                                                |

Sizes: each request's context (`input_tokens + cache_read_input_tokens + cache_creation_input_tokens`) is exact; its growth since the last request is shared over the blocks that arrived, by their length, and a reply's `output_tokens` over its parts. A summary is the context after the compaction less the starting instructions and memory. A System reminder is estimated at four characters a token. A log opened in the browser is sized against the chat's own starting instructions.

## Manual testing criteria

Run on the dev page, in Chrome, light and dark, with the tab in front (a background tab never fires `requestAnimationFrame`).

- Phone width (390px): the parts stack; the timeline and the bar run across; dragging the timeline commits, tapping a part pins it, nothing previews on touch.
- VoiceOver: the toolbar reads its controls and pressed states; the timeline reads the step sentence (`aria-valuetext`); each step commit is announced once by the status line; a bubble reads its category and text.
- Keyboard only (no mouse): Tab reaches the toolbar, the chat bubbles, the timeline, the bar or grid (one stop) and the category rows. Arrows step the timeline and move between blocks in the bar or grid; focus lights like hover. Enter pins, Escape unpins. The focus ring (ring token) shows beside the lit outline (primary).
- Reduced motion: bubbles, blocks and boxes change at once, no entrance and no morph.
- Dark mode: the terminal stays dark, every category tint holds against the card, the smart-zone label reads on primary when crossed.
- Print: the toolbar, the hint, the ghost and the tip are gone; the rest prints at its step.
- The browser lane: `CONTEXT_WINDOW_URL=http://localhost:4011/episodes/ npm run test:browser` with `next dev -p 4011` running. axe-core (WCAG A and AA) checks every Preset in both themes; the contrast rule leaves out the deliberate dims (an empty category row, a bubble a compaction removed, the Attention fade).
- Timing: a full scrub of the grid Preset (slide-7, 21 steps) stays under 16ms of main-thread task time a step, measured by the browser lane from the DevTools protocol's `TaskDuration` less the protocol's own round trips.

## Walkthroughs

Each starts from its Preset at rest on the dev page.

- **slide-3** (chat, timeline and context, step 9, the budget pinned, no toolbar, 26.6rem high). Hover step 4 on the timeline: the chat shows four messages, the hint goes, nothing commits. Leave: back to step 9. Press Escape: the budget unpins.
- **slide-4** (Attention, all parts, step 21). The bubbles fade with their share; the budget message (m3) is the faded one with the dashed "the AI may fill this gap" note. Hover any block: Attention keeps its card, the lit step's row turns bold. Switch to Explain: the panel shows the step readout. Technical: unit values appear beside the bars.
- **slide-5** (controls hidden, `windowSwitch` on). Switch to 1M: the same chat fills 13%, the 150K line is far above the fill and no line is crossed. Back to 200K: 64%, past Matt Pocock's 80K line.
- **slide-6** (Technical grid only, locked). Hover a box: it and its row light; lighting is never locked. No toolbar and no timeline.
- **slide-7** (Technical, starting instructions pinned). Hover one web-pages box: only the tool-result boxes of step 8 light, and the Tool results row. Click the Skills row, then Tool results, then Messages: each lights only its boxes. Simple: the rows fold into plain categories and the grid becomes the bar; the pin stays. Collapse the chat: a rail of ticks. Hide the meter: the number hides, the limit stays.
- **slide-8** (Technical, step 12, the catering PDF read pinned, no chat). The panel shows tool calls 200 and tool results 55K. Step back to 10: the PDF read is pinned but not there yet, a dashed outline and "Not in the context yet at this step". Step to 11: the jump lands, past Pocock's line.
- **slide-9-before, slide-9-chat, slide-9-after** (locked, meter hidden). Before: step 23, the fill inside the hatched buffer, the contract read (m26) pinned. Chat: step 24, the compacted chat, earlier bubbles dashed as gone. After: step 24, the summary pinned, the free space back.
- **Scrub back while pinned** (slide-8): pin m11, step to 5 (dashed outline), hover step 16 (preview shows it landed), commit 11 (it lands in full colour), click elsewhere (unpins).
- **Download** (every Preset whose toolbar shows): the button saves the chat as a Claude Code log; opening that file with an upload-enabled Preset (`upload: true`) replays the same chat.
