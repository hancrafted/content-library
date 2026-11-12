import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SoftwareEcology } from './software-ecology';
import { wordsFor } from './software-ecology-data';

const render = (props: Parameters<typeof SoftwareEcology>[0]): string =>
  renderToStaticMarkup(createElement(SoftwareEcology, props));

/** A pressed button whose text is `name`, whatever attributes follow `aria-pressed`. */
const pressed = (name: string): RegExp =>
  new RegExp(`aria-pressed="true"[^>]*>${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`);

describe('success cases', () => {
  it('renders the factory with its toolbar, every work center and the Customer in English', () => {
    // ARRANGE
    const titles = ['Customer', 'Quality assurance', 'Ideal', 'Realistic', 'Tire swing'];
    const note = 'Illustrative model, not measured';
    // ACT
    const html = render({ locale: 'en' });
    // ASSERT
    for (const t of titles) expect(html).toContain(`>${t}<`);
    expect(html).toContain(note);
  });

  it('opens on Tire swing 2.0: each department with its job, its cartoon panel and the quote under it, and the three tiles', () => {
    // ARRANGE
    const cartoon = wordsFor('en').cartoon;
    const quotes = [cartoon.captions.explained, cartoon.captions.eng, cartoon.captions.doc, cartoon.captions.needed];
    const shown = ['Tire swing 2.0', 'Engineering', 'Turns the spec into code', 'Analysis', 'ADR'];
    const captions = quotes.map((t) => `>${t}</figcaption>`);
    const texts = shown.map((t) => `>${t}<`);
    const active = pressed('Tire swing 2.0');
    const retiredView = 'data-card-view="swing"';
    // ACT
    const html = render({ locale: 'en' });
    // ASSERT
    for (const c of captions) expect(html).toContain(c);
    for (const t of texts) expect(html).toContain(t);
    expect(html).toMatch(active);
    expect(html).not.toContain(retiredView);
  });

  it('labels the roles state Roles on a use case without the cartoon', () => {
    // ARRANGE
    const label = pressed('Roles');
    // ACT
    const html = render({ locale: 'en', useCase: 'gate' });
    // ASSERT
    expect(html).toMatch(label);
  });

  it('opens a Slide still naming swing on the roles state', () => {
    // ARRANGE
    const label = pressed('Reifenschaukel 2.0');
    // ACT
    const html = render({ locale: 'de', preset: 'swing' });
    // ASSERT
    expect(html).toMatch(label);
  });

  it('shows each role’s job and artefacts in the roles state, and why Documentation is no work center', () => {
    // ARRANGE
    const job = 'Turns the spec into code';
    const artefact = 'pull request';
    const why = wordsFor('en').cartoon.jobs.doc as string;
    // ACT
    const html = render({ locale: 'en', preset: 'roles' });
    // ASSERT
    for (const t of [job, artefact, why]) expect(html).toContain(`>${t}<`);
  });

  it('names Pause by what it does next: Pause while the factory runs', () => {
    // ARRANGE
    const pause = `aria-label="${wordsFor('en').toolbar.pause}"`;
    // ACT
    const html = render({ locale: 'en' });
    // ASSERT
    expect(html).toContain(pause);
  });

  it('renders the German words at /de', () => {
    // ARRANGE
    const german = wordsFor('de');
    // ACT
    const html = render({ locale: 'de' });
    // ASSERT
    expect(html).toContain(german.stage.note);
    expect(html).toContain(german.toolbar.warming);
  });

  it('places a Slide’s Context target and marker on the spot it names', () => {
    // ARRANGE
    const target = { 'data-target': 'qa-rack' };
    const marker = 'MARKER-QA-UNREAD';
    // ACT
    const html = render({
      locale: 'en',
      preset: 'ideal',
      targets: { 'qa:rack': target },
      markers: { 'qa:unread': marker },
    });
    // ASSERT
    expect(html).toContain('data-target="qa-rack"');
    expect(html).toContain(marker);
  });
});

describe('failure cases', () => {
  it('draws no cartoon panel for a use case without the cartoon', () => {
    // ARRANGE
    const roles = 'data-card-view="role"';
    const panel = wordsFor('en').cartoon.captions.explained as string;
    // ACT
    const html = render({ locale: 'en', useCase: 'gate', preset: 'roles' });
    // ASSERT
    expect(html).toContain(roles);
    expect(html).not.toContain(panel);
  });

  it('falls back to English for a locale it has no words for', () => {
    // ARRANGE
    const english = wordsFor('en');
    // ACT
    const html = render({ locale: 'fr' });
    // ASSERT
    expect(html).toContain(english.stage.note);
  });
});

describe('edge cases', () => {
  it('lets a Slide override one word and keeps every other default', () => {
    // ARRANGE
    const note = 'A model, not a measurement';
    const clear = wordsFor('en').toolbar.clear;
    // ACT
    const html = render({ locale: 'en', words: { stage: { note } } });
    // ASSERT
    expect(html).toContain(note);
    expect(html).toContain(clear);
  });
});
