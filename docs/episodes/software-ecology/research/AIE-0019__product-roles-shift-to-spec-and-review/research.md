---
type: research
title: 'Why does AI-assisted execution shift work to specifying and reviewing on the product side: sales, product management and business analysis?'
description: 'Product roles use AI to draft but stay accountable, so effort moves to checking and customer knowledge; evidence is firm for product managers, thin for sales and analysts.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-10T00:00:00Z
stale_after: 2027-11-10T00:00:00Z
sources:
  - id: 1
    resource: https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf
    title: 'Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence'
  - id: 2
    resource: https://arxiv.org/abs/2510.02504
    title: 'Ulloa et al., Product Manager Practices for Delegating Work to Generative AI: "Accountability must not be delegated to non-human actors"'
  - id: 3
    resource: https://www.nber.org/papers/w33641
    title: 'Dell''Acqua et al., The Cybernetic Teammate: A Field Experiment on Generative AI Reshaping Teamwork and Expertise'
  - id: 4
    resource: https://arxiv.org/abs/2511.01324
    title: 'Rani, Berntsson Svensson and Feldt, AI for Requirements Engineering: Industry adoption and Practitioner perspectives'
  - id: 5
    resource: https://assets.ctfassets.net/f43wltp2j5se/2gHMpCURXzpMW7PJ3SlWZJ/3cad8d7e8496abbd3c0f99d5c7f16ef4/salesforce-state-of-sales-report-6-ed.pdf
    title: 'Salesforce, State of Sales, 6th Edition'
  - id: 6
    resource: https://www.nber.org/papers/w33777
    title: 'Humlum and Vestergaard, Large Language Models, Small Labor Market Effects (later titled Still Waters, Rapid Currents)'
---

# Why does AI-assisted execution shift work to specifying and reviewing on the product side: sales, product management and business analysis?

## Context

Asked to support the claim that when AI takes over producing drafts, the human work in customer-facing and requirements-facing roles moves to saying what is wanted and checking what comes back. The question covers the product side of a software organisation: sales, product management and business analysis. No source studies all three; the evidence is assembled role by role.

## Answer

Where AI produces the first draft, product-side people keep the accountability and so spend their effort on checking and on knowing the customer. Product managers delegate drafting and summarising but hold back specifications, and they report effort moving from producing content to integrating and evaluating it. Business analysts and requirements practitioners who use AI mostly review and approve its output, and fear it misses customer-specific needs. Sales is the thinnest case: the evidence shows that reps spend most of their week outside selling and that sales operations worry about inaccurate data and too little human oversight, but not that review work has grown. Across roles, a cross-occupation experiment shows the review step is also where AI-assisted work is most often skipped, which is the risk the shift creates.

## Findings

1. Product managers at one company use generative AI mainly to draft or refine documents (73%), summarise documents (52%), brainstorm (35%) and write external communication (33%) [2].
2. Product managers hesitate to delegate high-stakes work such as specifications and journey maps: "accountability must not be delegated to non-human actors." One says the AI-written output is theirs to answer for: "it's now responsible but I am still accountable" [2].
3. Product managers say they cannot trust output without a way to validate it quickly, and 47% of individual contributors cite output quality or inaccuracy as a limit. A colleague who skips revision pushes the cost of improving quality onto others [2].
4. The authors read this as effort moving from producing content to integrating and evaluating it, and 56% of respondents say the effort their work requires has not decreased, even though 81% say AI saves them time [2].
5. In a field experiment with Procter & Gamble professionals on real product-innovation problems, individuals with AI matched the performance of teams without it. Without AI, commercial staff favoured market-focused ideas and R&D staff technical ones; with AI they produced balanced solutions [3]. Commercial and technical sides therefore meet earlier in the work, which raises what a handoff between them has to carry.
6. In a survey of 55 software practitioners, 32 used AI in requirements work. Of those, 81.2% had humans review and approve AI suggestions, 71.9% let humans correct or override them and 68.8% checked output for accuracy [4].
7. The same survey reports concerns that AI-generated requirements rely on common data and omit core or unique requirements, and that using language models instead of direct customer engagement undermines requirement quality [4].
8. In Salesforce's survey of 5,500 sales professionals, reps spend 30% of an average week selling and 70% on other work, including 9% administrative tasks, 9% manual data entry and 9% preparation and planning [5].
9. In the same report, 59% of business buyers say reps do not take the time to understand their goals, and 86% say they are more likely to buy when their goals are understood. Among sales operations professionals who use AI, 31% report incomplete, inaccurate or old data and 31% report insufficient human oversight of AI [5].
10. Across occupations in Denmark, employers absorb chatbots by reorganising tasks, including new tasks in content generation, AI oversight and AI integration [6].
11. In a writing experiment with 453 professionals, 68% of those given ChatGPT report submitting its first output without editing and were active for about 3 minutes after pasting it. Editing did not raise grades, even under strong incentives to edit. For those who did edit, the share of time spent on rough drafting fell by more than half and the share spent editing more than doubled [1].

## Caveats

No source studies sales, product management and business analysis together, and none studies a shift in time between specifying, executing and reviewing in these roles. The Answer's reading, that effort moves to specifying and reviewing, is an inference from product managers' own accounts [2], from review rates [4] and from task reorganisation [6]; [2] supports it only for product managers and reports it as perception, not measured time.

The product manager study is one company (Microsoft) and self-reported [2]. The requirements survey has 55 respondents recruited by convenience sampling, only 3 business analysts and 1 requirements engineer, and its review percentages describe the 32 AI users only [4]. The sales source is a vendor's own survey, and its figures are self-reported and carry no AI-specific time data [5]; no independent study of how AI changes a salesperson's specifying or reviewing work was found. The Procter & Gamble experiment measures idea quality, not time spent [3], and the writing experiment used one-hour online writing tasks, so its skipped review may not hold for work an employee is accountable for [1]. The Danish study is occupation-level and does not name the three roles [6].

[1]: <https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf> "Noy and Zhang, Experimental Evidence on the Productivity Effects of Generative Artificial Intelligence"
[2]: <https://arxiv.org/abs/2510.02504> "Ulloa et al., Product Manager Practices for Delegating Work to Generative AI: \"Accountability must not be delegated to non-human actors\""
[3]: <https://www.nber.org/papers/w33641> "Dell'Acqua et al., The Cybernetic Teammate: A Field Experiment on Generative AI Reshaping Teamwork and Expertise"
[4]: <https://arxiv.org/abs/2511.01324> "Rani, Berntsson Svensson and Feldt, AI for Requirements Engineering: Industry adoption and Practitioner perspectives"
[5]: <https://assets.ctfassets.net/f43wltp2j5se/2gHMpCURXzpMW7PJ3SlWZJ/3cad8d7e8496abbd3c0f99d5c7f16ef4/salesforce-state-of-sales-report-6-ed.pdf> "Salesforce, State of Sales, 6th Edition"
[6]: <https://www.nber.org/papers/w33777> "Humlum and Vestergaard, Large Language Models, Small Labor Market Effects (later titled Still Waters, Rapid Currents)"
