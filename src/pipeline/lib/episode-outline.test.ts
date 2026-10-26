import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { episodeOutline } from './episode-outline.ts';

/** Writes an Episode folder from `files` (path → source) into a fresh temp folder and returns its path. */
function episodeFolder(slug: string, files: Record<string, string>): string {
  const folder = path.join(mkdtempSync(path.join(tmpdir(), 'episode-outline-')), slug);
  for (const [file, source] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(folder, file)), { recursive: true });
    writeFileSync(path.join(folder, file), source);
  }
  return folder;
}

// The marker shape `implement-section` writes (never-too-early-sales, onboard-ai-every-time).
const WITH_MARKERS = {
  'episode.ts': `import { episode } from '@/components/slide-master/slide';
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
  'episode.ts': `import { episode } from '@/components/slide-master/slide';
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
describe('success cases', () => {
  describe('episodeOutline', () => {
    it('reads the Title slide and each Section placement marker, Slides in marker order, not import order', () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', WITH_MARKERS);
      const expected = {
        title: 'hero',
        sections: [
          ['why-cash', 'watch-cash'],
          ['how-to-start', 'lead-list', 'first-call'],
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
      const expected = { sections: [['motivation', 'what-is-a-token'], ['tools-and-tips']] };

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline).toEqual(expected);
    });
  });
});

describe('failure cases', () => {
  describe('episodeOutline', () => {
    it('refuses an Episode folder with no episode.ts', () => {
      // ARRANGE
      const folder = episodeFolder('no-such-episode', {});
      const message = /no-such-episode\/episode\.ts is missing/;

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
      const message = /whyCash is not imported from a slides\/<folder>\/slide module/;

      // ACT
      const outline = () => episodeOutline(folder);

      // ASSERT
      expect(outline).toThrow(message);
    });
  });
});

describe('edge cases', () => {
  describe('episodeOutline', () => {
    it('reads a Section marker written on one line', () => {
      // ARRANGE
      const folder = episodeFolder('cash-first', WITH_MARKERS);
      const firstSection = ['why-cash', 'watch-cash'];

      // ACT
      const outline = episodeOutline(folder);

      // ASSERT
      expect(outline.sections[0]).toEqual(firstSection);
    });
  });
});
