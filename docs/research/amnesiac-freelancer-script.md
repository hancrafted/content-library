# Amnesiac freelancer: speaker notes and voice script

Draft, English only. Companion to `src/components/episodes/amnesiac-freelancer/amnesiac-freelancer.tsx`. Feeds the context drawer: no drawer exists yet, so this file is the data it will read. Every claim traces to `docs/research/ai-amnesia-mechanics.md` or `docs/research/ai-onboarding-freelancer.md`. "Amnesiac" is our metaphor, not Anthropic's; the string "amnesia" does not appear on the Anthropic page. Gawande and freelancer-practice claims are unverified and are deliberately left out.

Each Slide has two parts. Speaker notes are a short list of talking points, each with a header and description, pointing at the Slide element it explains (`target`, a proposed kebab-case `id` for that element). Voice script is the teleprompter text: time marks, keywords, spoken text, and a bridge to the next Slide.

Proposed target ids are not in the markup yet. Convention: `<slide-slug>--<element>`; columns reuse the existing `data-column` slug.

Section and Slide order: `blank-slate` (2 slides), `onboarding` (3 slides), `where-it-breaks` (2 slides).

---

## Section: blank-slate

### Slide: blank-every-time (BasicPageSlide, 3 min)

#### Speaker notes

1. Header: Stateless by design
   - Description: The model keeps nothing between requests. A chat feels continuous because the whole history is sent again each turn.
   - Target: `blank-every-time--prose`
   - Sources: https://platform.openai.com/docs/guides/conversation-state ; https://platform.claude.com/docs/en/build-with-claude/context-windows
2. Header: Fresh window per session
   - Description: Claude Code says each session begins with a fresh context window. Only CLAUDE.md files and auto memory carry knowledge across.
   - Target: `blank-every-time--prose`
   - Sources: https://code.claude.com/docs/en/memory
3. Header: Shift workers, per Anthropic
   - Description: Anthropic pictures engineers in shifts, each arriving with no memory of the previous shift. Their fix is written artefacts the next session reads first.
   - Target: `blank-every-time--prose`
   - Sources: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
4. Header: Our word, not theirs
   - Description: "Amnesiac" is our metaphor. Say so out loud; do not attribute it to Anthropic.
   - Target: `blank-every-time--caption`

#### Voice script

1. 0:00 to 0:45, "Blank slate"
   - Keywords: stateless, history re-sent, every turn
   - Script: Start with the uncomfortable fact. The model keeps nothing between requests. When a chat feels like a conversation, that is because the whole history is sent again with every turn. Nothing was remembered; it was re-read.
2. 0:45 to 1:45, "New session, new window"
   - Keywords: fresh context window, CLAUDE.md, auto memory
   - Script: Claude Code's own documentation says each session begins with a fresh context window. Only two things cross the gap: instruction files like CLAUDE.md, and notes the agent wrote down. Both are just text loaded at the start.
3. 1:45 to 2:45, "Shifts"
   - Keywords: engineers in shifts, no memory, written artefacts
   - Script: Anthropic describes it as engineers working in shifts, each new one arriving with no memory of the last. I call it an amnesiac freelancer. That word is mine, not theirs, but the mechanism is theirs. And their answer is the same as ours: write it down.
   - Bridge: So if the agent knows nothing about us, where does what it does know come from?

### Slide: where-knowledge-lives (ThreeColumnSlide, 4 min)

#### Speaker notes

1. Header: Training
   - Description: General knowledge up to a cutoff. Your repo, conventions and last Tuesday's decision were never in it. That is our inference; no vendor states it as a sentence, but vendor guidance points to files for exactly this reason.
   - Target: `training`
   - Sources: https://code.claude.com/docs/en/memory ; https://developers.openai.com/codex/memories
2. Header: The session
   - Description: The context window is working memory. Recall degrades as it fills (Anthropic, Chroma). Information in the middle of a long input is used worst (Liu et al., 2023-era models; state the direction, not numbers).
   - Target: `session`
   - Sources: https://research.trychroma.com/context-rot ; https://arxiv.org/abs/2307.03172 ; https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
3. Header: Files
   - Description: CLAUDE.md and AGENTS.md are loaded as text at the start. A project-root CLAUDE.md is re-read from disk after /compact; instructions given only in chat can be lost.
   - Target: `files`
   - Sources: https://code.claude.com/docs/en/how-claude-code-works ; https://code.claude.com/docs/en/memory
4. Header: Compaction is lossy
   - Description: Anthropic warns aggressive compaction can drop subtle but critical context. The research did not quantify the loss.
   - Target: `session`
   - Sources: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

#### Voice script

1. 0:00 to 1:00, "Training"
   - Keywords: cutoff, never saw your repo
   - Script: First place: training. It is broad and it stops at a cutoff date. It never saw your repository, your naming rules, or the decision you made last Tuesday. To be fair, that is my framing rather than a vendor quote, but every vendor tells you to put project context in files, and that is why.
