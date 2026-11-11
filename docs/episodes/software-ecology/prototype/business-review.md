# Business review: software ecology Explorable

Reviewer stance: business architect (operating model, value streams, flow, socio-technical design). Read against the Brief, the feature guide, design-ADR 0024, Han's feedback-01 and feedback-02, the research files (SWE-0001, SWE-0002, AIE-0018, AIE-0019, AIE-0020, LLM-0022) and `flow.html` as of 2026-11-11.

Evidence tags: an ID means the claim sits inside that file's Findings. **hypothesis** means it goes beyond them: the model or flow theory can show it, but no research file supports it yet. **model** means the prototype's own rules produce the result, so playing it is not evidence for it.

## 0. One structural finding first

The prototype is **demand-bound**. Intake is fixed at 6 a week, and every role's capacity is derived from its inflow (`cap = inflow / UTIL`). Raising efficiency or switching AI on upstream therefore cannot push more work downstream; it only makes the node idle. That is why Han saw that the efficiency dial "does not affect the animation" (feedback-02). Fix it before any message work:

- Give the source a **backlog** (a pile of waiting requests) or a **demand dial**, so a faster upstream node actually releases more work.
- Let the **fan-out dial** (output per input) multiply the documents produced, not just their share on an edge.
- Make the **review time of a document scale with its size or fan-out**. AI pull requests are larger (AIE-0018 F4), and that is how the valve feels the pump.

Without these three changes, messages 1, 2 and 6 below cannot be shown honestly.

## 1. Messages, ranked

| # | Sentence a manager would repeat | Scenario that shows it | Evidence |
|---|---|---|---|
| 1 | "Speeding up one team doesn't speed up the company. The work piles up at the next review." | Gatekeeper lead, Reality messy, AI at Engineers 1–3 only. Lead · review backs up and leaks, and the customer's output barely moves. | AIE-0018 F4–F5 (Faros: +98% PRs merged, +91% review time, no company-level gain); SWE-0001 F6 (speaker scenario). Association, not trial. |
| 2 | "AI is an amplifier: good input becomes more good output, bad input becomes more bad output, faster." | Tire swing, AI everywhere, run it twice: once with Reality at zero (all good), once messy. The good and bad counts at the tap both scale up. | AIE-0018 F6, AIE-0020 F7 (DORA "amplifier"); SWE-0001 F8. |
| 3 | "The pressure lands next door, not on the team you gave AI to." | Two teams, one platform, AI at Engineers · team B. The Platform & QA valve heats up, and Support follows. | SWE-0001 F6, F9 (scenario); AIE-0020 F5–F6 (DORA: throughput up, instability up). |
| 4 | "Unclear requirements are paid for later, by someone else, as rework." | Two teams: team B skips the spec (low effectiveness). Watch the back lane from Platform to team B fill, and the tap's bad share rise. | SWE-0002 F1–F2 (survey: incomplete requirements the most-named problem; rework among its effects). Cost size: Boehm's 40–50% is contested (SWE-0002 F4, F6); do not quote a number. |
| 5 | "When review is overloaded, people stop reviewing. They stamp." | Gatekeeper lead, AI at the engineers, rubber-stamp mechanic on (see §3.5): the valve opens under pressure and bad documents pass through to the tap. | AIE-0019 F11 (68% submitted first output unedited, short online task); SWE-0001 F6 (speaker observation, no data); AIE-0018 F1. |
| 6 | "Before you add a pump, fix the water: one clear spec helps more than AI at five desks." | Mission "20 good swings" (§4): raising effectiveness at PM or Analyst beats switching on AI anywhere. | **hypothesis.** SWE-0002 plus LLM-0022 F5 by inference; no source tests a clear requirement as an intervention. The model's `min()` quality rule builds this in (**model**), so say so. |
| 7 | "AI makes material faster than anyone can read it." | Marketing use case, or Tire swing with the fan-out dial on Documentation at ×10. Support receives pages it never consumes. | **hypothesis**, partly AIE-0019 F3–F4 (PMs: effort moves to evaluating; skipped revision pushes cost onto others). |
| 8 | "Your bottleneck is often one person wearing two hats." | Gatekeeper lead: the lead's specs and reviews compete for one person's time (shared server). | **hypothesis** (theory of constraints, not in the evidence layer). AIE-0019 F2 (accountability is not delegated) supports why that person can't hand it to AI. |

