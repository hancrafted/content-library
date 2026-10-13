---
type: research
title: 'Why does unchecked AI work carry real risk?'
description: 'Unchecked AI output has caused documented harm, from sanctioned fake citations to less secure code written with more confidence, so someone must verify it.'
question: 'Why does unchecked AI work carry real risk?'
generated:
  by: claude-code/opus-5.5
  at: 2026-10-13T00:00:00Z
stale_after: 2027-04-13T00:00:00Z
sources:
  - id: mata-v-avianca
    resource: https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf
    title: 'Judge P. Kevin Castel, Mata v. Avianca, Inc., Opinion and Order, No. 22-cv-1461 (PKC) (S.D.N.Y. June 22, 2023), ECF 54'
  - id: perry-insecure-code-ai-assistants
    resource: https://arxiv.org/abs/2211.03622
    title: 'Perry, Srivastava, Kumar, Boneh, Do Users Write More Insecure Code with AI Assistants? (ACM CCS 2023)'
  - id: pearce-asleep-at-the-keyboard
    resource: https://arxiv.org/abs/2108.09293
    title: "Pearce, Ahmad, Tan, Dolan-Gavitt, Karri, Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions (IEEE S&P 2022)"
  - id: asare-copilot-vs-humans
    resource: https://arxiv.org/abs/2204.04741
    title: "Asare, Nagappan, Asokan, Is GitHub's Copilot as Bad as Humans at Introducing Vulnerabilities in Code?"
  - id: anthropic-claude-code-best-practices
    resource: https://code.claude.com/docs/en/best-practices
    title: 'Anthropic, Best practices for Claude Code'
  - id: earlier-freelancer-research
    resource: https://github.com/hancrafted/content-library/blob/9d1648022ac049eb2001917ada8a96d14af3d247/docs/research/ai-onboarding-freelancer.md
    title: 'Earlier research file, Onboarding an AI agent like an amnesiac freelancer (docs/research/ai-onboarding-freelancer.md, researched 2026-10-08)'
  - id: haynes-surgical-safety-checklist
    resource: https://pubmed.ncbi.nlm.nih.gov/19144931/
    title: 'Haynes et al., A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population, New England Journal of Medicine 360(5), 2009'
  - id: sandoval-lost-at-c
    resource: https://arxiv.org/abs/2208.09727
    title: 'Sandoval, Pearce, Nys, Karri, Garg, Dolan-Gavitt, Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants (USENIX Security 2023)'
---

# Why does unchecked AI work carry real risk?

## Context

Asked to support the claim that handing work to an AI without a way to check it exposes the person who delegated, in measurable and documented ways, not only in vendor advice. The question is scoped to evidence of harm and to what the evidence says reduces it.

## Answer

Unchecked AI output has already cost people real money, standing and security. In a New York federal case, lawyers filed a brief citing six cases ChatGPT had invented, kept defending them when challenged, and were fined; the court held that rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings" [^mata-v-avianca]. In a controlled study, programmers with an AI assistant (mostly students) wrote significantly less secure code than those without, and were more likely to believe their code was secure [^perry-insecure-code-ai-assistants], but that result is disputed: a larger study of 58 student programmers on one C task found AI-assisted users produced critical security bugs at a rate "no greater than 10% more than the control", and its authors conclude that LLM use "does not introduce new security risks" in that setting [^sandoval-lost-at-c]. Both studies used 2022 models, so their rates are not current ones. The risk is therefore not only that the output is wrong but that it looks right and the person who delegated feels more sure, so the review the work needs is the step that gets skipped. How large the code-security effect is disputed [^pearce-asleep-at-the-keyboard][^asare-copilot-vs-humans][^sandoval-lost-at-c], but the court case and the vendor's own advice to give the model a way to verify its work agree on the remedy: someone other than the author checks, against a test that does not rely on the author's confidence [^mata-v-avianca][^anthropic-claude-code-best-practices].

## Findings

