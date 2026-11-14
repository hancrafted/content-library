---
type: research
title: 'Why do the workflows an organisation designs copy its communication
  structure, as Conway''s law states for systems "defined broadly"?'
description: 'A design organisation is structured before it designs, and design
  parts depend on each other only where their designers talked, so designs copy
  it; shown for products, not workflows.'
generated:
  by: claude-code/sonnet-4.6
  at: 2026-11-14T11:59:25Z
stale_after: 2027-11-14T00:00:00Z
sources:
  - id: 1
    resource: https://www.melconway.com/Home/Committees_Paper.html
    title: 'Melvin Conway, How Do Committees Invent? (Datamation, April 1968)'
  - id: 2
    resource: https://web.eecs.umich.edu/~weimerw/2018-481/readings/mythical-man-month.pdf
    title: 'Frederick Brooks, The Mythical Man-Month (1975), chapter 10, The
      Documentary Hypothesis'
  - id: 3
    resource: https://dash.harvard.edu/bitstream/handle/1/34403525/maccormack%2Cbaldwin%2Crusnak_exploring-the-duality.pdf
    title: 'MacCormack, Baldwin and Rusnak, Exploring the duality between product
      and organizational architectures: A test of the mirroring hypothesis
      (Research Policy, 2012, author manuscript)'
  - id: 4
    resource: https://dash.harvard.edu/server/api/core/bitstreams/7312037e-28a6-6bd4-e053-0100007fdf3b/content
    title: 'Colfer and Baldwin, The mirroring hypothesis: theory, evidence, and
      exceptions (Industrial and Corporate Change, 2016)'
  - id: 5
    resource: https://www.youtube.com/watch?v=2n41YjR5QfU
    title: 'Adam Bender, Software Engineering at the Tipping Point (conference talk,
      transcript)'
  - id: 6
    resource: https://www.melconway.com/Home/Conways_Law.html
    title: 'Melvin Conway, Conway''s Law (author''s page)'
---

# Why do the workflows an organisation designs copy its communication structure, as Conway's law states for systems "defined broadly"?

## Context

Asked to support the claim that a process people design for their own organisation tends to reproduce how that organisation already divides work and talks. Conway's 1968 paper is about designing systems; whether a workflow counts as such a system, and whether the pattern has been measured for workflows, is what the Caveats separate from what the Sources show.

## Answer

Conway argues that an organisation has to be structured before it can design anything, because the first partitioning of the work decides which groups exist and who talks to whom [1]. Each delegation narrows the design alternatives a group can pursue, and two parts of a design can depend on each other only where their designers negotiated an interface, so the design ends up with the organisation's structure [1]. Empirical work on products supports this as a common pattern, not a universal one: mirroring appears in most industry and firm studies and in the matched software pairs, but not in most studies of open collaborative projects [3][4]. Conway's "system" is broad enough to include recommendations and specifications, and a later review counts tasks and decisions as components of a technical system, so workflow design plausibly falls under the law, but no source tested it on workflows [1][4].

## Findings

