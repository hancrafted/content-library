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
    expect(toc.find('[data-testid="toc-back"]').text().trim()).toBe('');
    expect(title.text()).toBe(expectedTitle);
    expect(title.attr('href')).toBe(expectedTop);
  });

  it('keeps zoom beside the menu and exposes one Event Playlist scope checkbox', () => {
    // ARRANGE
    const $ = exportedPage(INTRO);
    const toc = $('[data-testid="toc"]');
    const expectedCommands = ['Inhalt einklappen'];
    const expectedCheckbox = 'Veranstaltungs-Playlist anzeigen';
    const expectedZoom = 'Zur Veranstaltung herauszoomen';
    const unchecked = 'false';
    // ACT
    const heading = toc.find('[data-toc-context]');
    const commands = heading
      .find('[role="menuitem"]')
      .toArray()
      .map((item) => $(item).text().trim());
    const checkbox = heading.find('[role="menuitemcheckbox"]');
    const zoom = heading.find('[data-testid="toc-zoom"]');
    // ASSERT
    expect(commands).toEqual(expectedCommands);
    expect(checkbox.text().trim()).toBe(expectedCheckbox);
    expect(checkbox.attr('aria-checked')).toBe(unchecked);
    expect(heading.find('[role="group"]')).toHaveLength(0);
    expect(heading.find('[role="menuitem"] svg.lucide-panel-left-close')).toHaveLength(1);
    expect(zoom.attr('aria-label')).toBe(expectedZoom);
    expect(zoom.text().trim()).toBe('');
  });

  it('omits remaining-time text and the redundant Event-title link', () => {
    // ARRANGE
    const $ = exportedPage('/episodes/onboard-ai-every-time/');
    const eventPage = exportedPage(INTRO);
    const remainingTime = /min left|noch \d+ Min\./;
    const parent = `${EVENT}/`;
    // ACT
    const text = $('[data-slot="toc"]').text();
    const duplicate = eventPage(`[data-testid="toc"] a[href="${parent}"]`).not('[data-testid="toc-back"]');
    // ASSERT
    expect(text).not.toMatch(remainingTime);
    expect(duplicate).toHaveLength(0);
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
