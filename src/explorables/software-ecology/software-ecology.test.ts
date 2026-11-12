import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SoftwareEcology } from './software-ecology';
import { wordsFor } from './software-ecology-data';

const render = (props: Parameters<typeof SoftwareEcology>[0]): string =>
  renderToStaticMarkup(createElement(SoftwareEcology, props));

/** A pressed step button whose text is `name`, after its number badge. */
const pressed = (name: string): RegExp =>
  new RegExp(`aria-pressed="true"[^>]*><span[^>]*>[①②③]</span>${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<`);

/*
 * Eval hooks of the whole page (design-ADR 0024 §14, feature guide "Eval hooks"): every interactive control of the
 * toolbar, the closed menus, the Settings popover and the cards names itself in a unique, stable `data-control`, and the
 * cards write their read-outs as plain `data-readout-*` values.
 */
const INTERACTIVE =
  'button, input, select, textarea, summary, [role="button"], [role="switch"], [role="menuitemradio"]';

const controlsOf = (html: string) =>
  load(`<body>${html}</body>`)(INTERACTIVE)
    .toArray()
    .map((el) => ({ tag: el.tagName, control: el.attribs['data-control'], label: el.attribs['aria-label'] ?? '' }));

describe('success cases', () => {
  it('renders the factory with its toolbar, every work center and the Customer in English', () => {
    // ARRANGE
    const titles = ['Customer', 'Quality assurance', 'In theory', 'In practice', 'Tire swing'];
    const note = 'Illustrative model, not measured';
    // ACT
    const html = render({ locale: 'en', preset: 'ideal' });
    // ASSERT
    for (const t of titles) expect(html).toContain(`>${t}<`);
    expect(html).toContain(note);
  });

  it('opens on Who does what: each department with its job, its cartoon panel and the quote under it, and the three tiles', () => {
    // ARRANGE
    const cartoon = wordsFor('en').cartoon;
    const quotes = [cartoon.captions.explained, cartoon.captions.eng, cartoon.captions.doc, cartoon.captions.needed];
    const shown = ['Who does what', 'Engineering', 'Turns the spec into code', 'Analysis', 'ADR'];
    const captions = quotes.map((t) => `>${t}</figcaption>`);
    const texts = shown.map((t) => `>${t}<`);
    const active = pressed('Who does what');
    const retiredView = 'data-card-view="swing"';
    // ACT
    const html = render({ locale: 'en' });
    // ASSERT
    for (const c of captions) expect(html).toContain(c);
    for (const t of texts) expect(html).toContain(t);
    expect(html).toMatch(active);
    expect(html).not.toContain(retiredView);
  });

  it('labels the roles state Who does what on a use case without the cartoon', () => {
    // ARRANGE
    const label = pressed('Who does what');
    // ACT
    const html = render({ locale: 'en', useCase: 'gate' });
    // ASSERT
    expect(html).toMatch(label);
  });

  it('opens a Slide still naming swing on the roles state', () => {
    // ARRANGE
    const label = pressed('Wer macht was');
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

  it('places a Slide’s Context target on the spot it names, and draws no marker on the floor', () => {
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
    expect(html).not.toContain(marker);
  });

  it('gives every control of the toolbar, its menus, the Settings popover and the cards a data-control', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const missing = controlsOf(render({ locale: 'en', preset: 'realistic' }))
      .filter((c) => !c.control)
      .map((c) => `${c.tag} ${c.label}`);
    // ASSERT
    expect(missing).toEqual(expected);
  });

  it('names the toolbar, Settings and node controls by the documented scheme', () => {
    // ARRANGE
    const expected = [
      'toolbar.state.ideal',
      'toolbar.scenarios',
      'toolbar.scenario.ai-unbalanced',
      'toolbar.tour',
      'toolbar.compare',
      'toolbar.pause',
      'toolbar.speed',
      'toolbar.speed.20',
      'toolbar.clear',
      'toolbar.use-case',
      'toolbar.settings',
      'settings.realism',
      'settings.realism.help',
      'settings.model.help',
      'settings.mechanics.help',
      'settings.ai.all',
      'settings.ai.off',
      'settings.ai.eng',
      'settings.ai-quality.same',
      'settings.rework',
      'settings.rework.strength',
      'settings.belt-motion',
      'settings.pile.heap',
      'settings.reset',
      'settings.download',
      'settings.upload',
      'settings.upload.file',
      'settings.close',
      'node.eng',
      'node.eng.sign.rework',
    ];
    // ACT
    const found = new Set(controlsOf(render({ locale: 'en', preset: 'realistic' })).map((c) => c.control));
    // ASSERT
    expect(expected.filter((c) => !found.has(c))).toEqual([]);
  });

  it('writes the Customer and each station read-out as plain values on the card', () => {
    // ARRANGE
    const expected = {
      customer: ['data-readout-output', 'data-readout-satisfied', 'data-readout-headroom', 'data-readout-bugs-week'],
      station: ['data-readout-waiting', 'data-readout-weeks-waiting', 'data-readout-rework'],
    };
    // ACT
    const $ = load(render({ locale: 'en', preset: 'realistic' }));
    const attrs = (control: string) =>
      Object.keys($(`[data-control="${control}"]`).first().attr() ?? {}).filter((a) => a.startsWith('data-readout'));
    // ASSERT
    expect({
      customer: expected.customer.filter((a) => attrs('node.customer').includes(a)),
      station: expected.station.filter((a) => attrs('node.qa').includes(a)),
    }).toEqual(expected);
  });

  it('writes the read-outs rounded: the Customer headroom and bugs a week to one decimal, rework to two', () => {
    // ARRANGE
    const oneDecimal = /^\d+\.\d$/;
    const twoDecimals = /^\d+\.\d\d$/;
    // ACT
    const $ = load(render({ locale: 'en', preset: 'realistic' }));
    const customer = $('[data-control="node.customer"]').first();
    const qa = $('[data-control="node.qa"]').first();
    // ASSERT
    expect(customer.attr('data-readout-headroom')).toMatch(oneDecimal);
    expect(customer.attr('data-readout-bugs-week')).toMatch(oneDecimal);
    expect(qa.attr('data-readout-rework')).toMatch(twoDecimals);
  });

  it('writes the card flags an eval reads: piling and AI on a station', () => {
    // ARRANGE
    const expected = ['data-piling', 'data-ai'];
    // ACT
    const $ = load(render({ locale: 'en', preset: 'realistic' }));
    const attrs = Object.keys($('[data-control="node.qa"]').first().attr() ?? {});
    // ASSERT
    expect(expected.filter((a) => !attrs.includes(a))).toEqual([]);
  });
});

describe('failure cases', () => {
  it('makes the roles state’s cards no buttons and no tab stops, and shows no Quality assurance card there', () => {
    // ARRANGE
    const cards = /<div[^>]*data-card-view="role"[^>]*>/g;
    const tenCards = 10;
    // ACT
    const html = render({ locale: 'en', preset: 'roles' });
    const found = html.match(cards) ?? [];
    // ASSERT
    expect(found.length).toBeGreaterThanOrEqual(tenCards);
    for (const c of found) expect(c).not.toMatch(/role="button"|tabindex/i);
    expect(html).not.toContain('>Quality assurance<');
  });

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

  it('has no two controls with the same data-control on one page', () => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const names = controlsOf(render({ locale: 'en', preset: 'realistic' })).map((c) => c.control);
    const twice = names.filter((n, i) => names.indexOf(n) !== i);
    // ASSERT
    expect(twice).toEqual(expected);
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
