import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import { exportExchange, type PageState } from './exchange-file.pure.ts';
import { uploadExchange } from './exchange-upload.ts';
import { startSettings } from './factory-dials.pure.ts';
import { catalogWordsFor } from './software-ecology-data.ts';
import { builtinBundle } from './use-case-data.ts';

const CATALOGS = { en: catalogWordsFor('en'), de: catalogWordsFor('de') };

/** Tire swing at AI, unbalanced, a dial turned and two work centers in the stream: a state with something in every key. */
const busyPage = (): PageState => {
  const B = builtinBundle('tire');
  const p = B.data.presets.find((x) => x.id === 'ai-unbalanced');
  if (!p) throw new Error('tire has no ai-unbalanced preset');
  const s = startSettings(B, p);
  return {
    preset: p.id,
    view: 'factory',
    speed: 10,
    beltMotion: true,
    pile: 'drift',
    compare: ['eng', 'qa'],
    overlays: { follow: false, isolate: false },
    s: { ...s, aiq: 'worse', over: { ...s.over, ops: { eff: 140, ai: true } } },
  };
};

const tireText = () => exportExchange(builtinBundle('tire'), busyPage(), CATALOGS);

/** The exchange file with one change to its parsed document. */
const edited = (change: (doc: Record<string, unknown>) => void): string => {
  const doc = parse(tireText()) as Record<string, unknown>;
  change(doc);
  return stringify(doc);
};

const centerOf = (doc: Record<string, unknown>, id: string) =>
  (doc.centers as { id: string; realistic: number[] }[]).find((c) => c.id === id) as { realistic: number[] };

describe('success cases', () => {
  it('writes the same file again after loading it: Download, Upload, Download is byte-identical', () => {
    // ARRANGE
    const first = tireText();
    // ACT
    const up = uploadExchange(first, 'a.yaml');
    const again = up.kind === 'loaded' ? exportExchange(up.bundle, up.page, CATALOGS) : '';
    // ASSERT
    expect(again).toEqual(first);
  });

  it('loads the file as the page state it was saved from, and counts what the factory is built of', () => {
    // ARRANGE
    const expected = {
      kind: 'loaded',
      centers: 7,
      belts: 12,
      page: {
        preset: 'ai-unbalanced',
        speed: 10,
        beltMotion: true,
        pile: 'drift',
        compare: ['eng', 'qa'],
        s: { aiq: 'worse' },
      },
      bundle: { source: 'a.yaml' },
    };
    // ACT
    const up = uploadExchange(tireText(), 'a.yaml');
    // ASSERT
    expect(up).toMatchObject(expected);
  });

  it('keeps the file-defined backlog and display defaults, and the pile-up style the page showed', () => {
    // ARRANGE
    const doc = parse(tireText()) as { backlog: unknown; display: unknown; state: { pile: string } };
    const expected = { backlog: { qa: 3, eng: 2, ba: 2 }, display: { pile: 'heap', beltMotion: false }, pile: 'drift' };
    // ACT
    const up = uploadExchange(tireText(), 'a.yaml');
    // ASSERT
    expect({ backlog: doc.backlog, display: doc.display, pile: doc.state.pile }).toEqual(expected);
    expect(up).toMatchObject({
      kind: 'loaded',
      page: { pile: 'drift' },
      bundle: { data: { backlog: expected.backlog } },
    });
  });

  it('warns, as the reference build does, which work centers would be over capacity while rushing and in the worst case', () => {
    // ARRANGE
    const warn = { rush: ['support', 'eng'], worst: ['support'] };
    // ACT
    const up = uploadExchange(tireText(), 'a.yaml');
    // ASSERT
    expect(up).toMatchObject({ kind: 'loaded', warn });
  });
});

describe('failure cases', () => {
  it('refuses a file whose Realistic needs more than 1.5× Ideal capacity, per company, with the path to fix', () => {
    // ARRANGE
    const text = edited((doc) => void (centerOf(doc, 'eng').realistic = [40, 91]));
    const problems = [
      'centers[4].realistic: eng: Realistic needs 2.18× its Ideal capacity (at most 1.5×) (as a service provider); raise its efficiency or lower what reaches it',
      'centers[4].realistic: eng: Realistic needs 2.23× its Ideal capacity (at most 1.5×) (as a product company); raise its efficiency or lower what reaches it',
    ];
    // ACT
    const up = uploadExchange(text, 'r.yaml');
    // ASSERT
    expect(up).toEqual({ kind: 'unstable', problems });
  });

  it('refuses a file that breaks the schema, with each path and what is allowed there', () => {
    // ARRANGE
    const text = edited((doc) => void ((doc.customer as Record<string, unknown>).good = { pm: 0.7, sales: 0.4 }));
    const problems = [
      'customer.good: the chances add up to 1.1; keep them below 1, or the follow-up requests never end',
    ];
    // ACT
    const up = uploadExchange(text, 'b.yaml');
    // ASSERT
    expect(up).toEqual({ kind: 'broken', problems });
  });
});

describe('edge cases', () => {
  it('cannot read a file that is not YAML, and says why in one line', () => {
    // ARRANGE
    const unread = { kind: 'unread' };
    // ACT
    const up = uploadExchange('a: [1, 2', 'x.yaml');
    // ASSERT
    expect(up).toMatchObject(unread);
  });

  it('opens a file without a saved state on its first preset, in the factory view at 1×', () => {
    // ARRANGE
    const text = edited((doc) => void delete doc.state);
    const page = { preset: 'roles', view: 'factory', speed: 1, beltMotion: false, compare: [] };
    // ACT
    const up = uploadExchange(text, 'n.yaml');
    // ASSERT
    expect(up).toMatchObject({ kind: 'loaded', page });
  });
});
