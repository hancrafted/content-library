import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SoftwareEcology } from './software-ecology';
import { wordsFor } from './software-ecology-data';

const render = (props: Parameters<typeof SoftwareEcology>[0]): string =>
  renderToStaticMarkup(createElement(SoftwareEcology, props));

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

  it('opens on Swing: the cartoon panels at their work centers and the tiles for Documentation, Billing and the wanted swing', () => {
    // ARRANGE
    const cartoon = wordsFor('en').cartoon;
    const shown = [cartoon.captions.explained, cartoon.captions.eng, cartoon.captions.doc, cartoon.captions.needed];
    const swing = 'data-card-view="swing"';
    // ACT
    const html = render({ locale: 'en' });
    // ASSERT
    for (const t of shown) expect(html).toContain(`>${t}<`);
    expect(html).toContain(swing);
  });

  it('shows each role’s job and artefacts in Roles, and why Documentation is no work center', () => {
    // ARRANGE
    const job = 'Turns the spec into code';
    const artefact = 'pull request';
    const why = wordsFor('en').cartoon.jobs.doc as string;
    // ACT
    const html = render({ locale: 'en', preset: 'roles' });
    // ASSERT
    for (const t of [job, artefact, why]) expect(html).toContain(`>${t}<`);
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
