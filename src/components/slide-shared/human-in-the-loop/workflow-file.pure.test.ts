import { describe, expect, it } from 'vitest';
import { uploadEvent } from './human-in-the-loop-slices.pure';
import { workflowFor } from './workflow-data';
import { workflowFile } from './workflow-file.pure';
import { flow } from './workflow-fixture.pure';
import { loadWorkflow } from './workflow-loader.pure';

describe('success cases', () => {
  it('uploading a downloaded Workflow yields the same Workflow, in each language of each shipped file', () => {
    // ARRANGE
    const shipped = [workflowFor('project-plan', 'en'), workflowFor('vacation', 'de')];
    // ACT
    const events = shipped.map((workflow) => uploadEvent(workflowFile(workflow).text));
    // ASSERT
    expect(events).toEqual(shipped.map((workflow) => ({ type: 'upload', workflow })));
  });

  it('writes the file as written: the same text again, under the Workflow id', () => {
    // ARRANGE
    const shipped = workflowFor('project-plan', 'en');
    // ACT
    const { name, text } = workflowFile(shipped);
    // ASSERT
    expect(name).toBe('project-plan.yml');
    expect(text).toContain('templates:');
  });
});

describe('failure cases', () => {
  it('a broken upload reports the loader problems', () => {
    // ARRANGE
    const text = 'stages: nope';
    // ACT
    const event = uploadEvent(text);
    // ASSERT
    const loaded = loadWorkflow(text);
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
    const odd = { ...flow([]), id: '///' };
    // ACT
    const { name } = workflowFile(odd);
    // ASSERT
    expect(name).toBe('workflow.yml');
  });
});
