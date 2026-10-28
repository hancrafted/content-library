---
type: poll-dataset
title: 'How do workshop audiences picture working with AI, and does a session shift it?'
description: 'Poll v1: picture of AI, fluency, say over AI, usage, and per Episode whether its problem was seen and its idea known; shares per question; responses.csv holds the counts of each Event.'
generated:
  by: claude-code/opus-5.5
  at: 2026-10-27T22:30:00+01:00
---

# How do workshop audiences picture working with AI, and does a session shift it?

## Question

Han's Episodes claim that most people still picture AI as a chat box they type questions into, not as a colleague they hand work to. This dataset tests that claim with an anonymous live poll at each Event: four baseline questions at the start, the picture of AI first, a check-in after each theory Episode, and at the end the opening picture question once more and whether that picture changed. One Event is about 14 people, so the counts only mean something once several Events asked the same questions; the register below is therefore frozen. Any change to a question's wording or answers starts v2, and its rows never add up with v1's.

## Register

Poll v1. Every question is single choice; none takes free text and none asks for anything that names a person. Answers are listed in poll order as `stored value`: DE / EN, each written as `tag – explanation`, the tag at most 20 characters, because directpoll's result screen cuts an answer after about 40 characters. `model` and `usage` ladder from chat to agentic, the order of the stack the Episodes teach; `scope` ladders from one's own work to the whole company.

- `baseline.model` (single): Was ist KI für dich am ehesten? / What is AI most like for you? — `search`: Suchmaschine – nur schlauer, liefert Antworten / Search engine – just smarter, gives answers · `chat`: Chat – ein Gesprächspartner für meine Fragen / Chat – a conversation partner for my questions · `assistant`: Assistent – arbeitet in meinen Tools mit / Assistant – works along inside my tools · `colleague`: Kollege – dem ich ganze Aufgaben übernehmen lasse / Colleague – I let it take over whole tasks · `team`: Team – mehrere Agenten, die ich steuere / Team – several agents I direct · `factory`: Fabrik – eine KI-Organisation, die für mich läuft / Factory – an AI organisation running for me · `unsure`: Weiß ich noch nicht / Can't say yet. Asked first, before any ladder, so the other answers cannot prime it.
- `baseline.fluency` (single): Wie schätzt du deine KI-Kompetenz ein? / How would you rate your AI fluency? — `beginner`: Einsteiger – kaum Erfahrung mit KI / Beginner – little experience with AI · `basic`: Grundlagen – Chat und einfache Prompts / Basics – chat and simple prompts · `confident`: Sicher – Context Engineering, Workflows / Confident – context engineering, workflows · `advanced`: Fortgeschritten – baue Agenten und Harnesses / Advanced – I build agents and harnesses · `expert`: Experte – Agenten-Systeme betreiben / Expert – run agent systems in production. Each tier names a term people can check themselves against.
- `baseline.scope` (single): Wofür entscheidest du beim KI-Einsatz mit? / What do you have a say in when it comes to AI? — `self`: Eigene Arbeit – nur für mich / My own work – just for me · `team`: Mein Team – wie wir arbeiten / My team – how we work · `unit`: Abteilung – für meinen Bereich / My department – for my area · `org`: Ganze Firma – unternehmensweit / Whole company – company-wide · `open`: Noch offen – kein konkretes Ziel / Still open – no concrete goal. A stand-in for decision and budget power that never asks for a title.
- `baseline.usage` (single): Was ist das Weitreichendste, das du heute mit KI machst? / What's the most advanced thing you do with AI today? — `none`: Noch nichts – habe KI noch nicht genutzt / Nothing yet – haven't used AI yet · `ask`: Chat – Fragen stellen, Texte schreiben lassen / Chat – ask questions, have text written · `documents`: Eigene Unterlagen – hochladen, gemeinsam überarbeiten / My own documents – upload, revise together · `embedded`: In meinen Tools – KI in Office, Mail, Editor / In my tools – AI in office, mail, editor · `delegate`: Aufgaben übergeben – KI erledigt mehrere Schritte / Hand over tasks – AI does several steps · `build`: Eigene Agenten bauen – Workflows für meine Arbeit / Build my own agents – workflows for my work · `orchestrate`: Mehrere Agenten – parallel steuern und orchestrieren / Several agents – run and orchestrate in parallel · `product`: KI-Produkte bauen – für Kunden oder Nutzer / Build AI products – for customers or users. The highest rung someone reaches, so its shares compare with `fluency`'s.
- `onboard-ai-every-time.seen` (single): Hat KI in einem neuen Chat vergessen, was du ihr vorher erklärt hast? / Has AI forgotten, in a new chat, what you explained to it before? — the seen scale
- `onboard-ai-every-time.known` (single): Kanntest du die Idee, KI wie einen neuen Freelancer oder Junior einzuarbeiten? / Did you know the idea of onboarding AI like a new freelancer or junior? — the known scale
- `ai-attention-span.seen` (single): Wurde ein langer Chat irgendwann schlechter, als hätte die KI den Anfang vergessen? / Did a long chat get worse at some point, as if the AI forgot the beginning? — the seen scale
- `ai-attention-span.known` (single): Kanntest du das Kontextfenster, also dass die Aufmerksamkeit der KI begrenzt ist? / Did you know about the context window, that AI's attention is limited? — the known scale
- `ai-gives-you-more-work.seen` (single): Hat dir KI schon mehr Arbeit gemacht als abgenommen, etwa durchs Prüfen und Nacharbeiten? / Has AI ever created more work than it saved you, e.g. checking and reworking? — the seen scale
- `ai-gives-you-more-work.known` (single): Kanntest du: Mit KI wirst du eher Manager als Macher? / Did you know: with AI you become more manager than maker? — the known scale
- `baseline.model_after` (single): Und jetzt: Was ist KI für dich am ehesten? / And now: what is AI most like for you? — the answers of `baseline.model`
- `baseline.shift` (single): Hat sich dein Bild von KI heute verändert? / Has your picture of AI changed today? — `no`: nein / no · `somewhat`: etwas / somewhat · `clearly`: deutlich / clearly
- The seen scale: `often`: oft / often · `sometimes`: manchmal / sometimes · `never`: nie / never · `forgot`: weiß nicht mehr / can't recall · `unused`: nutze das nicht / don't use it
- The known scale: `practice`: ja, und ich arbeite so / yes, and I work this way · `heard`: ja, schon gehört / yes, heard of it · `new`: nein, neu für mich / no, new to me

