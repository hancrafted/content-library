# Prototype round 4 grill, 2026-11-11 (Q39–Q45, Han's answers), confirmed "yes"

Model
- Documents are good or bad; "average" is removed.
- Q39: a bad input is either sent back as rework (probability = `mechanics.rework`) or kept and worked on with a higher fan-out (`mechanics.churn`, e.g. ×1.8).
- Q41: "Customer complaints" is an input source: a bad shipment sends a complaint (red warning document) into Support and adds work to the system.
- Q42: every inspection passes more bad work unflagged as its queue fills (built in, no toggle, strength `stampUnderPressure` per inspection in the YAML); its dashboard signal is "passing unread".
- Q43: Isolate, Follow an order and Out for two weeks are removed; keep the overlay seam (`overlays: { follow, isolate }`) so they can come back.

Shipping dock (Q40/Q45)
- A 3×4 heat-map grid of the last 12 shipments, each box good or bad (pale green / pale red), complaint marked with the warning icon.
- Under it: Customer satisfaction % (good minus complaints, out of 12). Beside it: Output relative to balance. Output up next to a redder grid is the message.

Dashboard card (Q44)
- Traffic light from signals: keeping up, bottleneck, starved (waiting for work), overloaded, rework-heavy, passing unread. Green keeping up; amber queue > half, sent-back share > 20 % or busy < 40 %; red bottleneck or work backing up / abandoned.
- Small trend charts: output, outcome (effectiveness), queue.
- Only the AI toggle sits on the dashboard (header). Efficiency, effectiveness, output per input sit in a collapsed "⚙ Settings" section as compact steppers.
- Wider, responsive popover.

Factory
- Speed: Pause · 1× (half today's play speed) · 2× · 3× · 4×.
- "⋮" vertical menu in the toolbar: belt motion on/off, theme, prototype Options.
- Return belts are separate belts (two-lane belt dropped).
- Minimum belt length before and after every station (not the two customer ends), so a gap never reads as a queue.
- Processing: a document parks inside the station while a progress ring fills, then leaves; nothing slides through. With AI on the ring is in the ai tint, runs faster, and the station pulses softly.
- AI drawn as the belt turbo.
- Every Model-menu setting gets a tooltip saying what it does to the factory (e.g. Messy: "Lowers every work center's efficiency and effectiveness: queues form and more bad documents go out.").
- Tire swing: customer connects to Sales and to Support; Support connects to Billing and to the product manager; earlier merges and return belts stay.
- Compare: belts between neighbouring columns carry the live flow (documents leave the left station faster and pile at the right one when AI is on upstream).

Document icon
- Draw Han's design plus two alternatives as switchable Options. Han's: plain document without content = good; red minus inside = bad; red warning inside = complaint / rework; AI-made = orange border, light orange fill, star top left (combinable with the other icons).
- No bundle: fan-out leaves as separate documents, "×n" tag above 5.
- Pile-up: the tray.
