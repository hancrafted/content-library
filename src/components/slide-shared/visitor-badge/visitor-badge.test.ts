import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { VisitorBadge, type VisitorBadgeProps } from './visitor-badge';

function badge(props: VisitorBadgeProps): string {
  return renderToStaticMarkup(createElement(VisitorBadge, props));
}

/** The visible text of rendered markup, tags dropped and whitespace collapsed. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('success cases', () => {
  it('reads as a badge: job and weekday, the day, then what it was for', () => {
    // ARRANGE
    const expected = 'Job 1 Mon Day 1 Invitations for 200';
    // ACT
    const html = badge({ job: 'Job 1', weekday: 'Mon', day: 'Day 1', task: 'Invitations for 200', ai: true });
    // ASSERT
    expect(textOf(html)).toBe(expected);
  });

  it('lists the facts of the front badge as terms and values', () => {
    // ARRANGE
    const expected = 'Freelancer · AI Wed Day 1 Knows every trade Knows your company nothing';
    // ACT
    const html = badge({
      job: 'Freelancer · AI',
      weekday: 'Wed',
      day: 'Day 1',
      facts: [
        { slug: 'trades', term: 'Knows', value: 'every trade' },
        { slug: 'company', term: 'Knows your company', value: 'nothing' },
      ],
      ai: true,
      focus: true,
    });
    // ASSERT
    expect(textOf(html)).toBe(expected);
    expect(html).toContain('<dt');
    expect(html).toContain('tabindex="0"');
  });
});

describe('failure cases', () => {
  it('keeps a badge that is not the focal one out of the tab order and unraised', () => {
    // ARRANGE
    const focusable = 'tabindex';
    const raised = 'card-hover';
    // ACT
    const html = badge({ job: 'Job 1', weekday: 'Mon', day: 'Day 1', ai: true });
    // ASSERT
    expect(html).not.toContain(focusable);
    expect(html).not.toContain(raised);
  });
});

describe('edge cases', () => {
  it('stays neutral when no AI wears it: no ai ring and no ai edge', () => {
    // ARRANGE
    const aiMark = /\bai\//;
    // ACT
    const html = badge({ job: 'New hire · You', day: 'Day 1', ai: false, compact: true });
    // ASSERT
    expect(html).not.toMatch(aiMark);
  });

  it('draws the lanyard only on a full badge, never on a compact echo', () => {
    // ARRANGE
    const lanyard = '<svg';
    // ACT
    const full = badge({ job: 'Job 2', weekday: 'Tue', day: 'Day 1', ai: true });
    const compact = badge({ job: 'AI', day: 'Day 1', ai: true, compact: true });
    // ASSERT
    expect(full).toContain(lanyard);
    expect(compact).not.toContain(lanyard);
  });
});
