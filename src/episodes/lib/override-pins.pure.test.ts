import { describe, expect, it } from 'vitest';
import type { InstanceBase, OverrideLayer } from './episode-instance.pure';
import { fingerprintOf, pinFindings, pinsOf, TITLE_PIN } from './override-pins.pure';

const baseWith = (why: object, look: Partial<InstanceBase> = {}): InstanceBase => ({
  slug: 'demo',
  messages: { en: { title: 'Demo', caption: 'Shown' }, de: { title: 'Demo' } },
  notes: [{ slug: 'welcome', target: 'title' }],
  sections: [
    [
      { slug: 'hero', messages: { en: {}, de: {} } },
      {
        slug: 'why',
        messages: { en: why, de: { heading: 'Warum' } },
        presentation: { surface: 'inverse' },
        explorables: { context: 'four-pillars' },
      },
    ],
  ],
  ...look,
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

    it("pins the Title's notes as one value and its text by leaf, under the Title", () => {
      // ARRANGE
      const layer: OverrideLayer = {
        title: { notes: [{ slug: 'check-in', target: 'title' }], messages: { en: { caption: 'Mine' } } },
      };
      // ACT
      const lock = pinsOf(trailOf(WHY, layer));
      // ASSERT
      expect(lock).toEqual({
        [TITLE_PIN]: {
          notes: fingerprintOf([{ slug: 'welcome', target: 'title' }]),
          'en.caption': fingerprintOf('Shown'),
        },
      });
    });

    it("pins a Slide's presentation as one value and each swapped Explorable Preset id", () => {
      // ARRANGE
      const layer: OverrideLayer = {
        slides: { why: { presentation: { surface: 'paper' }, explorables: { context: 'one-pillar' } } },
      };
      // ACT
      const lock = pinsOf(trailOf(WHY, layer));
      // ASSERT
      expect(lock).toEqual({
        why: {
          presentation: fingerprintOf({ surface: 'inverse' }),
          'explorables.context': fingerprintOf('four-pillars'),
        },
      });
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

    it('clears once the override is deleted and the lock re-pinned', () => {
      // ARRANGE
      const deleted = trailOf({ ...WHY, heading: 'New default' });
      // ACT
      const findings = pinFindings('demo-at-event', deleted, pinsOf(deleted));
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

    it('says the base no longer has a path it has since lost', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const { heading: _lost, ...rest } = WHY;
      // ACT
      const findings = pinFindings('demo-at-event', trailOf(rest, OVERRIDE), lock);
      // ASSERT
      expect(findings).toHaveLength(1);
      expect(findings[0]).toContain('"en.heading"');
      expect(findings[0]).toContain('no longer has this path');
    });

    it('fails a changed default under the Title notes, a presentation and a Preset id', () => {
      // ARRANGE
      const layer: OverrideLayer = {
        title: { notes: [] },
        slides: { why: { presentation: {}, explorables: { context: 'one-pillar' } } },
      };
      const lock = pinsOf(trailOf(WHY, layer));
      const replacedDefaults = 3;
      const changed = baseWith(WHY, {
        notes: [{ slug: 'other', target: 'title' }],
        sections: [
          [
            { slug: 'hero', messages: { en: {}, de: {} } },
            {
              slug: 'why',
              messages: { en: WHY, de: {} },
              presentation: { surface: 'paper' },
              explorables: { context: 'two-pillars' },
            },
          ],
        ],
      });
      // ACT
      const findings = pinFindings('demo-at-event', { base: changed, layers: [layer] }, lock);
      // ASSERT
      expect(findings).toHaveLength(replacedDefaults);
      expect(findings[0]).toContain('Episode instance "demo-at-event", Title, path "notes"');
      expect(findings.map((finding) => finding.includes('default changed'))).toEqual([true, true, true]);
    });

    it('reports a lock entry that no override matches', () => {
      // ARRANGE
      const lock = pinsOf(trailOf(WHY, OVERRIDE));
      const deleted = trailOf(WHY);
      // ACT
      const findings = pinFindings('demo-at-event', deleted, lock);
      // ASSERT
      expect(findings).toHaveLength(Object.keys(lock.why).length);
      expect(findings[0]).toContain('Slide "why", path "en.heading": the lock pins a path no override replaces');
      expect(findings[0]).toContain('npm run overrides:pin -- demo-at-event');
    });
  });
});

describe('edge cases', () => {
  describe('pinsOf', () => {
    it('pins nothing for an instance that only hides and rearranges', () => {
      // ARRANGE
      const trail = trailOf(WHY, { sections: [{ hide: 'why' }], slides: { why: { hide: [] } } });
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

    it("pins the root base's default under a later layer, not the value an earlier layer resolved", () => {
      // ARRANGE
      const again: OverrideLayer = { slides: { why: { messages: { en: { heading: 'Again' } } } } };
      // ACT
      const lock = pinsOf(trailOf(WHY, { slides: { why: { messages: { en: { heading: 'Mine' } } } } }, again));
      // ASSERT
      expect(lock.why['en.heading']).toBe(fingerprintOf('Why'));
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
