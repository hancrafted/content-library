import { describe, expect, it } from 'vitest';
import { workflowToYaml } from './workflow-yaml.pure';
import { loadWorkflow } from './workflow.pure';
import type { Workflow } from './workflow.types';

const BLOCK = '```handoff\nkind: text\ntext: hi\n```';
const workflow: Workflow = {
  id: 'demo',
  title: 'Demo',
  scenario: 'One sentence.',
  setup: 'Install it.',
  focalJobId: 'ask',
  stages: [
    {
      id: 'first',
      name: 'First',
      moveLabel: 'Ask',
      move: 'I',
      gate: 1,
      jobs: [
        {
          id: 'ask',
          title: 'Ask',
          detail: 'one line',
          description: 'D',
          chat: 'new',
          dependsOn: [],
          inputs: [],
          outputs: [{ id: 'answers', kind: 'text' }],
          fanOut: 3,
          skills: [{ group: 'productivity', name: 'grilling' }],
          prompt: 'Ask.',
          command: '/grilling',
          exampleOutput: BLOCK,
          check: { criteria: ['one'], prompt: 'Check.' },
          page: { simple: 'Page.', technical: 'Page, served.' },
          parked: ['Other'],
        },
      ],
    },
  ],
};

describe('success cases', () => {
  it('loads again, unchanged, through the loader a download is uploaded with', () => {
    // ARRANGE
    const yaml = workflowToYaml(workflow);
    // ACT
    const result = loadWorkflow(yaml, yaml);
    // ASSERT
    expect(result).toEqual({ workflow });
  });
});

describe('failure cases', () => {
  it('a Workflow that was broken before the download is still reported after it', () => {
    // ARRANGE
    const broken: Workflow = {
      ...workflow,
      stages: [{ ...workflow.stages[0]!, jobs: [{ ...workflow.stages[0]!.jobs[0]!, exampleOutput: 'no block' }] }],
    };
    const yaml = workflowToYaml(broken);
    // ACT
    const result = loadWorkflow(yaml, yaml);
    // ASSERT
    expect('problems' in result).toBe(true);
  });
});

describe('edge cases', () => {
  it('leaves optional fields out of the text when the Workflow has none', () => {
    // ARRANGE
    const bare: Workflow = { ...workflow, setup: undefined, focalJobId: undefined };
    // ACT
    const yaml = workflowToYaml(bare);
    // ASSERT
    expect(yaml).not.toContain('setup');
    expect(yaml).not.toContain('focalJob');
  });
});