2. 1:00 to 2:30, "The session"
   - Keywords: working memory, context rot, middle
   - Script: Second place: the session. The context window is the agent's working memory. Anthropic and an independent report from Chroma both find that recall gets worse as it fills. And the Lost in the Middle paper found that what sits in the middle of a long input is used worst. That study used older models, so take the direction, not the numbers.
3. 2:30 to 3:30, "Files"
   - Keywords: CLAUDE.md, AGENTS.md, compaction, re-read from disk
   - Script: Third place: files. This is the only one you control. CLAUDE.md and AGENTS.md are loaded as text at the start. After a compaction, the project-root CLAUDE.md is read from disk again, while something you only said in chat may be gone.
   - Bridge: So files are the lever. Next: what goes in them. Think of it as onboarding.

---

## Section: onboarding

### Slide: brief-and-rules (ThreeColumnSlide, 4 min)

#### Speaker notes

1. Header: The brief
   - Description: Anthropic: "Think of Claude as a brilliant but new employee who lacks context on your norms and workflows." Be explicit; "above and beyond" must be requested, not inferred.
   - Target: `brief`
   - Sources: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
2. Header: House rules
   - Description: A file read at the start of every conversation: commands, code style, workflow rules. agents.md calls it a "README for agents"; the nearest file wins.
   - Target: `house-rules`
   - Sources: https://code.claude.com/docs/en/best-practices ; https://agents.md
3. Header: Definition of done
   - Description: Give the agent a way to verify its work: tests, scripts, screenshots. Also GitHub: say how to build and validate so the agent need not search each time.
   - Target: `definition-of-done`
   - Sources: https://code.claude.com/docs/en/best-practices ; https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
4. Header: Colleague test
   - Description: Show your prompt to a colleague with minimal context; if they would be confused, Claude will be too.
   - Target: `brief`
   - Sources: https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct

#### Voice script

1. 0:00 to 1:00, "The brief"
   - Keywords: brilliant new employee, explicit, colleague test
   - Script: Anthropic itself uses this frame: a brilliant but new employee who lacks context on your norms and workflows. So write the brief like that. Task, constraints, format. And try the colleague test: hand it to someone with no context. If they would be confused, so will the agent.
2. 1:00 to 2:30, "House rules"
   - Keywords: README for agents, every conversation, commands
   - Script: House rules live in a file the agent reads at the start of every conversation. Build and test commands, code style, workflow rules. The agents.md site calls it a README for agents. And the closest file to the code wins, like asking the old hand in that corner of the codebase.
3. 2:30 to 4:00, "Definition of done"
   - Keywords: verify its work, tests, scripts
   - Script: The third item matters most. Give the agent a way to verify its work. A test it can run, a command that must pass. Without that it cannot tell whether it is done, and neither can you.
   - Bridge: Now the temptation: put everything in. Why that backfires.

### Slide: keep-it-short (BasicPageSlide, 3 min)

#### Speaker notes

1. Header: Bloat gets ignored
   - Description: Anthropic: "Bloated CLAUDE.md files cause Claude to ignore your actual instructions." Pruning test: would removing this line cause mistakes?
   - Target: `keep-it-short--prose`
   - Sources: https://code.claude.com/docs/en/best-practices
2. Header: Numbers to cite
   - Description: Under 200 lines per CLAUDE.md file (Anthropic). GitHub's template caps instructions at 2 pages.
   - Target: `keep-it-short--prose`
   - Sources: https://code.claude.com/docs/en/memory ; https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions
3. Header: Minimal is not short
   - Description: "Minimal does not necessarily mean short": the smallest set that fully outlines the behaviour. Prefer pointers loaded on demand over pastes. Imports do not save context.
   - Target: `keep-it-short--caption`
   - Sources: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents ; https://code.claude.com/docs/en/memory

#### Voice script

1. 0:00 to 1:00, "More is worse"
   - Keywords: bloated, ignore, 200 lines
   - Script: The instinct is to write the complete handbook. Anthropic's advice is the opposite: bloated CLAUDE.md files cause Claude to ignore your actual instructions. Their guideline is under 200 lines per file, and GitHub caps its own template at two pages.
2. 1:00 to 2:00, "Prune"
   - Keywords: would removing this cause mistakes, pointers
   - Script: Use the pruning question: would removing this line cause a mistake? If not, cut it. And point instead of paste: a path the agent can open when it needs it costs nothing until then.
3. 2:00 to 3:00, "Minimal is not short"
   - Keywords: minimal set, sufficient
   - Script: One caution from Anthropic. Minimal does not mean short. It means the smallest set that fully outlines what you expect. Enough, not everything.
   - Bridge: One kind of content always earns its place: the why behind decisions.

### Slide: decisions-in-writing (BasicPageSlide, 3 min)

#### Speaker notes

1. Header: A conversation with a future developer
   - Description: Nygard's rule for decision records. Short prose, one or two pages.
   - Target: `decisions-in-writing--caption`
   - Sources: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
