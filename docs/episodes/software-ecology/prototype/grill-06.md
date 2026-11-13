# Grill, round 6 (2026-11-11): Q73–Q91, Han's answers

Facts from Chrome before the round: Han's congestion case drains (eng 462 → 285 over 60 weeks; eng 1000 % clears in 10 weeks and moves the bottleneck to ops); Realistic stays at 0–7 waiting; 0 attribute changes idle; frames every 20 ms (browser cadence) at 10×, 1000 %, AI all; Realistic dock read 1.1–1.2× ideal because churn and rework documents counted as output; the factory used ~60 % of the stage width.

- Q73 Output counts only fulfilled orders and requests, not churn or rework documents. — ok
- Q74 Layout fits the stage; target 13 px text at 1440 px. — ok
- Q75 Without Support: requests to Operations (gate), Billing & change orders (tender). — ok (tender later removed, Q90)
- Q76 The long AI flood stays honest; the hint leads with raising the bottleneck's efficiency. — ok
- Q77 AI balanced uses Realistic effectiveness, AI quality "same": ~92–97 % satisfied. — ok
- Q78 Realistic strain comes mostly from bad work, efficiencies 88–98 %. — ok
- Q79 Every handoff takes a fixed quarter working day whatever the belt length; compact layout. — "ok, try to apply a similiar layout for the other use cases as well, remove the tneder to acceptance use case"
- Q80 One Customer card at the left: sends work, receives releases from Operations along the top, holds the shipment grid, satisfaction and output, and both dials. — ok
- Q81 — "we don't have an orders node anymore, just one customer, for whe we can define the frequency and chance of new requests. those requests split into sales (new customers), feature and change requests to product managers and bug and support tickets to support. as operation releases to customer, each release may immedeality trigger a new request (change, bug or support). the distribution should be configurable at the customer node. propose default making sense for various presets and scenrios"
  Proposed and accepted ("ok, show a timer without week, just # days"):
  | Preset | Requests/week | Arrivals | Mix Sales/PM/Support | Good release triggers | Bad release triggers |
  | Ideal | 8 | Steady | 30/50/20 | change request p 0.2 | — |
  | Realistic | 8 | Random | 25/45/30 | change request p 0.2 | bug to Support p 0.6 (the complaint) |
  | AI unbalanced | 8 | Random | as Realistic | as Realistic | as Realistic |
  | AI balanced | 20 | Random | as Realistic | change request p 0.3 | bug to Support p 0.6 |
  Clock reads "Day n" (working days), no week.
- Q82 Spawns: Sales → PM + p0.3 Analyst; PM → Analyst; Analyst → Engineer; Support → p0.4 Engineer, the rest answered back to Customer (Support → Customer belt); Engineer → QA → Operations → Customer. QA is the inspection (passing unread under pressure); Operations deploys. — ok
- Q83 Rework rides a thin lane beside the forward belt, drawn only while used. — ok
- Q84/85 Station inside: rack of 6 slots left (top slot red + "+n" past 6), the document in work on the right fills and is stamped good or bad; arrival slides belt → rack → work position; a done document shrinks as it moves right onto the belt. Only fill-and-stamp remains; Options A–C go. Weeks of work waiting moves to the dashboard. — ok
- Q86 Swing and Roles: 10 panels in 2 × 5; the 7 roles and Customer are work centers, Documentation and Billing appear as panels only ("not a work center here"). — "ok, can we create more high fidelty cartoons? also use color?"
- Q87 Gatekeeper and Two teams move to one Customer, fixed travel time and a compact layout by the same rules. — ok
- Q88 Designer's round-5 changes accepted: Ideal routes chances in strict turns; gate AI pull requests 1.5× review time; AI balanced efficiencies 115–160 % where needed; rework 0.4, churn 1.2, complaints 0.2; bottleneck-shift check from AI unbalanced. — ok
- Q89 Cartoons: A, hand-built coloured SVG, own drawing, in a separate pass after this round, as Spec Options. — "a, as close to the original as possible" (the closer the redraw, the more the licence check on the PR checklist matters)
- Q90 Tender to acceptance removed from prototype, guide and design-ADR; kept in the guide's "Later" list as a hypothesis. — ok
- Q91 Record, commit, designer round 6, verify in Chrome, report; cartoons as their own pass. — ok
