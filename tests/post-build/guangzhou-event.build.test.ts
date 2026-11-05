import { describe, expect, it } from 'vitest';
import { LOCALES, localizePath } from '../../src/shared/lib/locale.pure';
import { exportedPage } from './exported-pages';

describe('Intro Human in the Loop Workflow', () => {
  it.each(LOCALES)('shows the new Event and intro Slide title in %s', (locale) => {
    // ARRANGE
    const base = '/events/2026-11-04-intro-hitl-workflows';
    const expected = 'Intro Human in the Loop Workflow';
    // ACT
    const event = exportedPage(localizePath(base, locale));
    const episode = exportedPage(localizePath(`${base}/episodes/intro`, locale));
    // ASSERT
    expect(event('h1').text()).toBe(expected);
    expect(episode('h1 .sr-only').text()).toBe(expected);
  });

  it('shows the selected poll questions without another Event’s results', () => {
    // ARRANGE
    const url = '/events/2026-11-04-intro-hitl-workflows/episodes/intro';
    const included = ['What is AI most like for you?', 'Has your picture of AI changed today?'];
    const excluded = ['What do you have a say in when it comes to AI?', 'And now: what is AI most like for you?'];
    // ACT
    const page = exportedPage(url);
    const text = page('body').text();
    const printedVotes = page('[data-poll-votes]').length;
    // ASSERT
    for (const question of included) expect(text).toContain(question);
    for (const question of excluded) expect(text).not.toContain(question);
    expect(printedVotes).toBe(0);
  });
});
