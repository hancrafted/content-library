import { describe, expect, it } from 'vitest';
import { isPlaceholderPollUrl, qrModules } from './qr-modules.pure';

describe('success cases', () => {
  it('draws a square grid of modules for a URL, one path command per dark module', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/abc123';
    const smallestQr = 21;
    // ACT
    const { size, path } = qrModules(url);
    // ASSERT
    expect(size).toBeGreaterThanOrEqual(smallestQr);
    expect(path.startsWith('M')).toBe(true);
  });

  it('draws the same modules for the same URL', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/abc123';
    // ACT
    const first = qrModules(url);
    const second = qrModules(url);
    // ASSERT
    expect(first).toEqual(second);
  });

  it('reads a real Vote link as no placeholder', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/abc123';
    // ACT
    const placeholder = isPlaceholderPollUrl(url);
    // ASSERT
    expect(placeholder).toBe(false);
  });
});

describe('failure cases', () => {
  it('reads a URL that says PLACEHOLDER as a placeholder', () => {
    // ARRANGE
    const url = 'https://directpoll.com/v/PLACEHOLDER';
    // ACT
    const placeholder = isPlaceholderPollUrl(url);
    // ASSERT
    expect(placeholder).toBe(true);
  });

  it('reads an empty URL as a placeholder', () => {
    // ARRANGE
    const url = '';
    // ACT
    const placeholder = isPlaceholderPollUrl(url);
    // ASSERT
    expect(placeholder).toBe(true);
  });
});

describe('edge cases', () => {
  it('reads a URL of another site as a placeholder, so a QR never points off directpoll', () => {
    // ARRANGE
    const url = 'https://example.com/v/abc123';
    // ACT
    const placeholder = isPlaceholderPollUrl(url);
    // ASSERT
    expect(placeholder).toBe(true);
  });
});
