# Maintaining Markdown for AI: Speaker Notes and Voice Script

> Raw manuscript transcribed from coaching-content/src/maintaining-markdown-for-ai/index.html

## Beat S1.1 (Section 1: Intro)

**Assertion**: Intro

### Speaker Notes

This talk opens with an onboarding analogy rather than with markdown because most enterprise audiences still imagine AI as a conversational chatbot, not an autonomous agent reading local files unprompted. Anchoring on handing documents to a new starter borrows intuition the room already possesses, bypassing claims about AI workflows they cannot yet verify.

That setup exposes the core asymmetry: while a human reader eventually notices discrepancies in a stale document and self-corrects, an AI reads every file fresh. It has no mechanism to sense obsolescence and will act on outdated guidance identically the hundredth time and the thousandth time.

This creates the cost inversion underlying the entire presentation. Authoring documentation used to be the expensive half; AI made drafting nearly free, while verification became far more demanding as volume exploded. Because verifying truth requires domain judgment, it cannot be automated away — leaving the verifying half as the responsibility of whoever owns the documents. Section 01 establishes these stakes before Section 02 broadens the scope across every context type an AI consumes.

### Voice Script

Welcome. Before we start — imagine you're onboarding a new colleague. A freelancer, a consultant, whoever. You hand them a list of documents and tell them to read up.

Now: some of those documents were written a year ago and went out of date six months ago.

A human gets suspicious eventually. They notice something doesn't match, they ask someone, they self-correct.

Your AI never does. It reads that file fresh every time, with no way of knowing it's stale — and it will confidently act on it the hundredth time and the thousandth time, exactly as it did the first.

(pause)

Writing documentation used to be the expensive half. AI made it nearly free. Checking whether it's still true got more expensive, because now there's far more of it.

And that half doesn't get automated. It's nobody else's job.

Maintain markdown for AI. I'm Han Che — let's get into it.

Four engineered lines, keep verbatim: the "your AI never does" contrast; "the hundredth time and the thousandth time"; the cost inversion; "it's nobody else's job."

"doesn't get automated", never "isn't automated yet."

Do not say "markdown" in the first thirty seconds. Format word is earned after problem is felt.

No hedging frame. Go straight from thesis to title.

Say the name. Permanent YouTube reference.

Target 60–75 seconds.

---

## Beat S2.1 (Section 2: Markdown in AI workflows)

**Assertion**: A single format carrying three of the six context types: Knowledge, Instructions, and Memory.

### Speaker Notes

While section 01 established the stakes without naming the format, this section introduces it and widens the scope from a static wiki to everything an AI reads. For an audience that still pictures AI as a 2023 chatbot you paste text into, the concept of a document warning an agent is unintelligible. Today’s agents read and write local files, invoke external tools, search the web, and execute tasks iteratively in loops.

In this environment, markdown’s importance lies not in syntax or formatting quirks, but simply as a plain text file defined by how and when it is consumed. Those files divide into three core patterns: knowledge, retrieved on demand only when a task requires it; instructions or skills, codified once and triggered by name; and memory, loaded automatically at the start of every session.

Memory serves as the closer because it carries the quietest failure mode: an obsolete memory file is accepted as fact across every single interaction, silently and invisibly to the operator. That compounding surface creates the volume crisis quantified in section 03.

### Voice Script

Before we start, I want to establish why markdown files matter so much in AI workflows.

We're in the agentic era now — it isn't 2023 anymore. Agents aren't chatbots you copy-paste into. They read files on your machine, write files, call tools, search the web. Put those in a loop and they carry out real tasks, the way the new colleague you just onboarded would.

And like that colleague, an agent needs the right information at the right time. That information lives in markdown — which is just a plain text file.

Those files fall into three categories.

Knowledge — what the agent looks up on demand, when the task calls for it. You don't hand a new starter everything on day one.

Instructions — skills. How to do a release, step by step. Written once, called by name.

And memory. Not ChatGPT's memory — a file the agent reads at the start of every single conversation.

(pause)

And if that file is stale, or wrong, the agent reads that wrong information every single time. Confidently, and silently — without you ever noticing.

(pause)

And that's one document.

Beat of separation between the three category names.

Load-bearing pause before memory closer.

"Silently, without you ever noticing" — keep phrasing.

Name "skills" explicitly in its own half-sentence.

Keep day-one anchor on knowledge category.

