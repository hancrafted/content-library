---
type: research
title: 'Why does an LLM trained on public text lack knowledge of a specific
  organisation?'
description: 'An LLM lacks organisational knowledge because a company''s
  internal facts are absent from public training text, and rare facts are
  learned poorly even when present.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-19T14:04:04Z
stale_after: 2027-04-19T00:00:00Z
sources:
  - id: 1
    resource: https://arxiv.org/abs/2302.13971
    title: 'Touvron et al., LLaMA: Open and Efficient Foundation Language Models'
  - id: 2
    resource: https://arxiv.org/abs/2211.08411
    title: 'Kandpal et al., Large Language Models Struggle to Learn Long-Tail
      Knowledge'
  - id: 3
    resource: https://arxiv.org/abs/2012.07805
    title: 'Carlini et al., Extracting Training Data from Large Language Models'
  - id: 4
    resource: https://arxiv.org/abs/2005.11401
    title: 'Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP
      Tasks'
  - id: 5
    resource: https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training
    title: 'Anthropic, Is my data used for model training? (commercial products)'
  - id: 6
    resource: https://github.com/hancrafted/content-library/blob/2e77623d9b309a95e11dd9510d826f5b4b941245/docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md
    title: 'Earlier research file, Why do others frame working with AI as onboarding
      a colleague?'
---

# Why does an LLM trained on public text lack knowledge of a specific organisation?

## Context

Asked to support the claim that an AI model starts every job without knowing how a given company works. The claim rests on what goes into a model's training data and on how reliably a model learns facts that appear rarely, so the question is scoped to training data and fact learning.

## Answer

A model can only learn what its training text contains, and the text behind general-purpose models is public: web pages, books, encyclopaedias. An organisation's internal facts (its processes, decisions, customers, naming) are mostly not in that text, and vendors state that commercial customers' conversations are not used for training by default. Where a fact is in the data but rare, the model still learns it poorly, because accuracy tracks how many training documents mention it. Both gaps are why the organisation's knowledge has to be supplied at the time of the request, for example by retrieval.

## Findings

1. Models of this kind can be trained on public data alone: the LLaMA authors set out to show state-of-the-art models can be trained "using publicly available datasets exclusively", without "proprietary and inaccessible datasets" [1].
2. Anthropic states that, by default, it does not use inputs or outputs from its commercial products for training; feedback and explicit opt-in are the exceptions, and raw connector content is not included unless pasted into the chat [5].
3. A model's ability to answer a fact-based question "relates to how many documents associated with that question were seen" in pre-training, with strong correlational and causal relationships between accuracy and relevant document count [2].
4. Larger models learn long-tail knowledge somewhat better, but the authors estimate models would need scaling "by many orders of magnitude" to answer rarely supported questions competitively; they propose retrieval augmentation to reduce the dependence on pre-training information [2].
5. Facts a model has seen are not guaranteed to be unrecoverable or irrelevant: GPT-2, trained on public internet scrapes, emitted hundreds of verbatim training sequences, including some that appear in just one document, and larger models were more susceptible [3].
6. Pretrained models store knowledge in their weights, but "their ability to access and precisely manipulate knowledge is still limited", and "providing provenance for their decisions and updating their world knowledge remain open research problems" [4].
7. The remedy the retrieval literature offers is to pair the model with a non-parametric memory, a searchable index consulted at request time, which improved results on knowledge-intensive tasks over a parametric-only model [4].
8. The earlier onboarding research records the same situation from the practitioner side: a model arrives with broad general ability and no knowledge of a team's norms, projects or history, so context must be supplied by the human [6].

## Caveats

The studies [1][2][3][4] test open or older models and public benchmarks, not a named company's data, so the step from "rare facts are learned poorly" to "this organisation's facts are absent" is inference. Finding 5 shows that rare or private-looking text can enter training and be extracted when it was publicly scraped; the Answer's claim is about internal material that was never published. Finding 2 covers Anthropic's commercial products only, and vendor policies change. The source [1] page does not list its datasets, so the abstract establishes "public data only" for LLaMA but not the composition of other vendors' training sets.

[1]: <https://arxiv.org/abs/2302.13971> "Touvron et al., LLaMA: Open and Efficient Foundation Language Models"
[2]: <https://arxiv.org/abs/2211.08411> "Kandpal et al., Large Language Models Struggle to Learn Long-Tail Knowledge"
[3]: <https://arxiv.org/abs/2012.07805> "Carlini et al., Extracting Training Data from Large Language Models"
[4]: <https://arxiv.org/abs/2005.11401> "Lewis et al., Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
[5]: <https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training> "Anthropic, Is my data used for model training? (commercial products)"
[6]: <https://github.com/hancrafted/content-library/blob/2e77623d9b309a95e11dd9510d826f5b4b941245/docs/llm-wiki/research/AIE/AIE-0001__ai-as-onboarding-a-colleague/research.md> "Earlier research file, Why do others frame working with AI as onboarding a colleague?"
