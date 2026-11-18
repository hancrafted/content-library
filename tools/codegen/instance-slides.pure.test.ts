import { describe, expect, it } from 'vitest';
import type { OutlineInput } from './episode-outline.pure.ts';
import { instanceSlidesFile } from './instance-slides.pure.ts';

const layerOf = (home: string) => ({
  en: [`src/episodes/${home}/i18n/en.json`],
  de: [`src/episodes/${home}/i18n/de.json`],
});

const CASH: OutlineInput = {
  id: 'cash',
  folder: 'cash',
  text: layerOf('cash'),
  title: { slug: 'hero', anchor: 'top', text: layerOf('cash/slides/hero') },
  sections: [[{ slug: 'why', anchor: 'why', text: layerOf('slide-pool/why') }]],
};

const AXEL: OutlineInput = { ...CASH, id: 'axel__cash', folder: 'by-event/axel/cash', base: 'cash' };

describe('success cases', () => {
  it("maps each Base Episode's slug to its Slides' messages types, read from each Slide's own text files", () => {
    // ARRANGE
    const expected = [
      "import type cash__hero__en from '@/episodes/cash/slides/hero/i18n/en.json';",
      "import type cash__why__de from '@/episodes/slide-pool/why/i18n/de.json';",
      '    readonly "cash": {',
      '      readonly "hero": { readonly en: typeof cash__hero__en; readonly de: typeof cash__hero__de };',
      '      readonly "why": { readonly en: typeof cash__why__en; readonly de: typeof cash__why__de };',
    ];
    // ACT
    const { text } = instanceSlidesFile([CASH, AXEL]);
    // ASSERT
    expect(text.split('\n')).toEqual(expect.arrayContaining(expected));
  });

  it('types the targets a Slide exposes and the Explorables it declares, so an override can only name those', () => {
    // ARRANGE
    const rich: OutlineInput = {
      ...CASH,
      sections: [
        [
          {
            slug: 'why',
            anchor: 'why',
            text: layerOf('slide-pool/why'),
            targets: ['team', 'quote'],
            explorables: ['context'],
          },
        ],
      ],
    };
    const expected =
      '      readonly "why": { readonly en: typeof cash__why__en; readonly de: typeof cash__why__de; readonly targets: "team" | "quote"; readonly explorables: "context" };';
    // ACT
    const { text } = instanceSlidesFile([rich, { ...AXEL, sections: rich.sections }]);
    // ASSERT
    expect(text.split('\n')).toContain(expected);
  });

  it('writes to the checked-in path the stale-file check compares, which episode-instance.ts declares the map for', () => {
    // ARRANGE
    const expected = 'src/episodes/lib/episode-instance-slides.generated.ts';
    // ACT
    const { path } = instanceSlidesFile([]);
    // ASSERT
    expect(path).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses an instance whose Base Episode has no outline', () => {
    // ARRANGE
    const expected = 'The Episode instance axel__cash names the Base Episode "cash", which has no outline';
    // ACT
    const write = () => instanceSlidesFile([AXEL]);
    // ASSERT
    expect(write).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('maps no Episode that no instance names as its base, and writes each base once', () => {
    // ARRANGE
    const lone: OutlineInput = { ...CASH, id: 'lone', folder: 'lone' };
    const second: OutlineInput = { ...AXEL, id: 'other__cash', folder: 'by-event/other/cash' };
    const expected = ['    readonly "cash": {'];
    // ACT
    const { text } = instanceSlidesFile([CASH, lone, AXEL, second]);
    // ASSERT
    expect(text.split('\n').filter((line) => line.startsWith('    readonly'))).toEqual(expected);
  });
});
