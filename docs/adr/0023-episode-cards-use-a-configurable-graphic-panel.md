---
type: design-adr
status: accepted
---

# Episode cards use a configurable graphic panel

The B1 card language pairs a clean reading surface with optional static Card artwork, native whole-card navigation and shared magnetic ink. Browse pages share the frame and body hierarchy; artwork placement and the presence of a panel are explicit presentation choices.

## Decisions

1. One shared frame supports an artwork panel on the left, right, top or bottom, or `none`; left is the default when artwork is supplied. Placement is a typed presentation prop, not Episode metadata or browser state. The generic layout and its CSS live with the shared card primitives.
2. Episodes and Events reuse identical Card artwork for a given lead Tag; selection follows the lead Tag, not the Resource kind. The lead Tag controls category text, hover border and ink accent through existing colour tokens. `TAG_ARTWORK` in the existing Tag look registry maps Tags to geometry names; the domain-free `CardArtwork` renderer owns six static signal diagrams. No shared renderer reads Tags or content records, and no per-Episode look, new Tag vocabulary, external assets or looping artwork is introduced.
3. The card retains the existing compact and featured corner radii. Artwork clips at its own rounded edges; the card itself stays unclipped for magnetic ink. The artwork panel is lightly translucent with a small, static backdrop blur where supported, diffusing the ink below while keeping the artwork crisp. Unsupported browsers and print retain the solid tint; the reading surface is not blurred. `visualPosition="none"` provides the B1 reading surface without a panel, blank rail, corner icon or wash, and ignores supplied artwork or media. Omitted placement with no artwork retains the unrelated legacy media/corner-art contract.
4. Title, caption, Tags, release date and labelled actions remain readable on landing, the Episode Overview and Event Playlists. The lead Tag is named above the title, additional Tags and the release date sit below the caption, and actions remain at the bottom. Text remains server-rendered and localized by its existing owners.
   The library uses two columns on wider screens; the landing lead remains beside up to two companion cards, with enough width for their reading surfaces.
5. Native whole-card navigation, secondary YouTube navigation, keyboard focus, touch cues and reduced-motion fallbacks stay intact. The existing ink module remains responsible for action transitions; the visual layout adds no client boundary or per-frame JavaScript work.
6. `/explorables/`, `/events/`, `/guides/` and `/resources/` use the B1 reading hierarchy: kind where applicable, lead Tag, title, description, additional Tags and existing metadata, then explicit localized Open and labelled secondary actions. Explorable cards retain existing `DriftStill` artwork at the top until their concept-based artwork is selected. Episode and Event cards, including mixed Resource entries, use the selected lead-Tag artwork on the left. Guide, Episode template and Master slide cards use `none`. Episode interiors and Explorable controls are outside this scope.
7. Card words remain in each overview's own English/German Translation pair. The Resource browser receives plain card DTOs and resolved labels from its server template; its imported card view reads no content store or server translations and takes no server callback.

Verification uses the existing card-rendering, filter/data and static-export seams. Geometry, keyboard/touch behavior, reduced motion and visual balance in both locales and themes remain integration and manual-review duties. B2 and B3 are prototype alternatives, not production configuration.

## Selected signal diagrams

On 2026-11-04 Han selected the Tag options below, then exchanged the selected Context engineering and Agentic AI drawings. The exchange changes geometry only: each Tag retains its own accent. Artwork is centered in its panel, with clipping limited to the artwork itself.

| Lead Tag            | Selected artwork | Gallery origin        |
| ------------------- | ---------------- | --------------------- |
| Context engineering | Handoff chain    | Agentic AI C          |
| Agentic AI          | Context boundary | Context engineering B |
| Markdown            | Document stack   | Markdown A            |
| Cost                | Budget gauge     | Cost B                |
| Sales               | Customer path    | Sales C               |
| Workflow            | Process loop     | Workflow A            |

Related decisions: [Tags replace Topics](0015-tags-replace-topics.md), [Source tree follows the product](0017-source-tree-follows-the-product.md), and [Magnetic ink is a shared action effect](0022-magnetic-ink-is-a-shared-action-effect.md).