1. In Mata v. Avianca, the court found that lawyers "submitted non-existent judicial opinions with fake quotes and citations created by the artificial intelligence tool ChatGPT, then continued to stand by the fake opinions after judicial orders called their existence into question" [^mata-v-avianca].
2. The court did not find that using AI was the wrong. It wrote that "there is nothing inherently improper about using a reliable artificial intelligence tool for assistance", but that existing rules "impose a gatekeeping role on attorneys to ensure the accuracy of their filings" [^mata-v-avianca].
3. The court listed the harms of fake opinions: the opposing party wastes time and money exposing them, the court's time is taken from other matters, the client may be deprived of arguments based on real precedent, and judges named as authors of bogus opinions suffer reputational harm [^mata-v-avianca].
4. The court found subjective bad faith by both lawyers, because they stood by the cases after being questioned, and imposed a $5,000 penalty, jointly and severally, paid into the court's registry [^mata-v-avianca].
5. In a user study of 47 participants on five security tasks, those with an AI assistant "wrote significantly less secure code than those without access", and were "more likely to believe they wrote secure code", which the authors say may make users "overconfident about security flaws in their code" [^perry-insecure-code-ai-assistants]. On one task 67% of the AI group gave a correct solution against 79% of the control group [^perry-insecure-code-ai-assistants].
6. In the same study, participants who trusted the AI less and worked more actively on their prompts produced code with fewer vulnerabilities [^perry-insecure-code-ai-assistants]. The assistant was OpenAI's codex-davinci-002, a 2022 model, and 85% of participants were undergraduate or graduate students [^perry-insecure-code-ai-assistants].
7. Earlier, Pearce et al. prompted GitHub Copilot with 89 security-relevant scenarios, producing 1,689 programs, of which "approximately 40%" were vulnerable (a 2021-era Copilot, so the rate is not a current one); they note that the top-ranked suggestion matters because novice users may accept it with more confidence [^pearce-asleep-at-the-keyboard].
8. Counter-evidence: Asare et al., testing Copilot on C/C++ code where humans had introduced vulnerabilities, found it replicated the vulnerable code about 33% of the time and the fixed code 25% of the time, and conclude it is "not as bad as human developers" at introducing vulnerabilities [^asare-copilot-vs-humans]. This too tested a 2022-era Copilot.
9. Counter-evidence from a user study of the same kind: Sandoval, Pearce et al. had 58 student programmers write one C data structure (a singly-linked "shopping list", pointer and array manipulation) with and without an LLM assistant, and report that "AI-assisted users produce critical security bugs at a rate no greater than 10% more than the control", "indicating the use of LLMs does not introduce new security risks" [^sandoval-lost-at-c]. The authors scope this to "this setting (low-level C with pointer and array manipulations)" and a 2022 Codex model; it is a small-effect result for students on one task, not a general finding [^sandoval-lost-at-c].
10. Anthropic's own guidance for its coding agent says to give it a way to verify its work: its best-practices page has a section "Give Claude a way to verify its work" and, under common failure patterns, advises "Always provide verification (tests, scripts, screenshots). If you can't verify it, don't ship it" [^anthropic-claude-code-best-practices]. It also recommends a second opinion in a fresh context, "so the agent doing the work isn't the one grading it", and says "A fresh context improves code review since Claude won't be biased toward code it just wrote" [^anthropic-claude-code-best-practices]. Reading this as the agent version of a definition of done is this file's interpretation, not the page's; an earlier research file that made the same reading is kept only as a record [^earlier-freelancer-research].
11. A checklist is evidence that a simple verification step can reduce harm in expert work. In a before-and-after study across eight hospitals, introducing a 19-item surgical safety checklist was associated with inpatient death falling from 1.5% to 0.8% and complications from 11.0% to 7.0% [^haynes-surgical-safety-checklist].

## Caveats

