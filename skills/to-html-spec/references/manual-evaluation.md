# Manual evaluation

## Frozen inputs

Use the [ink handoff](../assets/evals/ink/prompt.md) and [Episode Brief](../assets/evals/episode/prompt.md). Each case has a frozen input, source provenance and hashes in [the manifest](../assets/evals/manifest.json). These are development cases, not a held-out benchmark.

Keep the task text and attachments byte-identical across arms. Supply only the selected skill variant and that case's listed input files as task material. Ordinary tool/safety instructions still apply, but live repository content, later Specs, implementations and previous feedback are not input references. If the agent needs more information, it must expose that gap rather than fetch changing material.

The ink handoff is a labelled reconstruction at a pre-prototype cutoff; its raw user statements are provenance, not extra model input. The Episode input is the original approved Brief, not a later Dossier or Spec. Its research questions remain questions: this case evaluates visual specification, not commissioned research or unsupported historical claims.

## Arms

Keep the canonical skill untouched while preparing copies outside installed-skill discovery. An arm is a copy of the skill folder, including its references, plus a recorded diff. Start fresh sessions in a neutral workspace outside the repository and its `AGENTS.md` routing; copy in the chosen arm and frozen case files. Supply the arm's `SKILL.md` as explicit instructions, with its relative references intact. Keep model, tools and supplied context the same. Load exactly one variant; loading the installed skill as well contaminates the run.

For the first comparison:

- **Reference:** the complete skill.
- **Ablated:** delete only the entire `## Workspace proposal` section from `SKILL.md`, up to the next H2. Everything else, including the simultaneous-review requirement, stays identical.

Record the skill version/hash, exact variant diff, input hashes, model, declared generation settings, clarifications and artifact locations. If clarification is needed, freeze the answer and supply the same answer to the other arm; otherwise flag that comparison as confounded.

The invocation is outside the frozen task text: explicitly load the selected variant, then supply the case's `prompt.md`. Each run receives its own Spec identity and feedback destination, for example `.scratch/to-html-spec-evals/<round>/<arm>/<case>/feedback/01/handoff.md`. Record these operational substitutions; they are not content changes to the task. Save the rendered HTML before feeding feedback back into generation.

Use the same approved checks for both arms and both cases. Evaluate the original generated artifacts, not just versions repaired through feedback. You may compare them in alternating order and hide arm names while recording human judgment; preserve the mapping separately.

## Feedback to learning

1. Save each feedback round verbatim at its run destination. Keep the corresponding HTML and skill variant available. The next run's frozen task receives none of this feedback.
2. Ask an agent to separate instance-specific preferences from general skill behaviour. Preserve links to the original feedback; do not turn one colour preference into a universal requirement.
3. Propose a skill edit and candidate mechanical graders. Han approves both before either becomes the next comparison's reference. A rejected or ambiguous lesson stays recorded, not silently incorporated.
4. Freeze the approved graders for the comparison and rerun both cases. If a grader changes, recheck both arms with that version. Report regressions and confounds; two examples do not establish general quality.

## Mechanical graders

Derive graders from approved general feedback, not an overall agent rating. Each proposal names:

- The originating feedback round and exact quotation.
- The behaviour under test and the public review action that reaches it.
- Explicit setup, input, action and expected observable result.
- A deterministic check using existing tools, its failure evidence and what it cannot judge.
- Its status: proposed, human-approved or rejected, plus the version used.

An approved grader should be executable as a small check when possible. Prove it can fail on the original offending artifact and pass on a corrected one; check the user's symptom, not a proxy such as the mere existence of a textarea. Do not invent a defect if no offending artifact exists: mark that grader unvalidated.

For example, feedback about losing dictated text can yield a check that pastes a fixed multiline string, switches a preview, reloads, exports and compares the resulting string exactly. It does not certify the operating-system dictation tool. A visibility complaint needs a focused-field/visual viewport check and evidence of the useful visual region; a single visible pixel is not the acceptance criterion.

Taste, liquid realism and explanatory quality remain human judgments unless a faithful mechanical observation is available. Record pass/fail for observable checks, needs-human for judgment and unverified for unrun checks. Numerical quality scoring, automated skill rewrites and an external harness are outside this initial loop.
