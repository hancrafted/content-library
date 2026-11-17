// The stub documents `drive setup` writes once and never rewrites: the Operator fills them in. Pure: constants.

export const PROFILES_STUB = `# Drive profiles

Project rules that extend the Profiles the \`/drive\` skill ships: the architect's, which the Orchestrator reasons by,
and the implementer's, which every Subagent brief points at. Write only what is specific to this project.

## Architect

## Implementer
`;

/** The shape of `references/fortify.md`'s learnings format: its header and two sections. The format's description
 * stays in that file. */
export const LEARNINGS_STUB = `# Drive learnings

Format: the drive skill's references/fortify.md, "The learnings file".

## Failure modes

## Corrections
`;

/** An empty template: the calibration answers every decision page needs, which the project fills in once. The skill
 * passes the filled file to the page skill, so the page skill skips its own calibration. */
export const REVIEW_STUB = `# Drive review

The calibration answers for every decision page of this project. Fill each section once; /drive passes this file to the
page skill as the caller's inputs, so the page skill asks nothing.

## Mode

## Audience

## Layout

## Depth

## Fidelity

## Feedback route

## Review width
`;
