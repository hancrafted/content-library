# Visual categories

Choose per review item, not once for the whole document. These are starting points, not templates or an exhaustive taxonomy.

| Decision                 | Rendering that helps a human judge it                                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Software architecture    | Before/after dependency, sequence, UML or ER diagrams; show the responsibilities that move and the affected files.                    |
| Information architecture | Before/after folder trees, naming examples, navigation maps or content relationships.                                                 |
| UI or visual design      | Real-content HTML/CSS mockups at useful widths; comparison at a scale where hierarchy and density can be judged.                      |
| UX or animation          | Live states and transitions; usable pointer/keyboard controls, replay and reduced-motion behaviour where relevant.                    |
| Feature or User Story    | User journey, state diagram or concrete scenario showing actors, intended outcome, alternatives and acceptance examples.              |
| Bug fix                  | Observed versus expected behaviour, then before/after proposal; distinguish a reproduced failure from an illustrative reconstruction. |
| Concept or requirement   | A relationship diagram, worked example or process visualization; precise detail behind progressive disclosure.                        |

Use graph rendering for graph-shaped relationships, and HTML/SVG compositions when a graph layout obscures the point. In architecture work, retain the project's domain vocabulary and the module, interface, seam, adapter, depth, locality and leverage vocabulary from `/codebase-design`.

Before/after depicts the current state from supplied evidence and the proposed state as a proposal. If the current state is unknown, mark it unknown; an invented "before" is not evidence. Label illustrative figures and unsupported claims. A research question is not a finding.

Compare small diagrams side by side where useful. Full-width UI can use switchable previews. Either way, controls identify the displayed Option separately from selected Options, and comments stay associated with their subject.

An analogy is explanatory, not evidence. Let the reviewer toggle it independently for each item; retain the exact account and name where the analogy breaks down.
