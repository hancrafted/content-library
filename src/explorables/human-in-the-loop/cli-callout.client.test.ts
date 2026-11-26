import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CliCallout } from './cli-callout.client';
import { showsCliCallout } from './cli-callout.pure';

const WORDS = {
  cliCallout: 'CLI mode needs the {skills} set up. Simplest route: {download}.',
  cliCalloutSkills: 'Matt Pocock skills',
  cliCalloutDownload: 'download the starter folder',
};
const GUIDE = '/guides/setup-ai-agent-and-starter-folder';
const SKILLS_ANCHOR = '#the-technical-route--set-up-the-matt-pocock-skills-yourself';
const DOWNLOAD_ANCHOR = '#your-folder--download-and-unzip-the-starter-folder';

const render = (locale: 'en' | 'de') => load(renderToStaticMarkup(createElement(CliCallout, { words: WORDS, locale })));

describe('success cases', () => {
  it('links the skills and the download to their slides in the setup Guide', () => {
    // ARRANGE
    const $ = render('en');
    const expectedLinks = [
      ['Matt Pocock skills', `${GUIDE}${SKILLS_ANCHOR}`],
      ['download the starter folder', `${GUIDE}${DOWNLOAD_ANCHOR}`],
    ];
    const expectedText = 'CLI mode needs the Matt Pocock skills set up. Simplest route: download the starter folder.';
    // ACT
    const links = $('[data-cli-callout] a')
      .toArray()
      .map((a) => [$(a).text(), $(a).attr('href')]);
    const text = $('[data-cli-callout]').text();
    // ASSERT
    expect(links).toEqual(expectedLinks);
    expect(text).toBe(expectedText);
  });

  it('shows the callout while CLI mode is on and offered', () => {
    // ARRANGE
    const bar = { level: 'technical', controls: {}, readonly: false } as const;
    // ACT
    const shown = showsCliCallout(bar);
    // ASSERT
    expect(shown).toBe(true);
  });
});

describe('failure cases', () => {
  it('hides the callout in chat mode', () => {
    // ARRANGE
    const bar = { level: 'simple', controls: {}, readonly: false } as const;
    // ACT
    const shown = showsCliCallout(bar);
    // ASSERT
    expect(shown).toBe(false);
  });

  it('hides the callout when the Preset hides the CLI control or the Explorable is readonly', () => {
    // ARRANGE
    const hidden = { level: 'technical', controls: { level: { show: false } }, readonly: false } as const;
    const locked = { level: 'technical', controls: {}, readonly: true } as const;
    // ACT
    const shown = [showsCliCallout(hidden), showsCliCallout(locked)];
    // ASSERT
    expect(shown).toEqual([false, false]);
  });
});

describe('edge cases', () => {
  it('links the German Guide from the German Explorable, keeping the anchors', () => {
    // ARRANGE
    const $ = render('de');
    const expectedHrefs = [`/de${GUIDE}${SKILLS_ANCHOR}`, `/de${GUIDE}${DOWNLOAD_ANCHOR}`];
    // ACT
    const hrefs = $('[data-cli-callout] a')
      .toArray()
      .map((a) => $(a).attr('href'));
    // ASSERT
    expect(hrefs).toEqual(expectedHrefs);
  });
});