Do not explain markdown features (headers, tables, frontmatter).

Do not re-explain onboarding analogy (one-clause callback only).

Target 90 seconds.

"And that's one document" bridges into section 03.

---

## Beat S3.1 (Section 3: Volume outruns review)

**Assertion**: On one document, maintenance effort decays while drift climbs — that crossing is where the work moved. Across a corpus, the maintenance surface grows faster than the file count.

### Speaker Notes

Taking the single stale document from section 02, this section scales the problem first through time and then across an entire corpus. Long before AI, enterprise knowledge management struggled with this exact dynamic. The left chart illustrates why: after an initial spike of authoring effort, investment plunges while drift climbs. Nobody budgets for ongoing maintenance—it is never in the plan, which produces this decay curve rather than anyone being at fault.

The right chart shows why scaling is not simply more of the same. While files accumulate steadily, the verification burden does not track document count: every document makes claims about and references to others, compounding into an interlocking web where every claim must be validated against every other.

Establishing that knowledge management was always structurally hard makes the core realization clear: AI did not create this dilemma, but removed the constraint holding it in check. Writing was the historical brake and the human was the bottleneck; now that this brake is gone, volume completely outruns review.

### Voice Script

And that's one document.

There's a reason knowledge management was always hard in enterprise — long before any of this. And it's this shape.

One document, over time. The blue line is effort. There's a spike at the start, when someone writes it. At least, that's how it used to be — with AI, creating a document now costs almost nothing.

After that, effort drops. Because nobody budgets for maintenance. It's never in the plan.

(pause)

And as effort drops, drift climbs. The document is still sitting there. It's just quietly stopped being true.

Now scale that. Your documents don't arrive one at a time — they accumulate, steadily.

And you're not just verifying each file. You're verifying every claim each file makes about the others. Every reference. That compounds.

(pause)

So here's what changed. Writing was the brake. The human was the bottleneck — you could only produce documentation as fast as someone could write it, and that held the whole thing in check.

That brake is gone.

Claim before chart. Name what chart shows before walking it.

Pause before "drift climbs" is load-bearing.

"That brake is gone" gets trailing silence.

Verbatim lines: "it's quietly stopped being true", "every claim each file makes about the others", and the brake close.

Say maintenance-budget point once.

No chart vocabulary on corpus side (accumulate steadily).

Do not restate cost inversion from section 01.

Do not hedge close. Stated flat.

Target 75 seconds.

---

## Beat S4.1 (Section 4: Where the effort goes)

**Assertion**: What a machine can check, what AI can help with, and what only a human can check.

### Speaker Notes

Section 03 ended on a loss: writing was the historical brake holding documentation sprawl in check, and that brake is gone. This section answers the immediate question that creates: what does it actually take to verify a document? The answer is that verification is not one job, but three non-interchangeable tiers ordered strictly by cost and certainty—from cheap and deterministic at one end to expensive and human at the other.

Machine checks are deterministic, cheap, fast, and binary: they validate metadata shape, parse dates, and resolve links. Their ceiling is confirming that a field exists, never whether its contents are true. In contrast, AI operates in natural language on the non-deterministic side, consuming tokens to generate signals. It traverses references and flags contradictions—such as differing lead times—raising targeted tickets that narrow what a human must inspect.

Ultimately, only human judgment supplies the ground truth neither tooling can provide, because the human owns the operational process and remains accountable when it fails. The machine narrows it, the AI narrows it further, and what is left was always yours.

### Voice Script

So the brake is gone. Which raises the obvious question: what does it actually take to check a document?

It's not one job. It's three, and they're not interchangeable.

On the left, the machine. Deterministic — same input, same answer, every time. Binary: it passes or it fails. Cheap, and fast. This is the part you want doing as much as possible.

On the right, the human. Not deterministic, slow, expensive. This is where the semantic work happens — is this actually true, is it still useful. And it's still where almost all trust comes from.

And in the middle, AI. It works in natural language, so it sits on the human side of that line — not deterministic. It costs tokens. What it can and can't be trusted with is genuinely unsettled.

(pause)

Left to right. Cheap and certain, to expensive and human. Let's take them in order.

---

## Beat S4.2 (Section 4: Where the effort goes)

**Assertion**: What the machine verifies

### Speaker Notes

