import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RouteChain, type RouteChainProps } from './route-chain';

const WORDS: Pick<RouteChainProps, 'label' | 'pieces' | 'proof'> = {
  label: 'The chain',
  pieces: {
    terminal: { title: 'Your terminal', sub: 'Steps 1–2' },
    agent: { title: 'Your AI agent', sub: 'Steps 3–4' },
    folder: { title: 'Your folder', sub: 'Steps 5–6' },
    skill: { title: 'Your first skill', sub: 'Step 7' },
  },
  proof: { title: 'The proof: the homepage opens', site: 'hancrafted.net', name: 'hancrafted' },
};

function chain(props: Omit<RouteChainProps, keyof typeof WORDS>): string {
  return renderToStaticMarkup(createElement(RouteChain, { ...WORDS, ...props }));
}

/** Each piece's state, in chain order, as `piece:state`. */
function statesOf(html: string): string[] {
  return [...html.matchAll(/data-piece="(\w+)" data-state="(\w+)"/g)].map(([, piece, state]) => `${piece}:${state}`);
}

/** The visible text of rendered markup, tags dropped and whitespace collapsed. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('success cases', () => {
  it('fills the finished pieces, outlines the current one and leaves the rest hairline', () => {
    // ARRANGE
    const expected = ['terminal:done', 'agent:done', 'folder:current', 'skill:rest'];
    // ACT
    const html = chain({ size: 'mini', done: 2, current: 'folder' });
    // ASSERT
    expect(statesOf(html)).toEqual(expected);
  });

  it('reads on the Title slide as the four pieces in order, then the proof', () => {
    // ARRANGE
    const expected =
      'Start here Your terminal Steps 1–2 2 Your AI agent Steps 3–4 3 Your folder Steps 5–6 4 Your first skill Step 7 hancrafted.net hancrafted The proof: the homepage opens';
    // ACT
    const html = chain({ size: 'hero', done: 0, current: 'terminal', start: 'Start here' });
    // ASSERT
    expect(textOf(html)).toBe(expected);
  });

  it('names every piece and the proof to assistive tech on the mini chain, which shows no text', () => {
    // ARRANGE
    const expected = [
      'Your terminal',
      'Your AI agent',
      'Your folder',
      'Your first skill',
      'The proof: the homepage opens',
    ];
    // ACT
    const html = chain({ size: 'mini', done: 0, current: 'terminal' });
    // ASSERT
    expect([...html.matchAll(/aria-label="([^"]+)"/g)].map(([, label]) => label).slice(1)).toEqual(expected);
    expect(textOf(html)).toBe('');
  });
});

describe('failure cases', () => {
  it('fills no piece and outlines none but the current one before anything is finished', () => {
    // ARRANGE
    const expected = ['terminal:current', 'agent:rest', 'folder:rest', 'skill:rest'];
    const filled = /data-state="\w+"[^>]*bg-primary/;
    // ACT
    const html = chain({ size: 'mini', done: 0, current: 'terminal' });
    // ASSERT
    expect(statesOf(html)).toEqual(expected);
    expect(html).not.toMatch(filled);
  });
});

describe('edge cases', () => {
  it('rings the AI agent piece in the ai colour whatever its state, and no other piece', () => {
    // ARRANGE
    const aiRing = /ring-ai\//g;
    // ACT
    const rest = chain({ size: 'mini', done: 0, current: 'terminal' });
    const done = chain({ size: 'mini', done: 3, current: 'skill' });
    // ASSERT
    expect(rest.match(aiRing)).toHaveLength(1);
    expect(done.match(aiRing)).toHaveLength(1);
  });

  it('draws the current piece dashed when it is built by hand', () => {
    // ARRANGE
    const dashedCurrent = /data-piece="folder" data-state="current"[^>]*border-dashed/;
    // ACT
    const byHand = chain({ size: 'mini', done: 2, current: 'folder', byHand: true });
    const ready = chain({ size: 'mini', done: 2, current: 'folder' });
    // ASSERT
    expect(byHand).toMatch(dashedCurrent);
    expect(ready).not.toMatch(dashedCurrent);
  });
});
