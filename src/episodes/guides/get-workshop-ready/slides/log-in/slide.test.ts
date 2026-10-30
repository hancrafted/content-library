import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { withPagePicks } from '@/episodes/components/slide-shared/guide-toolbar/with-page-picks.client';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { logIn } from './slide';

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
  const placed = placeSections<Slide>([[SECTION, TERMINAL, logIn]]).flat();
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
 * Log in (feedback round 2): the second command is the AI agent's launch line, and the Slide first says to open a NEW
 * terminal window, with the "command not found" failure and its fix.
 */

describe('success cases', () => {
  it('speaks its three Voice script segments, in order', () => {
    // ARRANGE
    const expected = ['open-a-new-window', 'second-command', 'which-option'];
    // ACT
    const segments = localized('en').voiceScript.map(({ slug }) => slug);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('puts the new-window warning before the launch line', () => {
    // ARRANGE
    const html = render('en');
    // ACT
    const warning = html.indexOf('data-new-window');
    const firstLine = html.indexOf('data-copy-line');
    // ASSERT
    expect(warning).toBeGreaterThan(-1);
    expect(warning).toBeLessThan(firstLine);
  });

  it("copies each AI agent's launch command, and GitHub Copilot's /login inside it", () => {
    // ARRANGE
    const expected = [['claude'], ['agy'], ['codex'], ['copilot', '/login']];
    // ACT
    const actual = ['claude-code', 'antigravity', 'codex', 'copilot'].map((agent) =>
      scene('de', { agent })('[data-copy-line]')
        .map((_, el) => scene('de')(el).attr('data-copy-line'))
        .get(),
    );
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('links back to the Slide that opens a terminal', () => {
    // ARRANGE
    const $ = scene('en');
    // ACT
    const href = $('[data-new-window] a').attr('href');
    // ASSERT
    expect(href).toContain('your-ai-agent');
  });

  it('lists the real Codex sign-in labels in order and marks only ChatGPT as the one to pick', () => {
    // ARRANGE
    const expected = ['Sign in with ChatGPT', 'Sign in with Device Code', 'Sign in another way'];
    // ACT
    const options = scene('en', { agent: 'codex' })('[data-pick] [data-option]');
    const labels = options.map((_, el) => scene('en')(el).attr('data-label')).get();
    const recommended = scene('en', { agent: 'codex' })('[data-pick] [data-recommended]');
    // ASSERT
    expect(labels).toEqual(expected);
    expect(recommended).toHaveLength(1);
    expect(recommended.attr('data-option')).toBe('chatgpt');
  });

  it('asks Codex users to trust the folder only for the starter folder', () => {
    // ARRANGE
    const expected = ['Trust this folder?', '1. Trust and continue'];
    // ACT
    const text = scene('en', { agent: 'codex' })('[data-after]').text();
    // ASSERT
    for (const phrase of expected) expect(text).toContain(phrase);
  });

  it('tells Copilot users to open the device login page', () => {
    // ARRANGE
    const expected = 'github.com/login/device';
    // ACT
    const text = scene('en', { agent: 'copilot' })('[data-pick]').text();
    // ASSERT
    expect(text).toContain(expected);
  });
});

describe('failure cases', () => {
  it('names the "not found" failure and its fix', () => {
    // ARRANGE
    const $ = scene('en');
    // ACT
    const text = $('[data-not-found]').text();
    // ASSERT
    expect(text).toContain('command not found');
    expect(text).toContain('old window');
  });
});

describe('edge cases', () => {
  it('describes the Claude Code options in words, since their labels are not published', () => {
    // ARRANGE
    const $ = scene('en', { agent: 'claude-code' });
    // ACT
    const labels = $('[data-pick] [data-option]').filter((_, el) => $(el).attr('data-label') !== undefined);
    // ASSERT
    expect(labels).toHaveLength(0);
    expect($('[data-pick]').text()).toContain('Pro, Max, Ultra, Team or Enterprise');
  });

  it('gives every AI agent one option to pick, in German too', () => {
    // ARRANGE
    const agents = ['claude-code', 'antigravity', 'codex', 'copilot'];
    // ACT
    const counts = agents.map((agent) => scene('de', { agent })('[data-pick] [data-recommended]').length);
    // ASSERT
    expect(counts.every((count) => count >= 1)).toBe(true);
  });

  it('says how to open a new window on each of the three systems', () => {
    // ARRANGE
    const expected = { mac: 'On a Mac', windows: 'On Windows', linux: 'On Linux' };
    // ACT
    const actual = Object.fromEntries(
      Object.keys(expected).map((os) => [os, scene('en', { os })('[data-new-window]').text()]),
    );
    // ASSERT
    for (const [os, phrase] of Object.entries(expected)) expect(actual[os]).toContain(phrase);
  });
});
