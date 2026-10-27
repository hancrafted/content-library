import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PollJoin } from './poll-join';

const props = {
  label: 'Scan to vote',
  note: 'Create your poll at directpoll.com',
  qrLabel: 'QR code to the vote page',
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
});

describe('failure cases', () => {
  it('shows the note and no QR for a placeholder URL', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/PLACEHOLDER';
    // ACT
    const html = join(url);
    // ASSERT
    expect(html).toContain('Create your poll at directpoll.com');
    expect(html).not.toContain('<svg');
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
