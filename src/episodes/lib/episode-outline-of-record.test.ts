import { describe, expect, it } from 'vitest';
import { instanceOf } from './episode-instance';
import type { InstanceBase, InstanceSlide } from './episode-instance.pure';
import { recordOutline, withTextAs } from './episode-outline-of-record';
import type { SectionList } from './episode.pure';

interface Titled {
  readonly en: { readonly title: string };
  readonly de: { readonly title: string };
}

declare module './episode-instance' {
  interface BaseSlideMessages {
    'outline-of-record-demo': { readonly hero: Titled; readonly why: Titled; readonly watch: Titled };
  }
}

const text = (title: string) => ({ en: { title }, de: { title: `${title}-de` } });
const slideOf = (slug: string, title: string): InstanceSlide => ({ slug, messages: text(title) });

interface Demo extends InstanceBase {
  readonly slug: 'outline-of-record-demo';
  readonly messages: typeof EPISODE_TEXT;
  readonly sections: readonly SectionList<InstanceSlide>[];
}

const demo = (fields: Omit<Demo, 'slug' | 'messages'>): Demo => ({
  slug: 'outline-of-record-demo',
  messages: EPISODE_TEXT,
  ...fields,
});
const EPISODE_TEXT = {
  en: { title: 'Cash', caption: 'c', description: 'd' },
  de: { title: 'Geld', caption: 'c', description: 'd' },
};
const HERO = slideOf('hero', 'Hero');
const WHY = slideOf('why', 'Why');
const WATCH = slideOf('watch', 'Watch');
const ADDED = slideOf('added', 'Added');

const BASE = demo({ title: HERO, sections: [[WHY, WATCH]] });

const slugAndAnchor = (record: InstanceBase) =>
  recordOutline(record)
    .sections.flat()
    .map(({ slug, anchor }) => `${slug}@${anchor}`);

describe('success cases', () => {
  it('gives a record that is no instance its own text objects, one layer each, and placed anchors', () => {
    // ARRANGE
    const expected = { base: undefined, title: [HERO.messages.en], why: [WHY.messages.de], episode: [EPISODE_TEXT.en] };
    // ACT
    const outline = recordOutline(BASE);
    // ASSERT
    expect({
      base: outline.base,
      title: outline.title?.text.en,
      why: outline.sections[0][0].text.de,
      episode: outline.text.en,
    }).toEqual(expected);
    expect(outline.sections[0][0].text.de[0]).toBe(WHY.messages.de);
  });

  it("lists an Episode instance's text as the Base Episode's object first, then each layer's override object", () => {
    // ARRANGE
    const titleEn = { title: 'Cash at the Event' };
    const whyDe = { title: 'Warum hier' };
    // ACT
    const outline = recordOutline(
      instanceOf(BASE, { title: { messages: { en: titleEn } }, slides: { why: { messages: { de: whyDe } } } }),
    );
    // ASSERT
    expect({ base: outline.base, episode: outline.text.en, why: outline.sections[0][0].text.de }).toEqual({
      base: BASE.slug,
      episode: [EPISODE_TEXT.en, titleEn],
      why: [WHY.messages.de, whyDe],
    });
  });

  it('converts every text object with the function it is given', () => {
    // ARRANGE
    const files = new Map<object, string>([
      [EPISODE_TEXT.en, 'cash/i18n/en.json'],
      [EPISODE_TEXT.de, 'cash/i18n/de.json'],
      [HERO.messages.en, 'hero/en.json'],
      [HERO.messages.de, 'hero/de.json'],
      [WHY.messages.en, 'why/en.json'],
      [WHY.messages.de, 'why/de.json'],
      [WATCH.messages.en, 'watch/en.json'],
      [WATCH.messages.de, 'watch/de.json'],
    ]);
    const expected = { en: ['why/en.json'], de: ['why/de.json'] };
    // ACT
    const outline = withTextAs(recordOutline(BASE), (each) => files.get(each));
    // ASSERT
    expect(outline.sections[0][0].text).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('refuses a record composing one Slide slug twice', () => {
    // ARRANGE
    const twice = demo({ sections: [[WHY], [WHY]] });
    const expected = 'Duplicate Slide slug "why"';
    // ACT
    const outlining = () => recordOutline(twice);
    // ASSERT
    expect(outlining).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('takes an inserted Slide its text from its own record, after the Section operations moved it', () => {
    // ARRANGE
    const expected = ['why@why', 'added@why--added', 'watch@why--watch'];
    // ACT
    const instance = instanceOf(BASE, { sections: [{ insert: ADDED, after: 'why' }] });
    // ASSERT
    expect(slugAndAnchor(instance)).toEqual(expected);
    expect(recordOutline(instance).sections[0][1].text.en).toEqual([ADDED.messages.en]);
  });
});
