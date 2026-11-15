import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import { TocOptions } from './toc-options.client';

describe('success cases', () => {
  it('offers alternate views as checked menu choices beside navigation commands', () => {
    // ARRANGE
    const expected = [
      { name: 'Chat app', checked: 'false' },
      { name: 'Coding agent', checked: 'true' },
    ];
    const props = {
      labels: en.tableOfContents,
      onToggleCollapse: () => undefined,
      agentView: { value: 'coding' as const, choose: () => undefined },
    };
    // ACT
    const $ = load(renderToStaticMarkup(createElement(TocOptions, props)));
    const choices = $('[role="menuitemradio"]')
      .toArray()
      .map((item) => ({ name: $(item).text(), checked: $(item).attr('aria-checked') }));
    // ASSERT
    expect(choices).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps navigation commands without offering views on a page that did not opt in', () => {
    // ARRANGE
    const expected = { views: 0, commands: ['Collapse contents'] };
    // ACT
    const $ = load(
      renderToStaticMarkup(
        createElement(TocOptions, { labels: en.tableOfContents, onToggleCollapse: () => undefined }),
      ),
    );
    const seen = {
      views: $('[role="menuitemradio"]').length,
      commands: $('[role="menuitem"]')
        .toArray()
        .map((item) => $(item).text()),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('offers the localized view menu on mobile even without a rail-collapse command', () => {
    // ARRANGE
    const expected = { group: 'Ansicht', checked: ['true', 'false'], names: ['Chat-App', 'Coding-Agent'] };
    // ACT
    const $ = load(
      renderToStaticMarkup(
        createElement(TocOptions, {
          labels: de.tableOfContents,
          agentView: { value: 'chat', choose: () => undefined },
        }),
      ),
    );
    const choices = $('[role="menuitemradio"]').toArray();
    const seen = {
      group: $('[role="group"]').attr('aria-label'),
      checked: choices.map((item) => $(item).attr('aria-checked')),
      names: choices.map((item) => $(item).text()),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('omits the mobile menu when neither views nor navigation commands are available', () => {
    // ARRANGE
    const props = { labels: en.tableOfContents };
    // ACT
    const html = renderToStaticMarkup(createElement(TocOptions, props));
    // ASSERT
    expect(html).toBe('');
  });
});
