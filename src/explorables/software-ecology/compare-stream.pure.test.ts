import { describe, expect, it } from 'vitest';
import {
  closedCompare,
  columnOf,
  openCompare,
  pickCompare,
  presetCompare,
  removeCompare,
  streamOf,
  togglePicking,
} from './compare-stream.pure.ts';
import { idealSettings } from './factory-dials.pure.ts';
import { DEFAULT_SEED, buildFactory } from './factory-model.pure.ts';
import { FactoryRun } from './factory-run.pure.ts';
import type { FactoryNode } from './factory.types';
import { builtinBundle } from './use-case-data.ts';

const tire = () => buildFactory(builtinBundle('tire'), { s: idealSettings('service'), seed: DEFAULT_SEED });

describe('success cases', () => {
  it('orders the AI compare picks by the flow and joins neighbours by their live belt', () => {
    // ARRANGE
    const m = tire();
    const expected = [
      { kind: 'column', id: 'ba' },
      { kind: 'belt', key: 'ba-eng' },
      { kind: 'column', id: 'eng' },
      { kind: 'belt', key: 'eng-qa' },
      { kind: 'column', id: 'qa' },
    ];
    // ACT
    const s = streamOf(m, ['qa', 'ba', 'eng']);
    // ASSERT
    expect(s).toEqual(expected);
  });

  it('counts the stations skipped between two picks that no belt joins', () => {
    // ARRANGE
    const m = tire();
    const expected = [
      { kind: 'column', id: 'sales' },
      { kind: 'gap', skipped: 3 },
      { kind: 'column', id: 'eng' },
      { kind: 'gap', skipped: 1 },
      { kind: 'column', id: 'ops' },
    ];
    // ACT
    const s = streamOf(m, ['sales', 'eng', 'ops']);
    // ASSERT
    expect(s).toEqual(expected);
  });

  it('picks a work center, starts picking, and drops it again on a second pick', () => {
    // ARRANGE
    const c = closedCompare();
    const one = { picking: true, open: false, ids: ['eng'], note: null };
    const none = { picking: true, open: false, ids: [], note: null };
    // ACT
    const first = pickCompare(c, 'eng');
    const second = pickCompare(first, 'eng');
    // ASSERT
    expect(first).toEqual(one);
    expect(second).toEqual(none);
  });

  it('turns picking on with its hint, and off again clearing the picks', () => {
    // ARRANGE
    const c = closedCompare();
    const on = { picking: true, open: false, ids: [], note: 'pick' };
    // ACT
    const turnedOn = togglePicking(c);
    const turnedOff = togglePicking(pickCompare(turnedOn, 'qa'));
    // ASSERT
    expect(turnedOn).toEqual(on);
    expect(turnedOff).toEqual(closedCompare());
  });

  it('reads quality assurance at AI compare as the stream shows it: a full rack of AI-made work, busy all the time', () => {
    // ARRANGE
    const run = new FactoryRun({ B: builtinBundle('tire'), preset: 'ai-compare', now: true });
    const qa = run.m.nodes.get('qa') as FactoryNode;
    const [waiting, weeks, busy, done, shown] = [714, 32.5, 100, 17.8, 10];
    const goodAi = { good: true, ai: true, warn: false };
    // ACT
    const col = columnOf(qa);
    // ASSERT
    expect(col).toMatchObject({ waiting, busy, more: waiting - shown });
    expect(col.weeks).toBeCloseTo(weeks, 1);
    expect(col.done).toBeCloseTo(done, 1);
    expect(col.queue).toHaveLength(shown);
    expect(col.queue[0]).toEqual(goodAi);
  });

  it('shows the picks as a stream, and a preset with picks opens it directly', () => {
    // ARRANGE
    const picked = pickCompare(closedCompare(), 'eng');
    const shown = { picking: false, open: true, ids: ['eng'], note: null };
    const aiCompare = { picking: false, open: true, ids: ['ba', 'eng', 'qa'], note: null };
    // ACT
    const opened = openCompare(picked);
    const fromPreset = presetCompare(['ba', 'eng', 'qa']);
    // ASSERT
    expect(opened).toEqual(shown);
    expect(fromPreset).toEqual(aiCompare);
  });
});

describe('failure cases', () => {
  it('refuses a fourth pick and says three at most', () => {
    // ARRANGE
    const three = ['ba', 'eng', 'qa'].reduce(pickCompare, closedCompare());
    const refused = { picking: true, open: false, ids: ['ba', 'eng', 'qa'], note: 'max' };
    // ACT
    const four = pickCompare(three, 'ops');
    // ASSERT
    expect(four).toEqual(refused);
  });

  it('leaves the Customer and unknown ids out of the stream', () => {
    // ARRANGE
    const m = tire();
    const expected = [{ kind: 'column', id: 'pm' }];
    // ACT
    const s = streamOf(m, ['customer', 'nobody', 'pm']);
    // ASSERT
    expect(s).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('closes the stream when its last slot is removed, and keeps it open while one is left', () => {
    // ARRANGE
    const open = presetCompare(['eng', 'qa']);
    const left = { picking: false, open: true, ids: ['qa'], note: null };
    // ACT
    const one = removeCompare(open, 'eng');
    const none = removeCompare(one, 'qa');
    // ASSERT
    expect(one).toEqual(left);
    expect(none).toEqual(closedCompare());
  });

  it('opens nothing for a preset without picks, and keeps only the first three', () => {
    // ARRANGE
    const four = ['sales', 'pm', 'ba', 'eng'];
    const firstThree = { picking: false, open: true, ids: ['sales', 'pm', 'ba'], note: null };
    // ACT
    const none = presetCompare(undefined);
    const capped = presetCompare(four);
    // ASSERT
    expect(none).toEqual(closedCompare());
    expect(capped).toEqual(firstThree);
  });
});
