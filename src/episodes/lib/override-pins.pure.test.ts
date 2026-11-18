import { describe, expect, it } from 'vitest';
import type { InstanceBase, OverrideLayer } from './episode-instance.pure';
import { fingerprintOf, pinFindings, pinsOf } from './override-pins.pure';

const baseWith = (why: object): InstanceBase => ({
  slug: 'demo',
  messages: { en: {}, de: {} },
  sections: [
    [
      { slug: 'hero', messages: { en: {}, de: {} } },
      { slug: 'why', messages: { en: why, de: { heading: 'Warum' } } },
    ],
  ],
});

const WHY = { heading: 'Why', steps: { one: 'One', two: 'Two' }, list: ['a', 'b'] };
const trailOf = (why: object, ...layers: OverrideLayer[]) => ({ base: baseWith(why), layers });
const OVERRIDE: OverrideLayer = {
  slides: { why: { messages: { en: { heading: 'Mine', steps: { one: 'First' }, list: ['x'] } } } },
};

describe('success cases', () => {
  describe('pinsOf', () => {
    it('fingerprints the base default at each overridden leaf, inline and file overrides alike', () => {
      // ARRANGE
      const expected = {
        why: {
          'en.heading': fingerprintOf('Why'),
          'en.steps.one': fingerprintOf('One'),
          'en.list': fingerprintOf(['a', 'b']),
        },
      };
      // ACT
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      // ASSERT
      expect(lock).toEqual(expected);
    });
  });

  describe('pinFindings', () => {
    it('passes when the pinned defaults still hold', () => {
      // ARRANGE
      const trail = trailOf(WHY, OVERRIDE);
      // ACT
      const findings = pinFindings('demo-at-event', trail, pinsOf(trail));
      // ASSERT
      expect(findings).toEqual([]);
    });

    it('does not fail when an unrelated key of the default is edited', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const edited = trailOf({ ...WHY, steps: { one: 'One', two: 'Changed' } }, OVERRIDE);
      // ACT
      const findings = pinFindings('demo-at-event', edited, lock);
      // ASSERT
      expect(findings).toEqual([]);
    });

    it('clears once the override is deleted, whatever the lock still holds', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const deleted = trailOf({ ...WHY, heading: 'New default' });
      // ACT
      const findings = pinFindings('demo-at-event', deleted, lock);
      // ASSERT
      expect(findings).toEqual([]);
    });

    it('clears after re-pinning', () => {
      // ARRANGE
      const changed = trailOf({ ...WHY, heading: 'New default' }, OVERRIDE);
      // ACT
      const findings = pinFindings('demo-at-event', changed, pinsOf(changed));
      // ASSERT
      expect(findings).toEqual([]);
    });
  });
});

describe('failure cases', () => {
  describe('pinFindings', () => {
    it('names the instance, Slide and path of a default that changed under its override', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const changed = trailOf({ ...WHY, heading: 'New default' }, OVERRIDE);
      // ACT
      const findings = pinFindings('demo-at-event', changed, lock);
      // ASSERT
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('Episode instance "demo-at-event", Slide "why", path "en.heading"');
    });

    it('fails an override that no lock pins', () => {
      // ARRANGE
      const trail = trailOf(WHY, OVERRIDE);
      const unpinnedLeaves = Object.keys(pinsOf(trail).why).length;
      // ACT
      const findings = pinFindings('demo-at-event', trail, undefined);
      // ASSERT
      expect(findings).toHaveLength(unpinnedLeaves);
      expect(findings[0]).toContain('npm run overrides:pin -- demo-at-event');
    });

    it('fails when the base has since lost the overridden key', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const { heading: _lost, ...rest } = WHY;
      // ACT
      const findings = pinFindings('demo-at-event', trailOf(rest, OVERRIDE), lock);
      // ASSERT
      expect(findings.map((finding) => finding.includes('"en.heading"'))).toEqual([true]);
    });
  });
});

describe('edge cases', () => {
  describe('pinsOf', () => {
    it('pins nothing for an instance that overrides no Slide text', () => {
      // ARRANGE
      const trail = trailOf(WHY, { title: { notes: [] } });
      // ACT
      const lock = pinsOf(trail);
      // ASSERT
      expect(lock).toEqual({});
    });

    it('pins a key the base lacks as absent, so a later default there fails', () => {
      // ARRANGE
      const trail = trailOf(WHY, { slides: { why: { messages: { en: { extra: 'Mine' } } } } });
      // ACT
      const lock = pinsOf(trail);
      // ASSERT
      expect(lock).toEqual({ why: { 'en.extra': 'absent' } });
    });

    it('pins a path overridden by two layers once', () => {
      // ARRANGE
      const again: OverrideLayer = { slides: { why: { messages: { en: { heading: 'Again' } } } } };
      // ACT
      const lock = pinsOf(trailOf(WHY, OVERRIDE, again));
      // ASSERT
      expect(Object.keys(lock.why).filter((path) => path === 'en.heading')).toHaveLength(1);
    });
  });
});
