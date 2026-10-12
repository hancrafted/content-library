---
type: research
description: 'Unchecked AI output has caused documented harm, from sanctioned fake citations to less secure code written with more confidence, so someone must verify it.'
question: 'Why does unchecked AI work carry real risk?'
researched_on: 2026-10-12T00:00:00Z
stale_after: 2027-04-12T00:00:00Z
---

# Why does unchecked AI work carry real risk?

## Context

Asked to support the claim that handing work to an AI without a way to check it exposes the person who delegated, in measurable and documented ways, not only in vendor advice. The question is scoped to evidence of harm and to what the evidence says reduces it.

## Answer

Unchecked AI output has already cost people real money, standing and security. In a New York federal case, lawyers filed a brief citing six cases ChatGPT had invented, kept defending them when challenged, and were fined; the court held that rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings" [1]. In a controlled study, programmers with an AI assistant wrote significantly less secure code than those without, and were more likely to believe their code was secure [2], but that result is disputed: a larger study of 58 participants found AI-assisted users produced critical security bugs at a rate "no greater than 10% more than the control" [8]. The risk is therefore not only that the output is wrong but that it looks right and the person who delegated feels more sure, so the review the work needs is the step that gets skipped. How large the code-security effect is disputed [3][4][8], but the court case and the vendor's own advice to give the model a way to verify its work agree on the remedy: someone other than the author checks, against a test that does not rely on the author's confidence [1][5].

## Findings

1. In Mata v. Avianca, the court found that lawyers "submitted non-existent judicial opinions with fake quotes and citations created by the artificial intelligence tool ChatGPT, then continued to stand by the fake opinions after judicial orders called their existence into question" [1].
2. The court did not find that using AI was the wrong. It wrote that "there is nothing inherently improper about using a reliable artificial intelligence tool for assistance", but that existing rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings" [1].
3. The court listed the harms of fake opinions: the opposing party wastes time and money exposing them, the court's time is taken from other matters, the client may be deprived of arguments based on real precedent, and judges named as authors of bogus opinions suffer reputational harm [1].
4. The court found subjective bad faith by both lawyers, because they stood by the cases after being questioned, and imposed a $5,000 penalty, jointly and severally, paid into the court's registry [1].
5. In a user study of 47 participants on five security tasks, those with an AI assistant "wrote significantly less secure code than those without access", and were "more likely to believe they wrote secure code", which the authors say may make users "overconfident about security flaws in their code" [2]. On one task 67% of the AI group gave a correct solution against 79% of the control group [2].
6. In the same study, participants who trusted the AI less and worked more actively on their prompts produced code with fewer vulnerabilities [2].
7. Earlier, Pearce et al. prompted GitHub Copilot with 89 security-relevant scenarios, producing 1,689 programs, of which "approximately 40%" were vulnerable; they note that the top-ranked suggestion matters because novice users may accept it with more confidence [3].
8. Counter-evidence: Asare et al., testing Copilot on C/C++ code where humans had introduced vulnerabilities, found it replicated the vulnerable code about 33% of the time and the fixed code 25% of the time, and conclude it is "not as bad as human developers" at introducing vulnerabilities [4].
9. Counter-evidence from a user study of the same kind: Sandoval, Pearce et al. had 58 participants write C code (pointer and array manipulation) with and without an LLM assistant, and report that "AI-assisted users produce critical security bugs at a rate no greater than 10% more than the control", concluding the effect on security is small in that setting [8].
10. Anthropic's own guidance for its coding agent says to give it a way to verify its work: "Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it", and to use a fresh-context reviewer so the agent doing the work is not the one grading it [5]. Earlier research on this topic (retrieved from the previous file this one extends) read this as the agent version of a definition of done, and as the one part of onboarding that does not depend on the agent reading and obeying prose [6].
11. A checklist is evidence that a simple verification step can reduce harm in expert work. In a before-and-after study across eight hospitals, introducing a 19-item surgical safety checklist was associated with inpatient death falling from 1.5% to 0.8% and complications from 11.0% to 7.0% [7].

## Sources

1. Judge P. Kevin Castel, Mata v. Avianca, Inc., Opinion and Order, No. 22-cv-1461 (PKC) (S.D.N.Y. June 22, 2023), ECF 54 — https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf — accessed 2026-10-12
2. Perry, Srivastava, Kumar, Boneh, Do Users Write More Insecure Code with AI Assistants? (ACM CCS 2023) — https://arxiv.org/abs/2211.03622 — accessed 2026-10-12
3. Pearce, Ahmad, Tan, Dolan-Gavitt, Karri, Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions (IEEE S&P 2022) — https://arxiv.org/abs/2108.09293 — accessed 2026-10-12
4. Asare, Nagappan, Asokan, Is GitHub's Copilot as Bad as Humans at Introducing Vulnerabilities in Code? — https://arxiv.org/abs/2204.04741 — accessed 2026-10-12
5. Anthropic, Best practices for Claude Code — https://code.claude.com/docs/en/best-practices — accessed 2026-10-08, as quoted in the earlier research file [6]
6. Earlier research file this one extends, Onboarding an AI agent like an amnesiac freelancer (Findings 5, 7b, and "Where the metaphor breaks" item 4), docs/research/ai-onboarding-freelancer.md — researched 2026-10-08
7. Haynes et al., A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population, New England Journal of Medicine 360(5), 2009, abstract via PubMed — https://pubmed.ncbi.nlm.nih.gov/19144931/ — accessed 2026-10-12
8. Sandoval, Pearce, Nys, Karri, Garg, Dolan-Gavitt, Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants (USENIX Security 2023) — https://arxiv.org/abs/2208.09727 — accessed 2026-10-12

## Caveats

- The Anthropic page [5] was not re-fetched today; its quotes come from the earlier file's fetch of 2026-10-08. Vendor pages change.
- The user study [2] has a small sample (47 after exclusions, 33 in the AI group), and its authors note that participants were not representative of professional developers. Pearce et al. [3] measure what a tool suggests, not what a person ships; Asare et al. [4] reach a milder conclusion on a different dataset and language. The user studies [2] and [8] disagree on size: [8] used student programmers on a C task and reports a small effect, while [2] used five tasks in several languages and reports a significant one; this file does not settle which is closer to professional practice. The code-security evidence uses 2021 to 2022 models, so effect sizes should not be read as current rates.
- Mata v. Avianca is one case; its ruling bears on the lawyers' professional duty, not on all AI use. The fine was small; the harm named by the court is time, cost, and reputation.
- Finding 11 is evidence from surgery, not AI. It shows that a short checklist can reduce error by skilled people; it does not show the same effect for AI review. The earlier file's paywalled New Yorker article by Gawande was not used.
- That the delegator becomes overconfident is shown by [2] for code; extending it to other AI work is an inference. The earlier file's claim about "freelance practice" (written brief, definition of done) has no verified primary source and is not relied on.
- Moffatt v. Air Canada (2024 BCCRT 149), a tribunal ruling that a company was liable for its chatbot's wrong answer, was searched for but its primary text could not be fetched, so it is not cited.
