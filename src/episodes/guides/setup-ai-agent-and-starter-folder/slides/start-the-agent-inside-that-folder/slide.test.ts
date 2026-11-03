import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { withPagePicks } from '@/episodes/components/slide-shared/guide-toolbar/with-page-picks.client';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { startTheAgentInsideThatFolder } from './slide';

function scene(locale: Locale, os: string, agent: string) {
  const section = slide({
    slug: 'your-folder',
    messages: { en: { title: 'Your folder' }, de: { title: 'Dein Ordner' } },
    content: () => null,
  });
  const placed = placeSections<Slide>([[section, startTheAgentInsideThatFolder]]).flat();
  const localized = localizeSlide(placed[1] as never, {
    episode: 'setup-ai-agent-and-starter-folder',
    route: '/guides/setup-ai-agent-and-starter-folder',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
  const content = createElement(Fragment, null, localized.content);
  return load(renderToStaticMarkup(withPagePicks(content, { os, agent })));
}

describe('success cases', () => {
  it('keeps the PowerShell menu primary and the agent-specific address-bar route in closed help', () => {
    // ARRANGE
    const expected = ['powershell', 'pwsh'];
    const menuLabel = 'Open PowerShell window here';
    // ACT
    const shells = ['claude-code', 'copilot'].map((agent) =>
      scene('en', 'windows', agent)('[data-explorer-shell]').text(),
    );
    const $ = scene('en', 'windows', 'claude-code');
    const fallback = $('[data-folder-check]').closest('details');
    // ASSERT
    expect(shells).toEqual(expected);
    expect($('[data-windows-menu]').text()).toContain(menuLabel);
    expect(fallback).toHaveLength(1);
    expect(fallback.attr('open')).toBeUndefined();
    expect(fallback.find('[data-explorer-shell]')).toHaveLength(1);
  });

  it('checks the actual folder and starter file before launching the agent', () => {
    // ARRANGE
    const expected = ['Get-Location', "Get-Content -LiteralPath '.\\GLOSSARY.md' -TotalCount 3"];
    const checkSelector = '[data-folder-check] [data-copy-line]';
    const launchSelector = '[data-agent-start]';
    const $ = scene('en', 'windows', 'claude-code');
    // ACT
    const commands = $(checkSelector)
      .map((_, el) => $(el).attr('data-copy-line'))
      .get();
    const html = $.html();
    const checkAt = html.indexOf('data-folder-check');
    const launchAt = html.indexOf('data-agent-start');
    // ASSERT
    expect(commands).toEqual(expected);
    expect($(launchSelector)).toHaveLength(1);
    expect(checkAt).toBeLessThan(launchAt);
  });
});

describe('failure cases', () => {
  it('does not send Windows users to an assumed Downloads path', () => {
    // ARRANGE
    const wrongCommand = 'cd Downloads\\hancrafted-workshop-starter';
    const actualPath = 'actual';
    // ACT
    const text = scene('en', 'windows', 'claude-code')('[data-folder-fallback]').text();
    // ASSERT
    expect(text).not.toContain(wrongCommand);
    expect(text).toContain(actualPath);
  });
});

describe('edge cases', () => {
  it('keeps the Mac menu and does not show Windows checks on Mac', () => {
    // ARRANGE
    const menu = 'New Terminal at Folder';
    // ACT
    const $ = scene('en', 'mac', 'claude-code');
    // ASSERT
    expect($.text()).toContain(menu);
    expect($('[data-folder-check]')).toHaveLength(0);
  });

  it('keeps the PowerShell commands unchanged in German', () => {
    // ARRANGE
    const expected = ['Get-Location', "Get-Content -LiteralPath '.\\GLOSSARY.md' -TotalCount 3"];
    // ACT
    const $ = scene('de', 'windows', 'copilot');
    const commands = $('[data-folder-check] [data-copy-line]')
      .map((_, el) => $(el).attr('data-copy-line'))
      .get();
    // ASSERT
    expect(commands).toEqual(expected);
  });
});
