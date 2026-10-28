import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavLink } from './nav-link.client';

/*
 * NavLink states its own `aria-current` and `data-active` after the props it is handed (#409), so a wrapping menu link
 * that passes its own cannot override them. Every header link goes through it: the Dashboard, Events and Explorables
 * as plain links, Episodes and Resources inside Learn.
 */

const path = vi.hoisted(() => ({ current: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => path.current }));

/** The link as a visitor at `pathname` sees it: its `aria-current` and `data-active`, as markup writes them. */
function stateAt(pathname: string, props: Record<string, unknown> = {}, section = '/events') {
  path.current = pathname;
  const html = renderToStaticMarkup(createElement(NavLink, { section, href: section, ...props }, 'Link'));
  return { current: /aria-current="([^"]*)"/.exec(html)?.[1], active: /data-active="([^"]*)"/.exec(html)?.[1] };
}

beforeEach(() => {
  path.current = '/';
});

describe('success cases', () => {
  it.each([
    ['/events', 'the Events page itself'],
    ['/de/events', 'the Events page in German'],
    ['/events/2026-10-23-axel-agentic-workflow', 'a page inside Events'],
  ])('marks its own link current and active on %s (%s)', (pathname) => {
    // ARRANGE
    const expected = { current: 'page', active: 'true' };
    // ACT
    const state = stateAt(pathname);
    // ASSERT
    expect(state).toEqual(expected);
  });

  it('marks Resources active on a page of a section it also covers, and the Dashboard only on the Dashboard', () => {
    // ARRANGE
    const resources = { alsoIn: ['/episode-templates'] };
    const expected = [
      { current: 'page', active: 'true' },
      { current: undefined, active: 'false' },
      { current: 'page', active: 'true' },
    ];
    // ACT
    const states = [
      stateAt('/episode-templates/grids', resources, '/resources'),
      stateAt('/episodes/ai-attention-span', resources, '/resources'),
      stateAt('/dashboard', {}, '/dashboard'),
    ];
    // ASSERT
    expect(states).toEqual(expected);
  });
});

describe('failure cases', () => {
  it.each([
    ['/episodes', 'a sibling section'],
    ['/eventsx', 'a path that only starts with its name'],
    ['/', 'the home page'],
  ])('leaves its link not current and not active on %s (%s)', (pathname) => {
    // ARRANGE
    const expected = { current: undefined, active: 'false' };
    // ACT
    const state = stateAt(pathname);
    // ASSERT
    expect(state).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('keeps its own state when a wrapping menu link passes a different one down', () => {
    // ARRANGE
    const fromMenu = { 'aria-current': 'page', 'data-active': true };
    const expected = { current: undefined, active: 'false' };
    // ACT
    const state = stateAt('/episodes', fromMenu);
    // ASSERT
    expect(state).toEqual(expected);
  });

  it('keeps its own state when a wrapping menu link passes none down', () => {
    // ARRANGE
    const fromMenu = { 'aria-current': undefined, 'data-active': false };
    const expected = { current: 'page', active: 'true' };
    // ACT
    const state = stateAt('/events', fromMenu);
    // ASSERT
    expect(state).toEqual(expected);
  });
});
