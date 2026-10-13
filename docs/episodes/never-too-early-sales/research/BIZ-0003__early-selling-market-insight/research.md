---
type: research
title: 'Why does selling early yield market insight beyond the revenue itself?'
description: "Early customer contact offers feedback on founders' assumptions, while stated willingness to pay can exceed actual payment and purchase intentions only imperfectly predict buying."
question: 'Why does selling early yield market insight beyond the revenue itself?'
generated:
  by: copilot-cli/claude-sonnet-5.5
  at: 2026-10-13T23:38:36Z
stale_after: 2027-10-13T23:38:36Z
sources:
  - id: graham-do-things-that-dont-scale
    resource: https://paulgraham.com/ds.html
    title: "Graham, Do Things that Don't Scale"
  - id: murphy-hypothetical-bias
    resource: https://link.springer.com/article/10.1007/s10640-004-3332-z
    title: 'Murphy et al., A Meta-analysis of Hypothetical Bias in Stated Preference Valuation'
  - id: morwitz-purchase-intentions
    resource: https://doi.org/10.1016/j.ijforecast.2007.05.015
    title: 'Morwitz, Steckel and Gupta, When do purchase intentions predict sales?'
---

# Why does selling early yield market insight beyond the revenue itself?

## Context

Asked to support the claim that a young company should start selling before it needs the revenue, because the sales effort itself produces knowledge about the market. The claim rests on a difference between what buyers say they would do and what they do when asked to commit money, so the question is scoped to that difference.

## Answer

Selling early yields market insight because it replaces hypothetical answers with observed behaviour. A buyer who is asked for money or commitment shows whether the problem matters, what the offer is worth to them and what stands in the way, and early direct contact lets the seller see this first-hand. Stated willingness to pay overstates actual payment (Finding 3), and stated purchase intentions predict purchases only imperfectly, least for new products (Finding 4), so a purchase is stronger evidence than enthusiasm; the studies do not show that intentions are overstated in direction, only that they predict weakly. Early evidence comes from few, self-selected buyers and should be read as direction, not as a measurement of the market.

## Findings

1. Founders at Y Combinator are advised to over-engage with their earliest users, because the feedback from engaging directly with them "will be the best you ever get" and a founder's initial model of users is always inaccurate, even when the founder is one of them [^graham-do-things-that-dont-scale].
2. The same essay advises getting a product in front of users as soon as it has a quantum of utility and then seeing what they do with it; by its account, the first thing a founder builds is never quite right, and use of the product is what corrects it [^graham-do-things-that-dont-scale].
3. A meta-analysis of 28 stated-preference studies that also measured actual payment, with 83 observations, found a median ratio of hypothetical to actual willingness to pay of 1.35, with a severely positively skewed distribution. The commonly held belief was an overstatement by a factor of two or three; the ratio varied with how value was elicited, and choice-based elicitation reduced the bias [^murphy-hypothetical-bias].
4. Stated purchase intentions correlate with actual purchasing less strongly for new products than for existing ones, less strongly over long time horizons than short ones, and less strongly when measured against total market sales than against trial rates [^morwitz-purchase-intentions].

## Caveats

The two studies on intentions and willingness to pay come from consumer and stated-preference settings, not from B2B or coaching sales; applying them to a founder's early sales conversations is an inference. Murphy et al. is a meta-analysis of studies that elicited both hypothetical and actual values, and it reports that results are sensitive to model specification and that the skewed distribution hides large biases in some cases; its median is not a correction factor to apply to a single buyer.

No source here measures how often early sales conversations yield a specific insight such as a rejected price or a named objection. The Answer's claim that customer discovery, willingness to pay and objections are revealed by being asked to commit is an inference from the evidence on hypothetical bias and from Graham's practitioner account; Graham's essay is an experienced investor's advice built on examples such as Stripe, not a controlled study.

Early buyers are a small, self-selected sample, often the founder's network or the most eager prospects, and they are not representative of the later market. Insight from them risks over-fitting to those buyers, and a lack of early purchases can reflect weak reach or a weak pitch as much as weak demand. Treat each early purchase as evidence about that buyer and each declined offer as a question to ask.

[^graham-do-things-that-dont-scale]: Graham, Do Things that Don't Scale, https://paulgraham.com/ds.html

[^murphy-hypothetical-bias]: Murphy et al., A Meta-analysis of Hypothetical Bias in Stated Preference Valuation, https://link.springer.com/article/10.1007/s10640-004-3332-z

[^morwitz-purchase-intentions]: Morwitz, Steckel and Gupta, When do purchase intentions predict sales?, https://doi.org/10.1016/j.ijforecast.2007.05.015