Machine verification is deterministic, cheap, fast, and binary: the same input yields the exact same answer every time. It validates the shape of metadata—confirming required fields are declared, dates parse, and links resolve. Its hard ceiling is that it proves mechanical integrity, never whether the underlying content is true.

### Voice Script

Start with the low-hanging fruit. What can a machine check, every time, for free?

Here's a markdown file — an onboarding process. At the top, the frontmatter: key-value pairs in YAML that carry metadata, mostly for the machine and the agent. Underneath, the body.

A machine can check the shape of that metadata. Is the type declared. Is the date a real date. Is the link well-formed — and it can even follow it and see if it's still there.

And that's the ceiling. It can tell you the field exists. It can't tell you whether what's written in it is true.

---

## Beat S4.3 (Section 4: Where the effort goes)

**Assertion**: What AI accelerates

### Speaker Notes

Operating in natural language on the non-deterministic side, AI costs tokens but delivers essential signals. It traverses cross-references, compares documents, and flags contradictions—such as differing lead times. These signals dramatically narrow what a human must examine, raising focused tickets rather than demanding manual re-reads.

### Voice Script

So what does AI add?

It can follow that reference. Read the document on the other end. And notice that this one says five days and that one says seven.

That's a contradiction it found on its own — and what it does with it matters more than finding it. It can flag that one section and raise a ticket, so a human resolves a single line instead of re-reading the document.

Those are signals. Every signal narrows what a human actually has to look at.

(pause)

But can it make the call? It can produce one. It's like stopping someone in the street, handing them both documents, and asking which is right. You'll get an answer.

If you own this process — would you trust that person?

---

## Beat S4.4 (Section 4: Where the effort goes)

**Assertion**: What remains human

### Speaker Notes

Human verification supplies the critical judgment neither syntax checks nor language models can provide, because only the human owns the process and bears accountability when it fails. The machine narrows it, the AI narrows it further, and what is left was always yours.

### Voice Script

Which leaves this.

Is the coffee thing still how the team works. Is this person still the owner.

No amount of tooling answers those. You have to know — and you're the one accountable when it's wrong.

(pause)

The machine narrows it. The AI narrows it further. What's left is the part that was always yours.

Seam between 04.3 & 04.4: Street analogy ends on a question and nothing answers it on that slide. Ask it, stop, change slide.

Say nothing about human judgment before slide 04.4.

"What's left is the part that was always yours" — keep phrasing.

Two frontmatter examples, not six.

Define non-deterministic once on 04.1.

Ticket example belongs on 04.3 before analogy.

Do not close on a comparison.

No hedges on judgment claim.

Target three minutes across four slides.

---

## Beat S5.1 (Section 5: Google OKF)

**Assertion**: Full OKF v0.2 frontmatter schema governing provenance, trust, and lifecycle.

### Speaker Notes

Section 04 drew the boundary between machine, AI, and human judgment. This section returns to the machine column and asks how to expand it. A machine operates on structure, and automated verification only functions when teams agree on what metadata fields exist and what they mean. Without shared agreement, no universal checker can be written; every team invents bespoke conventions and nothing composes.

Google’s Open Knowledge Format (OKF) is an open standard for markdown frontmatter. Currently in version 0.2 and actively evolving, it standardizes basic metadata (type, title, description, sources) alongside critical trust and lifecycle contracts: pairing generated by an agent with verified by a human, and defining stale_after dates.

Adopting a shared standard rather than internal convention allows verification tooling to be authored once and executed across any repository—the architectural foundation for section 06.

### Voice Script

The machine finds structure. The AI adds a first layer of meaning, to help a human decide faster. And what's left was always yours.

So let's go back to the machine half, and ask how we make it bigger.

A machine works on structure. Which means it only works if we agree on a shared vocabulary.

This is Google's Open Knowledge Format. It's open, and it's early — version 0.2, still moving.

It names the fields, and says what each one means. Some you've already seen — type, title, description, sources. And the interesting ones: trust, and lifecycle. That a document was generated by an agent, and verified by a human. And stale_after — freshness.

(pause)

If we all agree to use the same vocabulary, the checker gets written once. And it works everywhere.

Which makes the machine's half a lot bigger than checking that a date is a date.

"Generated by an agent, verified by a human" is the line to keep.

Say the version number (v0.2).

Do not say "design by contract".

Say "structure" once.

Last line is handoff into 06 and must not resolve.

