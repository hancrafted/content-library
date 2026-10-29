import { localizeSlide, type LocalizedSlide } from '@/episodes/components/slide-master/localized-slide';
import { slide, type Slide } from '@/episodes/components/slide-master/slide';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { runYourFirstSkill } from './slide';

/*
 * "Run your first skill" (Spec Option 7a), read through the one interface the page reads a Slide by: localized on the
 * shared Slide header, its notes and Voice script as the drawer gets them, and its Scene as the page renders it under
 * the page's toolbar picks. The section slide is a stand-in, so the test reaches no Episode file.
 */

const SECTION = slide({
  slug: 'your-first-skill',
  messages: { en: { title: 'Your first skill' }, de: { title: 'Dein erster Skill' } },
  content: () => null,
});

function localized(locale: Locale): LocalizedSlide {
  const placed = placeSections<Slide>([[SECTION, runYourFirstSkill]]).flat();
  return localizeSlide(placed[1] as never, {
    episode: 'get-workshop-ready',
    locale,
    placed,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

/** The Scene as the page renders it before the viewer picks: Mac and Claude Code, the page picks' defaults. */
const scene = (locale: Locale) => load(renderToStaticMarkup(createElement(Fragment, null, localized(locale).content)));

describe('success cases', () => {
  it('speaks the three Voice script segments of the Spec, in order', () => {
    // ARRANGE
    const expected = ['type-the-skill', 'say-yes', 'the-proof'];
    // ACT
    const segments = localized('en').voiceScript.map(({ slug }) => slug);
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('cites seven, one and one sources in its three Speaker notes', () => {
    // ARRANGE
    const expected = [
      ['the-prompt-is-a-safeguard', 7],
      ['claude-codes-prompt', 1],
      ['why-approvals-are-kept', 1],
    ];
    // ACT
    const notes = localized('en').notes.map((note) => [note.slug, note.sources?.length ?? 0]);
    // ASSERT
    expect(notes).toEqual(expected);
  });

  it("shows Claude Code's prompt by default, asking to open the homepage on a Mac", () => {
    // ARRANGE
    const expected = {
      window: 'workshop-starter · Claude Code',
      command: 'open https://hancrafted.net',
      question: 'Do you want to proceed?',
    };
    // ACT
    const $ = scene('en');
    const seen = {
      window: $('[data-prompt-window]').text(),
      command: $('[data-command]').text(),
      question: $('[data-question]').text(),
    };
    // ASSERT
    expect(seen).toEqual(expected);
  });

  it('opens each of the three Speaker notes from a Context marker', () => {
    // ARRANGE
    const expected = ['the-prompt-is-a-safeguard', 'claude-codes-prompt', 'why-approvals-are-kept'];
    // ACT
    const markers = scene('en')('[data-context-ref]')
      .map((_, el) => el.attribs['data-context-ref'])
      .get();
    // ASSERT
    expect(markers).toEqual(expected);
  });

  it('names the default OS, AI agent and step above the troubleshooting box', () => {
    // ARRANGE
    const expected = 'Mac · Claude Code · Schritt 7: Deinen ersten Skill ausführen';
    // ACT
    const line = scene('de')('[data-stuck-context]').text();
    // ASSERT
    expect(line).toBe(expected);
  });
});

describe('failure cases', () => {
  it('shows no OS toggle, since its content does not differ by operating system', () => {
    // ARRANGE
    const expected = { os: 0, agent: 1 };
    // ACT
    const $ = scene('en');
    const seen = { os: $('[data-toolbar="os"]').length, agent: $('[data-toolbar="agent"]').length };
    // ASSERT
    expect(seen).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('marks Claude Code as the picked AI agent before the viewer picks', () => {
    // ARRANGE
    const expected = ['Claude Code'];
    // ACT
    const pressed = scene('en')('[data-toolbar="agent"] button[aria-pressed="true"]')
      .map((_, el) => scene('en')(el).text())
      .get();
    // ASSERT
    expect(pressed).toEqual(expected);
  });
});
