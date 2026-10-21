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
- Static bars: `<ContextBarsPreset preset="slide-11-after" locale={locale} />` draws every bar of a `minis` Preset horizontally with the pure view `context-bar-view.tsx`, server-only, no client JavaScript. A bar is a chat at a `step`, optionally keeping only some of it in colour (`lit`: Simple categories, `litFrom`: a step id, `ring`: step ids; the rest fades), or, for data that is not a chat, `segments: [[minutes, lit | faded | standout], …]` (the 82-minute call, Preset `call`). `contextBarFigures({ preset, locale })` returns the window, buffer and token figures of a Preset's first bar, so a Slide never writes "128K of 200K" or "16.5K" by hand; `BarSwatch` draws a legend swatch in a block's tint.
- A `*-view.tsx` file is a pure view: no hooks, no handlers, no `'use client'`, no hook or `.client` import. ESLint refuses them (`tests/boundaries/pure-view-lint.test.ts` probes it), and a renderToStaticMarkup test holds the markup. The interactive context window reuses the view's `BarBuffer` and `BarLines` inside its own bar.
- The call transcript (Slides 1, 2 and 6): `<CallTranscript label={t('call.label')} size="md" lines={[{ who: 'you', text: t('bubbles.0'), light: 'lit' }, …]} />`. One line is `{ who: 'you' | 'sister' | 'ai' | 'tool'; text; light: 'lit' | 'faded' | 'standout' }`; `size` is `md` (the Scene) or `sm` (beside another picture). `CallBubble` and `callBubbleClass` place a single bubble. Every bubble carries `data-who`, `data-light` and `data-index`, so a Slide's own step leaf and CSS can fade or light bubbles; the transcript owns no words.
- Every Preset, the mini bars and a sample transcript show on one dev-only page: run `next dev` and open `/episodes/#shared-visuals` (or `/de/episodes/`). `next build` never imports it.

## Data

- `context-preset.config.yml` holds the numbers: the starting instructions, the window sizes (200K with a 16.5K buffer, 1M with 33K), the smart-zone lines, the chats, the step notes (`mayFill`, `refs`, `big`), the Brief's attention split for step 21 (start 20, middle 50, end 30 of 100 units, as the `attention.summer-party.21` override), the defaults and one Preset per Slide state. It also holds the English `words` and `story`; `context-preset.config.de.yml` holds only the German `words` and `story`, under the same keys (a test holds the key sets equal). The locale picks the pair at build time.
- A Preset's fields: `chat`, `step`, `depth` (simple, technical), `pinned`, `show` (chat, timeline, context, preview, panel, attention), `fade` (the chat dims each message by its attention; on whenever the Attention part is shown), `attention.layout` (`list`, `pinned` or `compressed`, default `list`), `controls` (see Controls below), `order` (the parts in chip and grid order, every part once; default `chat, timeline, context, preview, panel, attention`), `timelineLocked`, `windows` (the window sizes, the first shown at rest), `motion` and `height` (the main row's height in rem on a wide container, 38 by default; slide-3 sets 26.6, 30% less, so the cards below show on a laptop). `presetProblems` refuses a step outside the timeline, an unknown part, control or Attention layout, an `order` that does not list every part once, a field a control does not take, anything but `show` on `'*'`, a pinned part not in the chat, a window switch with fewer than two window sizes, a height that is not a positive number, more than two lines or a line above its window, and a fill that enters the buffer anywhere but right before a compaction.

### Controls

`context-controls.pure.ts` is the registry: one typed definition per control (`id`, `type`, `placement`, label and tooltip words, a lucide icon name, the default `show`), by type `toggle` (flips a shown-state key), `segmented`, `action` (download, upload) or `chips` (the parts group). The Preset's `controls` is a map from control id to overrides, merged key by key over `defaults.controls`; `'*'` may carry only `show` and applies to every control the Preset does not name itself. Presets state only what differs (slide-3: `{ '*': { show: false } }`; slide-5 adds `window: { show: true }`; slide-9 adds `zone: { on: false }`). `presetProblems` validates the map against each control's type.

| id                   | where                    | what it does                                                                                                                                | default                       |
| -------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `parts`              | toolbar                  | the Show chips (conversation, timeline, context, preview, details); `reorder: false` turns the drag and drop off (see Reordering the parts) | shown                         |
| `technical`          | toolbar                  | Technical for every part                                                                                                                    | shown                         |
| `collapse`           | toolbar                  | folds the conversation to a strip                                                                                                           | shown                         |
| `download`, `upload` | toolbar                  | save or open a Claude Code log                                                                                                              | download shown, upload hidden |
| `preview`            | context-window head, eye | shows or hides the context preview (the same state as the Preview chip)                                                                     | shown                         |
| `zone`               | head, side column        | shows or hides the smart-zone labels and the limit label; the dashed lines stay and the bar widens; `on: false` starts it hidden            | shown                         |
| `windowTechnical`    | head, `</>`              | Technical for the context window only; the toolbar's Technical keeps the last value it set                                                  | shown                         |
| `window`             | head                     | the `200K \| 1M` segmented switch (plain `128K of 200K` without it); needs two window sizes                                                 | hidden                        |

The head reads `Context window (64%)   128K of [200K | 1M]` and then the icon buttons, each with a tooltip, an `aria-label` and `aria-pressed`. The old Explain/Attention switch is gone (Attention is its own part); the meter flag is gone (`zone`).

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

## Parts and state

