MAGNETIC INK: RECONSTRUCTED HANDOFF

Purpose
Help me compare how magnetic ink should look and behave around actionable Episode cards. The card design is already acceptable; this review focuses on the liquid effect and how neighbouring cards cooperate.

Context
The card is rounded, carries a topic colour, title, caption, tags and release date, and has a clearly labelled secondary "Watch on YouTube" action when a recording exists. The card itself opens the Episode. An "Open Episode" cue is revealed on pointer hover. Keep navigation semantics separate from the decorative effect. Use representative English card content; no exact production artwork or screenshots are supplied.

Problem to improve
The current treatment reads as a fixed shape growing or zooming rather than liquid. Repulsion moves blobs like disconnected floating objects, and overlapping shapes look bad. When a card is hovered, neighbouring cards should not continue showing their proximity effect merely because the pointer remains within their reach.

Proposed direction
For a pointer outside the card, anchor the pool at the nearest point of its rounded border. Keep that anchor attached when neighbouring shapes interact. The pool's base should broaden as the pointer approaches. An imaginary triangle was suggested as a construction aid, not a requirement to draw a triangle or enforce fixed perimeter. Use a deliberately shaped liquid envelope rather than a full particle-fluid simulation.

The silhouette should feel irregular and liquid, with droplets joining the pool. Randomness should be coherent rather than flickering. A configurable activation distance, for example around 200 pixels, is a starting point for comparison, not a settled measurement. Respect reduced motion and do not require animation for navigation.

Compare all three unresolved neighbouring-card approaches

1. Bounded shared space: pools stay anchored and smoothly flatten/broaden as their exposed shapes approach, leaving a gap without obvious clipping.
2. Nearest only: one card owns the proximity pool, with a gentle handover as the pointer crosses between cards.
3. Contour pressure: anchored pools deform under repulsion between their exposed contours rather than translating the entire blob.

Review need
Let me experience the alternatives, including the gap where several cards meet, so I can judge which looks best. We might keep multiple rendering modes, but that is not decided.

Cutoff
Reconstructed from the discussion through the user's reply at turn 11, before the next prototype response. Later refinements, production architecture, rollout and timing choices are intentionally absent. This is not a verbatim user-authored handoff. The separate source.md records the raw user request and reply; it is provenance, not an additional input attachment.
