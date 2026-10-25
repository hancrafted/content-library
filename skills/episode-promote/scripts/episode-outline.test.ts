import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeOutline } from './episode-outline.ts';

/**
 * Writes an Episode folder from `files` (path → source, relative to the Episode folder) at
 * `src/components/episodes/<slug>` in a fresh temp repository, and returns its path.
 */
function episodeFolder(slug: string, files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), 'episode-outline-'));
  const folder = path.join(root, 'src/components/episodes', slug);
  for (const [file, source] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
    writeFileSync(path.join(folder, file), source);
  }
  return folder;
}

// The marker shape `implement-section` writes (never-too-early-sales, onboard-ai-every-time).
const WITH_MARKERS = {
  'cash-first.ts': `import { episode } from '@/components/slide-master/slide';
import { howToStartSection } from './sections/how-to-start';
import { whyCashSection } from './sections/why-cash';
import { hero } from './slides/hero/slide';

export const cashFirst = episode({
  slug: 'cash-first',
  title: hero,
  sections: [whyCashSection, howToStartSection],
});
`,
  'sections/why-cash.ts': `import type { Section } from '@/components/slide-master/slide';
import { watchCash } from '../slides/watch-cash/slide';
import { whyCash } from '../slides/why-cash/slide';

export const whyCashSection: Section = [whyCash, watchCash];
`,
  'sections/how-to-start.ts': `import type { Section } from '@/components/slide-master/slide';
import { firstCall } from '../slides/first-call/slide';
import { howToStart } from '../slides/how-to-start/slide';
import { leadList } from '../slides/lead-list/slide';

export const howToStartSection: Section = [
  howToStart,
  leadList,
  firstCall,
];
`,
};

// The inline shape of the hand-built Episodes (ai-token-economy, maintaining-markdown-for-ai).
const INLINE = {
  'token-talk.ts': `import { episode } from '@/components/slide-master/slide';
import { motivation } from './slides/motivation/slide';
import { toolsAndTips } from './slides/tools-and-tips/slide';
import { whatIsAToken } from './slides/what-is-a-token/slide';

export const tokenTalk = episode({
  slug: 'token-talk',
  sections: [
    [motivation, whatIsAToken],
    [toolsAndTips],
  ],
});
`,
};

// A Section reusing a pool Slide by reference, one under a Pinned anchor (what `slides:promote` writes).
const WITH_POOL = {
  ...WITH_MARKERS,
  'sections/why-cash.ts': `import { pinAnchor, type Section } from '@/components/slide-master/slide';
import { defaultAlive } from '@/components/slide-pool/default-alive/slide';
import { burnRate } from '@/components/slide-pool/burn-rate/slide';
import { whyCash } from '../slides/why-cash/slide';

export const whyCashSection: Section = [whyCash, burnRate, pinAnchor(defaultAlive, 'default-alive-for-founders')];
`,
};

/** An outline entry: the Slide's anchor slug in this Episode and the folder holding its files. */
function own(folder: string, slug: string) {
  return { slug, folder: path.join(folder, 'slides', slug) };
}

function pooled(folder: string, slug: string, anchor = slug) {
  return { slug: anchor, folder: path.join(folder, '..', '..', 'slide-pool', slug) };
}

describe('episodeOutline', () => {
  describe('success cases', () => {
    it('reads the Title slide and each Section placement marker, Slides in marker order, not import order', () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', WITH_MARKERS);
      const expected = {
        title: own(folder, 'hero'),
        sections: [
          [own(folder, 'why-cash'), own(folder, 'watch-cash')],
          [own(folder, 'how-to-start'), own(folder, 'lead-list'), own(folder, 'first-call')],
        ],
      };

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline).toEqual(expected);
    });

    it('reads Sections written inline as arrays, in an Episode with no Title slide', () => {
      // ARRANGE
      const folder = episodeFolder('token-talk', INLINE);
      const expected = {
        sections: [[own(folder, 'motivation'), own(folder, 'what-is-a-token')], [own(folder, 'tools-and-tips')]],
      };

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline).toEqual(expected);
    });

    it("reads a pool Slide from the Slide pool's folder, and a Pinned anchor under its retired slug", () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', WITH_POOL);
      const expected = [
        own(folder, 'why-cash'),
        pooled(folder, 'burn-rate'),
        pooled(folder, 'default-alive', 'default-alive-for-founders'),
      ];

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline.sections[0]).toEqual(expected);
    });
  });

  describe('failure cases', () => {
    it('refuses a folder with no Episode file named after it', () => {
      // ARRANGE
      const folder = episodeFolder('no-such-episode', {});
      const message = /no-such-episode\.ts/;

      // ACT
      const outline = () => episodeOutline(folder);

      // ASSERT
      expect(outline).toThrow(message);
    });

    it('refuses a Section entry not imported from a Slide folder', () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', {
        ...WITH_MARKERS,
        'sections/why-cash.ts': `import { whyCash } from '../parts/why-cash';

export const whyCashSection: Section = [whyCash];
`,
      });
      const message = /whyCash is not imported from a slides\/<folder>\/slide or slide-pool\/<folder>\/slide module/;

      // ACT
      const outline = () => episodeOutline(folder);

      // ASSERT
      expect(outline).toThrow(message);
    });
  });

  describe('edge cases', () => {
    it('reads a Section marker written on one line', () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', WITH_MARKERS);
      const firstSection = [own(folder, 'why-cash'), own(folder, 'watch-cash')];

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline.sections[0]).toEqual(firstSection);
    });
  });
});
