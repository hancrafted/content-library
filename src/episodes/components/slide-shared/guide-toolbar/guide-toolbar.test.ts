import { load } from 'cheerio';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GuideToolbar } from './guide-toolbar';

/*
 * The Guide's one toolbar, as the static export renders it: before the viewer picks, so on the defaults (Mac, Claude
 * Code). Both groups always show, in one fixed order; `active` says which the Slide's content differs by.
 */

const LABELS = { os: 'Your computer', agent: 'AI agent' };

const toolbar = (active: readonly ('os' | 'agent')[]) =>
  load(renderToStaticMarkup(createElement(GuideToolbar, { active, labels: LABELS })));

describe('success cases', () => {
  it('shows the operating system group, then the AI agent group, in one row', () => {
    // ARRANGE
    const expected = [
      { name: 'Your computer', options: ['Mac', 'Windows', 'Linux'] },
      { name: 'AI agent', options: ['Claude Code', 'Antigravity', 'Codex', 'GitHub Copilot'] },
    ];
    // ACT
    const $ = toolbar(['os', 'agent']);
    const groups = $('[role="radiogroup"]')
      .map((_, group) => ({
        name: $(group).attr('aria-label'),
        options: $(group)
          .find('input')
          .map((__, input) => $(input).attr('aria-label'))
          .get(),
      }))
      .get();
    // ASSERT
    expect(groups).toEqual(expected);
  });

  it('checks Mac and Claude Code until the viewer picks', () => {
    // ARRANGE
    const expected = ['Mac', 'Claude Code'];
    // ACT
    const $ = toolbar(['os', 'agent']);
    const checked = $('input:checked')
      .map((_, input) => $(input).attr('aria-label'))
      .get();
    // ASSERT
    expect(checked).toEqual(expected);
  });

  it('draws a mark for each operating system, hidden from assistive tech', () => {
    // ARRANGE
    const expected = [3, 3];
    // ACT
    const $ = toolbar(['os']);
    const marks = [$('[data-pick="os"] label svg').length, $('[data-pick="os"] label svg[aria-hidden="true"]').length];
    // ASSERT
    expect(marks).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('dims the group the Slide does not differ by, keeping it in place and not operable', () => {
    // ARRANGE
    const expected = { os: 'true', agent: 'false', osDisabled: 3, agentDisabled: 0 };
    // ACT
    const $ = toolbar(['agent']);
    const found = {
      os: $('[data-pick="os"]').attr('aria-disabled'),
      agent: $('[data-pick="agent"]').attr('aria-disabled'),
      osDisabled: $('[data-pick="os"] input:disabled').length,
      agentDisabled: $('[data-pick="agent"] input:disabled').length,
    };
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('shows the mark alone on a phone and the name from md up, and the name always for an agent without a mark', () => {
    // ARRANGE
    const expected = { mac: 'hidden md:inline', antigravity: undefined };
    // ACT
    const $ = toolbar(['os', 'agent']);
    const nameClass = (value: string) => $(`input[value="${value}"]`).siblings('span').attr('class');
    const found = { mac: nameClass('mac'), antigravity: nameClass('antigravity') };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('keeps both groups, in the same order, even when no pick is active', () => {
    // ARRANGE
    const expected = ['os', 'agent'];
    // ACT
    const $ = toolbar([]);
    const order = $('[data-pick]')
      .map((_, group) => $(group).attr('data-pick'))
      .get();
    // ASSERT
    expect(order).toEqual(expected);
  });
});
