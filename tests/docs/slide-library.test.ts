import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/*
 * `docs/design/slide-library.md` lists every Master slide: one `##` per folder of the Slide master Episode, each with
 * a Shows, a When and a Motion line (slide-authoring-context decision 15). The `##` that is not a Master slide is named below.
 */

const ROOT = path.resolve(__dirname, '../..');
const MASTER_SLIDES = path.join(ROOT, 'src/components/episodes/slide-master/slides');
const LIBRARY_DOC = path.join(ROOT, 'docs/design/slide-library.md');
const MOTIONS_DIR = path.join(ROOT, 'src/components/slide-shared/motions');
const NOT_A_MASTER_SLIDE = ['Library motions', 'Shared parts'];

function masterSlideFolders(): string[] {
  return readdirSync(MASTER_SLIDES, { withFileTypes: true })
    .filter((each) => each.isDirectory())
    .map((each) => each.name)
    .sort();
}

/** Each `##` section of the doc: its heading with backticks stripped, and its body. */
function sections(): { heading: string; body: string }[] {
  const text = readFileSync(LIBRARY_DOC, 'utf8');
  return text
    .split(/^## /m)
    .slice(1)
    .map((chunk) => {
      const [first = '', ...rest] = chunk.split('\n');
      return { heading: first.replaceAll('`', '').trim(), body: rest.join('\n') };
    });
}

describe('docs/design/slide-library.md', () => {
  const masters = sections().filter(({ heading }) => !NOT_A_MASTER_SLIDE.includes(heading));

  it('has one ## per Master slide folder, no more and no fewer', () => {
    expect(masters.map(({ heading }) => heading).sort()).toEqual(masterSlideFolders());
  });

  it('gives every Master slide a Shows, a When and a Motion line', () => {
    for (const { heading, body } of masters) {
      for (const line of ['_Shows_', '_When_', '_Motion_']) {
        expect(body, `${heading} lacks ${line}`).toContain(line);
      }
    }
  });

  it('says the library motions folder is empty while it is', () => {
    const files = existsSync(MOTIONS_DIR) ? readdirSync(MOTIONS_DIR).filter((name) => !name.startsWith('.')) : [];
    const mentionsEmpty = /is empty today/.test(readFileSync(LIBRARY_DOC, 'utf8'));
    expect(mentionsEmpty).toBe(files.length === 0);
  });

  it('has the design system point its Motion section at the library', () => {
    const system = readFileSync(path.join(ROOT, 'docs/design/design-system.md'), 'utf8');
    expect(system.match(/^## Motion$/gm)).toHaveLength(1);
    const motion = system.split(/^## Motion$/m)[1]?.split(/^## /m)[0] ?? '';
    expect(motion).toContain('slide-library.md');
    expect(system).not.toMatch(/^## Out of scope$/m);
  });
});
