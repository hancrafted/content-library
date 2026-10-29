---
type: research
title: 'Why have the attempts to make the terminal approachable for first-timers
  worked or failed?'
description: 'Setup is hard for novices and instant feedback raised
  self-reported confidence in one Unix course, but no primary source measures
  whether redesigned terminals help first-timers.'
generated:
  by: claude-code/sonnet-5.5
  at: 2026-10-29T16:23:47Z
stale_after: 2027-04-29T00:00:00Z
sources:
  - id: 1
    resource: https://doi.org/10.12688/f1000research.3-62.v2
    title: 'Wilson, Software Carpentry: lessons learned'
  - id: 2
    resource: https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf
    title: 'Berry et al., ShellOnYou: learning by doing Unix command line'
  - id: 3
    resource: https://swcarpentry.github.io/shell-novice/
    title: 'Software Carpentry, The Unix Shell (shell-novice lesson)'
  - id: 4
    resource: https://learn.microsoft.com/en-us/windows/terminal/
    title: 'Microsoft, An overview on Windows Terminal'
  - id: 5
    resource: https://docs.warp.dev/terminal/blocks/block-basics
    title: 'Warp, Block basics'
  - id: 6
    resource: https://github.com/withfig/autocomplete/issues/2068
    title: 'Falk, Fig is joining AWS!'
---

# Why have the attempts to make the terminal approachable for first-timers worked or failed?

## Context

Asked to support claims about how to introduce a first-timer to a terminal: which design choices around the terminal are backed by evidence and which are only product claims. The question covers teaching programmes (Software Carpentry, a university Unix course) and product redesigns (Windows Terminal, Warp, Fig).

## Answer

The evidence that something worked comes from teaching programmes, not from redesigned terminals. Software Carpentry reports that installing software is harder for novices than using it and that long written documentation did not fix this, while a Unix course with instant per-answer feedback raised students' self-reported confidence. No primary source measures whether Windows Terminal, Warp or Fig helped first-timers; their documentation describes features, and Fig was wound down after joining AWS. The evidence is thin and mostly self-reported, so the design lesson (minimise setup friction, show the first command, give immediate feedback) is an inference.

## Findings

1. Software Carpentry reports that getting software installed is often harder than using it for its inexperienced audience, that every new tool fails for at least one person in the room across Mac, Windows and Linux variants, and that detailed documentation "has not proven effective" because some learners will not read it and it is incomprehensible to some and lacking for others [1].
2. Its shell session shows learners only a dozen basic commands; the stated aim is the idea of combining single-purpose tools and having the computer repeat things, not command coverage [1].
3. It teaches by live coding rather than slides, because "watching code emerge on the screen is much more convincing than looking at pre-made slides" and it lets instructors answer "what if?" questions; this is the author's belief, not a measured result [1].
4. Whatever the pace, "20% or more of the room will be lost" and a different 20% bored; learners misjudge their own level, so the project added a short pre-assessment asking whether they could accomplish specific tasks [1].
5. The author states "we have not yet done a large-scale, long-term follow-up", calls the assessment results "still preliminary", and notes that survey response rates "are usually low" and the opt-in nature "undoubtedly biases the data"; 80-90% of attendees report being glad they attended [1].
6. The current Software Carpentry shell lesson keeps the onboarding minimal: it defines the shell as "a program that enables us to send commands to the computer and receive output", names it as the terminal or command line, and has the first command be `cd`. Its setup steers each OS to one terminal (Terminal on macOS, Git Bash on Windows) and warns about a Windows unzip pitfall [3].
7. In a university Unix course with 41 to 46 students per cohort over four years, an exercise platform that scores each attempt and gives specific feedback almost instantly was used for two weeks. About 11% of responding students had never heard of Unix, 14% were greatly worried about studying it and 34% felt some apprehension [2].
8. Afterwards, 78.2% of 2021 respondents said they had procedural Unix knowledge, against 38.8% before; students named confidence, retrying with feedback and the game-like score as reasons. The authors call this self-report possibly subjective [2].
9. The survey return rate was 48% to 59% per cohort, and the most frequent exercise criticism was that the exercises were too easy, so the design suited novices better than experienced students [2].
10. Microsoft's Windows Terminal overview describes it as "a modern host application for the command-line shells you already love", listing tabs, panes, GPU rendering, themes and shortcuts; it states no goal or result for first-time users [4].
11. Warp's documentation describes Blocks as grouping a command with its output, colour-coding failed commands with a red background, and supporting navigation between them; the page states no problem solved and no usability result [5].
12. Fig's announcement says Amazon acquired Fig's technology and the team moved to AWS, with existing users supported and new sign-ups paused; it makes no statement about terminal accessibility or about outcomes for beginners [6].

## Caveats

No peer-reviewed or vendor source reviewed here tests a redesigned terminal (Windows Terminal, Warp, Fig) with first-timers, so the Answer cannot say whether those attempts worked; it says only that they are undocumented on that point. A search for a controlled study of novice terminal difficulty found Berry et al. only; Shell Tutor (ITiCSE 2024) could not be read and is not used. The Software Carpentry and ShellOnYou findings concern classroom learners (researchers and engineering students), not people who have never opened a terminal and are working alone; applying them to a solo guide is an inference. The Fig outcome is taken from the announcement only, not from a later primary notice of the shutdown.

[1]: <https://doi.org/10.12688/f1000research.3-62.v2> "Wilson, Software Carpentry: lessons learned"
[2]: <https://ctiber.github.io/papers/2022/VBetAl_ITICSE_2022.pdf> "Berry et al., ShellOnYou: learning by doing Unix command line"
[3]: <https://swcarpentry.github.io/shell-novice/> "Software Carpentry, The Unix Shell (shell-novice lesson)"
[4]: <https://learn.microsoft.com/en-us/windows/terminal/> "Microsoft, An overview on Windows Terminal"
[5]: <https://docs.warp.dev/terminal/blocks/block-basics> "Warp, Block basics"
[6]: <https://github.com/withfig/autocomplete/issues/2068> "Falk, Fig is joining AWS!"
