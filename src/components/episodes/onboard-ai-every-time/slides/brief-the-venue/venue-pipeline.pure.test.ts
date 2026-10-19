import { describe, expect, it } from 'vitest';
import { STAGES } from './venue-pipeline.pure';

describe('success cases', () => {
  it('walks the stages in workflow order, not in the order of the letters', () => {
    // ARRANGE
    const expected = ['party', 'interview', 'requirements', 'research', 'compare', 'recommendation'];
    // ACT
    const order = STAGES.map((stage) => stage.id);
    // ASSERT
    expect(order).toEqual(expected);
  });

  it('names the BRIEF move each stage makes, and none for the recommendation', () => {
    // ARRANGE
    const expected = ['B', 'I', 'R', 'F', 'E', undefined];
    // ACT
    const moves = STAGES.map((stage) => stage.move);
    // ASSERT
    expect(moves).toEqual(expected);
  });

  it('breaks the party into five pieces with the venue in the middle, the only one taken forward', () => {
    // ARRANGE
    const expected = [
      { id: 'travel', kind: 'parked' },
      { id: 'catering', kind: 'parked' },
      { id: 'venue', kind: 'piece' },
      { id: 'invitations', kind: 'parked' },
      { id: 'budget', kind: 'parked' },
    ];
    // ACT
    const party = STAGES.find((stage) => stage.id === 'party')?.jobs;
    // ASSERT
    expect(party).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('parks no job outside the party: every later stage works on the venue only', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const parkedLater = STAGES.slice(1).flatMap((stage) =>
      stage.jobs.filter((job) => job.kind === 'parked').map((job) => `${stage.id}/${job.id}`),
    );
    // ASSERT
    expect(parkedLater).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('fans the research out into three fresh chats, each checked, and fans them back in to compare', () => {
    // ARRANGE
    const expected = { fanOut: 'out', fanIn: 'in', chats: ['venue1', 'venue2', 'venue3'] };
    // ACT
    const research = STAGES.find((stage) => stage.id === 'research');
    const compare = STAGES.find((stage) => stage.id === 'compare');
    const actual = {
      fanOut: research?.fan,
      fanIn: compare?.fan,
      chats: research?.jobs.filter((job) => job.kind === 'chat' && job.checked).map((job) => job.id),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});