Do not describe OKF as "governing frontmatter for AI usage".

Target 65 seconds.

---

## Beat S6.1 (Section 6: Steering the AI)

**Assertion**: markdown-harness steers the machine half

### Speaker Notes

Section 05 closed with the challenge of expanding the machine column beyond simple syntax and date validation. This slide presents markdown-harness as an implementation of that expanded boundary. The core principle of the tool is that a document can tell you how much of itself to believe. Rather than attempting to manufacture semantic trust—a quality no automated system can produce—it establishes an operational floor by emitting reliable, deterministic signals whenever an agent or a human needs to intervene.

The visual layout is a deliberate callback to the three-circle model introduced in section 04. While the earlier diagram mapped where verification effort concentrates, this version illustrates how the tooling operates across those same boundaries. The directional steer arrow indicates fast, cheap, deterministic signals injected into the AI runtime to improve contextual judgment—the machine column actively steering the AI column. Crucially, the human circle is greyed out not because human oversight is solved or trivial, but because the tool intentionally stops before it. It treats the section 04 boundary as a permanent design constraint.

### Voice Script

So the goal is to make the machine's half do more. And this is what I've been building, in my own time, over the past couple of weeks. I call it markdown-harness.

The idea is one sentence: a document can tell you how much of itself to believe.

It's not about generating trust. Trust is semantic — a machine can never produce it. What it can do is raise the floor. Reliable signals, that tell an agent or a human that something needs attention.

You've seen these three circles before. Same three, different job — this time it's what the tool does to them.

Deterministic, cheap, fast signals, handed to the AI while it's working. The machine column reaching into the AI column. That's the arrow.

(pause)

And the human side is greyed out on purpose. Not because it's solved. Because this doesn't go there. That part was always yours.

---

## Beat S6.2 (Section 6: Steering the AI)

**Assertion**: One mechanism, three triggers, one deterministic core

### Speaker Notes

The architecture connects three entry points to three corresponding outcomes through a single shared engine. Regardless of how it is invoked, the core executes two discrete steps: retrieving configuration and running deterministic validation logic. Given identical inputs, it produces identical evaluations every time.

Three triggers invoke this pipeline. The most critical for this presentation—and the focus of the upcoming live demonstration—is the AI runtime, where an agent attempting to read a file receives immediate notice of staleness before consuming the content. Second is commit time, where a pre-commit check evaluates frontmatter against open standards like OKF to pass or block incoming changes. Third is asynchronous scheduling, executing nightly to regenerate derived indexes or raise tickets for stale content. Determinism here is not a buzzword; invariant behavior in the middle is what makes the resulting signals dependable enough for autonomous agents.

### Voice Script

Three ways in. Three ways out. And the middle is the same every time.

Whatever starts it, the core does one thing: read the configuration, run the logic. Same input, same answer. It's fully deterministic.

The one I want to show you is the first. The agent goes to read a file — and before it does, it's told that file is stale.

The other two, briefly. On commit: a check that the frontmatter meets the standard. It passes, or it blocks.

And on a schedule: a nightly run that regenerates what can be regenerated, and raises a ticket on what can't.

Let me show you the first one.

Say the line: "A document can tell you how much of itself to believe" is on the slide and must be said aloud.

Name the diagram as a callback: The three circles are the section 04 shape with different semantics.

Name the grey circle, and say why: The tool deliberately does not reach the human side.

Do not lead with "100% deterministic": Lead with plain language (three ways in, three ways out, middle is the same).

Cut "pretty much self-explanatory" and "pretty simplistic in a sense".

Keep the runtime example short: The agent goes to read a file, and before it does, it's told the file is stale.

Commit trigger — pick one framing: Describe it simply as a gate that blocks or passes.

"In my own time, over the past couple of weeks" stays.

Target 100 seconds combined across 06.1 and 06.2.

---

## Beat S6.3 (Section 6: Steering the AI)

**Assertion**: The check, run live

### Speaker Notes

The demonstration runs three terminal panels side by side against an identical onboarding prompt and document; the only independent variable is what each agent is permitted to know. The un-hooked agent reads raw markdown, while the hooked panels either inject steering instructions or deny access entirely.

