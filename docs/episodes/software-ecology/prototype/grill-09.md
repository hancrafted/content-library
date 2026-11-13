# Grill 09 (on feedback 09), Han's answers verbatim

Q149: ok
Q150: ok
Q151: ok
Q152: for now yes
Q153: a
Q154: a, expected is that turning on ai or increasing efficiency will clear the bottleneck and move it downstream
Q155: ok
Q156: ok
Q157: ok
Q158: ok
Q159: only customer
Q160: ok
Q161: ok
Q162: ok
Q163: ok, icons where it make sense
Q164: ok, reset to what the yml defined, as every setting/preset should defineable on the yml
Q165: yes, drift is ok.

## Settled

1. **Roles view, Tire swing only:** ten cartoon cards in two rows of five, in cartoon order (Customer, Product management, Analysis, Engineering, Sales / Documentation, Operations, Billing, Support, What the customer needed). Quality assurance appears in the factory only. Gatekeeper lead and Two teams keep their cards at factory positions.
2. Roles ↔ factory cross-fades (~200 ms; instant under reduced motion). Cards in the roles view are not clickable (for now).
3. **State stepper:** "① Who does what · ② In theory · ③ In practice" (de: "Wer macht was · In der Theorie · In der Praxis"); the modified dot stays.
4. **Realistic starts dramatic:** each use-case file seeds starting backlogs (Tire swing: QA 3 weeks, Engineering 2, Analysis 2; Gatekeeper lead: the Lead; Two teams: the shared Platform). The model stays stable, so the piles drain. A check pins that AI or raised efficiency at the bottleneck clears its pile and moves the bottleneck downstream. Applies to Realistic and every scenario built on it; tours and checks retuned.
5. **Speed:** 1×, 2×, 5×, 10×, 20×; new 1× = half of today's (1/32 week a second). Start at 1×; tours keep their real-time pace.
6. Roles cards share one height; panel at the same y, artefacts at the bottom. The Context marker sits at the end of the quote line.
7. Factory Customer card 30 % wider (stations unchanged).
8. **Station card:** full-width glyph + title row, no Context marker; queue rack on the left beneath; document in work centred in the rest; "n waiting" bottom right; AI/rework badges on the top edge.
9. Clock fits its text, tabular digits.
10. **Settings:** ~760 px, two columns. Header "Settings" bold + ✕. Model | Mechanics, then Display. Footer: "Reset to default" left; Download YAML, Upload right. Bold section titles, thin rules. Descriptions move into help tooltips. Stacks below 800 px.
11. **One form field:** label + (?) help on one line, the control full width beneath: segmented control for choices, slider with its value on the label line, switch on the label line (with a strength slider beneath, disabled while off). Lucide icons at 16 px where they help.
12. **Reset to default** resets to what the use-case file defines for the active state. Every setting is definable in the YAML: add the missing ones (pile-up style; starting backlogs; display defaults).
13. Drift from flow.html is accepted for these points; record them in design-ADR 0024 and the feature guide.
