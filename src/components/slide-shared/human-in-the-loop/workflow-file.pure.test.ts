import { describe, expect, it } from 'vitest';
import { uploadEvent } from './human-in-the-loop-slices.pure';
import { workflowFor } from './workflow-data';
import { workflowFile } from './workflow-file.pure';
import { loadWorkflow } from './workflow.pure';
import type { Workflow } from './workflow.types';

const BLOCK = '```handoff\nkind: text\ntext: hi\n```';
const workflow: Workflow = {
  id: 'demo',
  title: 'Demo',
  scenario: 'One sentence.',
  focalJobId: 'ask',
  stages: [
    {
      id: 'first',
      name: 'First',
      moves: [{ letter: 'I', why: 'Ask first.' }],
      card: { label: 'Card', lines: ['One line'], status: 'Signed off' },
      jobs: [
        {
          id: 'ask',
          title: 'Ask',
          description: 'D',
          chat: 'new',
          dependsOn: [],
          inputs: [],
          outputs: [{ id: 'answers', kind: 'text' }],
          skills: [{ group: 'productivity', name: 'grilling' }],
          run: { todo: 'Do.', prompt: 'Ask.', short: 'Ask short.' },
          check: { todo: 'Check.', criteria: ['Short.'], prompt: 'Check it.' },
          exampleOutput: BLOCK,
        },
      ],
    },
  ],
};

describe('success cases', () => {
  it('uploading a downloaded Workflow yields the same Workflow', () => {
    // ARRANGE
    const { text } = workflowFile(workflow);
    // ACT
    const event = uploadEvent(text);
    // ASSERT
    expect(event).toEqual({ type: 'upload', workflow });
  });

  it('names the file after the Workflow id', () => {
    // ARRANGE
    const id = workflow.id;
    // ACT
    const { name } = workflowFile({ ...workflow, id });
    // ASSERT
    expect(name).toBe('demo.yml');
  });
});

describe('failure cases', () => {
  it('a broken upload reports the loader problems', () => {
    // ARRANGE
    const text = 'stages: nope';
    // ACT
    const event = uploadEvent(text);
    // ASSERT
    const loaded = loadWorkflow(text, text);
    expect(event.type).toBe('upload-failed');
    expect(event).toEqual({ type: 'upload-failed', problems: 'problems' in loaded ? loaded.problems : [] });
    expect('problems' in event && event.problems.length).toBeGreaterThan(0);
  });

  it('text that is not YAML at all is a problem, not a throw', () => {
    // ARRANGE
    const text = ': : [';
    // ACT
    const event = uploadEvent(text);
    // ASSERT
    expect(event.type).toBe('upload-failed');
  });
});

describe('edge cases', () => {
  it('falls back to a plain name when the id has nothing safe in it', () => {
    // ARRANGE
    const odd = { ...workflow, id: '///' };
    // ACT
    const { name } = workflowFile(odd);
    // ASSERT
    expect(name).toBe('workflow.yml');
  });

  it('downloads a new-schema file as written and uploads it again as the same Workflow', () => {
    // ARRANGE
    const shipped = workflowFor('summer-party', 'en');
    // ACT
    const { text } = workflowFile(shipped);
    const event = uploadEvent(text);
    // ASSERT
    expect(text).toContain('templates:');
    expect(event.type).toBe('upload');
    expect(event.type === 'upload' && event.workflow.stages.map((stage) => stage.id)).toEqual(
      shipped.stages.map((stage) => stage.id),
    );
  });
});
