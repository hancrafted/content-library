import { isValidElement, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import type { RuntimeTranslator } from './episode-record';
import { slideKit, type EpisodeKitInput, type SlideKitInput } from './slide-kit';

/*
 * The kit as one Slide receives it. The translator is a hand-written stand-in
 * that returns each key's string from a small table and records the tags
 * `t.rich` was handed, so the tests read what the kit adds, not next-intl.
 */
const STRINGS: Readonly<Record<string, unknown>> = {
  prose: 'A <b>bold</b> phrase',
  'browse.showAll': 'Show all {count}',
  'browse.labels': { one: 'one' },
};

function stubTranslator(): { t: RuntimeTranslator; richTags: string[][] } {
  const richTags: string[][] = [];
  const raw = (key: string): unknown => {
    if (!(key in STRINGS)) throw new Error(`Missing key "${key}".`);
    return STRINGS[key];
  };
  const rich = (key: string, values?: Record<string, unknown>): ReactNode => {
    richTags.push(Object.keys(values ?? {}).sort());
    const tag = values?.b as ((chunks: ReactNode) => ReactNode) | undefined;
    return tag ? tag(String(raw(key))) : String(raw(key));
  };
  const t = Object.assign((key: string) => String(raw(key)), {
    rich,
    markup: rich,
    raw,
    has: (k: string) => k in STRINGS,
  });
  return { t: t as RuntimeTranslator, richTags };
}

function episodeInput(locale: EpisodeKitInput['locale']): EpisodeKitInput {
  return {
    locale,
    episode: 'page-template',
    anchors: new Map([
      ['foundations', 'foundations'],
      ['why-a-template', 'foundations--why-a-template'],
    ]),
    refLabel: 'opens speaker note',
  };
}

function slideInput(t: RuntimeTranslator): SlideKitInput {
  return { t, level: 'h3', notes: ['reference-episode'], slideId: 'foundations--why-a-template' };
}

describe('success cases', () => {
  it("hands the Slide the page's locale", () => {
    // ARRANGE
    const expected = 'de';
    // ACT
    const kit = slideKit(episodeInput('de'), slideInput(stubTranslator().t));
    // ASSERT
    expect(kit.locale).toBe(expected);
  });

  it('links to a placed Slide by slug: the localized Episode path with the anchor its position gave it', () => {
    // ARRANGE
    const expected = ['/episode/page-template#foundations--why-a-template', '/de/episode/page-template#foundations'];
    // ACT
    const hrefs = [
      slideKit(episodeInput('en'), slideInput(stubTranslator().t)).slideHref('why-a-template'),
      slideKit(episodeInput('de'), slideInput(stubTranslator().t)).slideHref('foundations'),
    ];
    // ASSERT
    expect(hrefs).toEqual(expected);
  });

  it("returns a key's raw string, placeholders unfilled, for a client component to fill", () => {
    // ARRANGE
    const expected = 'Show all {count}';
    // ACT
    const template = slideKit(episodeInput('en'), slideInput(stubTranslator().t)).template('browse.showAll');
    // ASSERT
    expect(template).toBe(expected);
  });

  it('supplies the default em, b and code tags to t.rich beside the ones the Slide passes', () => {
    // ARRANGE
    const { t, richTags } = stubTranslator();
    const kit = slideKit(episodeInput('en'), slideInput(t));
    const expected = [['b', 'code', 'em', 'ref']];
    // ACT
    kit.t.rich('prose', { ref: kit.ref('reference-episode') });
    // ASSERT
    expect(richTags).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a link to a Slide this Episode does not place, even past the types', () => {
    // ARRANGE
    const kit = slideKit(episodeInput('en'), slideInput(stubTranslator().t));
    const expected = 'no-such-slide';
    // ACT
    const link = () => kit.slideHref('no-such-slide');
    // ASSERT
    expect(link).toThrow(expected);
  });

  it('rejects a template key that holds no string, even past the types', () => {
    // ARRANGE
    const kit = slideKit(episodeInput('en'), slideInput(stubTranslator().t));
    const expected = 'browse.labels';
    // ACT
    const read = () => kit.template('browse.labels');
    // ASSERT
    expect(read).toThrow(expected);
  });
});

describe('edge cases', () => {
  it("lets a Slide's own tag override a default one of the same name", () => {
    // ARRANGE
    const { t } = stubTranslator();
    const kit = slideKit(episodeInput('en'), slideInput(t));
    const own = (chunks: ReactNode) => `[${String(chunks)}]`;
    const expected = '[A <b>bold</b> phrase]';
    // ACT
    const rendered = kit.t.rich('prose', { b: own });
    // ASSERT
    expect(rendered).toBe(expected);
  });

  it('renders the default b tag as an element when the Slide passes none', () => {
    // ARRANGE
    const { t } = stubTranslator();
    const kit = slideKit(episodeInput('en'), slideInput(t));
    const expected = 'b';
    // ACT
    const rendered = kit.t.rich('prose');
    // ASSERT
    expect(isValidElement(rendered) && rendered.type).toBe(expected);
  });
});
