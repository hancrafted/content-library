import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PollJoin } from './poll-join';

const props = {
  label: 'Scan to vote',
  note: 'Create your poll at directpoll.com',
  qrLabel: 'QR code to the vote page',
  openLabel: 'Vote in the browser',
  newTab: 'opens in a new tab',
};

function join(voteUrl: string): string {
  return renderToStaticMarkup(createElement(PollJoin, { voteUrl, ...props }));
}

describe('success cases', () => {
  it('renders the QR as an inline SVG with an accessible name', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/abc123';
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('<svg');
    expect(html).toContain('aria-label="QR code to the vote page"');
  });

  it('shows the short link as text beside the QR', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/abc123';
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('directpoll.com/v/abc123');
  });

  it('links the Vote page in a new tab, for people on a laptop, and says so', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v?XEM9-token';
    const expected = `href="${url}" target="_blank" rel="noopener noreferrer"`;
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain(expected);
    expect(html).toContain(props.openLabel);
    expect(html).toContain(props.newTab);
  });
});

describe('failure cases', () => {
  it('prints no short link as text when the Vote link is too long to type', () => {
    // ARRANGE
    const token = 'XEM9-nVikRs30Eoq4EuHs0V9UlTWbLs-Hfziio-v3jtQiPQJYBmxzzz';
    const url = `https://directpoll.com/v?${token}`;
    const printed = `>directpoll.com/v?${token}<`;
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('<svg');
    expect(html).not.toContain(printed);
  });

  it('shows the note and no QR for a placeholder URL', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/PLACEHOLDER';
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('Create your poll at directpoll.com');
    expect(html).not.toContain('<svg');
    expect(html).not.toContain('href=');
  });
});

describe('edge cases', () => {
  it('shows the note for an empty URL, never a code of nothing', () => {
    // ARRANGE
    const url = '';
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('Create your poll at directpoll.com');
  });
});
