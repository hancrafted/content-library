import { describe, expect, it } from 'vitest';
import { instanceSection } from './instance-cards.pure.ts';

const INSTANCE = {
  slug: 'default-alive-for-founders',
  folder: 'src/components/episodes/second/slides/default-alive-for-founders',
  origin: 'default-alive',
  affected: ['second', 'third'],
  poolChanges: [],
};

describe('instanceSection', () => {
  describe('success cases', () => {
    it('shows a card per instance that names the shared Slide, every Episode an update changes, and both commands', () => {
      // ARRANGE
      const expected = {
        key: 'instances',
        title: 'Adapted Slides',
        target: 'npm run slides:promote, once per card',
        cards: [
          {
            id: 'I1',
            title:
              'Make "default-alive-for-founders" the shared Slide "default-alive", or keep it as a Slide of its own.',
            changes: 'src/components/episodes/second/slides/default-alive-for-founders',
            happened: 'The Run adapted the shared Slide "default-alive" for this Episode and edited the copy.',
            change:
              'Keep the card to update the shared Slide: npm run slides:promote -- default-alive-for-founders --update. Strike it to keep the copy as a Slide of its own: npm run slides:promote -- default-alive-for-founders --own.',
            gain: "Every Slide has one home, and this Episode's links keep working either way.",
            before: { kind: 'stack', items: [{ label: 'default-alive' }, { label: 'default-alive-for-founders' }] },
            after: { kind: 'stack', items: [{ label: 'default-alive, changed in second and third' }] },
            evidence: 'An update changes the shared Slide in: second, third.',
          },
        ],
      };
      // ACT
      const section = instanceSection([INSTANCE]);
      // ASSERT
      expect(section).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('warns on the card when the shared Slide changed since the copy, naming each change', () => {
      // ARRANGE
      const changed = { ...INSTANCE, poolChanges: ['3f2a1bc fix the German pool title'] };
      const expectedWarning =
        'The shared Slide changed since the copy (3f2a1bc fix the German pool title): carry that into the copy by hand before an update, then add --reconciled.';
      // ACT
      const [card] = instanceSection([changed]).cards;
      // ASSERT
      expect(card.happened).toContain(expectedWarning);
      expect(card.weight).toBe('weak');
    });
  });

  describe('edge cases', () => {
    it('gives an Episode with no instance no cards', () => {
      // ARRANGE
      const instances: [] = [];
      // ACT
      const section = instanceSection(instances);
      // ASSERT
      expect(section.cards).toEqual([]);
    });
  });
});
