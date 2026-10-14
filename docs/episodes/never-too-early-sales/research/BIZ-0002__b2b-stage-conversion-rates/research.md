---
type: research
title: 'Why do B2B sales opportunities convert at different rates across pipeline stages?'
description: 'Rates differ by stage because each stage tests different qualification evidence, and a rate is comparable only once its stage definition and denominator, conditional or total, are fixed.'
question: 'Why do B2B sales opportunities convert at different rates across pipeline stages?'
generated:
  by: copilot-cli/claude-sonnet-5.5
  at: 2026-10-13T23:36:25Z
stale_after: 2027-04-13T23:36:25Z
sources:
  - id: microsoft-qualify-lead
    resource: https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales
    title: 'Microsoft, Qualify and convert a lead to opportunity'
  - id: hubspot-funnel-reports
    resource: https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports
    title: 'HubSpot, Create custom funnel reports'
  - id: hubspot-pipelines-stages
    resource: https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines
    title: 'HubSpot, Set up and customize pipelines'
  - id: pipedrive-deal-conversion
    resource: https://support.pipedrive.com/en/article/insights-reports-deal-conversion
    title: 'Pipedrive, Insights reports: deal conversion'
---

# Why do B2B sales opportunities convert at different rates across pipeline stages?

## Context

Asked to support the claim that a pipeline's overall conversion is built from several stage-to-stage rates that are not equal. The question is about what a stage conversion rate measures and why it varies by stage, not about any benchmark value.

## Answer

Conversion differs by stage because each stage is a different test. Early stages ask whether a prospect is a genuine opportunity (a budget and a decision timeline, in Microsoft's example), and unqualified prospects are disqualified; later stages ask for different evidence, such as a presentation, a decision maker's buy-in or a sent contract, so deals leave for different reasons at each. A rate is therefore only meaningful with the stage defined and its denominator fixed: the conditional rate is the share of deals that reached stage N which reach N+1, and the total rate is the share of the entering cohort that reaches the end. The total equals the product of the conditional rates only for one cohort passing mandatory stages strictly in order, which the sources show is not how the tools count by default. The sources give no measured benchmark, so a ratio such as 27:1 is an illustration, not an industry figure.

## Findings

1. Qualifying a lead validates that it is a genuine sales opportunity and creates an opportunity record to track the deal; leads that do not meet the criteria are disqualified with an audit trail. Microsoft's example is a prospect who provides a budget and a clear decision timeline [^microsoft-qualify-lead].
2. Lead qualification is the step before the opportunity: in Dynamics 365 Sales a lead is a separate record that becomes an opportunity when qualified, so lead to opportunity and the stages of a deal are different transitions [^microsoft-qualify-lead].
3. In HubSpot's default deal pipeline the stages are named for different evidence (Appointment scheduled, Qualified to buy, Presentation scheduled, Decision maker bought-in, Contract sent), each with its own default closing probability: 20%, 40%, 60%, 80%, 90%. These are configurable defaults that weight deal amounts in board view, not measured conversion rates, and they come from one vendor's tool [^hubspot-pipelines-stages].
4. HubSpot's funnel report computes conversion between stages from "date entered stage" timestamps. A stage can be marked optional so deals that skip it still count, and a deal enters the total conversion rate only if it reaches the last stage. Its date range filters by when stage activity happened, not when the deal was created [^hubspot-funnel-reports].
5. Pipedrive's funnel report shows the percentage of deals that reached each stage, with an overall win rate on top. By default it covers deals created this year in one pipeline that are marked won or lost; Won deals count as having completed every stage, and Lost deals stop at the stage where they ended [^pipedrive-deal-conversion].

## Caveats

- Scope: the sources are vendor documentation of how three CRM tools (Dynamics 365 Sales, HubSpot, Pipedrive) define stages and compute conversion. They show what a rate means and how it is counted, not what rates B2B companies achieve, and they do not show why deals are lost at each stage.
- Inference: that stages remove prospects for different reasons follows from the stages being defined by different evidence (Findings 1 and 3). No source measures loss reasons by stage.
- Inference: the total rate is the product of the conditional rates only if every deal in one cohort passes mandatory stages strictly in order. HubSpot allows optional stages, and Pipedrive counts every Won deal as having completed all stages, so stage-reached percentages from these tools are not strictly sequential counts.
- Inference: Pipedrive's percentages are cumulative from the first stage, so the conditional rate between two stages is the later percentage divided by the earlier one, under the assumptions above.
- Cohort denominator: a rate over deals created in a period (Pipedrive's default) differs from a rate over deals active in a period (HubSpot's date filter). Leaving out open deals, as Pipedrive's won or lost default does, can make a young cohort understate later-stage conversion; this is inferred from the filters, not stated by either source.
- Stage names and default probabilities are tool settings and differ between organisations.
- The documents describe product behaviour that can change, so the file expires after six months.

[^hubspot-funnel-reports]: HubSpot, Create custom funnel reports, https://knowledge.hubspot.com/reports/create-new-custom-funnel-reports

[^hubspot-pipelines-stages]: HubSpot, Set up and customize pipelines, https://knowledge.hubspot.com/object-settings/set-up-and-customize-pipelines

[^pipedrive-deal-conversion]: Pipedrive, Insights reports: deal conversion, https://support.pipedrive.com/en/article/insights-reports-deal-conversion

[^microsoft-qualify-lead]: Microsoft, Qualify and convert a lead to opportunity, https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales
