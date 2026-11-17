import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { select } from './art-dom.pure.ts';

describe('success cases', () => {
  it('matches the elements a readable selector names', () => {
    // ARRANGE
    const $ = cheerio.load('<svg><g class="lit"></g><g class="dim"></g></svg>');
    // ACT
    const matched = select($, '.lit');
    // ASSERT
    expect(matched.size).toBe(1);
  });
});

describe('edge cases', () => {
  it('matches without a pseudo-element the matcher cannot read, instead of throwing', () => {
    // ARRANGE
    const $ = cheerio.load('<svg><g class="lit"></g><g class="dim"></g></svg>');
    // ACT
    const matched = select($, '.lit::before');
    // ASSERT
    expect(matched.size).toBe(1);
  });
});

describe('failure cases', () => {
  it('matches nothing for a selector it cannot read even without its pseudo-class', () => {
    // ARRANGE
    const $ = cheerio.load('<svg><g class="lit"></g></svg>');
    // ACT
    const matched = select($, '<<');
    // ASSERT
    expect(matched.size).toBe(0);
  });
});
