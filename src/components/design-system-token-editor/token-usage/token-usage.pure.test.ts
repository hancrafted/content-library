import { describe, expect, it } from 'vitest';
import { diffUsage, sentinelsFor, usageLabel, type StyleSample } from './token-usage.pure';

const sample = (id: number, parent: number | null, styles: Record<string, string>): StyleSample => ({
  id,
  parent,
  styles,
});
const pseudoSample = (id: number, parent: number, styles: Record<string, string>): StyleSample => ({
  ...sample(id, parent, styles),
  pseudo: '::before',
});

describe('success cases', () => {
  it('reports the element and properties whose computed style changed', () => {
    // ARRANGE
    const before = [
      sample(0, null, { color: 'black', 'background-color': 'white' }),
      sample(1, 0, { 'background-color': 'white' }),
    ];
    const after = [
      sample(0, null, { color: 'black', 'background-color': 'magenta' }),
      sample(1, 0, { 'background-color': 'white' }),
    ];
    const expected = [{ id: 0, properties: ['background-color'] }];
    // ACT
    const usage = diffUsage(before, after);
    // ASSERT
    expect(usage).toEqual(expected);
  });

  it('keeps a pseudo-element hit apart from its host', () => {
    // ARRANGE
    const before = [sample(0, null, { color: 'black' }), pseudoSample(1, 0, { color: 'black' })];
    const after = [sample(0, null, { color: 'black' }), pseudoSample(1, 0, { color: 'magenta' })];
    const expected = [{ id: 1, pseudo: '::before', properties: ['color'] }];
    // ACT
    const usage = diffUsage(before, after);
    // ASSERT
    expect(usage).toEqual(expected);
  });

  it('offers a colour token one magenta sentinel', () => {
    // ARRANGE
    const expected = ['color(srgb 1 0 1)'];
    // ACT
    const sentinels = sentinelsFor('colour');
    // ASSERT
    expect(sentinels).toEqual(expected);
  });

  it('labels an element by its nearest two markers, outermost first', () => {
    // ARRANGE
    const chain = [
      { tag: 'button', slot: 'button' },
      { tag: 'div' },
      { tag: 'section', slide: 'hero' },
      { tag: 'main', section: 'intro' },
    ];
    const expected = 'hero › button';
    // ACT
    const label = usageLabel(chain);
    // ASSERT
    expect(label).toBe(expected);
  });
});

describe('failure cases', () => {
  it('reports nothing when no computed style moved', () => {
    // ARRANGE
    const samples = [sample(0, null, { color: 'black' })];
    // ACT
    const usage = diffUsage(samples, samples);
    // ASSERT
    expect(usage).toEqual([]);
  });

  it('tries a token of unknown kind as a colour and then as a length', () => {
    // ARRANGE
    const expected = ['color(srgb 1 0 1)', '71.7px'];
    // ACT
    const sentinels = sentinelsFor('other');
    // ASSERT
    expect(sentinels).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('drops an element that only inherited the change from its parent', () => {
    // ARRANGE
    const before = [sample(0, null, { color: 'black' }), sample(1, 0, { color: 'black' })];
    const after = [sample(0, null, { color: 'magenta' }), sample(1, 0, { color: 'magenta' })];
    const expected = [{ id: 0, properties: ['color'] }];
    // ACT
    const usage = diffUsage(before, after);
    // ASSERT
    expect(usage).toEqual(expected);
  });

  it('keeps a child whose own non-inherited property changed even when its parent changed too', () => {
    // ARRANGE
    const before = [sample(0, null, { 'background-color': 'white' }), sample(1, 0, { 'background-color': 'white' })];
    const after = [sample(0, null, { 'background-color': 'magenta' }), sample(1, 0, { 'background-color': 'magenta' })];
    const expected = [
      { id: 0, properties: ['background-color'] },
      { id: 1, properties: ['background-color'] },
    ];
    // ACT
    const usage = diffUsage(before, after);
    // ASSERT
    expect(usage).toEqual(expected);
  });

  it('falls back to the tag when no level carries a marker, and to one marker when only one does', () => {
    // ARRANGE
    const bare = [{ tag: 'span' }, { tag: 'div' }];
    const single = [{ tag: 'span' }, { tag: 'div', testid: 'card' }];
    const expected = ['span', 'card'];
    // ACT
    const labels = [usageLabel(bare), usageLabel(single)];
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('reads a marker in the order slot, slide, section, test id', () => {
    // ARRANGE
    const chain = [{ tag: 'div', testid: 'x', slot: 'y' }];
    const expected = 'y';
    // ACT
    const label = usageLabel(chain);
    // ASSERT
    expect(label).toBe(expected);
  });
});