- The Anthropic page [^anthropic-claude-code-best-practices] was re-fetched on 2026-10-13 and its wording changed since the 2026-10-08 fetch; the first quote now sits under common failure patterns. Vendor pages change.
- The user study [^perry-insecure-code-ai-assistants] has a small sample (47 after exclusions, 33 in the AI group), and its participants were 66% undergraduates, 19% graduate students and 15% professionals; its authors note that the sample consisted mainly of university students, who may not represent likely users of AI assistants. Pearce et al. [^pearce-asleep-at-the-keyboard] measure what a tool suggests, not what a person ships; Asare et al. [^asare-copilot-vs-humans] reach a milder conclusion on a different dataset and language. The user studies [^perry-insecure-code-ai-assistants] and [^sandoval-lost-at-c] disagree on size: [^sandoval-lost-at-c] used student programmers on a C task and reports a small effect, while [^perry-insecure-code-ai-assistants] used five tasks in several languages and reports a significant one; this file does not settle which is closer to professional practice. The code-security evidence [^perry-insecure-code-ai-assistants][^pearce-asleep-at-the-keyboard][^asare-copilot-vs-humans][^sandoval-lost-at-c] uses 2021 to 2022 models and mostly student participants, so effect sizes should not be read as current rates. [^sandoval-lost-at-c] scopes its own conclusion to low-level C and a single task.
- Mata v. Avianca is one case; its ruling bears on the lawyers' professional duty, not on all AI use. The fine was small; the harm named by the court is time, cost, and reputation.
- Finding 11 is evidence from surgery, not AI. It shows that a short checklist can reduce error by skilled people; it does not show the same effect for AI review. A paywalled New Yorker article by Gawande, cited by the record [^earlier-freelancer-research], was not used.
- That the delegator becomes overconfident is shown by [^perry-insecure-code-ai-assistants] for code; extending it to other AI work is an inference. The record's [^earlier-freelancer-research] claim about "freelance practice" (written brief, definition of done) has no verified primary source and is not relied on.
- Moffatt v. Air Canada (2024 BCCRT 149), a tribunal ruling that a company was liable for its chatbot's wrong answer, was searched for but its primary text could not be fetched, so it is not cited.

[^mata-v-avianca]: Judge P. Kevin Castel, Mata v. Avianca, Inc., Opinion and Order, No. 22-cv-1461 (PKC) (S.D.N.Y. June 22, 2023), ECF 54, https://storage.courtlistener.com/recap/gov.uscourts.nysd.575368/gov.uscourts.nysd.575368.54.0.pdf

[^perry-insecure-code-ai-assistants]: Perry, Srivastava, Kumar, Boneh, Do Users Write More Insecure Code with AI Assistants? (ACM CCS 2023), https://arxiv.org/abs/2211.03622

[^pearce-asleep-at-the-keyboard]: Pearce, Ahmad, Tan, Dolan-Gavitt, Karri, Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions (IEEE S&P 2022), https://arxiv.org/abs/2108.09293

[^asare-copilot-vs-humans]: Asare, Nagappan, Asokan, Is GitHub's Copilot as Bad as Humans at Introducing Vulnerabilities in Code?, https://arxiv.org/abs/2204.04741

[^anthropic-claude-code-best-practices]: Anthropic, Best practices for Claude Code, https://code.claude.com/docs/en/best-practices

[^earlier-freelancer-research]: Earlier research file, Onboarding an AI agent like an amnesiac freelancer (docs/research/ai-onboarding-freelancer.md, researched 2026-10-08), https://github.com/hancrafted/content-library/blob/9d1648022ac049eb2001917ada8a96d14af3d247/docs/research/ai-onboarding-freelancer.md Record only, not relied on: the file was deleted from the repository and nothing here depends on it.

[^haynes-surgical-safety-checklist]: Haynes et al., A Surgical Safety Checklist to Reduce Morbidity and Mortality in a Global Population, New England Journal of Medicine 360(5), 2009, https://pubmed.ncbi.nlm.nih.gov/19144931/ Abstract via PubMed.

[^sandoval-lost-at-c]: Sandoval, Pearce, Nys, Karri, Garg, Dolan-Gavitt, Lost at C: A User Study on the Security Implications of Large Language Model Code Assistants (USENIX Security 2023), https://arxiv.org/abs/2208.09727