Lead with 1, 2 and 4; those three carry the Brief's learning goal. Use 6 only as the framed hypothesis it already is in the Voice script ("This is my hypothesis").

## 2. Use cases

### 2.1 Review of the existing three

- **Tire swing.** It is too tidy to carry any message beyond "a pipeline": there are no loops, and `pm → doc (release notes)` is odd, because release notes come after engineering. Billing hangs off Ops alone, although price terms come from Sales. Keep it as the equilibrium opener, and redraw it as in §2.2 for the "messy reality" step.
- **Gatekeeper lead.** This is the strongest use case: one person, two valves, clear bounce-backs. It carries messages 1, 5 and 8. Risk: the messy preset gives *Engineer 2* lower values than Engineers 1 and 3, which reads as "Engineer 2 is the weak one" and breaks the Brief's no-bad-actors constraint. Give all three engineers the same values, and vary their input instead.
- **Two teams, one platform.** It carries messages 3 and 4. The edge "team B skips the spec" is a good, recognisable trait. Add a loop back from Support to PM: today support complaints exit at the tap and never return as demand.
- **Missing: Startup.** The feature guide lists it for v1 (eight roles, three people). It is the best fit for the Individual audience and for small German firms, so keep it.

### 2.2 Tire swing, realistic redraw (eight roles)

Forward lane (artefact on each edge):

```
Customer ─request─▶ Sales ─deal + promised scope─▶ PM ─brief─▶ Analyst/Architect ─spec─▶ Engineer ─pull request─▶ Operations ─release─▶ Customer
                     │                                         │                    │                    │
                     └─contract & price terms──────────────────┼────────────────────┼──────▶ Billing ◀───usage──┘ ─invoice─▶ Customer
                                                               └─spec (what changes)─▶ Documentation ◀─change log─┘
                                                                                         └─help pages─▶ Support ◀─known issues─ Operations
Customer ─question / complaint─▶ Support ─answer─▶ Customer
```

Merges: **Documentation** (spec + change log), **Billing** (contract + usage), **Support** (help pages + known issues + customer complaints). These merges are where contamination becomes visible: one bad input degrades the merged artefact.

Return lanes (the "two-lane pipe" from feedback-02):

| Return edge | Artefact | Why it exists |
|---|---|---|
| Engineer → Analyst | clarification question | vague spec; the most common rework lane |
| Analyst → PM | open questions | vague brief |
| PM → Sales | "what did we promise?" | over-promised deal |
| Operations → Engineer | rollback / incident | escaped defect (AIE-0020 F5–F6: instability) |
| Support → PM | bug report, feature request | **failure demand** re-entering as new work |
| Billing → Sales | invoice dispute | price terms didn't match delivery |

