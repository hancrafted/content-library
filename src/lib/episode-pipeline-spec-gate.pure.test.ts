import { describe, expect, it } from 'vitest';
import { checkPipeline, type PipelineContext } from './episode-pipeline.pure';

/*
 * The Specification Stage's shape (design-ADR-0011), checked through the
 * pipeline schema check: a small Dossier → Spec → Build pipeline that passes,
 * then one change per test that breaks one rule of the Spec Gate.
 */

const STAGING = 'docs/episodes/demo';

const CONTEXT: PipelineContext = {
  skillFolder: 'skills/new-episode',
  skills: [],
  disabled: [],
  exists: () => true,
  staging: STAGING,
  perRun: false,
  governs: () => true,
};

const PIPELINE = `status: draft
stages: [dossier, specification, build]
jobs:
  - id: write-voice-script
    stage: dossier
    needs: []
    before: [mh-query]
    outputs: [${STAGING}/dossier.md]
    checks: [mh]
    retries: 2
    agents:
      - { type: implementor, skills: [], references: [], model: inherit }
  - id: write-spec
    stage: specification
    needs: [write-voice-script]
    outputs: [${STAGING}/spec/spec.html]
    checks: [vitest]
    retries: 2
    gate: human
    agents:
      - { type: implementor, skills: [], references: [], model: opus, session: orchestrator }
  - id: implement-episode-init
    stage: build
    needs: [write-spec]
    outputs: []
    checks: [verify]
    retries: 2
    agents:
      - { type: implementor, skills: [], references: [], model: opus }
`;

const DESIGN_SPEC_JOB = `  - id: write-design-spec
    stage: specification
    needs: [write-spec]
    outputs: [${STAGING}/spec/design-spec.html]
    checks: []
    retries: 0
    agents:
      - { type: implementor, skills: [], references: [], model: opus, session: orchestrator }
`;

/** A template commit, as a per-run pipeline's `template` names it. */
const SHA = '6426e9c5b0c0f0e1d2a3b4c5d6e7f8091a2b3c4d';

/** The pipeline with a write-design-spec job between write-spec and Build, as the old template had it. */
function withDesignSpec(yaml: string): string {
  return yaml
    .replace('  - id: implement-episode-init', `${DESIGN_SPEC_JOB}  - id: implement-episode-init`)
    .replace('    needs: [write-spec]\n    outputs: []', '    needs: [write-design-spec]\n    outputs: []');
}

function check(yaml: string, context: PipelineContext = CONTEXT): string[] {
  return checkPipeline('pipeline.yml', yaml, context).map(({ message }) => message);
}

describe('success cases', () => {
  it('finds nothing in a pipeline whose write-spec gates the Spec page and whose Build needs it', () => {
    // ARRANGE
    const yaml = PIPELINE;
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual([]);
  });
});

describe('failure cases', () => {
  it('rejects a write-design-spec job, whose work write-spec does now', () => {
    // ARRANGE
    const yaml = withDesignSpec(PIPELINE);
    const expected = [
      'Job "write-design-spec" is retired; write-spec designs the Slides and writes the one Spec page (design-ADR-0011).',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a gated write-voice-script, whose Voice script Han reviews in the Spec', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('    retries: 2\n    agents:', '    retries: 2\n    gate: human\n    agents:');
    const expected = [
      'Job "write-voice-script" has gate: human; the Voice script is reviewed with the Spec, so it has no Gate of its own.',
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('rejects a write-spec without a Gate and one that does not write the Spec page', () => {
    // ARRANGE
    const ungated = PIPELINE.replace('    retries: 2\n    gate: human\n', '    retries: 2\n');
    const elsewhere = PIPELINE.replace(`[${STAGING}/spec/spec.html]`, `[${STAGING}/spec/spec.md]`);
    const expectedUngated = ['Job "write-spec" lacks gate: human; Han approves the Spec at its Gate.'];
    const expectedElsewhere = [
      `Job "write-spec" does not write ${STAGING}/spec/spec.html; the Spec page is its output.`,
    ];
    // ACT
    const ungatedMessages = check(ungated);
    const elsewhereMessages = check(elsewhere, { ...CONTEXT, governs: () => true });
    // ASSERT
    expect(ungatedMessages).toEqual(expectedUngated);
    expect(elsewhereMessages).toEqual(expect.arrayContaining(expectedElsewhere));
  });

  it('rejects a Build init job that does not need write-spec', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '    needs: [write-spec]\n    outputs: []',
      '    needs: [write-voice-script]\n    outputs: []',
    );
    const expected = ['Job "implement-episode-init" does not need "write-spec"; Build starts from the approved Spec.'];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expect.arrayContaining(expected));
  });

  it('rejects a job after the Spec Gate that reads the Dossier, which the Gate deletes', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '      - { type: implementor, skills: [], references: [], model: opus }\n',
      `      - { type: implementor, skills: [], references: [${STAGING}/dossier.md], model: opus }\n`,
    );
    const expected = [
      `Job "implement-episode-init" reads ${STAGING}/dossier.md, which the Spec Gate deletes; after it every job reads the Spec alone.`,
    ];
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual(expected);
  });

  it('applies the Spec Gate to a draft per-run pipeline, the copy scaffold-pipeline makes of the template', () => {
    // ARRANGE
    const yaml = PIPELINE.replace('status: draft', `status: draft\ntemplate: ${SHA}`).replace(
      '    retries: 2\n    gate: human\n',
      '    retries: 2\n',
    );
    const expected = ['Job "write-spec" lacks gate: human; Han approves the Spec at its Gate.'];
    // ACT
    const messages = check(yaml, { ...CONTEXT, perRun: true });
    // ASSERT
    expect(messages).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('leaves an approved per-run pipeline its own Specification Stage, so a Run in flight keeps working', () => {
    // ARRANGE
    const yaml = withDesignSpec(PIPELINE)
      .replace('status: draft', `status: approved\ntemplate: ${SHA}`)
      .replace('    retries: 2\n    gate: human\n', '    retries: 2\n')
      .replace('    checks: [verify]\n', '    checks: [verify]\n    port: 4001\n');
    // ACT
    const messages = check(yaml, { ...CONTEXT, perRun: true });
    // ASSERT
    expect(messages).toEqual([]);
  });

  it('lets write-spec itself read the Dossier, the draft the Spec is written from', () => {
    // ARRANGE
    const yaml = PIPELINE.replace(
      '      - { type: implementor, skills: [], references: [], model: opus, session: orchestrator }\n',
      `      - { type: implementor, skills: [], references: [${STAGING}/dossier.md], model: opus, session: orchestrator }\n`,
    );
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual([]);
  });

  it('asks nothing of a pipeline that holds none of the Specification jobs', () => {
    // ARRANGE
    const yaml = `status: draft
stages: [brief]
jobs:
  - { id: brief-grill, stage: brief, needs: [], outputs: [], checks: [], retries: 0, agents: [{ type: implementor, skills: [], references: [], model: inherit }] }
`;
    // ACT
    const messages = check(yaml);
    // ASSERT
    expect(messages).toEqual([]);
  });
});
