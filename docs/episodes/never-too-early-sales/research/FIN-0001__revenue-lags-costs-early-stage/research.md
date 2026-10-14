---
type: research
title: 'Why does revenue typically lag the costs that generate it in an early-stage startup?'
description: 'Booked revenue follows delivery and cash receipts follow invoicing and payment terms, so each trails the work that produces a sale, and the two timings differ.'
question: 'Why does revenue typically lag the costs that generate it in an early-stage startup?'
generated:
  by: copilot-cli/claude-sonnet-5.5
  at: 2026-10-13T23:34:43Z
stale_after: 2027-10-13T23:34:43Z
sources:
  - id: eu-ifrs-15-regulation
    resource: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905
    title: 'European Commission, Regulation (EU) 2016/1905 (endorsing IFRS 15 Revenue from Contracts with Customers)'
  - id: irs-publication-538
    resource: https://www.irs.gov/publications/p538
    title: 'Internal Revenue Service, Publication 538: Accounting Periods and Methods'
  - id: eu-late-payment-directive
    resource: https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007
    title: 'European Parliament and Council, Directive 2011/7/EU on combating late payment in commercial transactions'
---

# Why does revenue typically lag the costs that generate it in an early-stage startup?

## Context

Asked to support the claim that a startup can run out of cash while its sales are on track. The claim needs two things kept apart: when revenue is booked in the accounts, and when cash is received.

## Answer

Booked revenue and cash receipts are two separate timings. Revenue is booked when the company delivers a good or service, not when the customer pays, so it follows the work that produces the sale. Cash is received later still when the customer buys on credit: the invoice is paid only after the agreed payment term, and sometimes after that. Because a sale takes work before delivery, it is an inference, flagged in the Caveats, that costs usually start before revenue is booked and before cash is received, and that this gap is what a startup's cashflow view has to cover.

## Findings

1. Under IFRS 15, revenue is recognised when the company satisfies a performance obligation by transferring a promised good or service, that is, when the customer obtains control of it. Recognition follows delivery, not payment [^eu-ifrs-15-regulation].
2. When a company delivers before the customer pays or before payment is due, IFRS 15 records the right to payment as a contract asset. Once only the passage of time is needed before payment is due, it is a receivable. Booked revenue that has not yet arrived as cash therefore sits on the balance sheet as an amount owed [^eu-ifrs-15-regulation].
3. The reverse also exists. When a customer pays, or payment is due, before delivery, IFRS 15 records a contract liability, not revenue. Cash can therefore arrive before revenue, for example with prepayment, and the lag depends on the payment terms [^eu-ifrs-15-regulation].
4. Tax rules draw the same line. Under the accrual method, income is reported when it is earned, regardless of when payment is received, and expenses when they are incurred, regardless of when paid. Under the cash method, income is reported when received and expenses when paid [^irs-publication-538].
5. Credit terms are the normal case in business-to-business trade. The EU Directive on late payment states that most goods and services between businesses are supplied on a deferred-payment basis, where the supplier gives its client time to pay the invoice. It sets a general limit of 60 calendar days on contractual payment periods, which parties may exceed by express agreement if not grossly unfair to the creditor [^eu-late-payment-directive].
6. The Directive also records that many invoices are paid later than agreed, and that such late payment negatively affects liquidity and complicates financial management [^eu-late-payment-directive].

## Caveats

The sources define revenue and cash receipts and document payment terms. They do not measure how long an early-stage startup waits between its first cost and its first customer payment, and no such figure is stated here. The Answer's claim that costs start before revenue is an inference from the Findings and from the fact that a sale needs work before delivery, not a finding of these sources. It also assumes the costs are paid when incurred; supplier credit or deferred payments can delay that cash outflow, and the sources do not address them. How a cash balance compares with booked revenue is not shown either, only that receipts can trail revenue. Prepayment, such as annual subscriptions billed upfront, can reverse the receipt lag. The 60-day limit is an EU rule for contractual payment periods; other jurisdictions differ and parties may agree longer terms. Publication 538 describes United States tax accounting, which may differ from the accounting a company uses in its financial statements.

[^eu-ifrs-15-regulation]: European Commission, Regulation (EU) 2016/1905 (endorsing IFRS 15 Revenue from Contracts with Customers), https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32016R1905

[^irs-publication-538]: Internal Revenue Service, Publication 538: Accounting Periods and Methods, https://www.irs.gov/publications/p538

[^eu-late-payment-directive]: European Parliament and Council, Directive 2011/7/EU on combating late payment in commercial transactions, https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32011L0007
