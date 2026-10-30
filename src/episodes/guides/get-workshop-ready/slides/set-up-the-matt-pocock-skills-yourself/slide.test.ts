import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { setUpTheMattPocockSkillsYourself } from './slide';

/*
 * Set up the Matt Pocock skills yourself (Spec Option 8a), read through the one interface the page reads a Slide by:
 * localized into the Guide on the shared Slide header, its Voice script as the drawer gets it and its Scene as the page
 * renders it. The section slide is a stand-in, so the test reaches no Guide file.
 */

const SECTION = slide({
  slug: 'the-technical-route',
  messages: { en: { title: 'The technical route' }, de: { title: 'Der technische Weg' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, setUpTheMattPocockSkillsYourself]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'get-workshop-ready',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it("speaks the Spec's two Voice script segments, in order", () => {
    // ARRANGE
    const expected = ['same-chain-built-by-hand', 'same-proof'];
    // ACT
    const segments = localized('en').voiceScript.map(({ slug }) => slug);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('lists the five rows of the recipe in order, in both languages', () => {
    // ARRANGE
    const expected = {
      en: [
        'Install Node.js',
        'Add the main Matt Pocock skills',
        'Run his setup skill in your AI agent',
        'Add our check and the hancrafted entry',
        'Run the same check as step 4',
      ],
      de: [
        'Node.js installieren',
        'Die Haupt-Skills von Matt Pocock hinzufügen',
        'Seinen Setup-Skill in Deinem KI-Agenten ausführen',
        'Unseren Check und den hancrafted-Eintrag hinzufügen',
        'Denselben Check wie in Schritt 4 ausführen',
      ],
    };
    // ACT
    const titles = (locale: Locale) =>
      scene(locale)('[data-row] [data-row-title]')
        .map((_, el) => scene(locale)(el).text().trim())
        .get();
    const actual = { en: titles('en'), de: titles('de') };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('offers the three exact lines to copy, untranslated, the check as the focal one', () => {
    // ARRANGE
    const expected = {
      lines: ['npx skills@latest add mattpocock/skills', '/setup-matt-pocock-skills', '/check-workshop-readiness'],
      focal: 'run',
    };
    // ACT
    const $ = scene('de');
    const actual = {
      lines: $('[data-copy-line]')
        .map((_, el) => $(el).attr('data-copy-line'))
        .get(),
      focal: $('[data-row][data-focal]').attr('data-row'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('never links the check bundle to a download that does not exist yet', () => {
    // ARRANGE
    const bundle = '[data-check-bundle]';
    // ACT
    const $ = scene('en');
    const actual = { pill: $(`${bundle} [data-zip]`).length, href: $(`${bundle} [data-zip]`).attr('href') };
    // ASSERT
    expect(actual).toEqual({ pill: 1, href: undefined });
  });
});

describe('edge cases', () => {
  it('ticks only the main group in the installer drawing, by its untranslated name', () => {
    // ARRANGE
    const expected = ['mattpocock-skills'];
    // ACT
    const $ = scene('de');
    const picked = $('[data-row="add"] [data-picked]')
      .map((_, el) => $(el).find('span').first().text().trim())
      .get();
    // ASSERT
    expect(picked).toEqual(expected);
  });

  it('shows the glossary entry to paste as its term and its line, untranslated', () => {
    // ARRANGE
    const expected = ['**hancrafted**:', "Han's workshop homepage, https://hancrafted.net"];
    // ACT
    const $ = scene('de');
    const lines = $('[data-check-bundle] p')
      .map((_, el) => $(el).text())
      .get();
    // ASSERT
    expect(lines).toEqual(expected);
  });
});