The central thesis of the demo is determinism versus probability, rather than simple catches versus misses. An un-hooked model might occasionally spot a stale timestamp on its own—especially larger reasoning models—but unassisted detection remains a matter of luck. In contrast, the harness guarantees enforcement on every execution across all models, proving the section 04 machine boundary in practice. For visual clarity in a terminal, the injection tells the agent to respond in pirate—providing unmistakable visual evidence rather than a novelty. Furthermore, runtime logs record staleness deterministically regardless of model output. Crucially, modern models occasionally flag steering prompts as injection attacks and report ignoring them—an acknowledged, open research challenge for runtime document governance.

### Voice Script

Fixed set-up line (say before switching to terminal)

“Three panels. Same question, same document. The only difference is what each one is allowed to know.”

Beats in order (do not read verbatim)

Before the run: Deliver the set-up line above so the room knows what contrast to watch for.

While it runs: Name what the un-hooked panel is doing: answering confidently from a document that went out of date. Nothing on screen says the file is stale; say it aloud.

The un-hooked result: If it noticed the date, say so plainly. Point out that un-hooked detection is luck—it depends on the model and whether it parsed frontmatter. That is the core argument, not a flaw.

The injected panel: The pirate response is proof the steering injection landed. State what it demonstrates: the harness governed what the agent was allowed to know.

The deny panel: Clearest outcome for a non-technical room—read was refused and the agent explicitly says so.

The log: Highlight deterministic detection recorded in the log, independent of what any model chose to say.

The config and the document: Show config and source only after the run, never before. Effect first, cause second.

The injection finding: State the open finding honestly—models sometimes spot injected instructions and report ignoring them. Frame this unsolved problem as an open invitation.

Record a backup run and cue it: Talk is recorded; running live with recording cued provides safety without dead air.

Measured length ~3m 30s (~210s) against 5-minute budget, preserving 90 seconds of buffer.

Cut the raw command output: Technical audience understands the concept; raw output risks disengaging others.

Do not claim un-hooked panel will miss staleness: It might catch it; the claim is that un-hooked is luck while hooked is guaranteed.

Pirate response is evidence, not comedy: Land the factual implication first; the pirate phrasing is verification that injection occurred.

---

## Beat S6.4 (Section 6: Steering the AI)

**Assertion**: Three shipped, three planned

### Speaker Notes

[PROVISIONAL]

Say the version number out loud. It is v0.0.4, and the left column is all that exists — three checks. Be explicit that the right column is not built yet.

Do not soften this into "and we're also working on". If anyone leaves thinking drift detection ships today, the rest of the talk is worth less.

### Voice Script

_(None)_

---

## Beat S8.1 (Section 7: The verifying half is yours)

**Assertion**: Back to the Venn, with the human region lit and the rest dimmed. Nothing new to read.

### Speaker Notes

This slide marks the third appearance of the three-circle diagram. Across the talk, the geometry remained constant while emphasis shifted: section 04 mapped verification costs, 06.1 showed markdown-harness steering the AI region while stopping before the human boundary, and here the human circle carries the weight. The talk concludes on one image changing.

Machines verify structure, AI accelerates drafting, and the remaining work belongs to human judgment. That is not a failure of tooling; it is where accountability always resided, now visible because generation became cheap. The hypothesis line is highlighted because the AI region remains an unsettled thesis, proven when the demo model detected the steering injection. Finally, the repository link is an invitation rather than a product pitch. The talk succeeds when the maintenance problem is understood, regardless of whether the tool is adopted.

### Voice Script

This is the third time you've seen this picture.

First as what verification costs. Then as what the tool does — reaching into the middle, and stopping at the edge of the human.

Same three circles. All that's changed is which one is dark.

(pause)

Machines check structure. AI accelerates. And the work moved — to the part that was always yours.

One thing I want to be straight about. The middle region is my hypothesis. How much an agent can be trusted with is not settled — you saw that in the demo, when the model spotted my injection and told me it was ignoring it. That's an open problem.

The tool's here if you want it. It's early.

Thank you.

Name the repetition: "The third time you've seen this picture" is what converts three slides into one argument.

The pause before the claim: This is the last pause in the talk; let it sit.

"The part that was always yours": Fourth and final statement of the through-line. Do not vary phrasing.

Say the hypothesis out loud: Name the demo failure as evidence. Open problem, stated flat.

"It's early" is the whole pitch: No adoption ask, no roadmap tease.

End on "thank you" and stop: Recorded, no Q&A—nothing follows.

Target 50 seconds.

---