1. Conway defines design broadly: "that kind of intellectual activity which creates a whole from its diverse parts", whether "the creation of specifications for a major weapon system, the formation of a recommendation to meet a social challenge, or the programming of a computer" [1]. The output is typically "a document containing a coherently structured body of information", and a theory counts as a system too [1]. The 1968 text says "in the broad sense used here"; the words "defined more broadly here than just information systems" are from Conway's 2010 author's note on the same page [1].
2. Conway's own page states the law in one form as: "Any organization that designs a system (defined broadly) will produce a design whose structure is a copy of the organization's communication structure" [6]. In the paper's conclusion the thesis reads: "organizations which design systems (in the broad sense used here) are constrained to produce designs which are copies of the communication structures of these organizations" [1]. His 2010 note restates it as "will inevitably produce a design whose structure is a copy of the organization's communication structure" [1].
3. Why, step one: "the initial stages of a design effort are concerned more with structuring of the design activity than with the system itself". Organising the team already makes design decisions, so "there is no such thing as a design group which is both organized and unbiased" [1].
4. Why, step two: given any team organisation, "there is a class of design alternatives which cannot be effectively pursued by such an organization because the necessary communication paths do not exist". Each delegation that narrows someone's scope of inquiry narrows the alternatives that can be pursued [1].
5. Why, step three: if two subsystems communicate, their design groups "must have negotiated and agreed upon an interface specification"; if they do not, there was nothing to negotiate and no link between the groups. Conway concludes that the system's structure maps onto the organisation's, identical when each subsystem has its own group, otherwise the organisation is "a collapsed version" of the system's structure [1].
6. The effect strengthens with size and rigidity: "to the extent that an organization is not completely flexible in its communication structure, that organization will stamp out an image of itself in every design it produces. The larger an organization is, the less flexibility it has" [1]. Communication paths grow as about half the square of headcount, so communication must be restricted, and where protocol restricts communication to lines of command, "military-style organizations design systems which look like their organization charts" [1].
7. Conway's examples are anecdotes: eight people split five and three produced a five-phase COBOL compiler and a three-phase ALGOL compiler, and two military services told to build one weapon system "produced a copy of their organization chart" [1].
8. Conway's remedy is to organise "according to the need for communication", and to keep the organisation flexible, because the first design "is almost never the best possible" and the prevailing concept may change [1].
9. Brooks gave the idea its name. In the chapter on documents he lists "Who: organization chart", which "becomes intertwined with the interface specification, as Conway's Law predicts", and adds that Conway "goes on to point out that the organization chart will initially reflect the first system design, which is almost surely not the right one. If the system design is to be free to change, the organization must be prepared to change" [2]. Brooks quotes the thesis with "systems" where Conway's paper says "designs" [1][2].
10. The first systematic test compared matched pairs of software products with the same function, one from a tightly coupled commercial firm and one from a loosely coupled open-source community. In every pair the loosely coupled organisation's product was significantly more modular, "up to a factor of eight" in how far a change to one component could propagate [3]. The authors explain the link as the organisation's "governance structures, problem solving routines and communication patterns" constraining the space in which it searches for solutions [3].
11. A review of 142 empirical studies found mirroring "a prevalent pattern but not universal". Among descriptive industry and firm studies, 70% showed strong mirroring, 22% partial and 8% none, while for open collaborative projects, mostly software, 56% did not support it [4]. The authors attribute the exception to digital tools that allow other modes of coordination [4].
12. The same review gives the mechanism as cognitive economy: people facing interdependencies "must communicate with one another and cooperate", so organisational ties come to mirror technical dependencies, which conserves scarce cognitive resources [4]. It adds that the hypothesis predicts correspondence without fixing a direction of causality, and that mirroring is dynamic: in 9 of 10 industry cases, incumbents mirrored the old architecture and were misaligned when a new one arrived [4].
13. Colfer and Baldwin define the components of a technical system more broadly than design parameters: "all the tasks and decisions required to design, operate, and maintain the system", with manufacturing processes and supply chains among their examples [4]. This is the closest any source comes to workflows.
14. Structure is not the only force. A practitioner account from Google says architecture, code review and security policy reflect what an organisation values and incentivises, not only how it is divided [5].

## Caveats

- No source examines workflows designed for AI agents, or business processes drawn by the people who run them. Conway's paper and Colfer and Baldwin's definition make a workflow a candidate "system", but the step from products and architectures to workflows is an inference, not a finding. The review's evidence base is mostly products and software: 39 of 142 studies were software [4].
- Conway's argument is a derivation plus anecdotes, not data; he puts "proof" in quotation marks [1]. The empirical support comes from later studies that correlate structure and design and do not by themselves show that organisation causes design [4].
- The question's phrase "defined broadly" is Conway's wording on his own page [6]; the 1968 paper says "in the broad sense used here" and the 2010 note says "defined more broadly here than just information systems" [1].
- Mirroring is a tendency with documented exceptions: 8% of descriptive industry and firm studies and 56% of open-collaboration studies did not support it, and firms can break the mirror on purpose [4].
- The MacCormack, Baldwin and Rusnak text read is the author manuscript of the 2012 article held by Harvard's repository, not the journal typesetting; its matched pairs are software products only [3].
- Brooks is read from a scanned copy of the 1975 edition hosted by a university course, and the quotation is from OCR text [2]. The Bender talk is one practitioner's account [5].
- The 1968 paper does not say that a copied structure is worse. It says the first design is almost never the best and that flexibility matters [1].

[1]: <https://www.melconway.com/Home/Committees_Paper.html> "Melvin Conway, How Do Committees Invent? (Datamation, April 1968)"
[2]: <https://web.eecs.umich.edu/~weimerw/2018-481/readings/mythical-man-month.pdf> "Frederick Brooks, The Mythical Man-Month (1975), chapter 10, The Documentary Hypothesis"
[3]: <https://dash.harvard.edu/bitstream/handle/1/34403525/maccormack%2Cbaldwin%2Crusnak_exploring-the-duality.pdf> "MacCormack, Baldwin and Rusnak, Exploring the duality between product and organizational architectures: A test of the mirroring hypothesis (Research Policy, 2012, author manuscript)"
[4]: <https://dash.harvard.edu/server/api/core/bitstreams/7312037e-28a6-6bd4-e053-0100007fdf3b/content> "Colfer and Baldwin, The mirroring hypothesis: theory, evidence, and exceptions (Industrial and Corporate Change, 2016)"
[5]: <https://www.youtube.com/watch?v=2n41YjR5QfU> "Adam Bender, Software Engineering at the Tipping Point (conference talk, transcript)"
[6]: <https://www.melconway.com/Home/Conways_Law.html> "Melvin Conway, Conway's Law (author's page)"