## Data file

`responses.csv` beside this file holds one row per Event, question and answer: `event_slug,date,locale,poll_version,question,answer,count,respondents`. `respondents` is how many people answered that question, the denominator of its shares. Copying an Event's counts here is the last step of "Add an Event" in `docs/features/events.md`, within 30 days, because a directpoll poll expires 30 days after it was created or last saved; directpoll exports totals per question only. A question nobody answered at an Event gets no rows: `baseline.model_after` has none for the CyberForum Akademie Event (2026-10-28), which had no respondents for it.

So the data carries shares per question, and no more. It tests whether most attendees picture AI as a search engine or a chat (`model`), whether they rate themselves higher than they act (the share of `fluency` at `confident` or above against the share of `usage` at `delegate` or above), and whether each Episode's problem is common and its concept new (`.seen`, `.known`). Two questions it cannot answer in v1: whether a session shifts one person's picture, because no answer is linked to the person who gave it, and which attendees combine an intent with a usage level, because two questions' totals cannot be cross-tabulated; the most they give is a bound, at least `a + b − n` people in both groups. `model_after` reports the stated picture at the end, and `shift` the change people say they noticed.

## Caveats

- A convenience sample: the people who chose to attend one of Han's workshops and chose to answer, about 14 per Event. It describes those audiences, never a workforce; a claim citing this dataset says so.
- Self-report: `fluency`, `.seen` and `.known` record what people say, not what they did; `scope` suggests, never proves, a budget.
- `.known` is asked after the Episode taught the idea, so "I knew it" is inflated and "new to me" is a lower bound; `.seen` is asked right after a Slide showed the problem, which may prime agreement.
- `model_after` and `shift` follow a session that taught the ladder, so they carry demand effects, and they are asked of whoever stayed; compare shares, never counts.
- Anonymous counts only: no answer can be traced to a person, and no two answers to the same person.
