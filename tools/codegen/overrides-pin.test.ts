import { mkdirSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeRef } from '../../src/episodes/lib/episode-folders.ts';
import { instanceOf, instanceTrailOf } from '../../src/episodes/lib/episode-instance.ts';
import * as pins from '../../src/episodes/lib/override-pins.pure.ts';
import { pinOverrides } from './overrides-pin.ts';

const BASE = {
  slug: 'demo',
  messages: { en: {}, de: {} },
  sections: [[{ slug: 'why', messages: { en: { heading: 'Why' }, de: { heading: 'Warum' } } }]],
} as never;

const INSTANCE_ID = episodeRef('demo', '2026-11-04-event').id;

function rootWithInstance(): { root: string; dir: string } {
  const root = mkdtempSync(path.join(tmpdir(), 'pin-'));
  const dir = path.join(root, 'src/episodes/by-event/2026-11-04-event/demo');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'episode.ts'), '');
  return { root, dir };
}

const loaderOf =
  (episodes: object) =>
  async <T>(repoPath: string): Promise<T> => {
    if (repoPath.endsWith('episode-registry.generated.ts')) return { EPISODES: episodes } as T;
    if (repoPath.endsWith('episode-instance.ts')) return { instanceTrailOf } as T;
    return pins as T;
  };

describe('success cases', () => {
  describe('pinOverrides', () => {
    it('writes overrides.lock.json beside the instance with one fingerprint per overridden path', async () => {
      // ARRANGE
      const { root, dir } = rootWithInstance();
      const instance = instanceOf(BASE, { slides: { why: { messages: { en: { heading: 'Mine' } } } } } as never);
      const expected = { why: { 'en.heading': pins.fingerprintOf('Why') } };
      // ACT
      await pinOverrides(root, INSTANCE_ID, loaderOf({ [INSTANCE_ID]: instance }));
      // ASSERT
      expect(JSON.parse(readFileSync(path.join(dir, pins.PIN_LOCK_FILE), 'utf8'))).toEqual(expected);
    });
  });
});

describe('failure cases', () => {
  describe('pinOverrides', () => {
    it('refuses an id that no Episode folder has', async () => {
      // ARRANGE
      const { root } = rootWithInstance();
      // ACT
      const pin = pinOverrides(root, 'nope', loaderOf({}));
      // ASSERT
      await expect(pin).rejects.toThrow(/nope/);
    });

    it('refuses an Episode that is not an instance', async () => {
      // ARRANGE
      const { root } = rootWithInstance();
      // ACT
      const pin = pinOverrides(root, INSTANCE_ID, loaderOf({ [INSTANCE_ID]: BASE }));
      // ASSERT
      await expect(pin).rejects.toThrow(/not an Episode instance/);
    });
  });
});

describe('edge cases', () => {
  describe('pinOverrides', () => {
    it('removes a lock once nothing is overridden, so deleting the override leaves no stale pin', async () => {
      // ARRANGE
      const { root, dir } = rootWithInstance();
      writeFileSync(path.join(dir, pins.PIN_LOCK_FILE), '{"why":{"en.heading":"x"}}');
      const instance = instanceOf(BASE, {});
      // ACT
      await pinOverrides(root, INSTANCE_ID, loaderOf({ [INSTANCE_ID]: instance }));
      // ASSERT
      expect(existsSync(path.join(dir, pins.PIN_LOCK_FILE))).toBe(false);
    });

    it('says there is nothing to pin when no Slide text is overridden, and whether it removed a stale lock', async () => {
      // ARRANGE
      const { root, dir } = rootWithInstance();
      const instance = instanceOf(BASE, {});
      const loader = loaderOf({ [INSTANCE_ID]: instance });
      const clean = await pinOverrides(root, INSTANCE_ID, loader);
      writeFileSync(path.join(dir, pins.PIN_LOCK_FILE), '{}');
      // ACT
      const stale = await pinOverrides(root, INSTANCE_ID, loader);
      // ASSERT
      expect({ clean, stale }).toEqual({
        clean: `${INSTANCE_ID} overrides no Slide text: nothing to pin`,
        stale: expect.stringContaining('nothing to pin, removed the stale'),
      });
    });
  });
});
