import { describe, expect, it } from 'vitest';
import { exportedPage } from './exported-pages';

const EVENT = '/de/events/2026-10-28-cyberforum-akademie-intro-agentic-workflow';
const INTRO = `${EVENT}/episodes/intro/`;

describe('success cases', () => {
  it('separates leaving the Episode from returning to its top', () => {
    // ARRANGE
    const $ = exportedPage(INTRO);
    const toc = $('[data-testid="toc"]');
    const expectedTitle = 'Generative KI im Arbeitsalltag: agentisch arbeiten';
    const expectedBack = `${EVENT}/`;
    const expectedTop = `${INTRO}#top`;
    // ACT
    const back = toc.find('[data-testid="toc-back"]').attr('href');
    const title = toc.find('[data-testid="toc-top"]');
    // ASSERT
    expect(back).toBe(expectedBack);
    expect(title.text()).toBe(expectedTitle);
    expect(title.attr('href')).toBe(expectedTop);
  });

  it('places navigation commands and one Tree checkbox in the heading menu', () => {
    // ARRANGE
    const $ = exportedPage(INTRO);
    const toc = $('[data-testid="toc"]');
    const expectedCommands = ['Inhalt einklappen', 'Zur Veranstaltung herauszoomen'];
    const expectedCheckbox = 'Als Baum anzeigen';
    const unchecked = 'false';
    // ACT
    const heading = toc.find('[data-toc-context]');
    const commands = heading
      .find('[role="menuitem"]')
      .toArray()
      .map((item) => $(item).text().trim());
    const checkbox = heading.find('[role="group"] [role="menuitemcheckbox"]');
    // ASSERT
    expect(commands).toEqual(expectedCommands);
    expect(checkbox.text().trim()).toBe(expectedCheckbox);
    expect(checkbox.attr('aria-checked')).toBe(unchecked);
  });

  it('exposes normalized reading progress on the ToC border rather than a horizontal bar', () => {
    // ARRANGE
    const $ = exportedPage('/episodes/onboard-ai-every-time/');
    const expectedMaximum = '100';
    const expectedPathLength = '100';
    // ACT
    const border = $('[data-testid="toc"] [data-toc-border]');
    // ASSERT
    expect(border.attr('role')).toBe('progressbar');
    expect(border.attr('aria-valuemax')).toBe(expectedMaximum);
    expect(border.find('path').attr('pathLength')).toBe(expectedPathLength);
    expect($('[data-testid="toc"] [role="progressbar"]')).toHaveLength(1);
  });
});

describe('failure cases', () => {
  it('does not invent a back destination or Event controls for a Template', () => {
    // ARRANGE
    const $ = exportedPage('/episode-templates/workshop-template/');
    // ACT
    const toc = $('[data-testid="toc"]');
    // ASSERT
    expect(toc.find('[data-testid="toc-back"]')).toHaveLength(0);
    expect(toc.find('[role="menuitemcheckbox"]')).toHaveLength(0);
  });
});

describe('edge cases', () => {
  it('leaves the border neutral when the page has no measurable reading time', () => {
    // ARRANGE
    const $ = exportedPage('/episode-templates/workshop-template/');
    // ACT
    const progress = $('[data-testid="toc"] [role="progressbar"]');
    // ASSERT
    expect(progress).toHaveLength(0);
  });
});
