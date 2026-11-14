---
type: research
title: 'Why do information scent, Hick''s law and information architecture hold, as each original source words it?'
description: 'Each principle is a finding about people, stated in its source as: scent is perceived from proximal cues, choice time grows with information, and IA makes information findable.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-11-12T15:39:10Z
stale_after: 2027-11-12T00:00:00Z
sources:
  - id: 1
    resource: https://doi.org/10.1037/0033-295X.106.4.643
    title: 'Pirolli and Card, Information Foraging (Psychological Review, 1999)'
  - id: 2
    resource: https://doi.org/10.1080/17470215208416600
    title: 'Hick, On the Rate of Gain of Information (Quarterly Journal of Experimental Psychology, 1952)'
  - id: 3
    resource: https://doi.org/10.1037/h0056940
    title: 'Hyman, Stimulus Information as a Determinant of Reaction Time (Journal of Experimental Psychology, 1953)'
  - id: 4
    resource: https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html
    title: 'Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., ch. 2'
  - id: 5
    resource: https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html
    title: 'Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., Part I introduction'
---

# Why do information scent, Hick's law and information architecture hold, as each original source words it?

## Context

Asked to support design claims about labels, choice and where knowledge is placed, each credited to a named originator. The question is what each original source says and how far, so a later reader can cite the principle without reading a secondary summary. All three describe people using human-made information environments.

## Answer

Information scent is Pirolli and Card's term for how people judge the value of an information source from a nearby cue, such as a link or an icon, before reaching it. Hick and Hyman showed in the 1950s that choice reaction time rises with the information in the set of alternatives, which popular accounts compress to "more options, slower choice". Rosenfeld, Morville and Arango define information architecture as a design discipline focused on making information findable and understandable. All three are findings or definitions about human perception and decisions; none was studied on AI models, so applying them to how an AI picks a skill is an analogy.

## Findings

1. Pirolli and Card's abstract names three model types: patch models, diet models, and "information scent models, which address the identification of information value from proximal cues" [1].
2. Their definition, as quoted from page 646 by later papers, reads: "Information scent is the (imperfect) perception of the value, cost, or access path of information sources obtained from proximal cues, such as bibliographic citations, WWW links, or icons representing the sources" [1].
3. The theory assumes that people, when possible, modify their strategies or the structure of the environment to maximize their rate of gaining valuable information [1].
4. Hick applied information theory to choice-reaction-time experiments with up to ten alternatives, and found the rate of gain of information to be on average constant with time and of the order of five bits per second [2].
5. Hick reports that the distribution of reaction times among the stimuli relates to the objective uncertainty about which response will be given [2].
6. Hyman varied the information in a stimulus three ways (number of equally probable alternatives, relative frequency, and probability given the preceding stimulus), and reports a linear regression of reaction time on the amount of information for each [3]. Only part of the 1953 abstract was read, so the finding covers what that part states.
7. The authors define information architecture four ways, the first two being "The structural design of shared information environments" and "The synthesis of organization, labeling, search, and navigation systems within digital, physical, and cross-channel ecosystems" [4].
8. The Part I introduction, which precedes Chapter 1, calls it "a design discipline that is focused on making information findable and understandable", and adds that information environments "can be organized for optimum findability and understandability" [5].
9. The definition list's third item is "The art and science of shaping information products and experiences to support usability, findability, and understanding" [4].

## Caveats

- Finding 2 is the page-646 wording as quoted by later papers; the original is paywalled and its page 646 was not read. Confirm it against the paper before quoting it as Pirolli and Card's words.
- Pirolli and Card model human foragers; an AI reading skill names and descriptions has no tested "scent". Saying a vague label gives a model less to go on is an inference, not their finding.
- Hick and Hyman measured human reaction times in a laboratory choice task; the abstracts cite no more than ten alternatives. That a longer list of options makes an AI choose worse is an inference; the law is a finding about people. Only part of Hyman's 1953 abstract was read.
- "Hick's law" as a formula (time grows with the logarithm of the alternatives) is a later summary of this work; the abstracts read here state the information-based relationship, not that formula.
- A paraphrase such as "the craft of organising information so it can be found" is not the authors' wording; their words are in Finding 8.

[1]: <https://doi.org/10.1037/0033-295X.106.4.643> "Pirolli and Card, Information Foraging (Psychological Review, 1999)"
[2]: <https://doi.org/10.1080/17470215208416600> "Hick, On the Rate of Gain of Information (Quarterly Journal of Experimental Psychology, 1952)"
[3]: <https://doi.org/10.1037/h0056940> "Hyman, Stimulus Information as a Determinant of Reaction Time (Journal of Experimental Psychology, 1953)"
[4]: <https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html> "Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., ch. 2"
[5]: <https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html> "Rosenfeld, Morville and Arango, Information Architecture: For the Web and Beyond, 4th ed., Part I introduction"
