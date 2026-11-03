import { describe, expect, it } from 'vitest';
import { exportedPage } from './exported-pages';

describe('Intro HITL Workflows', () => {
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
