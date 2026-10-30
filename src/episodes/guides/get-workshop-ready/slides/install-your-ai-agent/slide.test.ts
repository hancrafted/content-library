import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { withPagePicks } from '@/episodes/components/slide-shared/guide-toolbar/with-page-picks.client';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { installYourAiAgent } from './slide';

const SECTION = slide({
  slug: 'your-ai-agent',
  messages: { en: { title: 'Your AI agent' }, de: { title: 'Dein KI-Agent' } },
  content: () => null,
});
const TERMINAL = slide({
  slug: 'open-your-terminal',
  messages: { en: { title: 'Open your terminal' }, de: { title: 'Öffne dein Terminal' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, TERMINAL, installYourAiAgent]]).flat();
  return localizeSlide(placed[2] as never, {
    episode: 'get-workshop-ready',
    route: '/guides/get-workshop-ready',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

function render(locale: Locale, picks: Record<string, string> = {}): string {
  const content = createElement(Fragment, null, localized(locale).content);
  return renderToStaticMarkup(withPagePicks(content, picks));
}

/** The Scene as the page renders it, with the viewer's toolbar picks; none picked reads the defaults. */
const scene = (locale: Locale, picks: Record<string, string> = {}) => load(render(locale, picks));

/*
 * Install your AI agent (feedback round 2): the first command typed is the install line, shown with a big Copy button,
 * with the official docs one button away for every AI agent and what might happen under it.
 */

describe('success cases', () => {
  it('speaks its three Voice script segments, in order', () => {
    // ARRANGE
    const expected = ['your-first-command', 'official-docs-always', 'what-might-happen'];
    // ACT
    const segments = localized('en').voiceScript.map(({ slug }) => slug);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('draws the exact install line of the picked AI agent and system, untranslated, with a big Copy button', () => {
    // ARRANGE
    const expected = {
      mac: 'curl -fsSL https://claude.ai/install.sh | bash',
      windows: 'irm https://claude.ai/install.ps1 | iex',
      copilot: 'winget install GitHub.Copilot',
    };
    // ACT
    const first = (picks: Record<string, string>) =>
      scene('de', picks)('[data-copy-line]').first().attr('data-copy-line');
    const actual = {
      mac: first({ os: 'mac', agent: 'claude-code' }),
      windows: first({ os: 'windows', agent: 'claude-code' }),
      copilot: first({ os: 'windows', agent: 'copilot' }),
    };
    // ASSERT
    expect(actual).toEqual(expected);
    expect(scene('de')('[data-copy-button="big"]').length).toBe(1);
  });

  it('links the official docs of the picked AI agent in a new tab', () => {
    // ARRANGE
    const expected = {
      'claude-code': 'https://code.claude.com/docs/en/setup#install-claude-code',
      antigravity: 'https://antigravity.google/docs/getting-started?tab=cli',
      codex: 'https://learn.chatgpt.com/docs/codex/cli',
      copilot:
        'https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/install-copilot-cli#installing-with-the-install-script-macos-and-linux',
    };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((agent) => {
        const link = scene('en', { agent })('a[data-official-link]');
        return [agent, link.attr('href')];
      }),
    );
    // ASSERT
    expect(actual).toEqual(expected);
    expect(scene('en')('a[data-official-link]').attr('target')).toBe('_blank');
  });

  it('tells each AI agent two things that might happen and points to Help', () => {
    // ARRANGE
    const agents = ['claude-code', 'antigravity', 'codex', 'copilot'];
    const perAgent = 2;
    // ACT
    const counts = agents.map((agent) => scene('en', { agent })('[data-happen] li').length);
    // ASSERT
    expect(counts).toEqual(agents.map(() => perAgent));
    expect(scene('en')('[data-happen]').text()).toContain('Press Help');
  });
});

describe('failure cases', () => {
  it('offers the Command Prompt line for Claude Code on Windows only', () => {
    // ARRANGE
    const line = 'curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd';
    // ACT
    const windows = scene('en', { os: 'windows', agent: 'claude-code' })('[data-command-prompt] [data-copy-line]');
    const mac = scene('en', { os: 'mac', agent: 'claude-code' })('[data-command-prompt]');
    // ASSERT
    expect(windows.attr('data-copy-line')).toBe(line);
    expect(mac).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('speaks German with the same install lines', () => {
    // ARRANGE
    const english = scene('en', { os: 'windows', agent: 'claude-code' })('[data-copy-line]').length;
    // ACT
    const german = scene('de', { os: 'windows', agent: 'claude-code' })('[data-copy-line]').length;
    // ASSERT
    expect(german).toBe(english);
  });
});
