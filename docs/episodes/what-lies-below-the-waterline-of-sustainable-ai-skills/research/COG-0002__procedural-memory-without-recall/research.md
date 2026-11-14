---
type: research
title: 'Why could amnesic patients like H.M. learn new movements without remembering the lessons, and how far does that picture hold for a language model?'
description: 'H.M. learned skills because skill memory lives outside the damaged medial temporal lobe; for a model, weights fit the skill side, but a skill file is read text, closer to a declarative note.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T15:47:34Z
stale_after: 2027-05-12T15:47:34Z
sources:
  - id: 1
    resource: https://pmc.ncbi.nlm.nih.gov/articles/PMC497229/
    title: 'Scoville and Milner, Loss of recent memory after bilateral hippocampal lesions'
  - id: 2
    resource: https://doi.org/10.1126/science.7414331
    title: 'Cohen and Squire, Preserved Learning and Retention of Pattern-Analyzing Skill in Amnesia: Dissociation of Knowing How and Knowing That'
  - id: 3
    resource: https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/
    title: 'Squire, The Legacy of Patient H.M. for Neuroscience'
  - id: 4
    resource: https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/
    title: 'Squire, Conscious and Unconscious Memory Systems'
  - id: 5
    resource: https://doi.org/10.1016/j.nlm.2004.06.005
    title: 'Squire, Memory systems of the brain: A brief history and current perspective'
  - id: 6
    resource: https://arxiv.org/abs/2005.14165
    title: 'Brown et al., Language Models are Few-Shot Learners'
  - id: 7
    resource: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
    title: 'Anthropic, Agent Skills overview'
---

# Why could amnesic patients like H.M. learn new movements without remembering the lessons, and how far does that picture hold for a language model?

## Context

Asked to support a claim about where a repeatable procedure should live: in what a system has learned, in what it is shown in the moment, or in a written note it consults. Human memory research separates exactly these cases, so the question is what that separation shows and which parts carry over to a language model.

## Answer

Patient H.M. could learn mirror drawing across days while remembering none of the sessions, because skills are stored by a memory system that does not depend on the medial temporal lobe, the region his surgery removed; that system works through performance, not conscious recollection. For a model, the mapping is analogy only: trained weights resemble the learned-not-recalled side, and the context window resembles a working record that is gone when the session ends. A skill file does not fit the skill side: the model reads it as text and acts on what it says, which makes it closer to a declarative note than to procedural memory.

## Findings

1. H.M. became profoundly amnesic after a bilateral resection of the medial temporal lobe performed to relieve severe epilepsy; the 1957 report of the case and its formal testing concluded that the anterior hippocampus and hippocampal gyrus are critically concerned in the retention of current experience [1] [3] [4].
2. Brenda Milner tested H.M.'s ability to acquire a visuomotor skill: he traced a double-contoured five-pointed star while seeing his hand and the star only in a mirror, acquired the skill over ten trials and retained it excellently across 3 days [3]. This is Squire's account of Milner's 1962 study; the 1962 chapter itself was not available to read.
3. The result was a surprise, since H.M.'s memory impairment was profound and global, and it was the first hint that the brain holds more than one kind of memory and that motor skills lie outside the medial temporal lobe [3] [4].
4. Motor skills were first treated as a special case. Cohen and Squire showed that amnesic patients also acquired the perceptual skill of mirror reading at a rate equivalent to matched controls and retained it for at least 3 months, despite poor memory for the task and for the words read [2] [4].
5. Cohen and Squire drew the distinction that amnesia spares information based on rules or procedures, "knowing how", while impairing data-based, declarative information, "knowing that" [2]. Squire's later review dates the convergence of evidence on this conscious versus not-conscious distinction to about 1980 [5].
6. Declarative knowledge is available as conscious recollection and can be brought to mind as remembered material. Nondeclarative memory is an umbrella term for several forms (skills and habits, conditioning, priming, perceptual learning) that are dispositional: expressed through performance, not recollection [4].
7. The two-way split later became a multiple-systems view: declarative memory depends on the hippocampus and related structures, while the striatum, cerebellum, amygdala and neocortex support the other forms; the neostriatum, not the medial temporal lobe, serves gradual feedback-guided habit learning [4] [5].
8. A language model's trained weights are learned from a large corpus before use. GPT-3 was applied to new tasks without any gradient updates or fine-tuning, with tasks and demonstrations specified purely as text in the context [6]. What it does with that text is in-context learning, which the source reports as a measured behaviour, not as a stored memory.
9. Agent Skills are filesystem directories of instructions, scripts and reference material; they load on demand, and when a request matches a Skill's description Claude reads SKILL.md with bash, and only then does that content enter the context window [7]. Anthropic contrasts them with prompts: a Skill spares you from repeating the same guidance across conversations [7].

## Caveats

- The mapping to a model is the analogy, not a finding. No cited source says that trained weights are procedural memory, that the context window is working memory, or that a skill file is a declarative note. Those three mappings are this file's inference from findings 6 to 9. The best-supported part is the break: a skill file is written, explicit and read by the model, so it behaves like a declarative note even though it holds a procedure.
- H.M. learned the skill by practice, and the learning changed him. A skill file changes nothing in the model; it only changes what is in context while the session lasts. Training that changes weights has no counterpart in the Findings above beyond the structural parallel in finding 8.
- The H.M. lesion was not limited to the hippocampus; it also included the amygdala and adjacent parahippocampal gyrus, and Milner herself did not claim the memory loss was solely hippocampal [3]. The declarative versus nondeclarative split is also no longer a strict dichotomy: some work proposes the hippocampus supports unconscious memory under some circumstances [4].
- Milner 1962 and Corkin 1968 (Neuropsychologia, doi 10.1016/0028-3932(68)90024-9) were the intended primary sources for the mirror-drawing result and are not cited here as sources, because neither was readable. Finding 2 therefore rests on Squire's account of Milner's study, and the details of Corkin's tests (other motor tasks, learning rates) are not reported.

[1]: <https://pmc.ncbi.nlm.nih.gov/articles/PMC497229/> "Scoville and Milner, Loss of recent memory after bilateral hippocampal lesions"
[2]: <https://doi.org/10.1126/science.7414331> "Cohen and Squire, Preserved Learning and Retention of Pattern-Analyzing Skill in Amnesia: Dissociation of Knowing How and Knowing That"
[3]: <https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/> "Squire, The Legacy of Patient H.M. for Neuroscience"
[4]: <https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/> "Squire, Conscious and Unconscious Memory Systems"
[5]: <https://doi.org/10.1016/j.nlm.2004.06.005> "Squire, Memory systems of the brain: A brief history and current perspective"
[6]: <https://arxiv.org/abs/2005.14165> "Brown et al., Language Models are Few-Shot Learners"
[7]: <https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview> "Anthropic, Agent Skills overview"