Natural valves: **code review** (Engineer → Ops, the evidence-backed one), **spec review** at the Analyst (the Brief's thesis), and **Support** once failure demand returns. AI per node: Sales drafts proposals; PM drafts briefs; Analyst drafts specs; Engineer drafts code (the big pump); Documentation generates pages (high fan-out); Ops writes scripts; Support drafts answers (AIE-0020 F11, +14%); Billing reconciles (no evidence, AIE-0020 caveat).

Aha: with AI at the Engineer only, the Support → PM loop grows a few weeks later. The customer's complaints become the PM's backlog, so the "faster" org gets busier upstream. Carries messages 3 and 4.

### 2.3 New use cases for German mid-size firms

Every one is software-free or software-light, so all its claims transfer from software evidence and stay **hypothesis** unless a research job covers that domain. Say that on the use case's caption.

**A. Construction / engineering firm: tender to acceptance (Ausschreibung bis Abnahme).** Closest to Han's own domain; lead with it for German Organization workshops.
- Nodes: Client (Bauherr) → Estimating (Kalkulation) → Bid lead (Angebotsleitung) → Project lead (Projektleitung) → Work preparation / planning (Arbeitsvorbereitung) → Site management (Bauleitung) ⇄ Subcontractors → Acceptance (Abnahme) → Billing & change orders (Abrechnung / Nachtragsmanagement) → Client. Warranty (Gewährleistung) returns to Site management.
- Edges: bill of quantities (Leistungsverzeichnis) → estimate → offer → contract → execution plans → site diary and quantity take-off (Bautagebuch, Aufmaß) → acceptance record (Abnahmeprotokoll) → invoice; return lanes: change order (Nachtrag), defect notice (Mängelanzeige).
- Valve: Estimating under fixed tender deadlines, plus the change-order desk.
- AI: reads the bill of quantities and drafts the estimate at Estimating, drafts the offer, drafts plan variants, writes site diaries.
- Aha: AI lets the firm bid on three times the tenders, but positions it misread in the bill of quantities come back as change-order disputes months later at Billing. The pump is at the front and the damage is at the end.
- Messages: 4 (paid later, by someone else) and 2.

**B. Insurance claims handling (Schadenregulierung).**
- Nodes: Customer → Intake (first notice of loss) → Triage (straight-through vs manual) → Claims handler (Sachbearbeitung) ⇄ External assessor (Gutachter) → Approval above authority limit (four-eyes principle, Vier-Augen-Prinzip) → Payout → Customer; Complaints returns to the Claims handler.
- Edges: claim report, triaged file, assessment request, report, settlement proposal, approval, payout letter; return lanes: request for documents (Rückfrage) to the Customer, complaint.
- Valves: four-eyes approval (fixed by authority rules) and external assessors.
- AI: extracts data at Intake, drafts letters and settlement proposals for the Claims handler.
- Aha: AI doubles the handler's proposals, so the four-eyes approver drowns. Meanwhile incomplete claim reports (bad input from the customer) generate request-for-documents loops that AI makes faster but not fewer.
- Messages: 1 and 5 (rubber stamping at the four-eyes approval is a real compliance risk), plus failure demand.

**C. Marketing content team** (already in the feature guide as after-v1).
- Nodes: Requester → Strategist (brief) → Copywriter ∥ Designer → Brand review → Legal review → Publishing → Audience; Legal sends rework back to the Copywriter.
- The fan-out dial is the star: one brief → 50 variants.
- Valves: Brand and Legal, each one person.
- Aha: legal reviews 5 variants a week whether AI makes 5 or 50. Either 45 die in the queue or legal starts stamping.
- Messages: 7 and 5.

**D. Internal IT ticket flow.**
- Nodes: Employee → Service desk (1st level) → 2nd level → Change approval board → Operations → Employee. A Knowledge base node is fed by 2nd level and read by the Service desk.
- Edges: ticket, escalation, change request, approved change, fix; return lanes: reopened ticket, KB article.
- Valves: 2nd level and the change board.
- AI: a chatbot or answer drafts at 1st level; KB articles at 2nd level.
- Aha: (1) wrong first answers become reopened tickets, failure demand hitting 2nd level. (2) AI writes KB articles faster than anyone reviews them; stale articles feed the chatbot, which gives worse answers. This is the **context-rot loop** made organizational.
- Messages: 2 and 4, and the sediment metaphor. Evidence: AIE-0020 F11 (support +14%) and LLM-0022 (muddy context), the loop itself **hypothesis**.

**E. Regulated QA / compliance gate** (medical devices, automotive supplier, pharma).
- Nodes: Development → Verification / testing → Technical documentation → QA release by a named responsible person → Audit / authority. Findings return to Development (CAPA).
- Valve: the named release signature. It is legally personal, so it cannot be pumped.
- AI: generates test reports and documentation (high fan-out).
- Aha: the one node where accountability can't be delegated becomes the hard ceiling. The only way to raise output is better input, meaning fewer findings per document.
- Messages: 8 and 6. Evidence: AIE-0019 F2 (accountability not delegated); the rest **hypothesis**.

Priority to build: Tire swing redraw → A (construction) → B (claims) → E (compliance). C and D are good YouTube variants for the Individual audience.

## 3. Downstream damage of bad quality

| Mechanism | What happens in a real org | Evidence | Visible mechanic |
|---|---|---|---|
| 1. Rework loop | Work is sent back for clarification or fixes; the sender does it twice. | SWE-0002 F2 (rework after implementation among the reported effects; survey). Size contested (F4, F6). | Exists (`bounce`). Draw it as the backward lane of a two-lane pipe, with return documents tinted. Count "sent back" next to "done". |
| 2. Extra effort per bad input | A vague input costs the receiver time to decode, ask or guess. | **hypothesis** (plausible; not measured in the files). | Exists (`PENALTY 1.7 / 1.3`). Make it visible: a bad document sits longer at the station, with a slow spinner. |
| 3. Contamination of downstream decisions | A wrong assumption early is built on by everyone after; at merges it spoils good inputs. | SWE-0002 F5 (late requirements break architecture, design and code). For AI: LLM-0022 F5–F6 (wrong early assumptions persist). | Exists as `min()` quality. Make it visible at **merges**: a bad input darkens the merged output. Add a lineage trace on hover (where did this smudge come from?). |
| 4. Escaped defects → failure demand | Bad output reaches the customer and returns as complaints, tickets and disputes: new work that adds no value. | Instability: AIE-0020 F3 (+9% bugs per developer), F5–F6 (DORA). "Failure demand" as a term (Seddon) is **not in the evidence layer**: commission research or call it hypothesis. | New: a bad document at the tap spawns a request back into Support or Intake after a delay. The org's intake grows by its own defects. |
| 5. Review overload → rubber-stamping | Reviewers under pressure skim and approve, so quality falls exactly where volume rises. | SWE-0001 F6 (speaker observation); AIE-0019 F11 (68% unedited, short task); AIE-0018 F1. | New: a valve's bounce probability falls as its queue fills. The valve visibly "opens" (stamp icon) and bad documents pass. This is the strongest single mechanic for message 5. |
| 6. Bigger batches, slower review | AI produces larger changes; larger changes take longer to review and fail more. | AIE-0018 F4 (+154% PR size); AIE-0020 F9 (DORA 2024 hypothesis: larger changelists). | New: AI documents drawn larger; review time scales with size. |
| 7. Waiting and context switching | Work waits; when picked up, context has to be rebuilt; specs go stale. | Waiting time grows with queue length (queueing math, not evidence). Context-switch cost and staleness: **hypothesis**. | New: documents yellow (age) while queued; past an age, a document drops one quality step ("stale"). |
| 8. Lost work | Requests that are never picked up, silently abandoned, or worked around. | **hypothesis**. | Exists (`leak`). Reframe the words: real orgs rarely drop work cleanly; say "abandoned / never picked up" instead of "lost". |

Ship 1, 3, 4 and 5 for v1. Mechanic 6 doubles as the fan-out dial's cost. Keep 7 and 8 subtle.

## 4. Interactions for discovery

Workshop rule: **predict, then play.** Before each mission, participants mark (on paper or by clicking) the node where they expect the pile-up. Surprise is the teaching moment.

Keep:

1. **"The ideal org."** Equilibrium, white documents only (feedback-01). One minute, no task. Facilitator: "We all know reality is messier." Then the Reality slider.
2. **"Turn AI on at engineering. Did the customer get more swings?"** (Gatekeeper lead.) Answer: no, the lead's review is full. Messages 1 and 8.
3. **"Turn AI on everywhere. What broke, and where?"** (Tire swing, messy.) Answer: the tap gets more of everything, bad included, and Support's loop grows. Messages 2 and 3.
4. **"Get 20 good swings a week. You have three moves."** Each move is one of: +effectiveness at one node, AI at one node, or +1 reviewer at a valve. This is the best mission because it has several valid solutions. It only works if "add a reviewer" is a real lever and the prototype is not demand-bound (§0), otherwise the answer is rigged to "effectiveness at PM".
5. **"Find the valve."** Pick a use case; participants name the narrowest review step before the facilitator turns AI on. This is Actionable 1 rehearsed.
6. **"Put AI at the reviewer."** It speeds review but raises the stamp risk (mechanic 5). This is honest nuance, and it shows AI isn't banned from review.
7. **Map your own team** (offline in v1): a printed node and edge template, then compare with the closest use case. This is Actionable 1 done.

Cut or hide:

- Per-node efficiency and effectiveness dials on every node for participants: too many knobs. Keep them in the node card for the facilitator, and give participants the missions' moves only.
- The quality-encoding switch: a prototype decision tool; pick one encoding and ship it.
- Isolation mode (only selected nodes on): a facilitator and explaining tool, not a mission.
- Any score leaderboard or "you win": it invites gaming the model's constants instead of reading the system.

## 5. Risks

1. **"AI never improves quality."** The model holds quality constant under AI (ADR 0024 decision 5), but evidence exists both ways: documentation quality +7.5% (AIE-0020 F8), support novices +34% (AIE-0020 F11), balanced ideas in the P&G study (AIE-0019 F5). Frame it as: "The model holds quality fixed so you can see the flow effect alone." Optionally, expose an "AI quality effect: worse / same / better" assumption on the AI preset, defaulting to "same". Otherwise a German manager leaves with an anti-AI message, which is wrong for Han's business.
2. **Quality only ever falls.** `min()` means no node can repair a document except through rework, while real reviewers and analysts do clarify. That makes message 6 true by construction. Either let review nodes upgrade quality at a capacity cost, or say plainly that the picture shows the floor.
3. **False precision.** "14 waiting", "6 lost a week" and the "75%" thresholds are tuned constants (ADR 0024 says illustrative). Show bands or relative change ("about twice as many waiting"), round to words in the card, and label the page "illustrative, not measured".
4. **Software evidence stretched to other industries.** Every research file is about software or LLMs. Construction, insurance and compliance use cases are analogies: caption them "hypothesis: same mechanism, not studied here".
5. **Blame by dial.** A per-person effectiveness dial ("Engineer 2: 60%") names a bad actor, against the Brief. Frame effectiveness as the conditions a role works in (input clarity, time, tools), not talent, and never vary it between peers in a preset.
6. **Disputed numbers.** Faros and DORA 2024 disagree on review speed (AIE-0020 caveat), and Faros correlations are weak (ρ = 0.08). Use direction words, not the 91%, on the Explorable itself; keep numbers in Speaker notes with their caveats (as the dossier already does).
7. **Leaks mislead.** Real orgs rarely drop work cleanly; they grow backlogs and work around them. Word leaks as "abandoned or never picked up".
8. **Naive fixes.** "Add a reviewer" or "slow AI down" can look like the moral. Close every scenario on the Brief's actionables: check the valve before the pump, and write the requirement first.
9. **Fixed intent.** The model assumes one stable customer intent; real requirements move (SWE-0002 F1: moving targets 33%). Mention it in the about Slide as a limit, or later add a "requirements change mid-flow" event.
10. **Transient vs steady state.** Participants judge the first ten seconds. Show "warming up" until the model settles, or start Presets from their settled frame (ADR 0024's steady-state intent).