2. Header: Superseded, not deleted
   - Description: A reversed decision is kept and marked superseded.
   - Target: `decisions-in-writing--prose`
   - Sources: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
3. Header: The newcomer's two bad options
   - Description: Without the record, the newcomer must blindly accept or blindly change a decision.
   - Target: `decisions-in-writing--prose`
   - Sources: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
4. Header: Mapping, not a sourced claim
   - Description: That an agent reads the same record is our mapping. No vendor page quoted says so.
   - Target: `decisions-in-writing--prose`

#### Voice script

1. 0:00 to 1:00, "Why it was done"
   - Keywords: Nygard, future developer
   - Script: Michael Nygard wrote decision records for exactly this person: someone who arrives later. His rule: write each one as if it is a conversation with a future developer. One or two pages, plain prose.
2. 1:00 to 2:00, "Superseded"
   - Keywords: keep the old one, mark superseded
   - Script: When you reverse a decision, keep the old record and mark it superseded. Without any record, the newcomer has two bad options: accept the decision blindly, or change it blindly.
3. 2:00 to 3:00, "Our agent arrives later, every time"
   - Keywords: record is the memory
   - Script: Our freelancer is always the newcomer. That is my mapping, not a vendor claim, but it follows: for someone who arrives later every single time, the written record is the only memory they can read.
   - Bridge: We have a decent onboarding package. Now where the freelancer picture misleads us.

---

## Section: where-it-breaks

### Slide: metaphor-breaks (ThreeColumnSlide, 4 min)

#### Speaker notes

1. Header: No learning
   - Description: A freelancer improves by week three unprompted. A fresh session starts from files alone. Auto memory narrows the gap but it is saved notes loaded at start, not learning.
   - Target: `no-learning`
   - Sources: https://code.claude.com/docs/en/memory
2. Header: Context, not enforcement
   - Description: "Claude treats them as context, not enforced configuration." Hard rules need hooks, permissions or checks.
   - Target: `not-enforced`
   - Sources: https://code.claude.com/docs/en/memory
3. Header: Reading costs
   - Description: The agent pays for every line at every session start, and "performance degrades as it fills". Curate and prune.
   - Target: `reading-costs`
   - Sources: https://code.claude.com/docs/en/best-practices
4. Header: Beyond the sources
   - Description: Silent conflicts between rules (nearest file wins, root-down concatenation) are mechanical, not negotiated. Over-compliance is our inference, not a vendor claim.
   - Target: `not-enforced`
   - Sources: https://agents.md ; https://developers.openai.com/codex/guides/agents-md

#### Voice script

1. 0:00 to 1:15, "No learning"
   - Keywords: week three, saved notes
   - Script: First break: a freelancer gets better by week three without being told. The agent does not. Auto memory helps, but it is saved notes loaded at the start, not learning. Anything unwritten is gone.
2. 1:15 to 2:45, "Not enforced"
   - Keywords: context, hooks, checks
   - Script: Second: instructions are context, not enforced configuration. That is Anthropic's wording. Prose is a request. Anything that must always hold belongs in a check or a hook.
3. 2:45 to 4:00, "Reading costs"
   - Keywords: every line, every session
   - Script: Third: reading is not free. A human skims the handbook once. The agent pays for every line at the start of every session, and quality falls as the window fills. So prune.
   - Bridge: That second point has a practical consequence: who checks the work.

### Slide: enforce-and-verify (BasicPageSlide, 3 min)

#### Speaker notes

1. Header: Verification you can run
   - Description: "If you can't verify it, don't ship it." Tests, scripts, screenshots.
   - Target: `enforce-and-verify--prose`
   - Sources: https://code.claude.com/docs/en/best-practices
2. Header: A different grader
   - Description: A fresh-context reviewer, "so the agent doing the work isn't the one grading it". The source supports the practice, not any claim about the agent's psychology.
   - Target: `enforce-and-verify--caption`
   - Sources: https://code.claude.com/docs/en/best-practices
3. Header: Independent of prose
   - Description: Checks are the one part that does not depend on the agent reading and obeying text.
   - Target: `enforce-and-verify--prose`
4. Header: Close
   - Description: Write it down, keep it short, make it checkable.
   - Target: `enforce-and-verify--title`

#### Voice script

1. 0:00 to 1:00, "Prove it"
   - Keywords: verify, tests, don't ship
   - Script: Give the agent commands that prove the work. Anthropic is blunt: if you can't verify it, don't ship it.
2. 1:00 to 2:00, "Another pair of eyes"
   - Keywords: fresh-context reviewer
   - Script: And bring in a reviewer with fresh context, so the agent doing the work isn't the one grading it. I would not claim to know why an agent over-trusts itself; the practice is what the source supports.
3. 2:00 to 3:00, "Wrap up"
   - Keywords: write down, short, checkable
   - Script: Three things to take away. Write it down, because nothing carries over otherwise. Keep it short, because attention is finite. Make it checkable, because prose is only a request.
   - Bridge: End of Episode. Invite the viewer to try this on one repository this week.
