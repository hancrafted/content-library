# Prototype feedback, round 6 (2026-11-11), verbatim

Answers: Q73 ok, Q74 ok, Q75 ok, Q76 ok, Q77 ok.

More feedback.
1. we need to improve the layout. since each file moves at constant speed, the length of a converyor belt is like a implicit queue or buffer, which makes less sense as docs are mostly digital information and travel at light speed. so either we have a fixed time on how docs travel between nodes (cause some docs to travel faster) or we need to determin a different layout. i've redrawn myself a suitable layout [Image #11 → layout-han-06.png]. i've remove docs and billing as nodes as docs is to broad for a role and billing to narrow. that reduce it down to 8 cards in 2 rows, givening enough space.
2. The shipping dock is renamed as Customer, so we dont need a new Requests node. that maps to 10 nodes making 2 rows for the swing and roles stat
3. the way docs arrive at a station and how it is shown inside a station have to much ui jumping. could we do a smooth transition from input to [Image #12 → station-queue-han-06.png] a queue on the left of the inside of the station? when the queue is full, we show red for that queue element and the number on the right side of the queue? when a doc is done processing, it doen't blink away, it moves to the right while shrink and syncs with the icon from the transvejor belt
