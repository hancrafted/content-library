import { describe, expect, it } from 'vitest';
import { chatNames, jobRole, splitParked } from './diagram-model.pure';
import { flow, job, stage } from './workflow-fixture.pure';

describe('success cases', () => {
  it('reads each job role from the Workflow data', () => {
    // ARRANGE
    const pieces = job({ id: 'pieces', parked: ['A', 'B'], outputs: [{ id: 'piece' }] });
    const spec = job({ id: 'spec', dependsOn: ['pieces'], outputs: [{ id: 'spec' }] });
    const chats = job({
      id: 'venue',
      dependsOn: ['spec'],
      fanOut: 3,
      inputs: ['spec'],
      outputs: [{ id: 'r' }],
    });
    const plan = job({ id: 'plan', dependsOn: ['venue'], inputs: ['r'] });
    const ask = job({ id: 'ask', dependsOn: ['pieces'], inputs: ['piece'], outputs: [{ id: 'a' }] });
    const w = flow(
      [pieces, ask, spec, chats, plan].map((each) => stage(each.id, [each])),
      'spec',
    );
    // ACT
    const roles = Object.fromEntries([pieces, ask, spec, chats, plan].map((each) => [each.id, jobRole(w, each)]));
    // ASSERT
    expect(roles).toEqual({ pieces: 'pieces', ask: 'ai', spec: 'focal', venue: 'chats', plan: 'deliverable' });
  });

  it('keeps the taken piece in the middle of the parked ones', () => {
    // ARRANGE
    const parked = ['Travel', 'Catering', 'Invitations', 'Budget'];
    // ACT
    const split = splitParked(parked);
    // ASSERT
    expect(split).toEqual({ before: ['Travel', 'Catering'], after: ['Invitations', 'Budget'] });
  });

  it('numbers the parallel chats from the job title', () => {
    // ARRANGE
    const venue = job({ title: 'Venue', fanOut: 3 });
    // ACT
    const names = chatNames(venue);
    // ASSERT
    expect(names).toEqual(['Venue 1', 'Venue 2', 'Venue 3']);
  });
});

describe('failure cases', () => {
  it('reads a job with no parked pieces, no fan-out and no focal id as an AI job', () => {
    // ARRANGE
    const plain = job({ id: 'plain', dependsOn: [], inputs: ['x'] });
    const w = flow([stage('s', [plain])]);
    // ACT
    const role = jobRole(w, plain);
    // ASSERT
    expect(role).not.toBe('focal');
    expect(role).not.toBe('chats');
  });
});

describe('edge cases', () => {
  it('puts the lone piece first when nothing is parked beside it', () => {
    // ARRANGE
    const none: string[] = [];
    // ACT
    const split = splitParked(none);
    // ASSERT
    expect(split).toEqual({ before: [], after: [] });
  });
});
