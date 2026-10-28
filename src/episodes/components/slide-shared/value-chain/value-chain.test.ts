import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ValueChain, type ValueChainProps } from './value-chain';

/** A two-stage chain told oldest first, as a Slide's copy hands it over. */
const PROPS: ValueChainProps = {
  name: 'Ada Lovelace',
  role: 'Analyst · Writer',
  portrait: { src: '/images/profile/ada.webp', alt: 'Ada Lovelace' },
  statement: 'I have worked every link.',
  statementAccent: 'Now I enable AI across it.',
  rail: 'Coaching under every stage',
  proofLabel: 'Proof',
  booking: { label: 'Book a call', href: 'https://example.com/book', newTabHint: 'opens in a new tab' },
  stages: [
    {
      slug: 'sales',
      year: '2012',
      label: 'Sales',
      where: 'Infobip',
      proofs: [
        { metric: '50+', text: 'contracts closed' },
        { metric: '30%+', text: 'of global revenue' },
      ],
    },
    {
      slug: 'ai',
      year: '2026',
      label: 'AI enablement',
      where: 'RIB',
      proofs: [
        { metric: '6', text: 'AI workshops in 3 months' },
        { metric: '15–20', text: 'senior engineers upskilled' },
      ],
    },
  ],
};

function render(props: ValueChainProps): string {
  return renderToStaticMarkup(createElement(ValueChain, props));
}

/** The visible text of rendered markup, tags dropped and whitespace collapsed. */
function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** How many `aria-hidden="true"` elements are open after `tag`: entering one starts the count, nesting moves it. */
function hiddenDepthAfter(depth: number, tag: string): number {
  if (tag.endsWith('/>')) return depth;
  const closing = tag.startsWith('</');
  if (depth > 0) return closing ? depth - 1 : depth + 1;
  return !closing && tag.includes('aria-hidden="true"') ? 1 : 0;
}

/** The text a reader is offered: `textOf`, minus every `aria-hidden="true"` subtree (decoration, inactive stages). */
function exposedTextOf(html: string): string {
  let depth = 0;
  let kept = '';
  for (const [token] of html.matchAll(/<[^>]+>|[^<]+/g)) {
    if (token.startsWith('<')) {
      depth = hiddenDepthAfter(depth, token);
      kept += ' ';
    } else if (depth === 0) kept += token;
  }
  return textOf(kept);
}

describe('success cases', () => {
  it('reads the chain from the latest stage down, so the primary stage leads', () => {
    // ARRANGE
    const latestFirst = /2026 → AI enablement RIB .*2012 Sales Infobip/;
    // ACT
    const text = textOf(render(PROPS));
    // ASSERT
    expect(text).toMatch(latestFirst);
  });

  it('shows the latest stage’s two proofs by default and no other stage’s', () => {
    // ARRANGE
    const shown = ['6 AI workshops in 3 months', '15–20 senior engineers upskilled'];
    const hidden = '50+ contracts closed';
    // ACT
    const text = exposedTextOf(render(PROPS));
    // ASSERT
    for (const proof of shown) expect(text).toContain(proof);
    expect(text).not.toContain(hidden);
  });

  it('names who is talking with a portrait, and offers the booking link in a new tab', () => {
    // ARRANGE
    const who = 'Ada Lovelace Analyst · Writer';
    const portrait = 'alt="Ada Lovelace"';
    const booking = 'href="https://example.com/book"';
    const newTab = 'target="_blank"';
    // ACT
    const html = render(PROPS);
    // ASSERT
    expect(textOf(html)).toContain(who);
    expect(html).toContain(portrait);
    expect(html).toContain(booking);
    expect(html).toContain(newTab);
  });
});

describe('failure cases', () => {
  it('refuses a booking link that is not https, so a typo cannot ship a bad href', () => {
    // ARRANGE
    const props: ValueChainProps = { ...PROPS, booking: { ...PROPS.booking, href: 'http://example.com/book' } };
    const refusal = /must start with https/;
    // ACT
    const attempt = () => render(props);
    // ASSERT
    expect(attempt).toThrow(refusal);
  });
});

describe('edge cases', () => {
  it('shows a lone stage’s proofs, the latest and the only one at once', () => {
    // ARRANGE
    const props: ValueChainProps = { ...PROPS, stages: [PROPS.stages[0]] };
    const shown = ['50+ contracts closed', '30%+ of global revenue'];
    // ACT
    const text = exposedTextOf(render(props));
    // ASSERT
    for (const proof of shown) expect(text).toContain(proof);
  });
});
