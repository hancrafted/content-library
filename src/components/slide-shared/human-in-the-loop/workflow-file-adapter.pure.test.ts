import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { connectorInto } from './diagram-layout.pure';
import { jobRole } from './diagram-model.pure';
import summerPartyEn from './summer-party.en.yml';
import { workflowOf } from './workflow-file-adapter.pure';
import type { WorkflowFile } from './workflow-schema.types';

const workflow = workflowOf(parse(summerPartyEn) as WorkflowFile);
const jobs = workflow.stages.flatMap((stage) => stage.jobs);

describe('success cases', () => {
  it('derives every edge of the diagram from the slots: a job depends on the producers of the outputs it takes', () => {
    // ARRANGE
    const expected = [
      ['pieces', []],
      ['interview', ['pieces']],
      ['spec', ['interview']],
      ['tickets', ['spec']],
      ['venue', ['tickets']],
      ['compare', ['spec', 'venue']],
      ['recommend', ['compare']],
    ];
    // ACT
    const edges = jobs.map((job) => [job.id, job.dependsOn]);
    // ASSERT
    expect(edges).toEqual(expected);
  });

  it('draws seven columns, the sign-off card as the focal job and the last task as the deliverable', () => {
    // ARRANGE
    const roles = jobs.map((job) => jobRole(workflow, job));
    // ACT
    const stages = workflow.stages.length;
    const columns = 7;
    // ASSERT
    expect(stages).toBe(columns);
    expect(roles).toEqual(['ai', 'ai', 'focal', 'ai', 'chats', 'ai', 'deliverable']);
  });

  it('fans the hairlines out into the three research chats and back in', () => {
    // ARRANGE
    const branches = 3;
    const [tickets, research, compare] = [3, 4, 5].map((at) => workflow.stages[at]!);
    // ACT
    const out = connectorInto(tickets, research!);
    const back = connectorInto(research, compare!);
    // ASSERT
    expect(out).toEqual({ kind: 'out', branches });
    expect(back).toEqual({ kind: 'in', branches });
  });
});

describe('failure cases', () => {
  it('gives a stage without a move no BRIEF letter', () => {
    // ARRANGE
    const last = workflow.stages.at(-1);
    // ACT
    const moves = last?.moves;
    // ASSERT
    expect(moves).toEqual([]);
  });
});

describe('edge cases', () => {
  it('keeps the file on the Workflow and the task on each job, and hands a simple prompt as pasted in `run`', () => {
    // ARRANGE
    const chats = 3;
    const venue = jobs.find((job) => job.id === 'venue');
    // ACT
    const prompt = venue?.run.prompt ?? '';
    // ASSERT
    expect(workflow.file?.id).toBe('summer-party');
    expect(venue?.task?.fanOut).toBe(chats);
    expect(prompt).toContain('## Your ticket');
    expect(prompt).not.toContain('{{');
  });
});
