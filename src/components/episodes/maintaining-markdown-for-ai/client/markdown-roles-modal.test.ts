import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MODALS_DATA } from './markdown-roles-data.pure';
import { MarkdownRolesModal } from './markdown-roles-modal.client';

const KEY = Object.keys(MODALS_DATA)[0] as keyof typeof MODALS_DATA;

describe('success cases', () => {
  it('is a native dialog, which showModal() lifts into the top layer above every Slide and the chrome', () => {
    // ARRANGE
    const modal = createElement(MarkdownRolesModal, { modal: KEY, onClose: () => undefined });
    // ACT
    const html = renderToStaticMarkup(modal);
    // ASSERT
    expect(html).toMatch(/^<dialog\b/);
  });
});

describe('failure cases', () => {
  it('takes no z-index, since a Slide wrapper is isolated and would trap one under the chrome (FE-009 section 8)', () => {
    // ARRANGE
    const modal = createElement(MarkdownRolesModal, { modal: KEY, onClose: () => undefined });
    // ACT
    const html = renderToStaticMarkup(modal);
    // ASSERT
    expect(html).not.toMatch(/\bz-(\d|\[)/);
  });
});

describe('edge cases', () => {
  it('renders nothing while no modal is chosen', () => {
    // ARRANGE
    const modal = createElement(MarkdownRolesModal, { modal: null, onClose: () => undefined });
    // ACT
    const html = renderToStaticMarkup(modal);
    // ASSERT
    expect(html).toBe('');
  });
});