- `context.client.tsx` is the one client leaf and the parent. It owns a reducer (`context-state.pure.ts`) and hands each part only its slice and callbacks, never the whole state: `conversation.tsx`, `timeline.tsx`, `context-window.tsx` (Technical in `context-window-grid.tsx`, the zoom in `context-window-loupe.tsx`), `context-preview.tsx` ("What fills the window"), `details.tsx` (Explain: what the lit part is), `attention.tsx` (the 100 units over the steps in the window; its own show state and `renderMode`). `context-slices.tsx` builds each slice; the prop types are in `context-parts.types.ts`.
- Props down, events up: a part reports a lit key with `onLight(key | null)` and a click with `onPin(key, target)`; `use-lighting.ts` is the wiring each part puts on its own root, and `use-window-events.ts` the parent's side (the callbacks, a click outside that unpins, Escape). `context-preview` has no callbacks of its own: it sits inside `context-window`, whose root reports for it.
- Hover is brushing and linking. The parent holds the hovered and pinned key; a part turns it into one `on` boolean per item and passes it to a memoised item, so a hover redraws only the items whose `on` flipped. There is no store. `context.hover-budget.test.ts` guards this by rendering each part for two lit keys and counting the items whose markup differs.
- renderMode (`simple` or `technical`) is one global value plus per-part overrides in the parent's state (`depth` and `renderModes`). The toolbar's Technical sets every part and drops the overrides; `SET_PART_MODE` sets one part. The latest action wins. A part's own look keys on its own `data-depth` or `data-view`, not on the root's.

## Reordering the parts

- The reader drags the part chips in the toolbar's Show group with the mouse (`window-chip-drag.ts`, native pointer events, no dependency). A drag starts after 4 px with the primary button; every chip the pointer passes the middle of takes the dragged chip's place, live. The click that ends a drag does not toggle the chip. `controls.parts.reorder: false` turns it off.
- The order is `ViewState.order`, started from the Preset's `order`, moved by the `REORDER` event (`moveTo` in `context-state.pure.ts`) and never stored in the browser: a reload returns to the Preset.
- `Parts` renders the grid children keyed by part id in state order, and `columns` writes the grid areas in the same order, so React moves the DOM nodes without remounting and Tab order follows the picture. The preview has no cell of its own (it sits inside the context window), so its chip orders the chips only.
- Moving a node resets the chat's scroll and restarts CSS animations under it. `window-reorder.ts` saves the chat's `scrollTop` before the event and, in a layout effect after the new order, restores it and finishes every finite animation (the entrance and the bar and grid morph), so nothing replays.
- Known accessibility gap: there is no keyboard or button alternative, by Han's decision, so WCAG 2.5.7 Dragging Movements (AA) is not met. It is an enhancement only: every part stays reachable and toggleable without it.
- Browser tests (`context.browser.test.ts`, "reordering the parts"): a real mouse drag moves the chip, the same DOM nodes survive, the chat keeps its scroll and no animation runs afterwards.

## Attention layouts

- `attention.layout` is a Preset field separate from renderMode, so the toolbar's Technical never undoes it. `list` scrolls when the rows overflow. `pinned` makes the first and last three rows `position: sticky` (CSS only). `compressed` sizes each row by its share of the attention, 4 px at least, so the whole list fits without scrolling (slide-4 uses it).
- Compressed magnifies like the Mac dock: rows within three either side of the pointer grow towards a full text row and the others shrink so the total height stays fixed. The maths is `attention-dock.pure.ts`; `attention-dock.ts` writes the heights to the DOM from one `requestAnimationFrame` per pointer move, so React never redraws the rows for it. Under reduced motion the stylesheet drops the height transition and the rows snap.
- Hovering or clicking a row lights its chat message (the parent's lit key) and scrolls it into view (`onReveal`, then `onPin` for a click).

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
- **slide-4** (Attention, all parts, step 21). The bubbles fade with their share; the budget message (m3) is the faded one with the dashed "the AI may fill this gap" note. Hover any block: Attention keeps its card, the lit step's row turns bold. Technical: unit values appear beside the bars.
- **slide-5** (controls hidden, `window` control on). Switch to 1M: the same chat fills 13%, the 150K line is far above the fill and no line is crossed. Back to 200K: 64%, past Matt Pocock's 80K line.
- **slide-6** (Technical grid only, locked). Hover a box: it and its row light; lighting is never locked. No toolbar and no timeline.
- **slide-7** (Technical, starting instructions pinned). Hover one web-pages box: only the tool-result boxes of step 8 light, and the Tool results row. Click the Skills row, then Tool results, then Messages: each lights only its boxes. Simple: the rows fold into plain categories and the grid becomes the bar; the pin stays. Collapse the chat: a rail of ticks. Click the head's side-column button: the smart-zone labels and the limit label go, the lines stay, the bar widens. The eye hides the preview; `</>` makes only the window Technical.
- **slide-8** (Technical, step 12, the catering PDF read pinned, no chat). The panel shows tool calls 200 and tool results 55K. Step back to 10: the PDF read is pinned but not there yet, a dashed outline and "Not in the context yet at this step". Step to 11: the jump lands, past Pocock's line.
- **slide-9-before, slide-9-chat, slide-9-after** (locked, smart-zone column off). Before: step 23, the fill inside the hatched buffer, the contract read (m26) pinned. Chat: step 24, the compacted chat, earlier bubbles dashed as gone. After: step 24, the summary pinned, the free space back.
- **Scrub back while pinned** (slide-8): pin m11, step to 5 (dashed outline), hover step 16 (preview shows it landed), commit 11 (it lands in full colour), click elsewhere (unpins).
- **Download** (every Preset whose toolbar shows): the button saves the chat as a Claude Code log; opening that file with an upload-enabled Preset (`upload: true`) replays the same chat.
