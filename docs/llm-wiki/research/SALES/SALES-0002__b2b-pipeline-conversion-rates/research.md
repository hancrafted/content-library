---
type: research
title: 'Why are stage conversion rates in a B2B sales pipeline as low as they are?'
description: 'Each stage filters out most entries, buying groups of many people must agree, and the biggest loss is buyers who decide nothing, so only a minority of opportunities close.'
confidence: open
confidence_reason: 'Vendor data and Gartner figures known only from search excerpts are weak Sources.'
informs: [sales]
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-13T23:21:19Z
stale_after: 2027-10-13T23:21:19Z
sources:
  - id: 1
    resource: https://hbr.org/2022/06/stop-losing-sales-to-customer-indecision
    title: 'Dixon and McKenna, Stop Losing Sales to Customer Indecision (Harvard Business Review)'
  - id: 2
    resource: https://www.gartner.com/en/sales-service/insights/buyer-enablement
    title: 'Gartner, Buyer Enablement'
  - id: 3
    resource: https://www.gartner.com/en/newsroom/press-releases/2025-05-07-gartner-sales-survey-finds-74-percent-of-b2b-buyer-teams-demonstrate-unhealthy-conflict-during-the-decision-process
    title: 'Gartner, Gartner Sales Survey Finds 74% of B2B Buyer Teams Demonstrate "Unhealthy Conflict" During The Decision Process'
  - id: 4
    resource: https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf
    title: 'Ebsta and Pavilion, GTM Benchmarks Report'
---

# Why are stage conversion rates in a B2B sales pipeline as low as they are?

## Context

Asked to support the claim that a B2B pipeline must be filled with many more leads than the deals it is meant to produce, and to check a worked example of such ratios. The claim is about why each stage loses most of what enters it, not about what any one company's rates are.

## Answer

Conversion is low because each stage is a filter and the filters multiply. B2B purchases also need agreement from a buying group of several people, who often disagree. The largest single cause of a lost deal is not a competitor but a buyer who never decides, which one analysis of millions of conversations puts at 40 to 60 percent of deals. As a result, a typical new-customer win rate in a large vendor dataset is under one in five qualified opportunities, so a seller needs roughly five opportunities for each win.

## Findings

1. An analysis of more than 2.5 million recorded sales conversations found that 40 to 60 percent of deals are lost to buyers who intend to buy but never act, which the authors call "no decision" and then split into indecision and preference for the status quo [1].
2. The same authors name the buyer's own inability to decide as the obstacle sellers are least trained for; such buyers often go through the whole process, including lengthy pilots or trials, and then do not cross the finish line [1].
3. Gartner reports that the typical buying group involves six to 10 stakeholders, each of whom has consulted four to five sources of information that the group must reconcile, and that most surveyed buyers rate the purchase as extremely complex or difficult [2].
4. In a Gartner survey of B2B buyers, 74 percent of buying teams showed unhealthy conflict during the decision, and groups that reached consensus were 2.5 times more likely to report a high-quality deal; Gartner describes group sizes ranging from five to 16 people [3].
5. In a dataset of 655 thousand opportunities across 387 companies, the new-customer win rate was 19 percent, with a sales cycle of 91 days and 8 stakeholders per deal, against 45 percent, 52 days and 5 stakeholders for expansion sales to existing customers. A win rate of 19 percent is about 5.3 opportunities per win [4].
6. In the same dataset, deals that slip late in the cycle convert worse, and winning deals involved decision makers early; the report says its percentage changes are relative, not percentage points [4].
7. The same dataset reports an MQL-to-SQL rate of 68 percent beside the 19 percent win rate [4].

## Caveats

The worked example in the source deck (lead to opportunity 3:1, opportunity to deal 9:1, 27:1 in total) is multiplicatively consistent, and its 9:1 (about 11 percent) is stricter than the 19 percent win rate above (about 5:1). No primary source here confirms 3:1 or 27:1, and stage definitions plausibly differ per company (inference, see below), so treat the example as illustrative, not as a benchmark.

The Ebsta report is a vendor study of its own customers' CRM data, so its sample leans toward sales teams that use such tools. The Dixon and McKenna article was read only in its public portion, so the Answer uses only the combined 40 to 60 percent "no decision" figure. Both Gartner pages returned an access error to automated fetching; their figures were read from search-result excerpts of those pages, not the pages themselves, so check them against the page before quoting. Gartner's group-size ranges differ between its two pages (six to 10 and five to 16), which the Answer therefore does not state as a single number.

Inference: a stage's rate depends on where a vendor draws its start and end, so rates from different companies are likely not comparable stage by stage; Finding 7 shows only that two stages of one dataset have different rates (68 and 19 percent). The Answer's "filter" framing, that each stage removes entrants so the rates multiply, is arithmetic over Finding 5's rates rather than a measured cause, and no source here measures why entrants fail to fit, need or budget.

The Answer's causal chain (filter, group agreement, indecision) combines these separate findings; no single source measures how much each contributes to a given stage's rate, so that weighting is inference.

[1]: https://hbr.org/2022/06/stop-losing-sales-to-customer-indecision 'Dixon and McKenna, Stop Losing Sales to Customer Indecision (Harvard Business Review)'
[2]: https://www.gartner.com/en/sales-service/insights/buyer-enablement 'Gartner, Buyer Enablement'
[3]: https://www.gartner.com/en/newsroom/press-releases/2025-05-07-gartner-sales-survey-finds-74-percent-of-b2b-buyer-teams-demonstrate-unhealthy-conflict-during-the-decision-process 'Gartner, Gartner Sales Survey Finds 74% of B2B Buyer Teams Demonstrate "Unhealthy Conflict" During The Decision Process'
[4]: https://benchmarks.ebsta.com/hubfs/V3%202025%20Benchmark%20Report/gtm_benchmarks_digital_report.pdf 'Ebsta and Pavilion, GTM Benchmarks Report'
