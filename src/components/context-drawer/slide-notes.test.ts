import type { SpeakerNoteItem } from '@/lib/context-drawer.pure';
import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ContextDrawerLabels } from './context-drawer-input';
import { SlideNotes } from './slide-notes';

/*
 * A Speaker note's sources as the drawer renders them (FE-010 §6, design-ADR 0016 Citations rule 7): a Source cited
 * directly opens in a new tab; a cited Research question shows its title, links to its page and says how settled it
 * is, in the page's language.
 */

const LABELS: ContextDrawerLabels = {
  strings: {
    title: 'Kontext',
    open: 'Öffnen',
    close: 'Schließen',
    shortcut: 'Tastenkürzel',
    slide: 'Folie',
    tabs: { notes: 'Sprechernotizen', script: 'Sprechtext' },
    menu: { label: 'Mehr', layout: 'Layout', beside: 'Daneben', over: 'Darüber' },
    empty: { notes: 'Keine Notizen.', script: 'Kein Sprechtext.' },
    opensInNewTab: 'öffnet in neuem Tab',
    keywords: 'Stichwörter',
    bridge: 'Überleitung',
    researchQuestion: 'Forschungsfrage',
    confidence: { settled: 'Gesichert', contested: 'Umstritten', open: 'Offen' },
  },
  sources: (count) => `Quellen (${count})`,
  citation: (number) => `Quelle ${number}`,
};

function note(sources: SpeakerNoteItem['sources']): SpeakerNoteItem {
  return { slug: 'claim', header: 'Eine Behauptung', description: 'Sie stimmt [1].', target: 'prose', sources };
}

function rendered(sources: SpeakerNoteItem['sources']) {
  return load(renderToStaticMarkup(createElement(SlideNotes, { notes: [note(sources)], labels: LABELS })));
}

const CITED = {
  slug: 'onboarding',
  research: 'AIE-0001',
  title: 'Why do others frame working with AI as onboarding a colleague?',
  confidence: 'contested',
  page: { path: '/research/AIE-0001', locale: 'en' },
} as const;

describe('success cases', () => {
  it('A Speaker note that cites a Research question shows its title, links to its page and shows how settled it is', () => {
    // ARRANGE
    const expected = {
      title: 'Why do others frame working with AI as onboarding a colleague?',
      href: '/research/AIE-0001',
      confidence: 'Umstritten',
      value: 'contested',
    };
    // ACT
    const $ = rendered([CITED]);
    const link = $('li[data-source="1"] a');
    const observed = {
      title: link.text(),
      href: link.attr('href'),
      confidence: $('li[data-source="1"] [data-confidence]').text(),
      value: $('li[data-source="1"] [data-confidence]').attr('data-confidence'),
    };
    // ASSERT
    expect(observed).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('opens no new tab for a cited Research question, which is a page of this site', () => {
    // ARRANGE
    const $ = rendered([CITED]);
    // ACT
    const target = $('li[data-source="1"] a').attr('target');
    // ASSERT
    expect(target).toBeUndefined();
  });
});

describe('edge cases', () => {
  it('shows a staged Research question by title and confidence, without a link, until Promotion gives it a page', () => {
    // ARRANGE
    const { slug, research, title, confidence } = CITED;
    const staged = { slug, research, title, confidence };
    const expected = { links: 0, title: CITED.title, confidence: 'Umstritten' };
    // ACT
    const $ = rendered([staged]);
    const observed = {
      links: $('li[data-source="1"] a').length,
      title: $('li[data-source="1"] [data-source-title]').text(),
      confidence: $('li[data-source="1"] [data-confidence]').text(),
    };
    // ASSERT
    expect(observed).toEqual(expected);
  });
});
