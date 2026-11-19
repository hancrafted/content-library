import { STANDARD_SECTION_LOOK, STANDARD_TITLE_LOOK } from '@/episodes/components/slide-master/standard-looks';
import { describe, expect, it } from 'vitest';
import { standardTitleLook, withStandardSlideLooks } from './standard-looks.pure';

const section = (id: string, extra: { presentation?: object; withoutSectionSlide?: true } = {}) => ({
  id,
  level: 'h2' as const,
  ...extra,
});
const page = (id: string) => ({ id, level: 'h3' as const });

describe('success cases', () => {
  it('gives every section slide, the first included, the one section look', () => {
    // ARRANGE
    const slides = [section('one'), page('one--a'), section('two'), section('three')];
    const expected = [STANDARD_SECTION_LOOK, undefined, STANDARD_SECTION_LOOK, STANDARD_SECTION_LOOK];
    // ACT
    const looks = withStandardSlideLooks(slides).map((slide) => (slide as { presentation?: unknown }).presentation);
    // ASSERT
    expect(looks).toEqual(expected);
  });

  it('gives an undeclared Title the standard Title look', () => {
    // ARRANGE
    const expected = STANDARD_TITLE_LOOK;
    // ACT
    const look = standardTitleLook(undefined);
    // ASSERT
    expect(look).toBe(expected);
  });

  it('gives the Title no inverse flag and no Surface, no effect and 160px after', () => {
    // ARRANGE
    const expected = { style: { '--slide-space-after': '160px' } };
    // ACT
    const look = STANDARD_TITLE_LOOK;
    // ASSERT
    expect(look).toEqual(expected);
  });

  it('gives the section the inverse flag, the soft mirror surface, liquid enter and leave and 200px around', () => {
    // ARRANGE
    const expected = {
      inverse: true,
      style: {
        '--slide-surface': 'color-mix(in oklab, var(--background) 88%, var(--foreground))',
        '--slide-space-before': '200px',
        '--slide-space-after': '200px',
      },
      enter: { effect: 'liquid' },
      leave: { effect: 'liquid' },
    };
    // ACT
    const look = STANDARD_SECTION_LOOK;
    // ASSERT
    expect(look).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps a declared presentation whole, never merged with the standard look', () => {
    // ARRANGE
    const declared = { enter: { effect: 'bubbles' as const } };
    // ACT
    const [slide] = withStandardSlideLooks([section('one', { presentation: declared })]);
    // ASSERT
    expect(slide.presentation).toBe(declared);
  });

  it('keeps an empty presentation as an opt-out', () => {
    // ARRANGE
    const optOut = {};
    // ACT
    const [slide] = withStandardSlideLooks([section('one', { presentation: optOut })]);
    // ASSERT
    expect(slide.presentation).toBe(optOut);
  });
});

describe('edge cases', () => {
  it('gives the section after a declared first section the section look', () => {
    // ARRANGE
    const slides = [section('one', { presentation: {} }), section('two')];
    // ACT
    const [, second] = withStandardSlideLooks(slides);
    // ASSERT
    expect(second.presentation).toBe(STANDARD_SECTION_LOOK);
  });

  it('skips a section that stands in without a section slide', () => {
    // ARRANGE
    const slides = [section('one', { withoutSectionSlide: true }), section('two')];
    // ACT
    const [first, second] = withStandardSlideLooks(slides);
    // ASSERT
    expect([first.presentation, second.presentation]).toEqual([undefined, STANDARD_SECTION_LOOK]);
  });

  it('keeps a declared Title presentation whole', () => {
    // ARRANGE
    const declared = { inverse: true };
    // ACT
    const look = standardTitleLook(declared);
    // ASSERT
    expect(look).toBe(declared);
  });
});
